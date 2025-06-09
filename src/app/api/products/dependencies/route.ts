import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { productDependency } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const productId = searchParams.get('productId')

		if (!productId) {
			return NextResponse.json({ error: 'ProductId é obrigatório' }, { status: 400 })
		}

		// Busca todas as dependências do produto
		const dependencies = await db.select().from(productDependency).where(eq(productDependency.productId, productId)).orderBy(productDependency.order)

		// Organiza as dependências em uma estrutura hierárquica
		const buildTree = (items: any[], parentId: string | null = null): any[] => {
			return items
				.filter((item) => item.parentId === parentId)
				.map((item) => ({
					...item,
					children: buildTree(items, item.id),
				}))
		}

		const tree = buildTree(dependencies)

		return NextResponse.json({ dependencies: tree })
	} catch (error) {
		console.error('Erro ao buscar dependências:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
