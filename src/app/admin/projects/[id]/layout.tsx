import React from 'react'
import Content from '@/components/admin/nav/Content'

interface ProjectDetailsLayoutProps {
	children: React.ReactNode
	params: Promise<{ id: string }>
}

export default async function ProjectDetailsLayout({ children }: ProjectDetailsLayoutProps) {
	return (
		<div className='flex min-h-[calc(100vh-64px)] w-full flex-col bg-white dark:bg-zinc-900'>
			<div className='flex flex-col'>
				{/* O ProjectDetailsHeader com navegação será renderizado nas páginas filhas */}

				<div>
					{/* Conteúdo */}
					<Content>
						<div className='flex min-h-full w-full flex-col items-start justify-start text-zinc-600 dark:text-zinc-200'>{children}</div>
					</Content>
				</div>
			</div>
		</div>
	)
}
