import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

// Interface para as tarefas básicas (sem dados enriquecidos)
interface KanbanTaskBasic {
	project_task_id: string
	subcolumn: 'in_progress' | 'done'
	order: number
}

// Interface para as tarefas enriquecidas (com dados completos)
interface KanbanTask extends KanbanTaskBasic {
	task: {
		id: string
		projectId: string
		projectActivityId: string
		name: string
		description: string
		category: string | null
		priority: string
		startDate: string | null
		endDate: string | null
		estimatedDays: number | null
		status: string
		createdAt: Date
		updatedAt: Date
	}
}

// Interface para as colunas do Kanban (conforme estrutura JSON)
interface KanbanColumn {
	name: string
	type: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	is_visible: boolean
	color: string
	icon: string
	limit_wip: number | null
	block_wip_reached: boolean
	tasks: KanbanTaskBasic[]
}

// Interface removida - não mais necessária

// GET - Buscar dados do Kanban da atividade específica
export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string; activityId: string }> }) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
		}

		const { projectId, activityId } = await params

		console.log('🔵 [API] GET Kanban - Parâmetros recebidos:', { projectId, activityId })

		// Verificar se a atividade existe e pertence ao projeto
		const activity = await db
			.select()
			.from(schema.projectActivity)
			.where(and(eq(schema.projectActivity.id, activityId), eq(schema.projectActivity.projectId, projectId)))
			.limit(1)

		if (activity.length === 0) {
			console.error('❌ [API] Atividade não encontrada:', { projectId, activityId })
			return NextResponse.json({ success: false, error: 'Atividade não encontrada' }, { status: 404 })
		}

		// Buscar configuração do Kanban desta atividade específica
		const kanbanConfig = await db
			.select()
			.from(schema.projectKanban)
			.where(and(eq(schema.projectKanban.projectId, projectId), eq(schema.projectKanban.projectActivityId, activityId)))
			.limit(1)

		if (kanbanConfig.length === 0) {
			console.error('❌ [API] Configuração Kanban não encontrada:', { projectId, activityId })
			return NextResponse.json({ success: false, error: 'Configuração Kanban não encontrada' }, { status: 404 })
		}

		// Parse das colunas JSON
		let columns: KanbanColumn[]
		try {
			columns = JSON.parse(kanbanConfig[0].columns)
			console.log('🔵 [API] Colunas parseadas do JSON:', columns.length)
		} catch (error) {
			console.error('❌ [API] Erro ao parsear colunas JSON:', error)
			return NextResponse.json({ success: false, error: 'Erro na configuração do Kanban' }, { status: 500 })
		}

		// Buscar todas as tarefas desta atividade para enriquecer os dados
		const allTasks = await db
			.select()
			.from(schema.projectTask)
			.where(and(eq(schema.projectTask.projectId, projectId), eq(schema.projectTask.projectActivityId, activityId)))

		console.log('🔵 [API] Total de tarefas encontradas:', allTasks.length)
		console.log(
			'🔵 [API] Detalhes das tarefas encontradas:',
			allTasks.map((t) => ({
				id: t.id,
				name: t.name,
				projectId: t.projectId,
				projectActivityId: t.projectActivityId,
				status: t.status,
			})),
		)

		// 🎯 NOVA LÓGICA: Usar JSON columns como fonte da verdade, enriquecer com dados da tabela
		console.log('🔵 [API] Usando JSON columns como fonte da verdade...')

		// Enriquecer as tarefas existentes no JSON com dados completos da tabela
		columns.forEach((column) => {
			const enrichedTasks = column.tasks
				.map((kanbanTask) => {
					// Buscar dados completos da tarefa
					const fullTask = allTasks.find((task) => task.id === kanbanTask.project_task_id)

					if (!fullTask) {
						console.warn('⚠️ [API] Tarefa não encontrada:', kanbanTask.project_task_id)
						return null // Remover tarefa que não existe mais
					}

					// Enriquecer com dados completos
					return {
						...kanbanTask,
						task: {
							id: fullTask.id,
							projectId: fullTask.projectId,
							projectActivityId: fullTask.projectActivityId,
							name: fullTask.name,
							description: fullTask.description,
							category: fullTask.category,
							priority: fullTask.priority,
							startDate: fullTask.startDate,
							endDate: fullTask.endDate,
							estimatedDays: fullTask.estimatedDays,
							status: fullTask.status,
							createdAt: fullTask.createdAt,
							updatedAt: fullTask.updatedAt,
						},
					}
				})
				.filter(Boolean) as KanbanTask[] // Cast para tipo correto

			// Atribuir tarefas enriquecidas
			;(column as KanbanColumn & { tasks: KanbanTask[] }).tasks = enrichedTasks

			console.log(`🔵 [API] Coluna "${column.name}" (${column.type}) tem ${enrichedTasks.length} tarefas do JSON`)
		})

		// Debug: verificar distribuição final
		columns.forEach((column, index) => {
			console.log(
				`🔵 [API] Coluna ${index + 1} "${column.name}" (${column.type}) tem ${column.tasks.length} tarefas:`,
				column.tasks.map((t) => (t as KanbanTask).task?.name || t.project_task_id),
			)
		})

		const enrichedColumns = columns

		console.log('✅ [API] Dados do Kanban preparados:', {
			activityId,
			columnsCount: enrichedColumns.length,
			tasksPerColumn: enrichedColumns.map((col) => ({
				type: col.type,
				name: col.name,
				count: col.tasks.length,
			})),
		})

		return NextResponse.json({
			success: true,
			columns: enrichedColumns,
			activity: activity[0],
		})
	} catch (error) {
		console.error('❌ [API] Erro ao buscar Kanban:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PATCH - Mover tarefa entre colunas (drag & drop)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ projectId: string; activityId: string }> }) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
		}

		const { projectId, activityId } = await params
		const body = await request.json()
		const { taskId, fromColumnType, toColumnType, newOrder, cardSubcolumn } = body

		console.log('🔵 [API] PATCH Movimentação Kanban:', {
			projectId,
			activityId,
			taskId,
			fromColumnType,
			toColumnType,
			newOrder,
			cardSubcolumn,
		})

		// Validação dos dados recebidos
		if (!taskId || !toColumnType) {
			return NextResponse.json({ success: false, error: 'Dados inválidos para movimentação' }, { status: 400 })
		}

		// Verificar se a tarefa pertence à atividade
		const task = await db
			.select()
			.from(schema.projectTask)
			.where(and(eq(schema.projectTask.id, taskId), eq(schema.projectTask.projectId, projectId), eq(schema.projectTask.projectActivityId, activityId)))
			.limit(1)

		if (!task.length) {
			console.error('❌ [API] Tarefa não encontrada:', { taskId, projectId, activityId })
			return NextResponse.json({ success: false, error: 'Tarefa não encontrada' }, { status: 404 })
		}

		// Buscar configuração atual do Kanban
		const kanbanConfig = await db
			.select()
			.from(schema.projectKanban)
			.where(and(eq(schema.projectKanban.projectId, projectId), eq(schema.projectKanban.projectActivityId, activityId)))
			.limit(1)

		if (!kanbanConfig.length) {
			console.error('❌ [API] Configuração Kanban não encontrada:', { projectId, activityId })
			return NextResponse.json({ success: false, error: 'Configuração Kanban não encontrada' }, { status: 404 })
		}

		// Parse das colunas atuais
		let columns: KanbanColumn[]
		try {
			columns = JSON.parse(kanbanConfig[0].columns)
		} catch (error) {
			console.error('❌ [API] Erro ao parsear colunas JSON:', error)
			return NextResponse.json({ success: false, error: 'Erro na configuração do Kanban' }, { status: 500 })
		}

		// Atualizar as colunas com a nova posição da tarefa
		const updatedColumns = columns.map((column) => {
			// Remover tarefa da coluna de origem
			if (fromColumnType && column.type === fromColumnType) {
				column.tasks = column.tasks.filter((t) => t.project_task_id !== taskId)
			}

			// Adicionar tarefa na coluna de destino
			if (column.type === toColumnType) {
				// Remover se já existir (caso de reordenação na mesma coluna)
				column.tasks = column.tasks.filter((t) => t.project_task_id !== taskId)

				// Adicionar na nova posição
				const newTask: KanbanTaskBasic = {
					project_task_id: taskId,
					subcolumn: cardSubcolumn || 'in_progress',
					order: newOrder || column.tasks.length,
				}

				column.tasks.splice(newOrder || column.tasks.length, 0, newTask)

				// Reordenar tasks baseado na nova ordem
				column.tasks = column.tasks.map((t, index) => ({
					...t,
					order: index,
				}))
			}

			return column
		})

		// Atualizar status da tarefa na tabela principal baseado na coluna de destino
		let taskStatus: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
		switch (toColumnType) {
			case 'todo':
				taskStatus = 'todo'
				break
			case 'in_progress':
				taskStatus = 'in_progress'
				break
			case 'blocked':
				taskStatus = 'blocked'
				break
			case 'review':
				taskStatus = 'review'
				break
			case 'done':
				taskStatus = 'done'
				break
			default:
				taskStatus = task[0].status as typeof taskStatus
		}

		// Atualizar o status da tarefa na tabela principal
		await db
			.update(schema.projectTask)
			.set({
				status: taskStatus,
				updatedAt: new Date(),
			})
			.where(eq(schema.projectTask.id, taskId))

		// Atualizar configuração do Kanban com as novas posições
		await db
			.update(schema.projectKanban)
			.set({
				columns: JSON.stringify(updatedColumns),
				updatedAt: new Date(),
			})
			.where(eq(schema.projectKanban.id, kanbanConfig[0].id))

		console.log('✅ [API] Tarefa movida com sucesso:', {
			taskId,
			oldStatus: task[0].status,
			newStatus: taskStatus,
			newColumn: toColumnType,
		})

		return NextResponse.json({
			success: true,
			message: 'Tarefa movida com sucesso',
			taskId,
			newStatus: taskStatus,
			newColumn: toColumnType,
		})
	} catch (error) {
		console.error('❌ [API] Erro ao mover tarefa:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
