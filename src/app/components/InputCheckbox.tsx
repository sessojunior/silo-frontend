'use client'

import { InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

// Define os tipos das props do componente InputCheckbox
type InputCheckboxProps = {
	id: string // ID único para o input, usado também no label para acessibilidade
	name: string // Nome do input, importante para formulários
	label: string // Texto que será exibido ao lado do checkbox
	className?: string // Classe(s) adicionais opcionais para customização do input
} & InputHTMLAttributes<HTMLInputElement> // Permite passar todas as props padrão de um input checkbox HTML

export default function InputCheckbox({ id, name, label, className, ...props }: InputCheckboxProps) {
	return (
		// Label engloba o input para aumentar a área clicável e melhorar acessibilidade
		// htmlFor vincula o label ao input pelo ID
		<label htmlFor={id} className='flex items-center cursor-pointer select-none'>
			{/* Input checkbox configurado com id, name e tipo 'checkbox' */}
			{/* A classe é montada usando clsx e twMerge para combinar e resolver conflitos */}
			{/* Estilização inclui borda, cores no modo claro e escuro, foco e checked */}
			<input
				id={id}
				name={name}
				type='checkbox'
				className={twMerge(
					clsx(
						'shrink-0 rounded-sm border-zinc-300 text-blue-600 focus:ring-blue-500',
						'dark:border-zinc-600 dark:bg-zinc-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:ring-offset-zinc-800',
						className, // permite adicionar classes extras vindas de props
					),
				)}
				{...props} // permite passar outras props padrão como checked, onChange, disabled etc
			/>
			{/* Span ao lado do checkbox que exibe o label com espaçamento (margin start 2) e cores ajustadas para tema claro e escuro */}
			<span className='ms-2 text-sm text-zinc-500 dark:text-zinc-400'>{label}</span>
		</label>
	)
}
