import { NextRequest, NextResponse } from 'next/server'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

// GET - Buscar tarefas da atividade
export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string; activityId: string }> }) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
		}

		const { projectId, activityId } = await params
		console.log('🔵 [API] GET Tasks - Buscando tarefas:', { projectId, activityId })

		// Buscar tarefas da atividade ordenadas por status e sort
		const tasks = await db
			.select()
			.from(schema.projectTask)
			.where(and(eq(schema.projectTask.projectId, projectId), eq(schema.projectTask.projectActivityId, activityId)))
			.orderBy(asc(schema.projectTask.status), asc(schema.projectTask.sort))

		console.log('🔵 [API] Tasks encontradas:', tasks.length)
		console.log(
			'🔵 [API] Tasks por status:',
			tasks.reduce(
				(acc, task) => {
					acc[task.status] = (acc[task.status] || 0) + 1
					return acc
				},
				{} as Record<string, number>,
			),
		)

		// Agrupar tarefas por status
		const groupedTasks = tasks.reduce(
			(acc, task) => {
				if (!acc[task.status]) {
					acc[task.status] = []
				}
				acc[task.status].push(task)
				return acc
			},
			{} as Record<string, typeof tasks>,
		)

		console.log(
			'🔵 [API] Tasks agrupadas:',
			Object.keys(groupedTasks).map((status) => ({
				status,
				count: groupedTasks[status].length,
				tasks: groupedTasks[status].map((t) => ({ id: t.id, name: t.name, sort: t.sort })),
			})),
		)

		return NextResponse.json({
			success: true,
			tasks: groupedTasks,
		})
	} catch (error) {
		console.error('❌ [API] Erro ao buscar tarefas:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PATCH - Mover/reordenar tarefas
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ projectId: string; activityId: string }> }) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
		}

		const { projectId, activityId } = await params
		const body = await request.json()
		const { taskId, newStatus, newSort, reorderTasks } = body

		console.log('🔵 [API] PATCH Task Move - Dados recebidos:', {
			projectId,
			activityId,
			taskId,
			newStatus,
			newSort,
			reorderTasks: reorderTasks?.length || 0,
		})

		console.log('🔵 [API] Body completo:', JSON.stringify(body, null, 2))

		// Validação dos dados recebidos
		if (!taskId || !newStatus) {
			console.error('❌ [API] Dados inválidos:', { taskId, newStatus })
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

		const currentTask = task[0]
		console.log('🔵 [API] Tarefa atual encontrada:', {
			id: currentTask.id,
			name: currentTask.name,
			status: currentTask.status,
			sort: currentTask.sort,
		})

		// CASO 1: Movimento simples (mudança de status)
		if (newStatus !== currentTask.status) {
			console.log('🔵 [API] Movendo tarefa para novo status:', { from: currentTask.status, to: newStatus })

			// Atualizar status da tarefa
			await db
				.update(schema.projectTask)
				.set({
					status: newStatus,
					sort: newSort || 0,
					updatedAt: new Date(),
				})
				.where(eq(schema.projectTask.id, taskId))

			console.log('✅ [API] Tarefa movida com sucesso:', {
				taskId,
				oldStatus: currentTask.status,
				newStatus,
				newSort,
			})
		}

		// CASO 2: Reordenação de tarefas (quando há reorderTasks)
		if (reorderTasks && Array.isArray(reorderTasks) && reorderTasks.length > 0) {
			console.log('🔵 [API] Reordenando tarefas - Array recebido:', reorderTasks.length)
			console.log('🔵 [API] Conteúdo de reorderTasks:', JSON.stringify(reorderTasks, null, 2))

			// Validar se todos os objetos têm ID
			const invalidTasks = reorderTasks.filter((task: { id: string; name?: string; sort?: number }) => !task.id)
			if (invalidTasks.length > 0) {
				console.error('❌ [API] Tasks sem ID encontradas:', invalidTasks)
				return NextResponse.json({ success: false, error: 'Tasks sem ID encontradas' }, { status: 400 })
			}

			// Atualizar sort de todas as tarefas na ordem especificada
			for (let i = 0; i < reorderTasks.length; i++) {
				const taskToReorder = reorderTasks[i]
				console.log(`🔵 [API] Atualizando task ${i + 1}/${reorderTasks.length}:`, {
					id: taskToReorder.id,
					name: taskToReorder.name,
					newSort: i,
				})

				await db
					.update(schema.projectTask)
					.set({
						sort: i,
						updatedAt: new Date(),
					})
					.where(eq(schema.projectTask.id, taskToReorder.id))
			}

			console.log('✅ [API] Tarefas reordenadas com sucesso')
		}

		return NextResponse.json({
			success: true,
			message: 'Tarefa movida/reordenada com sucesso',
			taskId,
			newStatus,
			newSort,
		})
	} catch (error) {
		console.error('❌ [API] Erro ao mover/reordenar tarefa:', error)
		console.error('❌ [API] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
