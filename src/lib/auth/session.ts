import { randomUUID, createHash } from 'crypto'
import { db } from '@/lib/db'
import { authSession } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

// Criar e validar sessão

// Cria sessão no banco e salva cookie HttpOnly
export async function createSession(userId: string) {
	// Função auxiliar para gerar um token seguro
	const generateToken = () => {
		return createHash('sha256').update(randomUUID()).digest('hex')
	}

	const token = generateToken()
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 dias

	await db.insert(authSession).values({ id: randomUUID(), userId, token, expiresAt })

	const cookieStore = await cookies()
	cookieStore.set('session_token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		expires: expiresAt,
	})
}

// Remove a sessão do banco de dados e do cookie
export async function destroySession(token: string) {
	// Remove a sessão do banco de dados
	await db.delete(authSession).where(eq(authSession.token, token))

	// Remove o cookie do navegador
	const cookieStore = await cookies()
	cookieStore.set({
		name: 'session_token',
		value: '',
		path: '/',
		maxAge: 0,
	})
}

// Remove todas as sessões de um usuário do banco de dados
export async function destroyAllUserSession(userId: string) {
	await db.delete(authSession).where(eq(authSession.userId, userId))
}
