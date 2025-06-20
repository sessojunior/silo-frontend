import TreeView, { type TreeNode } from '@/components/ui/TreeView'
import Button from '@/components/ui/Button'

// Tipos para os dados da API (copiados da página principal)
interface ProductDependency {
	id: string
	name: string
	icon?: string
	description?: string
	parentId?: string | null
	treePath?: string | null
	treeDepth: number
	sortKey?: string | null
	children?: ProductDependency[]
}

// Props que o componente recebe da página principal
interface ProductDependenciesColumnProps {
	// Dados
	dependencies: ProductDependency[]
	loading: boolean
	treeNodes: TreeNode[]

	// Handlers (callbacks para página principal)
	onOpenManagement: () => void
}

export default function ProductDependenciesColumn({ dependencies, loading, treeNodes, onOpenManagement }: ProductDependenciesColumnProps) {
	if (loading) {
		return null // A página principal já tem o loading geral
	}

	return (
		<div className='flex md:w-[380px] flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-700'>
			<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
				{/* TreeView */}
				<div className='p-6' role='tree' aria-orientation='vertical'>
					{/* Header */}
					<div className='flex w-full items-center justify-between gap-2 mb-6'>
						<div>
							<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>Dependências</h3>
							<p className='text-sm text-zinc-500 dark:text-zinc-400'>
								{dependencies.length} {dependencies.length === 1 ? 'categoria' : 'categorias'}
							</p>
						</div>
						<Button type='button' icon='icon-[lucide--folder-tree]' style='unstyled' className='py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800' onClick={onOpenManagement} title='Gerenciar dependências'>
							Gerenciar dep.
						</Button>
					</div>

					{/* TreeView Items */}
					{treeNodes.length > 0 ? (
						<TreeView nodes={treeNodes} defaultExpanded={true} />
					) : (
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<div className='size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4'>
								<span className='icon-[lucide--layers] size-6 text-zinc-400' />
							</div>
							<h4 className='text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2'>Nenhuma dependência</h4>
							<p className='text-xs text-zinc-500 dark:text-zinc-500 mb-4'>Configure as dependências deste produto</p>
							<Button type='button' icon='icon-[lucide--plus]' style='filled' className='text-xs px-3 py-1.5' onClick={onOpenManagement}>
								Adicionar
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

// Exportando tipos para uso na página principal
export type { ProductDependency, ProductDependenciesColumnProps }
