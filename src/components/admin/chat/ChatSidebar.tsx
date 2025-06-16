'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useUser } from '@/context/UserContext'
import type { ChatChannel } from '@/context/ChatContext'

type ChatUser = {
	id: string
	name: string
	email: string
	image: string
	groupId: string | null
	isActive: boolean
	lastSeen?: Date
	isOnline?: boolean
}

type ChatSidebarProps = {
	channels: ChatChannel[]
	activeChannelId: string | null
	onChannelSelect: (channelId: string) => void
	isConnected: boolean
	isReconnecting: boolean
}

export default function ChatSidebar({ channels, activeChannelId, onChannelSelect, isConnected }: ChatSidebarProps) {
	const user = useUser()
	const [searchQuery, setSearchQuery] = useState('')
	const [activeTab, setActiveTab] = useState<'channels' | 'users'>('channels')
	const [users, setUsers] = useState<ChatUser[]>([])
	const [loadingUsers, setLoadingUsers] = useState(false)
	const [showStatusMenu, setShowStatusMenu] = useState(false)
	const [currentStatus, setCurrentStatus] = useState<'online' | 'away' | 'busy' | 'offline'>('online')

	// Carregar status atual do usuário
	useEffect(() => {
		async function loadUserStatus() {
			try {
				const response = await fetch('/api/chat/presence')
				if (response.ok) {
					const statusData = await response.json()
					setCurrentStatus(statusData.status)
				}
			} catch (error) {
				console.log('❌ [ChatSidebar] Erro ao carregar status:', error)
			}
		}
		loadUserStatus()
	}, [])

	// Fechar menu de status quando clicar fora
	useEffect(() => {
		function handleClickOutside() {
			if (showStatusMenu) {
				setShowStatusMenu(false)
			}
		}

		if (showStatusMenu) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showStatusMenu])

	// Carregar usuários do sistema
	useEffect(() => {
		async function loadUsers() {
			if (activeTab === 'users' && users.length === 0) {
				setLoadingUsers(true)
				try {
					console.log('🔵 [ChatSidebar] Carregando usuários...')
					const response = await fetch('/api/users')
					if (response.ok) {
						const result = await response.json()
						const usersData = result.data?.items || []
						console.log('✅ [ChatSidebar] Usuários carregados:', usersData.length)
						setUsers(
							usersData.map((u: { id: string; name: string; email: string; image?: string; groupId: string | null; isActive: boolean; lastSeen?: string }) => ({
								id: u.id,
								name: u.name,
								email: u.email,
								image: u.image || '/images/profile.png',
								groupId: u.groupId,
								isActive: u.isActive,
								lastSeen: u.lastSeen ? new Date(u.lastSeen) : undefined,
								isOnline: false, // TODO: implementar status online real
							})),
						)
					} else {
						console.log('❌ [ChatSidebar] Erro ao carregar usuários:', response.status)
					}
				} catch (error) {
					console.log('❌ [ChatSidebar] Erro ao carregar usuários:', error)
				} finally {
					setLoadingUsers(false)
				}
			}
		}
		loadUsers()
	}, [activeTab, users.length])

	// Filtrar canais baseado na busca
	const filteredChannels = channels.filter((channel) => channel.name?.toLowerCase().includes(searchQuery.toLowerCase()) || channel.description?.toLowerCase().includes(searchQuery.toLowerCase()))

	// Filtrar usuários baseado na busca (excluir usuário atual)
	const filteredUsers = users.filter(
		(chatUser) =>
			chatUser.id !== user.id && // Excluir usuário atual
			(chatUser.name?.toLowerCase().includes(searchQuery.toLowerCase()) || chatUser.email?.toLowerCase().includes(searchQuery.toLowerCase())),
	)

	// Alterar status do usuário
	const handleStatusChange = async (newStatus: 'online' | 'away' | 'busy' | 'offline') => {
		try {
			const response = await fetch('/api/chat/presence', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			})

			if (response.ok) {
				setCurrentStatus(newStatus)
				setShowStatusMenu(false)
				console.log('✅ Status alterado para:', newStatus)
			} else {
				console.log('❌ Erro ao alterar status')
			}
		} catch (error) {
			console.log('❌ Erro ao alterar status:', error)
		}
	}

	// Obter informações do status atual
	const getStatusInfo = (status: string) => {
		switch (status) {
			case 'online':
				return { label: 'Online', color: 'bg-green-400', textColor: 'text-green-500' }
			case 'away':
				return { label: 'Ausente', color: 'bg-yellow-400', textColor: 'text-yellow-500' }
			case 'busy':
				return { label: 'Ocupado', color: 'bg-red-400', textColor: 'text-red-500' }
			case 'offline':
				return { label: 'Offline', color: 'bg-gray-400', textColor: 'text-gray-500' }
			default:
				return { label: 'Online', color: 'bg-green-400', textColor: 'text-green-500' }
		}
	}

	const statusInfo = getStatusInfo(currentStatus)

	return (
		<div className='flex flex-col h-full'>
			{/* Header da Sidebar */}
			<div className='border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'>
				<div className='flex items-center gap-3 mb-3 p-4 border-b border-zinc-200 dark:border-zinc-700'>
					<div className='relative'>
						<Image src={user.image} alt={user.name} width={40} height={40} className='rounded-full object-cover' unoptimized={user.image.startsWith('blob:')} />
						<div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isConnected ? 'bg-blue-400' : 'bg-gray-400'}`} />
					</div>
					<div className='flex-1'>
						<h2 className='font-semibold text-sm text-zinc-900 dark:text-white'>{user.name}</h2>
						<div className='flex items-center gap-2'>
							<div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
							<p className={`text-xs ${statusInfo.textColor}`}>{statusInfo.label}</p>
						</div>
					</div>
					<div className='relative'>
						<button onClick={() => setShowStatusMenu(!showStatusMenu)} className='flex items-center justify-center size-10 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors'>
							<span className='icon-[lucide--more-vertical] size-5 text-zinc-600 dark:text-zinc-300' />
						</button>

						{/* Dropdown de Status */}
						{showStatusMenu && (
							<div className='absolute right-0 top-full mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-2 w-48 z-50'>
								<div className='px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700'>Alterar Status</div>
								{[
									{ key: 'online', label: 'Online', color: 'bg-green-400', icon: 'icon-[lucide--circle]' },
									{ key: 'away', label: 'Ausente', color: 'bg-yellow-400', icon: 'icon-[lucide--clock]' },
									{ key: 'busy', label: 'Ocupado', color: 'bg-red-400', icon: 'icon-[lucide--minus-circle]' },
									{ key: 'offline', label: 'Offline', color: 'bg-gray-400', icon: 'icon-[lucide--x-circle]' },
								].map((status) => (
									<button key={status.key} onClick={() => handleStatusChange(status.key as 'online' | 'away' | 'busy' | 'offline')} className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${currentStatus === status.key ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
										<div className={`w-3 h-3 rounded-full ${status.color}`} />
										<span className='text-sm text-zinc-900 dark:text-white'>{status.label}</span>
										{currentStatus === status.key && <span className='icon-[lucide--check] w-4 h-4 text-blue-500 ml-auto' />}
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Abas */}
				<div className='flex mb-3 bg-white dark:bg-zinc-700 rounded-lg p-1 m-4'>
					<button onClick={() => setActiveTab('channels')} className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${activeTab === 'channels' ? 'bg-blue-500 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600'}`}>
						<span className='icon-[lucide--hash] w-3 h-3 inline mr-1' />
						Canais
					</button>
					<button onClick={() => setActiveTab('users')} className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600'}`}>
						<span className='icon-[lucide--users] w-3 h-3 inline mr-1' />
						Usuários
					</button>
				</div>
			</div>
			<div className='border-b border-zinc-200 dark:border-zinc-700 p-4'>
				{/* Busca */}
				<div className='relative'>
					<span className='icon-[lucide--search] absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400' />
					<input type='text' placeholder={activeTab === 'channels' ? 'Buscar conversas...' : 'Buscar usuários...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-300 rounded-lg border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-400' />
				</div>
			</div>

			{/* Conteúdo baseado na aba ativa */}
			<div className='flex-1 overflow-y-auto'>
				{activeTab === 'channels' ? (
					// Lista de Canais
					filteredChannels.length === 0 ? (
						<div className='p-6 text-center text-zinc-500 dark:text-zinc-400'>
							<span className='icon-[lucide--message-circle] w-8 h-8 mx-auto mb-2 opacity-50' />
							<p className='text-sm'>{searchQuery ? 'Nenhum canal encontrado' : 'Nenhum canal disponível'}</p>
						</div>
					) : (
						<div>
							{filteredChannels.map((channel) => (
								<ChannelItem key={channel.id} channel={channel} isActive={channel.id === activeChannelId} onClick={() => onChannelSelect(channel.id)} />
							))}
						</div>
					)
				) : (
					// Lista de Usuários
					<div className='py-2'>
						{loadingUsers ? (
							<div className='p-6 text-center text-zinc-500 dark:text-zinc-400'>
								<div className='animate-spin w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full mx-auto mb-2'></div>
								<p className='text-sm'>Carregando usuários...</p>
							</div>
						) : filteredUsers.length === 0 ? (
							<div className='p-6 text-center text-zinc-500 dark:text-zinc-400'>
								<span className='icon-[lucide--users] w-8 h-8 mx-auto mb-2 opacity-50' />
								<p className='text-sm'>{searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}</p>
							</div>
						) : (
							filteredUsers.map((chatUser) => (
								<UserItem
									key={chatUser.id}
									user={chatUser}
									onClick={() => {
										// TODO: Implementar chat direto com usuário
										console.log('🔵 [ChatSidebar] Iniciar chat com:', chatUser.name)
									}}
								/>
							))
						)}
					</div>
				)}
			</div>

			{/* Footer com informações */}
			<div className='p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'>
				<div className='flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400'>
					<span>{activeTab === 'channels' ? `${filteredChannels.length} canais` : `${filteredUsers.length} usuários`}</span>
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
				</div>
				<p className='text-xs text-zinc-500 dark:text-zinc-400 truncate'>{channel.description || 'Sem descrição'}</p>
			</div>

			{/* Badge de mensagens não lidas */}
			<div className='flex-shrink-0'>{isActive && <div className='w-2 h-2 bg-blue-500 rounded-full' />}</div>
		</button>
	)
}

