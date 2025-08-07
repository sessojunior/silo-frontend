import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productProblemImage } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { utapi, getFileKeyFromUrl } from '@/server/uploadthing'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const problemId = searchParams.get('problemId')

	if (!problemId) {
		return NextResponse.json({ error: 'Parâmetro problemId é obrigatório.' }, { status: 400 })
	}

	try {
		const images = await db.select().from(productProblemImage).where(eq(productProblemImage.productProblemId, problemId))
		return NextResponse.json({ items: images })
	} catch {
		return NextResponse.json({ error: 'Erro ao buscar imagens.' }, { status: 500 })
	}
}

// Upload de imagem de problema
export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData()
		// const file = formData.get('file') as File | null - não mais usado, apenas UploadThing
		const productProblemId = formData.get('productProblemId') as string | null
		const description = (formData.get('description') as string | null) || ''
		const imageUrl = formData.get('imageUrl') as string | null

		if (!imageUrl || !productProblemId) {
			return NextResponse.json({ error: 'Arquivo e productProblemId são obrigatórios.' }, { status: 400 })
		}

		// Apenas aceita URL do UploadThing
		if (imageUrl) {
			const id = randomUUID()
			await db.insert(productProblemImage).values({
				id,
				productProblemId,
				image: imageUrl,
				description,
			})
			return NextResponse.json({ success: true, image: imageUrl }, { status: 200 })
		}

		// Upload de arquivo local não é mais suportado
		return NextResponse.json({ error: 'Use UploadThing para fazer upload de imagens.' }, { status: 400 })
	} catch {
		return NextResponse.json({ error: 'Erro ao fazer upload da imagem.' }, { status: 500 })
	}
}

// Exclusão individual de imagem de problema
export async function DELETE(req: NextRequest) {
	try {
		const { id } = await req.json()
		if (!id) {
			return NextResponse.json({ error: 'ID da imagem é obrigatório.' }, { status: 400 })
		}
		const img = await db.select().from(productProblemImage).where(eq(productProblemImage.id, id))
		if (!img.length) {
			return NextResponse.json({ error: 'Imagem não encontrada.' }, { status: 404 })
		}

		// Exclui a imagem do UploadThing se for uma URL do UploadThing
		const imageUrl = img[0].image
		const fileKey = getFileKeyFromUrl(imageUrl)
		if (fileKey) {
			try {
				console.log('🔵 Excluindo arquivo do UploadThing:', fileKey)
				await utapi.deleteFiles([fileKey])
				console.log('✅ Arquivo excluído do UploadThing com sucesso')
			} catch (error) {
				console.error('❌ Erro ao excluir arquivo do UploadThing:', error)
				// Continua mesmo se falhar a exclusão do arquivo remoto
			}
		}

		// Remove do banco
		await db.delete(productProblemImage).where(eq(productProblemImage.id, id))

		return NextResponse.json({ success: true }, { status: 200 })
	} catch (error) {
		console.error('❌ Erro ao excluir imagem:', error)
		return NextResponse.json({ error: 'Erro ao excluir imagem.' }, { status: 500 })
	}
}
