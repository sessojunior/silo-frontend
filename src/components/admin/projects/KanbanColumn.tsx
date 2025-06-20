'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import Button from '@/components/ui/Button'
import { Activity } from '@/types/projects'

interface KanbanColumnProps {
	column: {
		id: Activity['status']
		title: string
		color: string
		icon: string
		rules?: {
			maxCards?: number
			allowPriorities?: Activity['priority'][]
			blockIfFull?: boolean
		}
	}
	activities: Activity[]
	isOverLimit: boolean
	onEditActivity: (activity: Activity) => void
	onStatusChange: (activityId: string, newStatus: Activity['status']) => void
	onCreateActivity?: (status: Activity['status']) => void
}

export default function KanbanColumn({ column, activities, isOverLimit, onEditActivity, onStatusChange, onCreateActivity }: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `column-${column.id}`,
	})

	const sortableIds = activities.map((activity) => activity.id)

	return (
		<div className={`flex flex-col w-52 bg-white dark:bg-zinc-900 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${isOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-blue-100' : 'border-zinc-200 dark:border-zinc-700'} ${isOverLimit ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''}`}>
			{/* Header da Coluna - Redesignado */}
			<div
				className='relative p-4 rounded-t-xl'
				style={{
					background: `linear-gradient(135deg, ${column.color}20, ${column.color}10)`,
					borderBottom: `2px solid ${column.color}30`,
				}}
			>
				{/* Título Principal */}
				<div className='flex items-center justify-between mb-3'>
					<div className='flex items-center gap-3'>
						<div className='p-2 rounded-lg' style={{ backgroundColor: `${column.color}20` }}>
							<span className={`${column.icon} size-5`} style={{ color: column.color }} />
						</div>
						<div>
							<h3 className='font-bold text-zinc-900 dark:text-zinc-100 text-sm'>{column.title}</h3>
							<p className='text-xs text-zinc-500 dark:text-zinc-400 mt-0.5'>
								{activities.length} {activities.length === 1 ? 'atividade' : 'atividades'}
							</p>
						</div>
					</div>

					{/* Badge de Status Melhorado */}
					<div className='flex items-center gap-2'>
						<div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isOverLimit ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-200' : activities.length === 0 ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-sm'}`}>
							<span className='font-semibold'>{activities.length}</span>
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
							className={`h-full transition-all duration-500 ease-out rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
							style={{
								width: `${Math.min((activities.length / column.rules.maxCards) * 100, 100)}%`,
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
					{activities.map((activity) => (
						<KanbanCard key={activity.id} activity={activity} onEdit={onEditActivity} />
					))}
				</SortableContext>

				{/* Zona de Drop Vazia Melhorada */}
				{activities.length === 0 && (
					<div className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl transition-all duration-200 ${isOver ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'}`}>
						<div className={`p-3 rounded-full mb-3 transition-all duration-200 ${isOver ? 'bg-blue-100 dark:bg-blue-800/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
							<span
								className={`${column.icon} size-6`}
								style={{
									color: isOver ? '#3b82f6' : column.color,
								}}
							/>
						</div>
						<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400 text-center mb-1'>{isOver ? 'Solte a atividade aqui' : 'Nenhuma atividade'}</p>
						<p className='text-xs text-zinc-500 dark:text-zinc-500 text-center'>{isOver ? 'Será movida para esta coluna' : 'Arraste atividades para cá'}</p>
					</div>
				)}

				{/* Zona de Drop com Itens Melhorada */}
				{activities.length > 0 && isOver && (
					<div className='h-10 border-2 border-dashed border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center shadow-sm'>
						<div className='flex items-center gap-2'>
							<span className='icon-[lucide--move] size-4 text-blue-600 dark:text-blue-400' />
							<span className='text-sm font-medium text-blue-700 dark:text-blue-300'>Solte aqui para mover</span>
						</div>
					</div>
				)}
			</div>

			{/* Footer com Ações Melhorado */}
			<div className='p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-b-xl'>
				<Button onClick={() => onCreateActivity?.(column.id)} className='w-full flex items-center justify-center gap-2 text-sm py-2.5 hover:shadow-sm transition-all duration-200' style='bordered'>
					<span className='icon-[lucide--plus] size-4' />
					Nova tarefa
				</Button>
			</div>
		</div>
	)
}
