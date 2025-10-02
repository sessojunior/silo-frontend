'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/context/ChatContext'
import { formatDateTimeBR } from '@/lib/dateUtils'

export default function ChatNotificationButton() {
	const [isOpen, setIsOpen] = useState(false)
	const [localCurrentPresence, setLocalCurrentPresence] = useState<'visible' | 'invisible'>('invisible')
	const [unreadMessages, setUnreadMessages] = useState<Record<string, {
		messages: Array<{ content: string; senderName: string; createdAt: Date }>
		totalCount: number
	}>>({})
	const [isLoadingMessages, setIsLoadingMessages] = useState(false)
	const router = useRouter()
	const { groups, users, totalUnread, currentPresence, updatePresence, loadSidebarData } = useChat()

	// Debug: Log do estado atual (apenas quando há mudanças significativas)
	const prevStateRef = useRef({ groups: 0, users: 0, totalUnread: 0, unreadMessagesKeys: 0 })
	const currentState = {
		groups: groups?.length || 0,
		users: users?.length || 0,
		totalUnread,
		unreadMessagesKeys: Object.keys(unreadMessages).length
	}
	
	if (currentState.groups !== prevStateRef.current.groups || 
		currentState.users !== prevStateRef.current.users || 
		currentState.totalUnread !== prevStateRef.current.totalUnread ||
		currentState.unreadMessagesKeys !== prevStateRef.current.unreadMessagesKeys) {
		console.log('🔵 [ChatNotificationButton] Estado atual:', {
			...currentState,
			currentPresence,
			groupsWithUnread: groups?.filter(g => g.unreadCount > 0).length || 0,
			usersWithUnread: users?.filter(u => u.unreadCount > 0).length || 0,
			unreadMessagesData: unreadMessages,
			groupsData: groups?.map(g => ({
				id: g.id,
				name: g.name,
				unreadCount: g.unreadCount,
				lastMessage: g.lastMessage,
				lastMessageAt: g.lastMessageAt
			})),
			usersData: users?.map(u => ({
				id: u.id,
				name: u.name,
				unreadCount: u.unreadCount,
				lastMessage: u.lastMessage,
				lastMessageAt: u.lastMessageAt
			}))
		})
		prevStateRef.current = currentState
	}

	// APENAS conversas com mensagens não lidas (otimizado para notificações)
	const recentConversations = useMemo(() => {
		const conversations = [
			// APENAS grupos com mensagens não lidas
			...groups
				.filter((group) => group.unreadCount > 0)
				.map((group) => ({
					id: group.id,
					name: group.name,
					type: 'group' as const,
					unreadCount: group.unreadCount,
					lastMessageAt: group.lastMessageAt,
					lastMessage: group.lastMessage,
					presenceStatus: 'visible' as const, // Grupos sempre visíveis
				})),
			// APENAS usuários com mensagens não lidas
			...users
				.filter((user) => user.unreadCount > 0)
				.map((user) => ({
					id: user.id,
					name: user.name,
					type: 'user' as const,
					unreadCount: user.unreadCount,
					lastMessageAt: user.lastMessageAt,
					lastMessage: user.lastMessage,
					presenceStatus: user.presenceStatus,
				})),
		]
			.sort((a, b) => {
				// 1. Prioridade: mensagens não lidas
				if (a.unreadCount !== b.unreadCount) {
					return b.unreadCount - a.unreadCount
				}
				// 2. Por última mensagem mais recente
				if (a.lastMessageAt && b.lastMessageAt) {
					return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
				}
				if (a.lastMessageAt && !b.lastMessageAt) return -1
				if (b.lastMessageAt && !a.lastMessageAt) return 1
				return 0
			})
			.slice(0, 5) // Limitar a 5 conversas

		console.log('🔵 [ChatNotificationButton] recentConversations calculado (APENAS não lidas):', {
			totalConversations: conversations.length,
			conversations: conversations.map(c => ({
				id: c.id,
				name: c.name,
				type: c.type,
				unreadCount: c.unreadCount,
				lastMessage: c.lastMessage,
				lastMessageAt: c.lastMessageAt
			}))
		})

		return conversations
	}, [groups, users])

	const handleRefresh = useCallback(async () => {
		console.log('🔵 [ChatNotificationButton] Atualizando notificações')
		await loadSidebarData()
		await loadUnreadMessages()
	}, [loadSidebarData])

	// Função para carregar mensagens não lidas de cada conversa (com debounce)
	const loadUnreadMessages = useCallback(async () => {
		// Evitar múltiplas chamadas simultâneas
		if (isLoadingMessages) {
			console.log('🔵 [ChatNotificationButton] Já carregando mensagens, ignorando chamada...')
			return
		}

		try {
			setIsLoadingMessages(true)
			console.log('🔵 [ChatNotificationButton] Carregando mensagens não lidas...')
			const response = await fetch('/api/admin/chat/unread-messages')
			if (response.ok) {
				const data = await response.json()
				console.log('🔵 [ChatNotificationButton] Dados recebidos da API:', data)
				console.log('🔵 [ChatNotificationButton] UnreadMessages recebidos:', {
					keys: Object.keys(data.unreadMessages || {}),
					totalConversations: Object.keys(data.unreadMessages || {}).length,
					details: Object.entries(data.unreadMessages || {}).map(([id, conv]) => ({
						conversationId: id,
						totalCount: (conv as any)?.totalCount || 0,
						messagesLength: (conv as any)?.messages?.length || 0,
						messages: (conv as any)?.messages?.map((m: any) => ({
							content: m.content,
							senderName: m.senderName,
							createdAt: m.createdAt
						})) || []
					}))
				})
				setUnreadMessages(data.unreadMessages || {})
			} else {
				console.error('❌ [ChatNotificationButton] Erro na resposta da API:', response.status)
			}
		} catch (error) {
			console.error('❌ [ChatNotificationButton] Erro ao carregar mensagens não lidas:', error)
		} finally {
			setIsLoadingMessages(false)
		}
	}, [])

	const handlePresenceChange = async (status: 'visible' | 'invisible') => {
		console.log('🔵 [ChatNotificationButton] Alterando status para:', status)
		setLocalCurrentPresence(status) // Atualizar estado local imediatamente
		await updatePresence(status)
		console.log('✅ [ChatNotificationButton] Status alterado na TopBar para:', status)
	}

	// Debug: Log do currentPresence para investigação (apenas quando há mudanças)
	const prevDebugRef = useRef({ currentPresence: '', localCurrentPresence: '', totalUnread: 0, recentConversations: 0 })
	
	if (currentPresence !== prevDebugRef.current.currentPresence || 
		localCurrentPresence !== prevDebugRef.current.localCurrentPresence || 
		totalUnread !== prevDebugRef.current.totalUnread ||
		recentConversations.length !== prevDebugRef.current.recentConversations) {
		console.log('🔵 [ChatNotificationButton] Debug:', {
			currentPresence,
			localCurrentPresence,
			totalUnread,
			recentConversations: recentConversations.length
		})
		prevDebugRef.current = { currentPresence, localCurrentPresence, totalUnread, recentConversations: recentConversations.length }
	}

	// Função para buscar o status atual da API
	const fetchCurrentPresence = async () => {
		try {
			const response = await fetch('/api/admin/chat/presence')
			if (response.ok) {
				const data = await response.json()
				if (data.currentUserPresence) {
					console.log('🔵 [ChatNotificationButton] Status atual da API:', data.currentUserPresence.status)
					setLocalCurrentPresence(data.currentUserPresence.status)
				}
			}
		} catch (error) {
			console.error('❌ [ChatNotificationButton] Erro ao buscar status atual:', error)
		}
	}

	// Sincronizar com o currentPresence do contexto
	useEffect(() => {
		if (currentPresence && currentPresence !== 'invisible') {
			setLocalCurrentPresence(currentPresence)
		}
	}, [currentPresence])

	// Forçar atualização do currentPresence quando o dropdown abrir
	useEffect(() => {
		if (isOpen) {
			console.log('🔵 [ChatNotificationButton] Dropdown aberto - buscando status atual da API')
			fetchCurrentPresence()
			// Removido carregamento automático de mensagens - usuário pode usar botão de atualizar
			console.log('🔵 [ChatNotificationButton] Dropdown aberto - sem carregamento automático de mensagens')
		}
	}, [isOpen])

	// Carregar mensagens não lidas quando há conversas com mensagens não lidas
	useEffect(() => {
		const hasUnreadConversations = recentConversations.filter(c => c.unreadCount > 0).length > 0
		const hasUnreadMessages = Object.keys(unreadMessages).length > 0
		
		console.log('🔵 [ChatNotificationButton] Verificação de carregamento:', {
			hasUnreadConversations,
			hasUnreadMessages,
			recentConversations: recentConversations.length,
			totalUnread,
			isOpen,
			recentConversationsDetails: recentConversations.map(c => ({
				id: c.id,
				name: c.name,
				unreadCount: c.unreadCount
			}))
		})
		
		// Se há conversas com mensagens não lidas mas não há mensagens carregadas, carregar
		if (hasUnreadConversations && !hasUnreadMessages && isOpen) {
			console.log('🔵 [ChatNotificationButton] Carregando mensagens não lidas automaticamente...')
			loadUnreadMessages()
		}
	}, [recentConversations, unreadMessages, totalUnread, isOpen, loadUnreadMessages])

	// Listener para eventos de mensagens lidas
	useEffect(() => {
		const handleMessagesRead = () => {
			console.log('🔵 [ChatNotificationButton] Evento messagesRead recebido, dropdown aberto:', isOpen)
			console.log('🔵 [ChatNotificationButton] Estado antes da limpeza:', {
				unreadMessagesKeys: Object.keys(unreadMessages).length,
				recentConversations: recentConversations.length,
				totalUnread,
				unreadMessagesDetails: Object.entries(unreadMessages).map(([id, conv]) => ({
					conversationId: id,
					totalCount: (conv as any)?.totalCount || 0,
					messagesLength: (conv as any)?.messages?.length || 0
				}))
			})
			
			// SEMPRE limpar mensagens não lidas do estado local
			setUnreadMessages({})
			console.log('🔵 [ChatNotificationButton] Estado limpo - unreadMessages resetado')
			
			// Recarregar mensagens para sincronizar com o estado atual (com delay para aguardar atualização do ChatContext)
			if (isOpen) {
				setTimeout(() => {
					console.log('🔵 [ChatNotificationButton] Recarregando mensagens para sincronizar...')
					loadUnreadMessages()
				}, 500) // Delay maior para aguardar atualização do ChatContext
			}
		}

		// Escutar eventos customizados de mensagens lidas
		window.addEventListener('messagesRead', handleMessagesRead)
		
		return () => {
			window.removeEventListener('messagesRead', handleMessagesRead)
		}
	}, [isOpen, unreadMessages, totalUnread, recentConversations.length, loadUnreadMessages])

	// Atualizar dropdown quando totalUnread mudar (novas mensagens recebidas)
	useEffect(() => {
		console.log('🔵 [ChatNotificationButton] totalUnread mudou para:', totalUnread)
		
		// Se o dropdown estiver aberto e há mensagens não lidas, recarregar
		if (isOpen && totalUnread > 0) {
			console.log('🔵 [ChatNotificationButton] Dropdown aberto com mensagens não lidas - recarregando...')
			loadUnreadMessages()
		}
	}, [totalUnread, isOpen, loadUnreadMessages])

	const handleButtonClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		const newIsOpen = !isOpen
		setIsOpen(newIsOpen)
		
		// Log apenas
		if (newIsOpen) {
			console.log('🔵 [ChatNotificationButton] Abrindo dropdown')
		} else {
			console.log('🔵 [ChatNotificationButton] Fechando dropdown')
			// Limpar mensagens ao fechar
			setUnreadMessages({})
		}
	}

	const getPresenceColor = (status: string) => {
		switch (status) {
			case 'visible':
				return 'bg-green-500'
			case 'invisible':
				return 'bg-red-500'
			default:
				return 'bg-red-500'
		}
	}

	const getPresenceText = (status: string) => {
		switch (status) {
			case 'visible':
				return 'Visível'
			case 'invisible':
				return 'Invisível'
			default:
				return 'Invisível'
		}
	}

	// Função para truncar texto com limite de caracteres
	const truncateText = (text: string, maxChars: number = 120) => {
		if (text.length <= maxChars) {
			return text
		}
		
		return text.substring(0, maxChars) + '...'
	}

	// Função para formatar mensagens não lidas (memoizada para evitar re-renderizações)
	const formatUnreadMessages = useMemo(() => {
		const memoizedFormats: Record<string, React.ReactElement | null> = {}
		
		console.log('🔵 [ChatNotificationButton] formatUnreadMessages executado:', {
			unreadMessagesKeys: Object.keys(unreadMessages).length,
			recentConversations: recentConversations.length,
			totalUnread,
			unreadMessagesData: unreadMessages,
			recentConversationsData: recentConversations
		})
		
		// Processar todas as conversas de uma vez
		Object.entries(unreadMessages).forEach(([conversationId, conversation]) => {
			console.log('🔵 [ChatNotificationButton] Processando conversa:', {
				conversationId,
				hasConversation: !!conversation,
				messagesLength: conversation?.messages?.length || 0,
				totalCount: conversation?.totalCount || 0,
				conversationData: conversation
			})
			
			// Verificação rigorosa: só exibir se há mensagens não lidas
			if (!conversation || conversation.messages.length === 0 || conversation.totalCount === 0) {
				console.log('🔵 [ChatNotificationButton] Conversa sem mensagens, ignorando:', conversationId)
				memoizedFormats[conversationId] = null
				return
			}

			const { messages, totalCount } = conversation
			const hasMore = totalCount > 3
			
			// Verificar se a conversa ainda tem mensagens não lidas
			const conversationInRecent = recentConversations.find(c => c.id === conversationId)
			console.log('🔵 [ChatNotificationButton] Verificação de conversa recente:', {
				conversationId,
				foundInRecent: !!conversationInRecent,
				unreadCount: conversationInRecent?.unreadCount || 0,
				conversationInRecentData: conversationInRecent
			})
			
			if (!conversationInRecent || conversationInRecent.unreadCount === 0) {
				console.log('🔵 [ChatNotificationButton] Conversa sem mensagens não lidas, ignorando:', conversationId)
				memoizedFormats[conversationId] = null
				return
			}
			
			console.log('🔵 [ChatNotificationButton] Exibindo mensagens para conversa:', conversationId)
			memoizedFormats[conversationId] = (
				<div className="mt-2 space-y-1">
					{hasMore && (
						<div className="flex items-center justify-center mb-2">
							<div className="px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 rounded-full">
								+{totalCount - 3} mensage{totalCount - 3 > 1 ? 'ns anteriores' : 'm anterior'}
							</div>
							<div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-600"></div>
						</div>
					)}
					{messages.map((msg, index) => (
						<div key={index} className="text-xs text-zinc-500 dark:text-zinc-400">
							<span className="font-medium text-zinc-600 dark:text-zinc-300">{msg.senderName}:</span>{' '}
							<span className="break-words">{truncateText(msg.content)}</span>
						</div>
					))}
				</div>
			)
		})
		
		console.log('🔵 [ChatNotificationButton] formatUnreadMessages finalizado:', {
			formattedConversations: Object.keys(memoizedFormats).filter(k => memoizedFormats[k] !== null).length,
			allFormats: memoizedFormats
		})
		
		return memoizedFormats
	}, [unreadMessages, recentConversations])

	// Função helper para obter mensagens formatadas
	const getFormattedMessages = useCallback((conversationId: string) => {
		const result = formatUnreadMessages[conversationId] || null
		console.log('🔵 [ChatNotificationButton] getFormattedMessages chamado:', {
			conversationId,
			hasResult: !!result,
			formatUnreadMessagesKeys: Object.keys(formatUnreadMessages),
			resultType: typeof result,
			resultIsReactElement: result && typeof result === 'object' && 'type' in result
		})
		return result
	}, [formatUnreadMessages])

	return (
		<div className='relative'>
			{/* Trigger Button - Seguindo padrão TopbarButton */}
			<button onClick={handleButtonClick} className='relative inline-flex size-[38px] items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-zinc-800 transition-all duration-500 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700 dark:focus:bg-zinc-700'>
				<span className='icon-[lucide--inbox] size-4 shrink-0' aria-hidden='true'></span>

				{/* Pulsate vermelho quando há mensagens não lidas */}
				{totalUnread > 0 && (
					<span className='absolute end-0 top-0 flex size-2.5'>
						<span className='absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75 dark:bg-red-600'></span>
						<span className='relative inline-flex size-2.5 rounded-full bg-red-500'></span>
					</span>
				)}

				{/* Contador +9 quando mais de 9 mensagens */}
				{totalUnread > 0 && <span className='absolute bottom-0 right-0 flex size-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600'>{totalUnread > 9 ? '+9' : totalUnread}</span>}

				<span className='sr-only'>Chat {totalUnread > 0 ? `(${totalUnread} não lidas)` : ''}</span>
			</button>

			{/* Dropdown */}
			{isOpen && (
				<>
					{/* Overlay */}
					<div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />

					{/* Content */}
					<div className='absolute right-0 top-full z-50 mt-2 w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg'>
						{/* Header com Status de Presença */}
						<div className='px-4 py-3 border-b border-zinc-200 dark:border-zinc-700'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>Chat</h3>
									{totalUnread > 0 && (
										<span className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white'>
											{totalUnread > 99 ? '+99' : totalUnread}
										</span>
									)}
								</div>
								<div className='flex items-center gap-2'>
									<button 
										onClick={handleRefresh} 
										className='p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded transition-colors'
										title='Verificar novas mensagens'
									>
										<span className='icon-[lucide--refresh-cw] w-4 h-4' />
									</button>
								</div>
							</div>
						</div>

						{/* Mudança Rápida de Status */}
						<div className='px-4 py-2 border-b border-zinc-200 dark:border-zinc-700'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<span className='text-xs text-zinc-500 dark:text-zinc-400'>Status:</span>
									<span className='text-sm font-medium text-zinc-900 dark:text-zinc-100'>{getPresenceText(localCurrentPresence)}</span>
								</div>
								<div className='flex gap-1'>
									{[
										{ status: 'visible', color: 'bg-green-500', label: 'Visível' },
										{ status: 'invisible', color: 'bg-red-500', label: 'Invisível' },
									].map(({ status, color, label }) => (
										<button 
											key={status} 
											onClick={() => handlePresenceChange(status as 'visible' | 'invisible')} 
											className={`w-6 h-6 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${localCurrentPresence === status ? 'outline-none border-white ring-2 ring-blue-500' : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'}`} 
											title={status === 'invisible' ? 'Status usado para férias, licença, aposentado, saiu da empresa, usuário inativo etc.' : label}
										>
											<div className={`w-full h-full rounded-full ${color}`} />
											<span className='sr-only'>{label}</span>
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Lista das 5 Conversas Mais Recentes */}
						<div className='max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-700'>
							{isLoadingMessages ? (
								<div className='px-4 py-8 text-center'>
									<div className='animate-spin w-8 h-8 mx-auto mb-3 text-zinc-400'>
										<span className='icon-[lucide--loader-2] w-8 h-8' />
									</div>
									<p className='text-sm text-zinc-500 dark:text-zinc-400 font-medium'>Carregando mensagens...</p>
								</div>
							) : recentConversations.length === 0 ? (
								<div className='px-4 py-8 text-center'>
									<span className='icon-[lucide--inbox] w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600' />
									<p className='text-sm text-zinc-500 dark:text-zinc-400 font-medium'>Nenhuma conversa recente</p>
									<p className='text-xs text-zinc-400 dark:text-zinc-500 mt-1'>Suas conversas aparecerão aqui</p>
								</div>
							) : (
								<div className='divide-y divide-zinc-200 dark:divide-zinc-700'>
									{recentConversations.map((conversation) => (
										<div
											key={`${conversation.type}-${conversation.id}`}
											className='px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors'
											onClick={() => {
												setIsOpen(false)
												if (conversation.type === 'group') {
													router.push(`/admin/chat/groups/${conversation.id}`)
												} else {
													router.push(`/admin/chat/users/${conversation.id}`)
												}
											}}
										>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-3 min-w-0 flex-1'>
													<div className='relative'>
														{conversation.type === 'group' ? (
															<div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold'>
																<span className='icon-[lucide--users] w-4 h-4' />
															</div>
														) : (
															<div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold'>{conversation.name.charAt(0).toUpperCase()}</div>
														)}
														{conversation.type === 'user' && (
															<div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-800 ${getPresenceColor(conversation.presenceStatus)}`} />
														)}
													</div>
													<div className='min-w-0 flex-1'>
														<div className='flex items-center justify-between'>
															<p className='text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate'>{conversation.name}</p>
															<div className='flex items-center gap-1'>
																{conversation.lastMessageAt && (
																	<span className='text-xs text-zinc-500 dark:text-zinc-400'>
																		{formatDateTimeBR(new Date(conversation.lastMessageAt).toISOString().split('T')[0], new Date(conversation.lastMessageAt).toISOString().split('T')[1]?.split('.')[0]).split(' ')[1]}
																	</span>
																)}
																{conversation.unreadCount > 0 && (
																	<span className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white'>
																		{conversation.unreadCount > 99 ? '+99' : conversation.unreadCount}
																	</span>
																)}
															</div>
														</div>
														
														{/* SEMPRE exibir mensagens não lidas (já filtrado no recentConversations) */}
														{(() => {
															const formattedMessages = getFormattedMessages(conversation.id)
															console.log('🔵 [ChatNotificationButton] Renderizando mensagens para:', conversation.id, 'resultado:', formattedMessages)
															return formattedMessages
														})()}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Footer */}
						<div className='px-2 py-1 border-t border-zinc-200 dark:border-zinc-700'>
							<button
								className='w-full text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 py-2 rounded transition-colors'
								onClick={() => {
									setIsOpen(false)
									router.push('/admin/chat/groups')
								}}
							>
								Ver todas as conversas
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	)
}