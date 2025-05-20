import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as auth from '@/app/lib/auth'

// Faz login do usuário com e-mail e senha
export async function POST(req: NextRequest) {
	try {
		const { email: reqEmail, password: reqPassword } = await req.json()
		const email = (reqEmail as string).trim().toLowerCase()
		const password = reqPassword as string

		if (!email || !password) {
			return NextResponse.json({ field: null, message: 'Todos os campos são obrigatórios.' }, { status: 400 })
		}

		// Verifica se o usuário existe e se a senha está correta
		const resultSignIn = await auth.signIn(email, password)
		if ('error' in resultSignIn) return NextResponse.json({ field: resultSignIn.error.field, message: resultSignIn.error.message ?? 'Ocorreu um erro ao fazer o login.' }, { status: 400 })

		// Se o e-mail do usuário ainda não tiver sido verificado
		if (!resultSignIn.user.emailVerified) {
			// Obtém um código OTP e salva-o no banco de dados
			const otp = await auth.generateCode(email)
			if ('error' in otp) return NextResponse.json({ field: 'email', message: otp.error.message ?? 'Erro ao gerar o código para enviar por e-mail.' }, { status: 400 })

			// Código OTP
			const code = otp.code

			// Envia o código OTP por e-mail
			await auth.sendEmailCode({ email, type: 'sign-in', code })

			// Retorna para a página o próximo passo
			return { step: 2, email }
		}

		// Cria a sessão
		const resultCreateSessionToken = await auth.createSessionToken(resultSignIn.user?.id as string)
		if ('error' in resultCreateSessionToken) {
			return NextResponse.json({ field: null, message: resultCreateSessionToken.error.message ?? 'Ocorreu um erro ao criar a sessão.' }, { status: 400 })
		}

		// Cria o cookie de sessão
		const response = NextResponse.redirect(new URL('/app/welcome', req.url))
		auth.setCookieSessionToken(response, resultCreateSessionToken.token, resultCreateSessionToken.session.expiresAt)

		return response
	} catch (error) {
		console.error('Erro em /api/auth/login:', error)
		return NextResponse.json({ field: null, message: 'Erro interno ao fazer o login.' }, { status: 500 })
	}
}
