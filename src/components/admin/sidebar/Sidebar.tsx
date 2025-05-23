'use client'

import { useSidebar } from '@/context/SidebarContext'
import type { SidebarProps } from '@/app/admin/layout'
import SidebarHeader from '@/components/admin/sidebar/SidebarHeader'
import SidebarFooter from '@/components/admin/sidebar/SidebarFooter'
import SidebarMenu from '@/components/admin/sidebar/SidebarMenu'
import SidebarBlocks from '@/components/admin/sidebar/SidebarBlocks'

export default function Sidebar({ sidebar }: { sidebar: SidebarProps }) {
	const { isOpenSidebar, closeSidebar } = useSidebar()

	return (
		<div
			className={`fixed inset-y-0 start-0 z-[60] h-full w-[260px] transform border-e border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-900 lg:block lg:translate-x-0 
					${isOpenSidebar ? 'translate-x-0' : '-translate-x-full'}
				`}
			role='dialog'
			aria-label='Barra lateral'
		>
			<div className='relative flex h-full max-h-full flex-col'>
				{/* Cabeçalho e logotipo */}
				<SidebarHeader onClose={closeSidebar} />

				{/* Conteúdo */}
				<div className='size-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-700'>
					{/* Container */}
					<div className='flex h-full w-full flex-col justify-between'>
						{/* Top */}
						<div className='flex w-full'>
							{/* Menu */}
							<SidebarMenu menu={sidebar.menu} />
						</div>
						{/* Bottom */}
						<div className='flex w-full flex-col'>
							{/* Blocos */}
							<SidebarBlocks blocks={sidebar.blocks} />
						</div>
					</div>
				</div>

				{/* Rodapé */}
				<SidebarFooter />
			</div>
		</div>
	)
}
