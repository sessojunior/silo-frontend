'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Define as props do componente InputPassword
// Extende as props padrão de um input HTML, exceto 'value', 'onChange' e 'type', que são controlados manualmente
interface InputPasswordProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
	ref?: React.RefObject<HTMLInputElement | null> // Ref opcional para o input
	value: string // Valor controlado do input
	setValue: (value: string) => void // Função para atualizar o valor do input
	isInvalid?: boolean // Flag para indicar se o input está inválido (para estilização)
	invalidMessage?: string // Mensagem de erro exibida se inválido
}

export default function InputPassword({ ref, value, setValue, isInvalid = false, invalidMessage, className, ...rest }: InputPasswordProps) {
	// Estado local para controlar se a senha está visível ou oculta
	const [showPassword, setShowPassword] = useState(false)

	// Função para alternar a visibilidade da senha ao clicar no botão
	function togglePasswordVisibility() {
		setShowPassword((prev) => !prev)
	}

	// Classes do input são mescladas e condicionais para temas claro/escuro e estado inválido
	const inputClasses = twMerge(
		clsx(
			'block w-full rounded-lg py-3 ps-4 pe-10 border disabled:pointer-events-none disabled:opacity-50', // base
			'border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500 dark:focus:ring-zinc-600', // tema escuro
			isInvalid
				? 'border-red-400 focus:border-red-400 focus:ring-red-600 dark:border-red-800 dark:focus:border-red-800 dark:focus:ring-red-800' // estilo para erro
				: 'focus:border-blue-500 focus:ring-blue-500', // estilo normal com foco azul
			className, // classes extras vindas de props
		),
	)

	// Classes do botão que alterna visibilidade, com posicionamento absoluto dentro do input e estilos condicionais para erro e foco
	const buttonClasses = twMerge(
		clsx(
			'absolute inset-y-0 end-0 z-20 flex items-center pe-4 text-zinc-400 focus:outline-none rounded-e-md', // posicionamento e estilo base
			isInvalid ? 'focus:text-red-400 dark:focus:text-red-600' : 'focus:text-blue-400 dark:focus:text-blue-600', // cor no foco (erro ou normal)
		),
	)

	return (
		<>
			{/* Container relativo para posicionar botão sobre input */}
			<div className='relative'>
				{/* Input do tipo password ou texto dependendo do estado showPassword */}
				{/* Controlado externamente pelo valor e setValue */}
				<input
					ref={ref}
					type={showPassword ? 'text' : 'password'}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					className={inputClasses}
					{...rest} // outras props padrão do input (placeholder, disabled, etc)
				/>

				{/* Botão para alternar visibilidade da senha */}
				{/* aria-label para acessibilidade */}
				<button type='button' onClick={togglePasswordVisibility} className={buttonClasses} aria-label='Exibir ou ocultar senha'>
					{/* Ícone muda conforme o estado de visibilidade */}
					{showPassword ? <span className='icon-[lucide--eye-off] size-5' /> : <span className='icon-[lucide--eye] size-5' />}
				</button>
			</div>

			{/* Se o campo estiver inválido, mostra a mensagem de erro abaixo */}
			{isInvalid && <Message>{invalidMessage}</Message>}
		</>
	)
}

// Componente auxiliar para exibir mensagem de erro estilizada
function Message({ children }: { children: React.ReactNode }) {
	return <p className='mt-2 text-xs text-red-500 dark:text-red-600'>{children}</p>
}
