import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { productManualSection, productManualChapter } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const productId = searchParams.get('productId')

		if (!productId) {
			return NextResponse.json({ error: 'ProductId é obrigatório' }, { status: 400 })
		}

		// Busca todas as seções do produto
		const sections = await db.select().from(productManualSection).where(eq(productManualSection.productId, productId)).orderBy(productManualSection.order)

		// Para cada seção, busca seus capítulos
		const sectionsWithChapters = await Promise.all(
			sections.map(async (section) => {
				const chapters = await db.select().from(productManualChapter).where(eq(productManualChapter.sectionId, section.id)).orderBy(productManualChapter.order)

				return {
					...section,
					chapters,
				}
			}),
		)

		return NextResponse.json({ sections: sectionsWithChapters })
	} catch (error) {
		console.error('Erro ao buscar manual:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const { productId, title, description } = await req.json()
		console.log('API POST recebido:', { productId, title, description })

		if (!productId || !title) {
			return NextResponse.json({ error: 'ProductId e título são obrigatórios' }, { status: 400 })
		}

		// Busca a maior ordem existente para o produto
		const sections = await db.select().from(productManualSection).where(eq(productManualSection.productId, productId)).orderBy(productManualSection.order)
		const nextOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.order)) + 1 : 0

		// Insere a nova seção
		const newSection = await db
			.insert(productManualSection)
			.values({
				id: crypto.randomUUID(),
				productId,
				title,
				description: description || null,
				order: nextOrder,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()

		return NextResponse.json({ section: newSection[0] })
	} catch (error) {
		console.error('Erro ao criar seção:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

export async function PUT(req: NextRequest) {
	try {
		const { id, title, content } = await req.json()
		console.log('API PUT recebido:', { id, title, content })

		if (!id || !title || !content) {
			return NextResponse.json({ error: 'ID, título e conteúdo são obrigatórios' }, { status: 400 })
		}

		// Atualiza o capítulo
		const updatedChapter = await db
			.update(productManualChapter)
			.set({
				title,
				content,
				updatedAt: new Date(),
			})
			.where(eq(productManualChapter.id, id))
			.returning()

		if (updatedChapter.length === 0) {
			return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 })
		}

		return NextResponse.json({ chapter: updatedChapter[0] })
	} catch (error) {
		console.error('Erro ao atualizar capítulo:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
