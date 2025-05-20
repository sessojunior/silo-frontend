import { NextResponse, type NextRequest } from 'next/server'
import * as auth from '@/app/lib/auth'

// Lista de rotas que exigem autenticação
const protectedRoutes = ['/admin']

// Middleware para validar o token de sessão e proteger rotas privadas
// Protege o acesso ao painel de administrador
export async function middleware(req: NextRequest) {
	const sessionToken = req.cookies.get(auth.sessionCookieName)?.value

	// Se for rota protegida e não houver token, redireciona
	if (!sessionToken && isProtectedRoute(req.nextUrl.pathname)) {
		return NextResponse.redirect(new URL('/login', req.url))
	}

	if (sessionToken) {
		// Valida o token de sessão
		const result = await auth.validateSessionToken(sessionToken)

		if ('error' in result) {
			// Token inválido: redireciona para login e apaga o cookie
			const response = NextResponse.redirect(new URL('/login', req.url))
			auth.deleteCookieSessionToken(response)
			return response
		}

		// Sessão válida: atualiza o cookie com a nova expiração (renova a sessão)
		const response = NextResponse.next()
		auth.setCookieSessionToken(response, sessionToken, result.session.expiresAt)
		return response
	}

	// Rota não protegida, continua normalmente
	return NextResponse.next()
}

// Verifica se a rota está na lista de protegidas (se a rota precisa de autenticação)
function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some((route) => pathname.startsWith(route))
}

// Define quais rotas o middleware deve interceptar
// Protege todas as rotas dentro de /admin
export const config = { matcher: ['/admin/:path*'] }
