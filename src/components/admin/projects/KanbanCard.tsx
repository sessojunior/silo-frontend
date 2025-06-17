'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Button from '@/components/ui/Button'
import { Activity } from '@/types/projects'

interface KanbanCardProps {
	activity: Activity
	onEdit: (activity: Activity) => void
	onStatusChange: (activityId: string, newStatus: Activity['status']) => void
}

export default function KanbanCard({ activity, onEdit, onStatusChange }: KanbanCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: activity.id,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	// Função para status badge
	const getPriorityBadge = (priority: Activity['priority']) => {
		const priorityStyles = {
			low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
			medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
			high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
			urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		}

		const priorityLabels = {
			low: 'Baixa',
			medium: 'Média',
			high: 'Alta',
			urgent: 'Urgente',
		}

		return <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityStyles[priority]}`}>{priorityLabels[priority]}</span>
	}

	// Formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return null
		return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 cursor-grab transition-all duration-200 hover:shadow-md ${isDragging ? 'opacity-50 shadow-lg' : ''}`}>
			{/* Header do Card */}
			<div className='flex items-start justify-between gap-2 mb-3'>
				<h4 className='font-medium text-zinc-900 dark:text-zinc-100 text-sm leading-tight line-clamp-2'>{activity.name}</h4>

				<Button
					onClick={(e) => {
						e.stopPropagation()
						onEdit(activity)
					}}
					className='flex items-center justify-center size-6 opacity-0 group-hover:opacity-100 transition-opacity'
					style='bordered'
				>
					<span className='icon-[lucide--edit] size-3' />
				</Button>
			</div>

			{/* Descrição */}
			{activity.description && <p className='text-xs text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2'>{activity.description}</p>}

			{/* Prioridade + Categoria */}
			<div className='flex items-center gap-2 mb-3'>
				{getPriorityBadge(activity.priority)}
				{activity.category && <span className='px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full'>{activity.category}</span>}
			</div>

			{/* Barra de Progresso */}
			<div className='mb-3'>
				<div className='flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1'>
					<span>Progresso</span>
					<span>{activity.progress}%</span>
				</div>
				<div className='w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2'>
					<div
						className='h-2 rounded-full transition-all duration-300'
						style={{
							width: `${activity.progress}%`,
							backgroundColor: activity.progress === 100 ? '#10b981' : activity.progress >= 75 ? '#3b82f6' : activity.progress >= 50 ? '#f59e0b' : '#6b7280',
						}}
					/>
				</div>
			</div>

			{/* Datas */}
			{(activity.startDate || activity.endDate) && (
				<div className='flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-3'>
					{activity.startDate && (
						<div className='flex items-center gap-1'>
							<span className='icon-[lucide--calendar] size-3' />
							<span>{formatDate(activity.startDate)}</span>
						</div>
					)}
					{activity.startDate && activity.endDate && <span>→</span>}
					{activity.endDate && (
						<div className='flex items-center gap-1'>
							<span className='icon-[lucide--calendar-check] size-3' />
							<span>{formatDate(activity.endDate)}</span>
						</div>
					)}
				</div>
			)}

			{/* Avatars dos Assignees */}
			{activity.assignees.length > 0 && (
				<div className='flex items-center justify-between'>
					<div className='flex -space-x-2'>
						{activity.assignees.slice(0, 3).map((assignee) => (
							<div key={assignee.userId} className='size-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-medium text-white' title={assignee.user.name}>
								{assignee.user.name
									.split(' ')
									.map((n) => n[0])
									.join('')
									.toUpperCase()
									.slice(0, 2)}
							</div>
						))}
						{activity.assignees.length > 3 && <div className='size-6 rounded-full bg-zinc-400 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-medium text-white'>+{activity.assignees.length - 3}</div>}
					</div>

					{/* Ações Rápidas */}
					<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
						{activity.status !== 'done' && (
							<Button
								onClick={(e) => {
									e.stopPropagation()
									onStatusChange(activity.id, 'done')
								}}
								className='size-6 flex items-center justify-center'
								style='bordered'
								title='Marcar como concluído'
							>
								<span className='icon-[lucide--check] size-3' />
							</Button>
						)}

						{activity.status !== 'blocked' && (
							<Button
								onClick={(e) => {
									e.stopPropagation()
									onStatusChange(activity.id, 'blocked')
								}}
								className='size-6 flex items-center justify-center'
								style='bordered'
								title='Bloquear atividade'
							>
								<span className='icon-[lucide--x] size-3' />
							</Button>
						)}
					</div>
				</div>
			)}

			{/* Empty state se sem assignees */}
			{activity.assignees.length === 0 && (
				<div className='flex items-center justify-between'>
					<span className='text-xs text-zinc-400 dark:text-zinc-500'>Sem responsáveis</span>

					<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
						{activity.status !== 'done' && (
							<Button
								onClick={(e) => {
									e.stopPropagation()
									onStatusChange(activity.id, 'done')
								}}
								className='size-6 flex items-center justify-center'
								style='bordered'
								title='Marcar como concluído'
							>
								<span className='icon-[lucide--check] size-3' />
							</Button>
						)}

						{activity.status !== 'blocked' && (
							<Button
								onClick={(e) => {
									e.stopPropagation()
									onStatusChange(activity.id, 'blocked')
								}}
								className='size-6 flex items-center justify-center'
								style='bordered'
								title='Bloquear atividade'
							>
								<span className='icon-[lucide--x] size-3' />
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
