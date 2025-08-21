import 'dotenv/config'
import { randomUUID } from 'crypto'
import { eq, inArray } from 'drizzle-orm'

import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth/hash'

// Importar dados do arquivo separado
import { products, groups, contacts, testUsers, dependencyStructure, projectsData, helpDocumentation, manualData, generateProblems, generateSolutions, projectActivitiesData } from './seed-data'

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
	const tableChecks = await Promise.all([checkTableData('groups', () => db.select().from(schema.group).limit(1)), checkTableData('users', () => db.select().from(schema.authUser).limit(1)), checkTableData('products', () => db.select().from(schema.product).limit(1)), checkTableData('contacts', () => db.select().from(schema.contact).limit(1)), checkTableData('projects', () => db.select().from(schema.project).limit(1)), checkTableData('project_activities', () => db.select().from(schema.projectActivity).limit(1)), checkTableData('help', () => db.select().from(schema.help).limit(1)), checkTableData('chat_user_presence', () => db.select().from(schema.chatUserPresence).limit(1)), checkTableData('chat_messages', () => db.select().from(schema.chatMessage).limit(1))])

	const [groupsCheck, usersCheck, productsCheck, contactsCheck, projectsCheck, activitiesCheck, helpCheck, presenceCheck, messagesCheck] = tableChecks

	console.log(`📊 Status das tabelas:`)
	console.log(`   - Grupos: ${groupsCheck.hasData ? `✅ COM DADOS (${groupsCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Usuários: ${usersCheck.hasData ? `✅ COM DADOS (${usersCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Produtos: ${productsCheck.hasData ? `✅ COM DADOS (${productsCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Contatos: ${contactsCheck.hasData ? `✅ COM DADOS (${contactsCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Projetos: ${projectsCheck.hasData ? `✅ COM DADOS (${projectsCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Atividades: ${activitiesCheck.hasData ? `✅ COM DADOS (${activitiesCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Ajuda: ${helpCheck.hasData ? `✅ COM DADOS (${helpCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Chat Presença: ${presenceCheck.hasData ? `✅ COM DADOS (${presenceCheck.count})` : '🔄 VAZIA'}`)
	console.log(`   - Mensagens Chat: ${messagesCheck.hasData ? `✅ COM DADOS (${messagesCheck.count})` : '🔄 VAZIA'}`)

	// Variáveis para controle de fluxo
	let insertedGroups: (typeof schema.group.$inferSelect)[] = []
	let defaultGroup: typeof schema.group.$inferSelect | null = null
	let userId = ''
	const productMap = new Map<string, string>()
	const categoryMap = new Map<string, string>()
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

			// Adicionar a TODOS os grupos ativos (não apenas o padrão)
			console.log('🔵 Adicionando Mario Junior a todos os grupos ativos...')
			for (const group of insertedGroups.filter((g) => g.active)) {
				await db.insert(schema.userGroup).values({
					userId: userId,
					groupId: group.id,
					role: group.name === 'Administradores' ? 'admin' : 'member',
				})
			}
			console.log(`✅ Mario Junior adicionado a ${insertedGroups.filter((g) => g.active).length} grupos!`)

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
			const createdUserIds: string[] = []

			for (const user of usersToCreate) {
				const newUserId = randomUUID()

				await db.insert(schema.authUser).values({
					id: newUserId,
					name: user.name,
					email: user.email,
					password: user.password,
					emailVerified: user.emailVerified,
					isActive: user.isActive,
				})

				createdUserIds.push(newUserId)
			}

			// Associar TODOS os usuários criados a TODOS os grupos ativos (para chat)
			console.log('🔵 Associando usuários a todos os grupos ativos...')
			const activeGroups = insertedGroups.filter((g) => g.active)

			for (const newUserId of createdUserIds) {
				for (const group of activeGroups) {
					await db.insert(schema.userGroup).values({
						userId: newUserId,
						groupId: group.id,
						role: 'member', // Todos como members, apenas Mario Junior é admin
					})
				}
			}

			console.log(`✅ ${usersToCreate.length} usuários de teste criados e associados a ${activeGroups.length} grupos cada!`)
		} else {
			console.log('⚠️ Usuários de teste já existem, pulando...')
		}

		// === GARANTIR QUE TODOS OS USUÁRIOS VEJAM TODOS OS GRUPOS (PARA CHAT) ===
		console.log('🔵 Verificando associações usuário-grupo para chat...')

		// Buscar todos os usuários ativos
		const allActiveUsers = await db.select().from(schema.authUser).where(eq(schema.authUser.isActive, true))
		const allActiveGroups = insertedGroups.filter((g) => g.active)

		// Verificar se algum usuário não está associado a todos os grupos
		let missingAssociations = 0

		for (const user of allActiveUsers) {
			const userGroups = await db.select({ groupId: schema.userGroup.groupId }).from(schema.userGroup).where(eq(schema.userGroup.userId, user.id))

			const userGroupIds = new Set(userGroups.map((ug) => ug.groupId))

			for (const group of allActiveGroups) {
				if (!userGroupIds.has(group.id)) {
					// Usuário não está no grupo, adicionar
					await db.insert(schema.userGroup).values({
						userId: user.id,
						groupId: group.id,
						role: group.name === 'Administradores' && user.email === 'sessojunior@gmail.com' ? 'admin' : 'member',
					})
					missingAssociations++
				}
			}
		}

		if (missingAssociations > 0) {
			console.log(`✅ ${missingAssociations} associações faltantes adicionadas!`)
		} else {
			console.log('✅ Todos os usuários já estão associados a todos os grupos!')
		}

		console.log(`📊 Total: ${allActiveUsers.length} usuários × ${allActiveGroups.length} grupos = chat completo!`)

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

		// === 4.1 GARANTIR CATEGORIAS DE PROBLEMA ANTES DE CRIAR product_activity ===
		if (categoryMap.size === 0) {
			const existingCats = await db.select().from(schema.productProblemCategory)
			if (existingCats.length === 0) {
				console.log('🔵 Categorias de problema ainda não existem – criando antes do product_activity...')
				const problemCategories = [
					{ name: 'Rede externa', color: '#1E40AF' },
					{ name: 'Servidor indisponível', color: '#DC2626' },
					{ name: 'Falha humana', color: '#F59E0B' },
					{ name: 'Rede interna', color: '#10B981' },
					{ name: 'Erro no modelo', color: '#7C3AED' },
					{ name: 'Dados indisponíveis', color: '#6B7280' },
				]

				const insertedCats = await db
					.insert(schema.productProblemCategory)
					.values(problemCategories.map((c) => ({ id: randomUUID(), ...c })))
					.returning()
				insertedCats.forEach((c) => categoryMap.set(c.name, c.id))
			} else {
				existingCats.forEach((c) => categoryMap.set(c.name, c.id))
			}
		}

		const categoryIdsArray = Array.from(categoryMap.values())

		// === 4.2 CRIAR ATIVIDADES DE PRODUTO (60 dias × 4 turnos) ===
		const activityExisting = await db.select().from(schema.productActivity).limit(1)
		if (activityExisting.length === 0) {
			console.log('🔵 Gerando histórico de product_activity (60 dias)...')
			const statusPool = ['completed', 'waiting', 'pending', 'not_run', 'with_problems', 'run_again', 'under_support', 'suspended'] as const

			const descriptionSamples: Record<string, string[]> = {
				pending: ['Rodada não iniciada no horário programado', 'Execução pendente, aguardar próximo turno', 'Execução atrasada; necessário iniciar manualmente'],
				not_run: ['Modelo não executou no turno previsto', 'Execução falhou, sem saída gerada', 'Turno perdido; verificar agendamento'],
				with_problems: ['Saída gerada com inconsistências', 'Modelo concluiu com erros de validação', 'Resultados suspeitos; revisar parâmetros'],
				run_again: ['Necessário reexecutar devido a dados de entrada corrigidos', 'Solicitada nova execução pelo usuário', 'Reprocessamento agendado'],
				under_support: ['Execução em análise pela equipe do IO', 'Intervenção técnica em andamento', 'Suporte investigando problema de infraestrutura'],
				suspended: ['Rodada suspensa por manutenção programada', 'Execução pausada por falta de recursos', 'Processo suspenso até nova ordem'],
			}

			const productsAll = await db.select().from(schema.product)
			for (const prod of productsAll.slice(0, 4)) {
				for (let d = 0; d < 90; d++) {
					const day = new Date()
					day.setDate(day.getDate() - d)
					const dateStr = day.toISOString().slice(0, 10)
					for (const turn of [0, 6, 12, 18]) {
						const rnd = Math.random()
						let status: (typeof statusPool)[number] = 'completed'
						if (rnd > 0.7) {
							status = statusPool[Math.floor(Math.random() * statusPool.length)]
						}

						const randomDescription = descriptionSamples[status]?.[Math.floor(Math.random() * (descriptionSamples[status]?.length || 1))] || null

						await db.insert(schema.productActivity).values({
							id: randomUUID(),
							productId: prod.id,
							userId: userId || prod.id, // fallback qualquer
							date: dateStr as unknown as string,
							turn,
							status,
							problemCategoryId: status === 'completed' || status === 'waiting' ? null : categoryIdsArray[Math.floor(Math.random() * categoryIdsArray.length)],
							description: randomDescription,
						})
					}
				}
			}
			console.log('✅ product_activity gerado!')
		} else {
			console.log('⚠️ product_activity já possui dados, pulando geração...')
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
					const categoryIds: string[] = Array.from(categoryMap.values())
					const problemRows = problems.map((p) => ({
						id: randomUUID(),
						productId,
						userId: userId,
						problemCategoryId: categoryIds[Math.floor(Math.random() * categoryIds.length)],
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

						// Imagens de problemas agora são adicionadas via UploadThing na interface
					}
				}
			}
			console.log('✅ Dados dos produtos criados com sucesso!')
		} else {
			console.log('⚠️ Dados dos produtos já existem, pulando...')
		}

		// === 7. CRIAR PROJETOS ===
		let insertedProjects: (typeof schema.project.$inferSelect)[] = []
		if (!projectsCheck.hasData) {
			console.log('🔵 Criando projetos...')
			insertedProjects = await db
				.insert(schema.project)
				.values(
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
				.returning()
			console.log(`✅ ${projectsData.length} projetos criados!`)
		} else {
			console.log('⚠️ Projetos já existem, pulando...')
			insertedProjects = await db.select().from(schema.project)
		}

		// === 8. CRIAR ATIVIDADES DOS PROJETOS ===
		if (!activitiesCheck.hasData && insertedProjects.length > 0) {
			console.log('🔵 Criando atividades dos projetos...')

			// Mapeamento de projetos para seus respectivos grupos de atividades
			const projectActivityMapping = [
				{ projectIndex: 0, activities: projectActivitiesData.meteorologia }, // Sistema de Monitoramento Meteorológico
				{ projectIndex: 1, activities: projectActivitiesData.clima }, // Migração para Nuvem INPE
				{ projectIndex: 2, activities: projectActivitiesData.portal }, // Portal de Dados Abertos
				{ projectIndex: 3, activities: projectActivitiesData.previsao }, // Modernização da Rede de Observação
				{ projectIndex: 4, activities: projectActivitiesData.infraestrutura }, // Sistema de Backup Distribuído (SEM ATIVIDADES)
			]

			let totalActivitiesCreated = 0

			for (const mapping of projectActivityMapping) {
				if (mapping.projectIndex < insertedProjects.length && mapping.activities.length > 0) {
					const project = insertedProjects[mapping.projectIndex]

					const activitiesToCreate = mapping.activities.map((activity) => ({
						id: randomUUID(),
						projectId: project.id,
						name: activity.name,
						description: activity.description,
						category: activity.category,
						estimatedDays: activity.estimatedDays,
						startDate: activity.startDate,
						endDate: activity.endDate,
						priority: activity.priority,
						status: activity.status,
					}))

					await db.insert(schema.projectActivity).values(activitiesToCreate)
					totalActivitiesCreated += activitiesToCreate.length

					console.log(`   ✅ ${activitiesToCreate.length} atividades criadas para "${project.name}"`)
				} else if (mapping.projectIndex < insertedProjects.length && mapping.activities.length === 0) {
					const project = insertedProjects[mapping.projectIndex]
					console.log(`   ⚪ Projeto "${project.name}" sem atividades (conforme solicitado)`)
				}
			}

			console.log(`✅ Total de ${totalActivitiesCreated} atividades criadas em ${insertedProjects.length} projetos!`)
		} else {
			console.log('⚠️ Atividades dos projetos já existem ou projetos não foram criados, pulando...')
		}

		// === 9. CRIAR DOCUMENTAÇÃO DE AJUDA ===
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

		// === 10. CRIAR SISTEMA DE CHAT ULTRA SIMPLIFICADO ===
		// Verificar se já existem dados de chat
		const presenceCheck = await checkTableData('chat_user_presence', () => db.select().from(schema.chatUserPresence).limit(1))

		if (!presenceCheck.hasData && insertedGroups.length > 0) {
			console.log('🔵 Criando sistema de chat ultra simplificado...')

			// Buscar todos usuários ativos
			const allUsers = await db.select().from(schema.authUser).where(eq(schema.authUser.isActive, true))

			// Criar status de presença para todos usuários
			const userPresenceData = allUsers.map((user) => ({
				userId: user.id,
				status: 'offline' as const,
				lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
			}))

			await db.insert(schema.chatUserPresence).values(userPresenceData)
			console.log(`✅ Status de presença criado para ${allUsers.length} usuários!`)

			// Criar mensagens de exemplo (groupMessage e userMessage)
			if (allUsers.length >= 3) {
				console.log('🔵 Criando mensagens de exemplo...')
				const exampleMessages = []
				const now = new Date()

				// Mensagens para grupos (groupMessage)
				const activeGroups = insertedGroups.filter((g) => g.active).slice(0, 3) // Primeiros 3 grupos
				const messageUsers = allUsers.slice(0, 3) // Primeiros 3 usuários

				for (let i = 0; i < activeGroups.length; i++) {
					const group = activeGroups[i]
					const user = messageUsers[i % messageUsers.length]
					const minutesAgo = (i + 1) * 10
					const messageTime = new Date(now.getTime() - minutesAgo * 60 * 1000)

					exampleMessages.push({
						content: `Mensagem de exemplo no grupo ${group.name} - Bem-vindos ao sistema de chat!`,
						senderUserId: user.id,
						receiverGroupId: group.id,
						receiverUserId: null,
						createdAt: messageTime,
						readAt: null, // Grupos nunca têm readAt
					})
				}

				// Mensagens privadas entre usuários (userMessage)
				if (allUsers.length >= 2) {
					const sender = allUsers[0] // Mario Junior
					const receiver = allUsers[1] // Primeiro usuário de teste

					// Conversa privada (userMessage - lida)
					exampleMessages.push({
						content: 'Olá! Como está o andamento do projeto?',
						senderUserId: sender.id,
						receiverGroupId: null,
						receiverUserId: receiver.id,
						createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 min atrás
						readAt: new Date(now.getTime() - 25 * 60 * 1000), // Lida 25 min atrás
					})

					// Resposta (userMessage - não lida)
					exampleMessages.push({
						content: 'Oi! O projeto está indo bem, acabei de finalizar a primeira fase.',
						senderUserId: receiver.id,
						receiverGroupId: null,
						receiverUserId: sender.id,
						createdAt: new Date(now.getTime() - 20 * 60 * 1000), // 20 min atrás
						readAt: null, // Não lida (para demonstrar contador)
					})

					// Mais uma mensagem não lida
					exampleMessages.push({
						content: 'Podemos agendar uma reunião para revisar os resultados?',
						senderUserId: receiver.id,
						receiverGroupId: null,
						receiverUserId: sender.id,
						createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 min atrás
						readAt: null, // Não lida
					})
				}

				await db.insert(schema.chatMessage).values(exampleMessages)
				console.log(`✅ ${exampleMessages.length} mensagens de exemplo criadas!`)
				console.log(`   - ${activeGroups.length} mensagens para grupos (groupMessage)`)
				console.log(`   - ${exampleMessages.length - activeGroups.length} mensagens privadas (userMessage)`)
			}
		} else {
			console.log('⚠️ Sistema de chat já existe, pulando...')
		}

		// === 12. CRIAR DADOS DAS TAREFAS DOS PROJETOS (ARQUITETURA SIMPLIFICADA) ===
		const tasksCheck = await checkTableData('project_task', () => db.select().from(schema.projectTask))

		if (!tasksCheck.hasData && insertedProjects.length > 0) {
			console.log('🔵 Criando dados das tarefas (arquitetura simplificada)...')

			// Buscar atividades existentes
			const allActivities = await db.select().from(schema.projectActivity)

			if (allActivities.length > 0) {
				let totalTasksCreated = 0

				for (const project of insertedProjects.slice(0, 3)) {
					// Apenas primeiros 3 projetos
					const projectActivities = allActivities.filter((a) => a.projectId === project.id)

					if (projectActivities.length > 0) {
						console.log(`   🔵 Criando tarefas para projeto "${project.name}" (${projectActivities.length} atividades)...`)

						// Para cada atividade, criar pelo menos 6 tarefas
						for (const activity of projectActivities) {
							console.log(`     🔵 Criando tarefas para atividade "${activity.name}"...`)

							// Criar 6+ tarefas de exemplo para esta atividade
							const tasksToCreate = []

							// Templates de tarefas com distribuição por status
							const taskTemplates = [
								{ name: 'Configurar ambiente de desenvolvimento', status: 'todo', category: 'Infraestrutura', priority: 'high' },
								{ name: 'Implementar funcionalidade principal', status: 'todo', category: 'Desenvolvimento', priority: 'urgent' },
								{ name: 'Configurar rede interna e externa', status: 'in_progress', category: 'Infraestrutura', priority: 'medium' },
								{ name: 'Desenvolver interface do usuário', status: 'in_progress', category: 'Desenvolvimento', priority: 'high' },
								{ name: 'Testes de integração', status: 'review', category: 'Testes', priority: 'medium' },
								{ name: 'Documentação técnica', status: 'blocked', category: 'Documentação', priority: 'low' },
								{ name: 'Deploy em ambiente de produção', status: 'done', category: 'Deploy', priority: 'high' },
								{ name: 'Configuração de monitoramento', status: 'done', category: 'DevOps', priority: 'medium' },
							]

							// Distribuir tarefas por status com sort sequencial
							const tasksByStatus: Record<string, number> = {
								todo: 0,
								in_progress: 0,
								blocked: 0,
								review: 0,
								done: 0,
							}

							for (let i = 0; i < taskTemplates.length; i++) {
								const template = taskTemplates[i]
								const taskId = randomUUID()

								// Incrementar contador para este status
								tasksByStatus[template.status]++

								tasksToCreate.push({
									id: taskId,
									projectId: project.id,
									projectActivityId: activity.id,
									name: `${template.name} - ${activity.name}`,
									description: `Tarefa de ${template.category.toLowerCase()} para atividade: ${activity.description}`,
									category: template.category,
									estimatedDays: Math.floor(Math.random() * 15) + 1, // 1-15 dias
									status: template.status,
									sort: tasksByStatus[template.status] - 1, // Sort sequencial por status (0, 1, 2...)
									startDate: activity.startDate,
									endDate: activity.endDate,
									priority: template.priority,
								})
							}

							// Inserir tarefas desta atividade
							if (tasksToCreate.length > 0) {
								await db.insert(schema.projectTask).values(tasksToCreate)
								totalTasksCreated += tasksToCreate.length
								console.log(`     ✅ ${tasksToCreate.length} tarefas criadas para "${activity.name}"`)
							}
						}

						console.log(`   ✅ Projeto "${project.name}" finalizado com ${projectActivities.length} atividades`)
					}
				}

				console.log(`✅ Sistema de tarefas criado: ${totalTasksCreated} tarefas distribuídas!`)
			} else {
				console.log('⚠️ Nenhuma atividade encontrada para criar tarefas')
			}
		} else {
			console.log('⚠️ Dados das tarefas já existem, pulando...')
		}

		// === 13. CRIAR ASSOCIAÇÕES TAREFA-USUÁRIO ===
		// REQUISITO: TODA tarefa deve estar associada a pelo menos um usuário
		console.log('🔵 Criando associações tarefa-usuário (REQUISITO: toda tarefa deve ter pelo menos um usuário)...')

		// Remover associações existentes
		await db.delete(schema.projectTaskUser)
		console.log('✅ Associações antigas removidas')

		// Buscar tarefas e usuários existentes
		const allTasks = await db.select().from(schema.projectTask)
		const allUsers = await db.select().from(schema.authUser).where(eq(schema.authUser.isActive, true))

		if (allTasks.length > 0 && allUsers.length > 0) {
			const taskUsersToCreate = []

			// REQUISITO: Para CADA tarefa, associar pelo menos 1 usuário
			for (const task of allTasks) {
				// Garantir que cada tarefa tenha pelo menos 1 usuário
				const numUsers = Math.floor(Math.random() * 3) + 1 // 1-3 usuários por tarefa
				const selectedUsers = allUsers.sort(() => 0.5 - Math.random()).slice(0, numUsers)

				for (const user of selectedUsers) {
					const role = Math.random() > 0.7 ? 'reviewer' : 'assignee' // 70% assignee, 30% reviewer

					taskUsersToCreate.push({
						id: randomUUID(),
						taskId: task.id,
						userId: user.id,
						role,
						assignedAt: new Date(),
					})
				}
			}

			if (taskUsersToCreate.length > 0) {
				await db.insert(schema.projectTaskUser).values(taskUsersToCreate)
				console.log(`✅ ${taskUsersToCreate.length} associações tarefa-usuário criadas!`)
				console.log(`✅ REQUISITO ATENDIDO: Todas as ${allTasks.length} tarefas têm pelo menos um usuário associado`)
			}
		} else {
			console.log('⚠️ Nenhuma tarefa ou usuário encontrado para criar associações')
		}

		console.log('✅ Seed finalizado com sucesso!')
		console.log('📊 Resumo do seed:')
		console.log(`   - Sistema completamente configurado`)
		console.log(`   - Dados de teste inseridos onde necessário`)
		console.log(`   - Sistema de tarefas com arquitetura simplificada implementado`)
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
