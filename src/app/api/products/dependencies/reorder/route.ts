import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { productDependency } from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

export async function PUT(req: NextRequest) {
	try {
		// Verificar autenticação
		const authUser = await getAuthUser()
		if (!authUser) {
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const body = await req.json()
		const { productId, items } = body

		if (!productId || !items || !Array.isArray(items)) {
			return NextResponse.json({ error: 'ProductId e items são obrigatórios' }, { status: 400 })
		}

		console.log('ℹ️ Reordenando dependências para produto:', productId)
		console.log('ℹ️ Itens a serem atualizados:', items.length)

		// Validar se todos os itens pertencem ao produto
		const existingDependencies = await db.select({ id: productDependency.id }).from(productDependency).where(eq(productDependency.productId, productId))

		const existingIds = existingDependencies.map((dep) => dep.id)
		const invalidItems = items.filter((item: any) => !existingIds.includes(item.id))

		if (invalidItems.length > 0) {
			console.log('❌ Itens inválidos encontrados:', invalidItems)
			return NextResponse.json({ error: 'Alguns itens não pertencem a este produto' }, { status: 400 })
		}

		// Atualizar cada item em transação
		await db.transaction(async (tx) => {
			for (const item of items) {
				await tx
					.update(productDependency)
					.set({
						parentId: item.parentId,
						treePath: item.treePath,
						treeDepth: item.treeDepth,
						sortKey: item.sortKey,
						updatedAt: new Date(),
					})
					.where(eq(productDependency.id, item.id))
			}
		})

		console.log('✅ Dependências reordenadas com sucesso!')

		return NextResponse.json({
			success: true,
			message: 'Dependências reordenadas com sucesso!',
		})
	} catch (error) {
		console.error('❌ Erro ao reordenar dependências:', error)
		return NextResponse.json(
			{
				error: 'Erro interno do servidor',
			},
			{ status: 500 },
		)
	}
}
