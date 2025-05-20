import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { deleteCookieSessionToken } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
	const response = NextResponse.redirect(new URL('/login', req.url))
	deleteCookieSessionToken(response)
	return response
}
