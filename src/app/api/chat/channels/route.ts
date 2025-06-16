import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { chatChannel } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/chat/channels - Buscar canais do usuário
export async function GET() {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		console.log('ℹ️ Buscando canais para usuário:', user.id)

		// Buscar todos os canais ativos (simplificado por enquanto)
		const channels = await db
			.select({
				id: chatChannel.id,
				name: chatChannel.name,
				description: chatChannel.description,
				type: chatChannel.type,
				icon: chatChannel.icon,
				color: chatChannel.color,
				isActive: chatChannel.isActive,
				createdAt: chatChannel.createdAt,
			})
			.from(chatChannel)
			.where(eq(chatChannel.isActive, true))

		console.log(`✅ Encontrados ${channels.length} canais`)

		// Transformar para formato esperado pelo frontend
		const formattedChannels = channels.map((channel) => ({
			id: channel.id,
			name: channel.name,
			type: channel.type as 'group' | 'direct',
			description: channel.description || '',
			icon: channel.icon || 'icon-[lucide--hash]',
			color: channel.color || '#6B7280',
			participantCount: 0, // TODO: calcular participantes
			lastMessage: '', // TODO: buscar última mensagem
			lastMessageAt: undefined,
			unreadCount: 0, // TODO: calcular não lidas
			isOnline: false, // TODO: status online
			lastSeen: undefined,
		}))

		return NextResponse.json(formattedChannels)
	} catch (error) {
		console.log('❌ Erro ao buscar canais:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}

// POST /api/chat/channels - Criar novo canal
export async function POST(request: Request) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { name, description, type, icon, color } = await request.json()

		if (!name || !type) {
			return NextResponse.json({ error: 'Nome e tipo são obrigatórios.' }, { status: 400 })
		}

		console.log('ℹ️ Criando canal:', { name, type })

		// Criar canal
		const newChannel = await db
			.insert(chatChannel)
			.values({
				name,
				description: description || null,
				type,
				icon: icon || 'icon-[lucide--hash]',
				color: color || '#6B7280',
			})
			.returning()

		console.log('✅ Canal criado:', newChannel[0].id)

		// TODO: Adicionar criador como participante com role admin

		return NextResponse.json({
			success: true,
			channel: {
				id: newChannel[0].id,
				name: newChannel[0].name,
				type: newChannel[0].type,
				description: newChannel[0].description || '',
				icon: newChannel[0].icon || 'icon-[lucide--hash]',
				color: newChannel[0].color || '#6B7280',
				participantCount: 1,
				lastMessage: '',
				lastMessageAt: undefined,
				unreadCount: 0,
				isOnline: false,
				lastSeen: undefined,
			},
		})
	} catch (error) {
		console.log('❌ Erro ao criar canal:', error)
		return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
	}
}
