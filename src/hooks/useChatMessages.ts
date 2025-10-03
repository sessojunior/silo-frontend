import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useChat, MESSAGES_PER_PAGE } from '@/context/ChatContext'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import type { ChatMessage } from '@/context/ChatContext'

interface UseChatMessagesProps {
	activeTargetId: string | null
	activeTargetType: 'group' | 'user' | null
}

export function useChatMessages({ activeTargetId, activeTargetType }: UseChatMessagesProps) {
	const { messages, loadMessages, getMessagesCount, getUnreadMessages, loadMessagesBeforeUnread, loadMessagesAfterUnread, markMessagesAsRead, setMessages } = useChat()
	const { currentUser, loading: userLoading } = useCurrentUser()

	// Estados de carregamento
	const [isLoading, setIsLoading] = useState(false)
	const [isLoadingOlder, setIsLoadingOlder] = useState(false)
	const [isLoadingNewer, setIsLoadingNewer] = useState(false)
	
	// Estados de paginação
	const [hasMoreOlderMessages, setHasMoreOlderMessages] = useState(false)
	const [hasMoreNewerMessages, setHasMoreNewerMessages] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [totalMessagesCount, setTotalMessagesCount] = useState(0)
	
	// Referências
	const lastTargetRef = useRef<string | null>(null)

	// Mensagens do target ativo (garantir ordem cronológica)
	const targetMessages = useMemo(() => {
		if (!activeTargetId) {
			console.log('🔵 [useChatMessages] Sem activeTargetId, retornando array vazio')
			return []
		}
		const msgs = messages[activeTargetId] || []
		console.log('🔵 [useChatMessages] Mensagens encontradas para target:', {
			activeTargetId,
			activeTargetType,
			messagesCount: msgs.length,
			allMessagesKeys: Object.keys(messages)
		})
		// Garantir ordenação cronológica (mais antiga primeiro)
		return msgs.sort((a: ChatMessage, b: ChatMessage) => 
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		)
	}, [messages, activeTargetId, activeTargetType])

	// Calcular mensagens restantes
	const olderMessagesRemaining = Math.max(0, totalMessagesCount - targetMessages.length)
	const newerMessagesRemaining = 0 // Por enquanto sempre 0, pois carregamos mensagens não lidas primeiro
	
	// Debug para verificar cálculo de hasMore
	if (process.env.NODE_ENV === 'development') {
		console.log('🔵 [useChatMessages] Debug hasMore:', {
			targetMessages: targetMessages.length,
			totalMessagesCount,
			hasMoreOlderMessages,
			olderMessagesRemaining,
			calculation: `${targetMessages.length} < ${totalMessagesCount} = ${targetMessages.length < totalMessagesCount}`
		})
	}

	// Carregar mensagens quando trocar de conversa
	useEffect(() => {
		if (activeTargetId && activeTargetType && activeTargetId !== lastTargetRef.current) {
			console.log('🔵 [useChatMessages] Mudando para target:', {
				id: activeTargetId,
				type: activeTargetType,
			})

			// Resetar estados de paginação
			setCurrentPage(1)
			setHasMoreOlderMessages(true)
			setHasMoreNewerMessages(true)
			setIsLoadingOlder(false)
			setIsLoadingNewer(false)
			lastTargetRef.current = activeTargetId

			// Carregamento inicial centrado nas mensagens não lidas
			setIsLoading(true)
			const loadInitialMessages = async () => {
				try {
					console.log('🔵 [useChatMessages] Carregando mensagens iniciais centradas nas não lidas...')

					// 1. Buscar mensagens não lidas
					const unreadMessages = await getUnreadMessages(activeTargetId, activeTargetType, MESSAGES_PER_PAGE)
					console.log('🔵 [useChatMessages] Mensagens não lidas encontradas:', {
						count: unreadMessages.length,
						targetId: activeTargetId,
						targetType: activeTargetType,
						messages: unreadMessages.map(m => ({ id: m.id, content: m.content.substring(0, 50) + '...', senderName: m.senderName }))
					})

					// 2. Se não há mensagens não lidas, carregar mensagens recentes normalmente
					if (unreadMessages.length === 0) {
						console.log('🔵 [useChatMessages] Nenhuma mensagem não lida, carregando mensagens recentes...', {
							targetId: activeTargetId,
							targetType: activeTargetType
						})
						const result = await loadMessages(activeTargetId, activeTargetType)
						
						// Calcular hasMore baseado no total real de mensagens
						const loadedMessages = result.messages.length
						console.log('🔵 [useChatMessages] Resultado do loadMessages:', {
							loadedMessages,
							hasMore: result.hasMore,
							targetId: activeTargetId,
							targetType: activeTargetType
						})
						
						const totalCount = await getMessagesCount(activeTargetId, activeTargetType)
						console.log('🔵 [useChatMessages] Total de mensagens no grupo:', {
							totalCount,
							targetId: activeTargetId,
							targetType: activeTargetType
						})
						
						const hasMoreOlderBasedOnTotal = loadedMessages < totalCount
						
						setHasMoreOlderMessages(hasMoreOlderBasedOnTotal)
						setHasMoreNewerMessages(false) // Mensagens recentes não têm mensagens posteriores
						setTotalMessagesCount(totalCount)
						
						console.log('✅ [useChatMessages] Carregamento inicial (mensagens recentes):', {
							loadedMessages,
							totalCount,
							hasMoreOlder: hasMoreOlderBasedOnTotal,
							calculation: `${loadedMessages} < ${totalCount} = ${hasMoreOlderBasedOnTotal}`
						})
					} else {
						// 3. Há mensagens não lidas - armazenar no estado e definir como mensagens iniciais
						console.log('🔵 [useChatMessages] Armazenando mensagens não lidas no estado:', {
							targetId: activeTargetId,
							targetType: activeTargetType,
							unreadCount: unreadMessages.length
						})
						
						// Armazenar mensagens não lidas no estado do ChatContext
						setMessages(prev => ({
							...prev,
							[activeTargetId]: unreadMessages
						}))
						
						const totalCount = await getMessagesCount(activeTargetId, activeTargetType)
						const hasMoreOlderBasedOnTotal = unreadMessages.length < totalCount
						
						setHasMoreOlderMessages(hasMoreOlderBasedOnTotal)
						setHasMoreNewerMessages(false) // Por enquanto, assumir que não há mensagens posteriores às não lidas
						setTotalMessagesCount(totalCount)
						
						console.log('✅ [useChatMessages] Carregamento inicial centrado nas não lidas:', {
							unreadCount: unreadMessages.length,
							totalCount,
							hasMoreOlder: hasMoreOlderBasedOnTotal,
							hasMoreNewer: false,
							storedInState: true
						})
					}
				} catch (error) {
					console.error('❌ [useChatMessages] Erro no carregamento inicial:', error)
				} finally {
					setIsLoading(false)
				}
			}

			loadInitialMessages()
		}
	}, [activeTargetId, activeTargetType, getUnreadMessages, loadMessages, getMessagesCount])

	// Função para carregar mensagens mais antigas
	const handleLoadOlderMessages = useCallback(async () => {
		if (!activeTargetId || !activeTargetType || isLoadingOlder || !hasMoreOlderMessages) return

		console.log('🔵 [useChatMessages] Carregando mensagens antigas...', { 
			page: currentPage + 1,
			currentMessages: targetMessages.length,
			hasMoreOlderMessages
		})
		
		setIsLoadingOlder(true)

		try {
			// Encontrar a mensagem mais antiga carregada
			const oldestMessage = targetMessages[0]
			if (!oldestMessage) {
				console.log('🔵 [useChatMessages] Nenhuma mensagem para usar como referência')
				return
			}

			console.log('🔵 [useChatMessages] Mensagem mais antiga como referência:', {
				id: oldestMessage.id,
				createdAt: oldestMessage.createdAt,
				content: oldestMessage.content.substring(0, 50) + '...'
			})

			// Carregar mensagens anteriores à mensagem mais antiga
			const result = await loadMessagesBeforeUnread(
				activeTargetId, 
				activeTargetType, 
				new Date(oldestMessage.createdAt).toISOString(),
				MESSAGES_PER_PAGE
			)
			
			console.log('🔵 [useChatMessages] Resultado da API loadMessagesBeforeUnread:', {
				messagesLength: result.messages.length,
				hasMore: result.hasMore,
				page: currentPage + 1,
				currentMessages: targetMessages.length,
				oldestMessageId: oldestMessage.id
			})

			if (result.messages.length > 0) {
				setCurrentPage((prev) => prev + 1)
				
				// Atualizar hasMore baseado no resultado da API
				setHasMoreOlderMessages(result.hasMore)
				
				console.log('✅ [useChatMessages] Mensagens antigas carregadas:', {
					count: result.messages.length,
					apiHasMore: result.hasMore,
					newPage: currentPage + 1,
					totalMessages: targetMessages.length + result.messages.length,
					firstNewMessage: result.messages[0]?.id,
					lastNewMessage: result.messages[result.messages.length - 1]?.id
				})
			} else {
				setHasMoreOlderMessages(false)
				console.log('🔵 [useChatMessages] Não há mais mensagens antigas - hasMoreOlderMessages = false')
			}
		} catch (error) {
			console.error('❌ [useChatMessages] Erro ao carregar mensagens antigas:', error)
		} finally {
			setIsLoadingOlder(false)
		}
	}, [activeTargetId, activeTargetType, currentPage, loadMessagesBeforeUnread, targetMessages, isLoadingOlder, hasMoreOlderMessages])

	// Função para carregar mensagens mais recentes
	const handleLoadNewerMessages = useCallback(async () => {
		if (!activeTargetId || !activeTargetType || isLoadingNewer || !hasMoreNewerMessages) return

		console.log('🔵 [useChatMessages] Carregando mensagens recentes...', { 
			currentMessages: targetMessages.length,
			hasMoreNewerMessages
		})
		
		setIsLoadingNewer(true)

		try {
			// Encontrar a mensagem mais recente carregada
			const newestMessage = targetMessages[targetMessages.length - 1]
			if (!newestMessage) {
				console.log('🔵 [useChatMessages] Nenhuma mensagem para usar como referência')
				return
			}

			console.log('🔵 [useChatMessages] Mensagem mais recente como referência:', {
				id: newestMessage.id,
				createdAt: newestMessage.createdAt,
				content: newestMessage.content.substring(0, 50) + '...'
			})

			// Carregar mensagens posteriores à mensagem mais recente
			const result = await loadMessagesAfterUnread(
				activeTargetId, 
				activeTargetType, 
				new Date(newestMessage.createdAt).toISOString(),
				MESSAGES_PER_PAGE
			)
			
			console.log('🔵 [useChatMessages] Resultado da API loadMessagesAfterUnread:', {
				messagesLength: result.messages.length,
				hasMore: result.hasMore,
				currentMessages: targetMessages.length,
				newestMessageId: newestMessage.id
			})

			if (result.messages.length > 0) {
				// Atualizar hasMore baseado no resultado da API
				setHasMoreNewerMessages(result.hasMore)
				
				console.log('✅ [useChatMessages] Mensagens mais recentes carregadas:', {
					count: result.messages.length,
					apiHasMore: result.hasMore,
					totalMessages: targetMessages.length + result.messages.length,
					firstNewMessage: result.messages[0]?.id,
					lastNewMessage: result.messages[result.messages.length - 1]?.id
				})
			} else {
				setHasMoreNewerMessages(false)
				console.log('🔵 [useChatMessages] Não há mais mensagens recentes - hasMoreNewerMessages = false')
			}
		} catch (error) {
			console.error('❌ [useChatMessages] Erro ao carregar mensagens recentes:', error)
		} finally {
			setIsLoadingNewer(false)
		}
	}, [activeTargetId, activeTargetType, loadMessagesAfterUnread, targetMessages, isLoadingNewer, hasMoreNewerMessages])

	// Log quando mensagens mudam (sem scroll automático)
	useEffect(() => {
		if (activeTargetId && messages[activeTargetId]) {
			console.log('🔵 [useChatMessages] Mensagens atualizadas:', {
				targetId: activeTargetId,
				count: messages[activeTargetId].length,
				isFirstLoad: !lastTargetRef.current || lastTargetRef.current !== activeTargetId
			})
		}
	}, [messages, activeTargetId])

	// Marcar mensagens como lidas quando usuário visualiza a conversa
	useEffect(() => {
		if (activeTargetId && activeTargetType && targetMessages.length > 0) {
			// Verificar se há mensagens não lidas de outros usuários
			const hasUnreadMessages = targetMessages.some(
				(msg) => !msg.readAt && msg.senderUserId !== currentUser?.id
			)

			if (hasUnreadMessages) {
				console.log('🔵 [useChatMessages] Marcando mensagens como lidas:', {
					targetId: activeTargetId,
					type: activeTargetType,
					totalMessages: targetMessages.length
				})

				// Marcar todas as mensagens não lidas como lidas
				markMessagesAsRead(activeTargetId, activeTargetType)
			}
		}
	}, [activeTargetId, activeTargetType, targetMessages, currentUser?.id, markMessagesAsRead])

	return {
		// Estados
		isLoading: isLoading || userLoading, // Incluir carregamento do usuário
		isLoadingOlder,
		isLoadingNewer,
		hasMoreOlderMessages,
		hasMoreNewerMessages,
		totalMessagesCount,
		
		// Dados
		targetMessages,
		olderMessagesRemaining,
		newerMessagesRemaining,
		
		// Funções
		handleLoadOlderMessages,
		handleLoadNewerMessages,
		
		// Referências
		currentUser,
		userLoading // Expor estado de carregamento do usuário
	}
}
