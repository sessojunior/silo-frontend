import React from 'react'
import ProductTabs from '@/components/admin/nav/ProductTabs'
import Content from '@/components/admin/nav/Content'

interface ProjectsLayoutProps {
	children: React.ReactNode
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
	const tabs = [
		{
			label: 'Projetos',
			url: '/admin/projects',
		},
		{
			label: 'Membros',
			url: '/admin/projects/members',
		},
	]

	return (
		<div className='flex min-h-[calc(100vh-64px)] w-full flex-col bg-white dark:bg-zinc-900'>
			<div className='flex flex-col'>
				{/* Cabeçalho fixo */}
				<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
					<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Gestão de Projetos</h1>
					<p className='text-zinc-600 dark:text-zinc-400 mt-1'>Gerencie projetos, membros e acompanhe o progresso das atividades</p>
				</div>

				{/* Botões/Abas */}
				<div className='flex'>
					<div className='flex w-full border-b border-zinc-200 bg-zinc-100 px-4 py-3 transition dark:border-zinc-700 dark:bg-zinc-700'>
						<ProductTabs tabs={tabs} />
					</div>
				</div>

				<div>
					{/* Conteúdo */}
					<Content>
						<div className='flex min-h-full w-full flex-col items-start justify-start gap-8 text-zinc-600 dark:text-zinc-200'>{children}</div>
					</Content>
				</div>
			</div>
		</div>
	)
}
