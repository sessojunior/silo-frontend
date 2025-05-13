'use client'

import Link from 'next/link'

type NavButtonProps = {
	children: React.ReactNode
	disabled?: boolean
	icon?: string | null
	href?: string | null
	active?: boolean
}

export default function NavButton({ children, disabled = false, icon = null, href = null, active = false }: NavButtonProps) {
	return (
		<Link
			href={href || '#'}
			aria-disabled={disabled}
			role='button'
			className={`inline-flex items-center gap-x-2 rounded-lg border px-4 py-2 text-base font-medium text-zinc-800 transition-all duration-500 hover:text-zinc-500 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50
			${active ? 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800' : 'border-transparent bg-transparent dark:bg-zinc-700'}
			${disabled ? 'pointer-events-none opacity-50' : ''} dark:text-zinc-200`}
		>
			{icon && <span className={`${icon} size-4 shrink-0`} aria-hidden='true' />}
			{children}
		</Link>
	)
}
