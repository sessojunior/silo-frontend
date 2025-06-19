import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'

// ⚠️ DEPRECATED: Esta API de Kanban está sendo substituída pela nova API por atividade
// Nova API: /api/projects/[id]/activities/[activityId]/kanban

// GET /api/projects/[id]/kanban - DEPRECATED - usar nova API por atividade
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { id: projectId } = await params

		console.log('⚠️ API DEPRECATED - GET /api/projects/[id]/kanban - Use /api/projects/[id]/activities/[activityId]/kanban')

		// Retornar resposta indicando migração
		return NextResponse.json(
			{
				success: false,
				error: 'API deprecated. Use /api/projects/[id]/activities/[activityId]/kanban',
				deprecated: true,
				newRoute: `/api/projects/${projectId}/activities/[activityId]/kanban`,
			},
			{ status: 410 },
		) // 410 Gone
	} catch (error) {
		console.error('❌ Erro na API deprecated:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PUT /api/projects/[id]/kanban - DEPRECATED - usar nova API por atividade
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { id: projectId } = await params

		console.log('⚠️ API DEPRECATED - PUT /api/projects/[id]/kanban - Use /api/projects/[id]/activities/[activityId]/kanban')

		// Retornar resposta indicando migração
		return NextResponse.json(
			{
				success: false,
				error: 'API deprecated. Use /api/projects/[id]/activities/[activityId]/kanban',
				deprecated: true,
				newRoute: `/api/projects/${projectId}/activities/[activityId]/kanban`,
			},
			{ status: 410 },
		) // 410 Gone
	} catch (error) {
		console.error('❌ Erro na API deprecated:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
