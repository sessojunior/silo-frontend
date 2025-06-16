'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useChat } from '@/context/ChatContext'
import { useUser } from '@/context/UserContext'
import MessageBubble from './MessageBubble'
import type { ChatMessage } from '@/context/ChatContext'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

type ChatAreaProps = {
	activeChannelId: string | null
	onToggleSidebar: () => void
}

// TypingIndicator component - real-time WebSocket based
function TypingIndicator({ channelId }: { channelId: string }) {
	const { typingUsers } = useChat()

	// Filtrar typing users para este canal
	const channelTypingUsers = typingUsers.filter((user) => user.channelId === channelId)

	if (channelTypingUsers.length === 0) return null

	return (
		<div className='flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400'>
			<div className='flex gap-1'>
				<div className='h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]'></div>
				<div className='h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]'></div>
				<div className='h-2 w-2 animate-bounce rounded-full bg-zinc-400'></div>
			</div>
			<span>{channelTypingUsers.length === 1 ? `${channelTypingUsers[0].userName} está digitando...` : channelTypingUsers.length === 2 ? `${channelTypingUsers[0].userName} e ${channelTypingUsers[1].userName} estão digitando...` : `${channelTypingUsers[0].userName} e mais ${channelTypingUsers.length - 1} pessoa${channelTypingUsers.length > 2 ? 's' : ''} estão digitando...`}</span>
		</div>
	)
}

