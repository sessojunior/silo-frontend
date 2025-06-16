import 'dotenv/config'
import { eq, inArray } from 'drizzle-orm'

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

	// 2. Criar usuários de teste para o chat
	console.log('🔵 Criando usuários de teste para o chat...')

	const testUsers = [
		{
			name: 'Ana Silva',
			email: 'ana.silva@inpe.br',
			password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
			emailVerified: true,
			groupId: existingGroups.find((g) => g.name === 'Meteorologistas')?.id || null,
			isActive: true,
		},
		{
			name: 'Carlos Santos',
			email: 'carlos.santos@inpe.br',
			password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
			emailVerified: true,
			groupId: existingGroups.find((g) => g.name === 'Pesquisadores')?.id || null,
			isActive: true,
		},
		{
			name: 'Beatriz Lima',
			email: 'beatriz.lima@inpe.br',
			password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
			emailVerified: true,
			groupId: existingGroups.find((g) => g.name === 'Operadores')?.id || null,
			isActive: true,
		},
		{
			name: 'Diego Ferreira',
			email: 'diego.ferreira@inpe.br',
			password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
			emailVerified: true,
			groupId: existingGroups.find((g) => g.name === 'Suporte')?.id || null,
			isActive: true,
		},
		{
			name: 'Elena Costa',
			email: 'elena.costa@inpe.br',
			password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
			emailVerified: true,
			groupId: existingGroups.find((g) => g.name === 'Visitantes')?.id || null,
			isActive: false, // Usuário inativo para teste
		},
		{
			name: 'Fernando Rocha',
			email: 'fernando.rocha@inpe.br',
			password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
			emailVerified: true,
			groupId: existingGroups.find((g) => g.name === 'Meteorologistas')?.id || null,
			isActive: true,
		},
	]

	// Verificar se usuários de teste já existem
	const existingTestEmails = await db
		.select({ email: schema.authUser.email })
		.from(schema.authUser)
		.where(
			inArray(
				schema.authUser.email,
				testUsers.map((u) => u.email),
			),
		)

	const existingEmailSet = new Set(existingTestEmails.map((u) => u.email))
	const usersToCreate = testUsers.filter((u) => !existingEmailSet.has(u.email))

	if (usersToCreate.length > 0) {
		const insertedUsers = await db
			.insert(schema.authUser)
			.values(
				usersToCreate.map((u) => ({
					...u,
					id: crypto.randomUUID(),
					emailVerified: true,
				})),
			)
			.returning()
		console.log(`✅ ${insertedUsers.length} usuários de teste criados!`)

		// Log dos usuários criados
		insertedUsers.forEach((user) => {
			console.log(`   - ${user.name} (${user.email})`)
		})
	} else {
		console.log('✅ Usuários de teste já existem!')
	}

	// 3. Verificar se canais já existem
	console.log('🔵 Verificando canais existentes...')
	const existingChannels = await db.select().from(schema.chatChannel)

	if (existingChannels.length > 0) {
		console.log(`⚠️ ${existingChannels.length} canais já existem! Pulando criação de canais.`)
	} else {
		// 4. Buscar usuário para ser o criador dos canais
		console.log('🔵 Buscando usuário para criar os canais...')
		const creatorUser = await db.select().from(schema.authUser).where(eq(schema.authUser.email, 'sessojunior@gmail.com')).limit(1)

		if (creatorUser.length === 0) {
			console.log('❌ Usuário Mario Junior não encontrado! Execute primeiro o seed principal.')
			return
		}

		const creatorUserId = creatorUser[0].id
		console.log(`✅ Usuário criador: ${creatorUser[0].name} (${creatorUserId})`)

		// 5. Criar canais de chat baseados nos grupos
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

		// 6. Buscar todos os usuários para adicionar como participantes
		console.log('🔵 Buscando todos os usuários para adicionar como participantes...')
		const allUsers = await db.select().from(schema.authUser).where(eq(schema.authUser.isActive, true))
		console.log(`✅ Encontrados ${allUsers.length} usuários ativos`)

		// 7. Adicionar todos os usuários como participantes de todos os canais
		console.log('🔵 Adicionando usuários como participantes dos canais...')
		const participantRoles = []

		for (const channel of insertedChannels) {
			for (const user of allUsers) {
				// Determinar role baseado no email (temporário)
				let role = 'member'

				if (user.email === 'sessojunior@gmail.com') {
					role = 'admin'
				}

				participantRoles.push({
					channelId: channel.id,
					userId: user.id,
					role: role,
					lastReadAt: null,
				})
			}
		}

		await db.insert(schema.chatParticipant).values(participantRoles)
		console.log(`✅ ${participantRoles.length} participações criadas (${allUsers.length} usuários × ${insertedChannels.length} canais)!`)

		// 8. Criar status inicial para todos os usuários no chat
		console.log('🔵 Criando status inicial dos usuários no chat...')
		const userStatuses = allUsers.map((user) => ({
			userId: user.id,
			status: 'offline' as const,
			lastSeenAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias aleatório
		}))

		// Verificar se já existem status
		const existingStatuses = await db.select().from(schema.chatUserStatus)
		if (existingStatuses.length === 0) {
			await db.insert(schema.chatUserStatus).values(userStatuses)
			console.log(`✅ Status inicial criado para ${userStatuses.length} usuários!`)
		} else {
			console.log('✅ Status dos usuários já existem!')
		}
	}

	// 9. Criar algumas mensagens de exemplo nos canais
	console.log('🔵 Criando mensagens de exemplo...')

	// Buscar canais existentes (podem ter sido criados agora ou já existir)
	const allChannels = await db.select().from(schema.chatChannel)

	// Buscar usuários para criar mensagens variadas
	const allUsers = await db.select().from(schema.authUser).where(eq(schema.authUser.isActive, true))

	if (allUsers.length > 0) {
		// Verificar se já existem mensagens
		const existingMessages = await db.select().from(schema.chatMessage).limit(1)

		if (existingMessages.length === 0) {
			// Criar mensagens de exemplo variadas com timestamps recentes
			const exampleMessages = []
			const now = new Date()

			for (const channel of allChannels.slice(0, 4)) {
				// Nos 4 primeiros canais
				// Diferentes usuários enviando mensagens
				const channelUsers = allUsers.slice(0, 3) // Primeiros 3 usuários

				for (let i = 0; i < channelUsers.length; i++) {
					const user = channelUsers[i]

					// Mensagens variadas baseadas no índice
					const messages = [`🎉 Olá pessoal! Bem-vindos ao canal ${channel.name}!`, `Sistema de chat funcionando perfeitamente! 🚀`, `Que bom ter todos vocês aqui. Vamos começar a colaborar! 💪`, `Teste de mensagem do usuário ${user.name} 📝`, `Este canal vai ser muito útil para nossa equipe! 👥`]

					// Criar mensagens com timestamps escalonados (última mensagem há poucos minutos)
					const minutesAgo = (channelUsers.length - i) * 5 // 15, 10, 5 minutos atrás
					const messageTime = new Date(now.getTime() - minutesAgo * 60 * 1000)

					exampleMessages.push({
						id: crypto.randomUUID(),
						channelId: channel.id,
						senderId: user.id,
						content: messages[i % messages.length],
						messageType: 'text',
						createdAt: messageTime,
					})
				}
			}

			await db.insert(schema.chatMessage).values(exampleMessages)
			console.log(`✅ ${exampleMessages.length} mensagens de exemplo criadas!`)
		} else {
			console.log('⚠️ Mensagens já existem! Pulando criação de mensagens.')
		}
	}

	console.log('✅ Seed do sistema de chat finalizado com sucesso!')
	console.log('📊 Resumo:')
	console.log(`   - Usuários ativos: ${allUsers?.length || 'N/A'}`)
	console.log(`   - Canais criados: ${allChannels?.length || 'N/A'}`)
	console.log(`   - Sistema completo e pronto para uso!`)
}

seedChat().catch((err) => {
	console.error('❌ Erro ao rodar o seed do chat:', err)
	process.exit(1)
})
