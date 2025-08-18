import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { productProblem, productSolution } from '@/lib/db/schema'
import { gte } from 'drizzle-orm'

// Agrupa problemas e soluções por dia nos últimos 28 dias (timeline completa)
export async function GET() {
	try {
		const today = new Date()
		today.setHours(23, 59, 59, 999) // Fim do dia

		// Período de início = 28 dias atrás
		const TOTAL_DAYS = 28

		// Buscar problemas e soluções dentro do período
		const problemsRows = await db
			.select({ date: productProblem.createdAt })
			.from(productProblem)
			.where(gte(productProblem.createdAt, new Date(today.getTime() - (TOTAL_DAYS - 1) * 86_400_000)))

		const solutionsRows = await db
			.select({ date: productSolution.updatedAt })
			.from(productSolution)
			.where(gte(productSolution.updatedAt, new Date(today.getTime() - (TOTAL_DAYS - 1) * 86_400_000)))

		// Função para formatar data DD/MM
		const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

		// Gerar timeline completa dos últimos 28 dias (mais antigo → mais recente)
		const categories: string[] = []
		const problemsCounts: number[] = Array(TOTAL_DAYS).fill(0)
		const solutionsCounts: number[] = Array(TOTAL_DAYS).fill(0)

		for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
			const currentDate = new Date(today.getTime() - i * 86_400_000) // Corrigido: mais antigo → mais recente
			categories.push(fmt(currentDate))
		}

		// Função para obter índice do dia (0 = mais antigo, TOTAL_DAYS-1 = mais recente)
		function getDayIndex(dateObj: Date): number | null {
			const diffDays = Math.floor((dateObj.getTime() - (today.getTime() - (TOTAL_DAYS - 1) * 86_400_000)) / 86_400_000) // Corrigido: cálculo ajustado
			if (diffDays < 0 || diffDays >= TOTAL_DAYS) return null
			return diffDays
		}

		// Contabilizar problemas
		for (const row of problemsRows) {
			const idx = getDayIndex(new Date(row.date))
			if (idx !== null) problemsCounts[idx]++
		}

		// Contabilizar soluções
		for (const row of solutionsRows) {
			const idx = getDayIndex(new Date(row.date))
			if (idx !== null) solutionsCounts[idx]++
		}

		return NextResponse.json({ categories, problems: problemsCounts, solutions: solutionsCounts })
	} catch (error) {
		console.error('❌ Erro ao obter problemas & soluções:', error)
		return NextResponse.json({ success: false, error: 'Erro ao obter dados de problemas & soluções' }, { status: 500 })
	}
}
