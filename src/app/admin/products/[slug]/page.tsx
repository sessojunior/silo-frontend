'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Removido @dnd-kit - usando HTML5 drag & drop nativo

import Tree, { type TreeItemProps } from '@/components/ui/Tree'
import Accordion, { type Section } from '@/components/ui/Accordion'
import Button from '@/components/ui/Button'
import Offcanvas from '@/components/ui/Offcanvas'
import Dialog from '@/components/ui/Dialog'
import Label from '@/components/ui/Label'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { toast } from '@/lib/toast'

// MenuBuilder para exibir dependências do banco de dados
interface MenuBuilderProps {
	dependencies: ProductDependency[]
	onEdit: (item: ProductDependency) => void
	onDelete: (item: ProductDependency) => void
	onReorder?: (reorderedDependencies: ProductDependency[]) => void
}

function MenuBuilder({ dependencies, onEdit, onDelete, onReorder }: MenuBuilderProps) {
	// Estados para drag & drop
	const [draggedItem, setDraggedItem] = useState<ProductDependency | null>(null)
	const [dragOverItem, setDragOverItem] = useState<ProductDependency | null>(null)
	const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null)

	// Handlers para drag & drop HTML5
	const handleDragStart = (e: React.DragEvent, item: ProductDependency) => {
		setDraggedItem(item)
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.setData('text/plain', item.id)

		// Adiciona classe visual durante o drag
		e.currentTarget.classList.add('opacity-50')
	}

	const handleDragEnd = (e: React.DragEvent) => {
		setDraggedItem(null)
		setDragOverItem(null)
		setDropPosition(null)

		// Remove classe visual
		e.currentTarget.classList.remove('opacity-50')
	}

	const handleDragOver = (e: React.DragEvent, item: ProductDependency) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'

		if (!draggedItem || draggedItem.id === item.id) return

		setDragOverItem(item)

		// Determina posição do drop baseado na posição do mouse
		const rect = e.currentTarget.getBoundingClientRect()
		const y = e.clientY - rect.top
		const height = rect.height

		if (y < height * 0.25) {
			setDropPosition('before')
		} else if (y > height * 0.75) {
			setDropPosition('after')
		} else {
			setDropPosition('inside')
		}
	}

	const handleDragLeave = (e: React.DragEvent) => {
		// Só limpa se estamos saindo do elemento de fato
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setDragOverItem(null)
			setDropPosition(null)
		}
	}

	const handleDrop = async (e: React.DragEvent, targetItem: ProductDependency) => {
		e.preventDefault()

		if (!draggedItem || !onReorder || draggedItem.id === targetItem.id) {
			setDraggedItem(null)
			setDragOverItem(null)
			setDropPosition(null)
			return
		}

		// Cria nova estrutura hierárquica baseada no drop
		const flatItems = flattenDependencies(dependencies)
		const newOrder = reorderItems(flatItems, draggedItem, targetItem, dropPosition || 'after')
		const newHierarchy = buildHierarchyFromFlat(newOrder)

		// Chama callback para atualizar no servidor
		onReorder(newHierarchy)

		// Limpa estados
		setDraggedItem(null)
		setDragOverItem(null)
		setDropPosition(null)
	}

	// Utilitário para achatar dependências em lista linear
	const flattenDependencies = (deps: ProductDependency[], level = 0): Array<ProductDependency & { level: number }> => {
		const result: Array<ProductDependency & { level: number }> = []

		deps.forEach((dep) => {
			result.push({ ...dep, level })
			if (dep.children && dep.children.length > 0) {
				result.push(...flattenDependencies(dep.children, level + 1))
			}
		})

		return result
	}

	// Utilitário para reordenar itens baseado no drag & drop
	const reorderItems = (flatItems: Array<ProductDependency & { level: number }>, draggedItem: ProductDependency, targetItem: ProductDependency, position: 'before' | 'after' | 'inside'): Array<ProductDependency & { level: number }> => {
		// Remove o item arrastado da lista
		const withoutDragged = flatItems.filter((item) => item.id !== draggedItem.id)

		// Encontra índice do item alvo
		const targetIndex = withoutDragged.findIndex((item) => item.id === targetItem.id)
		if (targetIndex === -1) return flatItems

		// Determina novo nível e posição
		let newLevel = withoutDragged[targetIndex].level
		let insertIndex = targetIndex

		if (position === 'before') {
			insertIndex = targetIndex
		} else if (position === 'after') {
			insertIndex = targetIndex + 1
		} else if (position === 'inside') {
			newLevel = withoutDragged[targetIndex].level + 1
			insertIndex = targetIndex + 1
		}

		// Insere item na nova posição com novo nível
		const reorderedItem = { ...draggedItem, level: newLevel }
		withoutDragged.splice(insertIndex, 0, reorderedItem)

		return withoutDragged
	}

	// Utilitário para reconstruir hierarquia de lista flat
	const buildHierarchyFromFlat = (flatItems: Array<ProductDependency & { level: number }>): ProductDependency[] => {
		const result: ProductDependency[] = []
		const stack: Array<{ item: ProductDependency; level: number }> = []

		flatItems.forEach((item) => {
			// Remove níveis maiores da stack
			while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
				stack.pop()
			}

			// Cria item sem children inicialmente
			const newItem: ProductDependency = {
				id: item.id,
				name: item.name,
				icon: item.icon,
				description: item.description,
				parentId: stack.length > 0 ? stack[stack.length - 1].item.id : null,
				treePath: item.treePath,
				treeDepth: item.level,
				sortKey: item.sortKey,
				children: [],
			}

			if (stack.length === 0) {
				// Item raiz
				result.push(newItem)
			} else {
				// Item filho - adiciona ao parent
				const parent = stack[stack.length - 1].item
				if (!parent.children) parent.children = []
				parent.children.push(newItem)
			}

			// Adiciona à stack
			stack.push({ item: newItem, level: item.level })
		})

		return result
	}

	// Renderiza um item de dependência recursivamente
	const renderItem = (item: ProductDependency, level: number = 0): React.ReactNode => {
		const marginLeft = level * 32 // 32px por nível de hierarquia
		const isDragging = draggedItem?.id === item.id
		const isDragOver = dragOverItem?.id === item.id

		// Classes para feedback visual
		let dropIndicatorClass = ''
		if (isDragOver && dropPosition) {
			if (dropPosition === 'before') {
				dropIndicatorClass = 'border-t-2 border-blue-500'
			} else if (dropPosition === 'after') {
				dropIndicatorClass = 'border-b-2 border-blue-500'
			} else if (dropPosition === 'inside') {
				dropIndicatorClass = 'ring-2 ring-blue-500 ring-inset'
			}
		}

		return (
			<div key={item.id}>
				{/* Item atual */}
				<div className={`flex items-center gap-2 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-all ${dropIndicatorClass} ${isDragging ? 'opacity-50' : ''}`} style={{ marginLeft: `${marginLeft}px` }} draggable={!isDragging} onDragStart={(e) => handleDragStart(e, item)} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, item)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, item)}>
					<span className='icon-[lucide--grip-vertical] size-4 text-zinc-400 cursor-grab active:cursor-grabbing' />
					{item.icon && <span className={`icon-[lucide--${item.icon}] size-4 text-zinc-600 dark:text-zinc-400`} />}
					{!item.icon && <span className='icon-[lucide--circle] size-4 text-zinc-600 dark:text-zinc-400' />}
					<span className='flex-1 font-medium'>{item.name}</span>
					<span className='flex items-center justify-center size-8 bg-zinc-100 dark:bg-zinc-700 rounded-full text-xs text-zinc-500'>L{level + 1}</span>
					<button className='flex items-center justify-center size-8 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-full' onClick={() => onEdit(item)} title='Editar'>
						<span className='icon-[lucide--edit-3] size-3.5 text-zinc-500' />
					</button>
					<button className='flex items-center justify-center size-8 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-full' onClick={() => onDelete(item)} title='Excluir'>
						<span className='icon-[lucide--trash-2] size-3.5 text-red-500' />
					</button>
				</div>

				{/* Filhos recursivamente */}
				{item.children && item.children.length > 0 && <div className='space-y-1 mt-1'>{item.children.map((child) => renderItem(child, level + 1))}</div>}
			</div>
		)
	}

	// Se não há dependências, mostra mensagem vazia
	if (!dependencies || dependencies.length === 0) {
		return (
			<div className='w-full space-y-2'>
				<div className='flex flex-col items-center justify-center py-12 text-center'>
					<span className='icon-[lucide--folder-tree] mb-4 text-4xl text-zinc-400'></span>
					<h4 className='text-lg font-medium text-zinc-600 dark:text-zinc-300'>Nenhuma dependência encontrada</h4>
					<p className='text-sm text-zinc-500 dark:text-zinc-400'>Adicione dependências para começar a organizar a base de conhecimento.</p>
				</div>
			</div>
		)
	}

	return (
		<div className='w-full space-y-2'>
			{/* Instruções de uso */}
			<div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4'>
				<div className='flex items-start gap-2'>
					<span className='icon-[lucide--info] size-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
					<div className='text-blue-700 dark:text-blue-300'>
						<p className='font-medium mb-1'>Como usar o drag & drop:</p>
						<ul className='list-disc list-inside pl-1'>
							<li>
								Arraste o ícone <strong>⋮⋮</strong> para mover itens
							</li>
							<li>
								Solte <strong>acima</strong> para inserir antes
							</li>
							<li>
								Solte <strong>abaixo</strong> para inserir depois
							</li>
							<li>
								Solte <strong>no meio</strong> para tornar item filho
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div className='flex items-center justify-end mb-4'>
				{/* <Button type='button' icon='icon-[lucide--plus]' onClick={openAddItemForm}> */}
				<Button type='button' icon='icon-[lucide--plus]'>
					Adicionar dependência
				</Button>
			</div>

			{/* Lista hierárquica com dados reais */}
			<div className='space-y-1'>{dependencies.map((item) => renderItem(item, 0))}</div>
		</div>
	)
}

