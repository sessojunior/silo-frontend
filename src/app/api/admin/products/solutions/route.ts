import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productSolution, authUser, productSolutionChecked, productSolutionImage } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { getAuthUser } from '@/lib/auth/token'
import { utapi, getFileKeyFromUrl } from '@/server/uploadthing'

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
	const imageUrl = formData.get('imageUrl') as string | null
	// const file = formData.get('file') as File | null - não mais usado, apenas UploadThing

	if (!problemId || description.length < 2) {
		return NextResponse.json({ error: 'Descrição e problema são obrigatórios (mín. 2 caracteres).' }, { status: 400 })
	}

	let imageId: string | null = null
	let imagePath: string | null = null

	if (imageUrl) {
		imageId = randomUUID()
		imagePath = imageUrl
	}

	// Upload de arquivo local não é mais suportado - usar UploadThing

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
	const imageUrl = formData.get('imageUrl') as string | null
	// const file = formData.get('file') as File | null - não mais usado, apenas UploadThing

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
	if (imageUrl) {
		// Remove imagem anterior se houver
		const oldImg = await db.select().from(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
		if (oldImg.length) {
			// Exclui a imagem antiga do UploadThing
			const oldImageUrl = oldImg[0].image
			const oldFileKey = getFileKeyFromUrl(oldImageUrl)
			if (oldFileKey) {
				try {
					console.log('🔵 Excluindo arquivo antigo do UploadThing:', oldFileKey)
					await utapi.deleteFiles([oldFileKey])
					console.log('✅ Arquivo antigo excluído do UploadThing com sucesso')
				} catch (error) {
					console.error('❌ Erro ao excluir arquivo antigo do UploadThing:', error)
					// Continua mesmo se falhar a exclusão do arquivo remoto
				}
			}

			await db.delete(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
		}
		await db.insert(productSolutionImage).values({
			id: randomUUID(),
			productSolutionId: id,
			image: imageUrl,
			description: '',
		})
	}
	// Upload de arquivo local não é mais suportado - usar UploadThing
	// Se não enviou imagem via URL, pode querer remover a existente
	if (!imageUrl) {
		const removeImage = formData.get('removeImage') === 'true'
		if (removeImage) {
			const oldImg = await db.select().from(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
			if (oldImg.length) {
				// Exclui a imagem do UploadThing
				const oldImageUrl = oldImg[0].image
				const oldFileKey = getFileKeyFromUrl(oldImageUrl)
				if (oldFileKey) {
					try {
						console.log('🔵 Excluindo arquivo do UploadThing:', oldFileKey)
						await utapi.deleteFiles([oldFileKey])
						console.log('✅ Arquivo excluído do UploadThing com sucesso')
					} catch (error) {
						console.error('❌ Erro ao excluir arquivo do UploadThing:', error)
						// Continua mesmo se falhar a exclusão do arquivo remoto
					}
				}

				await db.delete(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
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

	// Remove imagem associada e exclui do UploadThing
	const oldImg = await db.select().from(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
	if (oldImg.length) {
		// Exclui a imagem do UploadThing
		const oldImageUrl = oldImg[0].image
		const oldFileKey = getFileKeyFromUrl(oldImageUrl)
		if (oldFileKey) {
			try {
				console.log('🔵 Excluindo arquivo da solução do UploadThing:', oldFileKey)
				await utapi.deleteFiles([oldFileKey])
				console.log('✅ Arquivo da solução excluído do UploadThing com sucesso')
			} catch (error) {
				console.error('❌ Erro ao excluir arquivo da solução do UploadThing:', error)
				// Continua mesmo se falhar a exclusão do arquivo remoto
			}
		}

		await db.delete(productSolutionImage).where(eq(productSolutionImage.productSolutionId, id))
	}

	// Remove a solução
	await db.delete(productSolution).where(eq(productSolution.id, id))

	return NextResponse.json({ success: true }, { status: 200 })
}