export default function ChatArea({ activeChannelId, onToggleSidebar }: ChatAreaProps) {
	const { channels, messages, sendMessage, loadMessages, startTyping, stopTyping, typingUsers, isConnected, joinChannel, leaveChannel, markMessagesAsRead } = useChat()
	const user = useUser()

	const [messageText, setMessageText] = useState('')
	const [isTyping, setIsTyping] = useState(false)
	const [messageStatuses, setMessageStatuses] = useState<Record<string, { status: 'sent' | 'delivered' | 'read'; readCount: number; totalParticipants: number }>>({})
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLTextAreaElement>(null)
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const lastChannelRef = useRef<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	// Canal ativo
	const activeChannel = channels.find((c) => c.id === activeChannelId)
	const channelMessages = useMemo(() => {
		return activeChannelId ? messages[activeChannelId] || [] : []
	}, [activeChannelId, messages])

	// Carregar mensagens quando o canal muda
	useEffect(() => {
		if (activeChannelId && activeChannelId !== lastChannelRef.current) {
			console.log('🔵 Mudando para canal:', activeChannelId)

			// Sair do canal anterior
			if (lastChannelRef.current) {
				leaveChannel(lastChannelRef.current)
			}

			// Entrar no novo canal
			joinChannel(activeChannelId)
			lastChannelRef.current = activeChannelId

			// Carregar mensagens
			setIsLoading(true)
			loadMessages(activeChannelId).finally(() => {
				setIsLoading(false)
				messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
			})
		}
	}, [activeChannelId, loadMessages, joinChannel, leaveChannel])

	// Buscar status de leitura das mensagens
	const fetchMessageStatuses = useCallback(
		async (channelId: string | null) => {
			if (!channelId || channelMessages.length === 0) return

			try {
				const response = await fetch(`/api/chat/messages/read-status?messageIds=${channelMessages.map((msg) => msg.id).join(',')}`)
				if (response.ok) {
					const statuses = await response.json()
					setMessageStatuses(statuses)
				}
			} catch (error) {
				console.log('❌ Erro ao buscar status de mensagens:', error)
			}
		},
		[channelMessages],
	)

	useEffect(() => {
		if (channelMessages.length > 0 && activeChannelId) {
			fetchMessageStatuses(activeChannelId)
		}
	}, [channelMessages, activeChannelId, fetchMessageStatuses])

	// Auto-scroll para última mensagem
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [])

	// Auto-scroll quando novas mensagens chegam
	useEffect(() => {
		if (activeChannelId && messages[activeChannelId]) {
			scrollToBottom()

			// Marcar mensagens como lidas após delay
			const channelMessages = messages[activeChannelId]
			if (channelMessages.length > 0) {
				setTimeout(() => {
					const unreadMessageIds = channelMessages
						.filter((msg) => msg.senderId !== 'current-user-id') // TODO: Usar user.id real
						.map((msg) => msg.id)

					if (unreadMessageIds.length > 0) {
						markMessagesAsRead(unreadMessageIds)
					}
				}, 1000)
			}
		}
	}, [messages, activeChannelId, markMessagesAsRead, scrollToBottom])

	// Cleanup ao desmontar
	useEffect(() => {
		return () => {
			if (lastChannelRef.current) {
				leaveChannel(lastChannelRef.current)
			}
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current)
			}
		}
	}, [leaveChannel])

	// Gerenciar typing indicators
	const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value
		setMessageText(value)

		if (!activeChannelId || !isConnected) return

		// Iniciar typing se não estava digitando
		if (!isTyping && value.length > 0) {
			setIsTyping(true)
			await startTyping(activeChannelId)
		}

		// Reset do timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current)
		}

		// Parar typing após 2 segundos de inatividade
		typingTimeoutRef.current = setTimeout(async () => {
			if (isTyping) {
				setIsTyping(false)
				if (activeChannelId) await stopTyping(activeChannelId)
			}
		}, 2000)
	}

	// Enviar mensagem
	const handleSendMessage = async () => {
		if (!messageText.trim() || !activeChannelId || !isConnected) return

		try {
			await sendMessage(activeChannelId, messageText.trim())
			setMessageText('')

			// Parar typing
			if (isTyping) {
				setIsTyping(false)
				await stopTyping(activeChannelId)
			}

			// Limpar timeout
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current)
			}

			// Focar no input
			inputRef.current?.focus()
		} catch (error) {
			console.log('❌ Erro ao enviar mensagem:', error)
		}
	}

	// Enter para enviar (Shift+Enter para nova linha)
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	// Usuários digitando no canal ativo
	const currentChannelTypingUsers = typingUsers.filter((tu) => tu.channelId === activeChannelId && tu.userId !== user.id)

	// Se não há canal ativo
	if (!activeChannel) {
		return (
			<div className='flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900'>
				<div className='text-center text-zinc-500 dark:text-zinc-400'>
					<span className='icon-[lucide--message-circle] w-16 h-16 mx-auto mb-4 opacity-30' />
					<h3 className='text-lg font-medium mb-2'>Bem-vindo ao Chat!</h3>
					<p className='text-sm max-w-md mx-auto'>Selecione um canal na barra lateral para começar a conversar com sua equipe.</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col h-full bg-zinc-50 dark:bg-zinc-900'>
			{/* Header do Chat */}
			<div className='bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-4 py-3'>
				<div className='flex items-center gap-3'>
					{/* Botão de toggle sidebar */}
					<button onClick={onToggleSidebar} className='lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors'>
						<span className='icon-[lucide--menu] w-5 h-5' />
					</button>

					{/* Ícone e informações do canal */}
					<div className='w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0' style={{ backgroundColor: activeChannel.color || '#6B7280' }}>
						<span className={`${activeChannel.icon || 'icon-[lucide--hash]'} w-5 h-5`} />
					</div>

					<div className='flex-1 min-w-0'>
						<h1 className='font-semibold text-zinc-900 dark:text-zinc-100 truncate'>{activeChannel.name}</h1>
						<p className='text-sm text-zinc-500 dark:text-zinc-400 truncate'>{activeChannel.description}</p>
					</div>

					{/* Status de conexão */}
					<div className='flex items-center gap-2 text-sm'>
						<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-400' : 'bg-red-400'}`} />
						<span className='text-zinc-500 dark:text-zinc-400 hidden sm:inline'>{isConnected ? 'Online' : 'Offline'}</span>
					</div>
				</div>
			</div>

			{/* Área de Mensagens */}
			<div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
				{isLoading ? (
					<div className='flex-1 flex items-center justify-center'>
						<div className='text-center text-zinc-500 dark:text-zinc-400'>
							<div className='flex items-center justify-center gap-3 mb-4'>
								<div className='h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600'></div>
								<span className='text-sm'>Carregando mensagens...</span>
							</div>
						</div>
					</div>
				) : channelMessages.length === 0 ? (
					<div className='flex-1 flex items-center justify-center'>
						<div className='text-center text-zinc-500 dark:text-zinc-400'>
							<span className={`${activeChannel.icon || 'icon-[lucide--hash]'} w-12 h-12 mx-auto mb-3 opacity-30`} />
							<h3 className='font-medium mb-1'>Este é o início do canal {activeChannel.name}</h3>
							<p className='text-sm'>Seja o primeiro a enviar uma mensagem!</p>
						</div>
					</div>
				) : (
					<>
						{channelMessages.map((message: ChatMessage) => {
							const messageStatus = messageStatuses[message.id]
							return <MessageBubble key={message.id} message={message} isOwnMessage={message.senderId === user.id} showAvatar={true} readStatus={messageStatus?.status || 'sent'} readCount={messageStatus?.readCount || 0} totalParticipants={messageStatus?.totalParticipants || 0} />
						})}

						{/* Indicadores de typing */}
						{currentChannelTypingUsers.length > 0 && activeChannelId && <TypingIndicator channelId={activeChannelId} />}
					</>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input de Mensagem */}
			<div className='bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 p-4'>
				<div className='flex items-end gap-3'>
					{/* Botão de anexo */}
					<button disabled={!isConnected} className='p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
						<span className='icon-[lucide--paperclip] w-5 h-5' />
					</button>

					{/* Campo de texto */}
					<div className='flex-1 relative'>
						<Textarea
							ref={inputRef}
							value={messageText}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							placeholder={isConnected ? 'Digite uma mensagem...' : 'Chat desconectado'}
							disabled={!isConnected}
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
					<Button onClick={handleSendMessage} disabled={!messageText.trim() || !isConnected} className='h-10 w-10 p-0'>
						<span className='icon-[lucide--send] w-4 h-4' />
					</Button>
				</div>

				{/* Dica de atalho */}
				<p className='text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center'>Pressione Enter para enviar, Shift+Enter para nova linha</p>
			</div>
		</div>
	)
}
