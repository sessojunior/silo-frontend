import Image from 'next/image'
import Link from 'next/link'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function SidebarFooter() {
	const { currentUser } = useCurrentUser()

	return (
		<footer className='flex h-16 justify-between border-t border-t-transparent'>
			<div className='flex w-full items-center justify-between gap-2 px-4'>
				<div className='flex items-center gap-2'>
					<Image src={currentUser?.image || '/images/profile.png'} alt='Avatar' width={40} height={40} className='inline-block size-[40px] rounded-full' />
					<div className='w-[140px]'>
						<p className='truncate text-base leading-none font-medium text-zinc-700 dark:text-white'>{currentUser?.name || 'Usuário'}</p>
						<p className='truncate text-sm text-zinc-500 dark:text-zinc-300'>{currentUser?.email || ''}</p>
					</div>
				</div>
				<Link href='/logout' prefetch={false} type='button' className='relative inline-flex size-8 items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-zinc-800 transition-all duration-500 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700 dark:focus:bg-zinc-700' aria-label='Sair'>
					<span className='icon-[lucide--log-out] size-4 shrink-0 text-zinc-400'></span>
				</Link>
			</div>
		</footer>
	)
}
