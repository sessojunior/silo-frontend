import { NextRequest, NextResponse } from 'next/server'

// Proteção de rotas privadas
// Apenas redireciona caso não exista o cookie de sessão
// A validação de token e sessão ocorre dentro da própria rota protegida (em layout.tsx)

export async function middleware(req: NextRequest) {
	const token = req.cookies.get('session_token')?.value

	if (!token) return NextResponse.redirect(new URL('/login', req.url))

	return NextResponse.next()
}

export const config = {
	matcher: ['/admin/:path*'],
}
