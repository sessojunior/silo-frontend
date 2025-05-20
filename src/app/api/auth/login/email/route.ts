import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as auth from '@/app/lib/auth'

// Faz login do usuário com e-mail
export async function POST(req: NextRequest) {
	try {
		const { email: reqEmail } = await req.json()
		const email = (reqEmail as string).trim().toLowerCase()

		if (!email) {
			return NextResponse.json({ field: null, message: 'O e-mail é obrigatório.' }, { status: 400 })
		}

		// Verifica se o usuário existe
		const resulValidateUserEmail = await auth.validateUserEmail(email)
		if ('error' in resulValidateUserEmail) return NextResponse.json({ field: 'email', message: resulValidateUserEmail.error.message ?? 'Ocorreu um erro ao fazer o login.' }, { status: 400 })

		// Obtém um código OTP e salva-o no banco de dados
		const otp = await auth.generateCode(email)
		if ('error' in otp) return NextResponse.json({ field: 'email', message: otp.error.message ?? 'Erro ao gerar o código para enviar por e-mail.' }, { status: 400 })

		// Código OTP
		const code = otp.code

		// Envia o código OTP por e-mail
		await auth.sendEmailCode({ email, type: 'sign-in', code })

		// Retorna para a página o próximo passo
		return NextResponse.json({ step: 2, email })
	} catch (error) {
		console.error('Erro em /api/auth/login/email:', error)
		return NextResponse.json({ field: null, message: 'Erro interno ao fazer o login com e-mail.' }, { status: 500 })
	}
}
