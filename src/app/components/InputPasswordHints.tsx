'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Definição das props do componente, herdando quase todas as props de input HTML,
// exceto 'type' e 'onChange' (pois são controlados internamente)
// Recebe value e setValue para controlar o valor da senha externamente,
// além de props para controle de validação e aparência.
type InputPasswordHintsProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
	value: string
	setValue: (value: string) => void
	isInvalid?: boolean
	invalidMessage?: string
	ref?: React.Ref<HTMLInputElement>
	minLength?: number
}

export default function InputPasswordHints({ value, setValue, isInvalid = false, invalidMessage, ref, minLength = 2, className, autoFocus = false, placeholder, autoComplete, required, maxLength = 255, id, name, ...props }: InputPasswordHintsProps) {
	// Estado para controlar se a senha está visível (input type text) ou oculta (password)
	const [showPassword, setShowPassword] = useState(false)

	// Estado para a força da senha, valor de 0 a 5 conforme regras atendidas
	const [strength, setStrength] = useState(0)

	// Estado para controle das regras de senha e se foram cumpridas
	const [rules, setRules] = useState({
		minLength: false,
		lowercase: false,
		uppercase: false,
		numbers: false,
		specialChars: false,
	})

	// Hook para atualizar as regras e força da senha sempre que o valor muda
	useEffect(() => {
		// Verificações das regras da senha com regex e tamanho mínimo
		const minLengthCheck = value.length >= minLength
		const lowercaseCheck = /[a-z]/.test(value)
		const uppercaseCheck = /[A-Z]/.test(value)
		const numberCheck = /[0-9]/.test(value)
		const specialCharCheck = /[^A-Za-z0-9]/.test(value)

		// Lista das verificações para contar quantas regras foram atendidas
		const checks = [minLengthCheck, lowercaseCheck, uppercaseCheck, numberCheck, specialCharCheck]

		// Contar quantas regras foram cumpridas
		const passed = checks.filter(Boolean).length

		// Atualizar estado das regras individuais
		setRules({
			minLength: minLengthCheck,
			lowercase: lowercaseCheck,
			uppercase: uppercaseCheck,
			numbers: numberCheck,
			specialChars: specialCharCheck,
		})

		// Atualizar a força da senha conforme número de regras cumpridas
		setStrength(passed)
	}, [value, minLength]) // Executa sempre que o valor ou minLength mudam

	// Labels para mostrar o texto da força da senha
	const strengthLabels = ['Nenhuma', 'Fraca', 'Média', 'Boa', 'Forte', 'Excelente']

	// Cores da barra de força, do mais fraco para mais forte
	const barColors = ['bg-zinc-300', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-teal-500']

	// Função que alterna o estado de visibilidade da senha
	function togglePasswordVisibility() {
		setShowPassword((prev) => !prev)
	}

	return (
		<>
			{/* Container principal com flex para layout */}
			<div className='flex'>
				<div className='flex-1'>
					{/* Campo de input da senha */}
					<div className='relative'>
						{/* Input controlado: recebe value e onChange para atualizar valor */}
						<input
							ref={ref}
							id={id}
							name={name}
							type={showPassword ? 'text' : 'password'} // alterna entre texto e senha
							placeholder={placeholder}
							autoComplete={autoComplete}
							maxLength={maxLength}
							required={required}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							autoFocus={autoFocus}
							className={twMerge(
								clsx(
									// Estilos base do input
									'block rounded-lg py-3 ps-4 pe-10 disabled:pointer-events-none disabled:opacity-50 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 dark:focus:ring-zinc-600',
									// Estilos de erro (borda vermelha) caso isInvalid seja true
									isInvalid ? 'border-red-600 focus:border-red-600 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500',
									className ?? 'w-full',
								),
							)}
							{...props}
						/>

						{/* Botão para alternar visibilidade da senha */}
						<button
							type='button'
							onClick={togglePasswordVisibility}
							aria-label='Exibir ou ocultar senha'
							className={twMerge(
								clsx(
									// Estilos do botão posicionados dentro do input
									'absolute inset-y-0 end-0 z-20 flex cursor-pointer items-center rounded-e-md pe-4 text-zinc-400 focus:outline-none dark:text-zinc-400',
									// Cor do texto do botão dependendo de erro ou foco
									isInvalid ? 'focus:text-red-400 dark:focus:text-red-600' : 'focus:text-blue-400 dark:focus:text-blue-600',
								),
							)}
						>
							{/* Ícones que mudam conforme estado de mostrar/ocultar senha */}
							{showPassword ? <span className='icon-[lucide--eye-off] size-5' /> : <span className='icon-[lucide--eye] size-5' />}
						</button>
					</div>

					{/* Barra visual que indica a força da senha */}
					<div className='mt-2 flex h-1 overflow-hidden rounded-full'>
						{/* Cria 5 "blocos" que mudam de cor conforme força */}
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className={clsx('flex-1 mx-0.5 rounded-full transition-all duration-300', strength > i ? barColors[strength] : 'bg-zinc-300 dark:bg-zinc-700')} />
						))}
					</div>

					{/* Texto mostrando a força atual da senha em palavras */}
					<div className='mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400'>
						Força da senha: <span className='font-semibold'>{strengthLabels[strength]}</span>
					</div>

					{/* Mensagem de erro exibida se isInvalid for true */}
					{isInvalid && <Message>{invalidMessage}</Message>}
				</div>
			</div>

			{/* Lista de dicas/regras da senha */}
			<ul className='mt-4 space-y-1 text-sm text-zinc-500 dark:text-zinc-400'>
				{/* Cada regra recebe se está cumprida e a mensagem correspondente */}
				<PasswordRule checked={rules.minLength} message={`Pelo menos ${minLength} caracteres`} />
				<PasswordRule checked={rules.lowercase} message='Letra minúscula' />
				<PasswordRule checked={rules.uppercase} message='Letra maiúscula' />
				<PasswordRule checked={rules.numbers} message='Número' />
				<PasswordRule checked={rules.specialChars} message='Caractere especial' />
			</ul>
		</>
	)
}

// Componente para mostrar uma regra de senha com ícone e texto
function PasswordRule({ checked, message }: { checked: boolean; message: string }) {
	return (
		<li
			className={clsx('flex items-center gap-x-2', {
				// Cor verde se regra cumprida, cinza se não
				'text-teal-500': checked,
				'text-zinc-500': !checked,
			})}
		>
			{/* Ícone de check ou X conforme regra cumprida */}
			{checked ? <span className='icon-[lucide--check] size-4 text-teal-500' /> : <span className='icon-[lucide--x] size-4 text-zinc-400' />}
			{message}
		</li>
	)
}

// Componente para exibir mensagem de erro (ex: invalidação)
function Message({ children }: { children: React.ReactNode }) {
	return <p className='dark:text-red-600 mt-2 text-xs text-red-500'>{children}</p>
}
