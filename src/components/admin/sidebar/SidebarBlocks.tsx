'use client'

import { useState } from 'react'
import { SidebarBlockProps } from '@/app/admin/layout'

export default function SidebarBlocks({ blocks }: { blocks: SidebarBlockProps[] }) {
	const [hiddenBlocks, setHiddenBlocks] = useState<string[]>([])

	const handleClose = (id: string) => {
		setHiddenBlocks((prev) => [...prev, id])
	}

	return (
		<>
			{blocks.map((item) => {
				const isHidden = hiddenBlocks.includes(item.id)

				return (
					<div
						key={item.id}
						id={`alert-sidebar-${item.id}`}
						className={`
							m-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-base
							dark:border-zinc-700 dark:bg-zinc-800
							transition-opacity duration-500 ease-in-out
							${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}
						`}
					>
						<div className='flex items-center justify-between'>
							<p className='text-base font-semibold text-zinc-800 dark:text-white'>{item.title}</p>
							<button type='button' onClick={() => handleClose(item.id)} className='relative -mt-2 -mr-3 inline-flex size-8 items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-zinc-800 transition-all duration-300 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none dark:text-white dark:hover:bg-zinc-600 dark:focus:bg-zinc-700' aria-label='Fechar'>
								<span className='icon-[lucide--x] size-4 shrink-0 text-zinc-400'></span>
							</button>
						</div>
						<p className='mt-1 mb-2 text-sm text-zinc-500 dark:text-zinc-200'>{item.description}</p>
					</div>
				)
			})}
		</>
	)
}
