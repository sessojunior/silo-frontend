import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as auth from '@/app/lib/auth'

// Verifica o código OTP enviado pelo usuário
export async function POST(req: NextRequest) {
	try {
		const { email: reqEmail, code: reqCode } = await req.json()
		const email = (reqEmail as string).trim().toLowerCase()
		const code = Array.isArray(reqCode) ? reqCode.join('').toUpperCase() : ''

		if (!email || !code) {
			return NextResponse.json({ field: 'code', message: 'O e-mail e o código são obrigatórios.' }, { status: 400 })
		}

		// Verifica se o e-mail existe no banco de dados
		const resultValidateUserEmail = await auth.validateUserEmail(email)
		if ('error' in resultValidateUserEmail) {
			return NextResponse.json({ field: null, message: resultValidateUserEmail.error.message ?? 'Não existe um usuário com este e-mail.' }, { status: 400 })
		}

		// Obtém os dados do usuário
		const user = resultValidateUserEmail.user

		// Verifica se o código OTP enviado pelo usuário é válido e se não está expirado
		// Se o código for válido e não estiver expirado, define o e-mail do usuário como verificado (1) na tabela 'user' do banco de dados
		const resultValidateCode = await auth.validateCode({ email, code: code ?? '' })
		if ('error' in resultValidateCode) {
			return NextResponse.json({ field: 'code', message: resultValidateCode.error?.message ?? 'O código é inválido ou expirou.' }, { status: 400 })
		}

		// Cria a sessão
		const resultCreateSessionToken = await auth.createSessionToken(user.id)
		if ('error' in resultCreateSessionToken) {
			return NextResponse.json({ field: null, message: resultCreateSessionToken.error.message ?? 'Ocorreu um erro ao criar a sessão.' }, { status: 400 })
		}

		// Cria o cookie de sessão
		const response = NextResponse.redirect(new URL('/app/welcome', req.url))
		auth.setCookieSessionToken(response, resultCreateSessionToken.token, resultCreateSessionToken.session.expiresAt)

		return response
	} catch (error) {
		console.error('Erro em /api/auth/verify-code:', error)
		return NextResponse.json({ field: null, message: 'Erro interno ao verificar código.' }, { status: 500 })
	}
}