// Importação dinâmica do MDEditor para evitar problemas de SSR
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

// Tipos para os dados da API
interface ProductDependency {
	id: string
	name: string
	icon?: string
	description?: string
	parentId?: string | null
	// Campos híbridos otimizados
	treePath?: string | null
	treeDepth: number
	sortKey?: string | null
	children?: ProductDependency[]
}

interface ProductContact {
	id: string
	name: string
	role: string
	team: string
	email: string
	phone?: string
	image?: string
}

interface ProductManualChapter {
	id: string
	title: string
	content: string
	order: number
}

interface ProductManualSection {
	id: string
	title: string
	description?: string
	order: number
	chapters: ProductManualChapter[]
}

// Estender TreeItemProps para incluir actions
interface ExtendedTreeItemProps extends TreeItemProps {
	actions?: Array<{
		icon: string
		title: string
		onClick: () => void
		className?: string
	}>
}

export default function ProductsPage() {
	const params = useParams()
	const slug = params.slug as string

	const [productId, setProductId] = useState<string | null>(null)
	const [isDarkMode, setIsDarkMode] = useState(false)
	const [dependencies, setDependencies] = useState<ProductDependency[]>([])
	const [contacts, setContacts] = useState<ProductContact[]>([])
	const [sections, setSections] = useState<ProductManualSection[]>([])
	const [loading, setLoading] = useState(true)
	const [problemsCount, setProblemsCount] = useState<number>(0)
	const [solutionsCount, setSolutionsCount] = useState<number>(0)
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
	const [offcanvasOpen, setOffcanvasOpen] = useState(false)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [selectedDependency, setSelectedDependency] = useState<ProductDependency | null>(null)
	const [formMode, setFormMode] = useState<'section' | 'chapter'>('section')
	const [formTitle, setFormTitle] = useState('')
	const [formDescription, setFormDescription] = useState('')
	const [formContent, setFormContent] = useState('')
	const [formLoading, setFormLoading] = useState(false)
	const [editingSection, setEditingSection] = useState<ProductManualSection | null>(null)
	const [editingChapter, setEditingChapter] = useState<ProductManualChapter | null>(null)

	// Estados para gerenciar dependências
	const [dependencyDialogOpen, setDependencyDialogOpen] = useState(false)
	const [dependencyOffcanvasOpen, setDependencyOffcanvasOpen] = useState(false)
	const [dependencyFormMode, setDependencyFormMode] = useState<'add' | 'edit'>('add')
	const [selectedParentDependency, setSelectedParentDependency] = useState<ProductDependency | null>(null)
	const [editingDependency, setEditingDependency] = useState<ProductDependency | null>(null)
	const [dependencyFormData, setDependencyFormData] = useState({
		name: '',
		icon: '',
		description: '',
	})

	// Estados para gerenciamento avançado de dependências
	const [managementOffcanvasOpen, setManagementOffcanvasOpen] = useState(false)
	const [editItemOffcanvasOpen, setEditItemOffcanvasOpen] = useState(false)
	const [selectedItemForEdit, setSelectedItemForEdit] = useState<ProductDependency | null>(null)
	const [loadingManagement, setLoadingManagement] = useState(false)
	const [isAddingNewItem, setIsAddingNewItem] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	// Dados para formulário de edição/criação de item
	const [editFormData, setEditFormData] = useState({
		name: '',
		icon: '',
		description: '',
		parentId: null as string | null,
	})

	// Detecta tema dark/light
	useEffect(() => {
		const checkTheme = () => {
			const isDark = document.documentElement.classList.contains('dark')
			setIsDarkMode(isDark)
		}

		// Verifica tema inicial
		checkTheme()

		// Observer para mudanças no tema
		const observer = new MutationObserver(checkTheme)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})

		return () => observer.disconnect()
	}, [])

	// Detecta mobile para desabilitar drag & drop
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768)
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	// Lista de ícones disponíveis para seleção
	const availableIcons = ['server', 'database', 'monitor', 'smartphone', 'wifi', 'network', 'shield', 'key', 'lock', 'globe', 'terminal', 'code', 'git-branch', 'package', 'puzzle', 'zap', 'activity', 'alert-triangle', 'tool', 'settings-2', 'layers', 'workflow', 'cpu', 'hard-drive', 'cloud', 'router', 'usb', 'memory-stick']

	// Busca o ID do produto pelo slug
	useEffect(() => {
		const fetchProductId = async () => {
			try {
				const res = await fetch(`/api/products?slug=${slug}`)
				const data = await res.json()
				if (data.products && data.products.length > 0) {
					setProductId(data.products[0].id)
				}
			} catch (error) {
				console.error('❌ Erro ao buscar produto:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchProductId()
	}, [slug])

	// Busca os dados quando temos o productId
	useEffect(() => {
		if (!productId) return

		const fetchData = async () => {
			setLoading(true)
			try {
				const [depsRes, contactsRes, manualRes, problemsRes] = await Promise.all([fetch(`/api/products/dependencies?productId=${productId}`), fetch(`/api/products/contacts?productId=${productId}`), fetch(`/api/products/manual?productId=${productId}`), fetch(`/api/products/problems?slug=${slug}`)])

				const [depsData, contactsData, manualData, problemsData] = await Promise.all([depsRes.json(), contactsRes.json(), manualRes.json(), problemsRes.json()])

				setDependencies(depsData.dependencies || [])
				setContacts(contactsData.contacts || [])
				setSections(manualData.sections || [])

				// Contagem de problemas
				const problems = problemsData.items || []
				setProblemsCount(problems.length)

				// Buscar e contar soluções
				if (problems.length > 0) {
					const solutionsPromises = problems.map((problem: { id: string }) => fetch(`/api/products/solutions?problemId=${problem.id}`).then((res) => res.json()))
					const solutionsResults = await Promise.all(solutionsPromises)
					const totalSolutions = solutionsResults.reduce((total, result) => total + (result.items?.length || 0), 0)
					setSolutionsCount(totalSolutions)

					// Encontrar data de atualização mais recente
					const allDates = problems.map((p: { updatedAt: string }) => new Date(p.updatedAt))
					const latestDate = new Date(Math.max(...allDates.map((d: Date) => d.getTime())))
					setLastUpdated(latestDate)
				}
			} catch (error) {
				console.error('❌ Erro ao buscar dados:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [productId, slug])

	// Função para recarregar dependências
	const refreshDependencies = async () => {
		if (!productId) return
		try {
			const res = await fetch(`/api/products/dependencies?productId=${productId}`)
			const data = await res.json()
			setDependencies(data.dependencies || [])
		} catch (error) {
			console.error('❌ Erro ao recarregar dependências:', error)
		}
	}

	// Função para reordenar dependências via drag & drop
	const handleReorderDependencies = async (reorderedDependencies: ProductDependency[]) => {
		if (!productId) return

		try {
			console.log('ℹ️ Iniciando reordenação de dependências...')

			// Otimista: atualiza UI imediatamente
			setDependencies(reorderedDependencies)

			// Converte hierarquia para lista flat com sortKey recalculado
			const flatList = flattenWithNewSortKeys(reorderedDependencies)

			// Envia para API em lote
			const res = await fetch('/api/products/dependencies/reorder', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productId,
					items: flatList,
				}),
			})

			if (res.ok) {
				console.log('✅ Dependências reordenadas com sucesso!')
				toast({
					type: 'success',
					title: 'Ordem atualizada com sucesso!',
				})

				// Recarrega para sincronizar com servidor
				await refreshDependencies()
			} else {
				const error = await res.json()
				console.log('❌ Erro ao reordenar dependências:', error.message)
				toast({
					type: 'error',
					title: error.message || 'Erro ao reordenar dependências',
				})

				// Reverte mudanças em caso de erro
				await refreshDependencies()
			}
		} catch (error) {
			console.error('❌ Erro inesperado ao reordenar:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado. Revertendo mudanças...',
			})

			// Reverte mudanças em caso de erro
			await refreshDependencies()
		}
	}

	// Utilitário para achatar hierarquia e recalcular sortKeys
	const flattenWithNewSortKeys = (
		deps: ProductDependency[],
		parentPath = '',
		level = 0,
	): Array<{
		id: string
		parentId: string | null
		treePath: string
		treeDepth: number
		sortKey: string
	}> => {
		const result: Array<{
			id: string
			parentId: string | null
			treePath: string
			treeDepth: number
			sortKey: string
		}> = []

		deps.forEach((dep, index) => {
			const currentPath = parentPath ? `${parentPath}/${index}` : `/${index}`
			const sortKey = parentPath ? `${parentPath.split('/').filter(Boolean).join('.')}.${index.toString().padStart(3, '0')}` : index.toString().padStart(3, '0')

			result.push({
				id: dep.id,
				parentId: dep.parentId ?? null,
				treePath: currentPath,
				treeDepth: level,
				sortKey: sortKey,
			})

			if (dep.children && dep.children.length > 0) {
				result.push(...flattenWithNewSortKeys(dep.children, currentPath, level + 1))
			}
		})

		return result
	}

	// Converte dependências hierárquicas para lista flat com níveis
	const convertToFlatList = (deps: ProductDependency[], level = 0): Array<ProductDependency & { level: number }> => {
		const result: Array<ProductDependency & { level: number }> = []

		deps.forEach((dep) => {
			result.push({ ...dep, level })
			if (dep.children && dep.children.length > 0) {
				result.push(...convertToFlatList(dep.children, level + 1))
			}
		})

		return result
	}

	// Abrir gerenciamento de dependências
	const openManagement = async () => {
		setLoadingManagement(true)
		setManagementOffcanvasOpen(true)
		await refreshDependencies()
		setLoadingManagement(false)
	}

	// Abrir formulário para adicionar novo item
	const openAddItemForm = () => {
		setIsAddingNewItem(true)
		setSelectedItemForEdit(null)
		setEditFormData({
			name: '',
			icon: '',
			description: '',
			parentId: null,
		})
		setEditItemOffcanvasOpen(true)
	}

	// Abrir formulário para editar item existente
	const openEditItemForm = (item: ProductDependency) => {
		setIsAddingNewItem(false)
		setSelectedItemForEdit(item)
		setEditFormData({
			name: item.name,
			icon: item.icon || '',
			description: item.description || '',
			parentId: item.parentId || null,
		})
		setEditItemOffcanvasOpen(true)
	}

	// Submeter formulário de item
	const handleSubmitItemForm = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!productId) return
		if (!editFormData.name.trim()) {
			toast({
				type: 'error',
				title: 'Nome é obrigatório',
			})
			return
		}

		setFormLoading(true)
		try {
			if (isAddingNewItem) {
				const res = await fetch('/api/products/dependencies', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						productId,
						name: editFormData.name,
						icon: editFormData.icon || null,
						description: editFormData.description || null,
						parentId: editFormData.parentId || null,
					}),
				})

				if (res.ok) {
					toast({
						type: 'success',
						title: 'Dependência adicionada com sucesso!',
					})
					setEditItemOffcanvasOpen(false)
					await refreshDependencies()
				} else {
					const error = await res.json()
					toast({
						type: 'error',
						title: error.message || 'Erro ao adicionar dependência',
					})
				}
			} else if (selectedItemForEdit) {
				const res = await fetch('/api/products/dependencies', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: selectedItemForEdit.id,
						name: editFormData.name,
						icon: editFormData.icon || null,
						description: editFormData.description || null,
						parentId: editFormData.parentId || null,
					}),
				})

				if (res.ok) {
					toast({
						type: 'success',
						title: 'Dependência atualizada com sucesso!',
					})
					setEditItemOffcanvasOpen(false)
					await refreshDependencies()
				} else {
					const error = await res.json()
					toast({
						type: 'error',
						title: error.message || 'Erro ao atualizar dependência',
					})
				}
			}
		} catch (error) {
			console.error('❌ Erro ao submeter formulário:', error)
			toast({ type: 'error', title: 'Erro inesperado. Tente novamente.' })
		} finally {
			setFormLoading(false)
		}
	}

	// Converte as dependências para o formato do Tree com ações
	const convertToTreeItems = (deps: ProductDependency[]): ExtendedTreeItemProps[] => {
		return deps.map((dep) => ({
			icon: dep.icon || undefined,
			label: dep.name,
			children: dep.children ? convertToTreeItems(dep.children) : undefined,
			// Só adiciona onClick para itens que não têm filhos (folhas da árvore)
			onClick: dep.children && dep.children.length > 0 ? undefined : () => handleDependencyClick(dep),
			// Adiciona actions para todas as dependências
			actions: [
				{
					icon: 'icon-[lucide--plus]',
					title: 'Adicionar item filho',
					onClick: () => handleAddDependency(dep),
				},
				{
					icon: 'icon-[lucide--edit-3]',
					title: 'Editar',
					onClick: () => handleEditDependency(dep),
				},
				{
					icon: 'icon-[lucide--trash-2]',
					title: 'Excluir',
					onClick: () => handleDeleteDependency(dep),
					className: 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300',
				},
			],
		}))
	}

	// Função para lidar com clique em dependências
	const handleDependencyClick = (dependency: ProductDependency) => {
		setSelectedDependency(dependency)
		setDialogOpen(true)
	}

	// Função para adicionar dependência filha
	const handleAddDependency = (parentDependency: ProductDependency | null = null) => {
		setDependencyFormMode('add')
		setSelectedParentDependency(parentDependency)
		setEditingDependency(null)
		setDependencyFormData({
			name: '',
			icon: '',
			description: '',
		})
		setDependencyOffcanvasOpen(true)
	}

	// Função para editar dependência
	const handleEditDependency = (dependency: ProductDependency) => {
		setDependencyFormMode('edit')
		setSelectedParentDependency(null)
		setEditingDependency(dependency)
		setDependencyFormData({
			name: dependency.name,
			icon: dependency.icon || '',
			description: dependency.description || '',
		})
		setDependencyOffcanvasOpen(true)
	}

	// Função para excluir dependência
	const handleDeleteDependency = (dependency: ProductDependency) => {
		setSelectedDependency(dependency)
		setDependencyDialogOpen(true)
	}

	// Função para abrir formulário de seção
	const handleAddSection = () => {
		setFormMode('section')
		setEditingSection(null)
		setEditingChapter(null)
		setFormTitle('')
		setFormDescription('')
		setFormContent('')
		setOffcanvasOpen(true)
	}

	// Função para abrir formulário de capítulo
	const handleEditChapter = (chapter: ProductManualChapter, section: ProductManualSection) => {
		setFormMode('chapter')
		setEditingSection(section)
		setEditingChapter(chapter)
		setFormTitle(chapter.title)
		setFormDescription('')
		setFormContent(chapter.content)
		setOffcanvasOpen(true)
	}

	// Função para salvar seção
	const handleSubmitSection = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!productId) return
		if (!formTitle.trim()) {
			toast({
				type: 'error',
				title: 'Título da seção é obrigatório',
			})
			return
		}

		setFormLoading(true)
		try {
			console.log('🔵 Enviando seção:', { productId, title: formTitle, description: formDescription })
			const res = await fetch('/api/products/manual', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productId,
					title: formTitle,
					description: formDescription,
				}),
			})

			if (res.ok) {
				const { section } = await res.json()
				toast({
					type: 'success',
					title: 'Seção adicionada com sucesso!',
				})
				setOffcanvasOpen(false)
				// Atualizar dados localmente
				setSections((prev) => [...prev, { ...section, chapters: [] }])
			} else {
				let errorMessage = 'Erro ao adicionar seção'
				try {
					const error = await res.json()
					errorMessage = error.message || errorMessage
				} catch {
					// Se não conseguir parsear JSON, usar status text
					errorMessage = `Erro ${res.status}: ${res.statusText}`
				}
				toast({
					type: 'error',
					title: errorMessage,
				})
			}
		} catch (error) {
			console.error('❌ Erro ao adicionar seção:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado. Tente novamente.',
			})
		} finally {
			setFormLoading(false)
		}
	}

	// Função para salvar capítulo
	const handleSubmitChapter = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingChapter || !editingSection) return
		if (!formTitle.trim()) {
			toast({
				type: 'error',
				title: 'Título do capítulo é obrigatório',
			})
			return
		}
		if (!formContent.trim()) {
			toast({
				type: 'error',
				title: 'Conteúdo do capítulo é obrigatório',
			})
			return
		}

		setFormLoading(true)
		try {
			console.log('🔵 Editando capítulo:', { id: editingChapter.id, title: formTitle, content: formContent })
			const res = await fetch('/api/products/manual', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: editingChapter.id,
					title: formTitle,
					content: formContent,
				}),
			})

			if (res.ok) {
				const { chapter } = await res.json()
				toast({
					type: 'success',
					title: 'Capítulo atualizado com sucesso!',
				})
				setOffcanvasOpen(false)
				// Atualizar dados localmente
				setSections((prev) =>
					prev.map((section) =>
						section.id === editingSection.id
							? {
									...section,
									chapters: section.chapters.map((ch) => (ch.id === chapter.id ? chapter : ch)),
								}
							: section,
					),
				)
			} else {
				let errorMessage = 'Erro ao atualizar capítulo'
				try {
					const error = await res.json()
					errorMessage = error.message || errorMessage
				} catch {
					// Se não conseguir parsear JSON, usar status text
					errorMessage = `Erro ${res.status}: ${res.statusText}`
				}
				toast({
					type: 'error',
					title: errorMessage,
				})
			}
		} catch (error) {
			console.error('❌ Erro ao atualizar capítulo:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado. Tente novamente.',
			})
		} finally {
			setFormLoading(false)
		}
	}

	// Função para submeter formulário de dependência
	const handleSubmitDependency = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!productId) return
		if (!dependencyFormData.name.trim()) {
			toast({
				type: 'error',
				title: 'Nome é obrigatório',
			})
			return
		}

		setFormLoading(true)
		try {
			if (dependencyFormMode === 'add') {
				const res = await fetch('/api/products/dependencies', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						productId,
						name: dependencyFormData.name,
						icon: dependencyFormData.icon || null,
						description: dependencyFormData.description || null,
						parentId: selectedParentDependency?.id || null,
					}),
				})

				if (res.ok) {
					toast({
						type: 'success',
						title: 'Dependência adicionada com sucesso!',
					})
					setDependencyOffcanvasOpen(false)
					// Recarregar dependências
					await refreshDependencies()
				} else {
					const error = await res.json()
					toast({
						type: 'error',
						title: error.message || 'Erro ao adicionar dependência',
					})
				}
			} else if (dependencyFormMode === 'edit') {
				const res = await fetch('/api/products/dependencies', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: editingDependency?.id,
						name: dependencyFormData.name,
						icon: dependencyFormData.icon || null,
						description: dependencyFormData.description || null,
						parentId: selectedParentDependency?.id || null,
					}),
				})

				if (res.ok) {
					toast({
						type: 'success',
						title: 'Dependência atualizada com sucesso!',
					})
					setDependencyOffcanvasOpen(false)
					// Recarregar dependências
					await refreshDependencies()
				} else {
					const error = await res.json()
					toast({
						type: 'error',
						title: error.message || 'Erro ao atualizar dependência',
					})
				}
			}
		} catch (error) {
			console.error('❌ Erro ao submeter dependência:', error)
			toast({ type: 'error', title: 'Erro inesperado. Tente novamente.' })
			setFormLoading(false)
		}
	}

	// Função para confirmar exclusão de dependência
	const handleConfirmDeleteDependency = async () => {
		if (!selectedDependency) return

		setFormLoading(true)
		try {
			const res = await fetch(`/api/products/dependencies?id=${selectedDependency.id}`, {
				method: 'DELETE',
			})

			if (res.ok) {
				toast({
					type: 'success',
					title: 'Dependência excluída com sucesso!',
				})
				setDependencyDialogOpen(false)
				// Recarregar dependências
				await refreshDependencies()
			} else {
				const error = await res.json()
				toast({
					type: 'error',
					title: error.message || 'Erro ao excluir dependência',
				})
			}
		} catch (error) {
			console.error('❌ Erro ao excluir dependência:', error)
			toast({ type: 'error', title: 'Erro inesperado. Tente novamente.' })
		} finally {
			setFormLoading(false)
		}
	}

	// Converte as seções do manual para o formato do Accordion
	const convertToAccordionSections = (sections: ProductManualSection[]): Section[] => {
		return sections.map((section) => ({
			id: section.id,
			title: section.title,
			description: section.description,
			chapters: section.chapters.map((chapter) => ({
				id: chapter.id,
				title: chapter.title,
				description: chapter.content,
				onEdit: () => handleEditChapter(chapter, section),
			})),
		}))
	}

	const treeItems = convertToTreeItems(dependencies)
	const accordionSections = convertToAccordionSections(sections)

	// Conta estatísticas do manual
	const totalChapters = sections.reduce((acc, section) => acc + section.chapters.length, 0)

	// Removidas funções @dnd-kit antigas - agora usando HTML5 drag & drop no MenuBuilder

	// Função para formatar tempo desde última atualização
	const formatTimeAgo = (date: Date | null): string => {
		if (!date) return 'Nunca atualizado'

		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

		if (diffDays === 0) return 'Hoje'
		if (diffDays === 1) return 'Há 1 dia'
		if (diffDays < 30) return `Há ${diffDays} dias`

		const diffMonths = Math.floor(diffDays / 30)
		if (diffMonths === 1) return 'Há 1 mês'
		if (diffMonths < 12) return `Há ${diffMonths} meses`

		const diffYears = Math.floor(diffDays / 365)
		if (diffYears === 1) return 'Há 1 ano'
		return `Há ${diffYears} anos`
	}

	if (loading) {
		return (
			<div className='flex h-[calc(100vh-131px)] w-full items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin text-4xl'>⏳</div>
					<p className='mt-2 text-zinc-600 dark:text-zinc-400'>Carregando dependências...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex w-full'>
			{/* Side left */}
			<div className='flex w-[320px] flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-700'>
				<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
					{/* Tree */}
					<div className='px-8 pt-8' role='tree' aria-orientation='vertical'>
						<div className='flex w-full items-center justify-between gap-2 pb-6'>
							<h3 className='text-xl font-medium'>Dependências do produto</h3>
							<Button type='button' icon='icon-[lucide--settings]' style='unstyled' className='size-10 rounded-full' onClick={openManagement} title='Gerenciar dependências' />
						</div>
						{treeItems.map((category, index) => (
							<div key={index} className='pb-8'>
								<h4 className='pb-4 text-lg font-medium'>{category.label}</h4>
								{category.children?.map((child: TreeItemProps, childIndex: number) => <Tree key={childIndex} item={child as TreeItemProps} defaultOpen={false} activeUrl={`/admin/products/${slug}`} />)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Side right */}
			<div className='flex w-full flex-grow flex-col'>
				<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
					{/* Cabeçalho */}
					<div className='flex flex-col gap-2 border-b border-zinc-200 p-8 md:grid md:grid-cols-2 dark:border-zinc-700'>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--book-text] size-4'></span>
							</div>
							<div className='flex'>
								<span>
									{sections.length} seções & {totalChapters} capítulos
								</span>
							</div>
						</div>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--users-round] size-4'></span>
							</div>
							<div className='flex'>
								<span>Técnicos responsáveis: {contacts.length}</span>
							</div>
						</div>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--triangle-alert] size-4'></span>
							</div>
							<div className='flex'>
								<span>Problemas reportados: {problemsCount}</span>
							</div>
						</div>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--book-check] size-4'></span>
							</div>
							<div className='flex'>
								<span>Soluções encontradas: {solutionsCount}</span>
							</div>
						</div>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--clock-4] size-4'></span>
							</div>
							<div className='flex'>
								<span>Atualizado {formatTimeAgo(lastUpdated)}</span>
							</div>
						</div>
					</div>

					{/* Responsáveis técnicos */}
					<div className='border-b border-zinc-200 p-8 dark:border-zinc-700'>
						<div className='flex w-full items-center justify-between pb-6'>
							<div>
								<h3 className='text-xl font-medium'>Contatos em caso de problemas</h3>
								<div>
									<span className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>{contacts.length} responsáveis técnicos</span>
								</div>
							</div>
							<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2'>
								Adicionar contato
							</Button>
						</div>
						<div className='flex flex-col gap-4 md:grid md:grid-cols-2'>
							{/* Contatos */}
							{contacts.map((contact) => (
								<div key={contact.id} className='flex gap-x-2'>
									<div className='size-12 shrink-0'>
										<Image src={contact.image || '/images/profile.png'} alt={contact.name} width={40} height={40} className='size-full rounded-full' />
									</div>
									<div className='flex flex-col'>
										<div className='text-base font-bold'>{contact.name}</div>
										<div className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>
											{contact.role} <span className='text-zinc-300 dark:text-zinc-600'>•</span> {contact.team}
										</div>
										<div className='text-sm font-medium'>
											<a href={`mailto:${contact.email}`} className='text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300'>
												{contact.email}
											</a>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Manual do produto */}
					<div className='p-8'>
						<div className='flex w-full items-center justify-between pb-6'>
							<div>
								<h3 className='text-xl font-medium'>Manual do produto</h3>
								<div>
									<span className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>
										{sections.length} seções <span className='text-zinc-300 dark:text-zinc-600'>•</span> {totalChapters} capítulos
									</span>
								</div>
							</div>
							<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2' onClick={handleAddSection}>
								Adicionar seção
							</Button>
						</div>
						<div className='flex flex-col'>
							{/* Manual */}
							{accordionSections.length > 0 ? (
								<Accordion sections={accordionSections} />
							) : (
								<div className='flex flex-col items-center justify-center py-12 text-center'>
									<span className='icon-[lucide--book-open] mb-4 text-4xl text-zinc-400'></span>
									<h4 className='text-lg font-medium text-zinc-600 dark:text-zinc-300'>Nenhum manual encontrado</h4>
									<p className='text-sm text-zinc-500 dark:text-zinc-400'>Adicione seções e capítulos para começar a documentar este produto.</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Offcanvas para gerenciamento de dependências */}
			<Offcanvas open={managementOffcanvasOpen} onClose={() => setManagementOffcanvasOpen(false)} title='Gerenciar Dependências' width='xl'>
				<div className='flex flex-col gap-4'>
					{/* Lista de dependências */}
					{loadingManagement && (
						<div className='flex flex-col gap-3'>
							{Array(6)
								.fill(0)
								.map((_, i) => (
									<div key={i} className='animate-pulse'>
										<div className='h-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg' />
									</div>
								))}
						</div>
					)}

					<MenuBuilder dependencies={dependencies} onEdit={openEditItemForm} onDelete={handleDeleteDependency} onReorder={handleReorderDependencies} />
				</div>
			</Offcanvas>

			{/* Offcanvas para edição/criação de item */}
			<Offcanvas open={editItemOffcanvasOpen} onClose={() => setEditItemOffcanvasOpen(false)} title={isAddingNewItem ? 'Adicionar Dependência' : 'Editar Dependência'} width='lg'>
				<form className='flex flex-col gap-6' onSubmit={handleSubmitItemForm}>
					{/* Nome */}
					<div>
						<Label htmlFor='item-name' required>
							Nome
						</Label>
						<Input id='item-name' type='text' value={editFormData.name} setValue={(value) => setEditFormData((prev) => ({ ...prev, name: value }))} required placeholder='Ex: Servidor Principal, Base de Dados' />
					</div>

					{/* Ícone */}
					<div>
						<Label htmlFor='item-icon'>Ícone (opcional)</Label>
						<div className={`grid gap-2 ${isMobile ? 'grid-cols-6' : 'grid-cols-12'}`}>
							{availableIcons.map((iconName) => (
								<button
									type='button'
									key={iconName}
									className={`
										p-3 border rounded-lg transition-colors
										${editFormData.icon === iconName ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
									`}
									onClick={() => setEditFormData((prev) => ({ ...prev, icon: iconName }))}
									title={iconName}
								>
									<span className={`icon-[lucide--${iconName}] size-5`} />
								</button>
							))}
							{/* Botão para remover ícone */}
							<button
								type='button'
								className={`
									p-3 border rounded-lg transition-colors
									${editFormData.icon === '' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
								`}
								onClick={() => setEditFormData((prev) => ({ ...prev, icon: '' }))}
								title='Sem ícone'
							>
								<span className='icon-[lucide--x] size-5 text-zinc-400' />
							</button>
						</div>
					</div>

					{/* Descrição */}
					<div>
						<Label htmlFor='item-description'>Descrição (opcional)</Label>
						<textarea id='item-description' value={editFormData.description} onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))} className='block w-full rounded-lg border-zinc-200 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500' rows={3} placeholder='Descrição detalhada sobre esta dependência...' />
					</div>

					{/* Botões de ação */}
					<div className='flex gap-2 justify-end'>
						<Button type='button' style='bordered' onClick={() => setEditItemOffcanvasOpen(false)}>
							Cancelar
						</Button>
						<Button type='submit' disabled={formLoading}>
							{formLoading ? 'Salvando...' : 'Salvar'}
						</Button>
					</div>
				</form>
			</Offcanvas>

			{/* Offcanvas para adicionar seção ou editar capítulo */}
			<Offcanvas open={offcanvasOpen} onClose={() => setOffcanvasOpen(false)} title={formMode === 'section' ? 'Adicionar seção' : 'Editar capítulo'} width='xl'>
				<form className='flex flex-col gap-6' onSubmit={formMode === 'section' ? handleSubmitSection : handleSubmitChapter}>
					<div>
						<Label htmlFor='form-title' required>
							{formMode === 'section' ? 'Título da seção' : 'Título do capítulo'}
						</Label>
						<Input id='form-title' type='text' value={formTitle} setValue={setFormTitle} required placeholder={formMode === 'section' ? 'Ex: Instalação e Configuração' : 'Ex: Configurando o ambiente'} />
					</div>

					{formMode === 'section' && (
						<div>
							<Label htmlFor='form-description'>Descrição da seção (opcional)</Label>
							<textarea id='form-description' value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className='block w-full rounded-lg border-zinc-200 px-4 py-3 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500' rows={3} placeholder='Breve descrição sobre esta seção...' />
						</div>
					)}

					{formMode === 'chapter' && (
						<div>
							<Label htmlFor='form-content' required>
								Conteúdo do capítulo
							</Label>
							<div className='md-editor-custom'>
								<MDEditor value={formContent} onChange={(val) => setFormContent(val || '')} height={400} preview='edit' data-color-mode={isDarkMode ? 'dark' : 'light'} />
							</div>
						</div>
					)}

					<div className='flex gap-2 justify-end'>
						<Button type='button' style='bordered' onClick={() => setOffcanvasOpen(false)}>
							Cancelar
						</Button>
						<Button type='submit' disabled={formLoading}>
							{formLoading ? 'Salvando...' : 'Salvar'}
						</Button>
					</div>
				</form>
			</Offcanvas>

			{/* Dialog para confirmar exclusão de dependência */}
			<Dialog open={dependencyDialogOpen} onClose={() => setDependencyDialogOpen(false)} title='Confirmar exclusão'>
				{selectedDependency && (
					<div className='flex flex-col gap-4 pt-2'>
						<p className='text-zinc-600 dark:text-zinc-300'>
							Tem certeza de que deseja excluir <strong>&ldquo;{selectedDependency.name}&rdquo;</strong>?
						</p>

						<p className='text-sm text-zinc-500 dark:text-zinc-400'>Esta ação não pode ser desfeita. Certifique-se de que não há itens filhos dependentes desta categoria.</p>

						<div className='flex gap-2 justify-end'>
							<Button type='button' style='bordered' onClick={() => setDependencyDialogOpen(false)}>
								Cancelar
							</Button>
							<Button type='button' style='filled' className='bg-red-600 hover:bg-red-700 text-white' onClick={handleConfirmDeleteDependency} disabled={formLoading}>
								{formLoading ? 'Excluindo...' : 'Excluir'}
							</Button>
						</div>
					</div>
				)}
			</Dialog>

			{/* Dialog para informações da dependência */}
			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				title={
					<div className='flex items-center gap-2'>
						{selectedDependency?.icon && <span className={`icon-[lucide--${selectedDependency.icon}] size-5`} />}
						{selectedDependency?.name || 'Dependência'}
					</div>
				}
			>
				{selectedDependency && (
					<div className='flex flex-col gap-4 pt-2'>
						{selectedDependency.description && (
							<div>
								<div className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>Descrição</div>
								<div className='text-base'>{selectedDependency.description}</div>
							</div>
						)}
						{!selectedDependency.description && <div className='text-zinc-500 dark:text-zinc-400'>Nenhuma descrição disponível para esta dependência.</div>}
					</div>
				)}
			</Dialog>
		</div>
	)
}
