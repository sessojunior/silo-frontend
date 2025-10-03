import { useMemo } from 'react'
import MessageBubble from './MessageBubble'
import { LoadMessagesButton } from './LoadMessagesButton'
import type { ChatMessage } from '@/context/ChatContext'

interface MessagesListProps {
	messages: ChatMessage[]
	isLoading: boolean
	isLoadingOlder: boolean
	isLoadingNewer: boolean
	hasMoreOlderMessages: boolean
	hasMoreNewerMessages: boolean
	olderMessagesRemaining: number
	newerMessagesRemaining: number
	currentUserId?: string
	onLoadOlderMessages: () => void
	onLoadNewerMessages: () => void
}

export function MessagesList({
	messages,
	isLoading,
	isLoadingOlder,
	isLoadingNewer,
	hasMoreOlderMessages,
	hasMoreNewerMessages,
	olderMessagesRemaining,
	newerMessagesRemaining,
	currentUserId,
	onLoadOlderMessages,
	onLoadNewerMessages
}: MessagesListProps) {
	// Criar mapa estável de isOwnMessage para evitar mudanças de lado
	const messageOwnershipMap = useMemo(() => {
		const map = new Map<string, boolean>()
		
		if (currentUserId) {
			messages.forEach((message) => {
				const senderUserId = String(message.senderUserId || '')
				const currentUserIdStr = String(currentUserId || '')
				const isOwnMessage = Boolean(currentUserIdStr && senderUserId === currentUserIdStr)
				map.set(message.id, isOwnMessage)
			})
		}
		
		return map
	}, [messages, currentUserId])
	if (isLoading) {
		return (
			<div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-700 relative bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/images/chat-light.jpg')] dark:bg-[url('/images/chat-dark.jpg')]">
				<div className="relative z-10 px-4 py-4">
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-transparent" />
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-700 relative bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/images/chat-light.jpg')] dark:bg-[url('/images/chat-dark.jpg')]">
			<div className="relative z-10 px-4 py-4 space-y-4">
				{/* Botão para carregar mensagens anteriores */}
				<LoadMessagesButton
					onClick={onLoadOlderMessages}
					isLoading={isLoadingOlder}
					hasMore={hasMoreOlderMessages}
					direction="older"
					count={olderMessagesRemaining}
				/>

				{/* Lista de mensagens */}
				{messages.map((message) => {
					// Usar mapa estável para evitar mudanças de lado
					const isOwnMessage = messageOwnershipMap.get(message.id) || false
					
					// Debug log para verificar a comparação (apenas quando currentUserId muda)
					if (process.env.NODE_ENV === 'development' && currentUserId) {
						console.log('🔵 [MessagesList] Usando mapa estável:', {
							messageId: message.id,
							senderUserId: message.senderUserId,
							currentUserId: currentUserId,
							isOwnMessage,
							senderName: message.senderName,
							mapSize: messageOwnershipMap.size
						})
					}
					
					return (
						<MessageBubble
							key={message.id}
							message={message}
							isOwnMessage={isOwnMessage}
							showAvatar={true}
						/>
					)
				})}

				{/* Botão para carregar mensagens mais recentes */}
				<LoadMessagesButton
					onClick={onLoadNewerMessages}
					isLoading={isLoadingNewer}
					hasMore={hasMoreNewerMessages}
					direction="newer"
					count={newerMessagesRemaining}
				/>
			</div>
		</div>
	)
}
