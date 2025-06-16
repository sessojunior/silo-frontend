import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'

// GET - Obter status de presença de usuários
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
		}

		const url = new URL(request.url)
		const userIds = url.searchParams.get('userIds')?.split(',') || []

		// Mock data por enquanto - TODO: Implementar com banco real
		const mockPresenceData = userIds.map((userId) => ({
			userId,
			userName: `User ${userId}`,
			userEmail: `user${userId}@example.com`,
			isOnline: Math.random() > 0.5,
			lastSeenAt: new Date(),
			status: Math.random() > 0.5 ? 'online' : 'offline',
			lastSeenText: 'Online agora',
		}))

		console.log('✅ Status de presença obtido para', mockPresenceData.length, 'usuários')

		return NextResponse.json(mockPresenceData)
	} catch (error) {
		console.log('❌ Erro ao obter status de presença:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// POST - Atualizar status de presença
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
		}

		const { status, isOnline, lastSeenAt } = await request.json()

		// Validações
		if (typeof isOnline !== 'boolean') {
			return NextResponse.json({ error: 'isOnline deve ser boolean' }, { status: 400 })
		}

		if (status && !['online', 'away', 'busy', 'offline'].includes(status)) {
			return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
		}

		// TODO: Implementar atualização real no banco
		console.log('✅ Status de presença atualizado para usuário:', user.id, 'Status:', status)

		return NextResponse.json({
			success: true,
			message: 'Status de presença atualizado',
			lastSeenText: formatLastSeen(lastSeenAt ? new Date(lastSeenAt) : new Date(), isOnline),
		})
	} catch (error) {
		console.log('❌ Erro ao atualizar status de presença:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
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
