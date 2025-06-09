import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { productContact } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const productId = searchParams.get('productId')

		if (!productId) {
			return NextResponse.json({ error: 'ProductId é obrigatório' }, { status: 400 })
		}

		const contacts = await db.select().from(productContact).where(eq(productContact.productId, productId)).orderBy(productContact.order)

		return NextResponse.json({ contacts })
	} catch (error) {
		console.error('Erro ao buscar contatos:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
