import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { product, productActivity, productActivityHistory, productContact, productDependency, productManual, productProblem, productSolution, productProblemImage, productSolutionChecked, productSolutionImage } from '@/lib/db/schema'
import { eq, like, asc, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { formatSlug } from '@/lib/utils'
import { getAuthUser } from '@/lib/auth/token'

// Listar produtos com paginação e filtro por nome ou buscar por slug
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const slug = searchParams.get('slug')?.trim()

	// Se tem slug, busca produto específico
	if (slug) {
		try {
			const products = await db.select().from(product).where(eq(product.slug, slug)).limit(1)
			return NextResponse.json({ products }, { status: 200 })
		} catch {
			return NextResponse.json({ field: null, message: 'Erro ao buscar produto.' }, { status: 500 })
		}
	}

	// Senão, lista produtos com paginação
	const page = Number(searchParams.get('page') || '1')
	const limit = Number(searchParams.get('limit') || '40')
	const name = searchParams.get('name')?.trim() || ''
	const offset = (page - 1) * limit

	try {
		const where = name.length > 0 ? like(product.name, `%${name}%`) : undefined
		const query = db.select().from(product).orderBy(asc(product.name)).limit(limit).offset(offset)
		if (where) query.where(where)
		const items = await query
		return NextResponse.json({ items }, { status: 200 })
	} catch {
		return NextResponse.json({ field: null, message: 'Erro ao buscar produtos.' }, { status: 500 })
	}
}

// Criar produto
export async function POST(request: Request) {
	const body = await request.json()
	const name = (body.name || '').trim()
	const slug = formatSlug(body.slug) || ''
	const available = typeof body.available === 'boolean' ? body.available : false
	const turns = Array.isArray(body.turns) ? body.turns : ['0', '6', '12', '18']

	if (name.length < 2) {
		return NextResponse.json({ field: 'name', message: 'O nome deve possuir ao menos dois caracteres.' }, { status: 400 })
	}

	// Verifica duplicidade
	const existing = await db.select().from(product).where(like(product.slug, slug)).limit(1)
	if (existing.length > 0 && existing[0].slug === slug) {
		return NextResponse.json({ field: 'name', message: 'Já existe um produto com este slug.' }, { status: 400 })
	}

	try {
		await db.insert(product).values({
			id: randomUUID(),
			name,
			slug,
			available,
			turns,
		})
		return NextResponse.json({ success: true }, { status: 200 })
	} catch {
		return NextResponse.json({ field: null, message: 'Erro ao criar produto.' }, { status: 500 })
	}
}

// Atualizar produto
export async function PUT(request: Request) {
	const body = await request.json()
	const id = (body.id || '').trim()
	const name = (body.name || '').trim()
	const slug = formatSlug(body.slug) || ''
	const available = typeof body.available === 'boolean' ? body.available : false
	const turns = Array.isArray(body.turns) ? body.turns : ['0', '6', '12', '18']

	if (!id) {
		return NextResponse.json({ field: 'id', message: 'ID do produto é obrigatório.' }, { status: 400 })
	}

	if (name.length < 2) {
		return NextResponse.json({ field: 'name', message: 'O nome deve possuir ao menos dois caracteres.' }, { status: 400 })
	}

	// Verifica duplicidade
	const existing = await db.select().from(product).where(like(product.slug, slug)).limit(1)
	if (existing.length > 0 && existing[0].id !== id && existing[0].slug === slug) {
		return NextResponse.json({ field: 'name', message: 'Já existe um produto com este slug.' }, { status: 400 })
	}

	try {
		const result = await db.update(product).set({ name, slug, available, turns }).where(eq(product.id, id))
		if (!result.rowCount) {
			return NextResponse.json({ field: 'id', message: 'Produto não encontrado.' }, { status: 404 })
		}
		return NextResponse.json({ success: true }, { status: 200 })
	} catch {
		return NextResponse.json({ field: null, message: 'Erro ao atualizar produto.' }, { status: 500 })
	}
}

