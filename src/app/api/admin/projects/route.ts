import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'

import { db } from '@/lib/db'
import { project, projectActivity, projectTask, projectTaskHistory, projectTaskUser } from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'
import { asc, eq, ilike, or, and, inArray } from 'drizzle-orm'

// Schema de validação para criação/edição de projetos
const ProjectSchema = z.object({
	name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
	shortDescription: z.string().min(1, 'Descrição curta é obrigatória').max(500, 'Descrição curta muito longa'),
	description: z.string().min(1, 'Descrição é obrigatória'),
	startDate: z.string().nullable().optional(),
	endDate: z.string().nullable().optional(),
	priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
	status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
})

// GET - Listar projetos com filtros e busca
export async function GET(request: NextRequest) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			console.log('❌ Usuário não autenticado tentou acessar projetos')
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const search = searchParams.get('search')
		const status = searchParams.get('status')
		const priority = searchParams.get('priority')
		const orderBy = searchParams.get('orderBy') || 'name'
		const order = searchParams.get('order') || 'asc'

		console.log('🔵 Buscando projetos com filtros:', { search, status, priority, orderBy, order })

		// Construir query com filtros de forma simplificada
		const whereConditions = []

		if (search) {
			whereConditions.push(or(ilike(project.name, `%${search}%`), ilike(project.shortDescription, `%${search}%`), ilike(project.description, `%${search}%`)))
		}

		if (status && status !== 'all') {
			whereConditions.push(eq(project.status, status))
		}

		if (priority && priority !== 'all') {
			whereConditions.push(eq(project.priority, priority))
		}

		// Executar query
		let projects
		if (whereConditions.length === 0) {
			projects = await db.select().from(project).orderBy(asc(project.name))
		} else if (whereConditions.length === 1) {
			projects = await db.select().from(project).where(whereConditions[0]).orderBy(asc(project.name))
		} else {
			projects = await db
				.select()
				.from(project)
				.where(and(...whereConditions))
				.orderBy(asc(project.name))
		}

		console.log(`✅ ${projects.length} projetos encontrados`)
		return NextResponse.json(projects)
	} catch (error) {
		console.error('❌ Erro ao buscar projetos:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			console.log('❌ Usuário não autenticado tentou criar projeto')
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const body = await request.json()
		console.log('🔵 Criando novo projeto:', body)

		// Validar dados
		const validatedData = ProjectSchema.parse(body)

		// Criar projeto
		const newProject = await db
			.insert(project)
			.values({
				id: randomUUID(),
				name: validatedData.name,
				shortDescription: validatedData.shortDescription,
				description: validatedData.description,
				startDate: validatedData.startDate || null,
				endDate: validatedData.endDate || null,
				priority: validatedData.priority,
				status: validatedData.status,
			})
			.returning()

		console.log('✅ Projeto criado com sucesso:', newProject[0].id)
		return NextResponse.json(newProject[0], { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.log('⚠️ Dados inválidos para criação de projeto:', error.errors)
			return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
		}

		console.error('❌ Erro ao criar projeto:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PUT - Atualizar projeto
export async function PUT(request: NextRequest) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			console.log('❌ Usuário não autenticado tentou atualizar projeto')
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const body = await request.json()
		const { id, ...updateData } = body

		if (!id) {
			return NextResponse.json({ error: 'ID do projeto é obrigatório' }, { status: 400 })
		}

		console.log('🔵 Atualizando projeto:', id)

		// Validar dados
		const validatedData = ProjectSchema.parse(updateData)

		// Atualizar projeto
		const updatedProject = await db
			.update(project)
			.set({
				name: validatedData.name,
				shortDescription: validatedData.shortDescription,
				description: validatedData.description,
				startDate: validatedData.startDate || null,
				endDate: validatedData.endDate || null,
				priority: validatedData.priority,
				status: validatedData.status,
				updatedAt: new Date(),
			})
			.where(eq(project.id, id))
			.returning()

		if (updatedProject.length === 0) {
			console.log('⚠️ Projeto não encontrado:', id)
			return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
		}

		console.log('✅ Projeto atualizado com sucesso:', id)
		return NextResponse.json(updatedProject[0])
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.log('⚠️ Dados inválidos para atualização de projeto:', error.errors)
			return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
		}

		console.error('❌ Erro ao atualizar projeto:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// DELETE - Excluir projeto
export async function DELETE(request: NextRequest) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			console.log('❌ Usuário não autenticado tentou excluir projeto')
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			console.log('⚠️ ID do projeto não fornecido')
			return NextResponse.json({ error: 'ID do projeto é obrigatório' }, { status: 400 })
		}

		console.log('🔵 Iniciando exclusão do projeto:', id)
		console.log('🔵 Usuário autenticado:', user.email)

		// Verificar se projeto existe
		console.log('🔵 Verificando se projeto existe...')
		const existingProject = await db.select().from(project).where(eq(project.id, id)).limit(1)

		if (existingProject.length === 0) {
			console.log('⚠️ Projeto não encontrado para exclusão:', id)
			return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
		}

		console.log('✅ Projeto encontrado:', existingProject[0].name)

		// Executar exclusão em cascata usando transação
		await db.transaction(async (tx) => {
			console.log('🔵 Iniciando transação de exclusão em cascata...')

			// 1. Buscar todas as atividades do projeto
			const activities = await tx.select({ id: projectActivity.id }).from(projectActivity).where(eq(projectActivity.projectId, id))
			const activityIds = activities.map((a) => a.id)
			console.log(`🔵 Encontradas ${activityIds.length} atividades do projeto`)

			// 2. Buscar todas as tarefas do projeto
			const tasks = await tx.select({ id: projectTask.id }).from(projectTask).where(eq(projectTask.projectId, id))
			const taskIds = tasks.map((t) => t.id)
			console.log(`🔵 Encontradas ${taskIds.length} tarefas do projeto`)

			// 3. Excluir histórico das tarefas
			if (taskIds.length > 0) {
				await tx.delete(projectTaskHistory).where(inArray(projectTaskHistory.taskId, taskIds))
				console.log('✅ Histórico das tarefas excluído')
			}

			// 4. Excluir associações usuário-tarefa
			if (taskIds.length > 0) {
				await tx.delete(projectTaskUser).where(inArray(projectTaskUser.taskId, taskIds))
				console.log('✅ Associações usuário-tarefa excluídas')
			}

			// 5. Excluir todas as tarefas
			await tx.delete(projectTask).where(eq(projectTask.projectId, id))
			console.log('✅ Tarefas do projeto excluídas')

			// 6. Excluir todas as atividades
			await tx.delete(projectActivity).where(eq(projectActivity.projectId, id))
			console.log('✅ Atividades do projeto excluídas')

			// 7. Finalmente, excluir o projeto
			await tx.delete(project).where(eq(project.id, id))
			console.log('✅ Projeto excluído com sucesso')
		})

		console.log('✅ Exclusão em cascata do projeto concluída:', id)

		return NextResponse.json({ success: true, message: 'Projeto excluído com sucesso' })
	} catch (error) {
		console.error('❌ Erro detalhado ao excluir projeto:', error)
		console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A')
		console.error('❌ Tipo do erro:', typeof error)
		console.error('❌ Mensagem do erro:', error instanceof Error ? error.message : String(error))

		return NextResponse.json(
			{
				success: false,
				error: 'Erro interno do servidor',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
