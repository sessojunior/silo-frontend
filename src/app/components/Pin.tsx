import { useRef, useState, useEffect } from 'react'

interface PinProps {
	id: string
	name: string
	placeholder?: string
	value?: string
	length: number
	isInvalid?: boolean
	invalidMessage?: string
	setValue?: (value: string) => void
}

export default function Pin({ id, name, value = '', setValue, length, isInvalid = false, invalidMessage = '' }: PinProps) {
	const [values, setValues] = useState<string[]>(Array.from({ length }, (_, i) => value[i] || ''))

	const inputRefs = useRef<(HTMLInputElement | null)[]>([])

	// Atualiza o valor externo quando muda internamente
	useEffect(() => {
		const joined = values.join('')
		setValue?.(joined)
	}, [values, setValue])

	const handleChange = (index: number, val: string) => {
		if (!/^[0-9a-zA-Z]?$/.test(val)) return // apenas 1 caractere alfanumérico
		const newValues = [...values]
		newValues[index] = val.toUpperCase()
		setValues(newValues)

		// Foco no próximo
		if (val && index < length - 1) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !values[index] && index > 0) {
			const prev = inputRefs.current[index - 1]
			setValues((prevValues) => {
				const newValues = [...prevValues]
				newValues[index - 1] = ''
				return newValues
			})
			prev?.focus()
		} else if (e.key === 'ArrowLeft' && index > 0) {
			inputRefs.current[index - 1]?.focus()
		} else if (e.key === 'ArrowRight' && index < length - 1) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	return (
		<>
			<div id={id} className='flex justify-between gap-x-3'>
				{Array.from({ length }).map((_, index) => (
					<input
						key={index}
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
						onChange={(e) => handleChange(index, e.target.value)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						className={`block w-12 rounded-md p-3 text-center text-lg uppercase 
              border ${isInvalid ? 'border-red-400' : 'border-zinc-200'} 
              focus:outline-none focus:ring-2 ${isInvalid ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
              dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500 dark:focus:ring-zinc-600`}
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
