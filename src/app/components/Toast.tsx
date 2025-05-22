'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

// Definição dos tipos possíveis para o Toast
type ToastType = 'success' | 'error' | 'info' | 'warning'
// Posições possíveis onde o Toast pode aparecer na tela
type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

// Interface que define a estrutura básica de uma mensagem Toast
interface ToastMessage {
	id: number
	type: ToastType
	title: string
	description?: string
	duration: number // duração em milissegundos que o toast ficará visível
	position: ToastPosition
}

// Extensão da interface ToastMessage para incluir estado interno do componente
interface ToastWithState extends ToastMessage {
	isLeaving?: boolean // flag para indicar que o toast está na animação de saída
}

// Mapeamento das posições para classes CSS que posicionam o container fixo na tela
const positionClasses: Record<ToastPosition, string> = {
	'top-left': 'top-5 left-5',
	'top-right': 'top-5 right-5',
	'bottom-left': 'bottom-5 left-5',
	'bottom-right': 'bottom-5 right-5',
}

// Mapeamento de cores de fundo para cada tipo de toast, usando classes TailwindCSS
const toastColors: Record<ToastType, string> = {
	success: 'bg-green-600',
	error: 'bg-red-600',
	info: 'bg-blue-600',
	warning: 'bg-yellow-600',
}

// Mapeamento dos ícones que aparecem no toast para cada tipo, usando classes de ícones lucide
const toastIcons: Record<ToastType, string> = {
	success: 'icon-[lucide--check-circle]',
	error: 'icon-[lucide--x-circle]',
	info: 'icon-[lucide--info]',
	warning: 'icon-[lucide--alert-triangle]',
}

export default function ToastContainer() {
	// Estado local que guarda a lista atual de toasts ativos na tela
	const [toasts, setToasts] = useState<ToastWithState[]>([])

	// useEffect para adicionar um event listener global que escuta eventos personalizados "toast"
	useEffect(() => {
		const handler = (event: Event) => {
			const customEvent = event as CustomEvent<ToastMessage> // cast para CustomEvent
			const toast = customEvent.detail // acessa os dados do toast enviados no evento
			setToasts((prev) => [...prev, { ...toast }]) // adiciona o novo toast na lista

			// Se o toast possui duração definida, agenda sua remoção automática após esse tempo
			if (toast.duration) {
				setTimeout(() => dismiss(toast.id), toast.duration)
			}
		}

		// Adiciona o listener para o evento customizado 'toast' no window
		window.addEventListener('toast', handler)
		// Limpa o listener quando o componente for desmontado
		return () => window.removeEventListener('toast', handler)
	}, [])

	// Função que inicia o processo de remoção de um toast pelo id
	const dismiss = (id: number) => {
		// Marca o toast como "saindo" para disparar a animação de saída
		setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, isLeaving: true } : t)))

		// Após 400ms (duração da animação), remove o toast da lista efetivamente
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id))
		}, 400) // 400ms deve coincidir com a duração da animação .toast-out no CSS
	}

	return (
		<>
			{/* Renderiza um container fixo para cada posição possível */}
			{(Object.keys(positionClasses) as ToastPosition[]).map((position) => (
				<div
					key={position}
					// Aplica classes para posicionar os toasts na posição correta da tela
					className={clsx('fixed z-[1000] flex flex-col gap-3 pointer-events-none', positionClasses[position])}
				>
					{/* Filtra os toasts que pertencem a essa posição */}
					{toasts
						.filter((toast) => toast.position === position)
						.map((toast) => (
							<div
								key={toast.id}
								// Classes básicas do toast + cor de fundo + animação de entrada ou saída
								className={clsx('relative flex items-start gap-3 pointer-events-auto w-80 rounded-lg p-4 text-white shadow-md overflow-hidden', toastColors[toast.type], toast.isLeaving ? 'animate-toast-out' : 'animate-toast-in')}
								role='alert'
							>
								{/* Ícone do toast */}
								<span className={clsx(toastIcons[toast.type], 'size-5 shrink-0')} />

								{/* Conteúdo do toast: título e descrição */}
								<div className='flex-1 text-sm'>
									<strong className='block mt-px font-semibold leading-tight'>{toast.title}</strong>
									{toast.description && <p className='mt-1 text-sm opacity-90 leading-tight'>{toast.description}</p>}

									{/* Barra de progresso animada que diminui com o tempo restante do toast */}
									{toast.duration > 0 && (
										<div
											className='absolute bottom-0 left-0 h-1 bg-white/30'
											style={{
												animation: `progress-bar ${toast.duration}ms linear forwards`,
											}}
										/>
									)}
								</div>

								{/* Botão para fechar o toast manualmente */}
								<button onClick={() => dismiss(toast.id)} className='opacity-75 transition hover:opacity-100' aria-label='Fechar'>
									{/* Ícone de fechar */}
									<span className='icon-[lucide--x] size-4'></span>
								</button>
							</div>
						))}
				</div>
			))}
		</>
	)
}
