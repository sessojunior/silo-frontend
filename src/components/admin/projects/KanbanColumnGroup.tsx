'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import Button from '@/components/ui/Button'
import { Task } from '@/types/projects'

interface SubColumn {
	id: string
	title: string
	type: 'doing' | 'done' | 'final' | 'blocked'
	tasks: Task[]
}

interface KanbanColumnGroupProps {
	group: {
		id: string
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
	subColumns: SubColumn[]
	totalActivities: number
	isOverLimit: boolean
	onEditTask: (task: Task) => void
	onCreateTask?: (status: Task['status']) => void
}

export default function KanbanColumnGroup({ group, subColumns, totalActivities, isOverLimit, onEditTask, onCreateTask }: KanbanColumnGroupProps) {
	// Determinar largura baseada se tem subcolunas ou não
	const hasSubColumns = subColumns.length > 1
	// Para subcolunas: min-w-120 (2 × 60), sem subcolunas: min-w-80
	const widthClass = hasSubColumns ? 'min-w-[30rem]' : 'min-w-80 w-80'

	// Mapeamento estático das cores para o Tailwind CSS
	const colorClasses = {
		gray: {
			border: 'border-stone-200 dark:border-stone-700',
			headerBg: 'bg-stone-200 dark:bg-stone-900/30',
			textColor: 'text-stone-500',
			bgIcon: 'bg-stone-200',
			subDoingBg: 'bg-stone-100 dark:bg-stone-900/15',
			subDoneBg: 'bg-stone-100 dark:bg-stone-900/25',
			contentBg: 'bg-stone-50/50 dark:bg-stone-900/10',
			hoverBg: 'bg-stone-100 dark:bg-stone-900/25',
			dropBorder: 'border-stone-400',
			dropBg: 'bg-stone-100 dark:bg-stone-900/30',
			dropText: 'text-stone-600 dark:text-stone-400',
		},
		blue: {
			border: 'border-blue-200 dark:border-blue-700',
			headerBg: 'bg-blue-200 dark:bg-blue-900/30',
			textColor: 'text-blue-500',
			bgIcon: 'bg-blue-200',
			subDoingBg: 'bg-blue-100 dark:bg-blue-900/15',
			subDoneBg: 'bg-blue-100 dark:bg-blue-900/25',
			contentBg: 'bg-blue-50/50 dark:bg-blue-900/10',
			hoverBg: 'bg-blue-100 dark:bg-blue-900/25',
			dropBorder: 'border-blue-400',
			dropBg: 'bg-blue-100 dark:bg-blue-900/30',
			dropText: 'text-blue-600 dark:text-blue-400',
		},
		red: {
			border: 'border-red-200 dark:border-red-700',
			headerBg: 'bg-red-200 dark:bg-red-900/30',
			textColor: 'text-red-500',
			bgIcon: 'bg-red-200',
			subDoingBg: 'bg-red-100 dark:bg-red-900/15',
			subDoneBg: 'bg-red-100 dark:bg-red-900/25',
			contentBg: 'bg-red-50/50 dark:bg-red-900/10',
			hoverBg: 'bg-red-100 dark:bg-red-900/25',
			dropBorder: 'border-red-400',
			dropBg: 'bg-red-100 dark:bg-red-900/30',
			dropText: 'text-red-600 dark:text-red-400',
		},
		amber: {
			border: 'border-amber-200 dark:border-amber-700',
			headerBg: 'bg-amber-200 dark:bg-amber-900/30',
			textColor: 'text-amber-500',
			bgIcon: 'bg-amber-200',
			subDoingBg: 'bg-amber-100 dark:bg-amber-900/15',
			subDoneBg: 'bg-amber-100 dark:bg-amber-900/25',
			contentBg: 'bg-amber-50/50 dark:bg-amber-900/10',
			hoverBg: 'bg-amber-100 dark:bg-amber-900/25',
			dropBorder: 'border-amber-400',
			dropBg: 'bg-amber-100 dark:bg-amber-900/30',
			dropText: 'text-amber-600 dark:text-amber-400',
		},
		emerald: {
			border: 'border-emerald-200 dark:border-emerald-700',
			headerBg: 'bg-emerald-200 dark:bg-emerald-900/30',
			textColor: 'text-emerald-500',
			bgIcon: 'bg-emerald-200',
			subDoingBg: 'bg-emerald-100 dark:bg-emerald-900/15',
			subDoneBg: 'bg-emerald-100 dark:bg-emerald-900/25',
			contentBg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
			hoverBg: 'bg-emerald-100 dark:bg-emerald-900/25',
			dropBorder: 'border-emerald-400',
			dropBg: 'bg-emerald-100 dark:bg-emerald-900/30',
			dropText: 'text-emerald-600 dark:text-emerald-400',
		},
	}

	// Obter classes de cor para a coluna atual
	const currentColorClasses = colorClasses[group.color as keyof typeof colorClasses] || colorClasses.gray

	return (
		<div className={`flex flex-col ${widthClass} bg-white dark:bg-zinc-900 rounded-lg border-2 transition-all duration-200 ${isOverLimit ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : currentColorClasses.border}`}>
			{/* Header do Grupo */}
			<div className={`p-4 rounded-t-lg ${currentColorClasses.headerBg}`}>
				<div className='flex items-center justify-between'>
					{/* Título + Ícone */}
					<div className='flex items-center gap-3'>
						<div className='flex items-center justify-center gap-2'>
							<span className={`${group.icon} size-6 ${currentColorClasses.textColor}`} />
							<h3 className={`font-semibold dark:text-zinc-100 text-lg ${currentColorClasses.textColor}`}>{group.title}</h3>
						</div>
					</div>

					{/* Contador Total + Status WIP Avançado */}
					<div className='flex items-center gap-2'>
						{group.rules?.maxCards ? (
							<div className='flex items-center gap-2'>
								{/* Contador com barra de progresso */}
								<div className='flex items-center gap-2'>
									{/* Barra de progresso WIP */}
									<div className='w-16 bg-white dark:bg-zinc-900 rounded-full h-2'>
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
					<SubColumnComponent key={subColumn.id} subColumn={subColumn} currentColorClasses={currentColorClasses} isFirst={index === 0} onEditTask={onEditTask} onCreateTask={onCreateTask} />
				))}
			</div>
		</div>
	)
}

