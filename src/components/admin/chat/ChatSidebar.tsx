'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useUser } from '@/context/UserContext'
import type { ChatChannel } from '@/lib/db/schema'

type ChatSidebarProps = {
	channels: ChatChannel[]
	activeChannelId: string | null
	onChannelSelect: (channelId: string) => void
	isConnected: boolean
	isReconnecting: boolean
}

export default function ChatSidebar({ channels, activeChannelId, onChannelSelect, isConnected, isReconnecting }: ChatSidebarProps) {
	const user = useUser()
	const [searchQuery, setSearchQuery] = useState('')

	// Filtrar canais baseado na busca
	const filteredChannels = channels.filter((channel) => channel.name?.toLowerCase().includes(searchQuery.toLowerCase()) || channel.description?.toLowerCase().includes(searchQuery.toLowerCase()))

	// Status de conexão
	const getConnectionStatus = () => {
		if (isReconnecting) return { text: 'Reconectando...', color: 'text-amber-500' }
		if (isConnected) return { text: 'Online', color: 'text-green-500' }
		return { text: 'Offline', color: 'text-red-500' }
	}

	const connectionStatus = getConnectionStatus()

	return (
		<div className='flex flex-col h-full'>
			{/* Header da Sidebar */}
			<div className='p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'>
				<div className='flex items-center gap-3 mb-3'>
					<div className='relative'>
						<Image src={user.image} alt={user.name} width={40} height={40} className='rounded-full object-cover' unoptimized={user.image.startsWith('blob:')} />
						<div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isConnected ? 'bg-blue-400' : 'bg-gray-400'}`} />
					</div>
					<div className='flex-1'>
						<h2 className='font-semibold text-sm text-zinc-900 dark:text-white'>{user.name}</h2>
						<p className={`text-xs ${connectionStatus.color}`}>{connectionStatus.text}</p>
					</div>
					<button className='flex items-center justify-center size-10 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors'>
						<span className='icon-[lucide--more-vertical] size-5 text-zinc-600 dark:text-zinc-300' />
					</button>
				</div>

				{/* Busca */}
				<div className='relative'>
					<span className='icon-[lucide--search] absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400' />
					<input type='text' placeholder='Buscar canais...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-300 rounded-lg border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-400' />
				</div>
			</div>

			{/* Lista de Canais */}
			<div className='flex-1 overflow-y-auto'>
				{filteredChannels.length === 0 ? (
					<div className='p-6 text-center text-zinc-500 dark:text-zinc-400'>
						<span className='icon-[lucide--message-circle] w-8 h-8 mx-auto mb-2 opacity-50' />
						<p className='text-sm'>{searchQuery ? 'Nenhum canal encontrado' : 'Nenhum canal disponível'}</p>
					</div>
				) : (
					<div className='py-2'>
						{filteredChannels.map((channel) => (
							<ChannelItem key={channel.id} channel={channel} isActive={channel.id === activeChannelId} onClick={() => onChannelSelect(channel.id)} />
						))}
					</div>
				)}
			</div>

			{/* Footer com informações */}
			<div className='p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'>
				<div className='flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400'>
					<span>{filteredChannels.length} canais</span>
					<span className='flex items-center gap-1'>
						<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-400' : 'bg-red-400'}`} />
						Chat {isConnected ? 'ativo' : 'inativo'}
					</span>
				</div>
			</div>
		</div>
	)
}

// Componente individual do canal
function ChannelItem({ channel, isActive, onClick }: { channel: ChatChannel; isActive: boolean; onClick: () => void }) {
	// Parse do ícone e cor
	const iconClass = channel.icon || 'icon-[lucide--hash]'
	const channelColor = channel.color || '#6B7280'

	return (
		<button
			onClick={onClick}
			className={`
				w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 
				transition-colors text-left border-l-4 
				${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300' : 'border-transparent'}
			`}
		>
			{/* Ícone do Canal */}
			<div className='flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium' style={{ backgroundColor: channelColor }}>
				<span className={`${iconClass} w-5 h-5`} />
			</div>

			{/* Informações do Canal */}
			<div className='flex-1 min-w-0'>
				<div className='flex items-center justify-between mb-1'>
					<h3 className={`font-medium text-sm truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100'}`}>{channel.name}</h3>
					{/* TODO: Implementar indicador de canal privado se necessário */}
				</div>
				<p className='text-xs text-zinc-500 dark:text-zinc-400 truncate'>{channel.description || 'Sem descrição'}</p>
			</div>

			{/* Badge de mensagens não lidas (placeholder) */}
			<div className='flex-shrink-0'>
				{/* TODO: Implementar contador de mensagens não lidas */}
				{isActive && <div className='w-2 h-2 bg-blue-500 rounded-full' />}
			</div>
		</button>
	)
}
