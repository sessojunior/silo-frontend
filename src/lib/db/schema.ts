import { sqliteTable, text, integer, SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core'

export const authUser = sqliteTable('auth_user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified').notNull(),
	password: text('password').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
export type AuthUser = typeof authUser.$inferSelect

export const authSession = sqliteTable('auth_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	token: text('token').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})
export type AuthSession = typeof authSession.$inferSelect

export const authCode = sqliteTable('auth_code', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	code: text('code'),
	email: text('email').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})
export type AuthCode = typeof authCode.$inferSelect

export const authProvider = sqliteTable('auth_provider', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	googleId: text('google_id').notNull(),
})
export type AuthProvider = typeof authProvider.$inferSelect

export const rateLimit = sqliteTable('rate_limit', {
	id: text('id').primaryKey(),
	route: text('route').notNull(),
	email: text('email').notNull(),
	ip: text('ip').notNull(),
	count: integer('count').notNull(),
	lastRequest: integer('last_request', { mode: 'timestamp' }).notNull(),
})
export type RateLimit = typeof rateLimit.$inferSelect

export const userProfile = sqliteTable('user_profile', {
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

export const userPreferences = sqliteTable('user_preferences', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	notifyUpdates: integer({ mode: 'boolean' }).notNull(),
	sendNewsletters: integer({ mode: 'boolean' }).notNull(),
})
export type UserPreferences = typeof userPreferences.$inferSelect

export const product = sqliteTable('product', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	available: integer({ mode: 'boolean' }).notNull(),
})
export type Product = typeof product.$inferSelect

export const productProblem = sqliteTable('product_problem', {
	id: text('id').primaryKey(),
	productId: text('product_problem_id')
		.notNull()
		.references(() => product.id),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	title: text('title').notNull(),
	description: text('description').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
export type ProductProblem = typeof productProblem.$inferSelect

export const productProblemImage = sqliteTable('product_problem_image', {
	id: text('id').primaryKey(),
	productProblemId: text('product_problem_id')
		.notNull()
		.references(() => productProblem.id),
	image: text('image').notNull(),
	description: text('description').notNull(),
})
export type ProductProblemImage = typeof productProblemImage.$inferSelect

const _productSolution: SQLiteTableWithColumns<any> = sqliteTable('product_solution', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	productProblemId: text('product_problem_id')
		.notNull()
		.references(() => productProblem.id),
	description: text('description').notNull(),
	replyId: text('reply_id').references(() => _productSolution.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
export const productSolution = _productSolution
export type ProductSolution = typeof productSolution.$inferSelect

export const productSolutionChecked = sqliteTable('product_solution_checked', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	productSolutionId: text('product_solution_id')
		.notNull()
		.references(() => productSolution.id),
})
export type ProductSolutionChecked = typeof productSolutionChecked.$inferSelect

export const productSolutionImage = sqliteTable('product_solution_image', {
	id: text('id').primaryKey(),
	productSolutionId: text('product_solution_id')
		.notNull()
		.references(() => productSolution.id),
	image: text('image').notNull(),
	description: text('description').notNull(),
})
export type productSolutionImage = typeof productSolutionImage.$inferSelect

// Base de Conhecimento - Dependências hierárquicas (self-referencing)
const _productDependency: SQLiteTableWithColumns<any> = sqliteTable('product_dependency', {
	id: text('id').primaryKey(),
	productId: text('product_id')
		.notNull()
		.references(() => product.id),
	name: text('name').notNull(),
	type: text('type').notNull(), // 'equipamento', 'dependencia', 'elemento_afetado'
	category: text('category').notNull(), // 'maquinas', 'redes_internas', 'hosts', 'softwares', etc.
	icon: text('icon'), // ícone lucide
	description: text('description'),
	url: text('url'), // link para documentação externa se houver
	parentId: text('parent_id').references(() => _productDependency.id), // self-reference
	order: integer('order').notNull().default(0), // ordem de exibição
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
export const productDependency = _productDependency
export type ProductDependency = typeof productDependency.$inferSelect

// Base de Conhecimento - Contatos
export const productContact = sqliteTable('product_contact', {
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
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
export type ProductContact = typeof productContact.$inferSelect

// Base de Conhecimento - Seções do Manual
export const productManualSection = sqliteTable('product_manual_section', {
	id: text('id').primaryKey(),
	productId: text('product_id')
		.notNull()
		.references(() => product.id),
	title: text('title').notNull(),
	description: text('description'), // descrição opcional da seção
	order: integer('order').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
export type ProductManualSection = typeof productManualSection.$inferSelect

// Base de Conhecimento - Capítulos do Manual
export const productManualChapter = sqliteTable('product_manual_chapter', {
	id: text('id').primaryKey(),
	sectionId: text('section_id')
		.notNull()
		.references(() => productManualSection.id),
	title: text('title').notNull(),
	content: text('content').notNull(), // conteúdo em markdown/rich text
	order: integer('order').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
export type ProductManualChapter = typeof productManualChapter.$inferSelect

// Arquivos do Sistema (para rich text editor)
export const systemFile = sqliteTable('system_file', {
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
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
export type SystemFile = typeof systemFile.$inferSelect
