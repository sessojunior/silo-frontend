import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { OAuth2Tokens, decodeIdToken } from 'arctic'
import { createUserFromGoogleId, getUserFromGoogleId, google } from '@/lib/auth/oauth'
import { createSessionCookie } from '@/lib/auth/session'

// Valida o retorno de chamada do Google pelo código de autorização
// - Verifica se o estado na URL corresponde ao estado armazenado
// - 2Valida o código de autorização e o código verificador armazenado
// - Se passou no escopo de autorização, decodifica o ID token e extrai os dados do usuário
// - Verifica se o usuário já existe, caso contrário, cria um novo usuário com os dados do Google
// - Por fim, cria uma nova sessão para o usuário e armazena o token de sessão no cookie
export async function GET(req: NextRequest) {
	// 1. Recupera os cookies de segurança salvos no início do fluxo OAuth
	const cookieStore = await cookies()
	const stateCookie = cookieStore.get('google_oauth_state')?.value
	const verifierCookie = cookieStore.get('google_code_verifier')?.value

	// 2. Recupera parâmetros de retorno da URL enviados pelo Google
	const code = req.nextUrl.searchParams.get('code')
	const state = req.nextUrl.searchParams.get('state')

	// 3. Verifica se os parâmetros foram enviados
	if (!state || !code || !stateCookie || !verifierCookie) return new NextResponse('Parâmetros ausentes ou expirados. Reinicie o login.', { status: 400 })

	// 4. Proteção contra CSRF: compara o state original com o retornado
	if (state !== stateCookie) return new NextResponse('State inválido. Reinicie o login.', { status: 400 })

	// 5. Troca o código de autorização por tokens reais com o 'code_verifier'
	let tokens: OAuth2Tokens
	try {
		// Obtém os tokens reais
		tokens = await google.validateAuthorizationCode(code, verifierCookie)
	} catch {
		// Caso o código de autorização ou o código verificador seja inválido
		return new NextResponse('Código de autorização inválido. Reinicie o login.', { status: 400 })
	}

	// 6. Decodifica o ID do token (JWT) e extrai os dados do usuário
	const claims = decodeIdToken(tokens.idToken()) as {
		sub: string
		name: string
		email: string
		picture: string
	}
	const googleId = claims.sub
	const name = claims.name
	const email = claims.email
	const picture = claims.picture

	// 7. Verifica se o usuário já existe
	const existingUser = await getUserFromGoogleId(googleId)

	// 8. Se o usuário não existir, cria um novo usuário com os dados do Google
	const user = existingUser.user ?? (await createUserFromGoogleId(googleId, email, name, picture))

	// 9. Cria a sessão e o cookie de sessão
	const sessionToken = await createSessionCookie(user.id)
	if ('error' in sessionToken) return new NextResponse('Ocorreu um erro ao criar a sessão.', { status: 500 })

	// Redireciona o usuário para a página privada
	return NextResponse.redirect(new URL('/admin/welcome', req.url))
}
