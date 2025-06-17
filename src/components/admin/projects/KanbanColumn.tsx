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
		<div className={`flex flex-col w-48 bg-zinc-50 dark:bg-zinc-800 rounded-lg border-2 transition-all duration-200 ${isOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-700'} ${isOverLimit ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''}`}>
			{/* Header da Coluna */}
			<div className='p-4 border-b border-zinc-200 dark:border-zinc-700' style={{ backgroundColor: `${column.color}10` }}>
				<div className='flex items-center justify-between'>
					{/* Título + Ícone */}
					<div className='flex items-center gap-3'>
						<div className='flex items-center gap-2'>
							<span className={`icon-[lucide--${column.icon}] size-5`} style={{ color: column.color }} />
							<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>{column.title}</h3>
						</div>
					</div>

					{/* Contador + Status */}
					<div className='flex items-center gap-2'>
						<span className={`text-sm font-medium px-2 py-1 rounded-full ${isOverLimit ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
							{activities.length}
							{column.rules?.maxCards && `/${column.rules.maxCards}`}
						</span>

						{/* Indicador de limite */}
						{isOverLimit && <span className='icon-[lucide--alert-triangle] size-4 text-red-500' title='Limite de atividades atingido' />}
					</div>
				</div>

				{/* Regras da Coluna */}
				{column.rules && (
					<div className='mt-2 space-y-1'>
						{column.rules.maxCards && (
							<div className='text-xs text-zinc-500 dark:text-zinc-400'>
								<span className='icon-[lucide--layers] size-3 inline mr-1' />
								Limite: {column.rules.maxCards} atividades
							</div>
						)}
						{column.rules.allowPriorities && (
							<div className='text-xs text-zinc-500 dark:text-zinc-400'>
								<span className='icon-[lucide--filter] size-3 inline mr-1' />
								Prioridades: {column.rules.allowPriorities.map((p) => ({ low: 'baixa', medium: 'média', high: 'alta', urgent: 'urgente' })[p]).join(', ')}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Área de Drop + Lista de Atividades */}
			<div ref={setNodeRef} className='flex-1 p-4 min-h-[400px] space-y-3'>
				<SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
					{activities.map((activity) => (
						<KanbanCard key={activity.id} activity={activity} onEdit={onEditActivity} onStatusChange={onStatusChange} />
					))}
				</SortableContext>

				{/* Zona de Drop Vazia */}
				{activities.length === 0 && (
					<div className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg transition-colors ${isOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-300 dark:border-zinc-600'}`}>
						<span className={`icon-[lucide--${column.icon}] size-8 mb-2`} style={{ color: isOver ? '#3b82f6' : '#9ca3af' }} />
						<p className='text-sm text-zinc-500 dark:text-zinc-400 text-center'>{isOver ? 'Solte aqui' : 'Arraste atividades para cá'}</p>
					</div>
				)}

				{/* Zona de Drop com Itens */}
				{activities.length > 0 && isOver && (
					<div className='h-8 border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center'>
						<span className='text-xs text-blue-600 dark:text-blue-400'>Solte aqui</span>
					</div>
				)}
			</div>

			{/* Footer com Ações */}
			<div className='p-3 border-t border-zinc-200 dark:border-zinc-700'>
				<Button onClick={() => onCreateActivity?.(column.id)} className='w-full flex items-center justify-center gap-2 text-sm py-2' style='bordered'>
					<span className='icon-[lucide--plus] size-4' />
					Nova atividade
				</Button>
			</div>
		</div>
	)
}
