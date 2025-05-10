// app/api/auth/request-verification/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	const { email } = await req.json()

	if (!email) {
		return NextResponse.json({ field: 'email', message: 'E-mail é obrigatório.' }, { status: 400 })
	}

	// Simula geração de código e "envio"
	const code = Math.floor(10000 + Math.random() * 90000).toString()

	// Aqui você salva o código em banco ou cache (mock)
	console.log(`Código para ${email}: ${code}`)

	// Em produção: enviar por email com SMTP ou serviço externo (ex: Resend, Mailgun)
	return NextResponse.json({ sent: true })
}
