import { db, dbProduction, schema, schemaProduction } from '@/lib/db'
import { eq } from 'drizzle-orm'

// Tipos
export type AuthUser = typeof schema.authUser.$inferSelect

// (CREATE) Criar um novo
export async function insertAuthUser(data: Required<Partial<AuthUser>>): Promise<AuthUser> {
	const [user] = await (db as typeof dbProduction)
		.insert((schema as typeof schemaProduction).authUser)
		.values(data)
		.returning()
	return user
}

// (READ) Obter todos os dados
export async function selectAllAuthUser(): Promise<AuthUser[]> {
	const result = await (db as typeof dbProduction).select().from((schema as typeof schemaProduction).authUser)
	return result
}

// (READ) Buscar pelo ID
export async function selectByIdAuthUser(id: string): Promise<AuthUser | null> {
	const rows = await (db as typeof dbProduction)
		.select()
		.from((schema as typeof schemaProduction).authUser)
		.where(eq((schema as typeof schemaProduction).authUser.id, id))

	return rows[0] || null
}

// (UPDATE) Atualizar os dados pelo ID
export async function updateByIdAuthUser(id: string, data: Partial<Pick<AuthUser, 'name' | 'email'>>): Promise<AuthUser | null> {
	const rows = await (db as typeof dbProduction)
		.update((schema as typeof schemaProduction).authUser)
		.set(data)
		.where(eq((schema as typeof schemaProduction).authUser.id, id))
		.returning()

	return rows[0] || null
}

// (DELETE) Remover pelo ID
export async function deleteByIdAuthUser(id: string): Promise<void> {
	await (db as typeof dbProduction).delete((schema as typeof schemaProduction).authUser).where(eq((schema as typeof schemaProduction).authUser.id, id))
}
