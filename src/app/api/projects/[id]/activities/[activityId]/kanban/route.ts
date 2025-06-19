import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth/token'

interface KanbanCard {
	projectTaskId: string
	status: 'in_progress' | 'done'
	order: number
}

interface KanbanColumn {
	name: string
	type: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	is_visible: boolean
	color: string
	icon: string
	limit_wip: number | null
	block_wip_reached: boolean
	tasks: KanbanCard[]
}

// GET - Buscar dados do Kanban de uma atividade específica
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; activityId: string }> }) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
		}

		const { id: projectId, activityId } = await params

		console.log('🔵 GET /api/projects/[id]/activities/[activityId]/kanban:', { projectId, activityId })

		// Verificar se o projeto existe
		const project = await db.select().from(schema.project).where(eq(schema.project.id, projectId)).limit(1)
		if (project.length === 0) {
			return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 })
		}

		// Verificar se a atividade existe e pertence ao projeto
		const activity = await db
			.select()
			.from(schema.projectActivity)
			.where(and(eq(schema.projectActivity.id, activityId), eq(schema.projectActivity.projectId, projectId)))
			.limit(1)

		if (activity.length === 0) {
			return NextResponse.json({ success: false, error: 'Atividade não encontrada' }, { status: 404 })
		}

		// Buscar tarefas desta atividade específica
		const tasks = await db
			.select()
			.from(schema.projectTask)
			.where(and(eq(schema.projectTask.projectId, projectId), eq(schema.projectTask.projectActivityId, activityId)))

		console.log('🔵 Tarefas encontradas:', tasks.length)

		// Buscar configuração do Kanban desta atividade
		const kanbanConfig = await db
			.select()
			.from(schema.projectKanban)
			.where(and(eq(schema.projectKanban.projectId, projectId), eq(schema.projectKanban.projectActivityId, activityId)))
			.limit(1)

		let columns: KanbanColumn[] = []

		if (kanbanConfig.length > 0) {
			// Kanban já existe - usar configuração salva
			try {
				columns = JSON.parse(kanbanConfig[0].columns) as KanbanColumn[]
				console.log('🔵 Configuração Kanban carregada do banco')
			} catch (error) {
				console.error('❌ Erro ao parsear colunas do Kanban:', error)
				// Fallback para configuração padrão
				columns = getDefaultColumns()
			}
		} else {
			// Kanban não existe - criar com configuração padrão
			columns = getDefaultColumns()

			// Salvar configuração padrão no banco
			await db.insert(schema.projectKanban).values({
				projectId,
				projectActivityId: activityId,
				columns: JSON.stringify(columns),
			})

			console.log('🔵 Kanban criado para atividade:', activityId)
		}

		// Sincronizar tarefas com as colunas do Kanban
		columns = syncTasksWithColumns(tasks, columns)

		return NextResponse.json({
			success: true,
			tasks: tasks.map((task) => ({
				...task,
				createdAt: task.createdAt,
				updatedAt: task.updatedAt,
			})),
			columns,
		})
	} catch (error) {
		console.error('❌ Erro ao buscar Kanban:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PATCH - Mover tarefa entre colunas (drag & drop)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; activityId: string }> }) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
		}

		const { id: projectId, activityId } = await params
		const { taskId, fromColumnType, toColumnType, newOrder, cardStatus } = await request.json()

		console.log('🔵 PATCH /api/projects/[id]/activities/[activityId]/kanban - Movendo tarefa:', {
			taskId,
			fromColumnType,
			toColumnType,
			newOrder,
			cardStatus,
		})

		// Verificar se a tarefa existe e pertence à atividade
		const task = await db
			.select()
			.from(schema.projectTask)
			.where(and(eq(schema.projectTask.id, taskId), eq(schema.projectTask.projectId, projectId), eq(schema.projectTask.projectActivityId, activityId)))
			.limit(1)

		if (task.length === 0) {
			return NextResponse.json({ success: false, error: 'Tarefa não encontrada' }, { status: 404 })
		}

		// Atualizar status da tarefa na tabela project_task (FONTE DA VERDADE)
		const newTaskStatus = toColumnType as 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
		await db.update(schema.projectTask).set({ status: newTaskStatus }).where(eq(schema.projectTask.id, taskId))

		console.log('✅ Status da tarefa atualizado de', fromColumnType, 'para', newTaskStatus)

		// Buscar e atualizar configuração do Kanban
		const kanbanConfig = await db
			.select()
			.from(schema.projectKanban)
			.where(and(eq(schema.projectKanban.projectId, projectId), eq(schema.projectKanban.projectActivityId, activityId)))
			.limit(1)

		if (kanbanConfig.length > 0) {
			try {
				let columns: KanbanColumn[] = JSON.parse(kanbanConfig[0].columns)

				// Remover tarefa da coluna antiga
				columns = columns.map((col) => ({
					...col,
					tasks: col.type === fromColumnType ? col.tasks.filter((t) => t.projectTaskId !== taskId) : col.tasks,
				}))

				// Adicionar tarefa na nova coluna
				columns = columns.map((col) => {
					if (col.type === toColumnType) {
						const newTask: KanbanCard = {
							projectTaskId: taskId,
							status: cardStatus,
							order: newOrder,
						}
						return {
							...col,
							tasks: [...col.tasks, newTask].sort((a, b) => a.order - b.order),
						}
					}
					return col
				})

				// Salvar configuração atualizada
				await db
					.update(schema.projectKanban)
					.set({ columns: JSON.stringify(columns) })
					.where(and(eq(schema.projectKanban.projectId, projectId), eq(schema.projectKanban.projectActivityId, activityId)))

				console.log('✅ Configuração do Kanban atualizada')
			} catch (error) {
				console.error('❌ Erro ao atualizar configuração do Kanban:', error)
			}
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Erro ao mover tarefa:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// Função para obter colunas padrão do Kanban
function getDefaultColumns(): KanbanColumn[] {
	return [
		{
			name: 'A fazer',
			type: 'todo',
			is_visible: true,
			color: 'blue',
			icon: 'icon-[lucide--circle]',
			limit_wip: null,
			block_wip_reached: false,
			tasks: [],
		},
		{
			name: 'Em progresso',
			type: 'in_progress',
			is_visible: true,
			color: 'yellow',
			icon: 'icon-[lucide--play-circle]',
			limit_wip: 3,
			block_wip_reached: false,
			tasks: [],
		},
		{
			name: 'Bloqueado',
			type: 'blocked',
			is_visible: true,
			color: 'red',
			icon: 'icon-[lucide--alert-circle]',
			limit_wip: null,
			block_wip_reached: false,
			tasks: [],
		},
		{
			name: 'Em revisão',
			type: 'review',
			is_visible: true,
			color: 'orange',
			icon: 'icon-[lucide--eye]',
			limit_wip: 2,
			block_wip_reached: true,
			tasks: [],
		},
		{
			name: 'Concluído',
			type: 'done',
			is_visible: true,
			color: 'green',
			icon: 'icon-[lucide--check-circle]',
			limit_wip: null,
			block_wip_reached: false,
			tasks: [],
		},
	]
}

// Função para sincronizar tarefas com colunas do Kanban
function syncTasksWithColumns(tasks: { id: string; status: string }[], columns: KanbanColumn[]): KanbanColumn[] {
	// Primeiro, limpar todas as tasks das colunas
	const cleanColumns = columns.map((col) => ({ ...col, tasks: [] as KanbanCard[] }))

	// Distribuir tasks nas colunas baseado no status da task
	for (const task of tasks) {
		const columnIndex = cleanColumns.findIndex((col) => col.type === task.status)
		if (columnIndex !== -1) {
			const cardStatus: 'in_progress' | 'done' = cleanColumns[columnIndex].limit_wip !== null ? 'in_progress' : 'in_progress'
			cleanColumns[columnIndex].tasks.push({
				projectTaskId: task.id,
				status: cardStatus,
				order: cleanColumns[columnIndex].tasks.length,
			})
		}
	}

	return cleanColumns
}
