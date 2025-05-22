import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { authSession, authUser } from '@/lib/db/schema'
import { and, eq, gt } from 'drizzle-orm'

// Recuperar usuário autenticado

export async function getAuthUser() {
	const cookieStore = await cookies()
	const token = cookieStore.get('session_token')?.value
	if (!token) return null

	// Busca a sessão válida
	const session = await db.query.authSession.findFirst({
		where: and(eq(authSession.token, token), gt(authSession.expiresAt, new Date())),
	})

	if (!session) return null

	// Busca o usuário relacionado
	const user = await db.query.authUser.findFirst({
		where: eq(authUser.id, session.userId),
	})

	if (!user || user.emailVerified !== 1) return null

	return user
}
