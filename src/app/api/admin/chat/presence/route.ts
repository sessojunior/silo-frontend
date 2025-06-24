import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

// Tipos para presença
interface PresenceStatus {
	userId: string
	userName: string
	status: 'online' | 'away' | 'busy' | 'offline'
	lastActivity: Date
	updatedAt: Date
}

interface UpdatePresenceRequest {
	status: 'online' | 'away' | 'busy' | 'offline'
}

// GET: Buscar status de presença de todos os chatUsers
export async function GET() {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		console.log('🔵 Buscando status de presença dos chatUsers')

		// Buscar presença de todos usuários (incluindo atual para verificações)
		const presenceData = await db
			.select({
				userId: schema.chatUserPresence.userId,
				userName: schema.authUser.name,
				status: schema.chatUserPresence.status,
				lastActivity: schema.chatUserPresence.lastActivity,
				updatedAt: schema.chatUserPresence.updatedAt,
			})
			.from(schema.chatUserPresence)
			.innerJoin(schema.authUser, eq(schema.chatUserPresence.userId, schema.authUser.id))

		// Atualizar status automático baseado em inatividade
		const now = new Date()
		const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000) // 5 minutos
		const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000) // 30 minutos

		const updatedPresence: PresenceStatus[] = presenceData.map((p) => {
			let autoStatus = p.status

			// Auto-atualização de status baseado em inatividade (apenas se online)
			if (p.status === 'online') {
				if (p.lastActivity < thirtyMinutesAgo) {
					autoStatus = 'offline'
				} else if (p.lastActivity < fiveMinutesAgo) {
					autoStatus = 'away'
				}
			}
			// Status manuais (away, busy, offline) são preservados

			return {
				userId: p.userId,
				userName: p.userName,
				status: autoStatus as PresenceStatus['status'],
				lastActivity: p.lastActivity,
				updatedAt: p.updatedAt,
			}
		})

		// Separar usuário atual dos outros para retorno
		const currentUserPresence = updatedPresence.find((p) => p.userId === user.id)
		const otherUsersPresence = updatedPresence.filter((p) => p.userId !== user.id)

		console.log('✅ Status de presença obtido:', {
			currentUser: currentUserPresence ? 'found' : 'not found',
			otherUsers: otherUsersPresence.length,
		})

		return NextResponse.json({
			presence: otherUsersPresence, // Para compatibilidade (sidebar usa apenas outros usuários)
			currentUserPresence, // Para verificação de status atual
			timestamp: now.toISOString(),
		})
	} catch (error) {
		console.error('❌ Erro ao buscar status de presença:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// POST: Atualizar status de presença do chatUser atual
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		const body: UpdatePresenceRequest = await request.json()
		const { status } = body

		// Validar status
		const validStatuses = ['online', 'away', 'busy', 'offline']
		if (!status || !validStatuses.includes(status)) {
			return NextResponse.json({ error: 'Status inválido. Use: online, away, busy ou offline' }, { status: 400 })
		}

		console.log('🔵 Atualizando status de presença:', { userId: user.id, status })

		const now = new Date()

		// Upsert na tabela de presença
		await db
			.insert(schema.chatUserPresence)
			.values({
				userId: user.id,
				status,
				lastActivity: now,
				updatedAt: now,
			})
			.onConflictDoUpdate({
				target: schema.chatUserPresence.userId,
				set: {
					status,
					lastActivity: now,
					updatedAt: now,
				},
			})

		console.log('✅ Status de presença atualizado:', { userId: user.id, status })

		return NextResponse.json({
			success: true,
			userId: user.id,
			status,
			lastActivity: now,
			updatedAt: now,
		})
	} catch (error) {
		console.error('❌ Erro ao atualizar status de presença:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PATCH: Atualizar apenas atividade (heartbeat)
export async function PATCH() {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		console.log('🔵 Heartbeat de atividade:', { userId: user.id })

		const now = new Date()

		// Atualizar apenas lastActivity mantendo status atual
		await db
			.update(schema.chatUserPresence)
			.set({
				lastActivity: now,
				updatedAt: now,
			})
			.where(eq(schema.chatUserPresence.userId, user.id))

		// Se não existir registro, criar como online apenas se for o primeiro acesso
		const existingPresence = await db.select().from(schema.chatUserPresence).where(eq(schema.chatUserPresence.userId, user.id)).limit(1)

		if (existingPresence.length === 0) {
			// Criar apenas como online se for primeira vez (não sobrescrever status manual)
			await db.insert(schema.chatUserPresence).values({
				userId: user.id,
				status: 'online', // Apenas primeira vez
				lastActivity: now,
				updatedAt: now,
			})
		}

		console.log('✅ Atividade atualizada:', { userId: user.id })

		return NextResponse.json({
			success: true,
			lastActivity: now,
		})
	} catch (error) {
		console.error('❌ Erro no heartbeat de atividade:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
