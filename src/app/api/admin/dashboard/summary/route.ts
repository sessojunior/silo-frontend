import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productActivity, productProblemCategory } from '@/lib/db/schema'
import { gte, and, isNotNull, inArray } from 'drizzle-orm'

// Status considerados incidentes (mesmos do dashboard)
const INCIDENT_STATUS = ['pending', 'under_support', 'suspended', 'not_run', 'with_problems', 'run_again'] as const

export async function GET() {
	try {
		const today = new Date()
		const cut7 = new Date()
		cut7.setDate(today.getDate() - 7)
		const cut14 = new Date()
		cut14.setDate(today.getDate() - 14)

		const dateStr7 = cut7.toISOString().slice(0, 10)
		const dateStr14 = cut14.toISOString().slice(0, 10)

		// Fetch incidents for last 14 days (we'll split in memory)
		const rows = await db
			.select({ date: productActivity.date, categoryId: productActivity.problemCategoryId })
			.from(productActivity)
			.where(and(gte(productActivity.date, dateStr14), isNotNull(productActivity.problemCategoryId), inArray(productActivity.status, INCIDENT_STATUS)))

		let recentCount = 0
		let previousCount = 0
		const recentCatMap = new Map<string, number>()

		for (const r of rows) {
			if (!r.categoryId) continue
			if (r.date >= dateStr7) {
				recentCount++
				recentCatMap.set(r.categoryId, (recentCatMap.get(r.categoryId) || 0) + 1)
			} else {
				previousCount++
			}
		}

		// Fetch category names
		const catIds = Array.from(recentCatMap.keys())
		let categories: { name: string; count: number }[] = []
		if (catIds.length) {
			const catRows = await db.select({ id: productProblemCategory.id, name: productProblemCategory.name }).from(productProblemCategory).where(inArray(productProblemCategory.id, catIds))
			categories = catRows.map((c) => ({ name: c.name, count: recentCatMap.get(c.id) || 0 }))
		}

		// Percent variation
		let percentChange = 0
		if (previousCount === 0) {
			percentChange = recentCount > 0 ? 100 : 0
		} else {
			percentChange = ((recentCount - previousCount) / previousCount) * 100
		}

		return NextResponse.json({ recentCount, previousCount, percentChange, categories })
	} catch (error) {
		console.error('❌ Erro ao obter resumo de 7 dias', error)
		return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
	}
}
