import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as auth from '@/app/lib/auth'

// Envia a nova senha do usuário para alterar
export async function POST(req: NextRequest) {
	try {
		const { token, password } = await req.json()

		if (!token || !password) {
			return NextResponse.json({ field: null, message: 'O token e a senha são obrigatórios.' }, { status: 400 })
		}

		// Valida o token de sessão e obtém a sessão e o usuário
		// Se a sessão for inválida, redireciona o usuário para a etapa 1
		const resultValidateSessionToken = await auth.validateSessionToken(token as string)
		if ('error' in resultValidateSessionToken) return NextResponse.json({ step: 1 }, { status: 400 })

		// Obtém os dados do usuário
		const user = resultValidateSessionToken.user

		// Altera a senha
		const resultChangeUserPassword = await auth.changeUserPassword({ userId: user.id, password })
		if ('error' in resultChangeUserPassword) return NextResponse.json({ field: 'password', message: resultChangeUserPassword.error ? resultChangeUserPassword.error.message : 'Ocorreu um erro ao alterar a senha.' }, { status: 400 })

		// Retorna para a página o próximo passo
		return NextResponse.json({ step: 4 })
	} catch (error) {
		console.error('Erro em /api/auth/send-password:', error)
		return NextResponse.json({ field: null, message: 'Erro interno ao enviar a senha.' }, { status: 500 })
	}
}
