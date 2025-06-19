import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projectTask, project, projectActivity, projectKanban } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth/token'

// Interfaces para tipagem
interface KanbanCard {
	projectTaskId: string
	status: string
	order: number
}

interface KanbanColumn {
	type: string
	order: number
	cards: KanbanCard[]
}

// Função para sincronizar kanban quando task.status muda
async function syncKanbanWithTaskStatus(projectId: string, taskId: string, newStatus: string) {
	try {
		// Buscar dados do kanban
		const kanbanData = await db.select().from(projectKanban).where(eq(projectKanban.projectId, projectId)).limit(1)

		if (kanbanData.length > 0) {
			const columns = JSON.parse(kanbanData[0].columns) as KanbanColumn[]

			// Remover task de todas as colunas
			columns.forEach((column) => {
				column.cards = column.cards.filter((card) => card.projectTaskId !== taskId)
			})

			// Adicionar task na coluna correta baseada no novo status
			const targetColumn = columns.find((col) => col.type === newStatus)
			if (targetColumn) {
				// Calcular nova ordem (último card + 1)
				const maxOrder = targetColumn.cards.length > 0 ? Math.max(...targetColumn.cards.map((card) => card.order)) : -1

				targetColumn.cards.push({
					projectTaskId: taskId,
					status: 'default',
					order: maxOrder + 1,
				})
			}

			// Atualizar no banco
			await db
				.update(projectKanban)
				.set({
					columns: JSON.stringify(columns),
					updatedAt: new Date(),
				})
				.where(eq(projectKanban.projectId, projectId))

			console.log('✅ Kanban sincronizado com mudança de status da task:', taskId, '→', newStatus)
		}
	} catch (error) {
		console.error('❌ Erro ao sincronizar kanban com status da task:', error)
		// Não quebrar a operação principal por causa da sincronização
	}
}

