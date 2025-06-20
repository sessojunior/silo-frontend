'use client'

import React, { useState, useMemo } from 'react'
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragOverEvent, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, UniqueIdentifier, CollisionDetection, rectIntersection } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import KanbanColumnGroup from './KanbanColumnGroup'
import KanbanCard from './KanbanCard'
import { toast } from '@/lib/toast'

import { Task, Project } from '@/types/projects'

interface KanbanBoardProps {
	tasks: Task[]
	project?: Project
	onTaskMove: (taskId: string, fromStatus: Task['status'], toStatus: Task['status'], overId?: string) => void
	onCreateTask?: () => void
	onEditTask?: (task: Task) => void
	onConfigureKanban?: () => void
}

// Definir grupos de colunas com sub-colunas - Bloqueado reordenado após Em Progresso
const COLUMN_GROUPS = [
	{
		id: 'todo',
		title: 'A Fazer',
		color: 'gray', // Cor Tailwind CSS
		colorShade: '500', // Shade principal
		icon: 'icon-[lucide--list-todo]',
		subColumns: [
			{ id: 'todo_doing', title: 'Fazendo', type: 'doing' as const },
			{ id: 'todo_done', title: 'Feito', type: 'done' as const },
		],
		rules: {
			maxCards: 20,
			allowPriorities: ['low', 'medium', 'high', 'urgent'] as Task['priority'][],
		},
	},
	{
		id: 'in_progress',
		title: 'Em Progresso',
		color: 'blue', // Cor Tailwind CSS
		colorShade: '500', // Shade principal
		icon: 'icon-[lucide--refresh-cw]',
		subColumns: [
			{ id: 'in_progress_doing', title: 'Fazendo', type: 'doing' as const },
			{ id: 'in_progress_done', title: 'Feito', type: 'done' as const },
		],
		rules: {
			maxCards: 5,
			allowPriorities: ['medium', 'high', 'urgent'] as Task['priority'][],
			blockIfFull: true,
		},
	},
	{
		id: 'blocked',
		title: 'Bloqueado',
		color: 'red', // Cor Tailwind CSS
		colorShade: '500', // Shade principal
		icon: 'icon-[lucide--ban]',
		subColumns: [{ id: 'blocked', title: 'Bloqueado', type: 'blocked' as const }],
		rules: {
			maxCards: 10,
			allowPriorities: ['low', 'medium', 'high', 'urgent'] as Task['priority'][],
		},
	},
	{
		id: 'review',
		title: 'Em Revisão',
		color: 'amber', // Cor Tailwind CSS
		colorShade: '500', // Shade principal
		icon: 'icon-[lucide--eye]',
		subColumns: [
			{ id: 'review_doing', title: 'Fazendo', type: 'doing' as const },
			{ id: 'review_done', title: 'Feito', type: 'done' as const },
		],
		rules: {
			maxCards: 3,
			allowPriorities: ['high', 'urgent'] as Task['priority'][],
			blockIfFull: true,
		},
	},
	{
		id: 'done',
		title: 'Concluído',
		color: 'emerald', // Cor Tailwind CSS
		colorShade: '500', // Shade principal
		icon: 'icon-[lucide--trophy]',
		subColumns: [{ id: 'done', title: 'Finalizadas', type: 'final' as const }],
		rules: {
			maxCards: 100,
			allowPriorities: ['low', 'medium', 'high', 'urgent'] as Task['priority'][],
		},
	},
]

