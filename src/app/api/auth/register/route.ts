import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as auth from '@/app/lib/auth'

// Faz o cadastro do usuário
export async function POST(req: NextRequest) {
	try {
		const { name: reqName, email: reqEmail, password: reqPassword } = await req.json()
		const name = reqName as string
		const email = (reqEmail as string).trim().toLowerCase()
		const password = reqPassword as string

		if (!name || !email || !password) {
			return NextResponse.json({ field: null, message: 'Todos os campos são obrigatórios.' }, { status: 400 })
		}

		// Cria a conta do usuário
		// Caso o usuário já exista, será exibido um erro que já existe. O usuário precisará fazer login.
		const resultSignUp = await auth.signUp(name, email, password)
		if ('error' in resultSignUp) {
			return NextResponse.json({ field: resultSignUp.error.field, message: resultSignUp.error.message ?? 'Ocorreu um erro ao criar o usuário.' }, { status: 400 })
		}

		// Obtém um código OTP e salva-o no banco de dados
		const resultGenerateCode = await auth.generateCode(email)
		if ('error' in resultGenerateCode) {
			return NextResponse.json({ field: null, message: resultGenerateCode.error.message ?? 'Erro ao gerar o código para enviar por e-mail.' }, { status: 400 })
		}

		// Código OTP
		const code = resultGenerateCode.code

		// Envia o código OTP por e-mail
		await auth.sendEmailCode({ email, type: 'email-verification', code })

		// Retorna os dados e o próximo passo
		return NextResponse.json({ step: 2, name, email })
	} catch (error) {
		console.error('Erro em /api/auth/register:', error)
		return NextResponse.json({ field: null, message: 'Erro interno ao criar a conta do usuário.' }, { status: 500 })
	}
}
