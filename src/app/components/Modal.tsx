import { useEffect, useState } from 'react'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title?: string
	children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
	const [visible, setVisible] = useState(false)
	const [shouldAnimateIn, setShouldAnimateIn] = useState(false)

	useEffect(() => {
		let openTimeout: NodeJS.Timeout
		let closeTimeout: NodeJS.Timeout

		if (isOpen) {
			setVisible(true)
			document.body.style.overflow = 'hidden'

			// Pequeno delay para aplicar a animação após o mount
			openTimeout = setTimeout(() => {
				setShouldAnimateIn(true)
			}, 10) // 10ms geralmente já basta
		} else {
			setShouldAnimateIn(false)
			closeTimeout = setTimeout(() => {
				setVisible(false)
				document.body.style.overflow = 'auto'
			}, 300) // mesmo tempo da transição
		}

		return () => {
			clearTimeout(openTimeout)
			clearTimeout(closeTimeout)
			document.body.style.overflow = 'auto'
		}
	}, [isOpen])

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		if (isOpen) window.addEventListener('keydown', handleEsc)
		return () => window.removeEventListener('keydown', handleEsc)
	}, [isOpen, onClose])

	if (!visible) return null

	return (
		<div
			tabIndex={-1}
			className={`
        fixed start-0 top-0 z-80 size-full overflow-x-hidden overflow-y-auto
        flex items-center justify-center
        transition-opacity duration-500 ease-in-out
        ${shouldAnimateIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
		>
			{/* Fundo escuro com fade */}
			<div className={`fixed inset-0 bg-black/25 transition-opacity duration-500 ${shouldAnimateIn ? 'opacity-100' : 'opacity-0'}`} />

			{/* Modal container */}
			<div
				className={`
          relative z-10 m-4 w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-sm
          dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-neutral-700/70
          transform transition-all duration-500 ease-in-out
          ${shouldAnimateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        `}
			>
				{/* Cabeçalho */}
				<div className='flex items-center justify-between border-b border-gray-200 rounded-xl bg-zinc-50 px-4 py-3 dark:border-neutral-700'>
					<div className='flex gap-3'>
						<span className='icon-[lucide--folder-git-2] size-6 shrink-0 text-zinc-400'></span>
						<h3 className='font-bold text-gray-800 dark:text-white'>{title}</h3>
					</div>
					<button onClick={onClose} aria-label='Fechar modal' className='inline-flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600 dark:focus:bg-neutral-600'>
						<span className='sr-only'>Fechar</span>
						<span className='icon-[lucide--x] size-4 shrink-0 text-zinc-400'></span>
					</button>
				</div>

				{/* Conteúdo */}
				<div className='flex flex-col divide-y divide-zinc-200'>{children}</div>

				{/* Rodapé */}
				<div className='flex items-center justify-end gap-x-2 rounded-xl border-t border-gray-200 px-4 py-3 dark:border-neutral-700 bg-zinc-50'>
					<button onClick={onClose} aria-label='Fechar modal' className='inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-2xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700'>
						Fechar
					</button>
				</div>
			</div>
		</div>
	)
}
