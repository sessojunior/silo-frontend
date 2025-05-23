'use client'

import { useSidebar } from '@/context/SidebarContext'

export default function TopbarButton({ children, disabled = false, icon = '', href = '', style = null }: { children: React.ReactNode; disabled?: boolean; icon?: string; href?: string; style?: string | null }) {
	const { toggleSidebar } = useSidebar()

	if (style === 'alert') {
		return (
			<div className='relative inline-block'>
				<a href={href} role='button' aria-disabled={disabled} className='relative inline-flex size-[38px] items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-zinc-800 transition-all duration-500 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700 dark:focus:bg-zinc-700'>
					<span className={`${icon} size-4 shrink-0`}></span>
					<span className='absolute end-0 top-0 flex size-2.5'>
						<span className='absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75 dark:bg-red-600'></span>
						<span className='relative inline-flex size-2.5 rounded-full bg-red-500'></span>
					</span>
					<span className='sr-only'>{children}</span>
				</a>
			</div>
		)
	}

	if (style === 'menu') {
		return (
			<button type='button' onClick={() => toggleSidebar()} className='relative inline-flex size-[38px] items-center justify-center gap-x-2 rounded-full border border-transparent text-zinc-800 transition-all duration-500 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700 dark:focus:bg-zinc-700' aria-label='Exibir ou ocultar menu lateral'>
				<span className='sr-only'>{children}</span>
				<span className={`${icon} size-5 shrink-0`}></span>
			</button>
		)
	}

	return (
		<a href={href} role='button' aria-disabled={disabled} className='relative inline-flex size-[38px] items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-zinc-800 transition-all duration-500 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700 dark:focus:bg-zinc-700'>
			<span className={`${icon} size-4 shrink-0`} aria-hidden='true'></span>
			<span className='sr-only'>{children}</span>
		</a>
	)
}
