import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

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
	available: integer({ mode: 'boolean' }).notNull(),
})
export type Product = typeof product.$inferSelect

export const productProblem = sqliteTable('product_problem', {
	id: text('id').primaryKey(),
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

export const productSolution = sqliteTable('product_solution', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => authUser.id),
	productProblemId: text('product_problem_id')
		.notNull()
		.references(() => productProblem.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
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
