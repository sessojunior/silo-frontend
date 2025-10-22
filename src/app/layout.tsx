import type { Metadata } from 'next'
import '@/app/globals.css'
import { configValidation } from '@/lib/config'

// Validar configuração na inicialização (apenas produção)
if (process.env.NODE_ENV === 'production') {
	configValidation.validateProductionConfig()
}

export const metadata: Metadata = {
	title: 'Silo',
	description: 'Sistema de gerenciamento de produtos e tarefas.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='pt-br'>
			<body className='antialiased bg-white dark:bg-zinc-900'>{children}</body>
		</html>
	)
}
