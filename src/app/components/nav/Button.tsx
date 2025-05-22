'use client'

import Link, { LinkProps } from 'next/link'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

// Define os tipos das props do componente NavButton
// Usa Omit para retirar o href de LinkProps, pois vamos tratar ele separadamente e com mais opções
type NavButtonProps = Omit<LinkProps, 'href'> & {
	children: React.ReactNode // Conteúdo interno do botão (texto, elementos, etc)
	href?: string | null // Link para navegação, pode ser null ou undefined
	disabled?: boolean // Flag para desabilitar o botão (não clicável e visual alterado)
	icon?: string | null // Nome da classe de ícone (ex: para usar com icon fonts ou SVGs)
	active?: boolean // Flag para marcar botão como ativo (estilo diferenciado)
}

export default function NavButton({
	children,
	href = '#', // valor padrão para href, caso não seja passado
	disabled = false, // padrão: botão habilitado
	icon = null, // padrão: sem ícone
	active = false, // padrão: botão não ativo
	...props
}: NavButtonProps) {
	// Monta a classe final do botão combinando várias classes com condicional para estados
	// twMerge resolve possíveis conflitos entre classes do Tailwind
	const finalClassName = twMerge(
		clsx(
			// Classes base para estilo, layout e transição suave
			'inline-flex items-center gap-x-2 rounded-lg border px-4 py-2 text-base font-medium transition-all duration-500 focus:outline-hidden',
			// Classes aplicadas quando o botão está desabilitado
			'disabled:pointer-events-none disabled:opacity-50',
			// Classe para o modo escuro (texto claro)
			'dark:text-zinc-200',
			{
				// Quando não está desabilitado, texto escuro com hover de texto cinza
				'text-zinc-800 hover:text-zinc-500': !disabled,
				// Se ativo e não desabilitado, borda e fundo diferenciados para indicar ativo
				'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800': active && !disabled,
				// Se não ativo e habilitado, fundo transparente e borda invisível com modo escuro tratado
				'border-transparent bg-transparent dark:bg-zinc-700': !active && !disabled,
				// Se desabilitado, aplica pointer-events none e opacidade reduzida para desabilitar interatividade visualmente
				'pointer-events-none opacity-50': disabled,
			},
		),
	)

	return (
		// Renderiza um componente Link do Next.js para navegação SPA
		// Usa href ou fallback '#', passa aria-disabled para acessibilidade
		// role="button" para informar leitores de tela que é um botão (mesmo sendo link)
		// Aplica as classes calculadas e demais props (ex: onClick, id, etc)
		<Link href={href || '#'} aria-disabled={disabled} role='button' className={finalClassName} {...props}>
			{/* Renderiza o ícone, se fornecido, com classe para tamanho fixo e sem expansão */}
			{icon && <span className={clsx(icon, 'size-4 shrink-0')} aria-hidden='true' />}
			{/* Renderiza o conteúdo interno do botão */}
			{children}
		</Link>
	)
}
