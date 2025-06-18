import 'dotenv/config'
import { randomUUID } from 'crypto'
import { eq, inArray } from 'drizzle-orm'

import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth/hash'

// Importar dados do arquivo separado
import { products, groups, contacts, testUsers, dependencyStructure, projectsData, helpDocumentation, manualData, generateProblems, generateSolutions, exampleChatMessages } from './seed-data'

// === TIPAGENS DO SCHEMA ===
type ProductDependency = typeof schema.productDependency.$inferInsert

// === INTERFACES AUXILIARES ===
export interface DependencyItem {
	name: string
	icon: string | null
	description?: string
	children?: DependencyItem[]
}

// === FUNÇÕES AUXILIARES ===
async function insertDependencies(productId: string, dependencies: DependencyItem[], parentId: string | null = null, parentPath: string = '', parentDepth: number = 0): Promise<void> {
	for (let i = 0; i < dependencies.length; i++) {
		const dependency = dependencies[i]
		const currentPath = parentPath ? `${parentPath}/${i + 1}` : `${i + 1}`
		const currentDepth = parentDepth
		const sortKey = parentPath ? `${parentPath.replace(/\//g, '.')}.${String(i + 1).padStart(3, '0')}` : String(i + 1).padStart(3, '0')

		const dependencyData: ProductDependency = {
			id: randomUUID(),
			productId,
			name: dependency.name,
			icon: dependency.icon,
			description: dependency.description || null,
			parentId,
			treePath: currentPath,
			treeDepth: currentDepth,
			sortKey,
		}

		const [insertedDependency] = await db.insert(schema.productDependency).values(dependencyData).returning()

		if (dependency.children && dependency.children.length > 0) {
			await insertDependencies(productId, dependency.children, insertedDependency.id, currentPath, currentDepth + 1)
		}
	}
}

async function checkTableData(tableName: string, queryFn: () => Promise<unknown[]>): Promise<{ hasData: boolean; count: number }> {
	try {
		const data = await queryFn()
		return { hasData: data.length > 0, count: data.length }
	} catch (error) {
		console.error(`❌ Erro ao verificar tabela ${tableName}:`, error)
		return { hasData: false, count: 0 }
	}
}

