import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { product } from '@/lib/db/schema'
import { eq, like, asc } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { formatSlug } from '@/lib/utils'

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
		const result = await db.update(product).set({ name, slug, available }).where(eq(product.id, id))
		if (!result.rowCount) {
			return NextResponse.json({ field: 'id', message: 'Produto não encontrado.' }, { status: 404 })
		}
		return NextResponse.json({ success: true }, { status: 200 })
	} catch {
		return NextResponse.json({ field: null, message: 'Erro ao atualizar produto.' }, { status: 500 })
	}
}

// Excluir produto
export async function DELETE(request: Request) {
	const { searchParams } = new URL(request.url)
	const id = (searchParams.get('id') || '').trim()
	if (!id) {
		return NextResponse.json({ field: 'id', message: 'ID do produto é obrigatório.' }, { status: 400 })
	}
	try {
		const result = await db.delete(product).where(eq(product.id, id))
		if (!result.rowCount) {
			return NextResponse.json({ field: 'id', message: 'Produto não encontrado.' }, { status: 404 })
		}
		return NextResponse.json({ success: true }, { status: 200 })
	} catch {
		return NextResponse.json({ field: null, message: 'Erro ao excluir produto.' }, { status: 500 })
	}
}
