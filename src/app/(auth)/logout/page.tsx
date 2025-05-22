import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionCookieName } from '@/lib/auth/cookies'
import { invalidateSessionToken } from '@/lib/auth'

export default async function LogoutPage() {
	const cookieStore = await cookies()
	const sessionToken = cookieStore.get(sessionCookieName)?.value

	if (sessionToken) {
		await invalidateSessionToken(sessionToken)
	}

	// Redireciona para a página de login
	redirect('/login')
}
