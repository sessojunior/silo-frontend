'use client'

import { formatDateTimeBR } from '@/lib/dateUtils'

type MessageBubbleProps = {
	message: {
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
	isOwnMessage: boolean
	showAvatar: boolean
	readStatus?: 'sent' | 'delivered' | 'read' // Status de leitura (apenas para userMessage)
	readCount?: number // Quantos usuários leram (apenas para groupMessage)
	totalParticipants?: number // Total de participantes do grupo (apenas para groupMessage)
}

export default function MessageBubble({ message, isOwnMessage, showAvatar, readStatus = 'sent', readCount = 0, totalParticipants = 0 }: MessageBubbleProps) {
	// Formatar timestamp - formato apropriado para chat
	const messageDate = new Date(message.createdAt)

	const formatMessageTime = (date: Date) => {
		// Usar função centralizada do dateUtils
		return formatDateTimeBR(date.toISOString().split('T')[0], date.toISOString().split('T')[1]?.split('.')[0])
	}

	const timeDisplay = formatMessageTime(messageDate)

	// Avatar baseado no nome do usuário (primeira letra)
	const avatarLetter = message.senderName?.charAt(0).toUpperCase() || '?'

	// Renderizar ícone de status de leitura
	const renderReadStatus = () => {
		if (!isOwnMessage) return null

		// Para userMessage, usar readAt para determinar status
		if (message.messageType === 'userMessage') {
			if (message.readAt) {
				return (
					<div className='flex -space-x-1'>
						<span className='icon-[lucide--check] w-3 h-3 text-green-500' />
						<span className='icon-[lucide--check] w-3 h-3 text-green-500' />
					</div>
				)
			} else {
				return (
					<div className='flex -space-x-1'>
						<span className='icon-[lucide--check] w-3 h-3 text-zinc-400' />
						<span className='icon-[lucide--check] w-3 h-3 text-zinc-400' />
					</div>
				)
			}
		}

		// Para groupMessage, usar readStatus prop
		switch (readStatus) {
			case 'sent':
				return <span className='icon-[lucide--check] w-3 h-3 text-zinc-400' />
			case 'delivered':
				return (
					<div className='flex -space-x-1'>
						<span className='icon-[lucide--check] w-3 h-3 text-zinc-400' />
						<span className='icon-[lucide--check] w-3 h-3 text-zinc-400' />
					</div>
				)
			case 'read':
				return (
					<div className='flex -space-x-1'>
						<span className='icon-[lucide--check] w-3 h-3 text-green-500' />
						<span className='icon-[lucide--check] w-3 h-3 text-green-500' />
					</div>
				)
			default:
				return null
		}
	}

	return (
		<div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
			{/* Avatar (apenas para mensagens de outros usuários) */}
			{showAvatar && !isOwnMessage && (
				<div className='flex-shrink-0'>
					<div className='w-8 h-8 rounded-full bg-zinc-500 flex items-center justify-center text-white text-sm font-medium'>{avatarLetter}</div>
				</div>
			)}

			{/* Conteúdo da mensagem */}
			<div className={`flex flex-col max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
				{/* Nome do remetente (apenas para mensagens de outros usuários) */}
				{!isOwnMessage && showAvatar && <span className='text-xs text-zinc-500 dark:text-zinc-400 mb-1 px-1 truncate'>{message.senderName}</span>}

				{/* Bubble da mensagem */}
				<div
					className={`
						px-4 py-2 rounded-2xl max-w-full break-words overflow-hidden
						${isOwnMessage ? 'bg-blue-500 text-white rounded-br-md' : 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-600 rounded-bl-md'}
					`}
				>
					{/* Conteúdo da mensagem */}
					{message.content && <p className='text-sm whitespace-pre-wrap break-words overflow-hidden'>{message.content}</p>}

					{/* Indicador de exclusão */}
					{message.deletedAt && (
						<div className='text-xs opacity-75 italic'>
							<span className='icon-[lucide--trash-2] w-3 h-3 inline mr-1' />
							Mensagem excluída
						</div>
					)}

					{/* Timestamp, status e leitura */}
					<div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
						<span>{timeDisplay}</span>

						{/* Status de entrega/leitura (apenas para mensagens próprias) */}
						{isOwnMessage && (
							<div className='flex items-center gap-1 ml-1'>
								{renderReadStatus()}
								{/* Contador de leitura para grupos */}
								{message.messageType === 'groupMessage' && totalParticipants > 1 && readCount > 0 && (
									<span className='text-xs opacity-75'>
										{readCount}/{totalParticipants}
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}