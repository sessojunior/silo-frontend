import { SidebarProvider } from '@/context/SidebarContext'

import Sidebar from '@/components/admin/sidebar/Sidebar'
import Topbar from '@/components/admin/topbar/Topbar'
import Toast from '@/components/ui/Toast'
import ThemeInitializer from '@/components/admin/ThemeInitializer'

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
	return (
		<>
			{/* Inicializador de tema */}
			<ThemeInitializer />
			
			<SidebarProvider>
				{/* Barra lateral */}
				<Sidebar />

				{/* Barra do topo */}
				<Topbar />

				{/* Conteúdo */}
				<div className='w-full h-[calc(100vh-64px)] transition-all duration-300 lg:pl-[260px] bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100'>
					{/* Contéudo da página */}
					{children}
				</div>
			</SidebarProvider>

			{/* Toast */}
			<Toast />
		</>
	)
}
