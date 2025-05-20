import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as auth from '@/app/lib/auth'

// Faz logout do usuário
export async function POST() {
	// Lê o cookie diretamente via cookies()
	const cookieStore = await cookies()
	const sessionToken = cookieStore.get(auth.sessionCookieName)?.value

	// Se não houver token, retorna 401
	if (!sessionToken) {
		return NextResponse.json({ message: 'Sessão não encontrada' }, { status: 401 })
	}

	// Invalida a sessão no banco de dados
	await auth.invalidateSessionToken(sessionToken)

	// Remove o cookie de sessão
	const response = NextResponse.json({ success: true }, { status: 200 })
	auth.deleteCookieSessionToken(response)

	return response
}
