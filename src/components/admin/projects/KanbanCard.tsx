'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Button from '@/components/ui/Button'
import { Task } from '@/types/projects'

interface KanbanCardProps {
	task: Task
	onEdit: (task: Task) => void
}

export default function KanbanCard({ task, onEdit }: KanbanCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.id,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	// Função para status badge
	const getPriorityBadge = (priority: Task['priority']) => {
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

		return <span className={`px-2 py-1 text-xs uppercase font-medium rounded-md ${priorityStyles[priority]}`}>{priorityLabels[priority]}</span>
	}

	// Formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return null
		return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`group bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 cursor-grab transition-all duration-200 hover:shadow-md ${isDragging ? 'opacity-50 shadow-lg' : ''} relative`}>
			<div className='flex items-center justify-between mb-3'>
				{/* Prioridade */}
				{getPriorityBadge(task.priority)}
			</div>

			{/* Título da Tarefa */}
			<h4 className='font-medium text-zinc-900 dark:text-zinc-100 text-base leading-tight line-clamp-2 mb-3' title={task.name}>
				{task.name}
			</h4>

			{/* Descrição */}
			{task.description && (
				<p className='text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-4' title={task.description}>
					{task.description}
				</p>
			)}

			{/* Categoria */}
			{task.category && (
				<div className='flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-600 mb-3'>
					<span className='uppercase px-2 py-1 bg-zinc-100 text-zinc-400 dark:text-zinc-600 rounded-md'>{task.category}</span>
				</div>
			)}

			{/* Datas */}
			{task.startDate && task.endDate && (
				<div className='flex items-center gap-1 text-sm text-zinc-400 dark:text-zinc-600 mb-3'>
					<span className='icon-[lucide--calendar] size-4 ml-0.5' />
					<span>{formatDate(task.startDate)}</span>
					<span className='icon-[lucide--arrow-right] size-3 mt-px'></span>
					<span>{formatDate(task.endDate)}</span>
				</div>
			)}

			<div className='flex items-center justify-between ml-0.5'>
				{/* Responsáveis */}
				{task.assignees.length > 0 ? (
					<div className='flex -space-x-2'>
						{task.assignees.slice(0, 3).map((assignee) => (
							<div key={assignee.userId} className='size-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-medium text-white' title={assignee.user.name}>
								{assignee.user.name
									.split(' ')
									.map((n) => n[0])
									.join('')
									.toUpperCase()
									.slice(0, 2)}
							</div>
						))}
						{task.assignees.length > 3 && <div className='size-8 rounded-full bg-zinc-400 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-medium text-white'>+{task.assignees.length - 3}</div>}
					</div>
				) : (
					<div>
						<span className='text-sm text-zinc-400 dark:text-zinc-500'>Sem responsáveis</span>
					</div>
				)}

				{/* Botão de Editar no canto inferior direito */}
				<Button
					onClick={(e) => {
						e.stopPropagation()
						onEdit(task)
					}}
					className='flex items-center justify-center rounded-full shrink-0 size-8 px-0 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white'
					title='Editar tarefa'
				>
					<span className='icon-[lucide--edit] size-3 shrink-0' />
				</Button>
			</div>
		</div>
	)
}
