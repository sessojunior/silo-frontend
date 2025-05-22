'use client'

import { useRef } from 'react'
import { clsx } from 'clsx' // Usado para juntar classes condicionalmente
import { twMerge } from 'tailwind-merge' // Junta classes do Tailwind com priorização de estilos

// Tipagem das props que o componente aceita
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	ref?: React.RefObject<HTMLInputElement | null> // Referência opcional externa para o input
	type: 'text' | 'email' // Tipos permitidos: texto e e-mail
	mask?: 'phone' // Máscara opcional de telefone
	value: string // Valor atual do input
	setValue: (value: string) => void // Função setter para atualizar o valor
	isInvalid?: boolean // Indica se o campo é inválido
	invalidMessage?: string // Mensagem de erro a ser exibida
}

export default function Input({ type, mask, value, setValue, isInvalid = false, invalidMessage, className, ...rest }: InputProps) {
	const inputRef = useRef<HTMLInputElement>(null) // Referência local ao elemento input

	// Função executada sempre que o valor do input muda
	function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
		const input = event.target

		// Aplica máscara de telefone se necessário
		if (mask === 'phone') {
			const cursor = input.selectionStart ?? 0 // Posição atual do cursor
			const originalLength = input.value.length // Comprimento do valor original

			const masked = phoneMask(input.value) // Aplica máscara
			setValue(masked) // Atualiza o valor com a máscara

			const diff = masked.length - originalLength // Diferença no tamanho após aplicar a máscara
			const newCursor = Math.max(0, cursor + diff) // Nova posição do cursor corrigida

			// Atualiza o cursor para manter posição correta ao digitar
			requestAnimationFrame(() => {
				input.setSelectionRange(newCursor, newCursor)
			})
		} else {
			// Se for tipo e-mail, transforma para lowercase. Senão, usa o valor puro.
			setValue(type === 'email' ? input.value.toLowerCase() : input.value)
		}
	}

	// Aplica a máscara de telefone ao valor
	function phoneMask(value: string) {
		value = value.replace(/\D/g, '') // Remove todos os caracteres não numéricos

		// Aplica diferentes formatações conforme o número de dígitos
		if (value.length > 10) {
			return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3') // (99) 99999-9999
		} else if (value.length > 6) {
			return value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3') // (99) 9999-9999
		} else if (value.length > 2) {
			return value.replace(/^(\d{2})(\d{0,5})/, '($1) $2') // (99) 99999
		} else {
			return value.replace(/^(\d*)/, '($1') // (9 ou (
		}
	}

	// Classes do input, incluindo estado de erro ou sucesso
	const inputClasses = twMerge(clsx('block w-full rounded-lg py-3 ps-4 pe-10 border disabled:pointer-events-none disabled:opacity-50', 'border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500 dark:focus:ring-zinc-600', isInvalid ? 'border-red-400 focus:border-red-400 focus:ring-red-600 dark:border-red-800 dark:focus:border-red-800 dark:focus:ring-red-800' : 'focus:border-blue-500 focus:ring-blue-500', className))

	return (
		<>
			<div className='relative'>
				{/* Input com máscara e validação visual */}
				<input ref={inputRef} type={type} value={value} onChange={handleInput} className={inputClasses} {...rest} />

				{/* Ícone de erro no canto direito do input, se inválido */}
				{isInvalid && (
					<div className='pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4'>
						<span className='icon-[lucide--triangle-alert] size-5 text-red-400 dark:text-red-900'></span>
					</div>
				)}
			</div>

			{/* Mensagem de erro abaixo do campo */}
			{isInvalid && <Message>{invalidMessage}</Message>}
		</>
	)
}

// Componente de mensagem de erro estilizado
function Message({ children }: { children: React.ReactNode }) {
	return <p className='mt-2 text-xs text-red-500 dark:text-red-600'>{children}</p>
}
