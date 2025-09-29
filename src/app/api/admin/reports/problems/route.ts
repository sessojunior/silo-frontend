import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productProblem, productProblemCategory, product, authUser, productSolution } from '@/lib/db/schema'
import { eq, and, gte, lte, ne, inArray, sql } from 'drizzle-orm'
import { getToday, getDaysAgo, formatDate } from '@/lib/dateUtils'
import { NO_INCIDENTS_CATEGORY_ID, NO_INCIDENTS_CATEGORY_NAME } from '@/lib/constants'

export async function GET(request: Request) {
	try {
		console.log('🔵 Iniciando busca de relatório de problemas')

		const { searchParams } = new URL(request.url)
		const dateRange = searchParams.get('dateRange') || '30d'
		const startDate = searchParams.get('startDate')
		const endDate = searchParams.get('endDate')
		const productId = searchParams.get('productId')
		const problemCategory = searchParams.get('problemCategory')

		// Calcular período baseado no dateRange - timezone São Paulo
		const end = endDate ? formatDate(endDate) : getToday()
		const start = startDate
			? formatDate(startDate)
			: (() => {
					switch (dateRange) {
						case '7d':
							return getDaysAgo(7)
						case '90d':
							return getDaysAgo(90)
						default: // 30d
							return getDaysAgo(30)
					}
				})()

		console.log('📅 Período de análise:', { start, end })

		// Buscar problemas no período (excluindo "Não houve incidentes")
		const problemsQuery = db
			.select({
				id: productProblem.id,
				productId: productProblem.productId,
				userId: productProblem.userId,
				title: productProblem.title,
				description: productProblem.description,
				createdAt: productProblem.createdAt,
				updatedAt: productProblem.updatedAt,
				problemCategoryId: productProblem.problemCategoryId,
			})
			.from(productProblem)
			.where(
				and(
					gte(productProblem.createdAt, new Date(start + 'T00:00:00')),
					lte(productProblem.createdAt, new Date(end + 'T23:59:59')),
					ne(productProblem.problemCategoryId, NO_INCIDENTS_CATEGORY_ID), // ← FILTRO AUTOMÁTICO
					productId ? eq(productProblem.productId, productId) : undefined,
					problemCategory ? eq(productProblem.problemCategoryId, problemCategory) : undefined,
				),
			)

		const problems = await problemsQuery
		console.log('✅ Problemas encontrados:', problems.length)

		// Buscar categorias de problemas
		const categories = await db.select().from(productProblemCategory)
		console.log('✅ Categorias encontradas:', categories.length)

		// Calcular problemas por categoria (excluindo "Não houve incidentes")
		const problemsByCategory = await Promise.all(
			categories
				.filter((cat) => cat.name !== NO_INCIDENTS_CATEGORY_NAME) // ← FILTRO AUTOMÁTICO
				.map(async (category) => {
					const categoryProblems = problems.filter((p) => p.problemCategoryId === category.id)
					const problemsCount = categoryProblems.length

					// Calcular tempo médio de resolução baseado em soluções reais
					let avgResolutionHours = 0
					if (problemsCount > 0) {
						// Buscar soluções para problemas desta categoria
						const categoryProblemIds = categoryProblems.map(p => p.id)
						const solutions = await db
							.select({
								productProblemId: productSolution.productProblemId,
								createdAt: productSolution.createdAt,
							})
							.from(productSolution)
							.where(inArray(productSolution.productProblemId, categoryProblemIds))

						// Calcular tempo médio de resolução
						if (solutions.length > 0) {
							const resolutionTimes = solutions.map(sol => {
								const problem = categoryProblems.find(p => p.id === sol.productProblemId)
								if (problem) {
									const resolutionTimeMs = sol.createdAt.getTime() - problem.createdAt.getTime()
									return resolutionTimeMs / (1000 * 60 * 60) // Converter para horas
								}
								return 0
							}).filter(time => time > 0)

							if (resolutionTimes.length > 0) {
								avgResolutionHours = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
							}
						}
					}

					return {
						id: category.id,
						name: category.name,
						color: category.color || '#6b7280',
						problemsCount,
						avgResolutionHours,
					}
				})
		).then(results => results.filter((cat) => cat.problemsCount > 0)) // Apenas categorias com problemas

		// Calcular problemas por produto
		const productsWithProblems = await db
			.select({
				id: product.id,
				name: product.name,
				slug: product.slug,
			})
			.from(product)

		const problemsByProduct = productsWithProblems
			.map((prod) => {
				const productProblems = problems.filter((p) => p.productId === prod.id)
				const problemsCount = productProblems.length
				const resolvedCount = Math.floor(problemsCount * 0.8) // Mockado por enquanto
				const resolutionRate = problemsCount > 0 ? (resolvedCount / problemsCount) * 100 : 0

				return {
					id: prod.id,
					name: prod.name,
					slug: prod.slug,
					problemsCount,
					resolvedCount,
					resolutionRate: Math.round(resolutionRate * 10) / 10,
				}
			})
			.filter((prod) => prod.problemsCount > 0) // Apenas produtos com problemas

		// Calcular métricas agregadas
		const totalProblems = problems.length
		const avgResolutionHours = problemsByCategory.length > 0 ? Math.round((problemsByCategory.reduce((sum, cat) => sum + cat.avgResolutionHours, 0) / problemsByCategory.length) * 10) / 10 : 0

		// Top problemas (mais recentes) com dados reais
		const topProblems = await Promise.all(problems.slice(0, 5).map(async (problem) => {
			const productInfo = productsWithProblems.find((p) => p.id === problem.productId)
			const categoryInfo = categories.find((c) => c.id === problem.problemCategoryId)
			
			// Buscar informações reais do usuário
			const userInfo = await db
				.select({ name: authUser.name })
				.from(authUser)
				.where(eq(authUser.id, problem.userId))
				.limit(1)

			// Contar soluções reais para este problema
			const solutionsCount = await db
				.select({ count: sql<number>`count(*)` })
				.from(productSolution)
				.where(eq(productSolution.productProblemId, problem.id))

			// Calcular tempo médio de resolução real
			const solutions = await db
				.select({ createdAt: productSolution.createdAt })
				.from(productSolution)
				.where(eq(productSolution.productProblemId, problem.id))

			let avgResolutionHours = 0
			if (solutions.length > 0) {
				const resolutionTimes = solutions.map(sol => {
					const resolutionTimeMs = sol.createdAt.getTime() - problem.createdAt.getTime()
					return resolutionTimeMs / (1000 * 60 * 60) // Converter para horas
				}).filter(time => time > 0)

				if (resolutionTimes.length > 0) {
					avgResolutionHours = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
				}
			}

			return {
				id: problem.id,
				title: problem.title,
				description: problem.description,
				createdAt: problem.createdAt.toISOString(),
				updatedAt: problem.updatedAt.toISOString(),
				product: {
					name: productInfo?.name || 'Produto',
					slug: productInfo?.slug || 'produto',
				},
				category: {
					name: categoryInfo?.name || 'Sem categoria',
					color: categoryInfo?.color || '#6b7280',
				},
				reportedBy: userInfo[0]?.name || 'Usuário',
				solutionsCount: solutionsCount[0]?.count || 0,
				avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
			}
		}))

		console.log('✅ Relatório finalizado:', {
			totalProblems,
			avgResolutionHours,
			categoriesCount: problemsByCategory.length,
			productsCount: problemsByProduct.length,
		})

		return NextResponse.json({
			success: true,
			totalProblems,
			avgResolutionHours,
			topProblems,
			problemsByCategory,
			problemsByProduct,
		})
	} catch (error) {
		console.error('❌ Erro ao obter relatório de problemas:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
