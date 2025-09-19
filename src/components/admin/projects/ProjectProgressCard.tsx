'use client'

import React from 'react'

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

interface ProjectProgressCardProps {
	activities: ProjectActivity[]
}

export default function ProjectProgressCard({ activities }: ProjectProgressCardProps) {
	const completedActivities = activities.filter((a) => a.status === 'done').length
	const totalActivities = activities.length
	const progressPercentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

	return (
		<div className='bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
			<div className='flex items-center justify-between mb-2'>
				<h3 className='text-sm font-medium text-zinc-900 dark:text-zinc-100'>Progresso Geral</h3>
				<span className='text-sm text-zinc-600 dark:text-zinc-400'>{totalActivities > 0 ? `${completedActivities}/${totalActivities} atividades concluídas` : 'Nenhuma atividade criada'}</span>
			</div>
			<div className='w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2'>
				<div
					className='bg-blue-500 h-2 rounded-full transition-all duration-300'
					style={{
						width: `${progressPercentage}%`,
					}}
				/>
			</div>
			<p className='text-xs text-zinc-500 dark:text-zinc-400 mt-1'>{totalActivities > 0 ? `${progressPercentage}% concluído` : '0% concluído'}</p>
		</div>
	)
}
