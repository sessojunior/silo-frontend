import { NextRequest, NextResponse } from 'next/server'

// Proteção de rotas privadas
// Redireciona páginas /admin/* sem sessão para login
// APIs /api/admin/* fazem verificação básica de token no middleware + verificação completa nas próprias APIs

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl
	const token = req.cookies.get('session_token')?.value

	console.log('🔍 [MIDDLEWARE] Requisição interceptada:', {
		pathname,
		method: req.method,
		tokenExists: !!token,
		tokenLength: token?.length || 0,
		tokenPrefix: token ? token.substring(0, 10) + '...' : 'N/A',
		referer: req.headers.get('referer'),
		timestamp: new Date().toISOString()
	})

	// Proteção de páginas administrativas
	if (pathname.startsWith('/admin')) {
		if (!token) {
			console.log('❌ [MIDDLEWARE] Token ausente para página admin, redirecionando para login:', { pathname })
			return NextResponse.redirect(new URL('/login', req.url))
		}
		console.log('✅ [MIDDLEWARE] Token presente para página admin, permitindo acesso:', { pathname })
		return NextResponse.next()
	}

	// Proteção de APIs administrativas - verificação básica de token
	if (pathname.startsWith('/api/admin/')) {
		if (!token) {
			console.log('❌ [MIDDLEWARE] Token ausente para API admin:', { pathname })
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

		console.log('✅ [MIDDLEWARE] Token presente para API admin, permitindo acesso:', { pathname })
		// Verificação completa de autenticação será feita nas próprias APIs usando getAuthUser()
		// Middleware Edge Runtime não pode acessar database diretamente
		return NextResponse.next()
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/admin/:path*', '/api/admin/:path*'],
}
