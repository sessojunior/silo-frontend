import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { InputHTMLAttributes } from 'react'

// Definição das props do componente Switch, extendendo as props de um input checkbox,
// exceto 'size' e 'onChange' para customização própria.
interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
	id: string // ID do input para associação com o label
	name: string // Nome do input para envio em formulários
	checked?: boolean // Estado do switch (ligado/desligado)
	onChange?: (value: boolean) => void // Callback quando o switch é alterado, recebendo novo estado booleano
	size?: 'lg' | 'md' | 'sm' | 'xs' // Tamanho do switch
	title?: string // Título exibido acima do switch
	description?: string // Descrição exibida abaixo do título
	isInvalid?: boolean // Flag que indica se o input está em estado inválido (erro)
	invalidMessage?: string // Mensagem de erro a ser exibida quando isInvalid for true
}

// Mapeamento dos estilos CSS específicos para cada tamanho do switch
const sizeClasses = {
	lg: {
		container: 'h-8 w-15', // Altura e largura do container do switch
		thumb: 'size-7', // Tamanho do "thumb" (círculo deslizante)
	},
	md: {
		container: 'h-7 w-13',
		thumb: 'size-6',
	},
	sm: {
		container: 'h-6 w-11',
		thumb: 'size-5',
	},
	xs: {
		container: 'h-5 w-9',
		thumb: 'size-4',
	},
}

// Componente Switch controlado
export default function Switch({
	id,
	name,
	checked = false, // Valor padrão: desligado
	onChange,
	size = 'md', // Tamanho padrão: médio
	title,
	description,
	isInvalid,
	invalidMessage,
	...props // Restante das props que podem ser passadas para o input checkbox
}: SwitchProps) {
	// Seleciona as classes CSS apropriadas para o tamanho escolhido
	const selectedSize = sizeClasses[size]

	return (
		<div className='w-full space-y-2'>
			{/* Container que agrupa título/descrição e o toggle */}
			<div className='flex items-center justify-between gap-3'>
				{/* Label para título e descrição, clicável para ativar o input */}
				<label htmlFor={id} className='flex-1'>
					{/* Renderiza o título se existir */}
					{title && <h3 className='text-lg font-bold tracking-tight text-zinc-600 dark:text-zinc-200'>{title}</h3>}
					{/* Renderiza a descrição se existir */}
					{description && <p className='mt-1 text-base text-zinc-400 dark:text-zinc-600'>{description}</p>}
				</label>

				{/* Label que contém o input checkbox e os elementos visuais do switch */}
				<label htmlFor={id} className={twMerge(clsx('relative inline-block shrink-0 cursor-pointer', selectedSize.container))}>
					{/* Input checkbox real, mas oculto da tela */}
					<input
						id={id}
						name={name}
						type='checkbox'
						checked={checked}
						// Quando o usuário muda o estado do checkbox, chama onChange passando o valor booleano atual
						onChange={(e) => onChange?.(e.target.checked)}
						className='peer sr-only' // "peer" para controlar elementos irmãos, "sr-only" para acessibilidade (somente leitores de tela)
						{...props}
					/>

					{/* Barra de fundo do switch (track) */}
					<span
						className={twMerge(
							'absolute inset-0 rounded-full transition-colors duration-200 ease-in-out',
							// Cor padrão e cor quando está "checked" usando a classe peer-checked
							'bg-gray-200 peer-checked:bg-blue-600 peer-disabled:pointer-events-none peer-disabled:opacity-50',
							// Versão dark mode
							'dark:bg-neutral-700 dark:peer-checked:bg-blue-500',
						)}
					/>

					{/* Círculo deslizante (thumb) */}
					<span
						className={twMerge(
							clsx(
								// Posicionamento inicial do thumb e animação de transição para movimentação
								'absolute start-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out',
								// Quando estiver selecionado (checked), move o thumb para o lado oposto (direita)
								'peer-checked:translate-x-full',
								// Estilos no modo escuro
								'dark:bg-neutral-400 dark:peer-checked:bg-white',
								// Define o tamanho do thumb conforme o selecionado
								selectedSize.thumb,
							),
						)}
					/>
				</label>
			</div>

			{/* Exibe mensagem de erro caso o switch esteja inválido e tenha mensagem */}
			{isInvalid && invalidMessage && <p className='mt-2 text-xs text-red-500 dark:text-red-600'>{invalidMessage}</p>}
		</div>
	)
}
