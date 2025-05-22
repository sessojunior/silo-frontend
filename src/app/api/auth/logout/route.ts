import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { destroySession } from '@/lib/auth/session'

// Faz logout do usuário
export async function POST() {
	const cookieStore = await cookies()
	const token = cookieStore.get('session_token')?.value

	if (token) await destroySession(token)

	return NextResponse.json({ success: true })
}
