import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { authSession, authUser } from '@/lib/db/schema'
import { and, eq, gt } from 'drizzle-orm'
import { generateHashToken } from '@/lib/auth/session'

// Recuperar usuário autenticado

export async function getAuthUser() {
	// Busca o token do cookie
	const cookieStore = await cookies()
	const token = cookieStore.get('session_token')?.value
	if (!token) {
		console.log('⚠️ [AUTH_TOKEN] Token não encontrado no cookie')
		return null
	}

	// Gera o hash do token
	const hashToken = generateHashToken(token)

	// Busca a sessão válida com o token no banco de dados
	const session = await db.query.authSession.findFirst({
		where: and(eq(authSession.token, hashToken), gt(authSession.expiresAt, new Date())),
	})
	if (!session) {
		console.log('⚠️ [AUTH_TOKEN] Sessão não encontrada no banco para o token hash:', hashToken.substring(0, 10) + '...')
		return null
	}

	// Busca o usuário relacionado
	const user = await db.query.authUser.findFirst({
		where: eq(authUser.id, session.userId),
	})

	if (!user) {
		console.log('⚠️ [AUTH_TOKEN] Usuário não encontrado para sessão:', session.userId)
		return null
	}

	if (user.emailVerified !== true) {
		console.log('⚠️ [AUTH_TOKEN] E-mail não verificado para usuário:', user.id)
		return null
	}

	if (!user.isActive) {
		console.log('⚠️ [AUTH_TOKEN] Usuário inativo:', user.id)
		return null
	}

	console.log('✅ [AUTH_TOKEN] Usuário autenticado:', { userId: user.id, email: user.email })
	return user
}
