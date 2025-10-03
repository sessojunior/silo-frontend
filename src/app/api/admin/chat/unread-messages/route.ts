import { NextRequest, NextResponse } from 'next/server'
import { and, or, isNull, eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const groupId = searchParams.get('groupId')
		const userId = searchParams.get('userId')
		const limit = parseInt(searchParams.get('limit') || '15')

		if (!groupId && !userId) {
			return NextResponse.json({ error: 'Especifique groupId ou userId' }, { status: 400 })
		}

		let unreadMessages: Array<{
			id: string
			content: string
			createdAt: Date
			senderUserId: string
			receiverGroupId: string | null
			receiverUserId: string | null
			deletedAt: Date | null
			readAt: Date | null
			senderName: string
			senderEmail: string
			senderImage: string | null
			type: string
			messageType: string
		}> = []

		if (groupId) {
			// Verificar se usuário participa do grupo
			const isMember = await db
				.select()
				.from(schema.userGroup)
				.where(and(eq(schema.userGroup.userId, user.id), eq(schema.userGroup.groupId, groupId)))
				.limit(1)

			if (isMember.length === 0) {
				return NextResponse.json({ error: 'Usuário não participa deste grupo' }, { status: 403 })
			}

			// Buscar mensagens não lidas do grupo (todas as mensagens do grupo são "não lidas" por padrão)
			const messages = await db
				.select({
					id: schema.chatMessage.id,
					content: schema.chatMessage.content,
					createdAt: schema.chatMessage.createdAt,
					senderUserId: schema.chatMessage.senderUserId,
					receiverGroupId: schema.chatMessage.receiverGroupId,
					receiverUserId: schema.chatMessage.receiverUserId,
					deletedAt: schema.chatMessage.deletedAt,
					readAt: schema.chatMessage.readAt,
					senderName: schema.authUser.name,
					senderEmail: schema.authUser.email,
					senderImage: schema.authUser.image
				})
				.from(schema.chatMessage)
				.innerJoin(schema.authUser, eq(schema.chatMessage.senderUserId, schema.authUser.id))
				.where(and(
					eq(schema.chatMessage.receiverGroupId, groupId),
					isNull(schema.chatMessage.deletedAt)
				))
				.orderBy(desc(schema.chatMessage.createdAt))
				.limit(limit)

			unreadMessages = messages
				.filter(msg => msg.senderUserId !== user.id) // Não incluir próprias mensagens
				.map(msg => ({
					...msg,
					type: 'group',
					messageType: 'groupMessage'
				}))

		} else if (userId) {
			// Buscar mensagens não lidas da conversa entre usuários
			const messages = await db
				.select({
					id: schema.chatMessage.id,
					content: schema.chatMessage.content,
					createdAt: schema.chatMessage.createdAt,
					senderUserId: schema.chatMessage.senderUserId,
					receiverGroupId: schema.chatMessage.receiverGroupId,
					receiverUserId: schema.chatMessage.receiverUserId,
					deletedAt: schema.chatMessage.deletedAt,
					readAt: schema.chatMessage.readAt,
					senderName: schema.authUser.name,
					senderEmail: schema.authUser.email,
					senderImage: schema.authUser.image
				})
				.from(schema.chatMessage)
				.innerJoin(schema.authUser, eq(schema.chatMessage.senderUserId, schema.authUser.id))
				.where(and(
					or(
						// Mensagens enviadas pelo usuário atual para o target
						and(eq(schema.chatMessage.senderUserId, user.id), eq(schema.chatMessage.receiverUserId, userId)),
						// Mensagens recebidas do target pelo usuário atual
						and(eq(schema.chatMessage.senderUserId, userId), eq(schema.chatMessage.receiverUserId, user.id)),
					),
					isNull(schema.chatMessage.deletedAt),
					// Mensagens não lidas: readAt é null
					isNull(schema.chatMessage.readAt)
				))
				.orderBy(desc(schema.chatMessage.createdAt))
				.limit(limit)

			unreadMessages = messages
				.filter(msg => msg.senderUserId !== user.id) // Não incluir próprias mensagens
				.map(msg => ({
					...msg,
					type: 'user',
					messageType: 'userMessage'
				}))
		}

		// Ordenar cronologicamente (mais antigas primeiro)
		unreadMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

		console.log('✅ [API] Mensagens não lidas encontradas:', { 
			count: unreadMessages.length, 
			groupId, 
			userId, 
			currentUser: user.id 
		})

		return NextResponse.json({ 
			messages: unreadMessages,
			count: unreadMessages.length
		})
	} catch (error) {
		console.error('❌ Erro ao buscar mensagens não lidas:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}