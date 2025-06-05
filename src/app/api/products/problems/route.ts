import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { product, productProblem } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const slug = searchParams.get('slug')

	if (!slug) {
		return NextResponse.json({ error: 'Parâmetro slug é obrigatório.' }, { status: 400 })
	}

	try {
		// Busca o produto pelo slug
		const prod = await db.select().from(product).where(eq(product.slug, slug)).limit(1)
		console.log('prod', prod)
		if (!prod.length) {
			return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })
		}
		const productId = prod[0].id

		// Busca os problemas desse produto
		const problems = await db.select().from(productProblem).where(eq(productProblem.productId, productId))

		return NextResponse.json({ items: problems })
	} catch (e) {
		return NextResponse.json({ error: 'Erro ao buscar problemas.' }, { status: 500 })
	}
}
