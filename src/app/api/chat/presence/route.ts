import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { chatUserStatus } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET - Obter status de presença de usuários
export async function GET(request: NextRequest) {
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

// Função auxiliar para formatar "last seen"
function formatLastSeen(lastSeenAt: Date | null, isOnline: boolean): string {
	if (isOnline) {
		return 'Online agora'
	}

	if (!lastSeenAt) {
		return 'Último acesso: nunca'
	}

	const now = new Date()
	const diffMs = now.getTime() - lastSeenAt.getTime()
	const diffMinutes = Math.floor(diffMs / (1000 * 60))
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffMinutes < 1) {
		return 'Visto agora mesmo'
	} else if (diffMinutes < 60) {
		return `Visto há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
	} else if (diffHours < 24) {
		return `Visto há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
	} else if (diffDays < 7) {
		return `Visto há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
	} else {
		return `Visto em ${lastSeenAt.toLocaleDateString('pt-BR')}`
	}
}