// GET /api/projects/[id]/tasks - Buscar todas as tarefas de um projeto
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		console.log('🔵 GET /api/projects/[id]/tasks')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { id: projectId } = await params

		// Verificar se o projeto existe
		const existingProject = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

		if (existingProject.length === 0) {
			console.log('❌ Projeto não encontrado:', projectId)
			return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 })
		}

		// Buscar todas as tarefas do projeto com informações da atividade
		const tasks = await db
			.select({
				id: projectTask.id,
				projectId: projectTask.projectId,
				projectActivityId: projectTask.projectActivityId,
				name: projectTask.name,
				description: projectTask.description,
				category: projectTask.category,
				estimatedDays: projectTask.estimatedDays,
				startDate: projectTask.startDate,
				endDate: projectTask.endDate,
				priority: projectTask.priority,
				createdAt: projectTask.createdAt,
				updatedAt: projectTask.updatedAt,
				activityName: projectActivity.name,
			})
			.from(projectTask)
			.leftJoin(projectActivity, eq(projectTask.projectActivityId, projectActivity.id))
			.where(eq(projectTask.projectId, projectId))
			.orderBy(projectTask.createdAt)

		console.log('✅ Tarefas carregadas:', tasks.length)

		return NextResponse.json({
			success: true,
			tasks,
		})
	} catch (error) {
		console.error('❌ Erro ao buscar tarefas:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// POST /api/projects/[id]/tasks - Criar nova tarefa
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		console.log('🔵 POST /api/projects/[id]/tasks')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { id: projectId } = await params
		const body = await request.json()

		// Validação dos dados obrigatórios
		if (!body.name || !body.description || !body.projectActivityId) {
			return NextResponse.json({ success: false, error: 'Nome, descrição e atividade são obrigatórios' }, { status: 400 })
		}

		// Verificar se o projeto existe
		const existingProject = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

		if (existingProject.length === 0) {
			console.log('❌ Projeto não encontrado:', projectId)
			return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 })
		}

		// Verificar se a atividade existe e pertence ao projeto
		const existingActivity = await db
			.select()
			.from(projectActivity)
			.where(and(eq(projectActivity.id, body.projectActivityId), eq(projectActivity.projectId, projectId)))
			.limit(1)

		if (existingActivity.length === 0) {
			console.log('❌ Atividade não encontrada ou não pertence ao projeto:', body.projectActivityId)
			return NextResponse.json({ success: false, error: 'Atividade não encontrada' }, { status: 404 })
		}

		// Validar datas se fornecidas
		if (body.startDate && body.endDate && body.startDate > body.endDate) {
			return NextResponse.json({ success: false, error: 'Data de início deve ser anterior à data de fim' }, { status: 400 })
		}

		// Validar dias estimados se fornecido
		if (body.estimatedDays && (isNaN(Number(body.estimatedDays)) || Number(body.estimatedDays) < 0)) {
			return NextResponse.json({ success: false, error: 'Dias estimados deve ser um número válido e positivo' }, { status: 400 })
		}

		// Criar a tarefa
		const newTask = await db
			.insert(projectTask)
			.values({
				projectId,
				projectActivityId: body.projectActivityId,
				name: body.name,
				description: body.description,
				category: body.category || null,
				estimatedDays: body.estimatedDays ? Number(body.estimatedDays) : null,
				startDate: body.startDate || null,
				endDate: body.endDate || null,
				priority: body.priority || 'medium',
				status: body.status || 'todo', // NOVO: status padrão 'todo'
			})
			.returning()

		// SINCRONIZAÇÃO REVERSA: Adicionar task no kanban na coluna correta
		await syncKanbanWithTaskStatus(projectId, newTask[0].id, newTask[0].status)

		console.log('✅ Tarefa criada com sincronização:', newTask[0].id)

		return NextResponse.json({
			success: true,
			task: newTask[0],
		})
	} catch (error) {
		console.error('❌ Erro ao criar tarefa:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PUT /api/projects/[id]/tasks - Atualizar tarefa
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		console.log('🔵 PUT /api/projects/[id]/tasks')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { id: projectId } = await params
		const body = await request.json()

		// Validação do ID da tarefa
		if (!body.id) {
			return NextResponse.json({ success: false, error: 'ID da tarefa é obrigatório' }, { status: 400 })
		}

		// Validação dos dados obrigatórios
		if (!body.name || !body.description) {
			return NextResponse.json({ success: false, error: 'Nome e descrição são obrigatórios' }, { status: 400 })
		}

		// Verificar se a tarefa existe e pertence ao projeto
		const existingTask = await db
			.select()
			.from(projectTask)
			.where(and(eq(projectTask.id, body.id), eq(projectTask.projectId, projectId)))
			.limit(1)

		if (existingTask.length === 0) {
			console.log('❌ Tarefa não encontrada:', body.id)
			return NextResponse.json({ success: false, error: 'Tarefa não encontrada' }, { status: 404 })
		}

		// Validar datas se fornecidas
		if (body.startDate && body.endDate && body.startDate > body.endDate) {
			return NextResponse.json({ success: false, error: 'Data de início deve ser anterior à data de fim' }, { status: 400 })
		}

		// Validar dias estimados se fornecido
		if (body.estimatedDays && (isNaN(Number(body.estimatedDays)) || Number(body.estimatedDays) < 0)) {
			return NextResponse.json({ success: false, error: 'Dias estimados deve ser um número válido e positivo' }, { status: 400 })
		}

		// Verificar se o status mudou para sincronização
		const statusChanged = body.status && body.status !== existingTask[0].status

		// Atualizar a tarefa
		const updatedTask = await db
			.update(projectTask)
			.set({
				name: body.name,
				description: body.description,
				category: body.category || null,
				estimatedDays: body.estimatedDays ? Number(body.estimatedDays) : null,
				startDate: body.startDate || null,
				endDate: body.endDate || null,
				priority: body.priority || 'medium',
				status: body.status || existingTask[0].status, // NOVO: atualizar status se fornecido
				updatedAt: new Date(),
			})
			.where(and(eq(projectTask.id, body.id), eq(projectTask.projectId, projectId)))
			.returning()

		// SINCRONIZAÇÃO REVERSA: Se status mudou, sincronizar kanban
		if (statusChanged) {
			await syncKanbanWithTaskStatus(projectId, updatedTask[0].id, updatedTask[0].status)
		}

		console.log('✅ Tarefa atualizada com sincronização:', updatedTask[0].id)

		return NextResponse.json({
			success: true,
			task: updatedTask[0],
		})
	} catch (error) {
		console.error('❌ Erro ao atualizar tarefa:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// DELETE /api/projects/[id]/tasks - Excluir tarefa
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		console.log('🔵 DELETE /api/projects/[id]/tasks')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { id: projectId } = await params
		const { searchParams } = new URL(request.url)
		const taskId = searchParams.get('taskId')

		// Validação do ID da tarefa
		if (!taskId) {
			return NextResponse.json({ success: false, error: 'ID da tarefa é obrigatório' }, { status: 400 })
		}

		// Verificar se a tarefa existe e pertence ao projeto
		const existingTask = await db
			.select()
			.from(projectTask)
			.where(and(eq(projectTask.id, taskId), eq(projectTask.projectId, projectId)))
			.limit(1)

		if (existingTask.length === 0) {
			console.log('❌ Tarefa não encontrada:', taskId)
			return NextResponse.json({ success: false, error: 'Tarefa não encontrada' }, { status: 404 })
		}

		// Excluir a tarefa
		await db.delete(projectTask).where(and(eq(projectTask.id, taskId), eq(projectTask.projectId, projectId)))

		console.log('✅ Tarefa excluída:', taskId)

		return NextResponse.json({
			success: true,
			message: 'Tarefa excluída com sucesso',
		})
	} catch (error) {
		console.error('❌ Erro ao excluir tarefa:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
