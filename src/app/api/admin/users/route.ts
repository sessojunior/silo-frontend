import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authUser, group, userGroup } from '@/lib/db/schema'
import { eq, desc, ilike, and, not, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { getAuthUser } from '@/lib/auth/token'

// Interface para grupos de usuário
interface UserGroupInput {
	groupId: string
	role?: string
}

// GET - Listar usuários com busca e filtros
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

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

		// Se filtro por grupo específico, buscar apenas usuários desse grupo
		let userIdsInGroup: string[] = []
		if (groupId) {
			const usersInGroup = await db.select({ userId: userGroup.userId }).from(userGroup).where(eq(userGroup.groupId, groupId))

			userIdsInGroup = usersInGroup.map((u) => u.userId)

			if (userIdsInGroup.length > 0) {
				conditions.push(inArray(authUser.id, userIdsInGroup))
			} else {
				// Se grupo não tem usuários, retornar array vazio
				return NextResponse.json({
					success: true,
					data: {
						items: [],
						total: 0,
					},
				})
			}
		}

		// Buscar usuários
		const users = await db
			.select({
				id: authUser.id,
				name: authUser.name,
				email: authUser.email,
				image: authUser.image,
				emailVerified: authUser.emailVerified,
				isActive: authUser.isActive,
				lastLogin: authUser.lastLogin,
				createdAt: authUser.createdAt,
			})
			.from(authUser)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(authUser.createdAt))

		// Buscar grupos para cada usuário
		const usersWithGroups = []
		for (const user of users) {
			const userGroups = await db
				.select({
					groupId: group.id,
					groupName: group.name,
					groupIcon: group.icon,
					groupColor: group.color,
				})
				.from(userGroup)
				.innerJoin(group, eq(group.id, userGroup.groupId))
				.where(eq(userGroup.userId, user.id))

			// Para compatibilidade com a interface existente, vamos usar o primeiro grupo como groupId
			const primaryGroup = userGroups[0]

			usersWithGroups.push({
				...user,
				groupId: primaryGroup?.groupId || null,
				groupName: primaryGroup?.groupName || null,
				groupIcon: primaryGroup?.groupIcon || null,
				groupColor: primaryGroup?.groupColor || null,
				groups: userGroups, // Lista completa de grupos
			})
		}

		console.log('✅ Usuários carregados com sucesso:', usersWithGroups.length)

		return NextResponse.json({
			success: true,
			data: {
				items: usersWithGroups,
				total: usersWithGroups.length,
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
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

		const body = await request.json()
		const { name, email, password, emailVerified, groups, groupId, isActive } = body

		// Determinar grupos usando novo formato ou legado
		const userGroups: UserGroupInput[] = groups || (groupId ? [{ groupId, role: 'member' }] : [])

		console.log('ℹ️ Criando novo usuário:', { name, email, emailVerified, groups: userGroups, isActive })

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

		if (!userGroups || userGroups.length === 0) {
			return NextResponse.json(
				{
					success: false,
					field: 'groups',
					message: 'Pelo menos um grupo é obrigatório.',
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

		// Verificar se todos os grupos existem
		const groupIds = userGroups.map((ug: UserGroupInput) => ug.groupId)
		const existingGroups = await db.select().from(group).where(inArray(group.id, groupIds))

		if (existingGroups.length !== groupIds.length) {
			const foundGroupIds = existingGroups.map((g) => g.id)
			const missingGroups = groupIds.filter((id: string) => !foundGroupIds.includes(id))

			return NextResponse.json(
				{
					success: false,
					field: 'groups',
					message: `Grupos não encontrados: ${missingGroups.join(', ')}`,
				},
				{ status: 400 },
			)
		}

		// Hash da senha
		const hashedPassword = await bcrypt.hash(password, 10)

		// Criar usuário
		const userId = randomUUID()
		const newUser = {
			id: userId,
			name: name.trim(),
			email: email.trim().toLowerCase(),
			emailVerified: emailVerified || false,
			password: hashedPassword,
			isActive: isActive !== undefined ? isActive : true,
		}

		await db.insert(authUser).values(newUser)

		// Adicionar usuário aos grupos via tabela user_group
		const newUserGroupEntries = userGroups.map((ug: UserGroupInput) => ({
			userId: userId,
			groupId: ug.groupId,
			role: ug.role || 'member',
		}))

		await db.insert(userGroup).values(newUserGroupEntries)

		console.log('✅ Usuário criado com sucesso:', {
			userId,
			groups: userGroups.map((ug) => ug.groupId),
			newEntries: newUserGroupEntries.length,
		})

		// Buscar grupos criados para retorno
		const finalUserGroups = await db
			.select({
				groupId: userGroup.groupId,
				groupName: group.name,
				groupIcon: group.icon,
				groupColor: group.color,
			})
			.from(userGroup)
			.innerJoin(group, eq(group.id, userGroup.groupId))
			.where(eq(userGroup.userId, userId))

		// Retornar usuário sem senha
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = newUser

		return NextResponse.json({
			success: true,
			data: {
				...userWithoutPassword,
				groups: finalUserGroups,
				// Manter compatibilidade com código legado
				groupId: finalUserGroups[0]?.groupId || null,
			},
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
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

		const body = await request.json()
		const { id, name, email, emailVerified, groups, groupId, isActive, password } = body

		// Suporte a ambos os formatos: novo (groups array) e legado (groupId único)
		const userGroups: UserGroupInput[] = groups || (groupId ? [{ groupId, role: 'member' }] : [])

		console.log('ℹ️ Atualizando usuário:', { id, name, email, emailVerified, userGroups, isActive })

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

		if (!userGroups || userGroups.length === 0) {
			return NextResponse.json(
				{
					success: false,
					field: 'groups',
					message: 'Pelo menos um grupo é obrigatório.',
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

		// Verificar se todos os grupos existem
		const groupIds = userGroups.map((ug: UserGroupInput) => ug.groupId)
		const existingGroups = await db.select().from(group).where(inArray(group.id, groupIds))

		if (existingGroups.length !== groupIds.length) {
			const foundGroupIds = existingGroups.map((g) => g.id)
			const missingGroups = groupIds.filter((id: string) => !foundGroupIds.includes(id))

			return NextResponse.json(
				{
					success: false,
					field: 'groups',
					message: `Grupos não encontrados: ${missingGroups.join(', ')}`,
				},
				{ status: 400 },
			)
		}

		// Preparar dados para atualização
		const updatedData: {
			name: string
			email: string
			emailVerified: boolean
			isActive: boolean
			password?: string
		} = {
			name: name.trim(),
			email: email.trim().toLowerCase(),
			emailVerified: emailVerified !== undefined ? emailVerified : false,
			isActive: isActive !== undefined ? isActive : true,
		}

		// Se senha foi fornecida, fazer hash
		if (password && password.length >= 8) {
			updatedData.password = await bcrypt.hash(password, 10)
		}

		// Atualizar usuário
		await db.update(authUser).set(updatedData).where(eq(authUser.id, id))

		// Buscar grupos atuais do usuário
		const currentUserGroups = await db.select({ groupId: userGroup.groupId, role: userGroup.role }).from(userGroup).where(eq(userGroup.userId, id))

		const currentGroupIds = currentUserGroups.map((ug) => ug.groupId).sort()
		const newGroupIds = userGroups.map((ug: UserGroupInput) => ug.groupId).sort()

		console.log('🔵 Verificando mudança de grupos:', {
			userId: id,
			currentGroups: currentGroupIds,
			newGroups: newGroupIds,
			shouldUpdate: JSON.stringify(currentGroupIds) !== JSON.stringify(newGroupIds),
		})

		// Se os grupos são diferentes, fazer a mudança
		if (JSON.stringify(currentGroupIds) !== JSON.stringify(newGroupIds)) {
			console.log('🔵 Fazendo mudança de grupos...', {
				userId: id,
				from: currentGroupIds,
				to: newGroupIds,
			})

			// Remover de todos os grupos atuais
			await db.delete(userGroup).where(eq(userGroup.userId, id))

			// Adicionar aos novos grupos
			const newUserGroupEntries = userGroups.map((ug: UserGroupInput) => ({
				userId: id,
				groupId: ug.groupId,
				role: ug.role || 'member',
			}))

			await db.insert(userGroup).values(newUserGroupEntries)

			console.log('✅ Usuário atualizado nos grupos:', {
				userId: id,
				from: currentGroupIds,
				to: newGroupIds,
				newEntries: newUserGroupEntries.length,
			})
		} else {
			console.log('🟡 Usuário já está nos grupos desejados, nenhuma mudança necessária')
		}

		console.log('✅ Usuário atualizado com sucesso:', id)

		// Retornar dados sem senha
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _pwd, ...responseData } = updatedData

		// Buscar grupos atualizados para retorno
		const finalUserGroups = await db
			.select({
				groupId: userGroup.groupId,
				groupName: group.name,
				groupIcon: group.icon,
				groupColor: group.color,
			})
			.from(userGroup)
			.innerJoin(group, eq(group.id, userGroup.groupId))
			.where(eq(userGroup.userId, id))

		return NextResponse.json({
			success: true,
			data: {
				id,
				...responseData,
				groups: finalUserGroups,
				// Manter compatibilidade com código legado
				groupId: finalUserGroups[0]?.groupId || null,
			},
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
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

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

		// Remover dos grupos
		await db.delete(userGroup).where(eq(userGroup.userId, id))

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
