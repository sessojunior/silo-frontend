'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import Button from '@/components/ui/Button'
import { Task } from '@/types/projects'

interface KanbanColumnProps {
	column: {
		id: Task['status']
		title: string
		color: string // Nome da cor Tailwind (ex: 'blue', 'red')
		colorShade: string // Shade principal (ex: '500')
		icon: string
		rules?: {
			maxCards?: number
			allowPriorities?: Task['priority'][]
			blockIfFull?: boolean
		}
	}
	tasks: Task[]
	isOverLimit: boolean
	onEditTask: (task: Task) => void
	onCreateTask?: (status: Task['status']) => void
}

export default function KanbanColumn({ column, tasks, isOverLimit, onEditTask, onCreateTask }: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `column-${column.id}`,
	})

	const sortableIds = tasks.map((task) => task.id)

	return (
		<div className={`flex flex-col w-52 bg-white dark:bg-zinc-900 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${isOver ? `border-${column.color}-400 bg-${column.color}-50 dark:bg-${column.color}-900/20 shadow-${column.color}-100` : 'border-zinc-200 dark:border-zinc-700'} ${isOverLimit ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''}`}>
			{/* Header da Coluna - Redesignado */}
			<div className={`relative p-4 rounded-t-xl bg-${column.color}-100 dark:bg-${column.color}-900/20 border-b-2 border-${column.color}-200 dark:border-${column.color}-800`}>
				{/* Título Principal */}
				<div className='flex items-center justify-between mb-3'>
					<div className='flex items-center gap-3'>
						<div className={`p-2 rounded-lg bg-${column.color}-200 dark:bg-${column.color}-800/30`}>
							<span className={`${column.icon} size-5 text-${column.color}-${column.colorShade}`} />
						</div>
						<div>
							<h3 className='font-bold text-zinc-900 dark:text-zinc-100 text-sm'>{column.title}</h3>
							<p className='text-xs text-zinc-500 dark:text-zinc-400 mt-0.5'>
								{tasks.length} {tasks.length === 1 ? 'atividade' : 'atividades'}
							</p>
						</div>
					</div>

					{/* Badge de Status Melhorado */}
					<div className='flex items-center gap-2'>
						<div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isOverLimit ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-200' : tasks.length === 0 ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-sm'}`}>
							<span className='font-semibold'>{tasks.length}</span>
							{column.rules?.maxCards && (
								<>
									<span>/</span>
									<span className='text-zinc-400'>{column.rules.maxCards}</span>
								</>
							)}
						</div>

						{/* Indicador de limite com animação */}
						{isOverLimit && (
							<div className='animate-pulse'>
								<span className='icon-[lucide--alert-triangle] size-4 text-red-500' title='Limite de atividades atingido' />
							</div>
						)}
					</div>
				</div>

				{/* Barra de Progresso Visual */}
				{column.rules?.maxCards && (
					<div className='w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-3'>
						<div
							className={`h-full transition-all duration-500 ease-out rounded-full ${isOverLimit ? 'bg-red-500' : `bg-gradient-to-r from-${column.color}-500 to-${column.color}-600`}`}
							style={{
								width: `${Math.min((tasks.length / column.rules.maxCards) * 100, 100)}%`,
							}}
						/>
					</div>
				)}

				{/* Regras da Coluna Melhoradas */}
				{column.rules && (
					<div className='space-y-2'>
						{column.rules.maxCards && (
							<div className='flex items-center gap-2 px-2 py-1 bg-white/50 dark:bg-zinc-800/50 rounded-md'>
								<span className='icon-[lucide--layers] size-3 text-zinc-600 dark:text-zinc-400' />
								<span className='text-xs text-zinc-600 dark:text-zinc-400'>
									Limite máximo: <span className='font-medium'>{column.rules.maxCards}</span>
								</span>
							</div>
						)}
						{column.rules.allowPriorities && (
							<div className='flex items-center gap-2 px-2 py-1 bg-white/50 dark:bg-zinc-800/50 rounded-md'>
								<span className='icon-[lucide--filter] size-3 text-zinc-600 dark:text-zinc-400' />
								<span className='text-xs text-zinc-600 dark:text-zinc-400'>
									Prioridades:{' '}
									<span className='font-medium'>
										{column.rules.allowPriorities
											.map(
												(p) =>
													({
														low: 'baixa',
														medium: 'média',
														high: 'alta',
														urgent: 'urgente',
													})[p],
											)
											.join(', ')}
									</span>
								</span>
							</div>
						)}
						{column.rules.blockIfFull && (
							<div className='flex items-center gap-2 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-md'>
								<span className='icon-[lucide--lock] size-3 text-amber-600 dark:text-amber-400' />
								<span className='text-xs text-amber-700 dark:text-amber-400 font-medium'>Bloqueio automático quando cheio</span>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Área de Drop + Lista de Atividades */}
			<div ref={setNodeRef} className='flex-1 p-4 min-h-[400px] space-y-3'>
				<SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
					{tasks.map((task) => (
						<KanbanCard key={task.id} task={task} onEdit={onEditTask} />
					))}
				</SortableContext>

				{/* Zona de Drop Vazia Melhorada */}
				{tasks.length === 0 && (
					<div className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl transition-all duration-200 ${isOver ? `border-${column.color}-400 bg-gradient-to-br from-${column.color}-50 to-${column.color}-100 dark:from-${column.color}-900/20 dark:to-${column.color}-800/20` : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'}`}>
						<div className={`p-3 rounded-full mb-3 transition-all duration-200 ${isOver ? `bg-${column.color}-100 dark:bg-${column.color}-800/30` : 'bg-zinc-100 dark:bg-zinc-800'}`}>
							<span className={`${column.icon} size-6 ${isOver ? `text-${column.color}-600` : `text-${column.color}-${column.colorShade}`}`} />
						</div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400 text-center mb-1'>{isOver ? 'Solte a atividade aqui' : 'Nenhuma atividade'}</p>
						<p className='text-xs text-zinc-500 dark:text-zinc-500 text-center'>{isOver ? 'Será movida para esta coluna' : 'Arraste atividades para cá'}</p>
					</div>
				)}

				{/* Zona de Drop com Itens Melhorada */}
				{tasks.length > 0 && isOver && (
					<div className={`h-10 border-2 border-dashed border-${column.color}-400 bg-gradient-to-r from-${column.color}-50 to-${column.color}-100 dark:from-${column.color}-900/20 dark:to-${column.color}-800/20 rounded-xl flex items-center justify-center shadow-sm`}>
						<div className='flex items-center gap-2'>
							<span className='icon-[lucide--move] size-4 text-${column.color}-600 dark:text-${column.color}-400' />
							<span className={`text-sm font-medium text-${column.color}-700 dark:text-${column.color}-300`}>Solte aqui para mover</span>
						</div>
					</div>
				)}
			</div>

			{/* Footer com Ações Melhorado */}
			<div className='p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-b-xl'>
				<Button onClick={() => onCreateTask?.(column.id)} className='w-full flex items-center justify-center gap-2 text-sm py-2.5 hover:shadow-sm transition-all duration-200' style='bordered'>
					<span className='icon-[lucide--plus] size-4' />
					Nova tarefa
				</Button>
			</div>
		</div>
	)
}
