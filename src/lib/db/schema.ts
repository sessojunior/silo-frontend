import { pgTable, text, integer, timestamp, boolean, unique, index, date, uuid, jsonb } from 'drizzle-orm/pg-core'

// Grupos de usuários (categorias para futuro chat)
export const group = pgTable('group', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	description: text('description'),
	icon: text('icon').notNull().default('icon-[lucide--users]'), // ícone para o canal do chat
	color: text('color').notNull().default('#3B82F6'), // cor do canal no chat
	active: boolean('active').notNull().default(true),
	isDefault: boolean('is_default').notNull().default(false), // grupo padrão para novos usuários
	maxUsers: integer('max_users'), // limite opcional de usuários
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type Group = typeof group.$inferSelect

// Relacionamento Many-to-Many entre Usuários e Grupos
export const userGroup = pgTable(
	'user_group',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => authUser.id, { onDelete: 'cascade' }),
		groupId: text('group_id')
			.notNull()
			.references(() => group.id, { onDelete: 'cascade' }),
		role: text('role').notNull().default('member'), // 'member' | 'admin' | 'owner'
		joinedAt: timestamp('joined_at').notNull().defaultNow(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => ({
		// Constraint único para evitar usuário duplicado no mesmo grupo
		uniqueUserGroup: unique('unique_user_group').on(table.userId, table.groupId),
		// Índices para performance
		userIdIdx: index('idx_user_group_user_id').on(table.userId),
		groupIdIdx: index('idx_user_group_group_id').on(table.groupId),
	}),
)
export type UserGroup = typeof userGroup.$inferSelect

export const authUser = pgTable('auth_user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	password: text('password').notNull(),
	image: text('image'), // URL da imagem de perfil do usuário
	isActive: boolean('is_active').notNull().default(false), // usuários criados inativos por padrão - precisam ativação por admin
	lastLogin: timestamp('last_login'), // último acesso do usuário
	createdAt: timestamp('created_at').notNull().defaultNow(),
})
export type AuthUser = typeof authUser.$inferSelect

export const authSession = pgTable('auth_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	token: text('token').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
})
export type AuthSession = typeof authSession.$inferSelect

export const authCode = pgTable('auth_code', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	code: text('code'),
	email: text('email').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
})
export type AuthCode = typeof authCode.$inferSelect

export const authProvider = pgTable('auth_provider', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	googleId: text('google_id').notNull(),
})
export type AuthProvider = typeof authProvider.$inferSelect

export const rateLimit = pgTable('rate_limit', {
	id: text('id').primaryKey(),
	route: text('route').notNull(),
	email: text('email').notNull(),
	ip: text('ip').notNull(),
	count: integer('count').notNull(),
	lastRequest: timestamp('last_request').notNull(),
})
export type RateLimit = typeof rateLimit.$inferSelect

export const userProfile = pgTable('user_profile', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	genre: text('genre').notNull(),
	phone: text('phone').notNull(),
	role: text('role').notNull(),
	team: text('team').notNull(),
	company: text('company').notNull(),
	location: text('location').notNull(),
})
export type UserProfile = typeof userProfile.$inferSelect

export const userPreferences = pgTable('user_preferences', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	chatEnabled: boolean('chat_enabled').notNull().default(true), // Controle para ativar/desativar chat
})
export type UserPreferences = typeof userPreferences.$inferSelect

export const product = pgTable('product', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	available: boolean('available').notNull().default(true),
	priority: text('priority').notNull().default('normal'), // 'low', 'normal', 'high', 'urgent'
	turns: jsonb('turns').notNull().default(['0', '6', '12', '18']),
	description: text('description'),
})
export type Product = typeof product.$inferSelect

