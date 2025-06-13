'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Removido @dnd-kit - usando HTML5 drag & drop nativo

import TreeView, { type TreeNode } from '@/components/ui/TreeView'
import Accordion, { type Section } from '@/components/ui/Accordion'
import Button from '@/components/ui/Button'
import Offcanvas from '@/components/ui/Offcanvas'
import Label from '@/components/ui/Label'
import Input from '@/components/ui/Input'
import { toast } from '@/lib/toast'
import ProductDependencyMenuBuilder, { type ProductDependencyItem } from '@/components/admin/products/ProductDependencyMenuBuilder'

// Removido MenuBuilder interno - agora usando ProductDependencyMenuBuilder

// Importação dinâmica do Markdown para evitar problemas de SSR
const Markdown = dynamic(() => import('@/components/ui/Markdown'), { ssr: false })

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
					<p className='mt-2 text-zinc-600 dark:text-zinc-400'>Carregando dependências...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex w-full'>
			{/* Side left */}
			<div className='flex md:w-[420px] flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-700'>
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
							<Button type='button' icon='icon-[lucide--settings]' style='unstyled' className='size-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800' onClick={openManagement} title='Gerenciar dependências' />
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
								<Button type='button' icon='icon-[lucide--plus]' style='filled' className='text-xs px-3 py-1.5' onClick={openManagement}>
									Adicionar
								</Button>
							</div>
						)}
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
			<Offcanvas
				open={managementOffcanvasOpen}
				onClose={() => setManagementOffcanvasOpen(false)}
				title={
					<div className='flex items-center gap-3'>
						<span className='icon-[lucide--layers] size-5 text-blue-600' />
						<div>
							<h2 className='text-lg font-semibold'>Gerenciar Dependências</h2>
							<p className='text-sm font-normal text-zinc-500 dark:text-zinc-400'>Organize e configure as dependências do produto</p>
						</div>
					</div>
				}
				width='xl'
			>
				<div className='flex flex-col gap-6 h-full'>
					{/* Cabeçalho com estatísticas */}
					<div className='flex flex-col gap-4 pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-700'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-4'>
								<div className='flex items-center gap-2'>
									<span className='icon-[lucide--folder-tree] size-4 text-zinc-600 dark:text-zinc-400' />
									<span className='text-base font-medium text-zinc-600 dark:text-zinc-400'>{dependencies.length} dependências principais</span>
								</div>
								<div className='flex items-center gap-2'>
									<span className='icon-[lucide--git-branch] size-4 text-zinc-600 dark:text-zinc-400' />
									<span className='text-base font-medium text-zinc-600 dark:text-zinc-400'>{convertToFlatList(dependencies).length} itens no total</span>
								</div>
							</div>
							<Button type='button' icon='icon-[lucide--plus]' style='filled' className='py-2 px-4' onClick={openAddItemForm}>
								Nova Dependência
							</Button>
						</div>

						<div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2'>
							<div className='flex items-start gap-3'>
								<span className='icon-[lucide--info] size-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
								<div className='text-base text-blue-700 dark:text-blue-300'>
									<p className='font-medium mb-1'>Instruções:</p>
									<ul className='space-y-1 text-base'>
										<li>• Arraste e solte para reordenar as dependências.</li>
										<li>• Use o botão de grip para mover itens entre níveis.</li>
										<li>• Clique nos botões de ação para editar ou excluir.</li>
									</ul>
								</div>
							</div>
						</div>
					</div>

					{/* Skeleton de carregamento realista */}
					{loadingManagement && (
						<div className='flex flex-col gap-1'>
							{/* Simula estrutura hierárquica real do MenuBuilder */}
							{[
								{ level: 0, width: '85%' },
								{ level: 1, width: '70%' },
								{ level: 2, width: '60%' },
								{ level: 2, width: '65%' },
								{ level: 1, width: '75%' },
								{ level: 2, width: '55%' },
								{ level: 0, width: '90%' },
								{ level: 1, width: '68%' },
								{ level: 1, width: '72%' },
								{ level: 2, width: '58%' },
								{ level: 0, width: '80%' },
								{ level: 1, width: '66%' },
							].map((item, i) => (
								<div
									key={i}
									className='animate-pulse'
									style={{
										marginLeft: `${item.level * 50}px`,
										maxWidth: '414px',
									}}
								>
									<div className='flex items-center gap-2 p-3 bg-white border border-zinc-200 dark:border-zinc-700 rounded-lg dark:bg-zinc-800'>
										{/* Grip icon skeleton */}
										<div className='w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded flex-shrink-0' />
										{/* Item icon skeleton */}
										<div className='w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded flex-shrink-0' />
										{/* Text skeleton com largura variável */}
										<div className='h-4 bg-zinc-200 dark:bg-zinc-700 rounded flex-1' style={{ width: item.width }} />
										{/* Level badge skeleton */}
										<div className='w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex-shrink-0' />
										{/* Action buttons skeleton */}
										<div className='flex gap-1 flex-shrink-0'>
											<div className='w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full' />
											<div className='w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full' />
											<div className='w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full' />
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* MenuBuilder principal */}
					{!loadingManagement && (
						<div className='flex-1 min-h-0'>
							<ProductDependencyMenuBuilder
								items={convertToProductDependencyItems(dependencies)}
								setItems={(newItems) => {
									const convertedDeps = convertFromProductDependencyItems(newItems)
									// ✅ Apenas chama handleReorderDependencies que já atualiza o estado
									handleReorderDependencies(convertedDeps)
								}}
								onEdit={(id, data) => {
									// Busca a dependência completa pelo ID
									const findDependency = (deps: ProductDependency[], searchId: string): ProductDependency | null => {
										for (const dep of deps) {
											if (dep.id === searchId) return dep
											if (dep.children) {
												const found = findDependency(dep.children, searchId)
												if (found) return found
											}
										}
										return null
									}
									const dependency = findDependency(dependencies, id)
									if (dependency) {
										openEditItemForm(dependency)
									}
								}}
								onDelete={(id, data) => {
									// Busca a dependência completa pelo ID
									const findDependency = (deps: ProductDependency[], searchId: string): ProductDependency | null => {
										for (const dep of deps) {
											if (dep.id === searchId) return dep
											if (dep.children) {
												const found = findDependency(dep.children, searchId)
												if (found) return found
											}
										}
										return null
									}
									const dependency = findDependency(dependencies, id)
									if (dependency) {
										openDeleteDialog(dependency)
									}
								}}
							/>
						</div>
					)}

					{/* Estado vazio */}
					{!loadingManagement && dependencies.length === 0 && (
						<div className='flex-1 flex flex-col items-center justify-center py-12 text-center'>
							<span className='icon-[lucide--layers] mb-4 text-4xl text-zinc-400' />
							<h4 className='text-lg font-medium text-zinc-600 dark:text-zinc-300'>Nenhuma dependência encontrada</h4>
							<p className='text-sm text-zinc-500 dark:text-zinc-400 mb-6'>Comece adicionando as primeiras dependências deste produto.</p>
							<Button type='button' icon='icon-[lucide--plus]' style='filled' onClick={openAddItemForm}>
								Adicionar primeira dependência
							</Button>
						</div>
					)}
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
							{availableIcons.map((iconClass) => (
								<button
									type='button'
									key={iconClass}
									className={`flex items-center justify-center
										size-10 border rounded-lg transition-colors
										${editFormData.icon === iconClass ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
									`}
									onClick={() => setEditFormData((prev) => ({ ...prev, icon: iconClass }))}
									title={iconClass.replace('icon-[lucide--', '').replace(']', '')}
								>
									<span className={`${iconClass} size-5`} />
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
				<form className='flex flex-col gap-6 h-full' onSubmit={formMode === 'section' ? handleSubmitSection : handleSubmitChapter}>
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
						<div className='flex-1 flex flex-col min-h-0'>
							<Label htmlFor='form-content' required>
								Conteúdo do capítulo
							</Label>
							<div className='flex-1 min-h-[300px] max-h-[60vh]'>
								<Markdown value={formContent} onChange={(val) => setFormContent(val || '')} preview='edit' data-color-mode={isDarkMode ? 'dark' : 'light'} className='flex-1 h-full' />
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

			{/* Dialog de confirmação de exclusão */}
			{deleteDialogOpen && (
				<div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40'>
					<div className='bg-white dark:bg-zinc-800 rounded-lg shadow-lg max-w-md mx-4 p-6'>
						<div className='flex items-center gap-3 mb-4'>
							<span className='icon-[lucide--alert-triangle] size-6 text-red-600' />
							<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>Confirmar Exclusão</h3>
						</div>

						<p className='text-sm text-zinc-600 dark:text-zinc-400 mb-6'>
							Tem certeza que deseja excluir a dependência <strong>{itemToDelete?.name}</strong>? Esta ação não pode ser desfeita.
						</p>

						<div className='flex gap-3 justify-end'>
							<button
								type='button'
								onClick={() => {
									setDeleteDialogOpen(false)
									setItemToDelete(null)
								}}
								className='px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors'
								disabled={formLoading}
							>
								Cancelar
							</button>
							<button type='button' onClick={handleConfirmDelete} disabled={formLoading} className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors'>
								{formLoading ? 'Excluindo...' : 'Excluir'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
