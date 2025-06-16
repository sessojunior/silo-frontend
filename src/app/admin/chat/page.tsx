'use client'

import { useState } from 'react'
import { useChat } from '@/context/ChatContext'
import ChatSidebar from '@/components/admin/chat/ChatSidebar'
import ChatArea from '@/components/admin/chat/ChatArea'

export default function ChatPage() {
	// Estado global do chat (temporariamente usando mock)
	const { isConnected, isConnecting } = useChat()

	// Mock de canais até implementar corretamente
	const mockChannels = [
		{
			id: '1',
			name: 'Geral',
			description: 'Canal geral para discussões',
			type: 'group' as const,
			icon: 'icon-[lucide--hash]',
			color: '#3B82F6',
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '2',
			name: 'Meteorologia',
			description: 'Discussões sobre dados meteorológicos',
			type: 'group' as const,
			icon: 'icon-[lucide--cloud]',
			color: '#10B981',
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]

	// Estado local para responsividade
	const [showSidebar, setShowSidebar] = useState(true)
	const [activeChannelId, setActiveChannelId] = useState<string | null>(null)

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
				<ChatSidebar channels={mockChannels} activeChannelId={activeChannelId} onChannelSelect={setActiveChannelId} isConnected={isConnected} isReconnecting={isConnecting} />
			</div>

			{/* Área Principal de Chat */}
			<div className='flex-1 flex flex-col min-w-0'>
				<ChatArea activeChannelId={activeChannelId} onToggleSidebar={() => setShowSidebar(!showSidebar)} />
			</div>
		</div>
	)
}
