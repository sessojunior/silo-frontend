// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'

type User = {
	id: number
	name: string
	email: string
	password: string
}

// Mock: simulação de banco (você pode trocar para json-server ou banco real)
const mockDB: User[] = []

function validateEmail(email: string): boolean {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return re.test(email)
}

export async function POST(req: NextRequest) {
	const { name, email, password } = await req.json()

	// 1. Validações básicas
	if (!name || name.length < 2) {
		return NextResponse.json({ field: 'name', message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres.' }, { status: 400 })
	}

	if (!email || !validateEmail(email)) {
		return NextResponse.json({ field: 'email', message: 'E-mail inválido.' }, { status: 400 })
	}

	if (!password || password.length < 6) {
		return NextResponse.json({ field: 'password', message: 'Senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
	}

	// 2. Verifica se já existe
	const userExists = mockDB.find((user) => user.email === email)
	if (userExists) {
		return NextResponse.json({ field: 'email', message: 'Já existe uma conta com este e-mail.' }, { status: 409 })
	}

	// 3. Hasheia a senha (placeholder; use bcrypt em produção)
	const hashedPassword = `hashed-${password}`

	// 4. Salva usuário (mock)
	const newUser: User = {
		id: mockDB.length + 1,
		name,
		email,
		password: hashedPassword,
	}

	mockDB.push(newUser)

	// 5. Retorna sucesso
	return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } })
}
