import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { chatMessage, chatChannel, authUser } from '@/lib/db/schema'
import { eq, and, desc, isNull, ne } from 'drizzle-orm'

// GET /api/chat/notifications - Buscar notificações de mensagens
export async function GET() {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		console.log('ℹ️ Buscando notificações de chat para:', user.id)

		// Buscar mensagens recentes que não são do próprio usuário
		// TODO: Implementar tracking de lastReadAt por usuário
		const notifications = await db
			.select({
				id: chatMessage.id,
				channelId: chatMessage.channelId,
				channelName: chatChannel.name,
				senderId: chatMessage.senderId,
				senderName: authUser.name,
				senderEmail: authUser.email,
				content: chatMessage.content,
				messageType: chatMessage.messageType,
				createdAt: chatMessage.createdAt,
			})
			.from(chatMessage)
			.innerJoin(chatChannel, eq(chatMessage.channelId, chatChannel.id))
			.innerJoin(authUser, eq(chatMessage.senderId, authUser.id))
			.where(
				and(
					ne(chatMessage.senderId, user.id), // não é minha mensagem
					isNull(chatMessage.deletedAt), // não foi deletada
					eq(chatChannel.isActive, true), // canal ativo
					// TODO: adicionar filtro por lastReadAt
				),
			)
			.orderBy(desc(chatMessage.createdAt))
			.limit(50) // últimas 50 notificações

		console.log(`✅ Encontradas ${notifications.length} notificações`)

		// Transformar para formato de notificação
		const formattedNotifications = notifications.map((msg) => ({
			id: msg.id,
			channelId: msg.channelId,
			channelName: msg.channelName || 'Canal',
			senderId: msg.senderId,
			senderName: msg.senderName,
			senderAvatar: undefined, // TODO: implementar avatares
			content: msg.content || 'Mensagem',
			timestamp: msg.createdAt,
			isRead: false, // TODO: implementar tracking de leitura
		}))

		return NextResponse.json(formattedNotifications)
	} catch (error) {
		console.log('❌ Erro ao buscar notificações:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}

// POST /api/chat/notifications/mark-read - Marcar notificações como lidas
export async function POST(request: Request) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { notificationIds } = await request.json()

		if (!Array.isArray(notificationIds)) {
			return NextResponse.json({ error: 'IDs de notificações devem ser um array.' }, { status: 400 })
		}

		console.log('ℹ️ Marcando notificações como lidas:', notificationIds.length)

		// TODO: Implementar tracking de leitura no banco
		// Por enquanto, apenas log

		console.log('✅ Notificações marcadas como lidas')
		return NextResponse.json({ success: true })
	} catch (error) {
		console.log('❌ Erro ao marcar notificações como lidas:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}
