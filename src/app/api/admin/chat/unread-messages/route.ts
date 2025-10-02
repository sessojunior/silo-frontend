import { NextResponse } from 'next/server'
import { desc, and, isNull, eq, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

// GET: Buscar mensagens não lidas para o dropdown de notificações
export async function GET() {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		console.log('🔵 [API] Carregando mensagens não lidas para:', user.id)

		// 1. Buscar mensagens não lidas de grupos
		const groupUnreadMessages = await db
			.select({
				groupId: schema.chatMessage.receiverGroupId,
				content: schema.chatMessage.content,
				senderName: schema.authUser.name,
				createdAt: schema.chatMessage.createdAt,
				readAt: schema.chatMessage.readAt, // Adicionar para debug
				senderUserId: schema.chatMessage.senderUserId, // Adicionar para debug
			})
			.from(schema.chatMessage)
			.innerJoin(schema.authUser, eq(schema.chatMessage.senderUserId, schema.authUser.id))
			.innerJoin(schema.userGroup, eq(schema.userGroup.groupId, schema.chatMessage.receiverGroupId))
			.where(
				and(
					eq(schema.userGroup.userId, user.id), // Usuário é membro do grupo
					ne(schema.chatMessage.senderUserId, user.id), // Mensagens de OUTROS usuários
					isNull(schema.chatMessage.readAt), // Não lida
					isNull(schema.chatMessage.deletedAt), // Não excluída
				),
			)
			.orderBy(desc(schema.chatMessage.createdAt))

		console.log('🔵 [API] Mensagens de grupos encontradas:', groupUnreadMessages.length)
		console.log('🔵 [API] Detalhes das mensagens de grupos:', groupUnreadMessages.map(msg => ({
			groupId: msg.groupId,
			content: msg.content, // Mostrar conteúdo completo para debug
			senderName: msg.senderName,
			createdAt: msg.createdAt,
			readAt: msg.readAt,
			senderUserId: msg.senderUserId,
			isFromCurrentUser: msg.senderUserId === user.id
		})))

		// 2. Buscar mensagens não lidas de usuários
		const userUnreadMessages = await db
			.select({
				userId: schema.chatMessage.senderUserId,
				content: schema.chatMessage.content,
				senderName: schema.authUser.name,
				createdAt: schema.chatMessage.createdAt,
				readAt: schema.chatMessage.readAt, // Adicionar para debug
				senderUserId: schema.chatMessage.senderUserId, // Adicionar para debug
			})
			.from(schema.chatMessage)
			.innerJoin(schema.authUser, eq(schema.chatMessage.senderUserId, schema.authUser.id))
			.where(
				and(
					eq(schema.chatMessage.receiverUserId, user.id), // Mensagens para o usuário atual
					isNull(schema.chatMessage.readAt), // Não lida
					isNull(schema.chatMessage.deletedAt), // Não excluída
				),
			)
			.orderBy(desc(schema.chatMessage.createdAt))

		console.log('🔵 [API] Mensagens de usuários encontradas:', userUnreadMessages.length)
		console.log('🔵 [API] Detalhes das mensagens de usuários:', userUnreadMessages.map(msg => ({
			userId: msg.userId,
			content: msg.content, // Mostrar conteúdo completo para debug
			senderName: msg.senderName,
			createdAt: msg.createdAt,
			readAt: msg.readAt,
			senderUserId: msg.senderUserId,
			isFromCurrentUser: msg.senderUserId === user.id
		})))

		// 3. Agrupar mensagens por conversa e contar total
		const unreadMessages: Record<string, {
			messages: Array<{ content: string; senderName: string; createdAt: Date }>
			totalCount: number
		}> = {}

		// Agrupar mensagens de grupos
		for (const msg of groupUnreadMessages) {
			if (msg.groupId) {
				if (!unreadMessages[msg.groupId]) {
					unreadMessages[msg.groupId] = { messages: [], totalCount: 0 }
				}
				unreadMessages[msg.groupId].messages.push({
					content: msg.content,
					senderName: msg.senderName,
					createdAt: msg.createdAt,
				})
				unreadMessages[msg.groupId].totalCount++
			}
		}

		// Agrupar mensagens de usuários
		for (const msg of userUnreadMessages) {
			if (msg.userId) {
				if (!unreadMessages[msg.userId]) {
					unreadMessages[msg.userId] = { messages: [], totalCount: 0 }
				}
				unreadMessages[msg.userId].messages.push({
					content: msg.content,
					senderName: msg.senderName,
					createdAt: msg.createdAt,
				})
				unreadMessages[msg.userId].totalCount++
			}
		}

		// 4. Ordenar por data e limitar a 3 mensagens mais recentes por conversa
		for (const conversationId in unreadMessages) {
			const originalMessages = unreadMessages[conversationId].messages
			unreadMessages[conversationId].messages = originalMessages
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
				.slice(0, 3) // Apenas as 3 mais recentes
			
			console.log('🔵 [API] Processando conversa:', {
				conversationId,
				originalCount: originalMessages.length,
				finalCount: unreadMessages[conversationId].messages.length,
				totalCount: unreadMessages[conversationId].totalCount,
				messages: unreadMessages[conversationId].messages.map(m => ({
					content: m.content, // Mostrar conteúdo completo para debug
					senderName: m.senderName,
					createdAt: m.createdAt
				}))
			})
		}

		console.log('✅ [API] Mensagens não lidas carregadas:', {
			conversations: Object.keys(unreadMessages).length,
			totalMessages: Object.values(unreadMessages).reduce((sum, conv) => sum + conv.totalCount, 0),
			details: Object.entries(unreadMessages).map(([id, conv]) => ({
				conversationId: id,
				totalCount: conv.totalCount,
				displayMessages: conv.messages.length,
				senders: conv.messages.map(m => m.senderName)
			})),
			groupUnreadCount: groupUnreadMessages.length,
			userUnreadCount: userUnreadMessages.length
		})

		return NextResponse.json({ unreadMessages })
	} catch (error) {
		console.error('❌ Erro ao carregar mensagens não lidas:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
