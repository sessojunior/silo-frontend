'use client'

import { useRef, useState, useEffect, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx' // Usado para juntar classes condicionalmente
import { twMerge } from 'tailwind-merge' // Junta classes do Tailwind com priorização de estilos

// Props esperadas para o componente Pin
interface PinProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'name' | 'id'> {
	id: string // ID para agrupamento dos inputs
	name: string // Nome base dos inputs
	length: number // Quantidade de dígitos
	value?: string // Valor externo do código
	setValue?: (value: string) => void // Setter externo para atualizar o valor completo
	isInvalid?: boolean // Define estado de erro (validação)
	invalidMessage?: string // Mensagem de erro
	placeholder?: string
}

// Componente de input dividido para inserção de PIN, OTP ou código de verificação
export default function Pin({ id, name, value = '', setValue, length, isInvalid = false, invalidMessage = '', className, ...props }: PinProps) {
	// Estado local que armazena cada dígito separadamente
	const [values, setValues] = useState<string[]>(() => Array.from({ length }, (_, i) => value[i]?.toUpperCase() || ''))

	// Referência para os inputs, usada para controlar foco
	const inputRefs = useRef<(HTMLInputElement | null)[]>([])

	// Efeito que atualiza o valor externo sempre que os valores internos mudam
	useEffect(() => {
		const joined = values.join('')
		if (joined !== value) {
			setValue?.(joined)
		}
	}, [values, value, setValue])

	// Refs para armazenar o valor anterior (usado para sincronizar quando valor externo muda)
	const prevValueRef = useRef(value)
	const prevValuesRef = useRef(values)

	// Efeito para sincronizar quando valor externo for atualizado (ex: colado de fora)
	useEffect(() => {
		const incoming = Array.from({ length }, (_, i) => value[i]?.toUpperCase() || '')
		const current = prevValuesRef.current.join('')
		const next = incoming.join('')

		// Atualiza valores locais apenas se todos os dígitos forem preenchidos
		if (value.length === length && current !== next) {
			setValues(incoming)
		}

		prevValueRef.current = value
		prevValuesRef.current = values
	}, [value, length, values])

	// Manipula alterações de um único campo
	const handleChange = (index: number, val: string) => {
		// Ignora caracteres não alfanuméricos
		if (!/^[0-9a-zA-Z]?$/.test(val)) return
		const upperVal = val.toUpperCase()

		// Atualiza o valor da posição atual
		setValues((prev) => {
			const next = [...prev]
			next[index] = upperVal
			return next
		})

		// Move o foco para o próximo campo se o valor foi preenchido
		if (val && index < length - 1) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	// Manipula eventos de teclado como Backspace e setas
	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		switch (e.key) {
			case 'Backspace':
				if (!values[index] && index > 0) {
					// Limpa campo anterior se o atual estiver vazio e volta o foco
					inputRefs.current[index - 1]?.focus()
					setValues((prev) => {
						const next = [...prev]
						next[index - 1] = ''
						return next
					})
					e.preventDefault()
				}
				break
			case 'ArrowLeft':
				if (index > 0) {
					inputRefs.current[index - 1]?.focus()
					e.preventDefault()
				}
				break
			case 'ArrowRight':
				if (index < length - 1) {
					inputRefs.current[index + 1]?.focus()
					e.preventDefault()
				}
				break
		}
	}

	// Manipula o evento de colar (clipboard)
	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		const paste = e.clipboardData.getData('text')
		if (!paste) return

		// Limpa caracteres inválidos e limita ao número de campos
		const sanitized = paste
			.slice(0, length)
			.toUpperCase()
			.replace(/[^0-9A-Z]/g, '')
		const chars = sanitized.split('')

		if (chars.length === 0) return

		// Atualiza todos os campos de uma vez com os caracteres colados
		setValues((prev) => {
			const next = [...prev]
			for (let i = 0; i < length; i++) {
				next[i] = chars[i] || ''
			}
			return next
		})

		// Move o foco para o último campo preenchido
		const lastIndex = Math.min(chars.length - 1, length - 1)
		setTimeout(() => {
			inputRefs.current[lastIndex]?.focus()
		}, 0)

		e.preventDefault()
	}

	return (
		<>
			<div id={id} className='flex justify-between gap-x-3'>
				{Array.from({ length }).map((_, index) => (
					<input
						key={index}
						{...props}
						ref={(el) => {
							inputRefs.current[index] = el
						}}
						type='text'
						inputMode='numeric'
						name={`${name}-${index}`}
						value={values[index]}
						autoComplete={index === 0 ? 'one-time-code' : 'off'}
						autoFocus={index === 0}
						maxLength={1}
						placeholder={props.placeholder ?? ''}
						onChange={(e) => handleChange(index, e.target.value)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						onPaste={handlePaste}
						className={twMerge(clsx('block w-12 rounded-md p-3 text-center text-lg uppercase border focus:outline-none focus:ring-2', isInvalid ? 'border-red-400 focus:ring-red-500' : 'border-zinc-200 focus:ring-blue-500', 'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500 dark:focus:ring-zinc-600', className))}
					/>
				))}
			</div>
			{/* Mensagem de erro exibida abaixo dos campos */}
			{isInvalid && <Message>{invalidMessage}</Message>}
		</>
	)
}

// Componente auxiliar para exibir mensagens de erro
function Message({ children }: { children: React.ReactNode }) {
	return <p className='mt-2 text-xs text-red-500 dark:text-red-600'>{children}</p>
}
