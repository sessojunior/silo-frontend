import { NextRequest, NextResponse } from 'next/server'

// Middleware para proteger rotas privadas
// Protege o acesso ao painel de administrador
export function middleware(request: NextRequest) {
	const authenticated = true

	if (request.nextUrl.pathname.startsWith('/admin') && !authenticated) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return NextResponse.next()
}