interface SubColumnComponentProps {
	subColumn: SubColumn
	currentColorClasses: {
		border: string
		headerBg: string
		textColor: string
		bgIcon: string
		subDoingBg: string
		subDoneBg: string
		contentBg: string
		hoverBg: string
		dropBorder: string
		dropBg: string
		dropText: string
	}
	isFirst: boolean
	onEditTask: (task: Task) => void
	onCreateTask?: (status: Task['status']) => void
}

function SubColumnComponent({ subColumn, currentColorClasses, isFirst, onEditTask, onCreateTask }: SubColumnComponentProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `column-${subColumn.id}`,
	})

	const sortableIds = subColumn.tasks.map((task) => task.id)

	// Cores específicas para sub-colunas baseadas na cor da coluna principal
	const getSubColumnBg = () => {
		if (subColumn.type === 'doing') return currentColorClasses.subDoingBg
		if (subColumn.type === 'done') return currentColorClasses.subDoneBg
		if (subColumn.type === 'final') return currentColorClasses.subDoneBg
		if (subColumn.type === 'blocked') return currentColorClasses.subDoneBg
		return 'bg-zinc-50 dark:bg-zinc-800'
	}

	// Cor de fundo do conteúdo da subcoluna (bem clara)
	const getSubColumnContentBg = () => {
		if (subColumn.type === 'blocked') return 'bg-red-50 dark:bg-red-900/10'
		return currentColorClasses.contentBg
	}

	const getSubColumnIcon = () => {
		if (subColumn.type === 'doing') return 'icon-[lucide--clock]'
		if (subColumn.type === 'done') return 'icon-[lucide--thumbs-up]'
		if (subColumn.type === 'final') return 'icon-[lucide--trophy]'
		if (subColumn.type === 'blocked') return 'icon-[lucide--ban]'
		return 'circle'
	}

	return (
		<div className={`flex flex-col flex-1 w-24 ${!isFirst ? `border-l ${currentColorClasses.border}` : ''}`}>
			{/* Header da Sub-coluna */}
			<div className={`p-2 border-b border-zinc-200 dark:border-zinc-700 ${getSubColumnBg()}`}>
				<div className='flex items-center justify-center gap-2'>
					<div className='flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300'>
						<h4 className={`text-base font-medium ${currentColorClasses.textColor}`}>{subColumn.title}</h4>
					</div>
					<span className={`flex items-center justify-center text-base font-medium size-8 rounded-full ${currentColorClasses.textColor} ${currentColorClasses.bgIcon}`}>{subColumn.tasks.length}</span>
				</div>
			</div>

			{/* Ações - apenas na primeira sub-coluna */}
			{isFirst && subColumn.type !== 'final' && subColumn.type !== 'blocked' && (
				<div className='px-3 pt-3'>
					<Button onClick={() => onCreateTask?.(subColumn.id as Task['status'])} className='w-full flex items-center justify-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-500 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-500 text-base py-2' style='bordered'>
						<span className='icon-[lucide--plus-circle] size-5 text-zinc-500 dark:text-zinc-500' />
						Nova tarefa
					</Button>
				</div>
			)}

			{/* Área de Drop + Lista de Atividades */}
			<div ref={setNodeRef} className={`p-3 min-h-[300px] flex flex-col flex-1 rounded-b-lg space-y-2 transition-colors ${subColumn.type === 'done' ? getSubColumnContentBg() : 'bg-white dark:bg-zinc-900'} ${isOver ? currentColorClasses.hoverBg : ''}`}>
				<SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
					{subColumn.tasks.map((task) => (
						<KanbanCard key={task.id} task={task} onEdit={onEditTask} />
					))}
				</SortableContext>

				{/* Zona de Drop Vazia */}
				{subColumn.tasks.length === 0 && (
					<div className={`flex flex-col items-center justify-center h-24 text-zinc-400 dark:text-zinc-600 border-2 border-dashed bg-white dark:bg-zinc-900 rounded-lg transition-colors ${isOver ? `${currentColorClasses.dropBorder} ${currentColorClasses.dropBg}` : 'border-zinc-200 dark:border-zinc-600'}`}>
						<span className={`${getSubColumnIcon()} size-5 mb-0.5`} style={{ color: isOver ? '#3b82f6' : '#9ca3af' }} />
						<p className='text-sm text-center'>{isOver ? 'Solte aqui' : 'Vazio'}</p>
					</div>
				)}

				{/* Zona de Drop com Itens */}
				{subColumn.tasks.length > 0 && isOver && (
					<div className={`h-6 border-2 border-dashed ${currentColorClasses.dropBorder} ${currentColorClasses.dropBg} rounded-lg flex items-center justify-center`}>
						<span className={`text-xs ${currentColorClasses.dropText}`}>Solte aqui</span>
					</div>
				)}
			</div>
		</div>
	)
}
