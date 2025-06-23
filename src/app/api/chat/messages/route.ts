import { NextRequest, NextResponse } from 'next/server'
import { desc, and, or, isNull, eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

// Tipos para o sistema de mensagens
interface SendMessageRequest {
	content: string
	receiverGroupId?: string // groupMessage
	receiverUserId?: string // userMessage
}

interface MessageResponse {
	id: string
	content: string
	senderUserId: string
	senderName: string
	receiverGroupId: string | null
	receiverUserId: string | null
	createdAt: Date
	readAt: Date | null
	messageType: 'groupMessage' | 'userMessage'
}

// GET: Buscar mensagens de uma conversa específica
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const groupId = searchParams.get('groupId') // groupMessage
		const userId = searchParams.get('userId') // userMessage
		const limit = parseInt(searchParams.get('limit') || '30')
		const page = parseInt(searchParams.get('page') || '1')
		const order = searchParams.get('order') || 'asc' // 'asc' para mais recentes, 'desc' para mais antigas
		const offset = (page - 1) * limit

		console.log('🔵 Buscando mensagens:', { groupId, userId, limit, page, order, offset, currentUser: user.id })

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let messages: any[] = []

		if (groupId) {
			// BUSCAR groupMessage - verificar se usuário participa do grupo
			const isMember = await db
				.select()
				.from(schema.userGroup)
				.where(and(eq(schema.userGroup.userId, user.id), eq(schema.userGroup.groupId, groupId)))
				.limit(1)

			if (isMember.length === 0) {
				return NextResponse.json({ error: 'Usuário não participa deste grupo' }, { status: 403 })
			}

			// Buscar mensagens do grupo
			messages = await db
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
				.where(and(eq(schema.chatMessage.receiverGroupId, groupId), isNull(schema.chatMessage.deletedAt)))
				.orderBy(order === 'desc' ? desc(schema.chatMessage.createdAt) : schema.chatMessage.createdAt)
				.limit(limit)
				.offset(offset)
		} else if (userId) {
			// BUSCAR userMessage - conversa entre 2 usuários
			messages = await db
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
						or(
							// Mensagens enviadas pelo usuário atual para o target
							and(eq(schema.chatMessage.senderUserId, user.id), eq(schema.chatMessage.receiverUserId, userId)),
							// Mensagens recebidas do target pelo usuário atual
							and(eq(schema.chatMessage.senderUserId, userId), eq(schema.chatMessage.receiverUserId, user.id)),
						),
						isNull(schema.chatMessage.deletedAt),
					),
				)
				.orderBy(order === 'desc' ? desc(schema.chatMessage.createdAt) : schema.chatMessage.createdAt)
				.limit(limit)
				.offset(offset)
		} else {
			return NextResponse.json({ error: 'Especifique groupId ou userId' }, { status: 400 })
		}

		// Mapear tipo de mensagem
		const messagesWithType: MessageResponse[] = messages.map((msg) => ({
			...msg,
			messageType: msg.receiverGroupId ? 'groupMessage' : 'userMessage',
		}))

		console.log('✅ Mensagens encontradas:', { count: messagesWithType.length, type: groupId ? 'groupMessage' : 'userMessage' })

		return NextResponse.json({
			messages: messagesWithType,
			count: messagesWithType.length,
		})
	} catch (error) {
		console.error('❌ Erro ao buscar mensagens:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// POST: Enviar nova mensagem (groupMessage ou userMessage)
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		const body: SendMessageRequest = await request.json()
		const { content, receiverGroupId, receiverUserId } = body

		// Validações
		if (!content || content.trim().length === 0) {
			return NextResponse.json({ error: 'Conteúdo da mensagem é obrigatório' }, { status: 400 })
		}

		if (content.length > 2000) {
			return NextResponse.json({ error: 'Mensagem muito longa (máximo 2000 caracteres)' }, { status: 400 })
		}

		// Apenas um receptor
		if ((receiverGroupId && receiverUserId) || (!receiverGroupId && !receiverUserId)) {
			return NextResponse.json({ error: 'Especifique apenas um receptor (groupId ou userId)' }, { status: 400 })
		}

		console.log('🔵 Enviando mensagem:', {
			content: content.substring(0, 50) + '...',
			receiverGroupId,
			receiverUserId,
			sender: user.id,
		})

		// Validação específica para groupMessage
		if (receiverGroupId) {
			const isMember = await db
				.select()
				.from(schema.userGroup)
				.where(and(eq(schema.userGroup.userId, user.id), eq(schema.userGroup.groupId, receiverGroupId)))
				.limit(1)

			if (isMember.length === 0) {
				return NextResponse.json({ error: 'Usuário não participa deste grupo' }, { status: 403 })
			}
		}

		// Validação específica para userMessage
		if (receiverUserId) {
			if (receiverUserId === user.id) {
				return NextResponse.json({ error: 'Não é possível enviar mensagem para si mesmo' }, { status: 400 })
			}

			// Verificar se usuário destinatário existe
			const targetUser = await db.select().from(schema.authUser).where(eq(schema.authUser.id, receiverUserId)).limit(1)

			if (targetUser.length === 0) {
				return NextResponse.json({ error: 'Usuário destinatário não encontrado' }, { status: 404 })
			}
		}

		// Criar mensagem
		const messageId = randomUUID()
		await db.insert(schema.chatMessage).values({
			id: messageId,
			content: content.trim(),
			senderUserId: user.id,
			receiverGroupId: receiverGroupId || null,
			receiverUserId: receiverUserId || null,
			// readAt permanece NULL (grupos sempre NULL, userMessage não lida)
		})

		// Buscar dados completos da mensagem criada
		const messageWithSender = await db
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
			.where(eq(schema.chatMessage.id, messageId))
			.limit(1)

		const message = messageWithSender[0]
		const messageResponse: MessageResponse = {
			...message,
			messageType: message.receiverGroupId ? 'groupMessage' : 'userMessage',
		}

		console.log('✅ Mensagem enviada:', {
			id: messageId,
			type: messageResponse.messageType,
			to: receiverGroupId || receiverUserId,
		})

		return NextResponse.json(messageResponse, { status: 201 })
	} catch (error) {
		console.error('❌ Erro ao enviar mensagem:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
