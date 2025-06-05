import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productSolution, authUser, productSolutionChecked } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

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
						image: '/uploads/profile/default.jpg', // ajuste se tiver campo de imagem
					}
				: {
						id: solution.userId,
						name: 'Usuário desconhecido',
						image: '/uploads/profile/default.jpg',
					},
		}))

		return NextResponse.json({ items: result })
	} catch (e) {
		return NextResponse.json({ error: 'Erro ao buscar soluções.' }, { status: 500 })
	}
}
