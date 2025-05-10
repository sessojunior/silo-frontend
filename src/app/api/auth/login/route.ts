// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	const { email, password } = await req.json()

	if (!email || !password) {
		return NextResponse.json({ field: 'email', message: 'Email e senha são obrigatórios.' }, { status: 400 })
	}

	// Simula a busca no banco (substituir por lógica real)
	const user = {
		email: 'usuario@inpe.br',
		password: '12345678', // senha mock
		isVerified: false,
	}

	if (email !== user.email || password !== user.password) {
		return NextResponse.json({ field: 'password', message: 'Email ou senha inválidos.' }, { status: 401 })
	}

	// Se precisar verificar e-mail
	if (!user.isVerified) {
		return NextResponse.json({ requiresVerification: true }, { status: 200 })
	}

	// TODO: Gerar e enviar JWT (session token)
	return NextResponse.json({ success: true, token: 'mock-jwt-token' })
}
