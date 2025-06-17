'use client'

import React, { useState, useMemo } from 'react'
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragOverEvent, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, UniqueIdentifier } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import KanbanColumn from './KanbanColumn'
import ActivityCard from './ActivityCard'
import Button from '@/components/ui/Button'
import { toast } from '@/lib/toast'

import { Activity } from '@/types/projects'

interface KanbanBoardProps {
	activities: Activity[]
	onActivityMove: (activityId: string, fromStatus: Activity['status'], toStatus: Activity['status']) => void
}

interface KanbanColumn {
	id: Activity['status']
	title: string
	color: string
	icon: string
	limit?: number
	allowedTypes?: string[]
	rules?: {
		maxCards?: number
		allowPriorities?: Activity['priority'][]
		blockIfFull?: boolean
	}
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
	{
		id: 'todo',
		title: 'À Fazer',
		color: '#6b7280',
		icon: 'circle',
		rules: {
			maxCards: 20,
			allowPriorities: ['low', 'medium', 'high', 'urgent'],
		},
	},
	{
		id: 'in_progress',
		title: 'Em Progresso',
		color: '#3b82f6',
		icon: 'play-circle',
		rules: {
			maxCards: 5,
			allowPriorities: ['medium', 'high', 'urgent'],
			blockIfFull: true,
		},
	},
	{
		id: 'review',
		title: 'Em Revisão',
		color: '#f59e0b',
		icon: 'eye',
		rules: {
			maxCards: 3,
			allowPriorities: ['high', 'urgent'],
			blockIfFull: true,
		},
	},
	{
		id: 'done',
		title: 'Concluído',
		color: '#10b981',
		icon: 'check-circle',
		rules: {
			maxCards: 100,
			allowPriorities: ['low', 'medium', 'high', 'urgent'],
		},
	},
	{
		id: 'blocked',
		title: 'Bloqueado',
		color: '#ef4444',
		icon: 'x-circle',
		rules: {
			maxCards: 10,
			allowPriorities: ['medium', 'high', 'urgent'],
		},
	},
]

