'use client'

interface ProjectActivity {
	id: string
	projectId: string
	name: string
	description: string
	category: string | null
	estimatedDays: number | null
	startDate: string | null
	endDate: string | null
	priority: 'low' | 'medium' | 'high' | 'urgent'
	status: 'todo' | 'progress' | 'done' | 'blocked'
	createdAt: Date
	updatedAt: Date
}

interface ActivityStatsCardsProps {
	activities: ProjectActivity[]
}

// Função para calcular estatísticas das atividades
function calculateActivityStats(activities: ProjectActivity[]) {
	const total = activities.length
	const todo = activities.filter((a) => a.status === 'todo').length
	const progress = activities.filter((a) => a.status === 'progress').length
	const done = activities.filter((a) => a.status === 'done').length
	const blocked = activities.filter((a) => a.status === 'blocked').length

	// Calcular progresso geral baseado nos status
	const completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0

	return {
		total,
		todo,
		progress,
		done,
		blocked,
		completionPercentage,
	}
}

export default function ActivityStatsCards({ activities }: ActivityStatsCardsProps) {
	const stats = calculateActivityStats(activities)

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
			{/* Card 1: Total de Atividades */}
			<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
				<div className='flex items-center gap-2'>
					<span className='icon-[lucide--list-checks] size-5 text-blue-600' />
					<div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Total de Atividades</p>
						<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.total}</p>
					</div>
				</div>
			</div>

			{/* Card 2: Em Progresso */}
			<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
				<div className='flex items-center gap-2'>
					<span className='icon-[lucide--clock] size-5 text-orange-600' />
					<div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Em Progresso</p>
						<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.progress}</p>
					</div>
				</div>
			</div>

			{/* Card 3: Concluídas */}
			<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
				<div className='flex items-center gap-2'>
					<span className='icon-[lucide--check-circle] size-5 text-green-600' />
					<div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Concluídas</p>
						<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.done}</p>
					</div>
				</div>
			</div>

			{/* Card 4: Progresso Geral */}
			<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
				<div className='flex items-center gap-2'>
					<span className='icon-[lucide--trending-up] size-5 text-purple-600' />
					<div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Progresso Geral</p>
						<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.completionPercentage}%</p>
					</div>
				</div>
			</div>
		</div>
	)
}
