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
	// São enviados para o backend todos os dados de json, do estado antes (array tasksBeforeMove) da movimentação e todos os dados de json do estado depois (array tasksAfterMove) da movimentação.
	//
	// Os dados a serem enviados para o backend são todas as colunas, tasks e a ordem delas.
	//
	// HIPÓTESES A COBRIR, APENAS PARA CONFERIR NO BACKEND:
	//
	// Hipótese A. Frontend desatualizado, diferente do backend
	//
	// Para resolver isso, é preciso enviar dados de todas as tasks, status/coluna e ordem/posição.
	// Não só enviar dados apenas da task ou das tasks das colunas afetadas.
	// Enviar o estado atual (anterior à movimentação - tasksBeforeMove) do kanban (todas as tasks, status/coluna e ordem/posição) e ver se corresponde ao que está sendo consultado no banco de dados (fazer verificação transparente na api).
	//
	// Claro que serão enviados os dados de antes da movimentação e os dados de depois da movimentação.
	// Se não corresponde, retornar mensagem ao usuário, por toast, que o kanban estava desatualizado e atualizar os dados dele (as tasks), recarregando ele novamente.
	// Se corresponde, alterar no banco de dados.
	//
	// Hipótese B. Frontend igual ao do backend
	//
	// Se os dados enviados (dados para conferir, antes da movimentação - tasksBeforeMove) forem iguais aos que estão no backend, pode acontecer algumas coisas:
	// Em caso de erro, exibir mensagem de erro ao usuário por toast. Em caso de sucesso, exibir mensagem de sucesso ao usuário, por toast.
	//
	// 1. Reordenação na mesma coluna
	// Altera a ordem (sort) das tasks apenas da coluna afetada.
	//
	// 2. Movimentação entre colunas (coluna de origem ≠ coluna de destino)
	// Altera a ordem e status/coluna da task movida.
	// Altera a ordem de todas as tasks da coluna de origem. Caso não tenha ficado nenhuma: atualizar a coluna como array vazio [].
	// Altera a ordem de todas as tasks da coluna de destino, caso existam.
	//
	// 3. Movimentação para coluna vazia
	// Altera a ordem e status/coluna da task movida.
	// Altera a ordem de todas as tasks da coluna de origem. Caso não tenha ficado nenhuma: atualizar a coluna como array vazio [].
	//
	// 4. Movimentação de última task da coluna de origem
	// Altera a ordem e status/coluna da task movida.
	// Atualizar a coluna de origem como array vazio [].
	// Altera a ordem de todas as tasks da coluna de destino, caso existam.
	//
	// 5. Rollback
	// Se a API falhar, o frontend deve restaurar o estado anterior (array tasksBeforeMove) se não conseguir atualizar e exibir mensagem para o usuário por toast.
	// Evitar conflito com o caso de que os dados do frontend são diferentes do backend. Nesse caso, deverá retornar mensagem ao usuário, por toast, que o kanban estava desatualizado e atualizar os dados dele (as tasks), recarregando ele novamente.
	//
	// Implementar a lógica abaixo

	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
		}

		const { projectId, activityId } = await params
		const body = await request.json()
		const { tasksBeforeMove, tasksAfterMove } = body

		if (!Array.isArray(tasksBeforeMove) || !Array.isArray(tasksAfterMove)) {
			return NextResponse.json({ success: false, error: 'Payload inválido' }, { status: 400 })
		}

		// Buscar todas as tasks atuais do banco para o projeto/atividade
		const dbTasks = await db
			.select()
			.from(schema.projectTask)
			.where(and(eq(schema.projectTask.projectId, projectId), eq(schema.projectTask.projectActivityId, activityId)))

		// Função utilitária para comparar arrays de tasks (id, status, sort)
		function tasksArrayEquals(a: any[], b: any[]) {
			if (a.length !== b.length) return false
			const sortFn = (x: any, y: any) => x.taskId.localeCompare(y.taskId)
			const arrA = [...a].sort(sortFn)
			const arrB = [...b].sort(sortFn)
			for (let i = 0; i < arrA.length; i++) {
				if (arrA[i].taskId !== arrB[i].taskId || arrA[i].status !== arrB[i].status || arrA[i].sort !== arrB[i].sort) {
					return false
				}
			}
			return true
		}

		// Montar array de comparação do banco
		const dbTasksForCompare = dbTasks.map((t) => ({
			taskId: t.id,
			status: t.status,
			sort: t.sort,
		}))

		// Verificar se o frontend está desatualizado
		if (!tasksArrayEquals(tasksBeforeMove, dbTasksForCompare)) {
			// Retornar erro especial e o estado real do banco
			return NextResponse.json(
				{
					success: false,
					error: 'KANBAN_OUTDATED',
					tasks: dbTasksForCompare,
				},
				{ status: 409 },
			)
		}

		// Atualizar todas as tasks conforme tasksAfterMove (status e sort)
		// Usar transação para garantir atomicidade
		await db.transaction(async (tx) => {
			for (const task of tasksAfterMove) {
				await tx.update(schema.projectTask).set({ status: task.status, sort: task.sort }).where(eq(schema.projectTask.id, task.taskId))
			}
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ [API] Erro ao atualizar tarefas do kanban:', error)
		return NextResponse.json({ success: false, error: 'Erro ao atualizar tarefas do kanban' }, { status: 500 })
	}
}
