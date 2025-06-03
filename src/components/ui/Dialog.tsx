import React, { useEffect, useRef } from 'react'

interface DialogProps {
	open: boolean
	onClose: () => void
	title?: React.ReactNode
	description?: string
	children?: React.ReactNode
}

// Componente de modal genérico
export default function Dialog({ open, onClose, title, description, children }: DialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null)

	// Fecha ao pressionar ESC
	useEffect(() => {
		if (!open) return
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [open, onClose])

	// Fecha ao clicar fora
	function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
		if (e.target === dialogRef.current) onClose()
	}

	if (!open) return null

	return (
		<div ref={dialogRef} className='fixed inset-0 z-50 flex items-center justify-center bg-black/40' onClick={handleOverlayClick} aria-modal='true' role='dialog' tabIndex={-1}>
			<div className='bg-white rounded-lg shadow-lg max-w-full w-[90vw] sm:w-[400px] p-6 animate-fade-in'>
				{title && <h2 className='text-lg font-semibold mb-2'>{title}</h2>}
				{description && <p className='text-gray-600 mb-4'>{description}</p>}
				<div>{children}</div>
			</div>
		</div>
	)
}
