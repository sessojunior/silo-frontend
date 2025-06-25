import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productProblem, productProblemCategory } from '@/lib/db/schema'
import { gte, inArray } from 'drizzle-orm'

export async function GET() {
	try {
		const cutDate = new Date()
		cutDate.setDate(cutDate.getDate() - 28)

		// Buscar problemas nos últimos 28 dias com categoria definida
		const problems = await db.select({ categoryId: productProblem.problemCategoryId }).from(productProblem).where(gte(productProblem.createdAt, cutDate))

		// Contagem por categoriaId
		const counts = new Map<string, number>()
		for (const row of problems) {
			if (!row.categoryId) continue
			counts.set(row.categoryId, (counts.get(row.categoryId) || 0) + 1)
		}

		if (counts.size === 0) return NextResponse.json({ labels: [], values: [] })

		// Buscar nomes das categorias existentes
		const categoryRows = await db
			.select({ id: productProblemCategory.id, name: productProblemCategory.name, color: productProblemCategory.color })
			.from(productProblemCategory)
			.where(inArray(productProblemCategory.id, Array.from(counts.keys())))

		const labels: string[] = []
		const values: number[] = []
		const colors: (string | null)[] = []

		for (const cat of categoryRows) {
			labels.push(cat.name)
			values.push(counts.get(cat.id) || 0)
			colors.push(cat.color)
		}

		return NextResponse.json({ labels, values, colors })
	} catch (error) {
		console.error('❌ Erro ao obter causas de problemas:', error)
		return NextResponse.json({ success: false, error: 'Erro ao obter causas de problemas' }, { status: 500 })
	}
}
