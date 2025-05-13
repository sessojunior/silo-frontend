'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

export interface SelectOption {
	label: string
	value: string
	disabled?: boolean
}

export interface AdvancedSelectProps {
	/** placeholder exibido quando não há seleção */
	placeholder?: string
	/** nome do campo para formulário */
	name: string
	/** valor inicial selecionado */
	selected?: string | null
	/** lista de opções */
	options: SelectOption[]
	/** se é obrigatório */
	required?: boolean
	/** callback sempre que muda */
	onChange?: (value: string) => void
}

export default function AdvancedSelect({ placeholder = 'Selecione uma opção...', name, selected = null, options, required = false, onChange }: AdvancedSelectProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [highlight, setHighlight] = useState(0)
	const [value, setValue] = useState<string | null>(selected)
	const containerRef = useRef<HTMLDivElement>(null)

	const filtered = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))

	useEffect(() => {
		setValue(selected)
	}, [selected])

	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			if (!containerRef.current?.contains(e.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', onClickOutside)
		return () => document.removeEventListener('mousedown', onClickOutside)
	}, [])

	const toggle = () => setIsOpen((o) => !o)

	const selectOption = (opt: SelectOption) => {
		if (opt.disabled) return
		setValue(opt.value)
		onChange?.(opt.value)
		setIsOpen(false)
		setSearch('')
		setHighlight(0)
	}

	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (!isOpen) return
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setHighlight((h) => Math.min(h + 1, filtered.length - 1))
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault()
			setHighlight((h) => Math.max(h - 1, 0))
		}
		if (e.key === 'Enter') {
			e.preventDefault()
			selectOption(filtered[highlight])
		}
		if (e.key === 'Escape') {
			e.preventDefault()
			setIsOpen(false)
		}
	}

	const selectedLabel = options.find((opt) => opt.value === value)?.label || ''

	return (
		<div ref={containerRef} className='relative w-full' onKeyDown={onKeyDown}>
			{/* Toggle */}
			<button
				type='button'
				onClick={toggle}
				aria-haspopup='listbox'
				aria-expanded={isOpen}
				className={`
          relative w-full cursor-pointer rounded-lg border bg-white pl-4 pr-10 py-3 text-left text-base text-zinc-700
          transition focus:outline-none focus:ring-2 focus:ring-blue-500
          ${isOpen ? 'border-blue-300' : 'border-zinc-200'}
          dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:focus:ring-zinc-600
        `}
			>
				<span className='block w-full truncate'>{value ? selectedLabel : <span className='text-zinc-400'>{placeholder}</span>}</span>
				<span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400 dark:text-zinc-500'>
					<svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
					</svg>
				</span>
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div className='absolute z-50 mt-1 max-h-60 w-full overflow-hidden overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900'>
					{/* Search input */}
					<div className='px-3 py-2'>
						<input
							type='text'
							value={search}
							onChange={(e) => {
								setSearch(e.target.value)
								setHighlight(0)
							}}
							className='block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
							placeholder='Buscar...'
							autoFocus
						/>
					</div>
					<ul role='listbox' className='max-h-48 overflow-y-auto'>
						{filtered.length > 0 ? (
							filtered.map((opt, idx) => (
								<li
									key={opt.value}
									role='option'
									aria-selected={value === opt.value}
									onClick={() => selectOption(opt)}
									onMouseEnter={() => setHighlight(idx)}
									className={`
                    flex cursor-pointer items-center justify-between px-4 py-2 text-base transition
                    ${idx === highlight ? 'bg-blue-100 dark:bg-zinc-700' : ''}
                    ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
								>
									<span className={`${opt.disabled ? '' : 'hover:text-blue-600'}`}>{opt.label}</span>
									{value === opt.value && (
										<svg className='w-4 h-4 text-blue-600 dark:text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
										</svg>
									)}
								</li>
							))
						) : (
							<li className='px-4 py-2 text-base text-zinc-500'>Nenhuma opção</li>
						)}
					</ul>
				</div>
			)}

			{/* Input real para formulários */}
			<input type='hidden' name={name} value={value || ''} />
		</div>
	)
}
