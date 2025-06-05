import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/token'
import { getProfileImagePath } from '@/lib/profileImage'
import { UserProvider } from '@/context/UserContext'
import AdminWrapper from '@/components/admin/AdminWrapper'

export type UserProps = {
	id: string
	name: string
	email: string
	emailVerified: number
	password: string
	createdAt: Date
	image: string
}

export const metadata: Metadata = {
	title: 'Administração do Silo',
	description: 'Sistema de gerenciamento de produtos e tarefas.',
}

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	// Dados do usuário autenticado
	// Se o usuário não estiver autenticado, redireciona para a tela de login
	const authUser = await getAuthUser()
	if (!authUser) redirect('/login')

	const user: UserProps = {
		...authUser,
		image: getProfileImagePath(authUser.id) ?? '/images/profile.png',
	}

	// Sessão válida.
	// Você pode passar `resultValidateSessionToken.user` ou
	// `resultValidateSessionToken.session` via context ou props se desejar.
	return (
		<UserProvider user={user}>
			<AdminWrapper>{children}</AdminWrapper>
		</UserProvider>
	)
}
