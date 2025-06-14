'use client'

import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
import Dialog from '@/components/ui/Dialog'

export interface TreeNode {
	id: string
	name: string
	icon?: string | null
	children?: TreeNode[]
	data?: any
}

interface TreeViewProps {
	nodes: TreeNode[]
	defaultExpanded?: boolean
}

interface TreeItemProps {
	node: TreeNode
	depth: number
	isLast: boolean
	parentLines: boolean[]
	onLeafClick: (node: TreeNode) => void
	defaultExpanded?: boolean
}

export default function TreeView({ nodes, defaultExpanded = false }: TreeViewProps) {
	const [dialogNode, setDialogNode] = useState<TreeNode | null>(null)

	return (
		<>
			<div className='flex flex-col gap-1 text-sm'>
				{nodes.map((node, index) => (
					<TreeItem key={node.id} node={node} depth={0} isLast={index === nodes.length - 1} parentLines={[]} onLeafClick={setDialogNode} defaultExpanded={defaultExpanded} />
				))}
			</div>

			<Dialog open={!!dialogNode} onClose={() => setDialogNode(null)} title={dialogNode?.name} description='Descrição da dependência'>
				<div className='space-y-4'>
					{dialogNode?.data?.description ? (
						<div className='text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed'>{dialogNode.data.description}</div>
					) : (
						<div className='flex flex-col items-center justify-center py-12 px-6'>
							<div className='size-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4'>
								<span className='icon-[lucide--file-text] size-8 text-zinc-400 dark:text-zinc-500' />
							</div>
							<h4 className='text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2'>Descrição não disponível</h4>
							<p className='text-xs text-zinc-500 dark:text-zinc-500 text-center leading-relaxed max-w-xs'>Esta dependência ainda não possui uma descrição detalhada. Você pode adicionar uma através do gerenciador de dependências.</p>
						</div>
					)}
				</div>
			</Dialog>
		</>
	)
}

function TreeItem({ node, depth, isLast, parentLines, onLeafClick, defaultExpanded = false }: TreeItemProps) {
	const [expanded, setExpanded] = useState(defaultExpanded)
	const hasChildren = !!node.children && node.children.length > 0

	const handleClick = () => {
		if (!hasChildren) {
			onLeafClick(node)
		} else {
			setExpanded(!expanded)
		}
	}

	return (
		<div>
			<div className='flex items-center py-1'>
				{/* Renderizar linhas verticais dos níveis pais */}
				{parentLines.map((showLine, index) => (
					<div key={index} className='relative w-6 flex-shrink-0'>
						{showLine && <div className='absolute left-2 top-0 bottom-0 w-0.5 bg-border' />}
					</div>
				))}

				{/* Conector do nível atual (├ ou └) */}
				{depth > 0 && (
					<div className='relative w-2 flex-shrink-0'>
						{/* Linha vertical contínua para itens não-últimos */}
						{!isLast && <div className='absolute left-2 top-0 bottom-0 w-0.5' />}
						{/* Linha vertical apenas até o meio para o último item */}
						{isLast && <div className='absolute left-2 top-0 w-0.5 h-1/2' />}
						{/* Linha horizontal do conector */}
						<div className='absolute left-2 top-1/2 w-4 h-0.5 -translate-y-0.5' />
					</div>
				)}

				{/* Botão de expandir/recolher ou espaçamento equivalente */}
				<div className='flex-shrink-0 mr-2 size-6 flex items-center justify-center'>
					{hasChildren ? (
						<button onClick={() => setExpanded(!expanded)} className='size-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full hover:bg-muted transition-colors' aria-label={expanded ? 'Recolher' : 'Expandir'}>
							<span className={`size-3 ${expanded ? 'icon-[lucide--minus]' : 'icon-[lucide--plus]'}`} />
						</button>
					) : (
						// Espaçamento equivalente ao botão para manter alinhamento
						<div className='size-6 flex items-center justify-end text-gray-400'>
							<span className='size-3 icon-[lucide--corner-down-right] mr-1'></span>
						</div>
					)}
				</div>

				{/* Nome do nó */}
				<div onClick={handleClick} className={clsx(twMerge('flex items-center cursor-pointer select-none font-medium text-base', !hasChildren && 'text-primary font-normal text-sm'))}>
					{/* Ícone do nó */}
					{node.icon && (
						<div className='flex items-center justify-center flex-shrink-0 size-5'>
							<span className={`size-4 flex-shrink-0 mr-2 ${node.icon}`} />
						</div>
					)}
					{node.name}
				</div>
			</div>

			{/* Renderizar filhos quando expandido */}
			{hasChildren && expanded && (
				<div>
					{node.children!.map((child, index) => (
						<TreeItem key={child.id} node={child} depth={depth + 1} isLast={index === node.children!.length - 1} parentLines={[...parentLines, !isLast]} onLeafClick={onLeafClick} defaultExpanded={defaultExpanded} />
					))}
				</div>
			)}
		</div>
	)
}
