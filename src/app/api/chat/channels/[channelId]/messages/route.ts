import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { chatMessage, chatChannel, authUser } from '@/lib/db/schema'
import { eq, and, desc, isNull } from 'drizzle-orm'

// GET /api/chat/channels/[channelId]/messages - Buscar mensagens do canal
export async function GET(request: Request, { params }: { params: Promise<{ channelId: string }> }) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { channelId } = await params

		console.log('ℹ️ Buscando mensagens do canal:', channelId)

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

		// Buscar mensagens do canal com dados dos remetentes
		const messages = await db
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
			.where(and(eq(chatMessage.channelId, channelId), isNull(chatMessage.deletedAt)))
			.orderBy(desc(chatMessage.createdAt))
			.limit(100) // últimas 100 mensagens

		console.log(`✅ Encontradas ${messages.length} mensagens no canal`)

		// TODO: Marcar mensagens como lidas para o usuário atual
		// TODO: Atualizar lastReadAt do participante

		return NextResponse.json(messages.reverse()) // retornar em ordem cronológica
	} catch (error) {
		console.log('❌ Erro ao buscar mensagens:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}
