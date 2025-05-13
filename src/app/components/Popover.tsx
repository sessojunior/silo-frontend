'use client'

import { useState, useRef, useEffect } from 'react'

type PopoverProps = {
	children: React.ReactNode
	content: React.ReactNode
	position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'right-bottom' | 'left-bottom'
	className?: string
}

const positionMap: Record<string, string> = {
	'top-left': 'bottom-full left-0 mb-2',
	'top-right': 'bottom-full right-0 mb-2',
	'top-center': 'bottom-full left-1/2 -translate-x-1/2 mb-2',
	'bottom-left': 'top-full left-0 mt-2',
	'bottom-right': 'top-full right-0 mt-2',
	'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-2',
	'right-bottom': 'left-full top-full ml-2',
	'left-bottom': 'right-full top-full mr-2',
}

export default function Popover({ children, content, position = 'top-center', className = '' }: PopoverProps) {
	const [open, setOpen] = useState(false)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const popoverRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (buttonRef.current && !buttonRef.current.contains(e.target as Node) && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className='relative inline-block'>
			<button ref={buttonRef} onClick={() => setOpen((prev) => !prev)} className='focus:outline-none'>
				{children}
			</button>
			{open && (
				<div ref={popoverRef} className={`absolute z-50 rounded-xl border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800 transition-opacity ${positionMap[position]} ${className}`}>
					{content}
				</div>
			)}
		</div>
	)
}
