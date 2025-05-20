import { NextResponse } from 'next/server'
import { google } from '@/app/lib/oauth'
import * as arctic from 'arctic'

// Cria a URL de autorização do Google
// Inicia o fluxo de autenticação OAuth 2.0 com PKCE (Google como provedor).
// 1. Gera "state" (proteção CSRF) e "code_verifier" (PKCE).
// 2. Salva ambos em cookies HttpOnly, SameSite=Lax, expiração 10 minutos.
// 3. Monta a URL de autorização do Google e redireciona o usuário para lá.
export async function GET() {
	// 1. Gera um valor aleatório para "state" (proteção contra CSRF)
	// Esse valor será enviado para o Google e depois validado no callback.
	const state = arctic.generateState()

	// 2. Gera o "code_verifier" (parte do PKCE: Proof Key for Code Exchange)
	// Isso previne ataques de interceptação e reforça a segurança.
	const codeVerifier = arctic.generateCodeVerifier()

	// 3. Define escopos que queremos solicitar ao Google
	// - openid  → Para login (ID Token)
	// - profile → Para nome, foto
	// - email   → Para e-mail principal
	const scopes = ['openid', 'profile', 'email']

	// 4. Monta a URL de autorização do Google (OAuth2) incluindo PKCE e state
	// O createAuthorizationURL deve retornar um URLSearchParams ou URL completo.
	const authorizationUrl = google.createAuthorizationURL(state, codeVerifier, scopes)

	// 5. Prepara a resposta que será enviada ao cliente (redirecionamento)
	const response = NextResponse.redirect(authorizationUrl.toString())

	// 6. Armazena o 'state' em cookie seguro e HttpOnly
	// Esse valor será verificado no callback (para evitar CSRF).
	response.cookies.set({
		name: 'google_oauth_state',
		value: state,
		path: '/', // Cookie válido em todo o domínio
		httpOnly: true, // Não acessível via Javascript do navegador (protege contra XSS)
		maxAge: 60 * 10, // Expira em 10 minutos (600 segundos)
		sameSite: 'lax', // Evita o envio em requisições cross-site não essenciais
	})

	// 7. Armazena o 'code_verifier' em outro cookie seguro
	// Esse valor será usado no callback para trocar o código por um token de acesso
	// Utiliza sempre sameSite: 'lax', pois o 'strict' nunca envia o cookie em requisições vindas de outros domínios
	response.cookies.set({
		name: 'google_code_verifier',
		value: codeVerifier,
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	})

	// 8. Retorna a resposta com status 302 e cabeçalhos Set-Cookie + Location: <GoogleAuthURL>
	return response
}
