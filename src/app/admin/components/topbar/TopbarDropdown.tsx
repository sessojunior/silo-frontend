'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import type { AccountProps } from '../../layout'

export default function TopbarDropdown({ account }: { account: AccountProps }) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	function toggleDropdown() {
		setIsOpen((prev) => !prev)
	}

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className='relative inline-block' ref={dropdownRef}>
			<button onClick={toggleDropdown} type='button' className='group inline-flex items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-zinc-800 focus:outline-none dark:text-white' aria-haspopup='menu' aria-expanded={isOpen}>
				<div className='relative inline-block'>
					<Image src={account.image} alt='Avatar' width={46} height={46} className='inline-block size-[46px] rounded-full border-2 border-zinc-200 transition-all duration-100 group-hover:border-4 group-focus:border-4 group-focus:border-zinc-200 dark:border-zinc-700 dark:group-focus:border-zinc-700' />
					<span className='absolute end-0 bottom-0 block size-3 rounded-full bg-teal-400 ring-2 ring-white dark:ring-zinc-800'></span>
				</div>
				<div className='flex size-6 shrink-0 items-center justify-center rounded-full transition-all duration-500 group-hover:bg-zinc-100 group-focus:bg-zinc-100 dark:group-hover:bg-zinc-700 dark:group-focus:bg-zinc-700'>
					<span className='icon-[lucide--chevron-down] size-4 shrink-0 text-zinc-400'></span>
				</div>
			</button>

			<div className={`absolute right-0 top-full mt-1 z-50 min-w-60 transform rounded-lg border border-zinc-200 bg-white shadow-md transition-opacity duration-300 dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} role='menu' aria-orientation='vertical'>
				<div className='rounded-t-lg bg-zinc-100 px-5 py-3 dark:bg-zinc-700'>
					<p className='text-base font-medium text-zinc-800 dark:text-zinc-200'>{account.name}</p>
					<p className='text-sm text-zinc-500 dark:text-zinc-400'>{account.email}</p>
				</div>
				<div className='space-y-0.5 p-1.5'>
					{account.links.map((link) => (
						<a key={link.id} href={link.url} className={`flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium text-zinc-800 transition-all duration-300 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 dark:focus:bg-zinc-700 dark:focus:text-zinc-300 ${typeof window !== 'undefined' && window.location.pathname === link.url ? 'bg-zinc-100 dark:bg-zinc-700' : ''}`}>
							<span className={`${link.icon} size-4 shrink-0 text-zinc-400`}></span>
							{link.title}
						</a>
					))}
				</div>
			</div>
		</div>
	)
}
