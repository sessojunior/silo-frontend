import 'dotenv/config'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

async function seedChat() {
	console.log('🔵 Iniciando seed do sistema de chat...')

	// 1. Buscar grupos existentes
	console.log('🔵 Buscando grupos existentes...')
	const existingGroups = await db.select().from(schema.group)

	if (existingGroups.length === 0) {
		console.log('❌ Nenhum grupo encontrado! Execute primeiro o seed principal.')
		return
	}

	console.log(`✅ ${existingGroups.length} grupos encontrados!`)

	// 2. Verificar se canais já existem
	console.log('🔵 Verificando canais existentes...')
	const existingChannels = await db.select().from(schema.chatChannel)

	if (existingChannels.length > 0) {
		console.log(`⚠️ ${existingChannels.length} canais já existem! Pulando criação de canais.`)
	} else {
		// 3. Buscar usuário para ser o criador dos canais
		console.log('🔵 Buscando usuário para criar os canais...')
		const creatorUser = await db.select().from(schema.authUser).where(eq(schema.authUser.email, 'sessojunior@gmail.com')).limit(1)

		if (creatorUser.length === 0) {
			console.log('❌ Usuário Mario Junior não encontrado! Execute primeiro o seed principal.')
			return
		}

		const creatorUserId = creatorUser[0].id
		console.log(`✅ Usuário criador: ${creatorUser[0].name} (${creatorUserId})`)

		// 4. Criar canais de chat baseados nos grupos
		console.log('🔵 Criando canais de chat baseados nos grupos...')
		const channelsToCreate = existingGroups.map((group) => ({
			name: `#${group.name.toLowerCase().replace(/\s+/g, '-')}`,
			description: `Canal do grupo ${group.name} - ${group.description}`,
			type: 'group' as const,
			icon: group.icon,
			color: group.color,
			isActive: group.active,
		}))

		const insertedChannels = await db.insert(schema.chatChannel).values(channelsToCreate).returning()

		console.log(`✅ ${insertedChannels.length} canais de chat criados com sucesso!`)

		// 4. Buscar usuário Mario Junior
		console.log('🔵 Buscando usuário Mario Junior...')
		const user = await db.select().from(schema.authUser).where(eq(schema.authUser.email, 'sessojunior@gmail.com')).limit(1)

		if (user.length === 0) {
			console.log('❌ Usuário Mario Junior não encontrado!')
			return
		}

		const userId = user[0].id
		console.log(`✅ Usuário encontrado: ${user[0].name} (${userId})`)

		// 5. Adicionar usuário como participante de todos os canais
		console.log('🔵 Adicionando usuário como participante dos canais...')
		const participantRoles = insertedChannels.map((channel) => ({
			channelId: channel.id,
			userId: userId,
			role: channel.name === '#administradores' ? 'admin' : 'member',
			lastReadAt: null,
		}))

		await db.insert(schema.chatParticipant).values(participantRoles)
		console.log(`✅ Usuário adicionado como participante de ${participantRoles.length} canais!`)

		// 6. Verificar se status do usuário já existe
		console.log('🔵 Verificando status do usuário no chat...')
		const existingStatus = await db.select().from(schema.chatUserStatus).where(eq(schema.chatUserStatus.userId, userId)).limit(1)

		if (existingStatus.length === 0) {
			// 7. Criar status inicial do usuário no chat
			console.log('🔵 Criando status inicial do usuário no chat...')
			await db.insert(schema.chatUserStatus).values({
				userId: userId,
				status: 'offline',
				lastSeenAt: new Date(),
			})
			console.log('✅ Status inicial do usuário criado!')
		} else {
			console.log('✅ Status do usuário já existe!')
		}
	}

	// 8. Criar algumas mensagens de exemplo nos canais
	console.log('🔵 Criando mensagens de exemplo...')

	// Buscar canais existentes (podem ter sido criados agora ou já existir)
	const allChannels = await db.select().from(schema.chatChannel)

	// Buscar usuário
	const user = await db.select().from(schema.authUser).where(eq(schema.authUser.email, 'sessojunior@gmail.com')).limit(1)

	if (user.length > 0) {
		const userId = user[0].id

		// Verificar se já existem mensagens
		const existingMessages = await db.select().from(schema.chatMessage).limit(1)

		if (existingMessages.length === 0) {
			// Criar mensagens de exemplo em cada canal
			const exampleMessages = []

			for (const channel of allChannels.slice(0, 3)) {
				// Apenas nos 3 primeiros canais
				// Mensagem de boas-vindas
				exampleMessages.push({
					channelId: channel.id,
					senderId: userId,
					content: `🎉 Bem-vindos ao canal ${channel.name}! Este é o início da nossa conversa.`,
					messageType: 'text',
				})

				// Mensagem de teste
				exampleMessages.push({
					channelId: channel.id,
					senderId: userId,
					content: `Sistema de chat funcionando perfeitamente! 🚀`,
					messageType: 'text',
				})
			}

			await db.insert(schema.chatMessage).values(exampleMessages)
			console.log(`✅ ${exampleMessages.length} mensagens de exemplo criadas!`)
		} else {
			console.log('⚠️ Mensagens já existem! Pulando criação de mensagens.')
		}
	}

	console.log('✅ Seed do sistema de chat finalizado com sucesso!')
}

seedChat().catch((err) => {
	console.error('❌ Erro ao rodar o seed do chat:', err)
	process.exit(1)
})
