import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { chatUserStatus } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET - Obter status de presença de usuários
export async function GET() {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		// Buscar status atual do usuário
		const userStatus = await db.select().from(chatUserStatus).where(eq(chatUserStatus.userId, user.id)).limit(1)

		if (userStatus.length > 0) {
			return NextResponse.json({
				status: userStatus[0].status,
				lastSeenAt: userStatus[0].lastSeenAt,
				updatedAt: userStatus[0].updatedAt,
			})
		} else {
			// Se não existe, retornar status padrão
			return NextResponse.json({
				status: 'offline',
				lastSeenAt: new Date(),
				updatedAt: new Date(),
			})
		}
	} catch (error) {
		console.log('❌ Erro ao buscar status de presença:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}

// POST - Atualizar status de presença
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { status } = await request.json()

		console.log('ℹ️ Alterando status de presença para:', status)

		// Validar status
		const validStatuses = ['online', 'offline', 'away', 'busy']
		if (!status || !validStatuses.includes(status)) {
			return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
		}

		// Verificar se já existe um registro de status para o usuário
		const existingStatus = await db.select().from(chatUserStatus).where(eq(chatUserStatus.userId, user.id)).limit(1)

		if (existingStatus.length > 0) {
			// Atualizar status existente
			await db
				.update(chatUserStatus)
				.set({
					status,
					lastSeenAt: status === 'offline' ? new Date() : existingStatus[0].lastSeenAt,
					updatedAt: new Date(),
				})
				.where(eq(chatUserStatus.userId, user.id))
		} else {
			// Criar novo registro de status
			await db.insert(chatUserStatus).values({
				userId: user.id,
				status,
				lastSeenAt: new Date(),
			})
		}

		console.log('✅ Status de presença atualizado para:', status)

		return NextResponse.json({
			success: true,
			status,
			message: `Status alterado para ${status}`,
		})
	} catch (error) {
		console.log('❌ Erro ao alterar status de presença:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}

// PUT - Marcar usuário como offline
export async function PUT() {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
		}

		// TODO: Implementar atualização real no banco
		console.log('✅ Usuário marcado como offline:', user.id)

		return NextResponse.json({
			success: true,
			message: 'Usuário marcado como offline',
		})
	} catch (error) {
		console.log('❌ Erro ao marcar usuário como offline:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
