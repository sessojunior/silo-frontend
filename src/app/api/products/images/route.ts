import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productProblemImage } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const problemId = searchParams.get('problemId')

	if (!problemId) {
		return NextResponse.json({ error: 'Parâmetro problemId é obrigatório.' }, { status: 400 })
	}

	try {
		const images = await db.select().from(productProblemImage).where(eq(productProblemImage.productProblemId, problemId))
		return NextResponse.json({ items: images })
	} catch (e) {
		return NextResponse.json({ error: 'Erro ao buscar imagens.' }, { status: 500 })
	}
}
