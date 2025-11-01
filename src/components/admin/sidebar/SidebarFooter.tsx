'use client'

import Link from 'next/link'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import Avatar from '@/components/ui/Avatar'

export default function SidebarFooter() {
	const { currentUser } = useCurrentUser()

	return (
		<footer className='flex h-16 justify-between border-t border-t-transparent'>
			<div className='flex w-full items-center justify-between gap-2 px-4'>
				<div className='flex items-center gap-2'>
					<Avatar 
						src={currentUser?.image} 
						name={currentUser?.name || 'Usuário'} 
						size="md"
					/>
					<div className='w-[140px]'>
						<p className='truncate text-base leading-none font-medium text-zinc-700 dark:text-white'>{currentUser?.name || 'Usuário'}</p>
						<p className='truncate text-sm text-zinc-500 dark:text-zinc-300'>{currentUser?.email || ''}</p>
					</div>
				</div>
				{/* 
					🚨 ALERTA CRÍTICO: prefetch={false} é OBRIGATÓRIO aqui!
					O Next.js prefetcha links automaticamente. Sem prefetch={false}, 
					este link pode causar logout automático sem clique do usuário.
					Este bug levou horas de debug para identificar.
					
					Se mudar para button, use: onClick={() => window.location.href='/api/logout'}
				*/}
				<Link 
					href='/api/logout' 
					prefetch={false}
					type='button' 
					className='relative inline-flex size-8 items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-zinc-800 transition-all duration-500 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700 dark:focus:bg-zinc-700' 
					aria-label='Sair'
				>
					<span className='icon-[lucide--log-out] size-4 shrink-0 text-zinc-400'></span>
				</Link>
			</div>
		</footer>
	)
}
