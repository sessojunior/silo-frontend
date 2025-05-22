'use client'

import { useState, useRef, useEffect, type ReactNode, type HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

// Define os possíveis valores para a posição do popover
type Position = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'right-bottom' | 'left-bottom'

// Props do componente Popover, que além de children e content,
// aceita uma posição opcional e outras props de botão HTML
type PopoverProps = {
	children: ReactNode // O conteúdo que será o "gatilho" (botão)
	content: ReactNode // O conteúdo que aparecerá dentro do popover
	position?: Position // Posição onde o popover será exibido (padrão: top-center)
	className?: string // Classes CSS adicionais para estilizar o popover
} & HTMLAttributes<HTMLButtonElement> // Permite passar outras props válidas para um botão

// Mapeamento das posições para classes Tailwind que posicionam o popover
const positionMap: Record<Position, string> = {
	'top-left': 'bottom-full left-0 mb-2', // Acima e alinhado à esquerda do botão
	'top-right': 'bottom-full right-0 mb-2', // Acima e alinhado à direita do botão
	'top-center': 'bottom-full left-1/2 -translate-x-1/2 mb-2', // Acima e centralizado horizontalmente
	'bottom-left': 'top-full left-0 mt-2', // Abaixo e alinhado à esquerda
	'bottom-right': 'top-full right-0 mt-2', // Abaixo e alinhado à direita
	'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-2', // Abaixo e centralizado
	'right-bottom': 'left-full top-full ml-2', // À direita e alinhado à base do botão
	'left-bottom': 'right-full top-full mr-2', // À esquerda e alinhado à base do botão
}

// Componente Popover principal
export default function Popover({
	children,
	content,
	position = 'top-center', // Posição padrão é 'top-center'
	className,
	...props
}: PopoverProps) {
	// Estado para controlar se o popover está aberto ou fechado
	const [open, setOpen] = useState(false)

	// Referência ao botão que aciona o popover
	const buttonRef = useRef<HTMLButtonElement>(null)

	// Referência ao container do popover (conteúdo exibido)
	const popoverRef = useRef<HTMLDivElement>(null)

	// Efeito para detectar cliques fora do botão e do popover e fechar o popover nesses casos
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			// Verifica se o clique foi fora do botão e do popover
			if (buttonRef.current && !buttonRef.current.contains(e.target as Node) && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
				setOpen(false) // Fecha o popover
			}
		}

		// Adiciona o event listener para detectar clique fora
		document.addEventListener('mousedown', handleClickOutside)

		// Remove o listener quando o componente desmontar para evitar vazamento de memória
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		// Container relativo para que o popover possa ser posicionado de forma absoluta em relação a este container
		<div className='relative inline-block'>
			{/* Botão que aciona o popover */}
			<button
				ref={buttonRef}
				onClick={() => setOpen((prev) => !prev)} // Alterna estado aberto/fechado ao clicar
				className='focus:outline-none' // Remove o outline padrão ao focar
				{...props} // Passa outras props para o botão (ex: aria-label, id, etc)
			>
				{children} {/* Conteúdo do botão, geralmente um ícone ou texto */}
			</button>

			{/* Renderiza o popover somente se estiver aberto */}
			{open && (
				<div
					ref={popoverRef}
					// Combina classes do Tailwind para estilizar o popover,
					// inclui posição dinâmica e classes adicionais passadas por props
					className={twMerge(clsx('absolute z-50 rounded-xl border bg-white shadow-md transition-opacity dark:bg-zinc-800', 'border-zinc-200 dark:border-zinc-700', positionMap[position], className))}
				>
					{/* Conteúdo que aparecerá dentro do popover */}
					{content}
				</div>
			)}
		</div>
	)
}
