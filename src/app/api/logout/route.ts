import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { destroySessionCookie } from '@/lib/auth/session'

// Faz logout do usuário

export async function GET(req: NextRequest) {
	try {
		console.log('🔍 [API_LOGOUT] Logout solicitado:', {
			pathname: req.nextUrl.pathname,
			referer: req.headers.get('referer'),
			userAgent: req.headers.get('user-agent')?.substring(0, 50),
			timestamp: new Date().toISOString()
		})
		
		const cookieStore = await cookies()
		const token = cookieStore.get('session_token')?.value

		console.log('🔍 [API_LOGOUT] Token no cookie:', {
			tokenExists: !!token,
			tokenLength: token?.length || 0,
			tokenPrefix: token ? token.substring(0, 10) + '...' : 'N/A'
		})

		// Remove a sessão do banco de dados e do cookie
		if (token) {
			console.log('🗑️ [API_LOGOUT] Removendo sessão...')
			await destroySessionCookie(token)
		} else {
			console.log('⚠️ [API_LOGOUT] Nenhum token encontrado para remover')
		}

		// Redireciona para a página de login
		console.log('🔄 [API_LOGOUT] Redirecionando para login')
		return NextResponse.redirect(new URL('/login', req.url))
	} catch (error) {
		console.error('❌ [API_LOGOUT] Erro ao fazer logout:', { error })
		return NextResponse.redirect(new URL('/login', req.url))
	}
}
