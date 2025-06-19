import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { project, projectKanban } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth/token'

// POST /api/projects/[id]/kanban/reset - Resetar dados do kanban para redistribuição automática
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		console.log('🔧 POST /api/projects/[id]/kanban/reset')

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

		// Remover dados kanban existentes
		await db.delete(projectKanban).where(eq(projectKanban.projectId, projectId))
		console.log('🗑️ Dados kanban removidos')

		// Manter apenas a configuração (resetar só os dados das colunas)
		console.log('✅ Reset do kanban concluído - próxima chamada da API irá redistribuir automaticamente')

		return NextResponse.json({
			success: true,
			message: 'Dados do kanban resetados com sucesso. As tasks serão redistribuídas automaticamente.',
		})
	} catch (error) {
		console.error('❌ Erro ao resetar dados do kanban:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
