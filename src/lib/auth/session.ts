import { randomUUID, createHash } from 'crypto'
import { db } from '@/lib/db'
import { authSession, authUser } from '@/lib/db/schema'
import { eq, lt } from 'drizzle-orm'
import { cookies } from 'next/headers'

// Criar e validar sessão

// Cria a sessão no banco de dados e salva num cookie
export async function createSessionCookie(userId: string) {
	// Gera um token aleatório e seguro
	const token = generateToken()

	// Gera o hash do token
	const hashToken = generateHashToken(token)

	// Um dia em milissegundos
	const DAY_IN_MS = 24 * 60 * 60 * 1000 // 86400000 ms (1 dia)

	// Sessão expira em dias
	const expiresAt = new Date(Date.now() + DAY_IN_MS * 30) // 30 dias

	// Dados da sessão
	const session = { id: randomUUID(), userId, token: hashToken, expiresAt }

	// Insere a sessão no banco de dados
	await db.insert(authSession).values(session)
	console.log('✅ [AUTH_SESSION] Sessão criada no banco:', { userId, sessionId: session.id })

	// Insere o cookie de sessão no navegador
	const cookieStore = await cookies()
	cookieStore.set('session_token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		expires: expiresAt,
	})
	console.log('✅ [AUTH_SESSION] Cookie definido:', { userId, expiresAt: expiresAt.toISOString() })

	// Retorna a sessão e o token
	return { session, token }
}

// Remove a sessão do banco de dados e do cookie
export async function destroySessionCookie(token: string) {
	// Gera o hash do token para buscar no banco de dados
	const hashToken = generateHashToken(token)
	
	// Remove a sessão do banco de dados (usa o hash do token)
	await db.delete(authSession).where(eq(authSession.token, hashToken))

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
export async function destroyAllSession(userId: string) {
	try {
		await db.delete(authSession).where(eq(authSession.userId, userId))
		console.log('ℹ️ [AUTH_SESSION] Todas as sessões do usuário foram destruídas:', { userId })
	} catch (error) {
		console.error('❌ [AUTH_SESSION] Erro ao destruir sessões do usuário:', { userId, error })
		throw error
	}
}

// Valida o token de sessão do usuário
// 1. Verifica se a sessão existe no banco de dados
// 2. Verifica se a sessão expirou
// 3. Se a sessão não expirou, verifica se ela precisa ser estendida
// 4. Apaga do banco de dados todos os tokens expirados
export async function validateSession(token: string) {
	// Gera o hash do token
	const hashToken = generateHashToken(token)

	// 1. Verifica se a sessão existe no banco de dados e não está expirada
	const session = await db.query.authSession.findFirst({ where: eq(authSession.token, hashToken) })
	if (!session) return { error: { code: 'SESSION_NOT_EXISTS', message: 'A sessão não existe.' } }

	// 2. Verifica se a sessão expirou
	// Se a sessão expirou, exclui a sessão do banco de dados
	const sessionExpired = Date.now() >= session.expiresAt.getTime()
	if (sessionExpired) {
		await db.delete(authSession).where(eq(authSession.id, session.id))
		return { error: { code: 'SESSION_EXPIRED', message: 'A sessão expirou.' } }
	}

	// Um dia em milissegundos
	const DAY_IN_MS = 24 * 60 * 60 * 1000 // 86400000 ms (1 dia)

	// 3. Se a sessão não expirou, verifica se ela precisa ser estendida
	// Isso garante que as sessões ativas sejam persistidas, enquanto as inativas eventualmente expirarão.
	// Verifica se há menos de 15 dias (metade da expiração de 30 dias) antes da expiração.
	// Se a sessão precisa ser estendida, atualiza a data de expiração
	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15 // 15 dias
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30)
		await db.update(authSession).set({ expiresAt: session.expiresAt }).where(eq(authSession.id, session.id))
	}

	// 4. Apaga do banco de dados todos os tokens expirados
	await db.delete(authSession).where(lt(authSession.expiresAt, new Date()))

	// Obtém o usuário
	const user = await db.query.authUser.findFirst({ where: eq(authUser.id, session.userId) })
	if (!user) return { error: { code: 'USER_NOT_FOUND', message: 'O usuário não foi encontrado.' } }

	// Retorna a sessão e o usuário
	return { session, user }
}

// Gera o hash SHA-256 de um token
export function generateHashToken(token: string): string {
	const hash = createHash('sha256')
	hash.update(token)
	return hash.digest('hex')
}

// Função auxiliar para gerar um token seguro
function generateToken(): string {
	return createHash('sha256').update(randomUUID()).digest('hex')
}
