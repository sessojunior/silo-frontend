import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createUserFromGoogleId, getUserFromGoogleId, google } from '@/lib/auth/oauth'
import * as auth from '@/lib/auth'
import { setCookieSessionToken } from '@/lib/auth/cookies'
import * as arctic from 'arctic'

// Callback do Google OAuth2 (PKCE) que:
// 1. Lê state e code_verifier dos cookies gerados na rota /api/auth/google
// 2. Lê code e state da query string
// 3. Verifica CSRF (state)
// 4. Troca code pelo token (usando code_verifier)
// 5. Decodifica ID token → extrai dados do usuário
// 6. Verifica se usuário existe; se não, cria novo
// 7. Cria sessão interna e seta cookie de sessão
// 8. Redireciona para rota privada (/app/welcome)
export async function GET(request: NextRequest) {
	// 1. Lê cookies "google_oauth_state" e "google_code_verifier"
	const cookieStore = request.cookies
	const cookieState = cookieStore.get('google_oauth_state')?.value
	const cookieCodeVerifier = cookieStore.get('google_code_verifier')?.value

	// 2. Lê parâmetros "code" e "state" da URL de callback
	const { searchParams } = new URL(request.url)
	const urlCode = searchParams.get('code')
	const urlState = searchParams.get('state')

	// 3. Valida se todos os parâmetros obrigatórios estão presentes
	if (!cookieState || !cookieCodeVerifier || !urlCode || !urlState) {
		return NextResponse.json({ message: 'Parâmetros inválidos. Reinicie o login.' }, { status: 400 })
	}

	// 4. Proteção contra CSRF: compara o state cookie com o state retornado da URL
	if (cookieState !== urlState) {
		return NextResponse.json({ message: 'State inválido. Reinicie o login.' }, { status: 400 })
	}

	// 5. Troca o código de autorização (code) por tokens reais usando code_verifier
	let tokens: arctic.OAuth2Tokens
	try {
		tokens = await google.validateAuthorizationCode(urlCode, cookieCodeVerifier)
	} catch {
		return NextResponse.json({ message: 'Código de autorização inválido. Reinicie o login.' }, { status: 400 })
	}

	// 6. Decodifica o ID token (JWT) e extrai os dados do usuário
	const claims = arctic.decodeIdToken(tokens.idToken()) as {
		sub: string
		name: string
		email: string
		picture: string
	}
	const googleId = claims.sub
	const name = claims.name
	const email = claims.email
	const picture = claims.picture

	// 7. Verifica se o usuário já existe no banco via googleId
	const existingUser = await getUserFromGoogleId(googleId)

	// 8. Se não existir, cria um novo usuário com os dados do Google
	const user = existingUser.user ?? (await createUserFromGoogleId(googleId, email, name, picture))

	// 9. Cria a sessão e o cookie do usuário
	const sessionToken = await createSession(user.id)
	if ('error' in sessionToken) {
		return NextResponse.json({ field: 'code', message: 'Ocorreu um erro ao criar a sessão.' }, { status: 400 })
	}

	// Monta a resposta de redirect e adiciona o Set-Cookie da sessão
	const response = NextResponse.redirect(new URL('/app/welcome', request.url))
	setCookieSessionToken(response, resultSession.token, sessionToken.session.expiresAt)

	return response
}
