'use client'

import { useState, useRef, useEffect, KeyboardEvent, HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Interface para cada opção do select
export interface SelectOption {
	label: string // Texto que será exibido na UI
	value: string // Valor real que será usado no formulário
	disabled?: boolean // Se true, opção ficará desabilitada (não clicável)
}

// Props do componente AdvancedSelect, omitindo 'onChange' do HTMLAttributes para tipagem própria
export interface AdvancedSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	placeholder?: string // Texto exibido quando nenhuma opção está selecionada
	name: string // Nome do input hidden para enviar no formulário
	selected?: string | null // Valor selecionado inicialmente (controlado externamente)
	options: SelectOption[] // Lista de opções que o select vai mostrar
	required?: boolean // Se true, input hidden será required no formulário
	onChange?: (value: string) => void // Callback para quando uma opção for selecionada
}

// Componente AdvancedSelect funcional
export default function AdvancedSelect({ placeholder = 'Selecione uma opção...', name, selected = null, options, required = false, onChange, ...props }: AdvancedSelectProps) {
	// Estado que controla se o dropdown está aberto
	const [isOpen, setIsOpen] = useState(false)
	// Estado para o texto de busca interna
	const [search, setSearch] = useState('')
	// Índice da opção atualmente destacada para navegação via teclado
	const [highlight, setHighlight] = useState(0)
	// Valor selecionado internamente, inicializado com prop selected
	const [value, setValue] = useState<string | null>(selected)

	// Referência para o container principal, para detectar cliques fora e fechar o dropdown
	const containerRef = useRef<HTMLDivElement>(null)

	// Filtra as opções com base no texto da busca (case insensitive)
	const filtered = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))

	// Atualiza o valor selecionado quando a prop selected mudar (sincronização externa)
	useEffect(() => {
		setValue(selected)
	}, [selected])

	// Hook para fechar o dropdown quando clicar fora do componente
	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			// Se o clique NÃO estiver dentro do container, fecha o dropdown
			if (!containerRef.current?.contains(e.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', onClickOutside)
		return () => document.removeEventListener('mousedown', onClickOutside)
	}, [])

	// Alterna o estado aberto/fechado do dropdown
	const toggle = () => setIsOpen((prev) => !prev)

	// Função para selecionar uma opção (clicada ou via teclado)
	const selectOption = (opt: SelectOption) => {
		if (opt.disabled) return // Não permite selecionar opções desabilitadas
		setValue(opt.value) // Atualiza o valor selecionado
		onChange?.(opt.value) // Chama callback onChange se houver
		setIsOpen(false) // Fecha o dropdown
		setSearch('') // Reseta o campo de busca
		setHighlight(0) // Reseta destaque para a primeira opção
	}

	// Controle do teclado para navegação e seleção
	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (!isOpen) return // Ignora se o dropdown está fechado

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			// Move destaque para próxima opção (limitado ao tamanho da lista filtrada)
			setHighlight((h) => Math.min(h + 1, filtered.length - 1))
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault()
			// Move destaque para opção anterior (mínimo 0)
			setHighlight((h) => Math.max(h - 1, 0))
		}

		if (e.key === 'Enter') {
			e.preventDefault()
			// Seleciona a opção que está destacada
			selectOption(filtered[highlight])
		}

		if (e.key === 'Escape') {
			e.preventDefault()
			// Fecha o dropdown
			setIsOpen(false)
		}
	}

	// Busca o label da opção selecionada para exibir no botão
	const selectedLabel = options.find((opt) => opt.value === value)?.label || ''

	return (
		<div
			ref={containerRef}
			onKeyDown={onKeyDown} // Captura eventos de teclado para navegação
			className='relative w-full'
			{...props} // Passa props extras para o container
		>
			{/* Botão que abre/fecha o dropdown */}
			<button
				type='button'
				onClick={toggle}
				aria-haspopup='listbox' // Indica que abre uma lista de opções
				aria-expanded={isOpen} // Indica estado aberto/fechado para acessibilidade
				className={twMerge(
					clsx('relative w-full cursor-pointer rounded-lg border bg-white pl-4 pr-10 py-3 text-left text-base text-zinc-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500', 'dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:focus:ring-zinc-600', {
						'border-blue-300': isOpen, // Borda azul quando aberto
						'border-zinc-200': !isOpen, // Borda cinza quando fechado
					}),
				)}
			>
				{/* Exibe o label selecionado ou placeholder se nada selecionado */}
				<span className='block w-full truncate'>{value ? selectedLabel : <span className='text-zinc-400'>{placeholder}</span>}</span>

				{/* Ícone de seta para baixo, gira 180° quando aberto */}
				<span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400 dark:text-zinc-500'>
					<span className={twMerge('icon-[lucide--chevron-down] size-4 transition-transform duration-200 ease-in-out', isOpen && 'rotate-180')} />
				</span>
			</button>

			{/* Dropdown com opções, aparece apenas se isOpen */}
			{isOpen && (
				<div className='absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900'>
					{/* Campo de busca dentro do dropdown */}
					<div className='px-3 py-2'>
						<input
							type='text'
							value={search}
							onChange={(e) => {
								setSearch(e.target.value) // Atualiza texto de busca
								setHighlight(0) // Reseta destaque para a primeira opção filtrada
							}}
							className='block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200'
							placeholder='Buscar...'
							autoFocus // Foca automaticamente o input ao abrir o dropdown
						/>
					</div>

					{/* Lista de opções filtradas */}
					<ul role='listbox' className='max-h-48 overflow-y-auto'>
						{filtered.length > 0 ? (
							filtered.map((opt, idx) => (
								<li
									key={opt.value}
									role='option'
									aria-selected={value === opt.value} // Marca opção selecionada para acessibilidade
									onClick={() => selectOption(opt)} // Seleciona ao clicar
									onMouseEnter={() => setHighlight(idx)} // Destaca ao passar mouse
									className={twMerge(
										clsx('flex cursor-pointer items-center justify-between px-4 py-2 text-base transition', {
											'bg-blue-100 dark:bg-zinc-700': idx === highlight, // Fundo azul no destaque
											'opacity-50 cursor-not-allowed': opt.disabled, // Opções desabilitadas ficam esmaecidas e sem pointer
										}),
									)}
								>
									{/* Label da opção */}
									<span className={twMerge(clsx({ 'hover:text-blue-600': !opt.disabled }))}>{opt.label}</span>

									{/* Ícone de check para opção selecionada */}
									{value === opt.value && <span className='icon-[lucide--check] size-4 text-blue-600 dark:text-blue-500' />}
								</li>
							))
						) : (
							// Texto exibido caso nenhuma opção seja encontrada na busca
							<li className='px-4 py-2 text-base text-zinc-500'>Nenhuma opção</li>
						)}
					</ul>
				</div>
			)}

			{/* Input hidden para submissão do formulário com o valor selecionado */}
			<input type='hidden' name={name} value={value || ''} required={required} />
		</div>
	)
}
