// app/api/auth/verify-code/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	const { email, code } = await req.json()

	if (!email || !code) {
		return NextResponse.json({ field: 'code', message: 'Código ou e-mail inválido.' }, { status: 400 })
	}

	// Aqui você verificaria o código no banco/cache (mock)
	const expectedCode = '12345' // código fixo de exemplo

	if (code !== expectedCode) {
		return NextResponse.json({ field: 'code', message: 'Código inválido.' }, { status: 401 })
	}

	// Marcar o e-mail como verificado no banco

	// Gerar token de autenticação (JWT, session)
	return NextResponse.json({ verified: true, token: 'mock-jwt-token' })
}
