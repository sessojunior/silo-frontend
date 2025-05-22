'use client'

import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx' // Usado para juntar classes condicionalmente
import { twMerge } from 'tailwind-merge' // Junta classes do Tailwind com priorização de estilos

// Define os estilos possíveis do botão
type ButtonStyle = 'filled' | 'bordered' | 'unstyled'

// Propriedades comuns entre <button> e <a>
interface CommonProps {
	children: ReactNode // Conteúdo interno do botão
	icon?: string | null // Classe de ícone opcional
	style?: ButtonStyle // Estilo visual do botão
	className?: string // Classe adicional opcional
}

// Propriedades específicas de um <a href="...">
type AnchorProps = CommonProps &
	AnchorHTMLAttributes<HTMLAnchorElement> & {
		href: string // Quando `href` está presente, o componente se comporta como um link
	}

// Propriedades específicas de um <button>
type ButtonElementProps = CommonProps &
	ButtonHTMLAttributes<HTMLButtonElement> & {
		href?: undefined // Quando `href` está ausente, será um <button>
	}

// A união dos dois tipos define o componente de botão principal
type ButtonProps = AnchorProps | ButtonElementProps

// Componente principal
export default function Button(props: ButtonProps) {
	// Desestruturação das props
	const { children, icon, style = 'filled', className, href, ...rest } = props

	// Estilos base para cada tipo de botão
	const baseStyles: Record<ButtonStyle, string> = {
		filled: 'inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-none disabled:pointer-events-none disabled:opacity-50 transition-all duration-500',
		bordered: 'inline-flex items-center justify-center gap-x-2 rounded-lg border border-zinc-200 bg-white px-5 py-3 font-medium shadow-xs hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800 transition-all duration-500',
		unstyled: 'inline-flex items-center justify-center gap-x-2 rounded-lg px-4 py-3 text-sm text-zinc-800 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-300 disabled:pointer-events-none disabled:opacity-50',
	}

	// Combinação dos estilos base com qualquer classe adicional passada via props
	const finalClass = twMerge(clsx(baseStyles[style as ButtonStyle], className))

	// Criação do ícone, se a prop `icon` estiver definida
	const Icon = icon ? <span className={clsx(icon, 'size-4 shrink-0')} /> : null

	// Se `href` estiver definido, renderiza como um <Link> (âncora)
	if (href) {
		const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement> // Define tipo correto para props extras

		return (
			<Link href={href} className={finalClass} role='button' {...anchorProps}>
				{Icon}
				{children}
			</Link>
		)
	}

	// Caso contrário, renderiza como um <button>
	const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>

	return (
		<button className={finalClass} {...buttonProps}>
			{Icon}
			{children}
		</button>
	)
}
