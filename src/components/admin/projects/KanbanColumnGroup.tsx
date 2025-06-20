'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import Button from '@/components/ui/Button'
import { Activity } from '@/types/projects'

interface SubColumn {
	id: string
	title: string
	type: 'doing' | 'done' | 'final' | 'blocked'
	activities: Activity[]
}

interface KanbanColumnGroupProps {
	group: {
		id: string
		title: string
		color: string
		icon: string
		rules?: {
			maxCards?: number
			allowPriorities?: Activity['priority'][]
			blockIfFull?: boolean
		}
	}
	subColumns: SubColumn[]
	totalActivities: number
	isOverLimit: boolean
	onEditActivity: (activity: Activity) => void
	onCreateActivity?: (status: Activity['status']) => void
}

export default function KanbanColumnGroup({ group, subColumns, totalActivities, isOverLimit, onEditActivity, onCreateActivity }: KanbanColumnGroupProps) {
	// Determinar largura baseada se tem subcolunas ou não
	const hasSubColumns = subColumns.length > 1
	// Para subcolunas: min-w-120 (2 × 60), sem subcolunas: min-w-80
	const widthClass = hasSubColumns ? 'min-w-[30rem]' : 'min-w-80 w-80'

	return (
		<div className={`flex flex-col ${widthClass} bg-white dark:bg-zinc-900 rounded-lg border-2 transition-all duration-200 ${isOverLimit ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-zinc-200 dark:border-zinc-700'}`}>
			{/* Header do Grupo */}
			<div className='p-4 border-b border-zinc-200 dark:border-zinc-700' style={{ backgroundColor: `${group.color}10` }}>
				<div className='flex items-center justify-between'>
					{/* Título + Ícone */}
					<div className='flex items-center gap-3'>
						<div className='flex items-center justify-center gap-2'>
							<span className={`${group.icon} size-6`} style={{ color: group.color }} />
							<h3 className='font-semibold text-zinc-600 dark:text-zinc-100 text-lg'>{group.title}</h3>
						</div>
					</div>

					{/* Contador Total + Status WIP Avançado */}
					<div className='flex items-center gap-2'>
						{group.rules?.maxCards ? (
							<div className='flex items-center gap-2'>
								{/* Contador com barra de progresso */}
								<div className='flex items-center gap-2'>
									{/* Barra de progresso WIP */}
									<div className='w-16 bg-zinc-200 dark:bg-zinc-600 rounded-full h-2'>
										<div className={`h-2 rounded-full transition-all duration-300 ${isOverLimit ? 'bg-red-500' : totalActivities / group.rules.maxCards >= 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (totalActivities / group.rules.maxCards) * 100)}%` }} />
									</div>

									{/* Indicadores WIP */}
									{isOverLimit ? <span className='icon-[lucide--alert-triangle] size-5 text-red-500' title='Limite WIP atingido - novos movimentos bloqueados' /> : totalActivities / group.rules.maxCards >= 0.8 ? <span className='icon-[lucide--alert-circle] size-5 text-yellow-500' title='Próximo ao limite WIP de tarefas' /> : <span className='icon-[lucide--check-circle] size-5 text-green-500' title='Capacidade de tarefas OK' />}

									{/* Contador de tarefas */}
									<span className={`text-sm font-medium pt-1 pb-2 rounded-lg ${isOverLimit ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : totalActivities / group.rules.maxCards >= 0.8 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-transparent text-zinc-600 dark:text-zinc-300'}`}>
										<div className='flex items-end justify-center cursor-default' title='Total e limite de tarefas desta coluna'>
											<span className='text-base'>{totalActivities}</span>/<span className='text-xs'>{group.rules.maxCards}</span>
										</div>
									</span>
								</div>
							</div>
						) : (
							<span className='text-sm font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'>{totalActivities}</span>
						)}
					</div>
				</div>
			</div>

			{/* Sub-colunas Fazendo/Feito - larguras iguais */}
			<div className='flex-1 flex min-h-0'>
				{subColumns.map((subColumn, index) => (
					<SubColumnComponent key={subColumn.id} subColumn={subColumn} isFirst={index === 0} onEditActivity={onEditActivity} onCreateActivity={onCreateActivity} />
				))}
			</div>
		</div>
	)
}

