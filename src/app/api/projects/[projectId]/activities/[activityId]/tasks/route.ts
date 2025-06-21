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
		const { taskId, newStatus, newSort, reorderTasks, scenarioType, originColumnUpdates, destinationColumnUpdates } = body

		console.log('🔵 [API] PATCH Task Move - Dados recebidos:', {
			projectId,
			activityId,
			taskId,
			newStatus,
			newSort,
			scenarioType,
			reorderTasks: reorderTasks?.length || 0,
			originColumnUpdates: originColumnUpdates?.length || 0,
			destinationColumnUpdates: destinationColumnUpdates?.length || 0,
		})

		console.log('🔵 [API] Body completo:', JSON.stringify(body, null, 2))

		// 🧪 TESTE DE ROLLBACK - Simular erro para demonstração
		// Descomente a linha abaixo para testar o rollback
		// return NextResponse.json({ success: false, error: 'TESTE: Erro simulado para demonstrar rollback' }, { status: 500 })

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

		// 📊 LOG ESTADO ANTES DA MOVIMENTAÇÃO
		console.log('\n📊 [DEBUG] ESTADO ANTES DA MOVIMENTAÇÃO:')
		const tasksBeforeUpdate = await db
			.select()
			.from(schema.projectTask)
			.where(and(eq(schema.projectTask.projectId, projectId), eq(schema.projectTask.projectActivityId, activityId)))
			.orderBy(asc(schema.projectTask.status), asc(schema.projectTask.sort))

		const groupedBefore = tasksBeforeUpdate.reduce(
			(acc, task) => {
				if (!acc[task.status]) acc[task.status] = []
				acc[task.status].push({
					id: task.id,
					name: task.name,
					status: task.status,
					sort: task.sort,
				})
				return acc
			},
			{} as Record<string, any[]>,
		)

		Object.entries(groupedBefore).forEach(([status, tasks]) => {
			console.log(`📋 [ANTES] ${status.toUpperCase()}:`)
			tasks.forEach((task, index) => {
				console.log(`  ${index}: ${task.name} (id: ${task.id.slice(0, 8)}..., sort: ${task.sort})`)
			})
		})

		// Processar baseado no tipo de cenário

		// CASO 1: Mudança de coluna com reordenação de ambas as colunas
		if (scenarioType === 'column_change' && originColumnUpdates && destinationColumnUpdates) {
			console.log('🔥 [API] Processando mudança de coluna com reordenação completa')
			console.log('📤 [API] Origin Column Updates:', originColumnUpdates.length)
			console.log('📥 [API] Destination Column Updates:', destinationColumnUpdates.length)

			// Atualizar todas as tarefas da coluna de origem
			if (originColumnUpdates.length > 0) {
				console.log('🔵 [API] Atualizando coluna de origem...')
				for (const taskUpdate of originColumnUpdates) {
					console.log(`🔵 [API] Origem - Atualizando task:`, {
						taskId: taskUpdate.taskId,
						sort: taskUpdate.sort,
					})

					await db
						.update(schema.projectTask)
						.set({
							sort: taskUpdate.sort,
							updatedAt: new Date(),
						})
						.where(eq(schema.projectTask.id, taskUpdate.taskId))
				}
				console.log('✅ [API] Coluna de origem atualizada')
			}

			// Atualizar todas as tarefas da coluna de destino
			if (destinationColumnUpdates.length > 0) {
				console.log('🔵 [API] Atualizando coluna de destino...')
				for (const taskUpdate of destinationColumnUpdates) {
					console.log(`🔵 [API] Destino - Atualizando task:`, {
						taskId: taskUpdate.taskId,
						status: taskUpdate.status,
						sort: taskUpdate.sort,
					})

					await db
						.update(schema.projectTask)
						.set({
							status: taskUpdate.status,
							sort: taskUpdate.sort,
							updatedAt: new Date(),
						})
						.where(eq(schema.projectTask.id, taskUpdate.taskId))
				}
				console.log('✅ [API] Coluna de destino atualizada')
			}

			console.log('✅ [API] Mudança de coluna processada com sucesso')
		}

		// CASO 2: Reordenação na mesma coluna (quando há reorderTasks)
		else if (scenarioType === 'same_column_reorder' && reorderTasks && Array.isArray(reorderTasks) && reorderTasks.length > 0) {
			console.log('🔄 [API] Processando reordenação na mesma coluna')
			console.log('🔵 [API] Reordenando tarefas - Array recebido:', reorderTasks.length)
			console.log('🔵 [API] Conteúdo de reorderTasks:', JSON.stringify(reorderTasks, null, 2))

			// Validar se todos os objetos têm taskId
			const invalidTasks = reorderTasks.filter((task: { taskId: string; status?: string; sort?: number }) => !task.taskId)
			if (invalidTasks.length > 0) {
				console.error('❌ [API] Tasks sem taskId encontradas:', invalidTasks)
				return NextResponse.json({ success: false, error: 'Tasks sem taskId encontradas' }, { status: 400 })
			}

			// Atualizar sort de todas as tarefas na ordem especificada
			for (let i = 0; i < reorderTasks.length; i++) {
				const taskToReorder = reorderTasks[i]
				console.log(`🔵 [API] Atualizando task ${i + 1}/${reorderTasks.length}:`, {
					taskId: taskToReorder.taskId,
					status: taskToReorder.status,
					newSort: taskToReorder.sort,
				})

				await db
					.update(schema.projectTask)
					.set({
						sort: taskToReorder.sort,
						updatedAt: new Date(),
					})
					.where(eq(schema.projectTask.id, taskToReorder.taskId))
			}

			console.log('✅ [API] Tarefas reordenadas com sucesso')
		}

		// CASO 3: Movimento via hover sobre task (cross column)
		else if (scenarioType === 'cross_column_via_task' && originColumnUpdates && destinationColumnUpdates) {
			console.log('🔥 [API] Processando movimento entre colunas via task')
			console.log('📤 [API] Origin Column Updates:', originColumnUpdates.length)
			console.log('📥 [API] Destination Column Updates:', destinationColumnUpdates.length)

			// Mesmo processamento que column_change
			// Atualizar todas as tarefas da coluna de origem
			if (originColumnUpdates.length > 0) {
				console.log('🔵 [API] Atualizando coluna de origem...')
				for (const taskUpdate of originColumnUpdates) {
					await db
						.update(schema.projectTask)
						.set({
							sort: taskUpdate.sort,
							updatedAt: new Date(),
						})
						.where(eq(schema.projectTask.id, taskUpdate.taskId))
				}
				console.log('✅ [API] Coluna de origem atualizada')
			}

			// Atualizar todas as tarefas da coluna de destino
			if (destinationColumnUpdates.length > 0) {
				console.log('🔵 [API] Atualizando coluna de destino...')
				for (const taskUpdate of destinationColumnUpdates) {
					await db
						.update(schema.projectTask)
						.set({
							status: taskUpdate.status,
							sort: taskUpdate.sort,
							updatedAt: new Date(),
						})
						.where(eq(schema.projectTask.id, taskUpdate.taskId))
				}
				console.log('✅ [API] Coluna de destino atualizada')
			}

			console.log('✅ [API] Movimento entre colunas processado com sucesso')
		}

		// 📊 LOG ESTADO DEPOIS DA MOVIMENTAÇÃO
		console.log('\n📊 [DEBUG] ESTADO DEPOIS DA MOVIMENTAÇÃO:')
		const tasksAfterUpdate = await db
			.select()
			.from(schema.projectTask)
			.where(and(eq(schema.projectTask.projectId, projectId), eq(schema.projectTask.projectActivityId, activityId)))
			.orderBy(asc(schema.projectTask.status), asc(schema.projectTask.sort))

		const groupedAfter = tasksAfterUpdate.reduce(
			(acc, task) => {
				if (!acc[task.status]) acc[task.status] = []
				acc[task.status].push({
					id: task.id,
					name: task.name,
					status: task.status,
					sort: task.sort,
				})
				return acc
			},
			{} as Record<string, any[]>,
		)

		Object.entries(groupedAfter).forEach(([status, tasks]) => {
			console.log(`📋 [DEPOIS] ${status.toUpperCase()}:`)
			tasks.forEach((task, index) => {
				console.log(`  ${index}: ${task.name} (id: ${task.id.slice(0, 8)}..., sort: ${task.sort})`)
			})
		})

		// 🔍 COMPARAÇÃO DE MUDANÇAS
		console.log('\n🔍 [DEBUG] RESUMO DAS MUDANÇAS:')
		const changedTasks = tasksAfterUpdate.filter((taskAfter) => {
			const taskBefore = tasksBeforeUpdate.find((tb) => tb.id === taskAfter.id)
			return taskBefore && (taskBefore.status !== taskAfter.status || taskBefore.sort !== taskAfter.sort)
		})

		if (changedTasks.length > 0) {
			console.log(`✅ ${changedTasks.length} task(s) alterada(s):`)
			changedTasks.forEach((taskAfter) => {
				const taskBefore = tasksBeforeUpdate.find((tb) => tb.id === taskAfter.id)
				if (taskBefore) {
					console.log(`  📝 ${taskAfter.name}:`)
					if (taskBefore.status !== taskAfter.status) {
						console.log(`    Status: ${taskBefore.status} → ${taskAfter.status}`)
					}
					if (taskBefore.sort !== taskAfter.sort) {
						console.log(`    Sort: ${taskBefore.sort} → ${taskAfter.sort}`)
					}
				}
			})
		} else {
			console.log('⚠️ Nenhuma task foi alterada no banco de dados')
		}

		console.log('\n✅ [DEBUG] OPERAÇÃO CONCLUÍDA COM SUCESSO')
		console.log('=====================================')

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
