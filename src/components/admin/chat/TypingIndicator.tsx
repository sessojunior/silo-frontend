'use client'

import { useChat } from '@/context/ChatContext'

interface TypingIndicatorProps {
	channelId: string
}

export default function TypingIndicator({ channelId }: TypingIndicatorProps) {
	const { typingUsers } = useChat()

	// Filtrar typing users para este canal específico
	const channelTypingUsers = typingUsers.filter((user) => user.channelId === channelId)

	if (channelTypingUsers.length === 0) {
		return null
	}

	return (
		<div className='flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400'>
			{/* Animação de pontos */}
			<div className='flex gap-1'>
				<div className='h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]'></div>
				<div className='h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]'></div>
				<div className='h-2 w-2 animate-bounce rounded-full bg-zinc-400'></div>
			</div>

			{/* Texto dinâmico baseado no número de usuários */}
			<span>
				{channelTypingUsers.length === 1 ? (
					<>{channelTypingUsers[0].userName} está digitando...</>
				) : channelTypingUsers.length === 2 ? (
					<>
						{channelTypingUsers[0].userName} e {channelTypingUsers[1].userName} estão digitando...
					</>
				) : (
					<>
						{channelTypingUsers[0].userName} e mais {channelTypingUsers.length - 1} pessoa{channelTypingUsers.length > 2 ? 's' : ''} estão digitando...
					</>
				)}
			</span>
		</div>
	)
}
