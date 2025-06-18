import { NextRequest, NextResponse } from 'next/server'

// Proteção de rotas privadas
// Redireciona páginas /admin/* sem sessão para login
// APIs /api/admin/* fazem verificação básica de token + verificação completa nas próprias APIs

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl
	const token = req.cookies.get('session_token')?.value

	// Proteção de páginas administrativas
	if (pathname.startsWith('/admin')) {
		if (!token) {
			return NextResponse.redirect(new URL('/login', req.url))
		}
		return NextResponse.next()
	}

	// Proteção de APIs administrativas - verificação básica
	if (pathname.startsWith('/api/admin/')) {
		if (!token) {
			console.log('🚨 [Middleware] Token ausente para API admin:', pathname)
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}
		console.log('✅ [Middleware] Token presente para API admin:', pathname)
		// Verificação completa de autenticação será feita nas próprias APIs usando getAuthUser()
		return NextResponse.next()
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/admin/:path*', '/api/admin/:path*'],
}
