import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core'

export const authUser = pgTable('auth_user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	password: text('password').notNull(),
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

// Base de Conhecimento - Contatos
export const productContact = pgTable('product_contact', {
	id: text('id').primaryKey(),
	productId: text('product_id')
		.notNull()
		.references(() => product.id),
	name: text('name').notNull(),
	role: text('role').notNull(),
	team: text('team').notNull(),
	email: text('email').notNull(),
	phone: text('phone'),
	image: text('image'), // caminho para foto do contato
	order: integer('order').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
