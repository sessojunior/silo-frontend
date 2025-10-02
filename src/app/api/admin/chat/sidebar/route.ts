import { NextResponse } from 'next/server'
import { count, eq, and, isNull, ne, desc, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

// Tipos para sidebar
interface ChatGroup {
	id: string
	name: string
	description: string | null
	icon: string
	color: string
	active: boolean
	unreadCount: number // Sempre 0 para grupos
}

interface ChatUser {
	id: string
	name: string
	email: string
	isActive: boolean
	presenceStatus: 'visible' | 'invisible'
	lastActivity: Date | null
	unreadCount: number
	lastMessage: string | null
	lastMessageAt: Date | null
}

interface SidebarData {
	groups: ChatGroup[]
	users: ChatUser[]
	totalUnread: number
}

// GET: Buscar dados completos da sidebar
export async function GET() {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
		}

		console.log('🔵 Carregando dados da sidebar para:', user.id)

		// 1. BUSCAR CHATGROUPS onde usuário participa
		const userGroups = await db
			.select({
				groupId: schema.userGroup.groupId,
				groupName: schema.group.name,
				groupDescription: schema.group.description,
				groupIcon: schema.group.icon,
				groupColor: schema.group.color,
				groupActive: schema.group.active,
			})
			.from(schema.userGroup)
			.innerJoin(schema.group, eq(schema.userGroup.groupId, schema.group.id))
			.where(and(eq(schema.userGroup.userId, user.id), eq(schema.group.active, true)))

		// Mapear chatGroups (sempre 0 não lidas)
		const chatGroups: ChatGroup[] = userGroups.map((g) => ({
			id: g.groupId,
			name: g.groupName,
			description: g.groupDescription,
			icon: g.groupIcon,
			color: g.groupColor,
			active: g.groupActive,
			unreadCount: 0, // Grupos não têm controle de leitura
		}))

		// 2. BUSCAR TODOS USUARIOS ATIVOS (exceto atual)
		const allActiveUsers = await db
			.select({
				id: schema.authUser.id,
				name: schema.authUser.name,
				email: schema.authUser.email,
				isActive: schema.authUser.isActive,
			})
			.from(schema.authUser)
			.where(and(ne(schema.authUser.id, user.id), eq(schema.authUser.isActive, true)))

		// 3. BUSCAR STATUS DE PRESENÇA
		const presenceData = await db
			.select({
				userId: schema.chatUserPresence.userId,
				status: schema.chatUserPresence.status,
				lastActivity: schema.chatUserPresence.lastActivity,
			})
			.from(schema.chatUserPresence)

		const presenceMap = new Map(presenceData.map((p) => [p.userId, { status: p.status, lastActivity: p.lastActivity }]))

		// 4. CONTAR MENSAGENS NÃO LIDAS POR USUÁRIO
		const unreadCountsRaw = await db
			.select({
				senderUserId: schema.chatMessage.senderUserId,
				unreadCount: count(schema.chatMessage.id),
			})
			.from(schema.chatMessage)
			.where(
				and(
					eq(schema.chatMessage.receiverUserId, user.id), // userMessage para usuário atual
					isNull(schema.chatMessage.readAt), // Não lida
					isNull(schema.chatMessage.deletedAt), // Não excluída
				),
			)
			.groupBy(schema.chatMessage.senderUserId)

		const unreadMap = new Map(unreadCountsRaw.map((u) => [u.senderUserId, u.unreadCount]))

		// 5. BUSCAR ÚLTIMA MENSAGEM POR USUÁRIO (enviadas e recebidas)
		const lastMessagesRaw = await db
			.select({
				senderUserId: schema.chatMessage.senderUserId,
				receiverUserId: schema.chatMessage.receiverUserId,
				content: schema.chatMessage.content,
				createdAt: schema.chatMessage.createdAt,
			})
			.from(schema.chatMessage)
			.where(
				and(
					// Mensagens onde usuário atual está envolvido
					or(
						eq(schema.chatMessage.senderUserId, user.id), // Enviadas pelo usuário
						eq(schema.chatMessage.receiverUserId, user.id), // Recebidas pelo usuário
					),
					isNull(schema.chatMessage.deletedAt), // Não excluídas
				),
			)
			.orderBy(desc(schema.chatMessage.createdAt))

		// Mapear última mensagem por usuário (considerando como "outro usuário" na conversa)
		const lastMessageMap = new Map<string, { content: string; createdAt: Date }>()
		for (const msg of lastMessagesRaw) {
			// Determinar o "outro usuário" da conversa
			const otherUserId =
				msg.senderUserId === user.id
					? msg.receiverUserId // Se eu enviei, o outro é o receiver
					: msg.senderUserId // Se eu recebi, o outro é o sender

			if (otherUserId && !lastMessageMap.has(otherUserId)) {
				lastMessageMap.set(otherUserId, {
					content: msg.content,
					createdAt: msg.createdAt,
				})
			}
		}

		// 6. MONTAR LISTA DE CHATUSERS
		const chatUsers: ChatUser[] = allActiveUsers.map((activeUser) => {
			const presence = presenceMap.get(activeUser.id)
			const unreadCount = unreadMap.get(activeUser.id) || 0
			const lastMessage = lastMessageMap.get(activeUser.id)

			return {
				id: activeUser.id,
				name: activeUser.name,
				email: activeUser.email,
				isActive: activeUser.isActive,
				presenceStatus: (presence?.status || 'invisible') as ChatUser['presenceStatus'],
				lastActivity: presence?.lastActivity || null,
				unreadCount,
				lastMessage: lastMessage?.content || null,
				lastMessageAt: lastMessage?.createdAt || null,
			}
		})

		// MOSTRAR TODOS OS USUÁRIOS ATIVOS para permitir contato
		// (não filtrar por interação - todos ficam disponíveis)

		// Ordenar chatUsers: não lidas primeiro, visíveis segundo, depois por nome
		chatUsers.sort((a, b) => {
			// 1. Prioridade: mensagens não lidas
			if (a.unreadCount !== b.unreadCount) {
				return b.unreadCount - a.unreadCount
			}

			// 2. Prioridade: usuários visíveis
			if (a.presenceStatus === 'visible' && b.presenceStatus !== 'visible') {
				return -1
			}
			if (b.presenceStatus === 'visible' && a.presenceStatus !== 'visible') {
				return 1
			}

			// 3. Prioridade: última mensagem recente
			if (a.lastMessageAt && b.lastMessageAt) {
				return b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
			}
			if (a.lastMessageAt && !b.lastMessageAt) {
				return -1
			}
			if (b.lastMessageAt && !a.lastMessageAt) {
				return 1
			}

			// 4. Por último: ordem alfabética
			return a.name.localeCompare(b.name)
		})

		// 7. CALCULAR TOTAL DE NÃO LIDAS
		const totalUnread = chatUsers.reduce((sum: number, user: ChatUser) => sum + user.unreadCount, 0)

		const sidebarData: SidebarData = {
			groups: chatGroups,
			users: chatUsers,
			totalUnread,
		}

		console.log('✅ Dados da sidebar carregados:', {
			groups: chatGroups.length,
			users: chatUsers.length,
			totalUnread,
		})

		return NextResponse.json(sidebarData)
	} catch (error) {
		console.error('❌ Erro ao carregar dados da sidebar:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
