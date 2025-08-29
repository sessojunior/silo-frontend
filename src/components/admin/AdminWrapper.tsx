import { SidebarProvider } from '@/context/SidebarContext'

import Sidebar from '@/components/admin/sidebar/Sidebar'
import Topbar from '@/components/admin/topbar/Topbar'
import Toast from '@/components/ui/Toast'
import ChatPollingController from '@/components/admin/ChatPollingController'

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SidebarProvider>
				{/* Controlador de polling do chat */}
				<ChatPollingController />

				{/* Barra lateral */}
				<Sidebar />

				{/* Barra do topo */}
				<Topbar />

				{/* Conteúdo */}
				<div className='w-full transition-all duration-300 lg:pl-[260px]'>
					<div className='h-[calc(100vh-64px)] flex bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100'>
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