// Componente individual do usuário
function UserItem({ user, onClick }: { user: ChatUser; onClick: () => void }) {
	const formatLastSeen = (lastSeen?: Date) => {
		if (!lastSeen) return 'Nunca visto'

		const now = new Date()
		const diff = now.getTime() - lastSeen.getTime()
		const minutes = Math.floor(diff / (1000 * 60))
		const hours = Math.floor(diff / (1000 * 60 * 60))
		const days = Math.floor(diff / (1000 * 60 * 60 * 24))

		if (minutes < 5) return 'Agora mesmo'
		if (minutes < 60) return `${minutes}m atrás`
		if (hours < 24) return `${hours}h atrás`
		if (days < 7) return `${days}d atrás`
		return lastSeen.toLocaleDateString()
	}

	return (
		<button onClick={onClick} className='w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left'>
			{/* Avatar do Usuário */}
			<div className='relative flex-shrink-0'>
				<Image src={user.image} alt={user.name} width={40} height={40} className='rounded-full object-cover' unoptimized={user.image.includes('blob:') || user.image.includes('localhost')} />
				{/* Status online/offline */}
				<div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.isOnline ? 'bg-green-400' : user.isActive ? 'bg-gray-400' : 'bg-red-400'}`} />
			</div>

			{/* Informações do Usuário */}
			<div className='flex-1 min-w-0'>
				<div className='flex items-center justify-between mb-1'>
					<h3 className='font-medium text-sm truncate text-zinc-900 dark:text-zinc-100'>{user.name}</h3>
					<span className={`text-xs px-2 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>{user.isActive ? 'Ativo' : 'Inativo'}</span>
				</div>
				<p className='text-xs text-zinc-500 dark:text-zinc-400 truncate'>{user.isOnline ? 'Online agora' : formatLastSeen(user.lastSeen)}</p>
			</div>
		</button>
	)
}
