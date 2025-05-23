import { SidebarProvider } from '@/context/SidebarContext'
import type { SidebarProps, AccountProps } from '@/app/admin/layout'

import Sidebar from '@/components/admin/sidebar/Sidebar'
import Topbar from '@/components/admin/topbar/Topbar'

import Toast from '@/components/ui/Toast'

export default function AdminWrapper({ sidebar, account, children }: { sidebar: SidebarProps; account: AccountProps; children: React.ReactNode }) {
	return (
		<>
			<SidebarProvider>
				{/* Barra lateral */}
				<Sidebar sidebar={sidebar} />

				{/* Barra do topo */}
				<Topbar title='Bem-vindo ao Silo' account={account} />
			</SidebarProvider>

			{/* Conteúdo */}
			<div className='w-full transition-all duration-300 lg:pl-[260px]'>
				<div className='h-[calc(100svh-64px)] bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100'>
					{/* Contéudo da página */}
					{children}
				</div>
			</div>

			{/* Toast */}
			<Toast />
		</>
	)
}