// === NOVA TABELA: Categorias de Problemas ===
export const productProblemCategory = pgTable('product_problem_category', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	color: text('color'),
	isSystem: boolean('is_system').notNull().default(false), // Categoria do sistema (não pode ser excluída)
	sortOrder: integer('sort_order').notNull().default(0), // Ordem de exibição
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type ProductProblemCategory = typeof productProblemCategory.$inferSelect

export const productProblem = pgTable('product_problem', {
	id: text('id').primaryKey(),
	productId: text('product_id')
		.notNull()
		.references(() => product.id),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	title: text('title').notNull(),
	description: text('description').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	problemCategoryId: text('problem_category_id').references(() => productProblemCategory.id),
})
export type ProductProblem = typeof productProblem.$inferSelect

export const productProblemImage = pgTable('product_problem_image', {
	id: text('id').primaryKey(),
	productProblemId: text('product_problem_id')
		.notNull()
		.references(() => productProblem.id),
	image: text('image').notNull(),
	description: text('description').notNull(),
})
export type ProductProblemImage = typeof productProblemImage.$inferSelect

export const productSolution = pgTable('product_solution', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	productProblemId: text('product_problem_id')
		.notNull()
		.references(() => productProblem.id),
	description: text('description').notNull(),
	replyId: text('reply_id'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type ProductSolution = typeof productSolution.$inferSelect

export const productSolutionChecked = pgTable('product_solution_checked', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	productSolutionId: text('product_solution_id')
		.notNull()
		.references(() => productSolution.id),
})
export type ProductSolutionChecked = typeof productSolutionChecked.$inferSelect

export const productSolutionImage = pgTable('product_solution_image', {
	id: text('id').primaryKey(),
	productSolutionId: text('product_solution_id')
		.notNull()
		.references(() => productSolution.id),
	image: text('image').notNull(),
	description: text('description').notNull(),
})
export type productSolutionImage = typeof productSolutionImage.$inferSelect

// Base de Conhecimento - Dependências hierárquicas (self-referencing)
export const productDependency = pgTable('product_dependency', {
	id: text('id').primaryKey(),
	productId: text('product_id')
		.notNull()
		.references(() => product.id),
	name: text('name').notNull(),
	icon: text('icon'), // ícone lucide
	description: text('description'),
	parentId: text('parent_id'), // self-reference - MANTIDO para operações diretas
	// CAMPOS HÍBRIDOS OTIMIZADOS
	treePath: text('tree_path'), // "/1/2/3" - caminho completo na árvore
	treeDepth: integer('tree_depth').notNull().default(0), // 0, 1, 2... - profundidade
	sortKey: text('sort_key'), // "001.002.003" - chave de ordenação otimizada
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type ProductDependency = typeof productDependency.$inferSelect

// Base de Conhecimento - Contatos Globais
export const contact = pgTable('contact', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	role: text('role').notNull(),
	team: text('team').notNull(),
	email: text('email').notNull().unique(), // email único globalmente
	phone: text('phone'),
	image: text('image'), // caminho para foto do contato
	active: boolean('active').notNull().default(true), // status ativo/inativo
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type Contact = typeof contact.$inferSelect

// Base de Conhecimento - Associação Produto-Contato
export const productContact = pgTable('product_contact', {
	id: text('id').primaryKey(),
	productId: text('product_id')
		.notNull()
		.references(() => product.id),
	contactId: text('contact_id')
		.notNull()
		.references(() => contact.id),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})
export type ProductContact = typeof productContact.$inferSelect

// Base de Conhecimento - Manual do Produto (Markdown único)
export const productManual = pgTable('product_manual', {
	id: text('id').primaryKey(),
	productId: text('product_id')
		.notNull()
		.references(() => product.id),
	description: text('description').notNull(), // conteúdo markdown completo
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type ProductManual = typeof productManual.$inferSelect

// Arquivos do Sistema (para rich text editor)
export const systemFile = pgTable('system_file', {
	id: text('id').primaryKey(),
	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	path: text('path').notNull(), // caminho relativo no sistema de arquivos
	uploadedBy: text('uploaded_by')
		.notNull()
		.references(() => authUser.id),
	relatedTo: text('related_to'), // tipo de entidade relacionada (chapter, problem, etc.)
	relatedId: text('related_id'), // ID da entidade relacionada
	createdAt: timestamp('created_at').notNull().defaultNow(),
})
export type SystemFile = typeof systemFile.$inferSelect

// === SISTEMA DE CHAT ULTRA SIMPLIFICADO ===

// Mensagens do Chat (groupMessage + userMessage unificado)
export const chatMessage = pgTable(
	'chat_message',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		content: text('content').notNull(),
		senderUserId: text('sender_user_id')
			.notNull()
			.references(() => authUser.id, { onDelete: 'cascade' }),

		// GRUPO ou MENSAGEM PRIVADA (um dos dois preenchido)
		receiverGroupId: text('receiver_group_id').references(() => group.id, { onDelete: 'cascade' }), // groupMessage
		receiverUserId: text('receiver_user_id').references(() => authUser.id, { onDelete: 'cascade' }), // userMessage

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
		deletedAt: timestamp('deleted_at'), // Soft delete manual

		// LEITURA APENAS PARA userMessage
		readAt: timestamp('read_at'), // NULL = não lida, preenchido = lida
	},
	(table) => ({
		// Índices otimizados
		groupIdx: index('idx_chat_message_group').on(table.receiverGroupId, table.createdAt),
		userIdx: index('idx_chat_message_user').on(table.receiverUserId, table.senderUserId, table.createdAt),
		unreadUserIdx: index('idx_chat_message_unread_user').on(table.receiverUserId, table.readAt),
	}),
)
export type ChatMessage = typeof chatMessage.$inferSelect

// Status de Presença dos chatUsers
export const chatUserPresence = pgTable('chat_user_presence', {
	userId: text('user_id')
		.primaryKey()
		.references(() => authUser.id, { onDelete: 'cascade' }),
	status: text('status').notNull().default('offline'), // 'online' | 'away' | 'busy' | 'offline'
	lastActivity: timestamp('last_activity').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type ChatUserPresence = typeof chatUserPresence.$inferSelect

// === SISTEMA DE AJUDA ===

// Tabela de ajuda do sistema (documentação única em Markdown)
export const help = pgTable('help', {
	id: text('id').primaryKey(),
	description: text('description').default(''),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
export type Help = typeof help.$inferSelect

// === SISTEMA DE PROJETOS ===

// Tabela de projetos
export const project = pgTable('project', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	shortDescription: text('short_description').notNull(),
	description: text('description').notNull(),
	startDate: date('start_date'),
	endDate: date('end_date'),
	priority: text('priority').notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
	status: text('status').notNull().default('active'), // 'active' | 'completed' | 'paused' | 'cancelled'
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type Project = typeof project.$inferSelect

// Tabela de atividades dos projetos
export const projectActivity = pgTable('project_activity', {
	id: uuid('id').primaryKey().defaultRandom(),
	projectId: uuid('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description').notNull(),
	category: text('category'), // categoria da atividade
	estimatedDays: integer('estimated_days'), // dias estimados
	startDate: date('start_date'),
	endDate: date('end_date'),
	priority: text('priority').notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
	status: text('status').notNull().default('todo'), // 'todo' | 'progress' | 'done' | 'blocked'
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type ProjectActivity = typeof projectActivity.$inferSelect

// Tabela de tarefas dos projetos (REFATORADA - ARQUITETURA SIMPLIFICADA)
export const projectTask = pgTable('project_task', {
	id: uuid('id').primaryKey().defaultRandom(),
	projectId: uuid('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	projectActivityId: uuid('project_activity_id')
		.notNull()
		.references(() => projectActivity.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description').notNull(),
	category: text('category'), // categoria da tarefa
	estimatedDays: integer('estimated_days'), // dias estimados
	startDate: date('start_date'),
	endDate: date('end_date'),
	priority: text('priority').notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
	status: text('status').notNull().default('todo'), // 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	sort: integer('sort').notNull().default(0), // ORDEM DENTRO DA COLUNA/STATUS - NOVO CAMPO
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type ProjectTask = typeof projectTask.$inferSelect

// Tabela de associação many-to-many entre tarefas e usuários
export const projectTaskUser = pgTable(
	'project_task_user',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		taskId: uuid('task_id')
			.notNull()
			.references(() => projectTask.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => authUser.id, { onDelete: 'cascade' }),
		role: text('role').notNull().default('assignee'), // 'assignee' | 'reviewer' | 'watcher'
		assignedAt: timestamp('assigned_at').notNull().defaultNow(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => ({
		// Constraint único para evitar usuário duplicado na mesma tarefa
		uniqueTaskUser: unique('unique_task_user').on(table.taskId, table.userId),
		// Índices para performance
		taskIdIdx: index('idx_project_task_user_task_id').on(table.taskId),
		userIdIdx: index('idx_project_task_user_user_id').on(table.userId),
	}),
)
export type ProjectTaskUser = typeof projectTaskUser.$inferSelect

// Tabela de histórico de movimentação de tarefas
export const projectTaskHistory = pgTable(
	'project_task_history',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		taskId: uuid('task_id')
			.notNull()
			.references(() => projectTask.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => authUser.id),
		action: text('action').notNull(), // 'status_change', 'created', 'updated', 'deleted'
		fromStatus: text('from_status'), // status anterior (null para criação)
		toStatus: text('to_status').notNull(), // status novo
		fromSort: integer('from_sort'), // posição anterior na coluna
		toSort: integer('to_sort'), // posição nova na coluna (null para tarefas deletadas)
		details: jsonb('details'), // dados extras (campos alterados, descrições, etc.)
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => ({
		// Índices para performance de consultas
		taskIdIdx: index('idx_project_task_history_task_id').on(table.taskId),
		userIdIdx: index('idx_project_task_history_user_id').on(table.userId),
		createdAtIdx: index('idx_project_task_history_created_at').on(table.createdAt),
	}),
)
export type ProjectTaskHistory = typeof projectTaskHistory.$inferSelect

// Tabela de atividades/rodadas de produtos
export const productActivity = pgTable(
	'product_activity',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		productId: text('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => authUser.id, { onDelete: 'cascade' }),
		date: date('date').notNull(),
		turn: integer('turn').notNull(), // 0,6,12,18
		status: text('status').notNull(), // 'completed', 'pending', 'in_progress', 'not_run', 'with_problems', 'run_again', 'under_support', 'suspended', 'off'
		problemCategoryId: text('problem_category_id').references(() => productProblemCategory.id),
		description: text('description'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => ({
		productDateIdx: index('idx_product_activity_product_date').on(table.productId, table.date),
	}),
)

export type ProductActivity = typeof productActivity.$inferSelect

// Tabela de histórico de atividades de produtos
export const productActivityHistory = pgTable(
	'product_activity_history',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		productActivityId: uuid('product_activity_id')
			.notNull()
			.references(() => productActivity.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => authUser.id),
		status: text('status').notNull(),
		description: text('description'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => ({
		// Índices para performance de consultas
		productActivityIdIdx: index('idx_product_activity_history_product_activity_id').on(table.productActivityId),
		userIdIdx: index('idx_product_activity_history_user_id').on(table.userId),
		createdAtIdx: index('idx_product_activity_history_created_at').on(table.createdAt),
	}),
)
export type ProductActivityHistory = typeof productActivityHistory.$inferSelect
