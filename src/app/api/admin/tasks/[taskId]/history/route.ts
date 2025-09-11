import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET - Buscar histórico de uma tarefa específica
export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
		}

		const { taskId } = await params
		console.log('🔍 [API] Buscando histórico da tarefa:', taskId)

		// Verificar se a tarefa existe
		const task = await db.select().from(schema.projectTask).where(eq(schema.projectTask.id, taskId)).limit(1)

		if (task.length === 0) {
			return NextResponse.json({ success: false, error: 'Tarefa não encontrada' }, { status: 404 })
		}

		// Buscar histórico da tarefa com dados do usuário
		const history = await db
			.select({
				id: schema.projectTaskHistory.id,
				action: schema.projectTaskHistory.action,
				fromStatus: schema.projectTaskHistory.fromStatus,
				toStatus: schema.projectTaskHistory.toStatus,
				fromSort: schema.projectTaskHistory.fromSort,
				toSort: schema.projectTaskHistory.toSort,
				details: schema.projectTaskHistory.details,
				createdAt: schema.projectTaskHistory.createdAt,
				user: {
					id: schema.authUser.id,
					name: schema.authUser.name,
					email: schema.authUser.email,
					image: schema.authUser.image,
				},
			})
			.from(schema.projectTaskHistory)
			.innerJoin(schema.authUser, eq(schema.projectTaskHistory.userId, schema.authUser.id))
			.where(eq(schema.projectTaskHistory.taskId, taskId))
			.orderBy(desc(schema.projectTaskHistory.createdAt))

		console.log(`✅ [API] ${history.length} entradas de histórico encontradas`)

		return NextResponse.json({
			success: true,
			task: task[0],
			history: history,
		})
	} catch (error) {
		console.error('❌ [API] Erro ao buscar histórico da tarefa:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
