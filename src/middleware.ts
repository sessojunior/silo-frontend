import { NextResponse, type NextRequest } from 'next/server'
import { sessionCookieName } from '@/app/lib/auth'

// Lista de rotas que exigem autenticação
const protectedRoutes = ['/admin']

// Middleware para validar o token de sessão e proteger rotas privadas
// Protege o acesso ao painel de administrador
export async function middleware(req: NextRequest) {
	const token = req.cookies.get(sessionCookieName)?.value

	// Se for rota protegida e não houver token, redireciona para /login
	if (!token && isProtectedRoute(req.nextUrl.pathname)) {
		return NextResponse.redirect(new URL('/login', req.url))
	}

	if (token) {
		// Chama a API para validar o token de sessão
		const apiValidateUrl = new URL('/api/auth/validate-session', req.url).toString()
		const responseSession = await fetch(apiValidateUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token }),
		})

		// Se der erro (token inválido, expirado, etc.), apaga o cookie e redireciona
		const result = await responseSession.json()
		if ('error' in result) {
			const res = NextResponse.redirect(new URL('/login', req.url))
			// Exclui o cookie de sessão
			res.cookies.set({
				name: sessionCookieName,
				value: '',
				maxAge: 0,
				path: '/',
			})
			return res
		}

		// Se a sessão for válida, renova o cookie com a nova expiração
		// (result.session.expiresAt vem como string ISO; converte para Date)
		const newExpires = new Date(result.session.expiresAt)
		const res = NextResponse.next()
		res.cookies.set({
			name: sessionCookieName,
			value: token,
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.ENVIRONMENT === 'production',
			expires: newExpires,
			path: '/',
		})
		return res
	}

	// Rota não protegida: segue normalmente
	return NextResponse.next()
}

// Verifica se a rota está na lista de rotas protegidas
// (se a rota precisa de autenticação)
function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some((route) => pathname.startsWith(route))
}

// Define quais rotas o middleware deve interceptar
// Protege todas as rotas dentro de /admin
export const config = {
	matcher: ['/admin/:path*'],
}
