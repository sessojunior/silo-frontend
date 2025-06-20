'use client'

import React, { useState, useMemo } from 'react'
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragOverEvent, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, UniqueIdentifier } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import KanbanColumnGroup from './KanbanColumnGroup'
import ActivityCard from './ActivityCard'
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
		icon: 'icon-[lucide--list-todo]',
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
		icon: 'icon-[lucide--refresh-cw]',
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
		icon: 'icon-[lucide--ban]',
		subColumns: [{ id: 'blocked', title: 'Bloqueado', type: 'blocked' as const }],
		rules: {
			maxCards: 10,
			allowPriorities: ['low', 'medium', 'high', 'urgent'] as Activity['priority'][],
		},
	},
	{
		id: 'review',
		title: 'Em Revisão',
		color: '#f59e0b',
		icon: 'icon-[lucide--eye]',
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
		icon: 'icon-[lucide--trophy]',
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

	// Agrupar tarefas por status COM ORDENAÇÃO CORRETA 🎯
	const activitiesByStatus = useMemo(() => {
		console.log('🔍 [KanbanBoard] Agrupando tarefas por status:', {
			totalActivities: activities.length,
			activities: activities.map((a) => ({ id: a.id, name: a.name, status: a.status, kanbanOrder: (a as Activity & { kanbanOrder?: number }).kanbanOrder })),
		})

		const grouped = activities.reduce(
			(acc, activity) => {
				if (!acc[activity.status]) {
					acc[activity.status] = []
				}
				acc[activity.status].push(activity)
				return acc
			},
			{} as Record<Activity['status'], Activity[]>,
		)

		// 🎯 ORDENAÇÃO CRÍTICA: Ordenar tarefas dentro de cada coluna/subcoluna pelo campo kanbanOrder
		Object.keys(grouped).forEach((status) => {
			grouped[status as Activity['status']].sort((a, b) => {
				const orderA = (a as Activity & { kanbanOrder?: number }).kanbanOrder || 0
				const orderB = (b as Activity & { kanbanOrder?: number }).kanbanOrder || 0
				return orderA - orderB // Ordem crescente
			})
		})

		console.log('🔍 [KanbanBoard] Resultado do agrupamento ORDENADO:', grouped)
		console.log('🔍 [KanbanBoard] Status encontrados:', Object.keys(grouped))
		console.log(
			'🔍 [KanbanBoard] Verificação ordenação:',
			Object.keys(grouped).map((status) => ({
				status,
				tasks: grouped[status as Activity['status']].map((a) => ({ name: a.name, order: (a as Activity & { kanbanOrder?: number }).kanbanOrder })),
			})),
		)

		return grouped
	}, [activities, columnGroups])

	// Validar se uma atividade pode ser movida para uma coluna com regras WIP avançadas
	const canMoveToColumn = (activity: Activity, targetColumnId: Activity['status'], fromColumnId?: Activity['status']): { allowed: boolean; reason?: string; warningType?: 'limit' | 'priority' | 'blocked' } => {
		// Encontrar o grupo que contém a coluna de destino
		const targetGroup = columnGroups.find((group) => group.subColumns.some((subCol) => subCol.id === targetColumnId))

		if (!targetGroup) return { allowed: false, reason: 'Grupo não encontrado' }

		// 🎯 CORREÇÃO CRÍTICA: Se está movendo dentro do mesmo grupo, não aplicar limite WIP
		if (fromColumnId) {
			const sourceGroup = columnGroups.find((group) => group.subColumns.some((subCol) => subCol.id === fromColumnId))

			if (sourceGroup && sourceGroup.id === targetGroup.id) {
				console.log('🔵 Movimento dentro do mesmo grupo - ignorando limite WIP:', {
					group: targetGroup.title,
					from: fromColumnId,
					to: targetColumnId,
				})

				// Ainda verificar prioridades (regra de negócio)
				const rules = targetGroup.rules
				if (rules?.allowPriorities && !rules.allowPriorities.includes(activity.priority)) {
					const allowedPriorities = rules.allowPriorities.map((p) => ({ low: 'baixa', medium: 'média', high: 'alta', urgent: 'urgente' })[p]).join(', ')
					return {
						allowed: false,
						reason: `Grupo "${targetGroup.title}" só aceita prioridades: ${allowedPriorities}`,
						warningType: 'priority',
					}
				}

				return { allowed: true } // ✅ Permitir movimento dentro do mesmo grupo
			}
		}

		// Calcular atividades no grupo inteiro (apenas para movimentos ENTRE grupos)
		const groupActivities = targetGroup.subColumns.reduce((sum, subCol) => {
			return sum + (activitiesByStatus[subCol.id as Activity['status']] || []).length
		}, 0)

		const rules = targetGroup.rules

		if (!rules) return { allowed: true }

		// Verificar limite de cards do grupo (apenas para movimentos ENTRE grupos)
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
		const validation = canMoveToColumn(activeActivity, targetColumnId, activeActivity.status)
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
		const validation = canMoveToColumn(activeActivity, targetColumnId, activeActivity.status)
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
			// Toast é exibido na página principal - removendo daqui para evitar duplicação
		} catch (error) {
			console.error('❌ Erro ao mover atividade:', error)
			// Toast de erro mantido para casos excepcionais do componente
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
		<>
			{/* Board do Kanban com larguras fixas */}
			<DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className='flex gap-x-4'>
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
								onCreateActivity={(status) => {
									console.log('🔵 Criando nova tarefa com status:', status)
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
		</>
	)
}
