'use client'

import { HTMLAttributes } from 'react'
import { clsx } from 'clsx' // Usado para juntar classes condicionalmente
import { twMerge } from 'tailwind-merge' // Junta classes do Tailwind com priorização de estilos

// Tipos
type NavContentProps = {
	children: React.ReactNode // Conteúdo que será renderizado dentro do componente
	className?: string // Classe CSS adicional opcional para customização
} & HTMLAttributes<HTMLDivElement> // Permite outras props válidas em div, como id, role etc.

export default function NavContent({ children, className, ...props }: NavContentProps) {
	return (
		<div className={twMerge(clsx('bg-white dark:bg-zinc-800'), className)} {...props}>
			<div className='flex w-full flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-700'>
				{/* Aqui serão imbudidos os botões de navegação */}
				<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>{children}</div>
			</div>
		</div>
	)
}
