import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { product, productActivity } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'

// Status considerados incidentes (mesmos do dashboard)
const INCIDENT_STATUS = ['pending', 'under_support', 'suspended', 'not_run', 'with_problems', 'run_again'] as const

export async function GET() {
	try {
		console.log('🔵 Iniciando busca de relatório de disponibilidade')

		// Buscar todos os produtos
		const products = await db.select().from(product).orderBy(product.name)
		console.log('✅ Produtos encontrados:', products.length)

		if (products.length === 0) {
			console.log('⚠️ Nenhum produto encontrado no banco')
			return NextResponse.json({
				success: true,
				totalProducts: 0,
				avgAvailability: 0,
				products: [],
			})
		}

		// Calcular disponibilidade para cada produto
		const productsWithAvailability = await Promise.all(
			products.map(async (prod) => {
				console.log(`🔵 Processando produto: ${prod.name}`)

				// Buscar atividades dos últimos 30 dias
				const thirtyDaysAgo = new Date()
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
				const dateStr = thirtyDaysAgo.toISOString().slice(0, 10)

				// Buscar todas as atividades do produto
				const activities = await db
					.select()
					.from(productActivity)
					.where(and(eq(productActivity.productId, prod.id), gte(productActivity.date, dateStr)))

				console.log(`📊 Atividades encontradas para ${prod.name}:`, activities.length)

				// Calcular métricas
				const totalActivities = activities.length
				const completedActivities = activities.filter((a) => a.status === 'completed').length
				const activeActivities = activities.filter((a) => a.status === 'in_progress').length
				const failedActivities = activities.filter((a) => INCIDENT_STATUS.includes(a.status as (typeof INCIDENT_STATUS)[number])).length

				// Calcular porcentagem de disponibilidade
				let availabilityPercentage = 100
				if (totalActivities > 0) {
					const successRate = (completedActivities / totalActivities) * 100
					availabilityPercentage = Math.round(successRate * 10) / 10
				}

				// Determinar status do produto baseado na disponibilidade
				let productStatus = 'active'
				if (availabilityPercentage < 50) productStatus = 'critical'
				else if (availabilityPercentage < 70) productStatus = 'warning'
				else if (availabilityPercentage < 90) productStatus = 'stable'

				// Encontrar data da última atividade
				let lastActivityDate = null
				if (activities.length > 0) {
					const sortedActivities = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
					lastActivityDate = sortedActivities[0].date
				}

				console.log(`📈 ${prod.name}: ${availabilityPercentage}% disponibilidade, status: ${productStatus}`)

				return {
					id: prod.id,
					name: prod.name,
					slug: prod.slug,
					description: prod.description,
					status: productStatus,
					totalActivities,
					completedActivities,
					activeActivities,
					failedActivities,
					availabilityPercentage,
					lastActivityDate,
				}
			}),
		)

		// Calcular métricas agregadas
		const totalProducts = productsWithAvailability.length
		const avgAvailability = productsWithAvailability.length > 0 ? Math.round((productsWithAvailability.reduce((sum, p) => sum + p.availabilityPercentage, 0) / totalProducts) * 10) / 10 : 0

		console.log('✅ Relatório finalizado:', { totalProducts, avgAvailability })
		console.log(
			'📊 Produtos com disponibilidade:',
			productsWithAvailability.map((p) => ({ name: p.name, availability: p.availabilityPercentage })),
		)

		return NextResponse.json({
			success: true,
			totalProducts,
			avgAvailability,
			products: productsWithAvailability,
		})
	} catch (error) {
		console.error('❌ Erro ao obter relatório de disponibilidade:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
