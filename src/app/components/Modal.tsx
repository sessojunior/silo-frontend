'use client'

import { useEffect, useState, HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Define as propriedades do componente Modal, extendendo atributos HTML de uma <div>
// isOpen controla se o modal está aberto ou fechado
// onClose é a função chamada para fechar o modal
// title é um texto opcional para o cabeçalho do modal
// children são os elementos filhos que serão renderizados dentro do modal
interface ModalProps extends HTMLAttributes<HTMLDivElement> {
	isOpen: boolean
	onClose: () => void
	title?: string
	children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children, className, ...props }: ModalProps) {
	// Estado para controlar se o modal deve estar visível (inserido no DOM)
	const [visible, setVisible] = useState(false)
	// Estado para controlar se a animação de entrada deve ocorrer (transição opacity/scale)
	const [shouldAnimateIn, setShouldAnimateIn] = useState(false)

	// useEffect para controlar abertura e fechamento do modal
	useEffect(() => {
		let openTimeout: NodeJS.Timeout
		let closeTimeout: NodeJS.Timeout

		if (isOpen) {
			// Se o modal deve abrir:
			setVisible(true) // Torna o modal visível no DOM
			document.body.style.overflow = 'hidden' // Bloqueia scroll do body para evitar scroll atrás do modal

			// Com pequeno delay, ativa a animação de entrada para suavizar a transição
			openTimeout = setTimeout(() => {
				setShouldAnimateIn(true)
			}, 10)
		} else {
			// Se o modal deve fechar:
			setShouldAnimateIn(false) // Remove a animação de entrada (começa a animação de saída)

			// Após o tempo da animação (300ms), remove o modal do DOM e desbloqueia scroll do body
			closeTimeout = setTimeout(() => {
				setVisible(false)
				document.body.style.overflow = 'auto'
			}, 300)
		}

		// Cleanup: limpa timeouts e garante que o scroll do body fique desbloqueado ao desmontar
		return () => {
			clearTimeout(openTimeout)
			clearTimeout(closeTimeout)
			document.body.style.overflow = 'auto'
		}
	}, [isOpen])

	// useEffect para fechar o modal quando o usuário pressionar a tecla Escape
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose() // Fecha o modal ao apertar Escape
		}

		if (isOpen) window.addEventListener('keydown', handleEsc) // Registra evento ao abrir modal
		return () => window.removeEventListener('keydown', handleEsc) // Remove ao fechar modal ou desmontar
	}, [isOpen, onClose])

	// Se o modal não está visível, não renderiza nada
	if (!visible) return null

	return (
		// Container principal do modal, ocupa toda a tela com flex para centralizar o conteúdo
		// Usa tailwind-merge para mesclar classes e clsx para condicionalmente adicionar classes de opacidade e pointer-events
		<div tabIndex={-1} className={twMerge(clsx('fixed inset-0 z-80 flex size-full items-center justify-center overflow-x-hidden overflow-y-auto transition-opacity duration-500 ease-in-out', shouldAnimateIn ? 'opacity-100' : 'opacity-0 pointer-events-none', className))} {...props}>
			{/* Fundo escuro translúcido atrás do modal com transição de opacidade */}
			<div className={twMerge(clsx('fixed inset-0 bg-black/25 transition-opacity duration-500', shouldAnimateIn ? 'opacity-100' : 'opacity-0'))} />

			{/* Container do conteúdo do modal */}
			<div className={twMerge(clsx('relative z-10 m-4 w-full max-w-4xl transform rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-500 ease-in-out', 'dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-neutral-700/70', shouldAnimateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-50'))}>
				{/* Cabeçalho do modal com título e botão para fechar */}
				<div className='flex items-center justify-between rounded-xl border-b border-gray-200 bg-zinc-50 px-4 py-3 dark:border-neutral-700'>
					{/* Ícone e título */}
					<div className='flex gap-3'>
						{/* Ícone de pasta (lucide) */}
						<span className='icon-[lucide--folder-git-2] size-6 shrink-0 text-zinc-400' />
						{/* Exibe o título se fornecido */}
						{title && <h3 className='font-bold text-gray-800 dark:text-white'>{title}</h3>}
					</div>
					{/* Botão para fechar o modal */}
					<button onClick={onClose} aria-label='Fechar modal' className='inline-flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600 dark:focus:bg-neutral-600'>
						<span className='sr-only'>Fechar</span>
						<span className='icon-[lucide--x] size-4 shrink-0 text-zinc-400' />
					</button>
				</div>

				{/* Conteúdo principal do modal */}
				<div className='flex flex-col divide-y divide-zinc-200 dark:divide-neutral-700'>{children}</div>

				{/* Rodapé com botão de fechar */}
				<div className='flex items-center justify-end gap-x-2 rounded-xl border-t border-gray-200 bg-zinc-50 px-4 py-3 dark:border-neutral-700'>
					<button onClick={onClose} aria-label='Fechar modal' className='inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-2xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700'>
						Fechar
					</button>
				</div>
			</div>
		</div>
	)
}
