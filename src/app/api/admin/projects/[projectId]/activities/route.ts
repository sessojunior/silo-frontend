import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projectActivity, project } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth/token'

// GET /api/admin/projects/[projectId]/activities - Buscar todas as atividades de um projeto
export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
	try {
		console.log('🔵 GET /api/admin/projects/[projectId]/activities')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { projectId } = await params

		// Verificar se o projeto existe
		const existingProject = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

		if (existingProject.length === 0) {
			console.log('❌ Projeto não encontrado:', projectId)
			return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 })
		}

		// Buscar todas as atividades do projeto
		const activities = await db.select().from(projectActivity).where(eq(projectActivity.projectId, projectId)).orderBy(projectActivity.createdAt)

		console.log('✅ Atividades carregadas:', activities.length)

		return NextResponse.json({
			success: true,
			activities,
		})
	} catch (error) {
		console.error('❌ Erro ao buscar atividades:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// POST /api/admin/projects/[projectId]/activities - Criar nova atividade
export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
	try {
		console.log('🔵 POST /api/admin/projects/[projectId]/activities')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { projectId } = await params
		const body = await request.json()

		// Validação dos dados obrigatórios
		if (!body.name || !body.description) {
			return NextResponse.json({ success: false, error: 'Nome e descrição são obrigatórios' }, { status: 400 })
		}

		// Verificar se o projeto existe
		const existingProject = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

		if (existingProject.length === 0) {
			console.log('❌ Projeto não encontrado:', projectId)
			return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 })
		}

		// Validar datas se fornecidas
		if (body.startDate && body.endDate && body.startDate > body.endDate) {
			return NextResponse.json({ success: false, error: 'Data de início deve ser anterior à data de fim' }, { status: 400 })
		}

		// Validar dias estimados se fornecido
		if (body.estimatedDays && (isNaN(Number(body.estimatedDays)) || Number(body.estimatedDays) < 0)) {
			return NextResponse.json({ success: false, error: 'Dias estimados deve ser um número válido e positivo' }, { status: 400 })
		}

		// Criar a atividade
		const newActivity = await db
			.insert(projectActivity)
			.values({
				projectId,
				name: body.name,
				description: body.description,
				category: body.category || null,
				estimatedDays: body.estimatedDays ? Number(body.estimatedDays) : null,
				startDate: body.startDate || null,
				endDate: body.endDate || null,
				priority: body.priority || 'medium',
				status: body.status || 'todo',
			})
			.returning()

		console.log('✅ Atividade criada:', newActivity[0].id)

		return NextResponse.json({
			success: true,
			activity: newActivity[0],
		})
	} catch (error) {
		console.error('❌ Erro ao criar atividade:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PUT /api/admin/projects/[projectId]/activities - Atualizar atividade
export async function PUT(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
	try {
		console.log('🔵 PUT /api/admin/projects/[projectId]/activities')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { projectId } = await params
		const body = await request.json()

		// Validação do ID da atividade
		if (!body.id) {
			return NextResponse.json({ success: false, error: 'ID da atividade é obrigatório' }, { status: 400 })
		}

		// Validação dos dados obrigatórios
		if (!body.name || !body.description) {
			return NextResponse.json({ success: false, error: 'Nome e descrição são obrigatórios' }, { status: 400 })
		}

		// Verificar se a atividade existe e pertence ao projeto
		const existingActivity = await db
			.select()
			.from(projectActivity)
			.where(and(eq(projectActivity.id, body.id), eq(projectActivity.projectId, projectId)))
			.limit(1)

		if (existingActivity.length === 0) {
			console.log('❌ Atividade não encontrada:', body.id)
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

		// Atualizar a atividade
		const updatedActivity = await db
			.update(projectActivity)
			.set({
				name: body.name,
				description: body.description,
				category: body.category || null,
				estimatedDays: body.estimatedDays ? Number(body.estimatedDays) : null,
				startDate: body.startDate || null,
				endDate: body.endDate || null,
				priority: body.priority || 'medium',
				status: body.status || 'todo',
				updatedAt: new Date(),
			})
			.where(and(eq(projectActivity.id, body.id), eq(projectActivity.projectId, projectId)))
			.returning()

		console.log('✅ Atividade atualizada:', updatedActivity[0].id)

		return NextResponse.json({
			success: true,
			activity: updatedActivity[0],
		})
	} catch (error) {
		console.error('❌ Erro ao atualizar atividade:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// DELETE /api/admin/projects/[projectId]/activities - Excluir atividade
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
	try {
		console.log('🔵 DELETE /api/admin/projects/[projectId]/activities')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { projectId } = await params
		const { searchParams } = new URL(request.url)
		const activityId = searchParams.get('activityId')

		// Validação do ID da atividade
		if (!activityId) {
			return NextResponse.json({ success: false, error: 'ID da atividade é obrigatório' }, { status: 400 })
		}

		// Verificar se a atividade existe e pertence ao projeto
		const existingActivity = await db
			.select()
			.from(projectActivity)
			.where(and(eq(projectActivity.id, activityId), eq(projectActivity.projectId, projectId)))
			.limit(1)

		if (existingActivity.length === 0) {
			console.log('❌ Atividade não encontrada:', activityId)
			return NextResponse.json({ success: false, error: 'Atividade não encontrada' }, { status: 404 })
		}

		// Excluir a atividade
		await db.delete(projectActivity).where(and(eq(projectActivity.id, activityId), eq(projectActivity.projectId, projectId)))

		console.log('✅ Atividade excluída:', activityId)

		return NextResponse.json({
			success: true,
			message: 'Atividade excluída com sucesso',
		})
	} catch (error) {
		console.error('❌ Erro ao excluir atividade:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
