import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'

// Store em memória para typing indicators (em produção seria Redis)
const typingUsers = new Map<string, Map<string, { userId: string; userName: string; timestamp: number }>>()

// POST /api/chat/typing - Iniciar/parar typing indicator
export async function POST(request: Request) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { channelId, isTyping } = await request.json()

		if (!channelId) {
			return NextResponse.json({ error: 'ID do canal é obrigatório.' }, { status: 400 })
		}

		console.log('ℹ️ Typing indicator:', { channelId, userId: user.id, userName: user.name, isTyping })

		// Inicializar canal se não existir
		if (!typingUsers.has(channelId)) {
			typingUsers.set(channelId, new Map())
		}

		const channelTypingUsers = typingUsers.get(channelId)!

		if (isTyping) {
			// Adicionar usuário digitando
			channelTypingUsers.set(user.id, {
				userId: user.id,
				userName: user.name,
				timestamp: Date.now(),
			})
		} else {
			// Remover usuário digitando
			channelTypingUsers.delete(user.id)
		}

		console.log('✅ Typing indicator atualizado')
		return NextResponse.json({ success: true })
	} catch (error) {
		console.log('❌ Erro ao atualizar typing indicator:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}

// GET /api/chat/typing?channelId=xyz - Buscar usuários digitando
export async function GET(request: Request) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const url = new URL(request.url)
		const channelId = url.searchParams.get('channelId')

		if (!channelId) {
			return NextResponse.json({ error: 'ID do canal é obrigatório.' }, { status: 400 })
		}

		const channelTypingUsers = typingUsers.get(channelId)
		const currentTime = Date.now()
		const TYPING_TIMEOUT = 3000 // 3 segundos

		if (!channelTypingUsers) {
			return NextResponse.json([])
		}

		// Remover usuários com typing expirado
		for (const [userId, data] of channelTypingUsers.entries()) {
			if (currentTime - data.timestamp > TYPING_TIMEOUT) {
				channelTypingUsers.delete(userId)
			}
		}

		// Retornar usuários digitando (exceto o próprio usuário)
		const result = Array.from(channelTypingUsers.values()).filter((data) => data.userId !== user.id)

		return NextResponse.json(result)
	} catch (error) {
		console.log('❌ Erro ao buscar typing indicators:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}