export default function KanbanBoard({ tasks, onTaskMove, onCreateTask, onEditTask }: KanbanBoardProps) {
	const [columnGroups] = useState(COLUMN_GROUPS)
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
	const [draggedTask, setDraggedTask] = useState<Task | null>(null)

	// Configurar sensores do DnD
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 3, // 🎯 REDUZIR distância para melhor responsividade
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	// 🎯 COLLISION DETECTION PERSONALIZADA: Priorizar áreas droppable das subcolunas
	const customCollisionDetection: CollisionDetection = (args) => {
		// Primeiro, tentar detectar collision com áreas droppable (subcolunas)
		const droppableCollisions = rectIntersection({
			...args,
			droppableContainers: args.droppableContainers.filter((container) => container.id.toString().startsWith('column-')),
		})

		if (droppableCollisions.length > 0) {
			console.log('🎯 [customCollisionDetection] Collision detectada com SUBCOLUNA:', {
				collisions: droppableCollisions.map((c) => ({
					id: c.id,
					isColumn: c.id.toString().startsWith('column-'),
				})),
			})
			return droppableCollisions
		}

		// Se não houver collision com subcolunas, usar detecção padrão (tarefas)
		const defaultCollisions = closestCorners(args)

		console.log('🎯 [customCollisionDetection] Fallback para collision com TAREFAS:', {
			collisions: defaultCollisions.map((c) => ({
				id: c.id,
				isColumn: c.id.toString().startsWith('column-'),
			})),
		})

		return defaultCollisions
	}

	// Agrupar tarefas por status COM ORDENAÇÃO CORRETA 🎯
	const tasksByStatus = useMemo(() => {
		console.log('🔍 [KanbanBoard] ======= INÍCIO AGRUPAMENTO =======')
		console.log('🔍 [KanbanBoard] Agrupando tarefas por status:', {
			totalActivities: tasks.length,
			tasks: tasks.map((a) => ({
				id: a.id,
				name: a.name,
				status: a.status,
				kanbanOrder: (a as Task & { kanbanOrder?: number }).kanbanOrder,
			})),
		})

		const grouped = tasks.reduce(
			(acc, task) => {
				if (!acc[task.status]) {
					acc[task.status] = []
				}
				acc[task.status].push(task)
				return acc
			},
			{} as Record<Task['status'], Task[]>,
		)

		// 🎯 ORDENAÇÃO CRÍTICA: Ordenar tarefas dentro de cada coluna/subcoluna pelo campo kanbanOrder
		Object.keys(grouped).forEach((status) => {
			const beforeSort = grouped[status as Task['status']].map((a) => ({
				id: a.id,
				name: a.name,
				order: (a as Task & { kanbanOrder?: number }).kanbanOrder,
			}))

			grouped[status as Task['status']].sort((a, b) => {
				const orderA = (a as Task & { kanbanOrder?: number }).kanbanOrder || 0
				const orderB = (b as Task & { kanbanOrder?: number }).kanbanOrder || 0
				return orderA - orderB // Ordem crescente
			})

			const afterSort = grouped[status as Task['status']].map((a) => ({
				id: a.id,
				name: a.name,
				order: (a as Task & { kanbanOrder?: number }).kanbanOrder,
			}))

			console.log(`🔍 [KanbanBoard] Ordenação ${status}:`, { beforeSort, afterSort })
		})

		console.log('🔍 [KanbanBoard] ======= RESULTADO FINAL =======')
		console.log('🔍 [KanbanBoard] Resultado do agrupamento ORDENADO:', grouped)
		console.log('🔍 [KanbanBoard] Status encontrados:', Object.keys(grouped))

		return grouped
	}, [tasks])

	// Validar se uma atividade pode ser movida para uma coluna com regras WIP avançadas
	const canMoveToColumn = (task: Task, targetColumnId: Task['status'], fromColumnId?: Task['status']): { allowed: boolean; reason?: string; warningType?: 'limit' | 'priority' | 'blocked' } => {
		// 🎯 CORREÇÃO CRÍTICA: Se é o mesmo status (mesma subcoluna), SEMPRE permitir (reordenação)
		if (fromColumnId === targetColumnId) {
			console.log('🔵 Movimento na mesma subcoluna (reordenação) - SEMPRE PERMITIDO:', {
				status: targetColumnId,
			})
			return { allowed: true }
		}

		// Encontrar o grupo que contém a coluna de destino
		const targetGroup = columnGroups.find((group) => group.subColumns.some((subCol) => subCol.id === targetColumnId))

		if (!targetGroup) {
			console.log('❌ [canMoveToColumn] Grupo não encontrado para:', targetColumnId)
			return { allowed: false, reason: 'Grupo não encontrado' }
		}

		// 🎯 CORREÇÃO CRÍTICA: Se está movendo dentro do mesmo grupo, SEMPRE permitir
		if (fromColumnId) {
			const sourceGroup = columnGroups.find((group) => group.subColumns.some((subCol) => subCol.id === fromColumnId))

			console.log('🔍 [canMoveToColumn] Verificando grupos:', {
				fromColumnId,
				targetColumnId,
				sourceGroup: sourceGroup?.id,
				targetGroup: targetGroup.id,
				sameGroup: sourceGroup?.id === targetGroup.id,
			})

			if (sourceGroup && sourceGroup.id === targetGroup.id) {
				console.log('🔵 Movimento dentro do mesmo grupo - SEMPRE PERMITIDO:', {
					group: targetGroup.title,
					from: fromColumnId,
					to: targetColumnId,
				})

				// ✅ MOVIMENTO DENTRO DO MESMO GRUPO = SEMPRE PERMITIDO (sem verificar prioridades ou WIP)
				return { allowed: true }
			}
		}

		// Calcular atividades no grupo inteiro (apenas para movimentos ENTRE grupos)
		const groupActivities = targetGroup.subColumns.reduce((sum, subCol) => {
			return sum + (tasksByStatus[subCol.id as Task['status']] || []).length
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

		// Verificar prioridades permitidas (apenas para movimentos ENTRE grupos)
		if (rules.allowPriorities && !rules.allowPriorities.includes(task.priority)) {
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

		const task = tasks.find((a) => a.id === active.id)
		setDraggedTask(task || null)

		console.log('🔵 Iniciando drag:', active.id)
	}

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event

		if (!over) return

		const activeTask = tasks.find((a) => a.id === active.id)
		if (!activeTask) return

		// Determinar coluna de destino
		let targetColumnId: Task['status']

		if (over.id.toString().startsWith('column-')) {
			// Soltando sobre a coluna
			targetColumnId = over.id.toString().replace('column-', '') as Task['status']
		} else {
			// Soltando sobre uma atividade - pegar a coluna da atividade
			const targetTask = tasks.find((a) => a.id === over.id)
			if (!targetTask) return
			targetColumnId = targetTask.status
		}

		// Verificar se pode mover com validações WIP avançadas
		const validation = canMoveToColumn(activeTask, targetColumnId, activeTask.status)
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
		setDraggedTask(null)

		if (!over) {
			console.log('🔵 Drag cancelado - sem destino')
			return
		}

		const activeTask = tasks.find((a) => a.id === active.id)
		if (!activeTask) return

		// Determinar coluna de destino
		let targetColumnId: Task['status']

		console.log('🔍 [handleDragEnd] Analisando destino:', {
			overId: over.id,
			overIdString: over.id.toString(),
			isColumn: over.id.toString().startsWith('column-'),
		})

		if (over.id.toString().startsWith('column-')) {
			// Soltando sobre a subcoluna (área droppable) - PRIORIDADE MÁXIMA
			targetColumnId = over.id.toString().replace('column-', '') as Task['status']
			console.log('🔍 [handleDragEnd] Destino é SUBCOLUNA:', {
				originalId: over.id.toString(),
				targetColumnId,
				isSubcolumnDrop: true,
			})
		} else {
			// 🎯 CORREÇÃO CRÍTICA: Quando solta sobre tarefa, precisamos determinar a subcoluna correta
			// Verificar se a tarefa de destino existe e pegar sua subcoluna
			const targetTask = tasks.find((a) => a.id === over.id)
			if (!targetTask) {
				console.log('❌ [handleDragEnd] Tarefa de destino não encontrada:', over.id)
				return
			}

			// 🚨 PROBLEMA IDENTIFICADO: Usar o status da tarefa de destino pode estar errado
			// se a tarefa estiver na subcoluna errada (dados inconsistentes)
			targetColumnId = targetTask.status

			console.log('🔍 [handleDragEnd] Destino é TAREFA:', {
				taskId: targetTask.id,
				taskName: targetTask.name,
				targetColumnId,
				taskStatus: targetTask.status,
				isTaskDrop: true,
			})

			// 🎯 VALIDAÇÃO ADICIONAL: Verificar se a tarefa está na subcoluna esperada
			// Se estiver inconsistente, mostrar aviso
			console.log('🔍 [handleDragEnd] Validação tarefa destino:', {
				targetTaskId: targetTask.id,
				targetTaskStatus: targetTask.status,
				expectedSubcolumn: 'Baseado na posição visual da tarefa',
			})
		}

		// Verificar se pode mover com validações WIP avançadas
		console.log('🔍 [handleDragEnd] Chamando canMoveToColumn:', {
			taskId: activeTask.id,
			fromStatus: activeTask.status,
			toStatus: targetColumnId,
		})

		const validation = canMoveToColumn(activeTask, targetColumnId, activeTask.status)

		console.log('🔍 [handleDragEnd] Resultado da validação:', validation)

		if (!validation.allowed) {
			// Toast diferenciado por tipo de erro
			const toastType = validation.warningType === 'blocked' ? 'error' : 'warning'
			const title = validation.warningType === 'blocked' ? '🚫 Movimento Bloqueado' : validation.warningType === 'priority' ? '⚠️ Prioridade Inválida' : '⚠️ Movimento não permitido'

			console.log('❌ [handleDragEnd] Movimento bloqueado:', {
				reason: validation.reason,
				warningType: validation.warningType,
			})

			toast({
				type: toastType,
				title: title,
				description: validation.reason || 'Verifique as regras do grupo',
			})
			return
		}

		// 🎯 CORREÇÃO CRÍTICA: SEMPRE chamar onTaskMove, mesmo para mesma coluna
		// A lógica de "mesma coluna" no contexto Kanban refere-se a subcolunas diferentes
		console.log('🔵 Movendo atividade:', activeTask.id, 'de', activeTask.status, 'para', targetColumnId)

		// Log detalhado para debug
		console.log('🔍 [handleDragEnd] Detalhes do movimento:', {
			taskId: activeTask.id,
			taskName: activeTask.name,
			fromStatus: activeTask.status,
			toStatus: targetColumnId,
			isWithinSameColumn: activeTask.status === targetColumnId,
			isReordering: activeTask.status === targetColumnId,
			isMovingBetweenSubcolumns: activeTask.status !== targetColumnId,
		})

		try {
			// ✅ SEMPRE chamar onTaskMove - deixar a página principal decidir o que fazer
			// Passar overId para permitir reordenação precisa (mas nunca a própria tarefa arrastada)
			let overIdForReorder: string | undefined = undefined

			if (!over.id.toString().startsWith('column-')) {
				const overIdString = over.id.toString()
				// Só usar overId se não for a própria tarefa arrastada
				if (overIdString !== activeTask.id) {
					overIdForReorder = overIdString
				}
			}

			console.log('🔍 [handleDragEnd] OverId processado:', {
				original: over.id.toString(),
				processed: overIdForReorder,
				isOwnTask: over.id.toString() === activeTask.id,
			})

			onTaskMove(activeTask.id, activeTask.status, targetColumnId, overIdForReorder)
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

	const handleEditTaskInternal = (task: Task) => {
		if (onEditTask) {
			onEditTask(task)
		} else {
			console.log('🔵 Editando atividade no Kanban:', task.name)
			toast({
				type: 'info',
				title: 'Em desenvolvimento',
				description: 'Edição será implementada na próxima etapa',
			})
		}
	}

	return (
		<>
			{/* Board do Kanban com larguras fixas */}
			<DndContext sensors={sensors} collisionDetection={customCollisionDetection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className='flex gap-x-4'>
					{columnGroups.map((group) => {
						// Preparar sub-colunas com atividades
						const subColumnsWithActivities = group.subColumns.map((subCol) => ({
							...subCol,
							tasks: tasksByStatus[subCol.id as Task['status']] || [],
						}))

						// Calcular total de atividades do grupo
						const totalActivities = subColumnsWithActivities.reduce((sum, subCol) => sum + subCol.tasks.length, 0)
						const isOverLimit = group.rules?.maxCards && totalActivities >= group.rules.maxCards

						return (
							<KanbanColumnGroup
								key={group.id}
								group={group}
								subColumns={subColumnsWithActivities}
								totalActivities={totalActivities}
								isOverLimit={isOverLimit || false}
								onEditTask={handleEditTaskInternal}
								onCreateTask={(status) => {
									console.log('🔵 Criando nova tarefa com status:', status)
									onCreateTask?.()
								}}
							/>
						)
					})}
				</div>

				{/* Overlay para drag */}
				<DragOverlay>
					{activeId && draggedTask ? (
						<div className='transform rotate-3 opacity-90'>
							<KanbanCard task={draggedTask} onEdit={() => {}} />
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</>
	)
}
