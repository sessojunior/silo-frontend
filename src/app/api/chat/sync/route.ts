import { NextRequest, NextResponse } from 'next/server'
import { desc, gt, and, or, exists, isNull, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

// Tipos para resposta da sincronização
interface SyncResponse {
	hasUpdates: boolean
	messages: Array<{
		id: string
		content: string
		senderUserId: string
		senderName: string
		receiverGroupId: string | null
		receiverUserId: string | null
		createdAt: Date
		readAt: Date | null
		messageType: 'groupMessage' | 'userMessage'
	}>
	presence: Array<{
		userId: string
		status: string
		lastActivity: Date
	}>
	unreadCounts: {
		groups: Record<string, number>
		users: Record<string, number>
	}
	timestamp: string
}

// GET: Sincronização inteligente baseada em timestamp
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const sinceTimestamp = searchParams.get('since')
		const sinceDate = sinceTimestamp ? new Date(sinceTimestamp) : new Date(Date.now() - 5 * 60 * 1000) // 5 minutos atrás por padrão

		console.log('🔵 Chat sync iniciado:', { userId: user.id, since: sinceDate.toISOString() })

		// 1. Buscar novas mensagens (groupMessage + userMessage)
		const newMessages = await db
			.select({
				id: schema.chatMessage.id,
				content: schema.chatMessage.content,
				senderUserId: schema.chatMessage.senderUserId,
				senderName: schema.authUser.name,
				receiverGroupId: schema.chatMessage.receiverGroupId,
				receiverUserId: schema.chatMessage.receiverUserId,
				createdAt: schema.chatMessage.createdAt,
				readAt: schema.chatMessage.readAt,
			})
			.from(schema.chatMessage)
			.innerJoin(schema.authUser, eq(schema.chatMessage.senderUserId, schema.authUser.id))
			.where(
				and(
					gt(schema.chatMessage.createdAt, sinceDate),
					isNull(schema.chatMessage.deletedAt),
					or(
						// groupMessage: mensagens para grupos onde usuário participa
						exists(
							db
								.select()
								.from(schema.userGroup)
								.where(and(eq(schema.userGroup.userId, user.id), eq(schema.userGroup.groupId, schema.chatMessage.receiverGroupId!))),
						),
						// userMessage: mensagens recebidas pelo usuário
						eq(schema.chatMessage.receiverUserId, user.id),
					),
				),
			)
			.orderBy(desc(schema.chatMessage.createdAt))
			.limit(50)

		// 2. Buscar atualizações de presença (OTIMIZADO: evitar duplicatas)
		const updatedPresence = await db
			.select({
				userId: schema.chatUserPresence.userId,
				status: schema.chatUserPresence.status,
				lastActivity: schema.chatUserPresence.lastActivity,
				updatedAt: schema.chatUserPresence.updatedAt,
			})
			.from(schema.chatUserPresence)
			.where(gt(schema.chatUserPresence.updatedAt, sinceDate))

		// FILTRO ANTI-LOOP: Só retornar mudanças de presença se forem MUITO recentes (últimos 10 segundos)
		// Isso evita loops infinitos retornando sempre a mesma mudança
		const tenSecondsAgo = new Date(Date.now() - 10 * 1000)
		const filteredPresence = updatedPresence.filter((p) => p.updatedAt > tenSecondsAgo)

		console.log('🔍 Filtro presença:', {
			total: updatedPresence.length,
			filtered: filteredPresence.length,
			cutoff: tenSecondsAgo.toISOString(),
		})

		// 3. Calcular contadores não lidas APENAS para userMessage
		let unreadCounts = { groups: {}, users: {} }

		const userMessageCounts = await db
			.selectDistinct({
				senderUserId: schema.chatMessage.senderUserId,
			})
			.from(schema.chatMessage)
			.where(
				and(
					eq(schema.chatMessage.receiverUserId, user.id), // userMessage para usuário atual
					isNull(schema.chatMessage.readAt), // Não lida
					isNull(schema.chatMessage.deletedAt), // Não excluída
				),
			)

		// Contar mensagens não lidas por usuário
		const usersCount: Record<string, number> = {}
		for (const msgCount of userMessageCounts) {
			const unreadByUser = await db
				.select({ id: schema.chatMessage.id })
				.from(schema.chatMessage)
				.where(and(eq(schema.chatMessage.senderUserId, msgCount.senderUserId), eq(schema.chatMessage.receiverUserId, user.id), isNull(schema.chatMessage.readAt), isNull(schema.chatMessage.deletedAt)))

			usersCount[msgCount.senderUserId] = unreadByUser.length
		}

		unreadCounts = {
			groups: {}, // groupMessage não tem contadores
			users: usersCount,
		}

		// 4. Mapear tipo de mensagem
		const messagesWithType = newMessages.map((msg) => ({
			...msg,
			messageType: msg.receiverGroupId ? ('groupMessage' as const) : ('userMessage' as const),
		}))

		const response: SyncResponse = {
			hasUpdates: newMessages.length > 0, // APENAS mensagens são "atualizações relevantes"
			messages: messagesWithType,
			presence: filteredPresence, // Presença FILTRADA para evitar loops
			unreadCounts,
			timestamp: new Date().toISOString(),
		}

		console.log('✅ Chat sync concluído:', {
			newMessages: newMessages.length,
			presenceUpdates: filteredPresence.length,
			presenceFiltered: updatedPresence.length - filteredPresence.length,
			unreadUsers: Object.keys(unreadCounts.users).length,
			hasUpdates: newMessages.length > 0,
			sinceTimestamp: sinceTimestamp || 'default (5min)',
		})

		return NextResponse.json(response)
	} catch (error) {
		console.error('❌ Erro no chat sync:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
