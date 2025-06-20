'use client'

import { useState } from 'react'
import { useChat } from '@/context/ChatContext'
import TopbarButton from './TopbarButton'

export default function ChatNotificationButton() {
	const [isOpen, setIsOpen] = useState(false)
	const { loadNotifications } = useChat()

	// Mock notifications até implementar corretamente
	const notifications: unknown[] = []
	const unreadCount = 0

	// const handleMarkAsRead = (notificationId: string) => {
	// 	console.log('🔵 Marcar notificação como lida:', notificationId)
	// 	// TODO: Implementar markNotificationAsRead
	// }

	const handleMarkAllAsRead = () => {
		console.log('🔵 Marcar todas notificações como lidas')
		// TODO: Implementar markAllNotificationsAsRead
	}

	const handleRefresh = () => {
		loadNotifications()
	}

	const handleButtonClick = () => {
		setIsOpen(!isOpen)
	}

	return (
		<div className='relative'>
			{/* Trigger Button usando TopbarButton */}
			{unreadCount > 0 ? (
				<div onClick={handleButtonClick} className='cursor-pointer'>
					<TopbarButton style='alert' icon='icon-[lucide--inbox]'>
						Notificações do Chat
					</TopbarButton>
				</div>
			) : (
				<button onClick={handleButtonClick} className='relative inline-flex size-[38px] items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-zinc-800 transition-all duration-500 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700 dark:focus:bg-zinc-700'>
					<span className='icon-[lucide--inbox] size-4 shrink-0' aria-hidden='true'></span>
					<span className='sr-only'>Notificações do Chat</span>
				</button>
			)}

			{/* Dropdown */}
			{isOpen && (
				<>
					{/* Overlay */}
					<div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />

					{/* Content */}
					<div className='absolute right-0 top-full z-50 mt-2 w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg'>
						{/* Header */}
						<div className='px-4 py-3 border-b border-zinc-200 dark:border-zinc-700'>
							<div className='flex items-center justify-between'>
								<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>Notificações do Chat</h3>
								<div className='flex items-center gap-2'>
									<button onClick={handleRefresh} className='p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded transition-colors'>
										<span className='icon-[lucide--refresh-cw] w-4 h-4' />
									</button>
									{unreadCount > 0 && (
										<button onClick={handleMarkAllAsRead} className='p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded transition-colors'>
											<span className='icon-[lucide--check-check] w-4 h-4' />
										</button>
									)}
								</div>
							</div>
							{unreadCount > 0 && (
								<p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1'>
									{unreadCount} nova{unreadCount > 1 ? 's' : ''} mensage{unreadCount > 1 ? 'ns' : 'm'}
								</p>
							)}
						</div>

						{/* Lista de notificações */}
						<div className='max-h-80 overflow-y-auto'>
							{notifications.length === 0 ? (
								<div className='px-4 py-8 text-center'>
									<span className='icon-[lucide--inbox] w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600' />
									<p className='text-sm text-zinc-500 dark:text-zinc-400 font-medium'>Nenhuma notificação</p>
									<p className='text-xs text-zinc-400 dark:text-zinc-500 mt-1'>Suas mensagens de chat aparecerão aqui</p>
								</div>
							) : null}
						</div>

						{/* Footer */}
						{notifications.length > 0 && (
							<div className='px-4 py-3 border-t border-zinc-200 dark:border-zinc-700'>
								<button
									className='w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 py-2 rounded transition-colors'
									onClick={() => {
										setIsOpen(false)
										window.location.href = '/admin/chat'
									}}
								>
									<span className='icon-[lucide--message-circle] w-4 h-4 mr-2 inline-block' />
									Ver todas no Chat
								</button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}
