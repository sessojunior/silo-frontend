import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/token'
import { ChatProvider } from '@/context/ChatContext'
import { UserProvider } from '@/context/UserContext'
import AdminWrapper from '@/components/admin/AdminWrapper'

export const metadata: Metadata = {
	title: 'Administração do Silo',
	description: 'Sistema de gerenciamento de produtos e tarefas.',
}

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	// Verificar se o usuário está autenticado
	// Se o usuário não estiver autenticado, redireciona para a tela de login
	const currentUser = await getAuthUser()
	if (!currentUser) redirect('/login')

	// Sessão válida - o UserContext fará a busca dos dados completos
	return (
		<UserProvider>
			<ChatProvider>
				<AdminWrapper>{children}</AdminWrapper>
			</ChatProvider>
		</UserProvider>
	)
}
