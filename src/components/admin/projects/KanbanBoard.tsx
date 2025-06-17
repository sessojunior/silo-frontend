'use client'

import React, { useState, useMemo } from 'react'
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragOverEvent, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, UniqueIdentifier } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import KanbanColumnGroup from './KanbanColumnGroup'
import ActivityCard from './ActivityCard'
import Button from '@/components/ui/Button'
import { toast } from '@/lib/toast'

import { Activity, Project } from '@/types/projects'

interface KanbanBoardProps {
	activities: Activity[]
	project?: Project
	selectedActivity?: Activity
	onActivityMove: (activityId: string, fromStatus: Activity['status'], toStatus: Activity['status']) => void
	onCreateActivity?: () => void
	onEditActivity?: (activity: Activity) => void
	onConfigureKanban?: () => void
}

// Definir grupos de colunas com sub-colunas - Bloqueado reordenado após Em Progresso
const COLUMN_GROUPS = [
	{
		id: 'todo',
		title: 'A Fazer',
		color: '#6b7280',
		icon: 'circle',
		subColumns: [
			{ id: 'todo_doing', title: 'Fazendo', type: 'doing' as const },
			{ id: 'todo_done', title: 'Feito', type: 'done' as const },
		],
		rules: {
			maxCards: 20,
			allowPriorities: ['low', 'medium', 'high', 'urgent'] as Activity['priority'][],
		},
	},
	{
		id: 'in_progress',
		title: 'Em Progresso',
		color: '#3b82f6',
		icon: 'play-circle',
		subColumns: [
			{ id: 'in_progress_doing', title: 'Fazendo', type: 'doing' as const },
			{ id: 'in_progress_done', title: 'Feito', type: 'done' as const },
		],
		rules: {
			maxCards: 5,
			allowPriorities: ['medium', 'high', 'urgent'] as Activity['priority'][],
			blockIfFull: true,
		},
	},
	{
		id: 'blocked',
		title: 'Bloqueado',
		color: '#ef4444',
		icon: 'x-circle',
		subColumns: [{ id: 'blocked', title: 'Impedidas', type: 'blocked' as const }],
		rules: {
			maxCards: 10,
			allowPriorities: ['medium', 'high', 'urgent'] as Activity['priority'][],
		},
	},
	{
		id: 'review',
		title: 'Em Revisão',
		color: '#f59e0b',
		icon: 'eye',
		subColumns: [
			{ id: 'review_doing', title: 'Fazendo', type: 'doing' as const },
			{ id: 'review_done', title: 'Feito', type: 'done' as const },
		],
		rules: {
			maxCards: 3,
			allowPriorities: ['high', 'urgent'] as Activity['priority'][],
			blockIfFull: true,
		},
	},
	{
		id: 'done',
		title: 'Concluído',
		color: '#10b981',
		icon: 'check-circle',
		subColumns: [{ id: 'done', title: 'Finalizadas', type: 'final' as const }],
		rules: {
			maxCards: 100,
			allowPriorities: ['low', 'medium', 'high', 'urgent'] as Activity['priority'][],
		},
	},
]