export default function KanbanBoard({ activities, onActivityMove }: KanbanBoardProps) {
	const [columns, setColumns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS)
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
	const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null)

	// Configurar sensores do DnD
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	// Agrupar atividades por status
	const activitiesByStatus = useMemo(() => {
		return activities.reduce(
			(acc, activity) => {
				if (!acc[activity.status]) {
					acc[activity.status] = []
				}
				acc[activity.status].push(activity)
				return acc
			},
			{} as Record<Activity['status'], Activity[]>,
		)
	}, [activities])

	// Validar se uma atividade pode ser movida para uma coluna
	const canMoveToColumn = (activity: Activity, targetColumnId: Activity['status']): { allowed: boolean; reason?: string } => {
		const targetColumn = columns.find((col) => col.id === targetColumnId)
		if (!targetColumn) return { allowed: false, reason: 'Coluna não encontrada' }

		const activitiesInTarget = activitiesByStatus[targetColumnId] || []
		const rules = targetColumn.rules

		if (!rules) return { allowed: true }

		// Verificar limite de cards
		if (rules.maxCards && activitiesInTarget.length >= rules.maxCards) {
			if (rules.blockIfFull) {
				return { allowed: false, reason: `Coluna "${targetColumn.title}" atingiu o limite de ${rules.maxCards} atividades` }
			}
		}

		// Verificar prioridades permitidas
		if (rules.allowPriorities && !rules.allowPriorities.includes(activity.priority)) {
			const allowedPriorities = rules.allowPriorities.map((p) => ({ low: 'baixa', medium: 'média', high: 'alta', urgent: 'urgente' })[p]).join(', ')
			return { allowed: false, reason: `Coluna "${targetColumn.title}" só aceita prioridades: ${allowedPriorities}` }
		}

		return { allowed: true }
	}

	// Event handlers do DnD
	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event
		setActiveId(active.id)

		const activity = activities.find((a) => a.id === active.id)
		setDraggedActivity(activity || null)

		console.log('🔵 Iniciando drag:', active.id)
	}

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event

		if (!over) return

		const activeActivity = activities.find((a) => a.id === active.id)
		if (!activeActivity) return

		// Determinar coluna de destino
		let targetColumnId: Activity['status']

		if (over.id.toString().startsWith('column-')) {
			// Soltando sobre a coluna
			targetColumnId = over.id.toString().replace('column-', '') as Activity['status']
		} else {
			// Soltando sobre uma atividade - pegar a coluna da atividade
			const targetActivity = activities.find((a) => a.id === over.id)
			if (!targetActivity) return
			targetColumnId = targetActivity.status
		}

		// Verificar se pode mover
		const validation = canMoveToColumn(activeActivity, targetColumnId)
		if (!validation.allowed) {
			console.log('⚠️ Movimento bloqueado:', validation.reason)
			// Mostrar feedback visual (tooltip, border red, etc.)
			return
		}
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		setActiveId(null)
		setDraggedActivity(null)

		if (!over) {
			console.log('🔵 Drag cancelado - sem destino')
			return
		}

		const activeActivity = activities.find((a) => a.id === active.id)
		if (!activeActivity) return

		// Determinar coluna de destino
		let targetColumnId: Activity['status']

		if (over.id.toString().startsWith('column-')) {
			// Soltando sobre a coluna vazia
			targetColumnId = over.id.toString().replace('column-', '') as Activity['status']
		} else {
			// Soltando sobre uma atividade
			const targetActivity = activities.find((a) => a.id === over.id)
			if (!targetActivity) return
			targetColumnId = targetActivity.status
		}

		// Verificar se pode mover
		const validation = canMoveToColumn(activeActivity, targetColumnId)
		if (!validation.allowed) {
			toast({
				type: 'warning',
				title: 'Movimento não permitido',
				description: validation.reason,
			})
			return
		}

		// Se está na mesma coluna, apenas reordenar
		if (activeActivity.status === targetColumnId) {
			console.log('🔵 Reordenando na mesma coluna:', targetColumnId)
			// TODO: Implementar reordenação dentro da coluna se necessário
			return
		}

		// Mover para coluna diferente
		console.log('🔵 Movendo atividade:', activeActivity.id, 'de', activeActivity.status, 'para', targetColumnId)

		try {
			onActivityMove(activeActivity.id, activeActivity.status, targetColumnId)

			toast({
				type: 'success',
				title: 'Atividade movida',
				description: `"${activeActivity.name}" foi movida para "${columns.find((c) => c.id === targetColumnId)?.title}"`,
			})
		} catch (error) {
			console.error('❌ Erro ao mover atividade:', error)
			toast({
				type: 'error',
				title: 'Erro ao mover atividade',
				description: 'Tente novamente',
			})
		}
	}

	const handleEditActivity = (activity: Activity) => {
		console.log('🔵 Editando atividade no Kanban:', activity.name)
		// TODO: Implementar edição
		toast({
			type: 'info',
			title: 'Em desenvolvimento',
			description: 'Edição será implementada na próxima etapa',
		})
	}

	const handleStatusChange = (activityId: string, newStatus: Activity['status']) => {
		const activity = activities.find((a) => a.id === activityId)
		if (!activity) return

		const validation = canMoveToColumn(activity, newStatus)
		if (!validation.allowed) {
			toast({
				type: 'warning',
				title: 'Status não permitido',
				description: validation.reason,
			})
			return
		}

		console.log('🔵 Alterando status via quick action:', activityId, 'para:', newStatus)
		onActivityMove(activityId, activity.status, newStatus)
	}

	const resetColumns = () => {
		setColumns(DEFAULT_COLUMNS)
		toast({
			type: 'success',
			title: 'Colunas restauradas',
			description: 'Configuração padrão das colunas foi restaurada',
		})
	}

	return (
		<div className='space-y-6'>
			{/* Header com Ações */}
			<div className='flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center'>
				<div>
					<h2 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>Kanban do Projeto</h2>
					<p className='text-zinc-600 dark:text-zinc-400'>
						{activities.length} atividades organizadas em {columns.length} colunas
					</p>
				</div>

				<div className='flex items-center gap-2'>
					<Button onClick={resetColumns} style='bordered' className='flex items-center gap-2'>
						<span className='icon-[lucide--refresh-cw] size-4' />
						<span className='hidden sm:inline'>Restaurar colunas</span>
					</Button>

					<Button className='flex items-center gap-2' style='bordered'>
						<span className='icon-[lucide--settings] size-4' />
						<span className='hidden sm:inline'>Configurar</span>
					</Button>
				</div>
			</div>

			{/* Board do Kanban */}
			<DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className='flex gap-4 overflow-x-auto pb-4'>
					{columns.map((column) => {
						const columnActivities = activitiesByStatus[column.id] || []
						const isOverLimit = column.rules?.maxCards && columnActivities.length >= column.rules.maxCards

						return <KanbanColumn key={column.id} column={column} activities={columnActivities} isOverLimit={isOverLimit || false} onEditActivity={handleEditActivity} onStatusChange={handleStatusChange} />
					})}
				</div>

				{/* Overlay para drag */}
				<DragOverlay>
					{activeId && draggedActivity ? (
						<div className='transform rotate-3 opacity-90'>
							<ActivityCard activity={draggedActivity} />
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	)
}
