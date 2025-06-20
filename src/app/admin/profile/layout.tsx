'use client'

import { usePathname } from 'next/navigation'

import Button from '@/components/admin/nav/Button'
import Content from '@/components/admin/nav/Content'

const tabs = [
	{ label: 'Alterar perfil', url: '/admin/profile' },
	{ label: 'Preferências', url: '/admin/profile/preferences' },
	{ label: 'Segurança', url: '/admin/profile/security' },
]

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()

	return (
		<div className='flex min-h-[calc(100vh-64px)] w-full flex-col bg-white dark:bg-zinc-900'>
			<div className='flex flex-col'>
				{/* Botões */}
				<div className='flex'>
					<div className='flex w-full border-b border-zinc-200 bg-zinc-100 px-4 py-3 transition dark:border-zinc-700 dark:bg-zinc-700'>
						<div className='flex gap-x-2'>
							{/* Botões */}
							{tabs.map((tab) => (
								<Button key={tab.url} href={tab.url} active={pathname === tab.url}>
									{tab.label}
								</Button>
							))}
						</div>
					</div>
				</div>
				<div>
					{/* Conteúdo */}
					<Content>
						<div className='flex min-h-full w-full flex-col items-start justify-start gap-8 p-8 text-zinc-600 dark:text-zinc-200'>{children}</div>
					</Content>
				</div>
			</div>
		</div>
	)
}
