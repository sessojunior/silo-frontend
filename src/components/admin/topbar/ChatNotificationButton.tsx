'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/context/ChatContext'
import { formatDateTimeBR } from '@/lib/dateUtils'

export default function ChatNotificationButton() {
	const [isOpen, setIsOpen] = useState(false)
	const [localCurrentPresence, setLocalCurrentPresence] = useState<'visible' | 'invisible'>('invisible')
	const router = useRouter()
	const { groups, users, totalUnread, currentPresence, updatePresence, loadSidebarData } = useChat()

	// Mostrar as 5 conversas mais recentes (grupos + usuários, com prioridade para não lidas)
	const recentConversations = [
		// Grupos com mensagens não lidas
		...groups
			.filter((group) => group.unreadCount > 0)
			.map((group) => ({
				id: group.id,
				name: group.name,
				type: 'group' as const,
				unreadCount: group.unreadCount,
				lastMessageAt: null, // Grupos não têm lastMessageAt na API atual
				lastMessage: null,
				presenceStatus: 'visible' as const, // Grupos sempre visíveis
			})),
		// Usuários com mensagens não lidas
		...users
			.filter((user) => user.unreadCount > 0)
			.map((user) => ({
				id: user.id,
				name: user.name,
				type: 'user' as const,
				unreadCount: user.unreadCount,
				lastMessageAt: user.lastMessageAt,
				lastMessage: user.lastMessage,
				presenceStatus: user.presenceStatus,
			})),
		// Usuários com conversas recentes (sem mensagens não lidas)
		...users
			.filter((user) => user.lastMessage && user.unreadCount === 0)
			.map((user) => ({
				id: user.id,
				name: user.name,
				type: 'user' as const,
				unreadCount: user.unreadCount,
				lastMessageAt: user.lastMessageAt,
				lastMessage: user.lastMessage,
				presenceStatus: user.presenceStatus,
			})),
	]
		.sort((a, b) => {
			// 1. Prioridade: mensagens não lidas
			if (a.unreadCount !== b.unreadCount) {
				return b.unreadCount - a.unreadCount
			}
			// 2. Por última mensagem mais recente
			if (a.lastMessageAt && b.lastMessageAt) {
				return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
			}
			if (a.lastMessageAt && !b.lastMessageAt) return -1
			if (b.lastMessageAt && !a.lastMessageAt) return 1
			return 0
		})
		.slice(0, 5) // Limitar a 5 conversas

	const handleMarkAllAsRead = async () => {
		console.log('🔵 [ChatNotificationButton] Marcar todas como lidas')
		// TODO: Implementar API para marcar todas as mensagens não lidas como lidas
		// Por enquanto, recarregar sidebar
		await loadSidebarData()
	}

	const handleRefresh = async () => {
		console.log('🔵 [ChatNotificationButton] Atualizando notificações')
		await loadSidebarData()
	}

	const handlePresenceChange = async (status: 'visible' | 'invisible') => {
		console.log('🔵 [ChatNotificationButton] Alterando status para:', status)
		setLocalCurrentPresence(status) // Atualizar estado local imediatamente
		await updatePresence(status)
		console.log('✅ [ChatNotificationButton] Status alterado na TopBar para:', status)
	}

	// Debug: Log do currentPresence para investigação
	console.log('🔵 [ChatNotificationButton] currentPresence (contexto):', currentPresence)
	console.log('🔵 [ChatNotificationButton] localCurrentPresence (local):', localCurrentPresence)
	console.log('🔵 [ChatNotificationButton] totalUnread atual:', totalUnread)
	console.log('🔵 [ChatNotificationButton] recentConversations:', recentConversations.length)

	// Função para buscar o status atual da API
	const fetchCurrentPresence = async () => {
		try {
			const response = await fetch('/api/admin/chat/presence')
			if (response.ok) {
				const data = await response.json()
				if (data.currentUserPresence) {
					console.log('🔵 [ChatNotificationButton] Status atual da API:', data.currentUserPresence.status)
					setLocalCurrentPresence(data.currentUserPresence.status)
				}
			}
		} catch (error) {
			console.error('❌ [ChatNotificationButton] Erro ao buscar status atual:', error)
		}
	}

	// Sincronizar com o currentPresence do contexto
	useEffect(() => {
		if (currentPresence && currentPresence !== 'invisible') {
			setLocalCurrentPresence(currentPresence)
		}
	}, [currentPresence])

	// Forçar atualização do currentPresence quando o dropdown abrir
	useEffect(() => {
		if (isOpen) {
			console.log('🔵 [ChatNotificationButton] Dropdown aberto - buscando status atual da API')
			fetchCurrentPresence()
			// Pequeno delay para garantir que o estado seja atualizado
			setTimeout(() => {
				loadSidebarData()
			}, 100)
		}
	}, [isOpen, loadSidebarData])

	const handleButtonClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		const newIsOpen = !isOpen
		setIsOpen(newIsOpen)
		
		// Forçar atualização dos dados quando abrir o dropdown
		if (newIsOpen) {
			console.log('🔵 [ChatNotificationButton] Abrindo dropdown - forçando atualização')
			loadSidebarData()
		}
	}

	const getPresenceColor = (status: string) => {
		switch (status) {
			case 'visible':
				return 'bg-green-500'
			case 'invisible':
				return 'bg-red-500'
			default:
				return 'bg-red-500'
		}
	}

	const getPresenceText = (status: string) => {
		switch (status) {
			case 'visible':
				return 'Visível'
			case 'invisible':
				return 'Invisível'
			default:
				return 'Invisível'
		}
	}

	return (
		<div className='relative'>
			{/* Trigger Button - Seguindo padrão TopbarButton */}
			<button onClick={handleButtonClick} className='relative inline-flex size-[38px] items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-zinc-800 transition-all duration-500 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700 dark:focus:bg-zinc-700'>
				<span className='icon-[lucide--inbox] size-4 shrink-0' aria-hidden='true'></span>

				{/* Pulsate vermelho quando há mensagens não lidas */}
				{totalUnread > 0 && (
					<span className='absolute end-0 top-0 flex size-2.5'>
						<span className='absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75 dark:bg-red-600'></span>
						<span className='relative inline-flex size-2.5 rounded-full bg-red-500'></span>
					</span>
				)}

				{/* Contador 9+ quando mais de 9 mensagens */}
				{totalUnread > 0 && <span className='absolute bottom-0 right-0 flex size-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600'>{totalUnread > 9 ? '9+' : totalUnread}</span>}

				<span className='sr-only'>Chat {totalUnread > 0 ? `(${totalUnread} não lidas)` : ''}</span>
			</button>

			{/* Dropdown */}
			{isOpen && (
				<>
					{/* Overlay */}
					<div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />

					{/* Content */}
					<div className='absolute right-0 top-full z-50 mt-2 w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg'>
						{/* Header com Status de Presença */}
						<div className='px-4 py-3 border-b border-zinc-200 dark:border-zinc-700'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>Chat</h3>
								</div>
								<div className='flex items-center gap-2'>
									<button onClick={handleRefresh} className='p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded transition-colors'>
										<span className='icon-[lucide--refresh-cw] w-4 h-4' />
									</button>
									{totalUnread > 0 && (
										<button onClick={handleMarkAllAsRead} className='p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded transition-colors'>
											<span className='icon-[lucide--check-check] w-4 h-4' />
										</button>
									)}
								</div>
							</div>
							{totalUnread > 0 && (
								<p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1'>
									{totalUnread} nova{totalUnread > 1 ? 's' : ''} mensage{totalUnread > 1 ? 'ns' : 'm'}
								</p>
							)}
						</div>

						{/* Mudança Rápida de Status */}
						<div className='px-4 py-2 border-b border-zinc-200 dark:border-zinc-700'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<span className='text-xs text-zinc-500 dark:text-zinc-400'>Status:</span>
									<span className='text-sm font-medium text-zinc-900 dark:text-zinc-100'>{getPresenceText(localCurrentPresence)}</span>
								</div>
								<div className='flex gap-1'>
									{[
										{ status: 'visible', color: 'bg-green-500', label: 'Visível' },
										{ status: 'invisible', color: 'bg-red-500', label: 'Invisível' },
									].map(({ status, color, label }) => (
										<button 
											key={status} 
											onClick={() => handlePresenceChange(status as 'visible' | 'invisible')} 
											className={`w-6 h-6 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${localCurrentPresence === status ? 'outline-none border-white ring-2 ring-blue-500' : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'}`} 
											title={status === 'invisible' ? 'Status usado para férias, licença, aposentado, saiu da empresa, usuário inativo etc.' : label}
										>
											<div className={`w-full h-full rounded-full ${color}`} />
											<span className='sr-only'>{label}</span>
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Lista das 5 Conversas Mais Recentes */}
						<div className='max-h-80 overflow-y-auto'>
							{recentConversations.length === 0 ? (
								<div className='px-4 py-8 text-center'>
									<span className='icon-[lucide--inbox] w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600' />
									<p className='text-sm text-zinc-500 dark:text-zinc-400 font-medium'>Nenhuma conversa recente</p>
									<p className='text-xs text-zinc-400 dark:text-zinc-500 mt-1'>Suas conversas aparecerão aqui</p>
								</div>
							) : (
								<div className='divide-y divide-zinc-200 dark:divide-zinc-700'>
									{recentConversations.map((conversation) => (
										<div
											key={`${conversation.type}-${conversation.id}`}
											className='px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors'
											onClick={() => {
												setIsOpen(false)
												if (conversation.type === 'group') {
													router.push(`/admin/chat?groupId=${conversation.id}`)
												} else {
													router.push(`/admin/chat?userId=${conversation.id}`)
												}
											}}
										>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-3 min-w-0 flex-1'>
													<div className='relative'>
														{conversation.type === 'group' ? (
															<div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold'>
																<span className='icon-[lucide--users] w-4 h-4' />
															</div>
														) : (
															<div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold'>{conversation.name.charAt(0).toUpperCase()}</div>
														)}
														{conversation.type === 'user' && (
															<div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-800 ${getPresenceColor(conversation.presenceStatus)}`} />
														)}
													</div>
													<div className='min-w-0 flex-1'>
														<div className='flex items-center justify-between'>
															<p className='text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate'>{conversation.name}</p>
															<div className='flex items-center gap-1'>
																{conversation.lastMessageAt && (
																	<span className='text-xs text-zinc-500 dark:text-zinc-400'>
																		{formatDateTimeBR(new Date(conversation.lastMessageAt).toISOString().split('T')[0], new Date(conversation.lastMessageAt).toISOString().split('T')[1]?.split('.')[0]).split(' ')[1]}
																	</span>
																)}
																{conversation.unreadCount > 0 && (
																	<span className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white'>
																		{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
																	</span>
																)}
															</div>
														</div>
														{conversation.lastMessage && (
															<p className='text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5'>{conversation.lastMessage}</p>
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Footer */}
						<div className='px-4 py-3 border-t border-zinc-200 dark:border-zinc-700'>
							<button
								className='w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 py-2 rounded transition-colors'
								onClick={() => {
									setIsOpen(false)
									router.push('/admin/chat')
								}}
							>
								Ver todas as conversas
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
