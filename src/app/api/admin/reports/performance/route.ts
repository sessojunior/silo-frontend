import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { productProblem, productSolution, authUser, group } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'

export async function GET(request: NextRequest) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		// Extrair parâmetros da query
		const { searchParams } = new URL(request.url)
		const startDate = searchParams.get('startDate')
		const endDate = searchParams.get('endDate')
		const productId = searchParams.get('productId')
		const userId = searchParams.get('userId')
		const groupId = searchParams.get('groupId')

		// Construir filtros de data
		const now = new Date()
		const defaultStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
		const start = startDate ? new Date(startDate) : defaultStartDate
		const end = endDate ? new Date(endDate) : now

		console.log('🔵 Buscando relatório de performance:', { start, end, productId, userId, groupId })

		// Buscar problemas no período
		const problemsQuery = db
			.select({
				problemId: productProblem.id,
				productId: productProblem.productId,
				title: productProblem.title,
				createdAt: productProblem.createdAt,
				updatedAt: productProblem.updatedAt,
				userId: productProblem.userId,
			})
			.from(productProblem)
			.where(and(gte(productProblem.createdAt, start), lte(productProblem.createdAt, end), productId ? eq(productProblem.productId, productId) : undefined, userId ? eq(productProblem.userId, userId) : undefined))

		const problems = await problemsQuery

		// Buscar soluções no período
		const solutionsQuery = db
			.select({
				solutionId: productSolution.id,
				productProblemId: productSolution.productProblemId,
				description: productSolution.description,
				createdAt: productSolution.createdAt,
				userId: productSolution.userId,
			})
			.from(productSolution)
			.where(and(gte(productSolution.createdAt, start), lte(productSolution.createdAt, end), userId ? eq(productSolution.userId, userId) : undefined))

		const solutions = await solutionsQuery

		// Buscar usuários e grupos
		const usersQuery = db
			.select({
				userId: authUser.id,
				name: authUser.name,
				email: authUser.email,
				isActive: authUser.isActive,
				createdAt: authUser.createdAt,
			})
			.from(authUser)
			.where(eq(authUser.isActive, true))

		const users = await usersQuery

		// Buscar grupos
		const groupsQuery = db
			.select({
				groupId: group.id,
				name: group.name,
				description: group.description,
			})
			.from(group)

		const groups = await groupsQuery

		// Calcular métricas de performance por usuário
		const userPerformance = users.map((user) => {
			const userProblems = problems.filter((p) => p.userId === user.userId)
			const userSolutions = solutions.filter((s) => s.userId === user.userId)

			// Calcular produtividade baseada em problemas criados e soluções fornecidas
			const productivity = userProblems.length + userSolutions.length

			return {
				userId: user.userId,
				name: user.name,
				email: user.email,
				problemsCreated: userProblems.length,
				solutionsProvided: userSolutions.length,
				productivity: productivity,
				lastActivity: userProblems.length > 0 || userSolutions.length > 0 ? Math.max(...userProblems.map((p) => new Date(p.createdAt).getTime()), ...userSolutions.map((s) => new Date(s.createdAt).getTime())) : 0,
			}
		})

		// Ordenar por produtividade
		userPerformance.sort((a, b) => b.productivity - a.productivity)

		// Calcular métricas gerais
		const totalProblems = problems.length
		const totalSolutions = solutions.length
		const avgProblemsPerUser = users.length > 0 ? totalProblems / users.length : 0
		const avgSolutionsPerUser = users.length > 0 ? totalSolutions / users.length : 0

		// Agrupar por grupo se especificado
		let groupPerformance = null
		if (groupId) {
			const groupUsers = userPerformance.filter(() => {
				// Aqui você precisaria implementar a lógica para verificar se o usuário pertence ao grupo
				// Por enquanto, vamos retornar todos os usuários
				return true
			})

			groupPerformance = {
				groupId,
				groupName: groups.find((g) => g.groupId === groupId)?.name || 'Grupo',
				users: groupUsers,
				totalProblems: groupUsers.reduce((sum, user) => sum + user.problemsCreated, 0),
				totalSolutions: groupUsers.reduce((sum, user) => sum + user.solutionsProvided, 0),
				avgProblemsPerUser: groupUsers.length > 0 ? groupUsers.reduce((sum, user) => sum + user.problemsCreated, 0) / groupUsers.length : 0,
				avgSolutionsPerUser: groupUsers.length > 0 ? groupUsers.reduce((sum, user) => sum + user.solutionsProvided, 0) / groupUsers.length : 0,
			}
		}

		const reportData = {
			period: {
				start: start.toISOString(),
				end: end.toISOString(),
				days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
			},
			filters: {
				productId,
				userId,
				groupId,
			},
			summary: {
				totalProblems,
				totalSolutions,
				avgProblemsPerUser: Math.round(avgProblemsPerUser * 10) / 10,
				avgSolutionsPerUser: Math.round(avgSolutionsPerUser * 10) / 10,
				activeUsers: users.length,
				totalGroups: groups.length,
			},
			userPerformance,
			groupPerformance,
			topPerformers: userPerformance.slice(0, 5),
			recentActivity: {
				problems: problems.slice(0, 10),
				solutions: solutions.slice(0, 10),
			},
		}

		console.log('✅ Relatório de performance gerado com sucesso')
		return NextResponse.json(reportData)
	} catch (error) {
		console.error('❌ Erro ao gerar relatório de performance:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
