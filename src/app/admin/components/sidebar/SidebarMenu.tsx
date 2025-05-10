'use client'

import { useState, useRef, useEffect } from 'react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import type { SidebarMenuProps } from '../../layout'

export default function SidebarMenu({ menu }: { menu: SidebarMenuProps[] }) {
	return (
		<ul className='flex w-full flex-col'>
			{menu.map((section) => (
				<li key={section.id} className='pt-6'>
					<div className='px-4 text-xs text-zinc-400 uppercase'>{section.title}</div>
					{section.items && section.items.length > 0 && (
						<ul className='mt-2 flex flex-col space-y-1 px-2'>
							{section.items.map((item) => (
								<SidebarMenuItem key={item.id} item={item} />
							))}
						</ul>
					)}
				</li>
			))}
		</ul>
	)
}

function SidebarMenuItem({ item }: { item: SidebarMenuProps }) {
	const pathname = usePathname()
	const [isOpen, setIsOpen] = useState(false)
	const contentRef = useRef<HTMLUListElement>(null)

	const isActive = item.url && pathname === item.url
	const toggleAccordion = () => setIsOpen((prev) => !prev)

	useEffect(() => {
		if (!contentRef.current) return
		if (isOpen) {
			contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`
		} else {
			contentRef.current.style.maxHeight = '0px'
		}
	}, [isOpen])

	return (
		<li>
			{item.items && item.items.length > 0 ? (
				<div>
					<button
						type='button'
						onClick={toggleAccordion}
						className={`flex w-full items-center gap-x-3 rounded-lg px-2.5 py-2 text-left text-base font-medium transition-colors duration-300
							text-zinc-800 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-700`}
					>
						{item.icon && <span className={`${item.icon} size-4 shrink-0 text-zinc-400`}></span>}
						{item.title}
						<span className={`ms-auto size-4 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
							<span className='icon-[lucide--chevron-down] text-zinc-400'></span>
						</span>
					</button>

					<ul ref={contentRef} className='ml-4 overflow-hidden border-l border-zinc-300 pl-3 text-sm transition-all duration-500 dark:border-zinc-600' style={{ maxHeight: '0px' }}>
						{item.items.map((child) => (
							<SidebarMenuItem key={child.id} item={child} />
						))}
					</ul>
				</div>
			) : (
				item.url && (
					<NextLink
						href={item.url}
						className={`flex w-full items-center gap-x-3 rounded-lg px-2.5 py-2 text-base font-medium transition-all duration-300
							${isActive ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-600 dark:text-white' : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-700'}`}
					>
						{item.icon && <span className={`${item.icon} size-4 shrink-0 text-zinc-400`}></span>}
						{item.title}
					</NextLink>
				)
			)}
		</li>
	)
}
