import { NextRequest, NextResponse } from 'next/server'

// Proteção de rotas privadas
// Redireciona páginas /admin/* sem sessão para login
// APIs /api/admin/* fazem verificação básica de token no middleware + verificação completa nas próprias APIs

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

	// Proteção de APIs administrativas - verificação básica de token
	if (pathname.startsWith('/api/admin/')) {
		// Temporariamente permitir APIs de relatórios para teste
		if (pathname.startsWith('/api/admin/reports/')) {
			return NextResponse.next()
		}

		if (!token) {
			console.log('ℹ️ [MIDDLEWARE] Token ausente para API admin:', { pathname })
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

		// Verificação completa de autenticação será feita nas próprias APIs usando getAuthUser()
		// Middleware Edge Runtime não pode acessar database diretamente
		return NextResponse.next()
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/admin/:path*', '/api/admin/:path*'],
}