export default function KanbanBoard({ activities, selectedActivity, onActivityMove, onCreateActivity, onEditActivity }: KanbanBoardProps) {
	const [columnGroups] = useState(COLUMN_GROUPS)
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

	// Validar se uma atividade pode ser movida para uma coluna com regras WIP avançadas
	const canMoveToColumn = (activity: Activity, targetColumnId: Activity['status']): { allowed: boolean; reason?: string; warningType?: 'limit' | 'priority' | 'blocked' } => {
		// Encontrar o grupo que contém a coluna de destino
		const targetGroup = columnGroups.find((group) => group.subColumns.some((subCol) => subCol.id === targetColumnId))

		if (!targetGroup) return { allowed: false, reason: 'Grupo não encontrado' }

		// Calcular atividades no grupo inteiro
		const groupActivities = targetGroup.subColumns.reduce((sum, subCol) => {
			return sum + (activitiesByStatus[subCol.id as Activity['status']] || []).length
		}, 0)

		const rules = targetGroup.rules

		if (!rules) return { allowed: true }

		// Verificar limite de cards do grupo
		if (rules.maxCards && groupActivities >= rules.maxCards) {
			if (rules.blockIfFull) {
				return {
					allowed: false,
					reason: `Grupo "${targetGroup.title}" atingiu o limite de ${rules.maxCards} atividades. Movimento bloqueado.`,
					warningType: 'blocked',
				}
			} else {
				// Apenas aviso se não está bloqueado
				return {
					allowed: true,
					reason: `⚠️ Grupo "${targetGroup.title}" está no limite (${groupActivities}/${rules.maxCards})`,
					warningType: 'limit',
				}
			}
		}

		// Verificar prioridades permitidas
		if (rules.allowPriorities && !rules.allowPriorities.includes(activity.priority)) {
			const allowedPriorities = rules.allowPriorities.map((p) => ({ low: 'baixa', medium: 'média', high: 'alta', urgent: 'urgente' })[p]).join(', ')
			return {
				allowed: false,
				reason: `Grupo "${targetGroup.title}" só aceita prioridades: ${allowedPriorities}`,
				warningType: 'priority',
			}
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

		// Verificar se pode mover com validações WIP avançadas
		const validation = canMoveToColumn(activeActivity, targetColumnId)
		if (!validation.allowed && validation.warningType === 'blocked') {
			console.log('⚠️ Movimento WIP bloqueado:', validation.reason)
			// TODO: Mostrar feedback visual vermelho
			return
		} else if (validation.warningType === 'limit') {
			console.log('⚠️ Aviso WIP limite:', validation.reason)
			// TODO: Mostrar feedback visual amarelo
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

		// Verificar se pode mover com validações WIP avançadas
		const validation = canMoveToColumn(activeActivity, targetColumnId)
		if (!validation.allowed) {
			// Toast diferenciado por tipo de erro
			const toastType = validation.warningType === 'blocked' ? 'error' : 'warning'
			const title = validation.warningType === 'blocked' ? '🚫 Movimento Bloqueado' : validation.warningType === 'priority' ? '⚠️ Prioridade Inválida' : '⚠️ Movimento não permitido'

			toast({
				type: toastType,
				title: title,
				description: validation.reason || 'Verifique as regras do grupo',
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

			// Toast de sucesso diferenciado por situação WIP
			const targetGroupName = columnGroups.find((group) => group.subColumns.some((subCol) => subCol.id === targetColumnId))?.title || 'Grupo'

			if (validation.warningType === 'limit') {
				toast({
					type: 'warning',
					title: '⚠️ Atividade movida com aviso',
					description: `"${activeActivity.name}" foi movida para "${targetGroupName}". ${validation.reason}`,
				})
			} else {
				toast({
					type: 'success',
					title: '✅ Atividade movida',
					description: `"${activeActivity.name}" foi movida para "${targetGroupName}"`,
				})
			}
		} catch (error) {
			console.error('❌ Erro ao mover atividade:', error)
			toast({
				type: 'error',
				title: '❌ Erro ao mover atividade',
				description: 'Tente novamente',
			})
		}
	}

	const handleEditActivityInternal = (activity: Activity) => {
		if (onEditActivity) {
			onEditActivity(activity)
		} else {
			console.log('🔵 Editando atividade no Kanban:', activity.name)
			toast({
				type: 'info',
				title: 'Em desenvolvimento',
				description: 'Edição será implementada na próxima etapa',
			})
		}
	}

	const handleStatusChange = (activityId: string, newStatus: Activity['status']) => {
		const activity = activities.find((a) => a.id === activityId)
		if (!activity) return

		const validation = canMoveToColumn(activity, newStatus)
		if (!validation.allowed) {
			// Toast diferenciado por tipo de erro
			const toastType = validation.warningType === 'blocked' ? 'error' : 'warning'
			const title = validation.warningType === 'blocked' ? '🚫 Status Bloqueado' : validation.warningType === 'priority' ? '⚠️ Prioridade Inválida' : '⚠️ Status não permitido'

			toast({
				type: toastType,
				title: title,
				description: validation.reason || 'Verifique as regras do grupo',
			})
			return
		}

		console.log('🔵 Alterando status via quick action:', activityId, 'para:', newStatus)

		// Toast de sucesso com aviso se necessário
		const targetGroupName = columnGroups.find((group) => group.subColumns.some((subCol) => subCol.id === newStatus))?.title || 'Grupo'

		onActivityMove(activityId, activity.status, newStatus)

		if (validation.warningType === 'limit') {
			toast({
				type: 'warning',
				title: '⚠️ Status alterado com aviso',
				description: `"${activity.name}" movida para "${targetGroupName}". ${validation.reason}`,
			})
		} else {
			toast({
				type: 'success',
				title: '✅ Status alterado',
				description: `"${activity.name}" movida para "${targetGroupName}"`,
			})
		}
	}

	// Função para formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Não definida'
		return new Date(dateString).toLocaleDateString('pt-BR')
	}

	// Função para status badge
	const getStatusBadge = (status: Activity['status']) => {
		const statusStyles = {
			todo: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
			todo_doing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
			todo_done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
			in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
			in_progress_doing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
			in_progress_done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
			review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
			review_doing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
			review_done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
			done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
			blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		}

		const statusLabels = {
			todo: 'A Fazer',
			todo_doing: 'A Fazer - Fazendo',
			todo_done: 'A Fazer - Feito',
			in_progress: 'Em Progresso',
			in_progress_doing: 'Em Progresso - Fazendo',
			in_progress_done: 'Em Progresso - Feito',
			review: 'Em Revisão',
			review_doing: 'Em Revisão - Fazendo',
			review_done: 'Em Revisão - Feito',
			done: 'Concluído',
			blocked: 'Bloqueado',
		}

		return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.todo}`}>{statusLabels[status] || 'Desconhecido'}</span>
	}

	// Função para priority badge
	const getPriorityBadge = (priority: Activity['priority']) => {
		const priorityStyles = {
			low: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
			medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
			high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
			urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		}

		const priorityLabels = {
			low: '⬇️ Baixa',
			medium: '➡️ Média',
			high: '⬆️ Alta',
			urgent: '🚨 Urgente',
		}

		return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[priority]}`}>{priorityLabels[priority]}</span>
	}

	return (
		<div className='space-y-6'>
			{/* Header com Informações da Atividade (se selecionada) */}
			{selectedActivity && (
				<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6'>
					<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
						{/* Informações da Atividade */}
						<div className='flex items-center gap-4 min-w-0 flex-1'>
							{/* Ícone da Atividade */}
							<div className='size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
								<span className='icon-[lucide--activity] size-6 text-blue-600 dark:text-blue-400' />
							</div>

							{/* Detalhes */}
							<div className='min-w-0 flex-1'>
								<div className='flex items-center gap-3 mb-2'>
									<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate'>{selectedActivity.name}</h3>
									{getStatusBadge(selectedActivity.status)}
									{getPriorityBadge(selectedActivity.priority)}
								</div>
								{selectedActivity.description && <p className='text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2'>{selectedActivity.description}</p>}

								{/* Métricas da Atividade */}
								<div className='flex flex-wrap items-center gap-4 text-sm'>
									{/* Progresso */}
									<div className='flex items-center gap-2'>
										<span className='text-zinc-500 dark:text-zinc-400'>Progresso:</span>
										<div className='flex items-center gap-2'>
											<div className='w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5'>
												<div className='bg-blue-500 h-1.5 rounded-full transition-all duration-500' style={{ width: `${selectedActivity.progress}%` }} />
											</div>
											<span className='font-medium text-zinc-900 dark:text-zinc-100'>{selectedActivity.progress}%</span>
										</div>
									</div>

									{/* Categoria */}
									{selectedActivity.category && (
										<div className='flex items-center gap-2'>
											<span className='text-zinc-500 dark:text-zinc-400'>Categoria:</span>
											<span className='font-medium text-zinc-900 dark:text-zinc-100'>{selectedActivity.category}</span>
										</div>
									)}

									{/* Datas */}
									<div className='flex items-center gap-2'>
										<span className='text-zinc-500 dark:text-zinc-400'>Período:</span>
										<span className='font-medium text-zinc-900 dark:text-zinc-100'>
											{formatDate(selectedActivity.startDate)} → {formatDate(selectedActivity.endDate)}
										</span>
									</div>

									{/* Horas Estimadas */}
									{selectedActivity.estimatedHours && (
										<div className='flex items-center gap-2'>
											<span className='text-zinc-500 dark:text-zinc-400'>Estimativa:</span>
											<span className='font-medium text-zinc-900 dark:text-zinc-100'>{selectedActivity.estimatedHours}h</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Ações da Atividade */}
						<div className='flex items-center gap-2 flex-shrink-0'>
							<Button onClick={() => onEditActivity?.(selectedActivity)} className='flex items-center gap-2' style='bordered'>
								<span className='icon-[lucide--edit] size-4' />
								<span className='hidden sm:inline'>Editar atividade</span>
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Board do Kanban com larguras fixas */}
			<DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className='flex gap-4'>
					{columnGroups.map((group) => {
						// Preparar sub-colunas com atividades
						const subColumnsWithActivities = group.subColumns.map((subCol) => ({
							...subCol,
							activities: activitiesByStatus[subCol.id as Activity['status']] || [],
						}))

						// Calcular total de atividades do grupo
						const totalActivities = subColumnsWithActivities.reduce((sum, subCol) => sum + subCol.activities.length, 0)
						const isOverLimit = group.rules?.maxCards && totalActivities >= group.rules.maxCards

						return (
							<KanbanColumnGroup
								key={group.id}
								group={group}
								subColumns={subColumnsWithActivities}
								totalActivities={totalActivities}
								isOverLimit={isOverLimit || false}
								onEditActivity={handleEditActivityInternal}
								onStatusChange={handleStatusChange}
								onCreateActivity={(status) => {
									console.log('🔵 Criando nova atividade com status:', status)
									onCreateActivity?.()
								}}
							/>
						)
					})}
				</div>

				{/* Overlay para drag */}
				<DragOverlay>
					{activeId && draggedActivity ? (
						<div className='transform rotate-3 opacity-90'>
							<ActivityCard activity={draggedActivity} projectId={draggedActivity.projectId} />
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	)
}
