'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Define a interface de props para o componente Label, extendendo as propriedades padrão de um <label> HTML
// Adiciona a propriedade opcional 'isInvalid' para indicar se o campo relacionado está inválido
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	isInvalid?: boolean
}

// Componente Label customizado para renderizar uma tag <label> com estilos dinâmicos
export default function Label({ children, isInvalid, className, ...props }: LabelProps) {
	// Combina as classes padrão do label com classes condicionais dependendo da validade
	// clsx monta a lista de classes incluindo 'text-red-500' caso isInvalid seja true
	// twMerge resolve conflitos e mescla classes Tailwind, evitando duplicidade
	const mergedClassName = twMerge(
		clsx(
			'mb-2 flex items-center font-semibold', // Classes base: margem inferior, flex container para alinhamento, fonte em negrito
			isInvalid && 'text-red-500', // Se inválido, adiciona texto em vermelho
			className, // Classes adicionais passadas via props (podem sobrescrever as anteriores)
		),
	)

	return (
		// Renderiza o elemento <label> com as classes combinadas e outras props HTML recebidas
		// O conteúdo filho passado entre as tags <Label> será exibido aqui
		<label className={mergedClassName} {...props}>
			{children}
		</label>
	)
}