// === FUNÇÃO PRINCIPAL ===
async function seed() {
	console.log('🔵 Iniciando seed do sistema...')
	console.log('🔵 Verificando tabelas existentes...')

	// === VERIFICAÇÕES INDIVIDUAIS DE TABELAS ===
	const tableChecks = await Promise.all([checkTableData('groups', () => db.select().from(schema.group).limit(1)), checkTableData('users', () => db.select().from(schema.authUser).limit(1)), checkTableData('products', () => db.select().from(schema.product).limit(1)), checkTableData('contacts', () => db.select().from(schema.contact).limit(1)), checkTableData('projects', () => db.select().from(schema.project).limit(1)), checkTableData('help', () => db.select().from(schema.help).limit(1)), checkTableData('chat_channels', () => db.select().from(schema.chatChannel).limit(1)), checkTableData('chat_messages', () => db.select().from(schema.chatMessage).limit(1))])

	const [groupsCheck, usersCheck, productsCheck, contactsCheck, projectsCheck, helpCheck, channelsCheck, messagesCheck] = tableChecks

	console.log(`📊 Status das tabelas:`)
	console.log(`   - Grupos: ${groupsCheck.hasData ? `✅ COM DADOS (${groupsCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Usuários: ${usersCheck.hasData ? `✅ COM DADOS (${usersCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Produtos: ${productsCheck.hasData ? `✅ COM DADOS (${productsCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Contatos: ${contactsCheck.hasData ? `✅ COM DADOS (${contactsCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Projetos: ${projectsCheck.hasData ? `✅ COM DADOS (${projectsCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Ajuda: ${helpCheck.hasData ? `✅ COM DADOS (${helpCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Canais Chat: ${channelsCheck.hasData ? `✅ COM DADOS (${channelsCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Mensagens Chat: ${messagesCheck.hasData ? `✅ COM DADOS (${messagesCheck.count})` : '🔄 VAZIA'}`)

	// Variáveis para controle de fluxo
	let insertedGroups: (typeof schema.group.$inferSelect)[] = []
	let defaultGroup: typeof schema.group.$inferSelect | null = null
	let userId = ''
	const productMap = new Map<string, string>()
	let insertedContacts: (typeof schema.contact.$inferSelect)[] = []

	try {
		// === 1. CRIAR GRUPOS ===
		if (!groupsCheck.hasData) {
			console.log('🔵 Criando grupos do sistema...')
			insertedGroups = await db
				.insert(schema.group)
				.values(
					groups.map((group) => ({
						id: randomUUID(),
						...group,
					})),
				)
				.returning()

			defaultGroup = insertedGroups.find((g) => g.isDefault) || null
			if (!defaultGroup) {
				throw new Error('Grupo padrão não encontrado!')
			}

			console.log(`✅ ${insertedGroups.length} grupos criados com sucesso!`)
			console.log(`✅ Grupo padrão: ${defaultGroup.name}`)
		} else {
			console.log('⚠️ Grupos já existem, pulando...')
			insertedGroups = await db.select().from(schema.group)
			defaultGroup = insertedGroups.find((g) => g.isDefault) || null
		}

		// === 2. CRIAR USUÁRIO PRINCIPAL ===
		if (!usersCheck.hasData) {
			console.log('🔵 Criando usuário principal: Mario Junior...')
			userId = randomUUID()
			const hashedPassword = await hashPassword('#Admin123')

			await db.insert(schema.authUser).values({
				id: userId,
				name: 'Mario Junior',
				email: 'sessojunior@gmail.com',
				emailVerified: true,
				password: hashedPassword,
				isActive: true,
				lastLogin: null,
			})

			// Adicionar ao grupo padrão
			if (defaultGroup) {
				await db.insert(schema.userGroup).values({
					userId: userId,
					groupId: defaultGroup.id,
					role: 'admin',
				})
			}

			// Criar perfil
			await db.insert(schema.userProfile).values({
				id: randomUUID(),
				userId: userId,
				genre: 'Masculino',
				phone: '+55 11 99999-9999',
				role: 'Administrador',
				team: 'CPTEC',
				company: 'INPE',
				location: 'São José dos Campos, SP',
			})

			// Criar preferências
			await db.insert(schema.userPreferences).values({
				id: randomUUID(),
				userId: userId,
				notifyUpdates: true,
				sendNewsletters: false,
			})

			console.log('✅ Usuário Mario Junior criado com sucesso!')
		} else {
			console.log('⚠️ Usuários já existem, pulando criação do usuário principal...')
			const existingUser = await db.select().from(schema.authUser).where(eq(schema.authUser.email, 'sessojunior@gmail.com')).limit(1)
			if (existingUser.length > 0) {
				userId = existingUser[0].id
			}
		}

		// === 3. CRIAR USUÁRIOS DE TESTE PARA CHAT ===
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
			console.log('🔵 Criando usuários de teste para chat...')
			for (const user of usersToCreate) {
				const newUserId = randomUUID()
				const targetGroup = insertedGroups.find((g) => g.name === user.groupName)

				await db.insert(schema.authUser).values({
					id: newUserId,
					name: user.name,
					email: user.email,
					password: user.password,
					emailVerified: user.emailVerified,
					isActive: user.isActive,
				})

				if (targetGroup) {
					await db.insert(schema.userGroup).values({
						userId: newUserId,
						groupId: targetGroup.id,
						role: 'member',
					})
				}
			}
			console.log(`✅ ${usersToCreate.length} usuários de teste criados!`)
		} else {
			console.log('⚠️ Usuários de teste já existem, pulando...')
		}

		// === 4. CRIAR PRODUTOS ===
		if (!productsCheck.hasData) {
			console.log('🔵 Criando produtos...')
			const insertedProducts = await db
				.insert(schema.product)
				.values(products.map((p) => ({ id: randomUUID(), ...p, available: true })))
				.returning()

			insertedProducts.forEach((p) => productMap.set(p.slug, p.id))
			console.log(`✅ ${insertedProducts.length} produtos criados!`)
		} else {
			console.log('⚠️ Produtos já existem, pulando...')
			// Buscar produtos existentes
			const existingProducts = await db.select().from(schema.product)
			existingProducts.forEach((p) => productMap.set(p.slug, p.id))
		}

		// === 5. CRIAR CONTATOS ===
		if (!contactsCheck.hasData) {
			console.log('🔵 Criando contatos globais...')
			insertedContacts = await db
				.insert(schema.contact)
				.values(contacts.map((contact) => ({ id: randomUUID(), ...contact })))
				.returning()

			console.log(`✅ ${insertedContacts.length} contatos criados!`)
		} else {
			console.log('⚠️ Contatos já existem, pulando...')
			insertedContacts = await db.select().from(schema.contact)
		}

		// === 6. CRIAR DADOS DOS PRODUTOS (dependências, manuais, problemas) ===
		const existingDependencies = await db.select().from(schema.productDependency).limit(1)
		if (existingDependencies.length === 0) {
			console.log('🔵 Criando dados dos produtos...')
			for (const product of products) {
				const productId = productMap.get(product.slug)
				if (!productId) continue

				console.log(`🔵 Processando produto: ${product.name}`)

				// Dependências
				await insertDependencies(productId, dependencyStructure)

				// Associações contatos
				const activeContacts = insertedContacts.filter((c) => c.active).slice(0, 3)
				if (activeContacts.length > 0) {
					await db.insert(schema.productContact).values(
						activeContacts.map((contact) => ({
							id: randomUUID(),
							productId,
							contactId: contact.id,
						})),
					)
				}

				// Manual
				const manual = manualData.find((m) => m.productSlug === product.slug)
				if (manual) {
					await db.insert(schema.productManual).values({
						id: randomUUID(),
						productId,
						description: manual.description,
					})
				}

				// Problemas e soluções
				if (userId) {
					const problems = generateProblems()
					const problemRows = problems.map((p) => ({
						id: randomUUID(),
						productId,
						userId: userId,
						title: p.title,
						description: p.description,
					}))

					const insertedProblems = await db.insert(schema.productProblem).values(problemRows).returning()

					for (const problem of insertedProblems) {
						const solutions = generateSolutions().slice(0, Math.floor(Math.random() * 5) + 2)
						const solutionRows = solutions.map((s) => ({
							id: randomUUID(),
							userId: userId,
							productProblemId: problem.id,
							description: s.description,
							replyId: null,
						}))

						const insertedSolutions = await db.insert(schema.productSolution).values(solutionRows).returning()

						// Marcar primeira solução como verificada
						if (insertedSolutions.length > 0) {
							await db.insert(schema.productSolutionChecked).values({
								id: randomUUID(),
								userId: userId,
								productSolutionId: insertedSolutions[0].id,
							})
						}

						// Adicionar imagens exemplo
						await db.insert(schema.productProblemImage).values([
							{
								id: randomUUID(),
								productProblemId: problem.id,
								image: '/uploads/products/problems/erro1.jpg',
								description: 'Imagem demonstrando o erro',
							},
							{
								id: randomUUID(),
								productProblemId: problem.id,
								image: '/uploads/products/problems/erro2.jpg',
								description: 'Outra imagem do erro',
							},
						])
					}
				}
			}
			console.log('✅ Dados dos produtos criados com sucesso!')
		} else {
			console.log('⚠️ Dados dos produtos já existem, pulando...')
		}

		// === 7. CRIAR PROJETOS ===
		if (!projectsCheck.hasData) {
			console.log('🔵 Criando projetos...')
			await db.insert(schema.project).values(
				projectsData.map((project) => ({
					id: randomUUID(),
					name: project.name,
					shortDescription: project.shortDescription,
					description: project.description,
					startDate: project.startDate,
					endDate: project.endDate,
					priority: project.priority,
					status: project.status,
				})),
			)
			console.log(`✅ ${projectsData.length} projetos criados!`)
		} else {
			console.log('⚠️ Projetos já existem, pulando...')
		}

		// === 8. CRIAR DOCUMENTAÇÃO DE AJUDA ===
		if (!helpCheck.hasData) {
			console.log('🔵 Criando documentação de ajuda...')
			await db.insert(schema.help).values({
				id: 'system-help',
				description: helpDocumentation,
			})
			console.log('✅ Documentação de ajuda criada!')
		} else {
			console.log('⚠️ Documentação de ajuda já existe, pulando...')
		}

		// === 9. CRIAR CANAIS DE CHAT ===
		if (!channelsCheck.hasData && insertedGroups.length > 0) {
			console.log('🔵 Criando canais de chat...')
			const channelsToCreate = insertedGroups.map((group) => ({
				name: `#${group.name.toLowerCase().replace(/\s+/g, '-')}`,
				description: `Canal do grupo ${group.name} - ${group.description}`,
				type: 'group' as const,
				icon: group.icon,
				color: group.color,
				isActive: group.active,
			}))

			const insertedChannels = await db.insert(schema.chatChannel).values(channelsToCreate).returning()

			// Buscar todos usuários ativos
			const allUsers = await db.select().from(schema.authUser).where(eq(schema.authUser.isActive, true))

			// Adicionar usuários como participantes
			const participantRoles = []
			for (const channel of insertedChannels) {
				for (const user of allUsers) {
					participantRoles.push({
						channelId: channel.id,
						userId: user.id,
						role: user.email === 'sessojunior@gmail.com' ? 'admin' : 'member',
						lastReadAt: null,
					})
				}
			}

			await db.insert(schema.chatParticipant).values(participantRoles)

			// Criar status inicial dos usuários
			const userStatuses = allUsers.map((user) => ({
				userId: user.id,
				status: 'offline' as const,
				lastSeenAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
			}))

			await db.insert(schema.chatUserStatus).values(userStatuses)

			console.log(`✅ ${insertedChannels.length} canais criados e ${participantRoles.length} participações configuradas!`)
		} else {
			console.log('⚠️ Canais de chat já existem ou grupos não foram criados, pulando...')
		}

		// === 10. CRIAR MENSAGENS DE EXEMPLO ===
		if (!messagesCheck.hasData) {
			console.log('🔵 Criando mensagens de exemplo...')
			const allChannels = await db.select().from(schema.chatChannel)
			const allUsers = await db.select().from(schema.authUser).where(eq(schema.authUser.isActive, true))

			if (allChannels.length > 0 && allUsers.length > 0) {
				const exampleMessages = []
				const now = new Date()

				for (const channel of allChannels.slice(0, 3)) {
					const channelUsers = allUsers.slice(0, 3)
					for (let i = 0; i < Math.min(channelUsers.length, 3); i++) {
						const user = channelUsers[i]
						const minutesAgo = (3 - i) * 5
						const messageTime = new Date(now.getTime() - minutesAgo * 60 * 1000)

						exampleMessages.push({
							channelId: channel.id,
							senderId: user.id,
							content: exampleChatMessages[i % exampleChatMessages.length],
							messageType: 'text',
							createdAt: messageTime,
						})
					}
				}

				await db.insert(schema.chatMessage).values(exampleMessages)
				console.log(`✅ ${exampleMessages.length} mensagens de exemplo criadas!`)
			}
		} else {
			console.log('⚠️ Mensagens de chat já existem, pulando...')
		}

		console.log('✅ Seed finalizado com sucesso!')
		console.log('📊 Resumo do seed:')
		console.log(`   - Sistema completamente configurado`)
		console.log(`   - Dados de teste inseridos onde necessário`)
		console.log(`   - Nenhuma duplicação de dados`)
	} catch (error) {
		console.error('❌ Erro durante o seed:', error)
		throw error
	}
}

// Executar seed
seed().catch((err) => {
	console.error('❌ Erro fatal no seed:', err)
	process.exit(1)
})
