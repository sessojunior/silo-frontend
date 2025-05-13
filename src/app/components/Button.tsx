'use client'

import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
import NextLink from 'next/link'

type ButtonProps = {
	children: React.ReactNode
	type?: 'button' | 'submit' | 'reset'
	disabled?: boolean
	icon?: string | null
	style?: 'filled' | 'bordered' | 'unstyled'
	className?: string | null
	href?: string | null
}

export default function Button({ children, type = 'button', disabled = false, icon = null, style = 'filled', className = null, href = null }: ButtonProps) {
	const classButton = {
		bordered: 'inline-flex items-center justify-center gap-x-2 rounded-lg border border-zinc-200 bg-white px-5 py-3 font-medium shadow-xs hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800 transition-all duration-500',
		filled: 'inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-none disabled:pointer-events-none disabled:opacity-50 transition-all duration-500',
		unstyled: 'inline-flex items-center justify-center gap-x-2 rounded-lg px-4 py-3 text-sm text-zinc-800 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-300 disabled:pointer-events-none disabled:opacity-50',
	}

	const baseClass = classButton[style] ?? classButton.filled

	// Mescla com remoção de conflitos de Tailwind
	const finalClass = twMerge(clsx(baseClass, className))

	const IconElement = icon ? <span className={clsx(icon, 'size-4 shrink-0')}></span> : null

	if (href) {
		return (
			<NextLink href={href} role='button' className={finalClass}>
				{IconElement}
				{children}
			</NextLink>
		)
	}

	return (
		<button type={type} disabled={disabled} className={finalClass}>
			{IconElement}
			{children}
		</button>
	)
}
