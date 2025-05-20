'use client'

import { useRef, useState, useEffect, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface PinProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'name' | 'id'> {
	id: string
	name: string
	length: number
	value?: string
	setValue?: (value: string) => void
	isInvalid?: boolean
	invalidMessage?: string
	placeholder?: string // opcional para cada input, mas normalmente não usado aqui
}

export default function Pin({ id, name, value = '', setValue, length, isInvalid = false, invalidMessage = '', className, ...props }: PinProps) {
	// Estado local para os valores individuais de cada input
	const [values, setValues] = useState<string[]>(() => Array.from({ length }, (_, i) => value[i]?.toUpperCase() || ''))

	// Referências para inputs para controlar foco
	const inputRefs = useRef<(HTMLInputElement | null)[]>([])

	// Sincroniza estado local para valor externo (string concatenada)
	useEffect(() => {
		const joined = values.join('')
		if (joined !== value) {
			setValue?.(joined)
		}
	}, [values, setValue, value])

	// Atualiza valor interno ao receber nova prop "value"
	useEffect(() => {
		if (value !== values.join('')) {
			setValues(Array.from({ length }, (_, i) => value[i]?.toUpperCase() || ''))
		}
	}, [value, length, values])

	// Handler de mudança para cada input
	const handleChange = (index: number, val: string) => {
		if (!/^[0-9a-zA-Z]?$/.test(val)) return // Apenas 1 caractere alfanumérico
		const upperVal = val.toUpperCase()
		setValues((prev) => {
			const newValues = [...prev]
			newValues[index] = upperVal
			return newValues
		})

		// Foca no próximo input se houver valor e não for o último
		if (val && index < length - 1) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	// Navegação via teclado
	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		switch (e.key) {
			case 'Backspace':
				if (!values[index] && index > 0) {
					inputRefs.current[index - 1]?.focus()
					setValues((prev) => {
						const newValues = [...prev]
						newValues[index - 1] = ''
						return newValues
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
						className={twMerge(clsx('block w-12 rounded-md p-3 text-center text-lg uppercase border focus:outline-none focus:ring-2', isInvalid ? 'border-red-400 focus:ring-red-500' : 'border-zinc-200 focus:ring-blue-500', 'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500 dark:focus:ring-zinc-600', className))}
					/>
				))}
			</div>
			{isInvalid && <Message>{invalidMessage}</Message>}
		</>
	)
}

function Message({ children }: { children: React.ReactNode }) {
	return <p className='dark:text-red-600 mt-2 text-xs text-red-500'>{children}</p>
}
