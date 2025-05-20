import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as auth from '@/app/lib/auth'

// Faz logout do usuário
export async function POST(req: NextRequest) {
	// Obtém o token da sessão do cookie
	const sessionToken = req.cookies.get(auth.sessionCookieName)?.value

	// Se não houver sessão ativa, retorna erro 401
	if (!sessionToken) {
		return NextResponse.json({ message: 'Sessão não encontrada' }, { status: 401 })
	}

	// Invalida a sessão no banco de dados (a função já gera o hash internamente)
	await auth.invalidateSessionToken(sessionToken)

	// Remove o cookie de sessão
	const response = NextResponse.redirect(new URL('/login', req.url))
	auth.deleteCookieSessionToken(response)

	return response
}
