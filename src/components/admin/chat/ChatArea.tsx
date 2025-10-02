'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useChat } from '@/context/ChatContext'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import MessageBubble from './MessageBubble'
import EmojiPicker from './EmojiPicker'
import type { ChatMessage, ChatGroup, ChatUser } from '@/context/ChatContext'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

type ChatAreaProps = {
	activeTargetId: string | null
	activeTargetType: 'group' | 'user' | null
	activeTarget: ChatGroup | ChatUser | undefined
	onToggleSidebar: () => void
}

export default function ChatArea({ activeTargetId, activeTargetType, activeTarget, onToggleSidebar }: ChatAreaProps) {
	const { messages, sendMessage, loadMessages, loadOlderMessages, markMessageAsRead, markMessagesAsRead } = useChat()
	const { currentUser } = useCurrentUser()

	const [messageText, setMessageText] = useState('')
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isSending, setIsSending] = useState(false)

	const messagesEndRef = useRef<HTMLDivElement>(null)
	const messagesContainerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLTextAreaElement>(null)
	const [isUserScrolling, setIsUserScrolling] = useState(false)
	const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
	const [isLoadingOlder, setIsLoadingOlder] = useState(false)
	const [hasMoreMessages, setHasMoreMessages] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	// const MESSAGES_PER_PAGE = 30 // Para referência futura
	const lastTargetRef = useRef<string | null>(null)

	// Mensagens do target ativo (garantir ordem cronológica)
	const targetMessages = useMemo(() => {
		if (!activeTargetId) return []
		const msgs = messages[activeTargetId] || []
		// Garantir ordenação cronológica (mais antiga primeiro)
		return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
	}, [activeTargetId, messages])

	// Carregar mensagens quando o target muda
	useEffect(() => {
		if (activeTargetId && activeTargetType && activeTargetId !== lastTargetRef.current) {
			console.log('🔵 [ChatArea] Mudando para target:', {
				id: activeTargetId,
				type: activeTargetType,
			})

			lastTargetRef.current = activeTargetId

			// Carregar mensagens
			setIsLoading(true)
			loadMessages(activeTargetId, activeTargetType).finally(() => {
				setIsLoading(false)
				setTimeout(() => {
					messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
				}, 100)
			})
		}
	}, [activeTargetId, activeTargetType, loadMessages])

	// Marcar mensagens como lidas quando usuário visualiza a conversa
	useEffect(() => {
		if (activeTargetId && activeTargetType && targetMessages.length > 0) {
			// Verificar se há mensagens não lidas de outros usuários
			const hasUnreadMessages = targetMessages.some(
				(msg) => !msg.readAt && msg.senderUserId !== currentUser?.id
			)

			if (hasUnreadMessages) {
				console.log('🔵 [ChatArea] Marcando mensagens como lidas:', {
					targetId: activeTargetId,
					type: activeTargetType,
					totalMessages: targetMessages.length
				})

				// Marcar todas as mensagens não lidas como lidas
				markMessagesAsRead(activeTargetId, activeTargetType)
			}
		}
	}, [activeTargetId, activeTargetType, targetMessages, currentUser?.id, markMessagesAsRead])

	// Verificar se usuário está no final da página (para auto-scroll)
	const isAtBottom = useCallback(() => {
		if (!messagesContainerRef.current) return false
		const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
		return scrollHeight - scrollTop <= clientHeight + 50 // 50px de tolerância
	}, [])

	// Auto-scroll para última mensagem (apenas se necessário)
	const scrollToBottom = useCallback(
		(force = false) => {
			if (force || shouldAutoScroll) {
				messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
			}
		},
		[shouldAutoScroll],
	)

	// Função para carregar mensagens mais antigas
	const loadMoreMessages = useCallback(async () => {
		if (isLoadingOlder || !hasMoreMessages || !activeTargetId || !activeTargetType) return

		console.log('🔵 [ChatArea] Carregando mais mensagens antigas...', { page: currentPage + 1 })
		setIsLoadingOlder(true)

		try {
			const result = await loadOlderMessages(activeTargetId, activeTargetType, currentPage + 1)

			if (result.messages.length > 0) {
				setCurrentPage((prev) => prev + 1)
				setHasMoreMessages(result.hasMore)
				console.log('✅ [ChatArea] Mensagens antigas carregadas:', {
					count: result.messages.length,
					hasMore: result.hasMore,
					newPage: currentPage + 1,
				})
			} else {
				setHasMoreMessages(false)
				console.log('🔵 [ChatArea] Não há mais mensagens antigas')
			}
		} catch (error) {
			console.error('❌ [ChatArea] Erro ao carregar mensagens antigas:', error)
		} finally {
			setIsLoadingOlder(false)
		}
	}, [isLoadingOlder, hasMoreMessages, activeTargetId, activeTargetType, currentPage, loadOlderMessages])

	// Detectar scroll manual do usuário (com debounce para evitar oscilação)
	const handleScroll = useCallback(() => {
		if (!messagesContainerRef.current) return

		const { scrollTop } = messagesContainerRef.current
		const isBottom = isAtBottom()
		const isNearTop = scrollTop < 100 // 100px do topo

		// Carregar mais mensagens quando próximo ao topo
		if (isNearTop && hasMoreMessages && !isLoadingOlder) {
			loadMoreMessages()
		}

		// Debounce para evitar logs excessivos de oscilação
		setTimeout(() => {
			// Se usuário scrollou até o final, reativar auto-scroll
			if (isBottom && !shouldAutoScroll) {
				console.log('🔵 [ChatArea] Usuário voltou ao final - reativando auto-scroll')
				setShouldAutoScroll(true)
				setIsUserScrolling(false)
			}
			// Se usuário scrollou para cima, desativar auto-scroll
			else if (!isBottom && shouldAutoScroll) {
				console.log('🔵 [ChatArea] Usuário scrollou para cima - desativando auto-scroll')
				setShouldAutoScroll(false)
				setIsUserScrolling(true)
			}
		}, 150)
	}, [isAtBottom, shouldAutoScroll, hasMoreMessages, isLoadingOlder, loadMoreMessages])

	// Auto-scroll quando novas mensagens chegam (inteligente)
	useEffect(() => {
		if (activeTargetId && messages[activeTargetId]) {
			// PRIMEIRA CARGA sempre faz scroll
			if (!lastTargetRef.current || lastTargetRef.current !== activeTargetId) {
				scrollToBottom(true) // Force = true para primeira carga
				console.log('🔵 [ChatArea] Primeira carga - scroll forçado para o final')
			}
			// MENSAGENS NOVAS: só scroll se shouldAutoScroll estiver ativo
			else if (shouldAutoScroll) {
				scrollToBottom(true)
				console.log('🔵 [ChatArea] Nova mensagem - scroll automático (estava no final)')
			} else {
				console.log('🔵 [ChatArea] Nova mensagem - SEM scroll (usuário navegando histórico)')
			}

			// Marcar mensagens não lidas como lidas após delay (apenas para userMessage)
			if (activeTargetType === 'user') {
				const targetMessages = messages[activeTargetId]
				const unreadMessages = targetMessages.filter((msg) => msg.senderUserId !== currentUser?.id && msg.readAt === null)

				if (unreadMessages.length > 0) {
					setTimeout(() => {
						unreadMessages.forEach((msg) => {
							markMessageAsRead(msg.id)
						})
					}, 1000)
				}
			}
		}
	}, [messages, activeTargetId, activeTargetType, markMessageAsRead, scrollToBottom, shouldAutoScroll, currentUser?.id])

	// Reset auto-scroll ao trocar de conversa
	useEffect(() => {
		if (activeTargetId !== lastTargetRef.current) {
			setShouldAutoScroll(true)
			setIsUserScrolling(false)
			setCurrentPage(1)
			setHasMoreMessages(true)
			setIsLoadingOlder(false)
			lastTargetRef.current = activeTargetId
			console.log('🔵 [ChatArea] Nova conversa - resetando auto-scroll e paginação')
		}
	}, [activeTargetId])

	// Debug removido para evitar logs excessivos

	// Enviar mensagem
	const handleSendMessage = async () => {
		if (!messageText.trim() || !activeTargetId || !activeTargetType || isSending) return

		console.log('🔵 [ChatArea] Iniciando envio de mensagem')
		try {
			setIsSending(true)

			if (activeTargetType === 'group') {
				await sendMessage(messageText.trim(), activeTargetId, undefined)
			} else {
				await sendMessage(messageText.trim(), undefined, activeTargetId)
			}

			setMessageText('')

			// APENAS scroll automático se já estava no final antes de enviar
			// Se usuário estava navegando no histórico, respeitar sua posição
			setTimeout(() => {
				if (shouldAutoScroll) {
					scrollToBottom(true)
					console.log('🔵 [ChatArea] Mensagem enviada - scroll automático (estava no final)')
				} else {
					console.log('🔵 [ChatArea] Mensagem enviada - SEM scroll (usuário navegando histórico)')
				}
			}, 100)

			console.log('🔵 [ChatArea] Tentando manter focus após envio...')

			// Usar setTimeout para garantir que o DOM foi atualizado
			setTimeout(() => {
				if (inputRef.current) {
					inputRef.current.focus()
					console.log('✅ [ChatArea] Focus restaurado com sucesso')
				} else {
					console.log('❌ [ChatArea] Ref do input não encontrado')
				}
			}, 150)
		} catch (error) {
			console.error('❌ [ChatArea] Erro ao enviar mensagem:', error)
		} finally {
			setIsSending(false)
		}
	}

	// Enter para enviar (Shift+Enter para nova linha)
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	// Converter ChatMessage para formato esperado pelo MessageBubble
	const convertMessageForBubble = (message: ChatMessage) => {
		return {
			id: message.id,
			content: message.content,
			senderUserId: message.senderUserId,
			senderName: message.senderName,
			receiverGroupId: message.receiverGroupId,
			receiverUserId: message.receiverUserId,
			createdAt: message.createdAt,
			readAt: message.readAt,
			deletedAt: message.deletedAt,
			messageType: message.messageType,
		}
	}

	// Obter informações de exibição do target
	const getTargetDisplayInfo = () => {
		if (!activeTarget) return null

		if (activeTargetType === 'group') {
			const group = activeTarget as ChatGroup
			return {
				name: group.name,
				description: group.description || 'Grupo organizacional',
				icon: group.icon || 'icon-[lucide--users]',
				color: group.color || '#6B7280',
			}
		} else {
			const chatUser = activeTarget as ChatUser
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

			return {
				name: chatUser.name,
				description: `${getPresenceText(chatUser.presenceStatus)} • ${chatUser.email}`,
				icon: 'icon-[lucide--user]',
				color: '#3B82F6', // azul padrão para usuários
			}
		}
	}

	const targetInfo = getTargetDisplayInfo()

	// Se não há target ativo
	if (!activeTarget || !targetInfo) {
		return (
			<div className='flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900'>
				<div className='text-center text-zinc-500 dark:text-zinc-400'>
					<span className='icon-[lucide--message-circle] w-16 h-16 mx-auto mb-4 opacity-30' />
					<h3 className='text-lg font-medium mb-2'>Bem-vindo ao Chat!</h3>
					<p className='text-sm max-w-md mx-auto'>Selecione um grupo ou usuário na barra lateral para começar a conversar.</p>
				</div>
			</div>
		)
	}

	return (
		<div className='relative flex flex-col h-full min-h-0 bg-zinc-50 dark:bg-zinc-900'>
			{/* Header do Chat */}
			<div className='bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-4 py-3 flex-shrink-0'>
				<div className='flex items-center gap-3'>
					{/* Botão de toggle sidebar */}
					<button onClick={onToggleSidebar} className='lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors'>
						<span className='icon-[lucide--menu] w-5 h-5' />
					</button>

					{/* Ícone e informações do target */}
					{activeTargetType === 'group' ? (
						<div className='w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0' style={{ backgroundColor: targetInfo.color }}>
							<span className={`${targetInfo.icon} w-5 h-5`} />
						</div>
					) : (
						<div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0'>{targetInfo.name.charAt(0).toUpperCase()}</div>
					)}

					<div className='flex-1 min-w-0'>
						<h1 className='font-semibold text-zinc-900 dark:text-zinc-100 truncate'>{targetInfo.name}</h1>
						<p className='text-sm text-zinc-500 dark:text-zinc-400 break-words leading-tight'>{targetInfo.description}</p>
					</div>

					{/* Informações adicionais */}
					<div className='flex items-center gap-3 text-sm'>
						{activeTargetType === 'user' && (
							<div className='flex items-center gap-2'>
								<div className={`w-2 h-2 rounded-full ${(activeTarget as ChatUser).presenceStatus === 'visible' ? 'bg-green-400' : 'bg-red-400'}`} />
							</div>
						)}
						<span className='text-zinc-500 dark:text-zinc-400 hidden sm:inline'>{targetMessages.length} mensagens</span>
					</div>
				</div>
			</div>

			{/* Área de Mensagens */}
			<div 
				ref={messagesContainerRef} 
				onScroll={handleScroll} 
				className={`${targetMessages.length > 0 ? 'flex-1 overflow-y-auto min-h-0' : 'flex-1 flex items-center justify-center'} relative bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/images/chat-light.jpg')] dark:bg-[url('/images/chat-dark.jpg')]`}
			>
				{/* Conteúdo das mensagens */}
				<div className="relative z-10 px-4 py-4 space-y-4">
				{isLoading ? (
					<div className='text-center text-zinc-500 dark:text-zinc-400'>
						<div className='flex items-center justify-center gap-3 mb-4'>
							<div className='h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600'></div>
							<span className='text-sm'>Carregando mensagens...</span>
						</div>
					</div>
				) : targetMessages.length === 0 ? (
					<div className='text-center text-zinc-500 dark:text-zinc-400'>
						<span className={`${targetInfo.icon} w-12 h-12 mx-auto mb-3 opacity-30`} />
						<h3 className='font-medium mb-1'>{activeTargetType === 'group' ? `Este é o início do grupo ${targetInfo.name}` : `Este é o início da conversa com ${targetInfo.name}`}</h3>
						<p className='text-sm'>Seja o primeiro a enviar uma mensagem!</p>
					</div>
				) : (
					<>
						{/* Indicador de loading para mensagens antigas */}
						{isLoadingOlder && (
							<div className='flex items-center justify-center py-4'>
								<div className='flex items-center gap-2 text-zinc-500 dark:text-zinc-400'>
									<div className='h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600'></div>
									<span className='text-xs'>Carregando mensagens antigas...</span>
								</div>
							</div>
						)}

						{/* Indicador de fim das mensagens */}
						{!hasMoreMessages && targetMessages.length > 30 && (
							<div className='flex items-center justify-center py-4'>
								<div className='text-center text-zinc-400 dark:text-zinc-500'>
									<span className='icon-[lucide--clock] w-4 h-4 mx-auto mb-1' />
									<p className='text-xs'>Início da conversa</p>
								</div>
							</div>
						)}

						{/* Lista de mensagens */}
						{targetMessages.map((message: ChatMessage, index: number) => {
							const isOwnMessage = message.senderUserId === currentUser?.id
							const previousMessage = index > 0 ? targetMessages[index - 1] : null
							const isConsecutiveFromSameUser = previousMessage && previousMessage.senderUserId === message.senderUserId
							
							// Mostrar avatar/nome apenas se:
							// 1. Não é mensagem própria
							// 2. É primeira mensagem do usuário OU não é consecutiva do mesmo usuário
							const shouldShowAvatar = !isOwnMessage && (!previousMessage || !isConsecutiveFromSameUser)
							
							return (
								<MessageBubble 
									key={message.id} 
									message={convertMessageForBubble(message)} 
									isOwnMessage={isOwnMessage} 
									showAvatar={shouldShowAvatar} 
									readStatus={isOwnMessage ? (message.readAt ? 'read' : 'delivered') : 'sent'} 
									readCount={0} 
									totalParticipants={0} 
								/>
							)
						})}
					</>
				)}
				<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Botão para voltar ao final (quando usuário scrollou para cima) */}
			{isUserScrolling && (
				<div className='absolute bottom-24 right-7 z-10'>
					<button
						onClick={() => {
							scrollToBottom(true)
							setShouldAutoScroll(true)
							setIsUserScrolling(false)
						}}
						className='flex items-center gap-2 bg-zinc-500 hover:bg-zinc-600 dark:bg-zinc-600 dark:hover:bg-zinc-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors'
					>
						<span className='icon-[lucide--arrow-down] w-4 h-4' />
						<span className='text-sm font-medium'>Voltar ao final</span>
					</button>
				</div>
			)}

			{/* Input de Mensagem */}
			<div className='bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 p-4 flex-shrink-0'>
				<div className='flex items-center gap-3'>
					{/* Botão emoji com dropdown */}
					<div className='relative'>
						<button onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={isSending} className='flex items-center justify-center size-10 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed' title='Emojis'>
							<span className='icon-[lucide--smile] w-5 h-5' />
						</button>

						<EmojiPicker
							isOpen={showEmojiPicker}
							onClose={() => setShowEmojiPicker(false)}
							onEmojiSelect={(emoji) => {
								setMessageText((prev) => prev + emoji)
								// Focar no input após inserir emoji
								inputRef.current?.focus()
							}}
							position='top'
						/>
					</div>

					{/* Campo de texto */}
					<div className='flex-1 relative'>
						<Textarea
							ref={inputRef}
							value={messageText}
							onChange={(e) => setMessageText(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={activeTargetType === 'group' ? `Mensagem para ${targetInfo.name}...` : `Mensagem para ${targetInfo.name}...`}
							disabled={isSending}
							className='w-full resize-none rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed max-h-32'
							rows={1}
							style={{
								height: 'auto',
								minHeight: '48px',
								maxHeight: '128px',
							}}
						/>
					</div>

					{/* Botão enviar */}
					<div className="relative group">
						<Button onClick={handleSendMessage} disabled={!messageText.trim() || isSending} className='size-10 p-0'>
							{isSending ? <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' /> : <span className='icon-[lucide--send] w-4 h-4' />}
						</Button>
						
						{/* Tooltip */}
						<div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
							<div className="space-y-1">
								<div>Enter para enviar</div>
								<div>Shift+Enter para nova linha</div>
								{activeTargetType === 'user' && <div className="text-zinc-300 dark:text-zinc-600">Mensagens privadas são marcadas como lidas automaticamente</div>}
							</div>
							{/* Seta do tooltip */}
							<div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-900 dark:border-t-zinc-100"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
