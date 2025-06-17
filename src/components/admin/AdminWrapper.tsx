import { SidebarProvider } from '@/context/SidebarContext'

import Sidebar from '@/components/admin/sidebar/Sidebar'
import Topbar from '@/components/admin/topbar/Topbar'
import Toast from '@/components/ui/Toast'

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SidebarProvider>
				{/* Barra lateral */}
				<Sidebar />

				{/* Barra do topo */}
				<Topbar />

				{/* Conteúdo */}
				<div className='w-full transition-all duration-300 lg:pl-[260px]'>
					<div className='h-[calc(100svh-64px)] flex bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100'>
						{/* Contéudo da página */}
						{children}
					</div>
				</div>
			</SidebarProvider>

			{/* Toast */}
			<Toast />
		</>
	)
}
