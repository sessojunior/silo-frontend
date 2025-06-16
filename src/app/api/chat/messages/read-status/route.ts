import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { chatMessage, chatMessageStatus, chatParticipant } from '@/lib/db/schema'
import { eq, and, inArray, count, sql, isNull } from 'drizzle-orm'

// GET /api/chat/messages/read-status?messageIds=id1,id2,id3 - Buscar status de leitura das mensagens
export async function GET(request: Request) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const url = new URL(request.url)
		const messageIdsParam = url.searchParams.get('messageIds')

		if (!messageIdsParam) {
			return NextResponse.json({ error: 'IDs das mensagens são obrigatórios.' }, { status: 400 })
		}

		const messageIds = messageIdsParam.split(',')

		console.log('ℹ️ Buscando status de leitura para mensagens:', messageIds.length)

		// Buscar mensagens e seus status de leitura
		const messagesWithStatus = await db
			.select({
				messageId: chatMessage.id,
				senderId: chatMessage.senderId,
				channelId: chatMessage.channelId,
				createdAt: chatMessage.createdAt,
				deliveredAt: chatMessage.deliveredAt,
				readCount: count(chatMessageStatus.id),
			})
			.from(chatMessage)
			.leftJoin(chatMessageStatus, eq(chatMessage.id, chatMessageStatus.messageId))
			.where(inArray(chatMessage.id, messageIds))
			.groupBy(chatMessage.id, chatMessage.senderId, chatMessage.channelId, chatMessage.createdAt, chatMessage.deliveredAt)

		// Para cada mensagem, calcular o total de participantes do canal
		const messageStatuses = await Promise.all(
			messagesWithStatus.map(async (msg) => {
				// Contar participantes do canal
				const participantCount = await db
					.select({ count: count() })
					.from(chatParticipant)
					.where(eq(chatParticipant.channelId, msg.channelId))
					.then((result) => result[0]?.count || 0)

				// Determinar status da mensagem
				let status: 'sent' | 'delivered' | 'read' = 'sent'

				if (msg.readCount > 0) {
					status = 'read'
				} else if (msg.deliveredAt) {
					status = 'delivered'
				}

				return {
					messageId: msg.messageId,
					status,
					readCount: msg.readCount,
					totalParticipants: participantCount - 1, // Excluir o próprio remetente
					isOwnMessage: msg.senderId === user.id,
				}
			}),
		)

		console.log(`✅ Status de leitura calculado para ${messageStatuses.length} mensagens`)
		return NextResponse.json(messageStatuses)
	} catch (error) {
		console.log('❌ Erro ao buscar status de leitura:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}

// POST /api/chat/messages/read-status - Marcar mensagens como lidas
export async function POST(request: Request) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { messageIds } = await request.json()

		if (!Array.isArray(messageIds) || messageIds.length === 0) {
			return NextResponse.json({ error: 'IDs das mensagens são obrigatórios.' }, { status: 400 })
		}

		console.log('ℹ️ Marcando mensagens como lidas:', messageIds.length)

		// Inserir status de leitura para cada mensagem (ignorar duplicatas)
		const readStatuses = messageIds.map((messageId) => ({
			messageId,
			userId: user.id,
		}))

		// Usar ON CONFLICT para evitar duplicatas
		await db.insert(chatMessageStatus).values(readStatuses).onConflictDoNothing()

		// Marcar como entregues se ainda não foram
		await db
			.update(chatMessage)
			.set({ deliveredAt: sql`COALESCE(delivered_at, NOW())` })
			.where(and(inArray(chatMessage.id, messageIds), isNull(chatMessage.deliveredAt)))

		console.log('✅ Mensagens marcadas como lidas')
		return NextResponse.json({ success: true })
	} catch (error) {
		console.log('❌ Erro ao marcar mensagens como lidas:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}

// PUT /api/chat/messages/read-status/deliver - Marcar mensagens como entregues
export async function PUT(request: Request) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { messageIds } = await request.json()

		if (!Array.isArray(messageIds) || messageIds.length === 0) {
			return NextResponse.json({ error: 'IDs das mensagens são obrigatórios.' }, { status: 400 })
		}

		console.log('ℹ️ Marcando mensagens como entregues:', messageIds.length)

		// Marcar mensagens como entregues (apenas se ainda não foram)
		await db
			.update(chatMessage)
			.set({ deliveredAt: sql`NOW()` })
			.where(and(inArray(chatMessage.id, messageIds), isNull(chatMessage.deliveredAt)))

		console.log('✅ Mensagens marcadas como entregues')
		return NextResponse.json({ success: true })
	} catch (error) {
		console.log('❌ Erro ao marcar mensagens como entregues:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}
