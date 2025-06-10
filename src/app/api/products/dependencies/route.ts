import { NextRequest, NextResponse } from 'next/server'
import { eq, isNull, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { productDependency } from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const productId = searchParams.get('productId')

		if (!productId) {
			return NextResponse.json({ error: 'ProductId é obrigatório' }, { status: 400 })
		}

		// Busca todas as dependências do produto
		const dependencies = await db.select().from(productDependency).where(eq(productDependency.productId, productId)).orderBy(productDependency.order)

		// Organiza as dependências em uma estrutura hierárquica
		const buildTree = (items: typeof dependencies, parentId: string | null = null): typeof dependencies => {
			return items
				.filter((item) => item.parentId === parentId)
				.map((item) => ({
					...item,
					children: buildTree(items, item.id),
				}))
		}

		const tree = buildTree(dependencies)

		return NextResponse.json({ dependencies: tree })
	} catch (error) {
		console.error('Erro ao buscar dependências:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		// Verificar autenticação
		const authUser = await getAuthUser()
		if (!authUser) {
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const { productId, name, type, category, icon, description, url, parentId } = await req.json()

		// Validação básica
		if (!productId || !name || !type || !category) {
			return NextResponse.json({ error: 'ProductId, nome, tipo e categoria são obrigatórios' }, { status: 400 })
		}

		// Determinar a ordem (último + 1 no mesmo nível)
		const siblings = await db
			.select()
			.from(productDependency)
			.where(and(eq(productDependency.productId, productId), parentId ? eq(productDependency.parentId, parentId) : isNull(productDependency.parentId)))

		const nextOrder = siblings.length > 0 ? Math.max(...siblings.map((s) => s.order)) + 1 : 0

		// Criar dependência
		const dependencyId = randomUUID()
		const newDependency = await db
			.insert(productDependency)
			.values({
				id: dependencyId,
				productId,
				name,
				type,
				category,
				icon: icon || null,
				description: description || null,
				url: url || null,
				parentId: parentId || null,
				order: nextOrder,
			})
			.returning()

		return NextResponse.json({ dependency: newDependency[0] }, { status: 201 })
	} catch (error) {
		console.error('Erro ao criar dependência:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

export async function PUT(req: NextRequest) {
	try {
		// Verificar autenticação
		const authUser = await getAuthUser()
		if (!authUser) {
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const { id, name, type, category, icon, description, url } = await req.json()

		// Validação básica
		if (!id || !name || !type || !category) {
			return NextResponse.json({ error: 'ID, nome, tipo e categoria são obrigatórios' }, { status: 400 })
		}

		// Verificar se a dependência existe
		const existingDependency = await db.select().from(productDependency).where(eq(productDependency.id, id)).limit(1)

		if (!existingDependency.length) {
			return NextResponse.json({ error: 'Dependência não encontrada' }, { status: 404 })
		}

		// Atualizar dependência
		const updatedDependency = await db
			.update(productDependency)
			.set({
				name,
				type,
				category,
				icon: icon || null,
				description: description || null,
				url: url || null,
				updatedAt: new Date(),
			})
			.where(eq(productDependency.id, id))
			.returning()

		return NextResponse.json({ dependency: updatedDependency[0] })
	} catch (error) {
		console.error('Erro ao atualizar dependência:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

export async function DELETE(req: NextRequest) {
	try {
		// Verificar autenticação
		const authUser = await getAuthUser()
		if (!authUser) {
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
		}

		// Verificar se a dependência existe
		const existingDependency = await db.select().from(productDependency).where(eq(productDependency.id, id)).limit(1)

		if (!existingDependency.length) {
			return NextResponse.json({ error: 'Dependência não encontrada' }, { status: 404 })
		}

		// Verificar se há dependências filhas
		const children = await db.select().from(productDependency).where(eq(productDependency.parentId, id))

		if (children.length > 0) {
			return NextResponse.json({ error: 'Não é possível excluir uma dependência que possui itens filhos. Exclua primeiro os itens filhos.' }, { status: 400 })
		}

		// Excluir dependência
		await db.delete(productDependency).where(eq(productDependency.id, id))

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Erro ao excluir dependência:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
