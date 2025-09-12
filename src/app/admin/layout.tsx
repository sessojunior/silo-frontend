import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/token'
import { db } from '@/lib/db'
import { authUser } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { UserProvider } from '@/context/UserContext'
import { ChatProvider } from '@/context/ChatContext'
import AdminWrapper from '@/components/admin/AdminWrapper'

export type UserProps = {
	id: string
	name: string
	email: string
	emailVerified: boolean
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
	const currentUser = await getAuthUser()
	if (!currentUser) redirect('/login')

	// Busca dados completos do usuário, incluindo a imagem do servidor local
	const userData = await db.select().from(authUser).where(eq(authUser.id, currentUser.id)).limit(1)
	const userImage = userData[0]?.image || '/images/profile.png'

	const user: UserProps = {
		...currentUser,
		image: userImage,
	}

	// Sessão válida.
	// Você pode passar `resultValidateSessionToken.user` ou
	// `resultValidateSessionToken.session` via context ou props se desejar.
	return (
		<UserProvider user={user}>
			<ChatProvider>
				<AdminWrapper>{children}</AdminWrapper>
			</ChatProvider>
		</UserProvider>
	)
}
