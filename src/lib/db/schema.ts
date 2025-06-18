import { pgTable, text, integer, timestamp, boolean, unique, index, date, uuid } from 'drizzle-orm/pg-core'

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
	isActive: boolean('is_active').notNull().default(true), // status do usuário no sistema
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
	notifyUpdates: boolean('notify_updates').notNull().default(false),
	sendNewsletters: boolean('send_newsletters').notNull().default(false),
})
export type UserPreferences = typeof userPreferences.$inferSelect

export const product = pgTable('product', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	available: boolean('available').notNull().default(true),
})
export type Product = typeof product.$inferSelect

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

// === SISTEMA DE CHAT ===

// Canais de Chat (grupos ou mensagens diretas)
export const chatChannel = pgTable('chat_channel', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text('description'),
	type: text('type').notNull(), // 'group' | 'direct'
	groupId: text('group_id').references(() => group.id), // Canal baseado em grupo (null para DMs)
	icon: text('icon'),
	color: text('color'),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type ChatChannel = typeof chatChannel.$inferSelect

// Mensagens do Chat
export const chatMessage = pgTable('chat_message', {
	id: uuid('id').primaryKey().defaultRandom(),
	channelId: uuid('channel_id')
		.notNull()
		.references(() => chatChannel.id, { onDelete: 'cascade' }),
	senderId: text('sender_id')
		.notNull()
		.references(() => authUser.id, { onDelete: 'cascade' }),
	content: text('content'),
	messageType: text('message_type').notNull().default('text'), // 'text' | 'file' | 'image'
	fileUrl: text('file_url'),
	fileName: text('file_name'),
	fileSize: integer('file_size'),
	fileMimeType: text('file_mime_type'),
	replyToId: uuid('reply_to_id'),
	threadCount: integer('thread_count').notNull().default(0),
	isEdited: boolean('is_edited').notNull().default(false),
	editedAt: timestamp('edited_at'),
	deliveredAt: timestamp('delivered_at'), // Quando foi entregue globalmente
	createdAt: timestamp('created_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
})
export type ChatMessage = typeof chatMessage.$inferSelect

// Participantes dos Canais
export const chatParticipant = pgTable('chat_participant', {
	id: uuid('id').primaryKey().defaultRandom(),
	channelId: uuid('channel_id')
		.notNull()
		.references(() => chatChannel.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id, { onDelete: 'cascade' }),
	role: text('role').notNull().default('member'), // 'admin' | 'member'
	joinedAt: timestamp('joined_at').notNull().defaultNow(),
	lastReadAt: timestamp('last_read_at'),
})
export type ChatParticipant = typeof chatParticipant.$inferSelect

// Nova tabela para tracking de leitura por usuário/mensagem
export const chatMessageStatus = pgTable(
	'chat_message_status',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		messageId: uuid('message_id')
			.notNull()
			.references(() => chatMessage.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => authUser.id, { onDelete: 'cascade' }),
		readAt: timestamp('read_at').notNull().defaultNow(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => ({
		// Constraint único para evitar duplicatas
		uniqueMessageUser: unique('unique_message_user').on(table.messageId, table.userId),
	}),
)

// Reações nas Mensagens
export const chatReaction = pgTable('chat_reaction', {
	id: uuid('id').primaryKey().defaultRandom(),
	messageId: uuid('message_id')
		.notNull()
		.references(() => chatMessage.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id, { onDelete: 'cascade' }),
	emoji: text('emoji').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})
export type ChatReaction = typeof chatReaction.$inferSelect

// Status dos Usuários no Chat
export const chatUserStatus = pgTable('chat_user_status', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id, { onDelete: 'cascade' }),
	status: text('status').notNull().default('offline'), // 'online' | 'offline' | 'away'
	lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type ChatUserStatus = typeof chatUserStatus.$inferSelect

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
