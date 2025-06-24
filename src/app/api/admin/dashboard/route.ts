import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { product, productActivity } from '@/lib/db/schema'
import { desc, eq, gte } from 'drizzle-orm'

// Utilidades
const ALERT_STATUSES = ['pending', 'not_run', 'with_problems', 'run_again', 'under_support', 'suspended'] as const

type AlertStatus = (typeof ALERT_STATUSES)[number]

type DashboardProduct = {
	productId: string
	name: string
	priority: string
	last_run: string | null
	percent_completed: number
	dates: {
		date: string
		turn: number
		user_id: string
		status: string
		description: string | null
		alert: boolean
	}[]
	turns: string[]
}

function isAlert(status: string): status is AlertStatus {
	return ALERT_STATUSES.includes(status as AlertStatus)
}

// Deve retornar um array de produtos com as seguintes informações:
// {
//   productId: string,          // id do produto
//   name: string,               // nome do produto
//   priority: string,           // 'low' | 'normal' | 'high' | 'urgent'
//   last_run: string | null,    // 'YYYY-MM-DD HH:mm:ss'
//   percent_completed: number,  // 0-100 (últimos 28 dias)
//   dates: Array<{
//     date: string,             // 'YYYY-MM-DD' (3 últimos meses, do dia 1º do mês menos 2 até hoje)
//     turn: number,             // 0 | 6 | 12 | 18
//     user_id: string,          // id do usuário responsável
//     status: string,           // 'completed', 'waiting', 'pending', 'in_progress', 'not_run', 'with_problems', 'run_again', 'under_support', 'suspended', 'off'
//     description: string|null, // descrição da atividade
//     alert: boolean            // true ↔ status ∈ {'pending', 'not_run', 'with_problems', 'run_again', 'under_support', 'suspended'}
//   }>
// }
export async function GET() {
	try {
		// Buscar produtos ativos
		const products = await db.select().from(product).where(eq(product.available, true))
		if (products.length === 0) return NextResponse.json([])

		const productIds = products.map((p) => p.id)

		// Data cutoff: 3 últimos meses (do dia 1º do mês menos 2 até hoje)
		const today = new Date()
		const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1) // primeiro dia do mês há 2 meses
		const cutoff = startDate.toISOString().slice(0, 10)

		const activityRows = await db.select().from(productActivity).where(gte(productActivity.date, cutoff)).orderBy(productActivity.date, productActivity.turn)

		const grouped = new Map<string, DashboardProduct>()

		for (const p of products) {
			grouped.set(p.id, {
				productId: p.id,
				name: p.name,
				priority: p.priority,
				turns: (p.turns as unknown as string[]) || ['0', '6', '12', '18'],
				last_run: null,
				percent_completed: 0,
				dates: [],
			})
		}

		// Preprocess rows
		for (const row of activityRows) {
			const g = grouped.get(row.productId)
			if (!g) continue

			const dateStr = row.date // YYYY-MM-DD
			const turnHour = String(row.turn).padStart(2, '0')
			const dateTimeStr = `${dateStr} ${turnHour}:00:00`

			g.dates.push({
				date: dateStr,
				turn: row.turn,
				user_id: row.userId,
				status: row.status,
				description: row.description,
				alert: isAlert(row.status),
			})

			// last_run (comparação lexicográfica YYYY-MM-DD HH:mm:ss)
			if (!g.last_run || dateTimeStr > g.last_run) {
				g.last_run = dateTimeStr
			}
		}

		// Calcula percent_completed (últimos 28 dias)
		const cut28 = new Date()
		cut28.setDate(cut28.getDate() - 28)

		for (const g of grouped.values()) {
			const last28 = g.dates.filter((d) => new Date(d.date) >= cut28)
			const completed = last28.filter((d) => d.status === 'completed').length
			g.percent_completed = last28.length ? Math.round((completed / last28.length) * 100) : 0
		}

		return NextResponse.json(Array.from(grouped.values()))
	} catch (error) {
		console.error('❌ Erro ao obter dados dos produtos:', error)
		return NextResponse.json({ success: false, error: 'Erro ao obter dados dos produtos' }, { status: 500 })
	}
}
