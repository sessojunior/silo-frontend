'use client'

import { useState, useEffect, HTMLAttributes } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Definição do tipo para cada item da árvore
export type TreeItemProps = {
	label: string // texto exibido no item
	url?: string // link para navegação (opcional)
	icon?: string // classe do ícone para exibir junto do texto (opcional)
	children?: TreeItemProps[] // filhos do item (itens aninhados)
}

// Props do componente Tree, que renderiza um item da árvore e seus filhos (recursivamente)
export type TreeProps = {
	item: TreeItemProps // item atual a ser renderizado
	level?: number // nível do item na árvore (0 para raiz)
	defaultOpen?: boolean // se o item com filhos deve estar aberto inicialmente
	activeUrl?: string // url ativa para destacar o item atual
	linkProps?: React.AnchorHTMLAttributes<HTMLAnchorElement> // props adicionais para o link, se houver
} & HTMLAttributes<HTMLDivElement> // permite receber props padrão para a div

export default function Tree({ item, level = 0, defaultOpen = true, activeUrl, linkProps, ...props }: TreeProps) {
	// Verifica se o item possui filhos
	const hasChildren = !!item.children?.length

	// Estado local para controlar se o item com filhos está aberto ou fechado
	const [isOpen, setIsOpen] = useState(defaultOpen)

	// Verifica se o item é o ativo, comparando sua url com a url ativa passada por props
	const isActive = item.url && item.url === activeUrl

	// Verifica se o item possui filhos que são folhas (sem filhos)
	const hasLeafChildren = item.children?.some((child) => !child.children?.length) ?? false

	// Calcula a margem à esquerda (indentação) do item com base no nível
	// Limita a margem para no máximo ml-12
	const indent = Math.min(level * 2, 12)
	const indentClass = `ml-${indent}`

	// Se a url ativa estiver em algum filho deste item, abre automaticamente
	useEffect(() => {
		if (hasChildren && item.children?.some((child) => child.url === activeUrl)) {
			setIsOpen(true)
		}
	}, [activeUrl, item.children, hasChildren])

	// Caso seja um item folha (sem filhos), renderiza como um Link simples
	if (!hasChildren) {
		// Combina classes para o link, incluindo destaque se for ativo
		const linkClass = twMerge(
			clsx('my-0.5 flex cursor-pointer items-center gap-x-2 rounded-md px-2 py-1 text-sm transition hover:bg-zinc-100', indentClass, {
				'bg-zinc-200 text-zinc-900 font-semibold': isActive,
				'text-zinc-700': !isActive,
			}),
		)

		return (
			<Link href={item.url ?? '#'} className={linkClass} {...linkProps}>
				{/* Ícone, se definido */}
				{item.icon && <span className={clsx(item.icon, 'block size-4 text-zinc-500')} />}
				{/* Texto do item */}
				<span>{item.label}</span>
			</Link>
		)
	}

	// Caso tenha filhos, renderiza o item com possibilidade de expandir/contrair (recursivo)
	return (
		<div className='w-full py-0.5' {...props}>
			{/* Cabeçalho clicável que abre ou fecha os filhos */}
			<div onClick={() => setIsOpen((prev) => !prev)} className={twMerge(clsx('group flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1 transition hover:bg-zinc-100', indentClass))}>
				{/* Ícone de expandir/contrair (sinal de + ou -) */}
				<div className='flex size-6 items-center justify-center'>{isOpen ? <span className='icon-[lucide--minus] size-4 text-zinc-800' /> : <span className='icon-[lucide--plus] size-4 text-zinc-800' />}</div>

				{/* Label com ícone do item */}
				<div className='flex grow items-center gap-x-2 overflow-hidden'>
					{/* Ícone, se houver */}
					{item.icon && <span className={clsx(item.icon, 'block size-4 text-zinc-500')} />}
					{/* Texto truncado para não quebrar layout */}
					<span className='truncate text-sm font-medium text-zinc-800'>{item.label}</span>
				</div>

				{/* Badge com quantidade de filhos folhas, se houver */}
				{hasLeafChildren && <span className='inline-flex items-center gap-x-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-400'>{item.children?.length}</span>}
			</div>

			{/* Renderiza recursivamente os filhos quando aberto */}
			{isOpen && (
				<div className='ml-4 border-l border-zinc-100'>
					{item.children?.map((child, index) => (
						<Tree
							key={index}
							item={child}
							level={level + 1} // aumenta o nível para indentação dos filhos
							defaultOpen={defaultOpen}
							activeUrl={activeUrl}
						/>
					))}
				</div>
			)}
		</div>
	)
}
