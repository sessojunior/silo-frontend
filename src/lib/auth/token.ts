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
	
	console.log('🔍 [AUTH_TOKEN] Tentando ler cookie session_token:', { 
		tokenExists: !!token, 
		tokenLength: token?.length || 0,
		tokenPrefix: token ? token.substring(0, 10) + '...' : 'N/A'
	})
	
	if (!token) {
		console.log('⚠️ [AUTH_TOKEN] Cookie session_token não encontrado')
		return null
	}

	// Gera o hash do token
	const hashToken = generateHashToken(token)
	
	console.log('🔍 [AUTH_TOKEN] Token encontrado, hash gerado:', {
		tokenPrefix: token.substring(0, 10) + '...',
		hashPrefix: hashToken.substring(0, 10) + '...'
	})

	// Busca a sessão válida com o token no banco de dados
	const session = await db.query.authSession.findFirst({
		where: and(eq(authSession.token, hashToken), gt(authSession.expiresAt, new Date())),
	})
	
	if (!session) {
		console.log('⚠️ [AUTH_TOKEN] Sessão não encontrada no banco para o hash:', hashToken.substring(0, 10) + '...')
		// Debug: lista sessões válidas existentes
		const allSessions = await db.query.authSession.findMany({
			where: gt(authSession.expiresAt, new Date()),
			limit: 5
		})
		console.log('🔍 [AUTH_TOKEN] Sessões válidas no banco:', allSessions.length, 'sessões encontradas')
		if (allSessions.length > 0) {
			console.log('🔍 [AUTH_TOKEN] Primeiras sessões válidas:', allSessions.map(s => ({
				userId: s.userId,
				tokenPrefix: s.token.substring(0, 10) + '...',
				expiresAt: s.expiresAt.toISOString()
			})))
		}
		return null
	}
	
	console.log('✅ [AUTH_TOKEN] Sessão encontrada no banco:', {
		sessionId: session.id,
		userId: session.userId,
		expiresAt: session.expiresAt.toISOString()
	})

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

	console.log('✅ [AUTH_TOKEN] Usuário autenticado com sucesso:', { userId: user.id, email: user.email })
	return user
}
