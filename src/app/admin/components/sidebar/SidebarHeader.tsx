import SidebarButtonTheme from './SidebarButtonTheme'
import SidebarButtonClose from './SidebarButtonClose'
import Logo from './SidebarLogo'

export default function SidebarHeader({ onClose }: { onClose: () => void }) {
	return (
		<>
			<div className='flex h-16 flex-shrink-0 items-center justify-between border-b border-b-transparent px-4'>
				{/* Logotipo */}
				<Logo />

				<div className='flex gap-2'>
					{/* Botão de alternar o tema entre claro e escuro */}
					<SidebarButtonTheme />

					{/* Botão de fechar a barra lateral */}
					<SidebarButtonClose onClose={onClose} />
				</div>
			</div>
		</>
	)
}
