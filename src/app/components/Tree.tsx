'use client'

import { useState, useEffect } from 'react'

export type TreeItemProps = {
	label: string
	url?: string
	icon?: string
	children?: TreeItemProps[]
}

export type TreeProps = {
	item: TreeItemProps
	level?: number
	defaultOpen?: boolean
	activeUrl?: string
}

export default function Tree({ item, level = 0, defaultOpen = true, activeUrl }: TreeProps) {
	const hasChildren = item.children && item.children.length > 0
	const [isOpen, setIsOpen] = useState(defaultOpen)

	// Define margem lateral com base no nível, limitado em ml-12
	const indentClass = level === 0 ? 'ml-0' : `ml-${level * 2}`

	const isActive = item.url && item.url === activeUrl

	// Abre automaticamente se houver filho ativo
	useEffect(() => {
		if (hasChildren && item.children!.some((child) => child.url === activeUrl)) {
			setIsOpen(true)
		}
	}, [activeUrl, item.children, hasChildren])

	if (!hasChildren) {
		const linkBaseClass = 'my-0.5 flex cursor-pointer items-center gap-x-2 rounded-md px-2 py-1 transition hover:bg-zinc-100'
		const activeClass = isActive ? 'bg-zinc-200 text-zinc-900 font-semibold' : 'text-zinc-700'

		return (
			<a href={item.url} className={`${indentClass} ${linkBaseClass} ${activeClass}`}>
				{item.icon && <span className={`${item.icon} block size-4 text-zinc-500`} />}
				<span className='text-sm'>{item.label}</span>
			</a>
		)
	}

	const containerBaseClass = 'group flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1 transition hover:bg-zinc-100'
	const hasLeafChildren = item.children!.some((child) => !child.children || child.children.length === 0)

	return (
		<div className='w-full py-0.5'>
			<div onClick={() => setIsOpen(!isOpen)} className={`${indentClass} ${containerBaseClass}`}>
				{/* Toggle icon */}
				<div className='flex size-6 items-center justify-center'>{isOpen ? <span className='icon-[lucide--minus] size-4 text-zinc-800' /> : <span className='icon-[lucide--plus] size-4 text-zinc-800' />}</div>

				{/* Label */}
				<div className='flex grow items-center gap-x-2 overflow-hidden'>
					{item.icon && <span className={`${item.icon} block size-4 text-zinc-500`} />}
					<span className='truncate text-sm font-medium text-zinc-800'>{item.label}</span>
				</div>

				{/* Badge com número de filhos (apenas se forem folhas) */}
				{hasLeafChildren && (
					<div>
						<span className='inline-flex items-center gap-x-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-400'>{item.children?.length}</span>
					</div>
				)}
			</div>

			{/* Renderização recursiva dos filhos */}
			{isOpen && (
				<div className='ml-4 border-l border-zinc-100'>
					{item.children!.map((child, index) => (
						<Tree key={index} item={child} level={level + 1} defaultOpen={defaultOpen} activeUrl={activeUrl} />
					))}
				</div>
			)}
		</div>
	)
}
