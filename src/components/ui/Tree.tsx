'use client'

import { useState, useEffect, HTMLAttributes } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export type TreeItemProps = {
	label: string
	url?: string
	icon?: string
	children?: TreeItemProps[]
	onClick?: () => void
}

export type TreeProps = {
	item: TreeItemProps
	level?: number
	defaultOpen?: boolean
	activeUrl?: string
	linkProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>
} & HTMLAttributes<HTMLDivElement>

export default function Tree({ item, level = 0, defaultOpen = true, activeUrl, linkProps, ...props }: TreeProps) {
	const hasChildren = !!item.children?.length
	const [isOpen, setIsOpen] = useState(defaultOpen)

	const isActive = item.url && item.url === activeUrl
	const hasLeafChildren = item.children?.some((child) => !child.children?.length) ?? false

	// Margem esquerda segura com limite de ml-12
	const indent = Math.min(level * 2, 12)
	const indentClass = `ml-${indent}`

	useEffect(() => {
		if (hasChildren && item.children?.some((child) => child.url === activeUrl)) {
			setIsOpen(true)
		}
	}, [activeUrl, item.children, hasChildren])

	// Componente folha (sem filhos)
	if (!hasChildren) {
		const linkClass = twMerge(
			clsx('my-0.5 flex cursor-pointer items-center gap-x-2 rounded-md px-2 py-1 text-sm transition hover:bg-zinc-100', indentClass, {
				'bg-zinc-200 text-zinc-900 font-semibold': isActive,
				'text-zinc-700': !isActive,
			}),
		)

		if (item.onClick) {
			return (
				<div onClick={item.onClick} className={linkClass}>
					{item.icon && <span className={clsx(item.icon, 'block size-4 text-zinc-500')} />}
					<span>{item.label}</span>
				</div>
			)
		}

		return (
			<Link href={item.url ?? '#'} className={linkClass} {...linkProps}>
				{item.icon && <span className={clsx(item.icon, 'block size-4 text-zinc-500')} />}
				<span>{item.label}</span>
			</Link>
		)
	}

	// Componente com filhos (recursivo)
	return (
		<div className='w-full py-0.5' {...props}>
			<div className={twMerge(clsx('group flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1 transition hover:bg-zinc-100', indentClass))}>
				{/* Ícone de expansão */}
				<div onClick={() => setIsOpen((prev) => !prev)} className='flex size-6 items-center justify-center'>
					{isOpen ? <span className='icon-[lucide--minus] size-4 text-zinc-800' /> : <span className='icon-[lucide--plus] size-4 text-zinc-800' />}
				</div>

				{/* Label e ícone */}
				<div onClick={item.onClick || (() => setIsOpen((prev) => !prev))} className='flex grow items-center gap-x-2 overflow-hidden'>
					{item.icon && <span className={clsx(item.icon, 'block size-4 text-zinc-500')} />}
					<span className='truncate text-sm font-medium text-zinc-800'>{item.label}</span>
				</div>

				{/* Badge com quantidade de filhos (somente folhas) */}
				{hasLeafChildren && <span className='inline-flex items-center gap-x-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-400'>{item.children?.length}</span>}
			</div>

			{/* Renderização recursiva dos filhos */}
			{isOpen && <div className='ml-4 border-l border-zinc-100'>{item.children?.map((child, index) => <Tree key={index} item={child} level={level + 1} defaultOpen={defaultOpen} activeUrl={activeUrl} />)}</div>}
		</div>
	)
}
