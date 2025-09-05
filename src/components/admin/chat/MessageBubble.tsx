'use client'

import { formatDateTimeBR } from '@/lib/dateUtils'

type MessageBubbleProps = {
	message: {
		id: string
		channelId: string
		senderId: string
		senderName: string
		senderEmail: string
		content: string | null
		messageType: string
		fileUrl: string | null
		fileName: string | null
		fileSize: number | null
		fileMimeType: string | null
		replyToId: string | null
		threadCount: number
		isEdited: boolean
		editedAt: Date | null
		createdAt: Date
		deletedAt: Date | null
	}
	isOwnMessage: boolean
	showAvatar: boolean
	readStatus?: 'sent' | 'delivered' | 'read' // Status de leitura
	readCount?: number // Quantos usuários leram
	totalParticipants?: number // Total de participantes do canal
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
					{/* Indicador de resposta */}
					{message.replyToId && (
						<div className={`text-xs mb-2 p-2 rounded ${isOwnMessage ? 'bg-blue-600' : 'bg-zinc-100 dark:bg-zinc-600'}`}>
							<span className='opacity-75'>Respondendo a uma mensagem</span>
						</div>
					)}

					{/* Conteúdo da mensagem */}
					{message.messageType === 'text' && message.content && <p className='text-sm whitespace-pre-wrap break-words overflow-hidden'>{message.content}</p>}

					{/* Mensagem de arquivo */}
					{message.messageType === 'file' && message.fileUrl && (
						<div className='flex items-center gap-2'>
							<span className='icon-[lucide--paperclip] w-4 h-4' />
							<span className='text-sm'>{message.fileName}</span>
							{message.fileSize && <span className='text-xs opacity-75'>({(message.fileSize / 1024).toFixed(1)} KB)</span>}
						</div>
					)}

					{/* Timestamp, status e leitura */}
					<div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
						<span>{timeDisplay}</span>

						{/* Indicador de editado */}
						{message.isEdited && <span className='opacity-75'>(editado)</span>}

						{/* Status de entrega/leitura (apenas para mensagens próprias) */}
						{isOwnMessage && (
							<div className='flex items-center gap-1 ml-1'>
								{renderReadStatus()}
								{/* Contador de leitura para grupos */}
								{readStatus === 'read' && totalParticipants > 1 && readCount > 0 && (
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
