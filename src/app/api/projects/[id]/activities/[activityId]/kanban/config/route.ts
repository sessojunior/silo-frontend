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

// PUT - Salvar configurações do Kanban
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; activityId: string }> }) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
		}

		const { id: projectId, activityId } = await params
		const { columns } = await request.json()

		console.log('🔵 PUT /api/projects/[id]/activities/[activityId]/kanban/config:', { projectId, activityId })

		// Verificar se o Kanban existe
		const kanbanConfig = await db
			.select()
			.from(schema.projectKanban)
			.where(and(eq(schema.projectKanban.projectId, projectId), eq(schema.projectKanban.projectActivityId, activityId)))
			.limit(1)

		if (kanbanConfig.length === 0) {
			return NextResponse.json({ success: false, error: 'Kanban não encontrado' }, { status: 404 })
		}

		// Validar e sanitizar colunas
		const validColumns: KanbanColumn[] = columns.map((col: KanbanColumn) => ({
			name: col.name || 'Sem nome',
			type: col.type,
			is_visible: col.is_visible !== false, // padrão true
			color: col.color || 'blue',
			icon: col.icon || 'icon-[lucide--circle]',
			limit_wip: col.limit_wip,
			block_wip_reached: col.block_wip_reached || false,
			tasks: col.tasks || [],
		}))

		// Atualizar configuração no banco
		await db
			.update(schema.projectKanban)
			.set({
				columns: JSON.stringify(validColumns),
				updatedAt: new Date(),
			})
			.where(and(eq(schema.projectKanban.projectId, projectId), eq(schema.projectKanban.projectActivityId, activityId)))

		console.log('✅ Configuração do Kanban atualizada')

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Erro ao salvar configuração do Kanban:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
