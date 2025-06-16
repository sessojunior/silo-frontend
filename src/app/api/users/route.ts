import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authUser, group } from '@/lib/db/schema'
import { eq, desc, ilike, and, not } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

// GET - Listar usuários com busca e filtros
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const search = searchParams.get('search') || ''
		const status = searchParams.get('status') || 'all'
		const groupId = searchParams.get('groupId') || ''

		console.log('ℹ️ Buscando usuários:', { search, status, groupId })

		// Construir condições de filtro
		const conditions = []

		if (search) {
			conditions.push(ilike(authUser.name, `%${search}%`))
		}

		if (status === 'active') {
			conditions.push(eq(authUser.isActive, true))
		} else if (status === 'inactive') {
			conditions.push(eq(authUser.isActive, false))
		}

		if (groupId) {
			conditions.push(eq(authUser.groupId, groupId))
		}

		// Buscar usuários com informações do grupo
		const users = await db
			.select({
				id: authUser.id,
				name: authUser.name,
				email: authUser.email,
				emailVerified: authUser.emailVerified,
				groupId: authUser.groupId,
				isActive: authUser.isActive,
				lastLogin: authUser.lastLogin,
				createdAt: authUser.createdAt,
				// Informações do grupo
				groupName: group.name,
				groupIcon: group.icon,
				groupColor: group.color,
			})
			.from(authUser)
			.leftJoin(group, eq(authUser.groupId, group.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(authUser.createdAt))

		console.log('✅ Usuários carregados com sucesso:', users.length)

		return NextResponse.json({
			success: true,
			data: {
				items: users,
				total: users.length,
			},
		})
	} catch (error) {
		console.error('❌ Erro ao buscar usuários:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro ao carregar usuários',
			},
			{ status: 500 },
		)
	}
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, email, password, emailVerified, groupId, isActive } = body

		console.log('ℹ️ Criando novo usuário:', { name, email, emailVerified, groupId, isActive })

		// Validações
		if (!name || name.trim().length < 2) {
			return NextResponse.json(
				{
					success: false,
					field: 'name',
					message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres.',
				},
				{ status: 400 },
			)
		}

		if (!email || !email.includes('@')) {
			return NextResponse.json(
				{
					success: false,
					field: 'email',
					message: 'Email válido é obrigatório.',
				},
				{ status: 400 },
			)
		}

		if (!password || password.length < 8) {
			return NextResponse.json(
				{
					success: false,
					field: 'password',
					message: 'Senha deve ter pelo menos 8 caracteres.',
				},
				{ status: 400 },
			)
		}

		if (!groupId) {
			return NextResponse.json(
				{
					success: false,
					field: 'groupId',
					message: 'Grupo é obrigatório.',
				},
				{ status: 400 },
			)
		}

		// Verificar se email já existe
		const existingUser = await db.select().from(authUser).where(eq(authUser.email, email.trim().toLowerCase())).limit(1)

		if (existingUser.length > 0) {
			return NextResponse.json(
				{
					success: false,
					field: 'email',
					message: 'Já existe um usuário com este email.',
				},
				{ status: 400 },
			)
		}

		// Verificar se grupo existe
		const existingGroup = await db.select().from(group).where(eq(group.id, groupId)).limit(1)

		if (existingGroup.length === 0) {
			return NextResponse.json(
				{
					success: false,
					field: 'groupId',
					message: 'Grupo não encontrado.',
				},
				{ status: 400 },
			)
		}

		// Hash da senha
		const hashedPassword = await bcrypt.hash(password, 10)

		// Criar usuário
		const newUser = {
			id: randomUUID(),
			name: name.trim(),
			email: email.trim().toLowerCase(),
			emailVerified: emailVerified || false,
			password: hashedPassword,
			groupId,
			isActive: isActive !== undefined ? isActive : true,
		}

		await db.insert(authUser).values(newUser)

		console.log('✅ Usuário criado com sucesso:', newUser.id)

		// Retornar usuário sem senha
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = newUser

		return NextResponse.json({
			success: true,
			data: userWithoutPassword,
		})
	} catch (error) {
		console.error('❌ Erro ao criar usuário:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro interno do servidor',
			},
			{ status: 500 },
		)
	}
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { id, name, email, emailVerified, groupId, isActive, password } = body

		console.log('ℹ️ Atualizando usuário:', { id, name, email, emailVerified, groupId, isActive })

		// Validações
		if (!id) {
			return NextResponse.json(
				{
					success: false,
					field: 'id',
					message: 'ID do usuário é obrigatório.',
				},
				{ status: 400 },
			)
		}

		if (!name || name.trim().length < 2) {
			return NextResponse.json(
				{
					success: false,
					field: 'name',
					message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres.',
				},
				{ status: 400 },
			)
		}

		if (!email || !email.includes('@')) {
			return NextResponse.json(
				{
					success: false,
					field: 'email',
					message: 'Email válido é obrigatório.',
				},
				{ status: 400 },
			)
		}

		if (!groupId) {
			return NextResponse.json(
				{
					success: false,
					field: 'groupId',
					message: 'Grupo é obrigatório.',
				},
				{ status: 400 },
			)
		}

		// Verificar se usuário existe
		const existingUser = await db.select().from(authUser).where(eq(authUser.id, id)).limit(1)

		if (existingUser.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: 'Usuário não encontrado.',
				},
				{ status: 404 },
			)
		}

		// Verificar se email já existe em outro usuário
		const duplicateUser = await db
			.select()
			.from(authUser)
			.where(and(eq(authUser.email, email.trim().toLowerCase()), not(eq(authUser.id, id))))
			.limit(1)

		if (duplicateUser.length > 0) {
			return NextResponse.json(
				{
					success: false,
					field: 'email',
					message: 'Já existe outro usuário com este email.',
				},
				{ status: 400 },
			)
		}

		// Verificar se grupo existe
		const existingGroup = await db.select().from(group).where(eq(group.id, groupId)).limit(1)

		if (existingGroup.length === 0) {
			return NextResponse.json(
				{
					success: false,
					field: 'groupId',
					message: 'Grupo não encontrado.',
				},
				{ status: 400 },
			)
		}

		// Preparar dados para atualização
		const updatedData: {
			name: string
			email: string
			emailVerified: boolean
			groupId: string
			isActive: boolean
			password?: string
		} = {
			name: name.trim(),
			email: email.trim().toLowerCase(),
			emailVerified: emailVerified !== undefined ? emailVerified : false,
			groupId,
			isActive: isActive !== undefined ? isActive : true,
		}

		// Se senha foi fornecida, fazer hash
		if (password && password.length >= 8) {
			updatedData.password = await bcrypt.hash(password, 10)
		}

		// Atualizar usuário
		await db.update(authUser).set(updatedData).where(eq(authUser.id, id))

		console.log('✅ Usuário atualizado com sucesso:', id)

		// Retornar dados sem senha
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _pwd, ...responseData } = updatedData

		return NextResponse.json({
			success: true,
			data: { id, ...responseData },
		})
	} catch (error) {
		console.error('❌ Erro ao atualizar usuário:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro interno do servidor',
			},
			{ status: 500 },
		)
	}
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		console.log('ℹ️ Excluindo usuário:', { id })

		if (!id) {
			return NextResponse.json(
				{
					success: false,
					message: 'ID do usuário é obrigatório.',
				},
				{ status: 400 },
			)
		}

		// Verificar se usuário existe
		const existingUser = await db.select().from(authUser).where(eq(authUser.id, id)).limit(1)

		if (existingUser.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: 'Usuário não encontrado.',
				},
				{ status: 404 },
			)
		}

		// Verificar se usuário tem dependências (problemas, soluções, etc.)
		// Por segurança, vamos apenas desativar em vez de excluir
		await db
			.update(authUser)
			.set({
				isActive: false,
				email: `deleted_${Date.now()}_${existingUser[0].email}`, // Garantir que email não conflite
			})
			.where(eq(authUser.id, id))

		console.log('✅ Usuário desativado com sucesso:', id)

		return NextResponse.json({
			success: true,
			message: 'Usuário desativado com sucesso.',
		})
	} catch (error) {
		console.error('❌ Erro ao excluir usuário:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro interno do servidor',
			},
			{ status: 500 },
		)
	}
}
