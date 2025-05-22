import TopbarDropdown from './TopbarDropdown'
import TopbarButton from './TopbarButton'
import TopbarDivider from './TopbarDivider'
import TopbarTitle from './TopbarTitle'

import { AccountProps, UserProps } from '../../layout'

interface TopbarProps {
	title: string
	account: AccountProps
	user: UserProps
}

export default function Topbar({ title, account, user }: TopbarProps) {
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

							{/* Título */}
							<TopbarTitle>{title ?? <span className='icon-[lucide--loader-circle] shrink-0 animate-spin text-neutral-200'></span>}</TopbarTitle>
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
							<TopbarButton href='#' icon='icon-[lucide--inbox]' style='alert'>
								Mensagens
							</TopbarButton>
							<TopbarDivider />
							<TopbarDropdown account={account} user={user} />
						</div>
					</div>
				</nav>
			</header>
		</>
	)
}
