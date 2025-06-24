import { NextRequest, NextResponse } from 'next/server'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

// PATCH: Marcar userMessage como lida
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { messageId } = await params

		console.log('🔵 Marcando mensagem como lida:', { messageId, userId: user.id })

		// Buscar userMessage recebida pelo usuário atual e ainda não lida
		const message = await db
			.select()
			.from(schema.chatMessage)
			.where(
				and(
					eq(schema.chatMessage.id, messageId),
					eq(schema.chatMessage.receiverUserId, user.id), // Apenas userMessage recebidas
					isNull(schema.chatMessage.readAt), // Ainda não lida
					isNull(schema.chatMessage.deletedAt), // Não excluída
				),
			)
			.limit(1)

		if (message.length === 0) {
			return NextResponse.json({ error: 'Mensagem não encontrada, já lida ou não é uma conversa privada' }, { status: 404 })
		}

		// Marcar como lida
		await db.update(schema.chatMessage).set({ readAt: new Date() }).where(eq(schema.chatMessage.id, messageId))

		console.log('✅ Mensagem marcada como lida:', messageId)

		return NextResponse.json({ success: true, readAt: new Date() })
	} catch (error) {
		console.error('❌ Erro ao marcar mensagem como lida:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// DELETE: Excluir mensagem (apenas até 24h após envio)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { messageId } = await params

		console.log('🔵 Tentando excluir mensagem:', { messageId, userId: user.id })

		// Buscar mensagem enviada pelo usuário atual
		const message = await db
			.select()
			.from(schema.chatMessage)
			.where(
				and(
					eq(schema.chatMessage.id, messageId),
					eq(schema.chatMessage.senderUserId, user.id), // Apenas próprias mensagens
					isNull(schema.chatMessage.deletedAt), // Ainda não excluída
				),
			)
			.limit(1)

		if (message.length === 0) {
			return NextResponse.json({ error: 'Mensagem não encontrada ou você não tem permissão para excluí-la' }, { status: 404 })
		}

		const msg = message[0]

		// Verificar se ainda pode excluir (até 24h)
		const now = new Date()
		const createdAt = new Date(msg.createdAt)
		const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

		if (hoursSinceCreated > 24) {
			return NextResponse.json({ error: 'Prazo para exclusão expirado (máximo 24 horas)' }, { status: 400 })
		}

		// Soft delete - marcar como excluída
		await db
			.update(schema.chatMessage)
			.set({
				deletedAt: now,
				content: '[Mensagem excluída]', // Placeholder visual
			})
			.where(eq(schema.chatMessage.id, messageId))

		const messageType = msg.receiverGroupId ? 'groupMessage' : 'userMessage'

		console.log('✅ Mensagem excluída:', {
			messageId,
			type: messageType,
			hoursAfterCreation: hoursSinceCreated.toFixed(1),
		})

		return NextResponse.json({
			success: true,
			deletedAt: now,
			messageType,
		})
	} catch (error) {
		console.error('❌ Erro ao excluir mensagem:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
