import type { Metadata } from 'next'
import './globals.css'

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
		<html lang='en'>
			<body className='antialiased'>{children}</body>
		</html>
	)
}