// Excluir produto com exclusão em cascata completa
export async function DELETE(request: Request) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			console.log('❌ Usuário não autenticado tentou excluir produto')
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const id = (searchParams.get('id') || '').trim()

		if (!id) {
			console.log('⚠️ ID do produto não fornecido')
			return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 })
		}

		console.log('🔵 Iniciando exclusão em cascata do produto:', id)
		console.log('🔵 Usuário autenticado:', user.email)

		// Verificar se produto existe
		console.log('🔵 Verificando se produto existe...')
		const existingProduct = await db.select().from(product).where(eq(product.id, id)).limit(1)

		if (existingProduct.length === 0) {
			console.log('⚠️ Produto não encontrado para exclusão:', id)
			return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
		}

		console.log('✅ Produto encontrado:', existingProduct[0].name)

		// Executar exclusão em cascata usando transação
		await db.transaction(async (tx) => {
			console.log('🔵 Iniciando transação de exclusão em cascata...')

			// 1. Buscar todas as atividades do produto
			const activities = await tx.select({ id: productActivity.id }).from(productActivity).where(eq(productActivity.productId, id))
			const activityIds = activities.map((a) => a.id)
			console.log(`🔵 Encontradas ${activityIds.length} atividades do produto`)

			// 2. Excluir histórico das atividades
			if (activityIds.length > 0) {
				await tx.delete(productActivityHistory).where(inArray(productActivityHistory.productActivityId, activityIds))
				console.log('✅ Histórico das atividades excluído')
			}

			// 3. Excluir atividades do produto
			await tx.delete(productActivity).where(eq(productActivity.productId, id))
			console.log('✅ Atividades do produto excluídas')

			// 4. Buscar todos os problemas do produto
			const problems = await tx.select({ id: productProblem.id }).from(productProblem).where(eq(productProblem.productId, id))
			const problemIds = problems.map((p) => p.id)
			console.log(`🔵 Encontrados ${problemIds.length} problemas do produto`)

			// 5. Para cada problema, excluir soluções e suas dependências
			if (problemIds.length > 0) {
				// Buscar todas as soluções dos problemas
				const solutions = await tx.select({ id: productSolution.id }).from(productSolution).where(inArray(productSolution.productProblemId, problemIds))
				const solutionIds = solutions.map((s) => s.id)
				console.log(`🔵 Encontradas ${solutionIds.length} soluções dos problemas`)

				// Excluir verificações das soluções
				if (solutionIds.length > 0) {
					await tx.delete(productSolutionChecked).where(inArray(productSolutionChecked.productSolutionId, solutionIds))
					console.log('✅ Verificações das soluções excluídas')
				}

				// Excluir imagens das soluções
				if (solutionIds.length > 0) {
					await tx.delete(productSolutionImage).where(inArray(productSolutionImage.productSolutionId, solutionIds))
					console.log('✅ Imagens das soluções excluídas')
				}

				// Excluir todas as soluções
				await tx.delete(productSolution).where(inArray(productSolution.productProblemId, problemIds))
				console.log('✅ Soluções dos problemas excluídas')

				// Excluir imagens dos problemas
				await tx.delete(productProblemImage).where(inArray(productProblemImage.productProblemId, problemIds))
				console.log('✅ Imagens dos problemas excluídas')

				// Excluir todos os problemas
				await tx.delete(productProblem).where(eq(productProblem.productId, id))
				console.log('✅ Problemas do produto excluídos')
			}

			// 6. Excluir dependências do produto
			await tx.delete(productDependency).where(eq(productDependency.productId, id))
			console.log('✅ Dependências do produto excluídas')

			// 7. Excluir manual do produto
			await tx.delete(productManual).where(eq(productManual.productId, id))
			console.log('✅ Manual do produto excluído')

			// 8. Excluir associações de contatos
			await tx.delete(productContact).where(eq(productContact.productId, id))
			console.log('✅ Associações de contatos excluídas')

			// 9. Finalmente, excluir o produto
			await tx.delete(product).where(eq(product.id, id))
			console.log('✅ Produto excluído com sucesso')
		})

		console.log('✅ Exclusão em cascata do produto concluída:', id)

		return NextResponse.json({ success: true, message: 'Produto e todos os dados relacionados excluídos com sucesso' })
	} catch (error) {
		console.error('❌ Erro detalhado ao excluir produto:', error)
		console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A')
		console.error('❌ Tipo do erro:', typeof error)
		console.error('❌ Mensagem do erro:', error instanceof Error ? error.message : String(error))

		return NextResponse.json(
			{
				success: false,
				error: 'Erro interno do servidor',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
