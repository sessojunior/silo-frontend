// api/session/validate.ts
import { NextResponse } from 'next/server'
import { validateSessionToken } from '@/app/lib/auth'

export async function POST(request: Request) {
	const { token } = await request.json()
	const result = await validateSessionToken(token)
	return NextResponse.json(result)
}
