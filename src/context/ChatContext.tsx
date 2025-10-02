'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'

// === TIPOS ULTRA SIMPLIFICADOS ===

export type ChatGroup = {
	id: string
	name: string
	description: string | null
	icon: string
	color: string
	active: boolean
	unreadCount: number
	lastMessage: string | null
	lastMessageAt: Date | null
}

export type ChatUser = {
	id: string
	name: string
	email: string
	isActive: boolean
	presenceStatus: 'visible' | 'invisible'
	lastActivity: Date | null
	unreadCount: number
	lastMessage: string | null
	lastMessageAt: Date | null
}

export type ChatMessage = {
	id: string
	content: string
	senderUserId: string
	senderName: string
	receiverGroupId: string | null
	receiverUserId: string | null
	createdAt: Date
	readAt: Date | null
	deletedAt: Date | null
	messageType: 'groupMessage' | 'userMessage'
}

export type PresenceStatus = 'visible' | 'invisible'

type ChatContextType = {
	// Estados principais
	groups: ChatGroup[]
	users: ChatUser[]
	messages: Record<string, ChatMessage[]> // Key: groupId ou userId
	totalUnread: number
	currentPresence: PresenceStatus
	isLoading: boolean
	lastSync: string | null

	// Funções principais
	loadSidebarData: () => Promise<void>
	loadMessages: (targetId: string, type: 'group' | 'user') => Promise<void>
	loadOlderMessages: (targetId: string, type: 'group' | 'user', page: number) => Promise<{ messages: ChatMessage[]; hasMore: boolean }>
	sendMessage: (content: string, receiverGroupId?: string, receiverUserId?: string) => Promise<void>
	markMessageAsRead: (messageId: string) => Promise<void>
	markMessagesAsRead: (targetId: string, type: 'group' | 'user') => Promise<void>
	deleteMessage: (messageId: string) => Promise<void>

	// Sistema de presença
	updatePresence: (status: PresenceStatus) => Promise<void>
	sendHeartbeat: () => Promise<void>

	// Controles
	startPolling: () => void
	stopPolling: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const { currentUser } = useCurrentUser()

	// Estados principais
	const [groups, setGroups] = useState<ChatGroup[]>([])
	const [users, setUsers] = useState<ChatUser[]>([])
	const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({})
	const [totalUnread, setTotalUnread] = useState(0)
	const [currentPresence, setCurrentPresence] = useState<PresenceStatus>('invisible')
	const [isLoading, setIsLoading] = useState(true)
	const [lastSync, setLastSync] = useState<string | null>(null)
	const [chatEnabled, setChatEnabled] = useState(true)

	// Controles de polling
	const pollingInterval = useRef<NodeJS.Timeout | null>(null)
	const isPollingActive = useRef(false)

	// === FUNÇÕES PRINCIPAIS ===

	const loadSidebarData = useCallback(async () => {
		try {
			setIsLoading(true)
			console.log('🔵 [ChatContext] Carregando dados da sidebar...')
			const response = await fetch('/api/admin/chat/sidebar')

			if (response.ok) {
				const data = await response.json()
				console.log('✅ [ChatContext] Dados da sidebar carregados:', {
					groups: data.groups?.length || 0,
					users: data.users?.length || 0,
					totalUnread: data.totalUnread || 0,
				})

				setGroups(data.groups || [])
				setUsers(data.users || [])
				setTotalUnread(data.totalUnread || 0)
			} else {
				console.error('❌ [ChatContext] Erro ao carregar sidebar:', response.status)
			}
		} catch (error) {
			console.error('❌ [ChatContext] Erro na requisição sidebar:', error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	const loadMessages = useCallback(async (targetId: string, type: 'group' | 'user') => {
		try {
			const params = new URLSearchParams({ limit: '30' }) // Reduzido para 30 mensagens iniciais
			if (type === 'group') {
				params.set('groupId', targetId)
			} else {
				params.set('userId', targetId)
			}

			console.log('🔵 [ChatContext] Carregando mensagens iniciais:', { targetId, type })
			const response = await fetch(`/api/admin/chat/messages?${params}`)

			if (response.ok) {
				const data = await response.json()
				console.log('✅ [ChatContext] Mensagens iniciais carregadas:', {
					count: data.messages?.length || 0,
					type,
				})

				// Verificar duplicatas e ordenar por data
				const newMessages = data.messages || []
				const uniqueMessages = newMessages.filter((msg: ChatMessage, index: number, self: ChatMessage[]) => index === self.findIndex((m: ChatMessage) => m.id === msg.id))

				setMessages((prev) => ({
					...prev,
					[targetId]: uniqueMessages,
				}))
			} else {
				console.error('❌ [ChatContext] Erro ao carregar mensagens:', response.status)
			}
		} catch (error) {
			console.error('❌ [ChatContext] Erro na requisição mensagens:', error)
		}
	}, [])

	const loadOlderMessages = useCallback(async (targetId: string, type: 'group' | 'user', page: number) => {
		try {
			const params = new URLSearchParams({
				limit: '30',
				page: page.toString(),
				order: 'desc', // Para pegar mensagens mais antigas
			})
			if (type === 'group') {
				params.set('groupId', targetId)
			} else {
				params.set('userId', targetId)
			}

			console.log('🔵 [ChatContext] Carregando mensagens mais antigas:', { targetId, type, page })
			const response = await fetch(`/api/admin/chat/messages?${params}`)

			if (response.ok) {
				const data = await response.json()
				const newMessages = data.messages || []
				const hasMore = newMessages.length === 30 // Se trouxe 30, provavelmente tem mais

				console.log('✅ [ChatContext] Mensagens antigas carregadas:', {
					count: newMessages.length,
					hasMore,
					type,
					page,
				})

				// Adicionar mensagens antigas no início da lista (preservando ordem cronológica)
				setMessages((prev) => {
					const existingMessages = prev[targetId] || []
					const uniqueNewMessages = newMessages.filter((newMsg: ChatMessage) => !existingMessages.some((existingMsg) => existingMsg.id === newMsg.id))

					return {
						...prev,
						[targetId]: [...uniqueNewMessages, ...existingMessages],
					}
				})

				return { messages: newMessages, hasMore }
			} else {
				console.error('❌ [ChatContext] Erro ao carregar mensagens antigas:', response.status)
				return { messages: [], hasMore: false }
			}
		} catch (error) {
			console.error('❌ [ChatContext] Erro na requisição mensagens antigas:', error)
			return { messages: [], hasMore: false }
		}
	}, [])

	const sendMessage = useCallback(
		async (content: string, receiverGroupId?: string, receiverUserId?: string) => {
			try {
				console.log('🔵 [ChatContext] Enviando mensagem:', {
					content: content.substring(0, 50) + '...',
					receiverGroupId,
					receiverUserId,
				})

				const response = await fetch('/api/admin/chat/messages', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						content,
						receiverGroupId,
						receiverUserId,
					}),
				})

				if (response.ok) {
					const newMessage = await response.json()
					console.log('✅ [ChatContext] Mensagem enviada:', newMessage.id)

					// Atualizar estado local imediatamente (optimistic update)
					const targetId = receiverGroupId || receiverUserId
					if (targetId) {
						setMessages((prev) => {
							const existingMessages = prev[targetId] || []
							// Verificar se a mensagem já existe para evitar duplicatas
							const messageExists = existingMessages.some((msg) => msg.id === newMessage.id)

							if (!messageExists) {
								return {
									...prev,
									[targetId]: [...existingMessages, newMessage],
								}
							}
							return prev
						})
					}

					// Atualizar contadores localmente ao invés de recarregar toda sidebar
					// (evita perda de focus no input do chat)
					console.log('🔵 [ChatContext] Atualizando contadores localmente após envio')
				} else {
					const errorData = await response.json()
					console.error('❌ [ChatContext] Erro ao enviar mensagem:', errorData.error)
				}
			} catch (error) {
				console.error('❌ [ChatContext] Erro na requisição enviar mensagem:', error)
			}
		},
		[], // Removida dependência loadSidebarData para evitar re-renderizações
	)

	const markMessageAsRead = useCallback(
		async (messageId: string) => {
			try {
				console.log('🔵 [ChatContext] Marcando mensagem como lida:', messageId)

				const response = await fetch(`/api/admin/chat/messages/${messageId}/read`, {
					method: 'POST',
				})

				if (response.ok) {
					console.log('✅ [ChatContext] Mensagem marcada como lida')

					// Atualizar estado local
					setMessages((prev) => {
						const updated = { ...prev }
						Object.keys(updated).forEach((targetId) => {
							updated[targetId] = updated[targetId].map((msg) => (msg.id === messageId ? { ...msg, readAt: new Date() } : msg))
						})
						return updated
					})

					// Recarregar sidebar para atualizar contadores
					loadSidebarData()
					
					// Disparar evento para atualizar dropdown de notificações
					window.dispatchEvent(new CustomEvent('messagesRead'))
				} else {
					const errorData = await response.json()
					console.error('❌ [ChatContext] Erro ao marcar como lida:', errorData.error)
				}
			} catch (error) {
				console.error('❌ [ChatContext] Erro na requisição marcar como lida:', error)
			}
		},
		[loadSidebarData],
	)

	const deleteMessage = useCallback(async (messageId: string) => {
		try {
			console.log('🔵 [ChatContext] Excluindo mensagem:', messageId)

			const response = await fetch(`/api/admin/chat/messages/${messageId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				console.log('✅ [ChatContext] Mensagem excluída')

				// Remover do estado local
				setMessages((prev) => {
					const updated = { ...prev }
					Object.keys(updated).forEach((targetId) => {
						updated[targetId] = updated[targetId].filter((msg) => msg.id !== messageId)
					})
					return updated
				})
			} else {
				const errorData = await response.json()
				console.error('❌ [ChatContext] Erro ao excluir mensagem:', errorData.error)
			}
		} catch (error) {
			console.error('❌ [ChatContext] Erro na requisição excluir mensagem:', error)
		}
	}, [])

	// Marcar todas as mensagens de uma conversa como lidas
	const markMessagesAsRead = useCallback(async (targetId: string, type: 'group' | 'user') => {
		try {
			const response = await fetch('/api/admin/chat/messages/read', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetId, type }),
			})

			if (response.ok) {
				const data = await response.json()
				console.log('✅ [ChatContext] Mensagens marcadas como lidas:', data.updatedCount)

				// Atualizar estado local - marcar mensagens como lidas
				setMessages((prev) => {
					const updated = { ...prev }
					const targetMessages = updated[targetId] || []
					
					updated[targetId] = targetMessages.map((msg) => {
						// Marcar como lida apenas mensagens de outros usuários que não estão lidas
						if (!msg.readAt && msg.senderUserId !== currentUser?.id) {
							return { ...msg, readAt: new Date() }
						}
						return msg
					})
					
					return updated
				})

				// Atualizar contadores da sidebar dinamicamente
				if (type === 'user') {
					// Para usuários, reduzir contagem do sender
					const targetUser = users.find(u => u.id === targetId)
					const unreadToSubtract = targetUser?.unreadCount || 0
					
					setUsers((prev) => prev.map((user) => {
						if (user.id === targetId) {
							return { ...user, unreadCount: 0 }
						}
						return user
					}))
					
					// Atualizar totalUnread
					setTotalUnread((prev) => prev - unreadToSubtract)
					
					console.log('🔵 [ChatContext] Contador de usuário atualizado:', {
						userId: targetId,
						subtracted: unreadToSubtract,
						newTotal: totalUnread - unreadToSubtract
					})
				} else if (type === 'group') {
					// Para grupos, reduzir contagem do grupo
					const targetGroup = groups.find(g => g.id === targetId)
					const unreadToSubtract = targetGroup?.unreadCount || 0
					
					setGroups((prev) => prev.map((group) => {
						if (group.id === targetId) {
							return { ...group, unreadCount: 0 }
						}
						return group
					}))
					
					// Atualizar totalUnread
					setTotalUnread((prev) => prev - unreadToSubtract)
					
					console.log('🔵 [ChatContext] Contador de grupo atualizado:', {
						groupId: targetId,
						subtracted: unreadToSubtract,
						newTotal: totalUnread - unreadToSubtract
					})
				}

				// Recarregar dados da sidebar para sincronizar
				await loadSidebarData()
				
				// Disparar evento para atualizar dropdown de notificações
				window.dispatchEvent(new CustomEvent('messagesRead'))
			} else {
				const errorData = await response.json()
				console.error('❌ [ChatContext] Erro ao marcar mensagens como lidas:', errorData.error)
			}
		} catch (error) {
			console.error('❌ [ChatContext] Erro na requisição marcar como lidas:', error)
		}
	}, [currentUser?.id, loadSidebarData, users, groups, totalUnread])

	// === SISTEMA DE PRESENÇA ===

	const updatePresence = useCallback(async (status: PresenceStatus) => {
		try {
			const response = await fetch('/api/admin/chat/presence', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status }),
			})

			if (response.ok) {
				console.log('✅ [ChatContext] Presença atualizada:', status)
				setCurrentPresence(status)
				console.log('🔵 [ChatContext] currentPresence definido para:', status)
			} else {
				const errorData = await response.json()
				console.error('❌ [ChatContext] Erro ao atualizar presença:', errorData.error)
			}
		} catch (error) {
			console.error('❌ [ChatContext] Erro na requisição presença:', error)
		}
	}, [])

	const sendHeartbeat = useCallback(async () => {
		try {
			await fetch('/api/admin/chat/presence', {
				method: 'PATCH',
			})
		} catch (error) {
			console.error('❌ [ChatContext] Erro no heartbeat:', error)
		}
	}, [])

	// === POLLING INTELIGENTE ===

	const syncMessages = useCallback(async () => {
		try {
			const params = new URLSearchParams()
			// Usar ref para lastSync para evitar re-criação desnecessária do useCallback
			if (lastSync) {
				params.set('since', lastSync)
			} else {
				// Primeira execução - buscar apenas últimos 5 minutos para evitar "falsas mensagens novas"
				const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
				params.set('since', fiveMinutesAgo)
			}

			const response = await fetch(`/api/admin/chat/sync?${params}`)

			if (response.ok) {
				const data = await response.json()

				if (data.hasUpdates) {
					console.log('✅ [ChatContext] Mensagens novas encontradas:', {
						newMessages: data.messages?.length || 0,
						presenceUpdates: data.presence?.length || 0,
					})

					// Atualizar mensagens (evitar duplicatas) e contar REAL mensagens novas
					let reallyNewMessagesCount = 0
					if (data.messages && data.messages.length > 0) {
						setMessages((prev) => {
							const updated = { ...prev }
							data.messages.forEach((msg: ChatMessage) => {
								const targetId = msg.receiverGroupId || msg.receiverUserId
								if (targetId) {
									const existingMessages = updated[targetId] || []
									// Verificar se a mensagem já existe para evitar duplicatas
									const existingMsgIndex = existingMessages.findIndex((existingMsg) => existingMsg.id === msg.id)

									if (existingMsgIndex === -1) {
										// Mensagem nova - adicionar
										updated[targetId] = [...existingMessages, msg]
										reallyNewMessagesCount++
									} else {
										// Mensagem existente - atualizar apenas campos que podem mudar (como readAt)
										const existingMsg = existingMessages[existingMsgIndex]
										if (existingMsg.readAt !== msg.readAt) {
											updated[targetId] = existingMessages.map((m, index) => 
												index === existingMsgIndex ? { ...m, readAt: msg.readAt } : m
											)
											console.log('🔵 [ChatContext] Atualizando readAt da mensagem:', msg.id, 'para:', msg.readAt)
										}
									}
								}
							})
							return updated
						})
					}

					// Atualizar contadores
					if (data.unreadCounts) {
						const userCounts = data.unreadCounts.users as Record<string, number | null>
						const groupCounts = data.unreadCounts.groups as Record<string, number | null>
						
						// Somar contagens de usuários e grupos
						const userTotal = Object.values(userCounts).reduce((sum, count) => (sum || 0) + (count || 0), 0) as number
						const groupTotal = Object.values(groupCounts).reduce((sum, count) => (sum || 0) + (count || 0), 0) as number
						const newTotalUnread = userTotal + groupTotal
						
						setTotalUnread(newTotalUnread)
						console.log('🔵 [ChatContext] Contadores atualizados:', {
							users: userTotal,
							groups: groupTotal,
							total: newTotalUnread
						})
					}

					// Recarregar sidebar APENAS se há mensagens REALMENTE novas
					if (reallyNewMessagesCount > 0) {
						console.log('🔵 [ChatContext] Recarregando sidebar devido a mensagens REALMENTE novas:', reallyNewMessagesCount)
						loadSidebarData()
					} else if (data.messages && data.messages.length > 0) {
						console.log('🟡 [ChatContext] Mensagens já existentes - sem recarregamento:', data.messages.length)
					}
				}
				// Logs de presença silenciados para reduzir poluição - mudanças são tratadas internamente

				// Atualizar timestamp SEMPRE (mesmo sem atualizações) para evitar consultar as mesmas mudanças
				setLastSync(data.timestamp)
			}
		} catch (error) {
			console.error('❌ [ChatContext] Erro na sincronização:', error)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Intencionalmente sem dependências para evitar loop infinito

	const startPolling = useCallback(() => {
		if (isPollingActive.current) {
			console.log('🟡 [ChatContext] Polling já ativo - ignorando solicitação')
			return
		}

		console.log('🔵 [ChatContext] Iniciando polling (10 segundos)')
		isPollingActive.current = true

		pollingInterval.current = setInterval(() => {
			syncMessages()
			sendHeartbeat()
		}, 10000) // 10 segundos para reduzir carga no servidor
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Intencionalmente sem dependências para evitar loop infinito

	const stopPolling = useCallback(() => {
		if (!isPollingActive.current) {
			console.log('🟡 [ChatContext] Polling já parado - ignorando solicitação')
			return
		}

		console.log('🔵 [ChatContext] Parando polling')
		isPollingActive.current = false

		if (pollingInterval.current) {
			clearInterval(pollingInterval.current)
			pollingInterval.current = null
		}
	}, [])

	// Função para inicializar presença preservando status existente
	const initializePresence = useCallback(async () => {
		try {
			// Buscar status atual do usuário
			const response = await fetch('/api/admin/chat/presence')
			if (response.ok) {
				const data = await response.json()
				console.log('🔵 [ChatContext] Dados da API de presença:', {
					currentUserPresence: data.currentUserPresence,
					currentPresence: currentPresence
				})
				
				// Usar novo campo currentUserPresence da API
				if (!data.currentUserPresence && currentUser) {
					console.log('🔵 [ChatContext] Primeira vez - definindo como visível')
					setCurrentPresence('visible')
					// Fazer a chamada da API para salvar o status
					await fetch('/api/admin/chat/presence', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status: 'visible' }),
					})
				} else if (data.currentUserPresence) {
					console.log('🔵 [ChatContext] Preservando status existente:', data.currentUserPresence.status)
					setCurrentPresence(data.currentUserPresence.status)
				}
			} else {
				// Se não conseguir buscar, apenas fazer heartbeat sem mudar status
				console.log('🔵 [ChatContext] Apenas heartbeat - mantendo status atual')
			}
		} catch (error) {
			console.error('❌ [ChatContext] Erro ao verificar presença existente:', error)
		}
	}, [currentUser, currentPresence]) // Adicionado currentPresence para sincronização

	// === INICIALIZAÇÃO ===

	// Verificar preferências do chat
	useEffect(() => {
		const checkChatPreference = async () => {
			try {
				console.log('🔵 [ChatContext] Verificando preferências do chat...')
				const response = await fetch('/api/user-preferences')
				if (response.ok) {
					const data = await response.json()
					const enabled = data.userPreferences?.chatEnabled !== false
					setChatEnabled(enabled)
					console.log('🔵 [ChatContext] Preferência de chat:', enabled ? 'HABILITADO' : 'DESABILITADO', {
						rawData: data.userPreferences,
						chatEnabled: data.userPreferences?.chatEnabled
					})
				} else {
					console.error('❌ [ChatContext] Erro na resposta da API de preferências:', response.status)
					setChatEnabled(true) // Default para habilitado em caso de erro
				}
			} catch (error) {
				console.error('❌ [ChatContext] Erro ao verificar preferências do chat:', error)
				setChatEnabled(true) // Default para habilitado em caso de erro
			}
		}

		checkChatPreference()

		// Listener para mudanças de preferência
		const handleChatPreferenceChange = (event: CustomEvent) => {
			const { chatEnabled: newChatEnabled } = event.detail
			setChatEnabled(newChatEnabled)
			console.log('🔵 [ChatContext] Preferência de chat alterada:', newChatEnabled ? 'HABILITADO' : 'DESABILITADO')
		}

		window.addEventListener('chatPreferenceChanged', handleChatPreferenceChange as EventListener)

		return () => {
			window.removeEventListener('chatPreferenceChanged', handleChatPreferenceChange as EventListener)
		}
	}, [])

	useEffect(() => {
		console.log('🔵 [ChatContext] useEffect executado:', {
			currentUser: currentUser ? `${currentUser.name} (${currentUser.id})` : 'null',
			chatEnabled,
			loading: currentUser === null ? 'loading' : 'loaded'
		})
		
		if (currentUser && chatEnabled) {
			console.log('🔵 [ChatContext] Usuário logado e chat habilitado, inicializando chat...')
			initializePresence()
			loadSidebarData()
			// Definir timestamp antes de iniciar polling para primeira execução limpa
			setLastSync(new Date().toISOString())
			// Aguardar um momento antes de iniciar polling para dar tempo de definir o lastSync
			setTimeout(() => {
				startPolling()
			}, 500)
		} else {
			console.log('🔵 [ChatContext] Chat desabilitado ou usuário deslogado, parando polling...', {
				currentUser: currentUser ? 'present' : 'null',
				chatEnabled
			})
			stopPolling()
			setCurrentPresence('invisible')
		}

		return () => {
			stopPolling()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUser, chatEnabled]) // Intencionalmente apenas [currentUser, chatEnabled] para evitar loop infinito

	// Cleanup ao desmontar
	useEffect(() => {
		return () => {
			stopPolling()
		}
	}, [stopPolling])

	// Recarregar dados da sidebar quando totalUnread mudar significativamente
	// Removido para evitar recarregamentos desnecessários - o polling já atualiza os dados
	// useEffect(() => {
	// 	if (totalUnread > 0) {
	// 		console.log('🔵 [ChatContext] totalUnread mudou para:', totalUnread, '- recarregando sidebar')
	// 		loadSidebarData()
	// 	}
	// }, [totalUnread])

	const value: ChatContextType = {
		groups,
		users,
		messages,
		totalUnread,
		currentPresence,
		isLoading,
		lastSync,
		loadSidebarData,
		loadMessages,
		loadOlderMessages,
		sendMessage,
		markMessageAsRead,
		markMessagesAsRead,
		deleteMessage,
		updatePresence,
		sendHeartbeat,
		startPolling,
		stopPolling,
	}

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
	const context = useContext(ChatContext)
	if (context === undefined) {
		throw new Error('useChat must be used within a ChatProvider')
	}
	return context
}
