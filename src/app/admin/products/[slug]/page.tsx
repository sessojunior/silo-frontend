'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'

// Removido @dnd-kit - usando HTML5 drag & drop nativo

import { type TreeNode } from '@/components/ui/TreeView'
import { type Section } from '@/components/ui/Accordion'
import { toast } from '@/lib/toast'
import { type ProductDependencyItem } from '@/components/admin/products/ProductDependencyMenuBuilder'

// Novos componentes Offcanvas e Dialog extraídos
import DependencyManagementOffcanvas from '@/components/admin/products/DependencyManagementOffcanvas'
import DependencyItemFormOffcanvas from '@/components/admin/products/DependencyItemFormOffcanvas'
import ManualSectionFormOffcanvas from '@/components/admin/products/ManualSectionFormOffcanvas'
import DeleteDependencyDialog from '@/components/admin/products/DeleteDependencyDialog'

// Componente coluna esquerda (dependências) - ETAPA 1 REFATORAÇÃO
import ProductDependenciesColumn from '@/components/admin/products/ProductDependenciesColumn'

// Componente coluna direita (detalhes do produto) - ETAPA 2 REFATORAÇÃO
import ProductDetailsColumn from '@/components/admin/products/ProductDetailsColumn'

// Função utilitária para converter ProductDependency para TreeNode (compatível com TreeView)
function convertDependenciesToTreeNodes(dependencies: ProductDependency[]): TreeNode[] {
	return dependencies.map((dep) => ({
		id: dep.id,
		name: dep.name,
		icon: dep.icon || null,
		children: dep.children ? convertDependenciesToTreeNodes(dep.children) : undefined,
		data: dep, // Inclui todos os campos do banco como data
	}))
}

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

