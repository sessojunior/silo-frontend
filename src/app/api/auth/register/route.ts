import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as auth from '@/app/lib/auth'

export async function POST(req: NextRequest) {
	try {
		const { name: reqName, email: reqEmail, password: reqPassword } = await req.json()
		const name = reqName as string
		const email = (reqEmail as string).trim().toLowerCase()
		const password = reqPassword as string

		if (!name || !email || !password) {
			return NextResponse.json({ field: null, message: 'Todos os campos são obrigatórios.' }, { status: 400 })
		}

		// Criação de conta
		const resultUser = await auth.signUp(name, email, password)
		if ('error' in resultUser) {
			return NextResponse.json({ field: resultUser.error.field, message: resultUser.error.message ?? 'Erro ao criar usuário.' }, { status: 400 })
		}

		// Geração de código OTP
		const otp = await auth.generateCode(email)
		if ('error' in otp) {
			return NextResponse.json({ field: null, message: otp.error.message ?? 'Erro ao gerar código OTP.' }, { status: 400 })
		}

		// Código OTP
		const code = otp.code

		// Envio de e-mail com código
		await auth.sendEmailCode({ email, type: 'email-verification', code })

		return NextResponse.json({ step: 2, name, email })
	} catch (error) {
		console.error('Erro em /api/auth/register:', error)
		return NextResponse.json({ field: null, message: 'Erro inesperado no servidor.' }, { status: 500 })
	}
}
