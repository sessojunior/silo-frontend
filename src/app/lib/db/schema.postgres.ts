import { pgTable, varchar, integer, timestamp } from 'drizzle-orm/pg-core'

export const authUser = pgTable('auth_user', {
	id: varchar('id', { length: 255 }).primaryKey(),
	name: varchar('name', { length: 180 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	emailVerified: integer('email_verified').notNull(),
	password: varchar('password', { length: 120 }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: false }).notNull(),
})
export type AuthUser = typeof authUser.$inferSelect

export const authSession = pgTable('auth_session', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => authUser.id),
	token: varchar('token', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at').notNull(),
})
export type AuthSession = typeof authSession.$inferSelect

export const authCode = pgTable('auth_code', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => authUser.id),
	code: varchar('code', { length: 255 }),
	email: varchar('email', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at').notNull(),
})
export type AuthCode = typeof authCode.$inferSelect

export const authProvider = pgTable('auth_provider', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => authUser.id),
	googleId: varchar('google_id', { length: 255 }).notNull(),
})
export type AuthProvider = typeof authProvider.$inferSelect

export const userProfile = pgTable('user_profile', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => authUser.id),
	genre: varchar('genre', { length: 15 }).notNull(),
	phone: varchar('phone', { length: 15 }).notNull(),
	role: varchar('role', { length: 60 }).notNull(),
	team: varchar('team', { length: 60 }).notNull(),
	company: varchar('company', { length: 120 }).notNull(),
	location: varchar('location', { length: 120 }).notNull(),
})
export type UserProfile = typeof userProfile.$inferSelect

export const userPreferences = pgTable('user_preferences', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => authUser.id),
	theme: varchar('theme', { length: 30 }).notNull(),
	notifyUpdates: integer('notify_updates').notNull(),
	sendNewsletters: integer('send_newsletters').notNull(),
})
export type UserPreferences = typeof userPreferences.$inferSelect

export const products = pgTable('products', {
	id: varchar('id', { length: 255 }).primaryKey(),
	name: varchar('name', { length: 60 }).notNull(),
	available: integer('available').notNull(),
})
export type Products = typeof products.$inferSelect
