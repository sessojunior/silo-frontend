'use client'

import { Project } from '@/types/projects'
import { calculateProjectStats } from '@/lib/data/projects-mock'

interface ProjectStatsCardsProps {
	projects: Project[]
}

export default function ProjectStatsCards({ projects }: ProjectStatsCardsProps) {
	const stats = calculateProjectStats(projects)

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
			{/* Card 1: Total de Projetos */}
			<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
				<div className='flex items-center gap-2'>
					<span className='icon-[lucide--folder] size-5 text-blue-600' />
					<div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Total de Projetos</p>
						<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.total}</p>
					</div>
				</div>
			</div>

			{/* Card 2: Projetos Ativos */}
			<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
				<div className='flex items-center gap-2'>
					<span className='icon-[lucide--play-circle] size-5 text-green-600' />
					<div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Projetos Ativos</p>
						<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.active}</p>
					</div>
				</div>
			</div>

			{/* Card 3: Projetos Finalizados */}
			<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
				<div className='flex items-center gap-2'>
					<span className='icon-[lucide--check-circle] size-5 text-purple-600' />
					<div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Finalizados</p>
						<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.completed}</p>
					</div>
				</div>
			</div>

			{/* Card 4: Progresso Médio */}
			<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
				<div className='flex items-center gap-2'>
					<span className='icon-[lucide--trending-up] size-5 text-orange-600' />
					<div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Progresso Médio</p>
						<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.avgProgress}%</p>
					</div>
				</div>
			</div>
		</div>
	)
}
