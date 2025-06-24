import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { productProblem, productSolution } from '@/lib/db/schema'
import { gte } from 'drizzle-orm'

// Agrupa problemas e soluções por semana nas últimas 8 semanas (≈ 2 meses)
export async function GET() {
	try {
		const today = new Date()

		// Função para formatar data DD/MM
		const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

		// Obter sábado mais recente (ou hoje se sábado)
		const startOfCurrentWeek = new Date(today)
		startOfCurrentWeek.setDate(today.getDate() - ((today.getDay() + 1) % 7)) // Sábado = 6 → 0, Domingo=0 → 1 dia atrás
		startOfCurrentWeek.setHours(0, 0, 0, 0)

		// Período de início = 7 semanas antes do início da semana atual (8 semanas total)
		const TOTAL_WEEKS = 4
		const MILLISECONDS_IN_DAY = 86_400_000
		const MILLISECONDS_IN_WEEK = MILLISECONDS_IN_DAY * 7
		const startDatePeriod = new Date(startOfCurrentWeek.getTime() - (TOTAL_WEEKS - 1) * MILLISECONDS_IN_WEEK)

		// Buscar problemas e soluções dentro do período
		const problemsRows = await db.select({ date: productProblem.createdAt }).from(productProblem).where(gte(productProblem.createdAt, startDatePeriod))

		const solutionsRows = await db.select({ date: productSolution.updatedAt }).from(productSolution).where(gte(productSolution.updatedAt, startDatePeriod))

		// Categorias (mais antigo → mais novo)
		const categories: string[] = []
		const problemsCounts: number[] = Array(TOTAL_WEEKS).fill(0)
		const solutionsCounts: number[] = Array(TOTAL_WEEKS).fill(0)

		for (let w = TOTAL_WEEKS - 1; w >= 0; w--) {
			const weekStart = new Date(startOfCurrentWeek.getTime() - w * MILLISECONDS_IN_WEEK)
			const weekEnd = new Date(weekStart.getTime() + 6 * MILLISECONDS_IN_DAY)
			categories.push(`${fmt(weekStart)} a ${fmt(weekEnd)}`)
		}

		// Função para obter índice da semana (0 = mais antigo, TOTAL_WEEKS-1 = atual)
		function getWeekIndex(dateObj: Date): number | null {
			// Obter sábado da semana da data
			const weekStart = new Date(dateObj)
			weekStart.setDate(dateObj.getDate() - ((dateObj.getDay() + 1) % 7))
			weekStart.setHours(0, 0, 0, 0)

			const diffWeeks = Math.round((startOfCurrentWeek.getTime() - weekStart.getTime()) / MILLISECONDS_IN_WEEK)
			if (diffWeeks < 0 || diffWeeks >= TOTAL_WEEKS) return null
			return TOTAL_WEEKS - 1 - diffWeeks // converter para índice (mais antigo → 0)
		}

		// Contabilizar problemas
		for (const row of problemsRows) {
			const idx = getWeekIndex(new Date(row.date))
			if (idx !== null) problemsCounts[idx]++
		}

		// Contabilizar soluções
		for (const row of solutionsRows) {
			const idx = getWeekIndex(new Date(row.date))
			if (idx !== null) solutionsCounts[idx]++
		}

		return NextResponse.json({ categories, problems: problemsCounts, solutions: solutionsCounts })
	} catch (error) {
		console.error('❌ Erro ao obter problemas & soluções:', error)
		return NextResponse.json({ success: false, error: 'Erro ao obter dados de problemas & soluções' }, { status: 500 })
	}
}
