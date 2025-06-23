'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useUser } from '@/context/UserContext'
import { useChat, ChatGroup, ChatUser } from '@/context/ChatContext'

type ChatSidebarProps = {
	activeTargetId: string | null
	activeTargetType: 'group' | 'user' | null
	onTargetSelect: (targetId: string, type: 'group' | 'user') => void
}

export default function ChatSidebar({ activeTargetId, activeTargetType, onTargetSelect }: ChatSidebarProps) {
	const user = useUser()
	const { groups, users, totalUnread, currentPresence, updatePresence } = useChat()

	const [searchQuery, setSearchQuery] = useState('')
	const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups')
	const [showStatusMenu, setShowStatusMenu] = useState(false)

	// Filtrar grupos baseado na busca
	const filteredGroups = groups.filter((group) => group.name?.toLowerCase().includes(searchQuery.toLowerCase()) || group.description?.toLowerCase().includes(searchQuery.toLowerCase()))

	// Filtrar usuários baseado na busca
	const filteredUsers = users.filter((chatUser) => chatUser.name?.toLowerCase().includes(searchQuery.toLowerCase()) || chatUser.email?.toLowerCase().includes(searchQuery.toLowerCase()))

	// Alterar status do usuário
	const handleStatusChange = async (newStatus: 'online' | 'away' | 'busy' | 'offline') => {
		try {
			await updatePresence(newStatus)
			setShowStatusMenu(false)
			console.log('✅ [ChatSidebar] Status alterado para:', newStatus)
		} catch (error) {
			console.error('❌ [ChatSidebar] Erro ao alterar status:', error)
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

	const statusInfo = getStatusInfo(currentPresence)

	return (
		<div className='flex flex-col h-full'>
			{/* Header da Sidebar */}
			<div className='border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'>
				<div className='flex items-center gap-3 mb-3 p-4 border-b border-zinc-200 dark:border-zinc-700'>
					<div className='relative'>
						<Image src={user.image} alt={user.name} width={40} height={40} className='rounded-full object-cover' unoptimized={user.image.startsWith('blob:')} />
						<div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${statusInfo.color}`} />
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
							<>
								{/* Overlay para fechar */}
								<div className='fixed inset-0 z-40' onClick={() => setShowStatusMenu(false)} />

								<div className='absolute right-0 top-full mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-2 w-48 z-50'>
									<div className='px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700'>Alterar Status</div>
									{[
										{ key: 'online', label: 'Online', color: 'bg-green-400' },
										{ key: 'away', label: 'Ausente', color: 'bg-yellow-400' },
										{ key: 'busy', label: 'Ocupado', color: 'bg-red-400' },
										{ key: 'offline', label: 'Offline', color: 'bg-gray-400' },
									].map((status) => (
										<button key={status.key} onClick={() => handleStatusChange(status.key as 'online' | 'away' | 'busy' | 'offline')} className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${currentPresence === status.key ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
											<div className={`w-3 h-3 rounded-full ${status.color}`} />
											<span className='text-sm text-zinc-900 dark:text-white'>{status.label}</span>
											{currentPresence === status.key && <span className='icon-[lucide--check] w-4 h-4 text-blue-500 ml-auto' />}
										</button>
									))}
								</div>
							</>
						)}
					</div>
				</div>

				{/* Abas */}
				<div className='flex mb-3 bg-white dark:bg-zinc-700 rounded-lg p-1 m-4'>
					<button onClick={() => setActiveTab('groups')} className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${activeTab === 'groups' ? 'bg-blue-500 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600'}`}>
						<span className='icon-[lucide--users] w-3 h-3 inline mr-1' />
						Grupos ({groups.length})
					</button>
					<button onClick={() => setActiveTab('users')} className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600'}`}>
						<span className='icon-[lucide--message-circle] w-3 h-3 inline mr-1' />
						Conversas ({users.filter((u) => u.unreadCount > 0).length})
					</button>
				</div>
			</div>

			<div className='border-b border-zinc-200 dark:border-zinc-700 p-4'>
				{/* Busca */}
				<div className='relative'>
					<span className='icon-[lucide--search] absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400' />
					<input type='text' placeholder={activeTab === 'groups' ? 'Buscar grupos...' : 'Buscar conversas...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-300 rounded-lg border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-400' />
				</div>
			</div>

			{/* Conteúdo baseado na aba ativa */}
			<div className='flex-1 overflow-y-auto'>
				{activeTab === 'groups' ? (
					// Lista de Grupos
					filteredGroups.length === 0 ? (
						<div className='p-6 text-center text-zinc-500 dark:text-zinc-400'>
							<span className='icon-[lucide--users] w-8 h-8 mx-auto mb-2 opacity-50' />
							<p className='text-sm'>{searchQuery ? 'Nenhum grupo encontrado' : 'Nenhum grupo disponível'}</p>
						</div>
					) : (
						<div>
							{filteredGroups.map((group) => (
								<GroupItem key={group.id} group={group} isActive={group.id === activeTargetId && activeTargetType === 'group'} onClick={() => onTargetSelect(group.id, 'group')} />
							))}
						</div>
					)
				) : (
					// Lista de Usuários
					<div className='py-2'>
						{filteredUsers.length === 0 ? (
							<div className='p-6 text-center text-zinc-500 dark:text-zinc-400'>
								<span className='icon-[lucide--message-circle] w-8 h-8 mx-auto mb-2 opacity-50' />
								<p className='text-sm'>{searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ativa'}</p>
							</div>
						) : (
							filteredUsers.map((chatUser) => <UserItem key={chatUser.id} user={chatUser} isActive={chatUser.id === activeTargetId && activeTargetType === 'user'} onClick={() => onTargetSelect(chatUser.id, 'user')} />)
						)}
					</div>
				)}
			</div>

			{/* Footer com informações */}
			<div className='p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'>
				<div className='flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400'>
					<span>{activeTab === 'groups' ? `${filteredGroups.length} grupos` : `${filteredUsers.length} conversas`}</span>
					<span className='flex items-center gap-1'>
						{totalUnread > 0 && <span className='bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium'>{totalUnread}</span>}
						<div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
						{statusInfo.label}
					</span>
				</div>
			</div>
		</div>
	)
}

// Componente individual do grupo
function GroupItem({ group, isActive, onClick }: { group: ChatGroup; isActive: boolean; onClick: () => void }) {
	const iconClass = group.icon || 'icon-[lucide--users]'
	const groupColor = group.color || '#6B7280'

	return (
		<button
			onClick={onClick}
			className={`
				w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 
				transition-colors text-left border-l-4 
				${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300' : 'border-transparent'}
			`}
		>
			{/* Ícone do Grupo */}
			<div className='flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium' style={{ backgroundColor: groupColor }}>
				<span className={`${iconClass} w-5 h-5`} />
			</div>

			{/* Informações do Grupo */}
			<div className='flex-1 min-w-0'>
				<div className='flex items-center justify-between mb-1'>
					<h3 className={`font-medium text-sm truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100'}`}>{group.name}</h3>
				</div>
				<p className='text-xs text-zinc-500 dark:text-zinc-400 truncate'>{group.description || 'Grupo organizacional'}</p>
			</div>

			{/* Badge de ativo */}
			<div className='flex-shrink-0'>{isActive && <div className='w-2 h-2 bg-blue-500 rounded-full' />}</div>
		</button>
	)
}

// Componente individual do usuário
function UserItem({ user, isActive, onClick }: { user: ChatUser; isActive: boolean; onClick: () => void }) {
	const getPresenceColor = (status: string) => {
		switch (status) {
			case 'online':
				return 'bg-green-400'
			case 'away':
				return 'bg-yellow-400'
			case 'busy':
				return 'bg-red-400'
			default:
				return 'bg-gray-400'
		}
	}

	const formatLastMessage = (lastMessageAt: Date | null) => {
		if (!lastMessageAt) return ''

		const now = new Date()
		const diff = now.getTime() - new Date(lastMessageAt).getTime()
		const minutes = Math.floor(diff / (1000 * 60))
		const hours = Math.floor(diff / (1000 * 60 * 60))
		const days = Math.floor(diff / (1000 * 60 * 60 * 24))

		if (minutes < 5) return 'agora'
		if (minutes < 60) return `${minutes}m`
		if (hours < 24) return `${hours}h`
		if (days < 7) return `${days}d`
		return new Date(lastMessageAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
	}

	return (
		<button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left border-l-4 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'border-transparent'}`}>
			{/* Avatar do Usuário */}
			<div className='relative flex-shrink-0'>
				<div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold'>{user.name.charAt(0).toUpperCase()}</div>
				{/* Status de presença */}
				<div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getPresenceColor(user.presenceStatus)}`} />
			</div>

			{/* Informações do Usuário */}
			<div className='flex-1 min-w-0'>
				<div className='flex items-center justify-between mb-1'>
					<h3 className={`font-medium text-sm truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100'}`}>{user.name}</h3>
					<div className='flex items-center gap-1'>
						{user.lastMessageAt && <span className='text-xs text-zinc-500 dark:text-zinc-400'>{formatLastMessage(user.lastMessageAt)}</span>}
						{user.unreadCount > 0 && <span className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white'>{user.unreadCount > 99 ? '99+' : user.unreadCount}</span>}
					</div>
				</div>
				{user.lastMessage && <p className='text-xs text-zinc-500 dark:text-zinc-400 truncate'>{user.lastMessage}</p>}
			</div>
		</button>
	)
}
