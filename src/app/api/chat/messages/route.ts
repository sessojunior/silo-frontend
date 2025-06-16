import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { chatMessage, chatChannel, authUser } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { nanoid } from 'nanoid'

// POST /api/chat/messages - Enviar nova mensagem
export async function POST(request: Request) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { channelId, content, replyToId } = await request.json()

		console.log('ℹ️ Enviando mensagem:', { channelId, content: content?.substring(0, 50), replyToId })

		// Validações
		if (!channelId) {
			return NextResponse.json({ error: 'ID do canal é obrigatório.' }, { status: 400 })
		}

		if (!content || content.trim().length === 0) {
			return NextResponse.json({ error: 'Conteúdo da mensagem é obrigatório.' }, { status: 400 })
		}

		if (content.length > 5000) {
			return NextResponse.json({ error: 'Mensagem muito longa (máximo 5000 caracteres).' }, { status: 400 })
		}

		// Verificar se o canal existe e o usuário tem acesso
		const channel = await db
			.select()
			.from(chatChannel)
			.where(and(eq(chatChannel.id, channelId), eq(chatChannel.isActive, true)))
			.limit(1)

		if (channel.length === 0) {
			return NextResponse.json({ error: 'Canal não encontrado.' }, { status: 404 })
		}

		// TODO: Verificar se o usuário é participante do canal

		// Verificar se a mensagem de resposta existe (se especificada)
		if (replyToId) {
			const replyMessage = await db
				.select()
				.from(chatMessage)
				.where(and(eq(chatMessage.id, replyToId), eq(chatMessage.channelId, channelId), isNull(chatMessage.deletedAt)))
				.limit(1)

			if (replyMessage.length === 0) {
				return NextResponse.json({ error: 'Mensagem de resposta não encontrada.' }, { status: 404 })
			}
		}

		// Criar nova mensagem
		const messageId = nanoid()
		const newMessage = {
			id: messageId,
			channelId,
			senderId: user.id,
			content: content.trim(),
			messageType: 'text',
			replyToId: replyToId || null,
			threadCount: 0,
			isEdited: false,
		}

		await db.insert(chatMessage).values(newMessage)

		// Buscar a mensagem completa com dados do remetente
		const messageWithSender = await db
			.select({
				id: chatMessage.id,
				channelId: chatMessage.channelId,
				senderId: chatMessage.senderId,
				senderName: authUser.name,
				senderEmail: authUser.email,
				content: chatMessage.content,
				messageType: chatMessage.messageType,
				fileUrl: chatMessage.fileUrl,
				fileName: chatMessage.fileName,
				fileSize: chatMessage.fileSize,
				fileMimeType: chatMessage.fileMimeType,
				replyToId: chatMessage.replyToId,
				threadCount: chatMessage.threadCount,
				isEdited: chatMessage.isEdited,
				editedAt: chatMessage.editedAt,
				createdAt: chatMessage.createdAt,
				deletedAt: chatMessage.deletedAt,
			})
			.from(chatMessage)
			.innerJoin(authUser, eq(chatMessage.senderId, authUser.id))
			.where(eq(chatMessage.id, messageId))
			.limit(1)

		if (messageWithSender.length === 0) {
			return NextResponse.json({ error: 'Erro ao recuperar mensagem criada.' }, { status: 500 })
		}

		console.log('✅ Mensagem enviada:', messageId)

		// TODO: Emitir evento WebSocket para outros usuários do canal
		// TODO: Atualizar timestamp do canal
		// TODO: Incrementar contador de mensagens não lidas para outros participantes

		return NextResponse.json(messageWithSender[0], { status: 201 })
	} catch (error) {
		console.log('❌ Erro ao enviar mensagem:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}