// Removido - não mais necessário com novo Tree component

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
	const [formMode, setFormMode] = useState<'section' | 'chapter'>('section')
	const [formTitle, setFormTitle] = useState('')
	const [formDescription, setFormDescription] = useState('')
	const [formContent, setFormContent] = useState('')
	const [formLoading, setFormLoading] = useState(false)
	const [editingSection, setEditingSection] = useState<ProductManualSection | null>(null)
	const [editingChapter, setEditingChapter] = useState<ProductManualChapter | null>(null)

	// Estados para gerenciar dependências - removidos, TreeView tem dialog próprio
	// const [dependencyOffcanvasOpen, setDependencyOffcanvasOpen] = useState(false) // Removido - não utilizado
	// const [dependencyFormMode, setDependencyFormMode] = useState<'add' | 'edit'>('add') // Removido - não utilizado
	// const [selectedParentDependency, setSelectedParentDependency] = useState<ProductDependency | null>(null) // Removido - não utilizado
	// const [editingDependency, setEditingDependency] = useState<ProductDependency | null>(null) // Removido - não utilizado
	// const [dependencyFormData, setDependencyFormData] = useState({ // Removido - não utilizado
	//	name: '',
	//	icon: '',
	//	description: '',
	// })

	// Estados para gerenciamento avançado de dependências
	const [managementOffcanvasOpen, setManagementOffcanvasOpen] = useState(false)
	const [editItemOffcanvasOpen, setEditItemOffcanvasOpen] = useState(false)
	const [selectedItemForEdit, setSelectedItemForEdit] = useState<ProductDependency | null>(null)
	const [loadingManagement, setLoadingManagement] = useState(false)
	const [isAddingNewItem, setIsAddingNewItem] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	// ✅ Debounce para evitar chamadas excessivas
	const [reorderTimeout, setReorderTimeout] = useState<NodeJS.Timeout | null>(null)

	// Dados para formulário de edição/criação de item
	const [editFormData, setEditFormData] = useState({
		name: '',
		icon: '',
		description: '',
		parentId: null as string | null,
	})

	// Função para converter ProductDependency[] para ProductDependencyItem[]
	const convertToProductDependencyItems = (deps: ProductDependency[]): ProductDependencyItem[] => {
		return deps.map((dep) => ({
			...dep,
			productId: productId || '',
			treePath: dep.treePath || undefined, // Converte null para undefined
			sortKey: dep.sortKey || undefined, // Converte null para undefined
			href: undefined,
			collapsed: false,
			children: dep.children ? convertToProductDependencyItems(dep.children) : [],
		}))
	}

	// Função para converter ProductDependencyItem[] de volta para ProductDependency[]
	const convertFromProductDependencyItems = (items: ProductDependencyItem[]): ProductDependency[] => {
		return items.map((item) => ({
			id: item.id.toString(), // Converte para string
			name: item.name,
			icon: item.icon,
			description: item.description,
			parentId: item.parentId,
			treePath: item.treePath || null,
			treeDepth: item.treeDepth || 0, // Garante que sempre seja number
			sortKey: item.sortKey || null,
			children: item.children ? convertFromProductDependencyItems(item.children) : [],
		}))
	}

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

	// ✅ Cleanup do timeout quando componente desmonta
	useEffect(() => {
		return () => {
			if (reorderTimeout) {
				clearTimeout(reorderTimeout)
			}
		}
	}, [reorderTimeout])

	// Lista de ícones disponíveis para seleção (classes completas do Iconify)
	const availableIcons = ['icon-[lucide--server]', 'icon-[lucide--database]', 'icon-[lucide--monitor]', 'icon-[lucide--smartphone]', 'icon-[lucide--wifi]', 'icon-[lucide--network]', 'icon-[lucide--shield]', 'icon-[lucide--key]', 'icon-[lucide--lock]', 'icon-[lucide--globe]', 'icon-[lucide--terminal]', 'icon-[lucide--code]', 'icon-[lucide--git-branch]', 'icon-[lucide--package]', 'icon-[lucide--puzzle]', 'icon-[lucide--zap]', 'icon-[lucide--activity]', 'icon-[lucide--alert-triangle]', 'icon-[lucide--settings]', 'icon-[lucide--settings-2]', 'icon-[lucide--layers]', 'icon-[lucide--workflow]', 'icon-[lucide--cpu]', 'icon-[lucide--hard-drive]', 'icon-[lucide--cloud]', 'icon-[lucide--router]', 'icon-[lucide--usb]', 'icon-[lucide--memory-stick]']

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

				// 🚀 OTIMIZAÇÃO: Uma única chamada para obter summary de soluções
				// Substitui múltiplas chamadas por query SQL otimizada
				const solutionsSummaryRes = await fetch(`/api/products/solutions/summary?productSlug=${slug}`)
				const solutionsSummaryData = await solutionsSummaryRes.json()

				if (solutionsSummaryData.success) {
					setSolutionsCount(solutionsSummaryData.data.totalSolutions)
					setLastUpdated(solutionsSummaryData.data.lastUpdated ? new Date(solutionsSummaryData.data.lastUpdated) : null)
					console.log('✅ Summary de soluções obtido:', solutionsSummaryData.data)
				} else {
					console.error('❌ Erro ao buscar summary de soluções:', solutionsSummaryData.error)
					setSolutionsCount(0)
					setLastUpdated(null)
				}
			} catch (error) {
				console.error('❌ Erro ao buscar dados:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [productId, slug])

	// Função para recarregar dependências (apenas para casos de erro)
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

		// ✅ Atualiza AMBAS as UIs imediatamente para responsividade
		setDependencies(reorderedDependencies) // ✅ Atualiza TreeView da coluna esquerda
		// ✅ NÃO recarrega o MenuBuilder - ele já está atualizado

		// ✅ Cancela timeout anterior se existir
		if (reorderTimeout) {
			clearTimeout(reorderTimeout)
		}

		// ✅ Debounce de 300ms para evitar chamadas excessivas
		const newTimeout = setTimeout(async () => {
			try {
				console.log('🔵 Salvando reordenação no banco - Total:', reorderedDependencies.length, 'itens')

				// Converte hierarquia para lista flat com parentId e sortKey corretos
				const flatList = flattenWithNewSortKeys(reorderedDependencies)
				console.log('🔵 Lista flat gerada:', flatList.length, 'itens para salvar')

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
					console.log('✅ Reordenação salva com sucesso no banco')
					toast({
						type: 'success',
						title: 'Ordem atualizada com sucesso!',
					})
					// ✅ NÃO faz refresh - mantém estado atual
				} else {
					const error = await res.json()
					console.error('❌ Erro da API:', error)
					toast({
						type: 'error',
						title: error.message || 'Erro ao reordenar dependências',
					})

					// ✅ Apenas em caso de erro, reverte
					await refreshDependencies()
				}
			} catch (error) {
				console.error('❌ Erro inesperado ao reordenar:', error)
				toast({
					type: 'error',
					title: 'Erro inesperado. Revertendo mudanças...',
				})

				// ✅ Apenas em caso de erro, reverte
				await refreshDependencies()
			}
		}, 300) // ✅ Debounce de 300ms

		setReorderTimeout(newTimeout)
	}

	// Utilitário para achatar hierarquia e recalcular sortKeys CORRETAMENTE
	const flattenWithNewSortKeys = (
		deps: ProductDependency[],
		parentId: string | null = null,
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

			// ✅ CORREÇÃO: Usa o parentId correto baseado na hierarquia atual
			result.push({
				id: dep.id,
				parentId: parentId, // ✅ Usa o parentId da hierarquia atual, não o antigo
				treePath: currentPath,
				treeDepth: level,
				sortKey: sortKey,
			})

			if (dep.children && dep.children.length > 0) {
				// ✅ CORREÇÃO: Passa o ID atual como parentId para os filhos
				result.push(...flattenWithNewSortKeys(dep.children, dep.id, currentPath, level + 1))
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

	// Estados para dialog de confirmação de exclusão
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [itemToDelete, setItemToDelete] = useState<ProductDependency | null>(null)

	// Abrir dialog de confirmação de exclusão
	const openDeleteDialog = (item: ProductDependency) => {
		setItemToDelete(item)
		setDeleteDialogOpen(true)
	}

	// Confirmar exclusão
	const handleConfirmDelete = async () => {
		if (!itemToDelete) return
		setFormLoading(true)
		try {
			const res = await fetch('/api/products/dependencies', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: itemToDelete.id }),
			})

			if (res.ok) {
				toast({
					type: 'success',
					title: 'Dependência excluída com sucesso!',
				})
				setDeleteDialogOpen(false)
				setItemToDelete(null)
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

	// Converte as dependências para o formato do TreeView component
	const treeNodes = useMemo(() => {
		console.log('🔵 Recalculando treeNodes - Total dependencies:', dependencies.length)
		return convertDependenciesToTreeNodes(dependencies)
	}, [dependencies])

	// Funções removidas - não mais necessárias com TreeView component
	// As ações agora são feitas através do gerenciador de dependências

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

	// Função removida - handleSubmitDependency não é mais necessária
	// Agora usamos o gerenciador de dependências no offcanvas

	// Função removida - não mais necessária com TreeView que tem dialog próprio

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
					<p className='mt-2 text-zinc-600 dark:text-zinc-400'>Carregando base de conhecimento...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex w-full'>
			{/* Componente Coluna Esquerda - ETAPA 1 REFATORAÇÃO */}
			<ProductDependenciesColumn dependencies={dependencies} loading={loading} treeNodes={treeNodes} onOpenManagement={openManagement} />

			{/* Componente Coluna Direita - ETAPA 2 REFATORAÇÃO */}
			<ProductDetailsColumn sections={sections} contacts={contacts} problemsCount={problemsCount} solutionsCount={solutionsCount} lastUpdated={lastUpdated} totalChapters={totalChapters} accordionSections={accordionSections} onAddSection={handleAddSection} formatTimeAgo={formatTimeAgo} />

			{/* Offcanvas para gerenciamento de dependências */}
			<DependencyManagementOffcanvas open={managementOffcanvasOpen} onClose={() => setManagementOffcanvasOpen(false)} dependencies={dependencies} loadingManagement={loadingManagement} convertToProductDependencyItems={convertToProductDependencyItems} convertFromProductDependencyItems={convertFromProductDependencyItems} handleReorderDependencies={handleReorderDependencies} openEditItemForm={openEditItemForm} openDeleteDialog={openDeleteDialog} openAddItemForm={openAddItemForm} />

			{/* Offcanvas para edição/criação de item */}
			<DependencyItemFormOffcanvas open={editItemOffcanvasOpen} onClose={() => setEditItemOffcanvasOpen(false)} isAddingNewItem={isAddingNewItem} editFormData={editFormData} setEditFormData={setEditFormData} onSubmit={handleSubmitItemForm} formLoading={formLoading} availableIcons={availableIcons} isMobile={isMobile} />

			{/* Offcanvas para adicionar seção ou editar capítulo */}
			<ManualSectionFormOffcanvas open={offcanvasOpen} onClose={() => setOffcanvasOpen(false)} formMode={formMode} formTitle={formTitle} setFormTitle={setFormTitle} formDescription={formDescription} setFormDescription={setFormDescription} formContent={formContent} setFormContent={setFormContent} onSubmit={formMode === 'section' ? handleSubmitSection : handleSubmitChapter} formLoading={formLoading} isDarkMode={isDarkMode} />

			{/* Dialog de confirmação de exclusão */}
			<DeleteDependencyDialog
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false)
					setItemToDelete(null)
				}}
				itemToDelete={itemToDelete}
				onConfirm={handleConfirmDelete}
				loading={formLoading}
			/>
		</div>
	)
}
