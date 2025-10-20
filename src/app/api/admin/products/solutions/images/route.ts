import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productSolutionImage } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { getAuthUser } from '@/lib/auth/token'
import { config, requestUtils } from '@/lib/config'

export async function GET(req: NextRequest) {
	const user = await getAuthUser()
	if (!user) return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })

	const { searchParams } = new URL(req.url)
	const solutionId = searchParams.get('solutionId')

	if (!solutionId) {
		return NextResponse.json({ error: 'Parâmetro solutionId é obrigatório.' }, { status: 400 })
	}

	try {
		const images = await db.select().from(productSolutionImage).where(eq(productSolutionImage.productSolutionId, solutionId))
		return NextResponse.json({ items: images })
	} catch {
		return NextResponse.json({ error: 'Erro ao buscar imagens.' }, { status: 500 })
	}
}

// Upload de imagem de solução
export async function POST(req: NextRequest) {
	const user = await getAuthUser()
	if (!user) return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })

	try {
		const formData = await req.formData()
		const productSolutionId = formData.get('productSolutionId') as string | null
		const description = (formData.get('description') as string | null) || ''
		const imageUrl = formData.get('imageUrl') as string | null

		if (!imageUrl || !productSolutionId) {
			return NextResponse.json({ error: 'Arquivo e productSolutionId são obrigatórios.' }, { status: 400 })
		}

		if (imageUrl) {
			const id = randomUUID()
			await db.insert(productSolutionImage).values({
				id,
				productSolutionId,
				image: imageUrl,
				description,
			})
			return NextResponse.json({ success: true, image: imageUrl }, { status: 200 })
		}

		// Upload de arquivo local não é mais suportado
		return NextResponse.json({ error: 'URL de imagem é obrigatória.' }, { status: 400 })
	} catch {
		return NextResponse.json({ error: 'Erro ao fazer upload da imagem.' }, { status: 500 })
	}
}

// Exclusão individual de imagem de solução
export async function DELETE(req: NextRequest) {
	const user = await getAuthUser()
	if (!user) return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })

	try {
		const { id } = await req.json()
		if (!id) {
			return NextResponse.json({ error: 'ID da imagem é obrigatório.' }, { status: 400 })
		}
		const img = await db.select().from(productSolutionImage).where(eq(productSolutionImage.id, id))
		if (!img.length) {
			return NextResponse.json({ error: 'Imagem não encontrada.' }, { status: 404 })
		}

		// Remover arquivo do disco também
		try {
			const imageUrl = img[0].image
			if (requestUtils.isFileServerUrl(imageUrl)) {
				const filePath = requestUtils.extractFilePath(imageUrl)
				if (filePath) {
					const deleteUrl = requestUtils.buildDeleteUrl(filePath)

					// Fazer requisição DELETE para o servidor de arquivos
					await fetch(deleteUrl, {
						method: 'DELETE',
					})
				}
			}
		} catch (error) {
			console.warn('⚠️ [API_PRODUCTS_SOLUTIONS_IMAGES] Erro ao remover arquivo do disco:', { error })
		}

		// Remove do banco
		await db.delete(productSolutionImage).where(eq(productSolutionImage.id, id))

		return NextResponse.json({ success: true }, { status: 200 })
	} catch (error) {
		console.error('❌ [API_PRODUCTS_SOLUTIONS_IMAGES] Erro ao excluir imagem:', { error })
		return NextResponse.json({ error: 'Erro ao excluir imagem.' }, { status: 500 })
	}
}
