import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productProblemImage } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'

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
		const file = formData.get('file') as File | null
		const productProblemId = formData.get('productProblemId') as string | null
		const description = (formData.get('description') as string | null) || ''

		if (!file || !productProblemId) {
			return NextResponse.json({ error: 'Arquivo e productProblemId são obrigatórios.' }, { status: 400 })
		}

		const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
		const allowed = ['jpg', 'jpeg', 'png', 'webp']
		if (!allowed.includes(ext)) {
			return NextResponse.json({ error: 'Formato de imagem não suportado.' }, { status: 400 })
		}

		const id = randomUUID()
		const fileName = `${id}.${ext}`
		const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', 'problems')
		if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
		const filePath = path.join(uploadDir, fileName)
		const arrayBuffer = await file.arrayBuffer()
		fs.writeFileSync(filePath, Buffer.from(arrayBuffer))

		const imagePath = `/uploads/products/problems/${fileName}`
		await db.insert(productProblemImage).values({
			id,
			productProblemId,
			image: imagePath,
			description: description || '',
		})

		return NextResponse.json({ success: true, image: imagePath }, { status: 200 })
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
		const imagePath = img[0].image
		// Remove do banco
		await db.delete(productProblemImage).where(eq(productProblemImage.id, id))
		// Remove arquivo físico
		try {
			const filePath = path.join(process.cwd(), 'public', imagePath.startsWith('/') ? imagePath.slice(1) : imagePath)
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath)
			}
		} catch {
			// Não interrompe se não conseguir deletar arquivo
		}
		return NextResponse.json({ success: true }, { status: 200 })
	} catch {
		return NextResponse.json({ error: 'Erro ao excluir imagem.' }, { status: 500 })
	}
}
