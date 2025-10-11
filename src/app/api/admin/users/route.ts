import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authUser, group, userGroup, userProfile, userPreferences, productActivity, productActivityHistory, productProblem, productSolution, productSolutionChecked, projectTaskHistory, projectTaskUser, chatMessage, chatUserPresence, rateLimit, authProvider, authCode, authSession } from '@/lib/db/schema'
import { eq, desc, ilike, and, not, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { getAuthUser } from '@/lib/auth/token'
import { requireAdmin } from '@/lib/auth/admin'
import { isValidEmail, isValidDomain } from '@/lib/auth/validate'

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

		console.log('ℹ️ [API_USERS] Buscando usuários:', { search, status, groupId })

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


		return NextResponse.json({
			success: true,
			data: {
				items: usersWithGroups,
				total: usersWithGroups.length,
			},
		})
	} catch (error) {
		console.error('❌ [API_USERS] Erro ao buscar usuários:', { error })
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

		// Verificar se o usuário é administrador
		const adminCheck = await requireAdmin(user.id)
		if (!adminCheck.success) {
			return NextResponse.json({ field: null, message: adminCheck.error }, { status: 403 })
		}

		const body = await request.json()
		const { name, email, password, emailVerified, groups, groupId, isActive } = body

		// Determinar grupos usando novo formato ou legado
		const userGroups: UserGroupInput[] = groups || (groupId ? [{ groupId, role: 'member' }] : [])

		console.log('ℹ️ [API_USERS] Criando novo usuário:', { name, email, emailVerified, groups: userGroups, isActive })

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

		// Validação de email robusta
		if (!email || !isValidEmail(email)) {
			return NextResponse.json(
				{
					success: false,
					field: 'email',
					message: 'Email inválido.',
				},
				{ status: 400 },
			)
		}

		// Validação de domínio @inpe.br
		if (!isValidDomain(email)) {
			return NextResponse.json(
				{
					success: false,
					field: 'email',
					message: 'Apenas e-mails do domínio @inpe.br são permitidos.',
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
		console.error('❌ [API_USERS] Erro ao criar usuário:', { error })
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

		// Verificar se o usuário é administrador
		const adminCheck = await requireAdmin(user.id)
		if (!adminCheck.success) {
			return NextResponse.json({ field: null, message: adminCheck.error }, { status: 403 })
		}

		const body = await request.json()
		const { id, name, email, emailVerified, groups, groupId, isActive, password } = body

		// Suporte a ambos os formatos: novo (groups array) e legado (groupId único)
		const userGroups: UserGroupInput[] = groups || (groupId ? [{ groupId, role: 'member' }] : [])

		console.log('ℹ️ [API_USERS] Atualizando usuário:', { id, name, email, emailVerified, userGroups, isActive })

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

		// Validação de email robusta
		if (!email || !isValidEmail(email)) {
			return NextResponse.json(
				{
					success: false,
					field: 'email',
					message: 'Email inválido.',
				},
				{ status: 400 },
			)
		}

		// Validação de domínio @inpe.br
		if (!isValidDomain(email)) {
			return NextResponse.json(
				{
					success: false,
					field: 'email',
					message: 'Apenas e-mails do domínio @inpe.br são permitidos.',
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

		// Proteções para auto-alteração
		if (user.id === id) {
			console.warn('⚠️ [API_USERS] Usuário tentando alterar a si mesmo:', { email: user.email })

			// Não permitir alterar nome próprio
			if (name !== existingUser[0].name) {
				return NextResponse.json(
					{
						success: false,
						field: 'name',
						message: 'Você não pode alterar seu próprio nome.',
					},
					{ status: 400 },
				)
			}

			// Não permitir alterar email próprio
			if (email !== existingUser[0].email) {
				return NextResponse.json(
					{
						success: false,
						field: 'email',
						message: 'Você não pode alterar seu próprio email.',
					},
					{ status: 400 },
				)
			}

			// Não permitir desativar a si mesmo
			if (isActive === false) {
				return NextResponse.json(
					{
						success: false,
						field: 'isActive',
						message: 'Você não pode desativar sua própria conta.',
					},
					{ status: 400 },
				)
			}

			// Não permitir desmarcar email verificado
			if (emailVerified === false) {
				return NextResponse.json(
					{
						success: false,
						field: 'emailVerified',
						message: 'Você não pode desmarcar seu próprio email como não verificado.',
					},
					{ status: 400 },
				)
			}

			// Verificar se está tentando se remover do grupo Administradores
			const currentUserGroups = await db
				.select({ groupId: userGroup.groupId, groupName: group.name })
				.from(userGroup)
				.innerJoin(group, eq(userGroup.groupId, group.id))
				.where(eq(userGroup.userId, id))

			const isCurrentlyAdmin = currentUserGroups.some(ug => ug.groupName === 'Administradores')
			const willBeAdmin = userGroups.some(ug => {
				const group = existingGroups.find(g => g.id === ug.groupId)
				return group?.name === 'Administradores'
			})

			if (isCurrentlyAdmin && !willBeAdmin) {
				return NextResponse.json(
					{
						success: false,
						field: 'groups',
						message: 'Você não pode se remover do grupo Administradores.',
					},
					{ status: 400 },
				)
			}

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


		// Se os grupos são diferentes, fazer a mudança
		if (JSON.stringify(currentGroupIds) !== JSON.stringify(newGroupIds)) {

			// Remover de todos os grupos atuais
			await db.delete(userGroup).where(eq(userGroup.userId, id))

			// Adicionar aos novos grupos
			const newUserGroupEntries = userGroups.map((ug: UserGroupInput) => ({
				userId: id,
				groupId: ug.groupId,
				role: ug.role || 'member',
			}))

			await db.insert(userGroup).values(newUserGroupEntries)

		} else {
			console.log('ℹ️ [API_USERS] Usuário já está nos grupos desejados, nenhuma mudança necessária')
		}


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
		console.error('❌ [API_USERS] Erro ao atualizar usuário:', { error })
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

		// Verificar se o usuário é administrador
		const adminCheck = await requireAdmin(user.id)
		if (!adminCheck.success) {
			return NextResponse.json({ field: null, message: adminCheck.error }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		console.log('ℹ️ [API_USERS] Excluindo usuário:', { id })

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

		// Verificar se o usuário a ser excluído é administrador
		const userGroups = await db.select({ role: userGroup.role, groupName: group.name }).from(userGroup).innerJoin(group, eq(userGroup.groupId, group.id)).where(eq(userGroup.userId, id))

		const isAdmin = userGroups.some((ug) => ug.role === 'admin')

		// Se for administrador, verificar se é o último administrador do sistema
		if (isAdmin) {
			const allAdmins = await db.select({ userId: userGroup.userId }).from(userGroup).where(eq(userGroup.role, 'admin'))

			if (allAdmins.length <= 1) {
				return NextResponse.json(
					{
						success: false,
						message: 'Não é possível excluir o último administrador do sistema. Deve haver pelo menos um administrador ativo.',
					},
					{ status: 400 },
				)
			}
		}


		// Executar exclusão em cascata usando transação
		await db.transaction(async (tx) => {

			// 1. Buscar todas as atividades do produto criadas pelo usuário
			const productActivities = await tx.select({ id: productActivity.id }).from(productActivity).where(eq(productActivity.userId, id))
			const productActivityIds = productActivities.map((a) => a.id)

			// 2. Excluir histórico das atividades de produto
			if (productActivityIds.length > 0) {
				await tx.delete(productActivityHistory).where(inArray(productActivityHistory.productActivityId, productActivityIds))
			}

			// 3. Excluir atividades de produto
			await tx.delete(productActivity).where(eq(productActivity.userId, id))

			// 4. Buscar todos os problemas criados pelo usuário
			const problems = await tx.select({ id: productProblem.id }).from(productProblem).where(eq(productProblem.userId, id))
			const problemIds = problems.map((p) => p.id)

			// 5. Para cada problema, excluir soluções e suas dependências
			if (problemIds.length > 0) {
				// Buscar todas as soluções dos problemas
				const solutions = await tx.select({ id: productSolution.id }).from(productSolution).where(inArray(productSolution.productProblemId, problemIds))
				const solutionIds = solutions.map((s) => s.id)

				// Excluir verificações das soluções
				if (solutionIds.length > 0) {
					await tx.delete(productSolutionChecked).where(inArray(productSolutionChecked.productSolutionId, solutionIds))
				}

				// Excluir todas as soluções
				await tx.delete(productSolution).where(inArray(productSolution.productProblemId, problemIds))

				// Excluir todos os problemas
				await tx.delete(productProblem).where(eq(productProblem.userId, id))
			}

			// 6. (projectActivity não tem userId - não precisa excluir)

			// 7. Buscar todas as tarefas associadas ao usuário
			// const taskUsers = await tx.select({ taskId: projectTaskUser.taskId }).from(projectTaskUser).where(eq(projectTaskUser.userId, id))
			// const taskIds = taskUsers.map((tu) => tu.taskId)

			// 8. Excluir histórico das tarefas criado pelo usuário (não todas as tarefas associadas)
			await tx.delete(projectTaskHistory).where(eq(projectTaskHistory.userId, id))

			// 9. Excluir associações usuário-tarefa
			await tx.delete(projectTaskUser).where(eq(projectTaskUser.userId, id))

			// 10. Excluir mensagens de chat do usuário
			await tx.delete(chatMessage).where(eq(chatMessage.senderUserId, id))

			// 11. Excluir presença do chat
			await tx.delete(chatUserPresence).where(eq(chatUserPresence.userId, id))

			// 12. Excluir registros de rate limit
			await tx.delete(rateLimit).where(eq(rateLimit.email, existingUser[0].email))

			// 13. Excluir sessões de autenticação
			await tx.delete(authSession).where(eq(authSession.userId, id))

			// 14. Excluir códigos de autenticação
			await tx.delete(authCode).where(eq(authCode.userId, id))

			// 15. Excluir provedores de autenticação
			await tx.delete(authProvider).where(eq(authProvider.userId, id))

			// 16. Excluir perfil do usuário
			await tx.delete(userProfile).where(eq(userProfile.userId, id))

			// 17. Excluir preferências do usuário
			await tx.delete(userPreferences).where(eq(userPreferences.userId, id))

			// 18. Remover dos grupos
			await tx.delete(userGroup).where(eq(userGroup.userId, id))

			// 19. Finalmente, excluir o usuário
			await tx.delete(authUser).where(eq(authUser.id, id))
		})


		return NextResponse.json({
			success: true,
			message: 'Usuário e todos os dados relacionados excluídos com sucesso.',
		})
	} catch (error) {
		console.error('❌ [API_USERS] Erro ao excluir usuário:', { error })
		return NextResponse.json(
			{
				success: false,
				error: 'Erro interno do servidor',
			},
			{ status: 500 },
		)
	}
}
