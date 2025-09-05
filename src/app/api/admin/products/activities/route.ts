import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productActivity } from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'
import { randomUUID } from 'crypto'
import { eq, and } from 'drizzle-orm'
import { formatDate } from '@/lib/dateUtils'

// Helper para resposta padronizada
function jsonResponse(body: Record<string, unknown>, status = 200) {
	return NextResponse.json(body, { status })
}

export async function POST(req: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
		}

		const data = await req.json()
		const { productId, date, turn, status, description, problemCategoryId } = data || {}

		// Normalizar data para timezone de São Paulo
		const normalizedDate = formatDate(date)

		if (!productId || !normalizedDate || turn === undefined || !status) {
			return jsonResponse({ success: false, error: 'Parâmetros obrigatórios ausentes.' }, 400)
		}

		// Verificar se já existe registro para productId+date+turn
		const existing = await db.query.productActivity.findFirst({
			where: and(eq(productActivity.productId, productId), eq(productActivity.date, normalizedDate), eq(productActivity.turn, turn)),
		})

		let action: 'created' | 'updated' = 'created'
		let record
		if (existing) {
			// Atualiza registro existente
			;[record] = await db
				.update(productActivity)
				.set({ status, description: description || null, problemCategoryId: problemCategoryId || null })
				.where(eq(productActivity.id, existing.id))
				.returning()
			action = 'updated'
		} else {
			// Criar novo registro
			;[record] = await db
				.insert(productActivity)
				.values({
					id: randomUUID(),
					productId,
					userId: user.id,
					date: normalizedDate,
					turn,
					status,
					description: description || null,
					problemCategoryId: problemCategoryId || null,
				})
				.returning()
		}

		return jsonResponse({ success: true, data: record, action })
	} catch (error) {
		console.error('❌ Erro ao criar product_activity', error)
		return jsonResponse({ success: false, error: 'Erro interno' }, 500)
	}
}

export async function PUT(req: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401)

		const data = await req.json()
		const { id, status, description, problemCategoryId } = data || {}

		if (!id || !status) {
			return jsonResponse({ success: false, error: 'Parâmetros obrigatórios ausentes.' }, 400)
		}

		// Verificar se o registro existe antes de atualizar
		await db.query.productActivity.findFirst({
			where: eq(productActivity.id, id),
		})

		const [updated] = await db
			.update(productActivity)
			.set({ status, description: description || null, problemCategoryId: problemCategoryId || null })
			.where(eq(productActivity.id, id))
			.returning()

		return jsonResponse({ success: true, data: updated })
	} catch (error) {
		console.error('❌ Erro ao atualizar product_activity', error)
		return jsonResponse({ success: false, error: 'Erro interno' }, 500)
	}
}