interface SubColumnComponentProps {
	subColumn: SubColumn
	isFirst: boolean
	onEditActivity: (activity: Activity) => void
	onCreateActivity?: (status: Activity['status']) => void
}

function SubColumnComponent({ subColumn, isFirst, onEditActivity, onCreateActivity }: SubColumnComponentProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `column-${subColumn.id}`,
	})

	const sortableIds = subColumn.activities.map((activity) => activity.id)

	// Cores específicas para sub-colunas
	const getSubColumnBg = () => {
		if (subColumn.type === 'doing') return 'bg-orange-50 dark:bg-orange-900/10'
		if (subColumn.type === 'done') return 'bg-green-50 dark:bg-green-900/10'
		if (subColumn.type === 'final') return 'bg-green-50 dark:bg-green-900/10'
		if (subColumn.type === 'blocked') return 'bg-red-50 dark:bg-red-900/10'
		return 'bg-zinc-50 dark:bg-zinc-800'
	}

	const getSubColumnIcon = () => {
		if (subColumn.type === 'doing') return 'icon-[lucide--clock]'
		if (subColumn.type === 'done') return 'icon-[lucide--thumbs-up]'
		if (subColumn.type === 'final') return 'icon-[lucide--trophy]'
		if (subColumn.type === 'blocked') return 'icon-[lucide--ban]'
		return 'circle'
	}

	return (
		<div className={`flex-1 w-24 ${!isFirst ? 'border-l border-zinc-200 dark:border-zinc-700' : ''}`}>
			{/* Header da Sub-coluna */}
			<div className={`p-2 border-b border-zinc-200 dark:border-zinc-700 ${getSubColumnBg()}`}>
				<div className='flex items-center justify-center gap-2'>
					<div className='flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300'>
						<span className={`size-5`} />
						<h4 className={`text-base font-medium`}>{subColumn.title}</h4>
					</div>
					<span className={`flex items-center justify-center text-base font-medium text-zinc-6500 dark:text-zinc-400 size-8 rounded-full`}>{subColumn.activities.length}</span>
				</div>
			</div>

			{/* Ações - apenas na primeira sub-coluna */}
			{isFirst && subColumn.type !== 'final' && subColumn.type !== 'blocked' && (
				<div className='px-3 pt-3'>
					<Button onClick={() => onCreateActivity?.(subColumn.id as Activity['status'])} className='w-full flex items-center justify-center gap-1.5 text-zinc-600 dark:text-zinc-500 text-base py-2' style='bordered'>
						<span className='icon-[lucide--plus-circle] size-5 text-zinc-500 dark:text-zinc-500' />
						Nova tarefa
					</Button>
				</div>
			)}

			{/* Área de Drop + Lista de Atividades */}
			<div ref={setNodeRef} className={`p-3 min-h-[300px] space-y-2 transition-colors ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
				<SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
					{subColumn.activities.map((activity) => (
						<KanbanCard key={activity.id} activity={activity} onEdit={onEditActivity} />
					))}
				</SortableContext>

				{/* Zona de Drop Vazia */}
				{subColumn.activities.length === 0 && (
					<div className={`flex flex-col items-center justify-center h-24 text-zinc-400 dark:text-zinc-600 border-2 border-dashed rounded-lg transition-colors ${isOver ? 'border-blue-400 bg-blue-100 dark:bg-blue-900/30' : 'border-zinc-200 dark:border-zinc-600'}`}>
						<span className={`${getSubColumnIcon()} size-5 mb-0.5`} style={{ color: isOver ? '#3b82f6' : '#9ca3af' }} />
						<p className='text-sm text-center'>{isOver ? 'Solte aqui' : 'Vazio'}</p>
					</div>
				)}

				{/* Zona de Drop com Itens */}
				{subColumn.activities.length > 0 && isOver && (
					<div className='h-6 border-2 border-dashed border-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
						<span className='text-xs text-blue-600 dark:text-blue-400'>Solte aqui</span>
					</div>
				)}
			</div>
		</div>
	)
}
