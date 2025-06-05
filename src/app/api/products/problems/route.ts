import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { product, productProblem } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { getAuthUser } from '@/lib/auth/token'

export async function GET(req: NextRequest) {
	const user = await getAuthUser()
	if (!user) {
		return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
	}

	const { searchParams } = new URL(req.url)
	const slug = searchParams.get('slug')

	if (!slug) {
		return NextResponse.json({ field: null, message: 'Parâmetro slug é obrigatório.' }, { status: 400 })
	}

	try {
		// Busca o produto pelo slug
		const prod = await db.select().from(product).where(eq(product.slug, slug)).limit(1)
		console.log('prod', prod)
		if (!prod.length) {
			return NextResponse.json({ field: null, message: 'Produto não encontrado.' }, { status: 404 })
		}
		const productId = prod[0].id

		// Busca os problemas desse produto
		const problems = await db.select().from(productProblem).where(eq(productProblem.productId, productId))

		return NextResponse.json({ items: problems })
	} catch (e) {
		return NextResponse.json({ field: null, message: 'Erro ao buscar problemas.' }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { productId, title, description } = await req.json()
		if (!productId || typeof title !== 'string' || typeof description !== 'string') {
			return NextResponse.json({ field: null, message: 'Todos os campos são obrigatórios.' }, { status: 400 })
		}
		if (title.trim().length < 5) {
			return NextResponse.json({ field: 'title', message: 'O título deve ter pelo menos 5 caracteres.' }, { status: 400 })
		}
		if (description.trim().length < 20) {
			return NextResponse.json({ field: 'description', message: 'A descrição deve ter pelo menos 20 caracteres.' }, { status: 400 })
		}

		const newProblem = {
			id: randomUUID(),
			productId,
			userId: user.id,
			title: title.trim(),
			description: description.trim(),
			createdAt: new Date(),
			updatedAt: new Date(),
		}
		await db.insert(productProblem).values(newProblem)
		return NextResponse.json({ success: true }, { status: 200 })
	} catch (e) {
		return NextResponse.json({ field: null, message: 'Erro ao cadastrar problema.' }, { status: 500 })
	}
}

export async function PUT(req: NextRequest) {
	const user = await getAuthUser()
	if (!user) {
		return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
	}

	try {
		const { id, title, description } = await req.json()
		if (!id || typeof title !== 'string' || typeof description !== 'string') {
			return NextResponse.json({ field: null, message: 'Todos os campos são obrigatórios.' }, { status: 400 })
		}
		if (title.trim().length < 5) {
			return NextResponse.json({ field: 'title', message: 'O título deve ter pelo menos 5 caracteres.' }, { status: 400 })
		}
		if (description.trim().length < 20) {
			return NextResponse.json({ field: 'description', message: 'A descrição deve ter pelo menos 20 caracteres.' }, { status: 400 })
		}
		const updated = await db.update(productProblem).set({ title: title.trim(), description: description.trim(), updatedAt: new Date() }).where(eq(productProblem.id, id)).returning()
		if (!updated.length) {
			return NextResponse.json({ field: null, message: 'Problema não encontrado.' }, { status: 404 })
		}
		return NextResponse.json({ success: true }, { status: 200 })
	} catch (e) {
		return NextResponse.json({ field: null, message: 'Erro ao atualizar problema.' }, { status: 500 })
	}
}

export async function DELETE(req: NextRequest) {
	const user = await getAuthUser()
	if (!user) {
		return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
	}

	try {
		const { id } = await req.json()
		if (!id) {
			return NextResponse.json({ field: null, message: 'ID obrigatório.' }, { status: 400 })
		}
		const deleted = await db.delete(productProblem).where(eq(productProblem.id, id)).returning()
		if (!deleted.length) {
			return NextResponse.json({ field: null, message: 'Problema não encontrado.' }, { status: 404 })
		}
		return NextResponse.json({ success: true }, { status: 200 })
	} catch (e) {
		return NextResponse.json({ field: null, message: 'Erro ao excluir problema.' }, { status: 500 })
	}
}
