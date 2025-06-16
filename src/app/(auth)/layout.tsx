import type { Metadata } from 'next'
import Image from 'next/image'

import AuthToggleTheme from '@/components/auth/AuthToggleTheme'
import AuthImageSlider from '@/components/auth/AuthImageSlider'

import Toast from '@/components/ui/Toast'

export const metadata: Metadata = {
	title: 'Autenticação do Silo',
	description: 'Sistema de gerenciamento de produtos e tarefas.',
}

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<>
			<div className='flex min-h-screen justify-between'>
				<div className="h-screen w-full before:absolute before:start-1/2 before:top-0 before:-z-1 before:size-full before:-translate-x-1/2 before:transform before:bg-[url('/images/background-home.svg')] before:bg-cover before:bg-top before:bg-no-repeat md:w-1/2 md:max-w-[600px] dark:bg-zinc-900">
					<div className='scrollbar size-full overflow-y-auto'>
						<div className='flex h-full w-full flex-col'>
							<div className='flex'>
								<div className='flex items-center justify-center px-10 pt-10'>
									<Image src='/images/logo.png' alt='Logo' width={48} height={48} className='block h-12 w-12' />
									<div className='inline-block px-1 pt-0.5 text-3xl font-bold text-zinc-600 dark:text-zinc-200'>Silo</div>
								</div>
							</div>
							<div className='flex flex-grow items-center justify-center'>
								{/* Conteúdo */}
								<div className='mx-auto w-full max-w-[330px] px-5 py-10'>{children}</div>
							</div>
						</div>
					</div>
				</div>

				{/* Slide de Imagens */}
				<div className='hidden min-h-screen flex-grow md:flex md:w-1/2 lg:w-1/2'>
					<AuthImageSlider />
				</div>

				{/* Alternar modo escuro/claro */}
				<AuthToggleTheme />

				{/* Toast */}
				<Toast />
			</div>
		</>
	)
}
