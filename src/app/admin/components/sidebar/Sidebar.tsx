import SidebarHeader from './SidebarHeader'
import SidebarFooter from './SidebarFooter'
import SidebarMenu from './SidebarMenu'
import SidebarBlocks from './SidebarBlocks'

import type { UserProps, SidebarProps } from '../../layout'

export default function Sidebar({ user, sidebar, isOpen, onClose }: { user: UserProps; sidebar: SidebarProps; isOpen: boolean; onClose: () => void }) {
	return (
		<>
			{/* Barra lateral */}
			<div
				className={`fixed inset-y-0 start-0 z-[60] h-full w-[260px] transform border-e border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-900 lg:block lg:translate-x-0 
					${isOpen ? 'translate-x-0' : '-translate-x-full'}
				`}
				role='dialog'
				aria-label='Barra lateral'
			>
				<div className='relative flex h-full max-h-full flex-col'>
					{/* Cabeçalho e logotipo */}
					<SidebarHeader onClose={onClose} />

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
					<SidebarFooter user={user} />
				</div>
			</div>
		</>
	)
}
