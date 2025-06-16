'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@/context/ChatContext'
import ChatSidebar from '@/components/admin/chat/ChatSidebar'
import ChatArea from '@/components/admin/chat/ChatArea'
import type { ChatChannel } from '@/lib/db/schema'

export default function ChatPage() {
	// Estado global do chat (temporariamente usando mock)
	const { isConnected, isConnecting, channels, loadChannels } = useChat()

	// Estado local para responsividade
	const [showSidebar, setShowSidebar] = useState(true)
	const [activeChannelId, setActiveChannelId] = useState<string | null>(null)

	// Debug: carregar canais e verificar se há dados
	useEffect(() => {
		console.log('🔵 [ChatPage] Verificando canais carregados:', channels?.length || 0)
		if (channels?.length > 0) {
			console.log(
				'🔵 [ChatPage] Canais disponíveis:',
				channels.map((c) => ({ id: c.id, name: c.name })),
			)
		}
	}, [channels])

	// Debug: monitorar mudanças de canal ativo
	useEffect(() => {
		console.log('🔵 [ChatPage] Canal ativo mudou para:', activeChannelId)
	}, [activeChannelId])

	// SEMPRE usar os canais do contexto (não misturar com mock)
	const displayChannels: ChatChannel[] = (channels || []).map((ch) => ({
		id: ch.id,
		name: ch.name,
		description: ch.description,
		type: ch.type,
		icon: ch.icon,
		color: ch.color,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	}))

	console.log(
		'🔵 [ChatPage] Renderizando com canais:',
		displayChannels.length,
		displayChannels.map((c) => c.name),
	)

	return (
		<div className='flex h-full bg-zinc-50 dark:bg-zinc-900'>
			{/* Sidebar de Canais - 320px (w-80) */}
			<div
				className={`
					${showSidebar ? 'w-96' : 'w-0'} 
					transition-all duration-300 border-r border-zinc-200 dark:border-zinc-700 
					bg-white dark:bg-zinc-800 flex-shrink-0 overflow-hidden
				`}
			>
				<ChatSidebar
					channels={displayChannels}
					activeChannelId={activeChannelId}
					onChannelSelect={(channelId) => {
						console.log('🔵 [ChatPage] Selecionando canal:', channelId)
						setActiveChannelId(channelId)
					}}
					isConnected={isConnected}
					isReconnecting={isConnecting}
				/>
			</div>

			{/* Área Principal de Chat */}
			<div className='flex-1 flex flex-col min-w-0'>
				<ChatArea activeChannelId={activeChannelId} onToggleSidebar={() => setShowSidebar(!showSidebar)} />
			</div>
		</div>
	)
}
