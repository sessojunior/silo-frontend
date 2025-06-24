import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productSolution, authUser, productSolutionChecked, productSolutionImage } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { getAuthUser } from '@/lib/auth/token'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const problemId = searchParams.get('problemId')

	if (!problemId) {
		return NextResponse.json({ error: 'Parâmetro problemId é obrigatório.' }, { status: 400 })
	}

	try {
		// Busca todas as soluções para o problema
		const solutions = await db.select().from(productSolution).where(eq(productSolution.productProblemId, problemId))

		// Busca os usuários relacionados
		const userIds = [...new Set(solutions.map((s) => s.userId))]
		const users = userIds.length ? await db.select().from(authUser).where(inArray(authUser.id, userIds)) : []

		// Busca soluções verificadas
		const checked = solutions.length
			? await db
					.select()
					.from(productSolutionChecked)
					.where(
						inArray(
							productSolutionChecked.productSolutionId,
							solutions.map((s) => s.id),
						),
					)
			: []

		const checkedIds = new Set(checked.map((c) => c.productSolutionId))

		// Busca imagens das soluções
		const solutionIds = solutions.map((s) => s.id)
		const images = solutionIds.length ? await db.select().from(productSolutionImage).where(inArray(productSolutionImage.productSolutionId, solutionIds)) : []

		const result = solutions.map((solution) => ({
			id: solution.id,
			replyId: solution.replyId,
			date: solution.createdAt,
			description: solution.description,
			verified: checkedIds.has(solution.id),
			user: users.find((u) => u.id === solution.userId)
				? {
						id: solution.userId,
						name: users.find((u) => u.id === solution.userId)?.name ?? '',
						image: '/images/profile.png', // ajuste se tiver campo de imagem
					}
				: {
						id: solution.userId,
						name: 'Usuário desconhecido',
						image: '/images/profile.png',
					},
			image: images.find((img) => img.productSolutionId === solution.id) || null,
			isMine: false, // O front pode sobrescrever com base no usuário logado
		}))

		return NextResponse.json({ items: result })
	} catch {
		return NextResponse.json({ error: 'Erro ao buscar soluções.' }, { status: 500 })
	}
}

// Criar solução
export async function POST(req: NextRequest) {
	const user = await getAuthUser()
	if (!user) return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })

	const formData = await req.formData()
	const description = (formData.get('description') as string)?.trim() || ''
	const problemId = formData.get('problemId') as string | null
	const replyId = formData.get('replyId') as string | null
	const file = formData.get('file') as File | null

	if (!problemId || description.length < 2) {
		return NextResponse.json({ error: 'Descrição e problema são obrigatórios (mín. 2 caracteres).' }, { status: 400 })
	}

	let imageId: string | null = null
	let imagePath: string | null = null

	if (file) {
		if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'A imagem deve ter no máximo 4MB.' }, { status: 400 })
		const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
		if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return NextResponse.json({ error: 'Formato de imagem não suportado.' }, { status: 400 })
		imageId = randomUUID()
		const fileName = `${imageId}.${ext}`
		const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', 'solutions')
		if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
		const filePath = path.join(uploadDir, fileName)
		const arrayBuffer = await file.arrayBuffer()
		fs.writeFileSync(filePath, Buffer.from(arrayBuffer))
		imagePath = `/uploads/products/solutions/${fileName}`
	}

	const solutionId = randomUUID()
	await db.insert(productSolution).values({
		id: solutionId,
		userId: user.id,
		productProblemId: problemId,
		description,
		replyId: replyId || null,
		createdAt: new Date(),
		updatedAt: new Date(),
	})

	if (imageId && imagePath) {
		await db.insert(productSolutionImage).values({
			id: imageId,
			productSolutionId: solutionId,
			image: imagePath,
			description: '',
		})
	}

	return NextResponse.json({ success: true }, { status: 200 })
}

// Editar solução
export async function PUT(req: NextRequest) {
	const user = await getAuthUser()
	if (!user) return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })

	const formData = await req.formData()
	const id = formData.get('id') as string | null
	const description = (formData.get('description') as string)?.trim() || ''
	const file = formData.get('file') as File | null

	if (!id || description.length < 2) {
		return NextResponse.json({ error: 'ID e descrição são obrigatórios (mín. 2 caracteres).' }, { status: 400 })
	}

	// Busca a solução e valida permissão
	const solution = await db.select().from(productSolution).where(eq(productSolution.id, id))
	if (!solution.length || solution[0].userId !== user.id) {
		return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 })
	}

	await db.update(productSolution).set({ description, updatedAt: new Date() }).where(eq(productSolution.id, id))

	// Imagem: se enviada, substitui a anterior
	if (file) {
		if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'A imagem deve ter no máximo 4MB.' }, { status: 400 })
		const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
		if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return NextResponse.json({ error: 'Formato de imagem não suportado.' }, { status: 400 })
		// Remove imagem anterior, se houver
		const oldImg = await db.select().from(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
		if (oldImg.length) {
			const oldPath = oldImg[0].image
			await db.delete(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
			try {
				const filePath = path.join(process.cwd(), 'public', oldPath.startsWith('/') ? oldPath.slice(1) : oldPath)
				if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
			} catch {}
		}
		// Salva nova imagem
		const imageId = randomUUID()
		const fileName = `${imageId}.${ext}`
		const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', 'solutions')
		if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
		const filePath = path.join(uploadDir, fileName)
		const arrayBuffer = await file.arrayBuffer()
		fs.writeFileSync(filePath, Buffer.from(arrayBuffer))
		const imagePath = `/uploads/products/solutions/${fileName}`
		await db.insert(productSolutionImage).values({
			id: imageId,
			productSolutionId: id,
			image: imagePath,
			description: '',
		})
	} else {
		// Se não enviou imagem, pode querer remover a existente
		const removeImage = formData.get('removeImage') === 'true'
		if (removeImage) {
			const oldImg = await db.select().from(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
			if (oldImg.length) {
				const oldPath = oldImg[0].image
				await db.delete(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
				try {
					const filePath = path.join(process.cwd(), 'public', oldPath.startsWith('/') ? oldPath.slice(1) : oldPath)
					if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
				} catch {}
			}
		}
	}

	return NextResponse.json({ success: true }, { status: 200 })
}

// Excluir solução
export async function DELETE(req: NextRequest) {
	const user = await getAuthUser()
	if (!user) return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })

	const { id } = await req.json()
	if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 })

	// Busca a solução e valida permissão
	const solution = await db.select().from(productSolution).where(eq(productSolution.id, id))
	if (!solution.length || solution[0].userId !== user.id) {
		return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 })
	}

	// Remove imagem associada, se houver
	const img = await db.select().from(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
	if (img.length) {
		const imgPath = img[0].image
		await db.delete(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
		try {
			const filePath = path.join(process.cwd(), 'public', imgPath.startsWith('/') ? imgPath.slice(1) : imgPath)
			if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
		} catch {}
	}

	// Remove a solução
	await db.delete(productSolution).where(eq(productSolution.id, id))

	return NextResponse.json({ success: true }, { status: 200 })
}
