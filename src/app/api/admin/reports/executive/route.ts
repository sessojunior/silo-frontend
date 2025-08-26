import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { productProblem, productSolution, product, authUser, group, projectTask, projectActivity, project } from '@/lib/db/schema'
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
		const groupId = searchParams.get('groupId')

		// Construir filtros de data
		const now = new Date()
		const defaultStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
		const start = startDate ? new Date(startDate) : defaultStartDate
		const end = endDate ? new Date(endDate) : now

		console.log('🔵 Buscando relatório executivo:', { start, end, productId, groupId })

		// Buscar produtos
		const productsQuery = db
			.select({
				id: product.id,
				name: product.name,
				description: product.description,
				available: product.available,
				priority: product.priority,
				turns: product.turns,
			})
			.from(product)

		const products = await productsQuery

		// Buscar problemas no período
		const problemsQuery = db
			.select({
				id: productProblem.id,
				productId: productProblem.productId,
				title: productProblem.title,
				createdAt: productProblem.createdAt,
				updatedAt: productProblem.updatedAt,
				userId: productProblem.userId,
			})
			.from(productProblem)
			.where(and(gte(productProblem.createdAt, start), lte(productProblem.createdAt, end), productId ? eq(productProblem.productId, productId) : undefined))

		const problems = await problemsQuery

		// Buscar soluções no período
		const solutionsQuery = db
			.select({
				id: productSolution.id,
				productProblemId: productSolution.productProblemId,
				description: productSolution.description,
				createdAt: productSolution.createdAt,
				userId: productSolution.userId,
			})
			.from(productSolution)
			.where(and(gte(productSolution.createdAt, start), lte(productSolution.createdAt, end)))

		const solutions = await solutionsQuery

		// Buscar usuários ativos
		const usersQuery = db
			.select({
				id: authUser.id,
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
				id: group.id,
				name: group.name,
				description: group.description,
			})
			.from(group)

		const groups = await groupsQuery

		// Buscar projetos e atividades
		const projectsQuery = db
			.select({
				id: project.id,
				name: project.name,
				shortDescription: project.shortDescription,
				description: project.description,
				status: project.status,
				priority: project.priority,
				startDate: project.startDate,
				endDate: project.endDate,
				createdAt: project.createdAt,
			})
			.from(project)

		const projects = await projectsQuery

		const activitiesQuery = db
			.select({
				id: projectActivity.id,
				projectId: projectActivity.projectId,
				name: projectActivity.name,
				description: projectActivity.description,
				status: projectActivity.status,
				priority: projectActivity.priority,
				startDate: projectActivity.startDate,
				endDate: projectActivity.endDate,
				createdAt: projectActivity.createdAt,
			})
			.from(projectActivity)

		const activities = await activitiesQuery

		const tasksQuery = db
			.select({
				id: projectTask.id,
				projectActivityId: projectTask.projectActivityId,
				name: projectTask.name,
				description: projectTask.description,
				status: projectTask.status,
				priority: projectTask.priority,
				estimatedDays: projectTask.estimatedDays,
				startDate: projectTask.startDate,
				endDate: projectTask.endDate,
				createdAt: projectTask.createdAt,
				updatedAt: projectTask.updatedAt,
			})
			.from(projectTask)

		const tasks = await tasksQuery

		// Calcular KPIs principais
		const totalProducts = products.length
		const availableProducts = products.filter((p) => p.available).length
		const totalProblems = problems.length
		const totalSolutions = solutions.length
		const totalUsers = users.length
		const totalGroups = groups.length
		const totalProjects = projects.length
		const activeProjects = projects.filter((p) => p.status === 'active').length
		const totalActivities = activities.length
		const totalTasks = tasks.length
		const completedTasks = tasks.filter((t) => t.status === 'done').length

		// Calcular métricas de tempo
		const avgProblemCreationRate = totalProblems > 0 ? totalProblems / 30 : 0 // problemas por dia no período
		const avgSolutionCreationRate = totalSolutions > 0 ? totalSolutions / 30 : 0 // soluções por dia no período
		const avgTaskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0 // % de tarefas concluídas

		// Calcular produtividade por produto
		const productMetrics = products.map((product) => {
			const productProblems = problems.filter((p) => p.productId === product.id)
			const productSolutions = solutions.filter((s) => {
				const problem = problems.find((p) => p.id === s.productProblemId)
				return problem && problem.productId === product.id
			})

			return {
				productId: product.id,
				name: product.name,
				available: product.available,
				priority: product.priority,
				totalProblems: productProblems.length,
				totalSolutions: productSolutions.length,
				activityRate: productProblems.length + productSolutions.length,
			}
		})

		// Calcular tendências (últimos 7 dias vs período anterior)
		const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
		const previous7Days = new Date(last7Days.getTime() - 7 * 24 * 60 * 60 * 1000)

		const recentProblems = problems.filter((p) => p.createdAt >= last7Days)
		const previousProblems = problems.filter((p) => p.createdAt >= previous7Days && p.createdAt < last7Days)

		const recentSolutions = solutions.filter((s) => s.createdAt >= last7Days)
		const previousSolutions = solutions.filter((s) => s.createdAt >= previous7Days && s.createdAt < last7Days)

		const trends = {
			problems: {
				current: recentProblems.length,
				previous: previousProblems.length,
				change: previousProblems.length > 0 ? ((recentProblems.length - previousProblems.length) / previousProblems.length) * 100 : 0,
			},
			solutions: {
				current: recentSolutions.length,
				previous: previousSolutions.length,
				change: previousSolutions.length > 0 ? ((recentSolutions.length - previousSolutions.length) / previousSolutions.length) * 100 : 0,
			},
		}

		// Calcular distribuição por prioridade de produtos
		const productPriorityDistribution = {
			low: products.filter((p) => p.priority === 'low').length,
			normal: products.filter((p) => p.priority === 'normal').length,
			high: products.filter((p) => p.priority === 'high').length,
			urgent: products.filter((p) => p.priority === 'urgent').length,
		}

		// Calcular distribuição por status de projetos
		const projectStatusDistribution = {
			active: projects.filter((p) => p.status === 'active').length,
			completed: projects.filter((p) => p.status === 'completed').length,
			paused: projects.filter((p) => p.status === 'paused').length,
			cancelled: projects.filter((p) => p.status === 'cancelled').length,
		}

		const reportData = {
			period: {
				start: start.toISOString(),
				end: end.toISOString(),
				days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
			},
			filters: {
				productId,
				groupId,
			},
			summary: {
				totalProducts,
				availableProducts,
				totalProblems,
				totalSolutions,
				totalUsers,
				totalGroups,
				totalProjects,
				activeProjects,
				totalActivities,
				totalTasks,
				completedTasks,
			},
			kpis: {
				problemCreationRate: Math.round(avgProblemCreationRate * 10) / 10,
				solutionCreationRate: Math.round(avgSolutionCreationRate * 10) / 10,
				taskCompletionRate: Math.round(avgTaskCompletionRate * 10) / 10,
				productActivityRate: Math.round((productMetrics.reduce((sum, p) => sum + p.activityRate, 0) / totalProducts) * 10) / 10,
			},
			productMetrics,
			trends,
			productPriorityDistribution,
			projectStatusDistribution,
			topProducts: productMetrics.sort((a, b) => b.totalProblems - a.totalProblems).slice(0, 5),
			recentActivity: {
				problems: problems.slice(0, 10),
				solutions: solutions.slice(0, 10),
				tasks: tasks.slice(0, 10),
			},
		}

		console.log('✅ Relatório executivo gerado com sucesso')
		return NextResponse.json(reportData)
	} catch (error) {
		console.error('❌ Erro ao gerar relatório executivo:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
