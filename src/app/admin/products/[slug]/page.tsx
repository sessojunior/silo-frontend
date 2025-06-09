'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'

import Tree, { type TreeItemProps } from '@/components/ui/Tree'
import Accordion, { type Section } from '@/components/ui/Accordion'
import Button from '@/components/ui/Button'
import Offcanvas from '@/components/ui/Offcanvas'
import Dialog from '@/components/ui/Dialog'
import Label from '@/components/ui/Label'
import Input from '@/components/ui/Input'
import { toast } from '@/lib/toast'

// Importação dinâmica do MDEditor para evitar problemas de SSR
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

// Tipos para os dados da API
interface ProductDependency {
	id: string
	name: string
	type: string
	category: string
	icon?: string
	description?: string
	url?: string
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
				console.error('Erro ao buscar produto:', error)
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
				console.error('Erro ao buscar dados:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [productId, slug])

	// Converte as dependências para o formato do Tree
	const convertToTreeItems = (deps: ProductDependency[]): TreeItemProps[] => {
		return deps.map((dep) => ({
			icon: dep.icon || undefined,
			label: dep.name,
			url: dep.url || undefined,
			children: dep.children ? convertToTreeItems(dep.children) : undefined,
			// Só adiciona onClick para itens que não têm filhos (folhas da árvore)
			onClick: dep.children && dep.children.length > 0 ? undefined : () => handleDependencyClick(dep),
		}))
	}

	// Função para lidar com clique em dependências
	const handleDependencyClick = (dependency: ProductDependency) => {
		setSelectedDependency(dependency)
		setDialogOpen(true)
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
			console.log('Enviando seção:', { productId, title: formTitle, description: formDescription })
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
			console.error('Erro ao adicionar seção:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado ao adicionar seção',
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
			console.log('Editando capítulo:', { id: editingChapter.id, title: formTitle, content: formContent })
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
			console.error('Erro ao atualizar capítulo:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado ao atualizar capítulo',
			})
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
			{/* Side left */}
			<div className='flex w-[320px] flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-700'>
				<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
					{/* Tree */}
					<div className='px-8 pt-8' role='tree' aria-orientation='vertical'>
						{treeItems.map((category, index) => (
							<div key={index} className='pb-8'>
								<h3 className='pb-4 text-xl font-medium'>{category.label}</h3>
								{category.children?.map((child, childIndex) => <Tree key={childIndex} item={child as TreeItemProps} defaultOpen={false} activeUrl={`/admin/products/${slug}`} />)}
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

			{/* Dialog para informações da dependência */}
			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				title={
					<div className='flex items-center gap-2'>
						{selectedDependency?.icon && <span className={`${selectedDependency.icon} size-5`} />}
						{selectedDependency?.name || 'Dependência'}
					</div>
				}
			>
				{selectedDependency && (
					<div className='flex flex-col gap-4 pt-2'>
						<div>
							<div className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>Tipo</div>
							<div className='text-base capitalize'>{selectedDependency.type}</div>
						</div>
						<div>
							<div className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>Categoria</div>
							<div className='text-base capitalize'>{selectedDependency.category}</div>
						</div>
						{selectedDependency.description && (
							<div>
								<div className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>Descrição</div>
								<div className='text-base'>{selectedDependency.description}</div>
							</div>
						)}
						{selectedDependency.url && (
							<div>
								<div className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>Documentação</div>
								<a href={selectedDependency.url} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'>
									Abrir link externo
								</a>
							</div>
						)}
					</div>
				)}
			</Dialog>
		</div>
	)
}
