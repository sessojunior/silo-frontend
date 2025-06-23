import TopbarDropdown from '@/components/admin/topbar/TopbarDropdown'
import TopbarButton from '@/components/admin/topbar/TopbarButton'
import TopbarDivider from '@/components/admin/topbar/TopbarDivider'
import ChatNotificationButton from '@/components/admin/topbar/ChatNotificationButton'

export type AccountLinkProps = {
	id: string
	icon: string
	title: string
	url: string
}

export type AccountProps = AccountLinkProps[]

export default function Topbar() {
	// Dados da conta para o dropdown da barra do topo
	const account: AccountProps = [
		{
			id: '0',
			icon: 'icon-[lucide--settings]',
			title: 'Configurações',
			url: '/admin/settings',
		},
		{
			id: '4',
			icon: 'icon-[lucide--log-out]',
			title: 'Sair',
			url: '/logout',
		},
	]

	return (
		<>
			<header className='sticky inset-x-0 top-0 z-40 flex h-16 w-full flex-shrink-0 flex-wrap border-b border-b-zinc-200 bg-white py-2.5 md:flex-nowrap md:justify-start lg:ps-[260px] dark:border-zinc-700 dark:bg-zinc-900'>
				<nav className='flex w-full items-center px-4'>
					<div className='flex w-full items-center justify-between gap-x-2'>
						<div className='flex items-center gap-x-2'>
							<div className='lg:hidden'>
								{/* Alternar exibir/ocultar menu lateral */}
								<TopbarButton icon='icon-[lucide--menu]' style='menu'>
									Exibir menu lateral
								</TopbarButton>
							</div>

							{/* Título fixo do sistema */}
							<div className='flex items-center p-2'>
								<h1 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>Sistema de gestão de produtos e projetos metereológicos</h1>
							</div>
						</div>

						{/* Botoes, divisoria e dropdown */}
						<div className='flex flex-row items-center justify-end gap-1'>
							<TopbarButton href='#' icon='icon-[lucide--circle-help]'>
								Ajuda
							</TopbarButton>
							<TopbarButton href='#' icon='icon-[lucide--activity]'>
								Atividades
							</TopbarButton>
							<TopbarButton href='#' icon='icon-[lucide--settings]'>
								Configurações
							</TopbarButton>
							<TopbarDivider />
							<ChatNotificationButton />
							<TopbarDivider />
							<TopbarDropdown account={account} />
						</div>
					</div>
				</nav>
			</header>
		</>
	)
}
