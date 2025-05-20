import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as auth from '@/app/lib/auth'

export async function POST(req: NextRequest) {
	try {
		const { email: reqEmail, code: reqCode } = await req.json()
		const email = (reqEmail as string).trim().toLowerCase()
		const code = Array.isArray(reqCode) ? reqCode.join('').toUpperCase() : ''

		if (!email || !code) {
			return NextResponse.json({ field: 'code', message: 'E-mail e código são obrigatórios.' }, { status: 400 })
		}

		// Valida usuário
		const resultUser = await auth.validateUserEmail(email)
		if ('error' in resultUser) {
			return NextResponse.json({ field: null, message: resultUser.error.message ?? 'Usuário não encontrado.' }, { status: 400 })
		}

		const user = resultUser.user

		// Valida código
		const resultCode = await auth.validateCode({ email, code })
		if ('error' in resultCode) {
			return NextResponse.json({ field: 'code', message: resultCode.error?.message ?? 'Código inválido ou expirado.' }, { status: 400 })
		}

		// Cria sessão
		const resultSession = await auth.createSessionToken(user.id)
		if ('error' in resultSession) {
			return NextResponse.json({ field: null, message: resultSession.error.message ?? 'Erro ao criar sessão.' }, { status: 400 })
		}

		// Define cookie e redireciona
		const response = NextResponse.redirect(new URL('/app/welcome', req.url))
		auth.setCookieSessionToken(response, resultSession.token, resultSession.session.expiresAt)

		return response
	} catch (error) {
		console.error('Erro em /api/auth/verify-code:', error)
		return NextResponse.json({ field: null, message: 'Erro interno ao verificar código.' }, { status: 500 })
	}
}
