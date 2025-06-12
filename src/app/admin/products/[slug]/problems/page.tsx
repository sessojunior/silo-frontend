'use client'

import ReactMarkdown from 'react-markdown'
import Button from '@/components/ui/Button'
import { getMarkdownClasses } from '@/lib/markdown'
import { useEffect, useState, useRef } from 'react'
import type { ProductProblem, ProductProblemImage } from '@/lib/db/schema'

// Tipo customizado para soluções retornadas pela API
interface SolutionWithDetails {
	id: string
	replyId: string | null
	date: Date
	description: string
	verified: boolean
	user: {
		id: string
		name: string
		image: string
	}
	image: {
		image: string
		description: string
	} | null
	isMine: boolean
}
import { useParams, useRouter } from 'next/navigation'
import Lightbox from '@/components/ui/Lightbox'
import Offcanvas from '@/components/ui/Offcanvas'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import { toast } from '@/lib/toast'
import clsx from 'clsx'
import Dialog from '@/components/ui/Dialog'
import PhotoUpload from '@/components/ui/PhotoUpload'
import Modal from '@/components/ui/Modal'
import { useUser } from '@/context/UserContext'

export default function ProblemsPage() {
	const { slug } = useParams()
	const router = useRouter()
	const user = useUser()
	const [problems, setProblems] = useState<ProductProblem[]>([])
	const [problem, setProblem] = useState<ProductProblem | null>(null)
	const [solutions, setSolutions] = useState<SolutionWithDetails[]>([])
	const [images, setImages] = useState<ProductProblemImage[]>([])
	const [solutionsCount, setSolutionsCount] = useState<Record<string, number>>({})
	const [loadingDetail, setLoadingDetail] = useState(false)
	const [initialLoading, setInitialLoading] = useState(true)
	const [filter, setFilter] = useState('')
	const [visibleCount, setVisibleCount] = useState(10)
	const listRef = useRef<HTMLDivElement>(null)
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const [lightboxImage, setLightboxImage] = useState<{ src: string; alt?: string } | null>(null)
	const [offcanvasOpen, setOffcanvasOpen] = useState(false)
	const [formTitle, setFormTitle] = useState('')
	const [formDescription, setFormDescription] = useState('')
	const [formLoading, setFormLoading] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)
	const [form, setForm] = useState<{ field: string | null; message: string | null }>({
		field: null,
		message: null,
	})
	const [productId, setProductId] = useState<string | null>(null)
	const [editing, setEditing] = useState<ProductProblem | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [previewFile, setPreviewFile] = useState<File | null>(null)
	const [deleteImageId, setDeleteImageId] = useState<string | null>(null)
	const [deleteImageLoading, setDeleteImageLoading] = useState(false)
	const [solutionModalOpen, setSolutionModalOpen] = useState(false)
	const [solutionMode, setSolutionMode] = useState<'create' | 'edit' | 'reply'>('create')
	const [editingSolution, setEditingSolution] = useState<SolutionWithDetails | null>(null)
	const [solutionDescription, setSolutionDescription] = useState('')
	const [solutionImage, setSolutionImage] = useState<File | null>(null)
	const [solutionImagePreview, setSolutionImagePreview] = useState<string | null>(null)
	const [solutionLoading, setSolutionLoading] = useState(false)
	const [solutionError, setSolutionError] = useState<string | null>(null)
	const [replyTo, setReplyTo] = useState<SolutionWithDetails | null>(null)
	const [deleteSolutionDialogOpen, setDeleteSolutionDialogOpen] = useState(false)
	const [solutionToDelete, setSolutionToDelete] = useState<SolutionWithDetails | null>(null)
	const [deleteSolutionLoading, setDeleteSolutionLoading] = useState(false)
	const [expandedSolutionIds, setExpandedSolutionIds] = useState<string[]>([])

	// Função para selecionar um problema e buscar seus dados
	const handleSelectProblem = async (selected: ProductProblem) => {
		setProblem(selected)
		setLoadingDetail(true)
		try {
			const [solutionsRes, imagesRes] = await Promise.all([
				fetch(`/api/products/solutions?problemId=${selected.id}`),
				fetch(`/api/products/images?problemId=${selected.id}`),
			])
			const solutionsData = await solutionsRes.json()
			const imagesData = await imagesRes.json()

			// Sobrescreve isMine para cada solução
			const solutionsWithIsMine = (solutionsData.items || []).map((sol: any) => ({
				...sol,
				isMine: sol.user?.id === user.id,
			}))
			setSolutions(solutionsWithIsMine)
			setImages(imagesData.items)
		} finally {
			setLoadingDetail(false)
		}
	}

	useEffect(() => {
		const fetchProblems = async () => {
			setInitialLoading(true)
			try {
				const response = await fetch(`/api/products/problems?slug=${slug}`)
				const data = await response.json()

				if (!response.ok) {
					console.error('Erro ao buscar problemas:', data)
					toast({ type: 'error', title: 'Erro ao carregar problemas' })
					return
				}

				setProblems(data.items || [])

				if (data.items && data.items.length > 0) {
					setProductId(data.items[0].productId) // Salva o productId do primeiro problema

					// Busca a contagem de soluções para cada problema
					const counts: Record<string, number> = {}
					await Promise.all(
						data.items.map(async (problem: ProductProblem) => {
							const res = await fetch(`/api/products/solutions?problemId=${problem.id}`)
							const solData = await res.json()
							counts[problem.id] = solData.items?.length || 0
						}),
					)
					setSolutionsCount(counts)

					// Seleciona e carrega o primeiro problema
					handleSelectProblem(data.items[0])
				}
			} catch (error) {
				console.error('❌ Erro ao buscar problemas:', error)
				toast({ type: 'error', title: 'Erro ao carregar problemas' })
			} finally {
				setInitialLoading(false)
			}
		}

		fetchProblems()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug])

	useEffect(() => {
		const handleScroll = () => {
			if (!listRef.current) return
			const { scrollTop, scrollHeight, clientHeight } = listRef.current
			if (scrollTop + clientHeight >= scrollHeight - 10) {
				setVisibleCount((prev) => prev + 10)
			}
		}
		const el = listRef.current
		if (el) el.addEventListener('scroll', handleScroll)
		return () => {
			if (el) el.removeEventListener('scroll', handleScroll)
		}
	}, [])

	const filteredProblems = problems.filter(
		(p) =>
			filter.trim().length === 0 ||
			p.title.toLowerCase().includes(filter.toLowerCase()) ||
			p.description.toLowerCase().includes(filter.toLowerCase()),
	)
	const problemsToShow = filteredProblems.slice(0, visibleCount)

	// Função para abrir o Offcanvas para editar
	function handleEditProblem() {
		if (problem) {
			setEditing(problem)
			setFormTitle(problem.title)
			setFormDescription(problem.description)
			setOffcanvasOpen(true)
		}
	}

	// Função para submeter o formulário (cadastrar ou editar)
	async function handleAddOrEditProblem(e: React.FormEvent) {
		e.preventDefault()
		setFormError(null)
		if (formTitle.trim().length < 5) {
			setFormError('O título deve ter pelo menos 5 caracteres.')
			return
		}
		if (formDescription.trim().length < 20) {
			setFormError('A descrição deve ter pelo menos 20 caracteres.')
			return
		}
		setFormLoading(true)
		try {
			let res, data
			if (editing) {
				// Editar
				res = await fetch('/api/products/problems', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: editing.id,
						title: formTitle,
						description: formDescription,
					}),
				})
				data = await res.json()
				if (res.ok) {
					toast({
						type: 'success',
						title: 'Problema atualizado',
						description: 'O problema foi atualizado com sucesso.',
					})
					setOffcanvasOpen(false)
					setEditing(null)
					setFormTitle('')
					setFormDescription('')
					// Atualiza a lista de problemas
					const response = await fetch(`/api/products/problems?slug=${slug}`)
					const data = await response.json()
					setProblems(data.items || [])
					const counts: Record<string, number> = {}
					if (data.items && data.items.length > 0) {
						await Promise.all(
							data.items.map(async (problem: ProductProblem) => {
								const res = await fetch(`/api/products/solutions?problemId=${problem.id}`)
								const solData = await res.json()
								counts[problem.id] = solData.items?.length || 0
							}),
						)
					}
					setSolutionsCount(counts)
					// Após atualizar a lista de problemas
					const updatedProblems: ProductProblem[] = data.items ?? []
					const updated = updatedProblems.find((p: ProductProblem) => p.id === editing.id)
					if (updated) handleSelectProblem(updated)
				} else {
					setFormError(data.message || 'Erro ao atualizar problema.')
					toast({
						type: 'error',
						title: 'Erro',
						description: data.message || 'Erro ao atualizar problema.',
					})
				}
			} else {
				// Cadastrar
				if (!productId) {
					setFormError('Produto não encontrado. Recarregue a página ou tente novamente.')
					toast({ type: 'error', title: 'Produto não encontrado.' })
					return
				}
				res = await fetch('/api/products/problems', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						productId,
						title: formTitle,
						description: formDescription,
					}),
				})
				data = await res.json()
				if (res.ok) {
					toast({
						type: 'success',
						title: 'Problema cadastrado',
						description: 'O problema foi adicionado com sucesso.',
					})
					setOffcanvasOpen(false)
					setFormTitle('')
					setFormDescription('')
					// Atualiza a lista de problemas
					const response = await fetch(`/api/products/problems?slug=${slug}`)
					const data = await response.json()
					setProblems(data.items || [])
					const counts: Record<string, number> = {}
					if (data.items && data.items.length > 0) {
						await Promise.all(
							data.items.map(async (problem: ProductProblem) => {
								const res = await fetch(`/api/products/solutions?problemId=${problem.id}`)
								const solData = await res.json()
								counts[problem.id] = solData.items?.length || 0
							}),
						)
					}
					setSolutionsCount(counts)
					// Após atualizar a lista de problemas
					const updatedProblems: ProductProblem[] = data.items ?? []
					const novo = updatedProblems[0]
					if (novo) handleSelectProblem(novo)
				} else {
					setFormError(data.message || 'Erro ao cadastrar problema.')
					toast({
						type: 'error',
						title: 'Erro',
						description: data.message || 'Erro ao cadastrar problema.',
					})
				}
			}
		} catch (e) {
			setFormError('Erro ao salvar problema.')
			toast({ type: 'error', title: 'Erro', description: 'Erro ao salvar problema.' })
		} finally {
			setFormLoading(false)
		}
	}

	// Função para excluir problema
	async function handleDeleteProblem() {
		if (!editing) return
		setDeleteLoading(true)
		try {
			const res = await fetch('/api/products/problems', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: editing.id }),
			})
			const data = await res.json()
			if (res.ok) {
				toast({
					type: 'success',
					title: 'Problema excluído',
					description: 'O problema e todos os dados relacionados foram removidos.',
				})
				setOffcanvasOpen(false)
				setDeleteDialogOpen(false)
				setEditing(null)
				setFormTitle('')
				setFormDescription('')
				// Atualiza a lista de problemas
				const response = await fetch(`/api/products/problems?slug=${slug}`)
				const data = await response.json()
				setProblems(data.items || [])
				const counts: Record<string, number> = {}
				if (data.items && data.items.length > 0) {
					await Promise.all(
						data.items.map(async (problem: ProductProblem) => {
							const res = await fetch(`/api/products/solutions?problemId=${problem.id}`)
							const solData = await res.json()
							counts[problem.id] = solData.items?.length || 0
						}),
					)
				}
				setSolutionsCount(counts)
				// Seleciona o primeiro problema, se houver
				if (data.items[0]) {
					handleSelectProblem(data.items[0])
				} else {
					setProblem(null)
					setSolutions([])
					setImages([])
				}
			} else {
				toast({
					type: 'error',
					title: 'Erro',
					description: data.message || 'Erro ao excluir problema.',
				})
			}
		} catch (e) {
			toast({ type: 'error', title: 'Erro', description: 'Erro ao excluir problema.' })
		} finally {
			setDeleteLoading(false)
		}
	}

	// Função para abrir modal de solução
	function openSolutionModal(mode: 'create' | 'edit' | 'reply', solution?: SolutionWithDetails) {
		setSolutionMode(mode)
		setSolutionModalOpen(true)
		setSolutionError(null)
		if (mode === 'edit' && solution) {
			setEditingSolution(solution)
			setSolutionDescription(solution.description)
			// TODO: buscar imagem da solução se existir (API)
			setSolutionImage(null)
			setSolutionImagePreview(null)
			setReplyTo(null)
		} else if (mode === 'reply' && solution) {
			setReplyTo(solution)
			setEditingSolution(null)
			setSolutionDescription('')
			setSolutionImage(null)
			setSolutionImagePreview(null)
		} else {
			setEditingSolution(null)
			setReplyTo(null)
			setSolutionDescription('')
			setSolutionImage(null)
			setSolutionImagePreview(null)
		}
	}

	// Função para fechar modal de solução
	function closeSolutionModal() {
		setSolutionModalOpen(false)
		setEditingSolution(null)
		setReplyTo(null)
		setSolutionDescription('')
		setSolutionImage(null)
		setSolutionImagePreview(null)
		setSolutionError(null)
	}

	// Função para submit do modal de solução
	async function handleSolutionSubmit(e: React.FormEvent) {
		e.preventDefault()
		setSolutionError(null)
		if (solutionDescription.trim().length < 2) {
			setSolutionError('A descrição deve ter pelo menos 2 caracteres.')
			return
		}
		if (solutionImage && solutionImage.size > 4 * 1024 * 1024) {
			setSolutionError('A imagem deve ter no máximo 4MB.')
			return
		}
		setSolutionLoading(true)
		try {
			const formData = new FormData()
			formData.append('description', solutionDescription)
			formData.append('problemId', problem?.id || '')
			if (solutionMode === 'reply' && replyTo) {
				formData.append('replyId', replyTo.id)
			}
			if (solutionMode === 'edit' && editingSolution) {
				formData.append('id', editingSolution.id)
			}
			if (solutionImage) {
				formData.append('file', solutionImage)
			}
			const method = solutionMode === 'edit' ? 'PUT' : 'POST'
			const res = await fetch('/api/products/solutions', {
				method,
				body: formData,
			})
			const data = await res.json()
			if (res.ok) {
				toast({
					type: 'success',
					title: solutionMode === 'edit' ? 'Solução atualizada' : 'Solução cadastrada',
				})
				closeSolutionModal()
				// Atualiza lista de soluções
				if (problem) {
					await atualizarSolucoes(problem.id)
				}
			} else {
				setSolutionError(data.message || 'Erro ao salvar solução.')
				toast({
					type: 'error',
					title: 'Erro',
					description: data.message || 'Erro ao salvar solução.',
				})
			}
		} catch (e) {
			setSolutionError('Erro ao salvar solução.')
			toast({ type: 'error', title: 'Erro', description: 'Erro ao salvar solução.' })
		} finally {
			setSolutionLoading(false)
		}
	}

	// Função para abrir o Dialog de confirmação de exclusão de solução
	function openDeleteSolutionDialog(solution: SolutionWithDetails) {
		setSolutionToDelete(solution)
		setDeleteSolutionDialogOpen(true)
	}

	// Função para deletar solução (chamada após confirmação)
	async function confirmDeleteSolution() {
		if (!solutionToDelete) return
		setDeleteSolutionLoading(true)
		try {
			const res = await fetch('/api/products/solutions', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: solutionToDelete.id }),
			})
			if (res.ok) {
				toast({ type: 'success', title: 'Solução excluída' })
				setDeleteSolutionDialogOpen(false)
				setSolutionToDelete(null)
				// Atualiza lista de soluções
				if (problem) {
					await atualizarSolucoes(problem.id)
				}
			} else {
				toast({ type: 'error', title: 'Erro ao excluir solução' })
			}
		} catch (e) {
			toast({ type: 'error', title: 'Erro ao excluir solução' })
		} finally {
			setDeleteSolutionLoading(false)
		}
	}

	// Sempre que atualizar as soluções (ex: após criar/editar/excluir), sobrescreve isMine
	async function atualizarSolucoes(problemId: string) {
		const solutionsRes = await fetch(`/api/products/solutions?problemId=${problemId}`)
		const solutionsData = await solutionsRes.json()
		const solutionsWithIsMine = (solutionsData.items || []).map((sol: any) => ({
			...sol,
			isMine: sol.user?.id === user.id,
		}))
		setSolutions(solutionsWithIsMine)
	}

	// Função para alternar expansão da descrição
	function toggleExpandSolution(id: string) {
		setExpandedSolutionIds((prev) =>
			prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
		)
	}

	if (initialLoading) {
		return (
			<div className='flex h-[calc(100vh-131px)] w-full items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin text-4xl'>⏳</div>
					<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
						Carregando problemas e soluções...
					</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className='flex w-full'>
				{/* Coluna da esquerda */}
				<div className='flex w-full flex-shrink-0 flex-col border-r border-zinc-200 sm:w-[480px] dark:border-zinc-700'>
					<div ref={listRef} className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
						{/* Campo de busca */}
						<div className='border-b border-zinc-200 px-8 py-4 flex items-center gap-2'>
							<div className='relative flex flex-1 h-10'>
								<input
									type='text'
									name='problem'
									value={filter}
									onChange={(e) => setFilter(e.target.value)}
									className='block w-full rounded-lg border-zinc-200 px-4 py-2.5 pe-11 sm:py-3 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500'
									placeholder='Procurar problema...'
								/>
								<div className='pointer-events-none absolute inset-y-0 end-0 z-20 flex items-center pe-4'>
									<span className='icon-[lucide--search] ml-1 size-4 shrink-0 text-zinc-400 dark:text-zinc-500'></span>
								</div>
							</div>
							<Button
								type='button'
								icon='icon-[lucide--plus]'
								style='unstyled'
								className='flex size-10'
								title='Adicionar problema'
								aria-label='Adicionar problema'
								onClick={() => setOffcanvasOpen(true)}
							/>
						</div>

						{filteredProblems.length > 0 ? (
							<ListProblems
								problems={problemsToShow}
								solutionsCount={solutionsCount}
								onSelect={handleSelectProblem}
								selectedId={problem?.id ?? null}
								loadingDetail={loadingDetail}
							/>
						) : (
							<div className='border-b border-zinc-200 p-8'>
								<div
									className='rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-zinc-600 dark:bg-yellow-800/10 dark:text-zinc-500'
									role='alert'
								>
									<div className='flex flex-col'>
										<div className='flex justify-center pb-1'>
											<span className='icon-[lucide--search-x] size-12 shrink-0 text-zinc-300 dark:text-zinc-500'></span>
										</div>
										<div className='flex flex-col'>
											<h3 className='text-center text-base font-semibold text-zinc-600 dark:text-zinc-300'>
												Nenhum resultado
											</h3>
											<div className='text-center text-sm text-zinc-700 dark:text-zinc-400'>
												Nenhum resultado para o texto informado.
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						<div className='px-8 py-4'>
							<div className='flex justify-center'>
								<Button
									type='button'
									icon='icon-[lucide--plus]'
									style='unstyled'
									className='py-2'
									onClick={() => setOffcanvasOpen(true)}
								>
									Adicionar problema
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Coluna direita com o problema selecionado */}
				<div className='flex w-full flex-grow flex-col'>
					<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
						{loadingDetail ? (
							<div className='flex items-center justify-center h-full'>
								<div className='text-center'>
									<div className='animate-spin text-4xl'>⏳</div>
									<p className='mt-2 text-zinc-600 dark:text-zinc-400'>Carregando detalhes...</p>
								</div>
							</div>
						) : (
							<>
								{/* Descrição do problema */}
								<div className='flex w-full flex-col p-8'>
									<div className='flex w-full items-center justify-between pb-6'>
										<div>
											<h3 className='text-xl font-medium'>
												{problem ? problem.title : 'Sem problemas'}
											</h3>
											{problem && solutions.length > 0 && (
												<div className='text-base'>
													<span className='text-sm font-medium'>{solutions.length} soluções</span>{' '}
													<span className='text-zinc-300 dark:text-zinc-600'>•</span>{' '}
													<span className='text-sm text-zinc-400'>
														Registrado em {formatDate(problem.createdAt)}
													</span>
												</div>
											)}
										</div>
										{problem && (
											<Button
												type='button'
												icon='icon-[lucide--edit]'
												style='unstyled'
												className='shrink-0 py-2'
												onClick={handleEditProblem}
											>
												Editar problema
											</Button>
										)}
									</div>

									<div className={getMarkdownClasses('base', 'text-zinc-800 dark:text-zinc-200')}>
										{/* Uso de Markdown para a descrição */}
										<ReactMarkdown>
											{problem
												? problem.description
												: 'Nenhum problema registrado para este produto.'}
										</ReactMarkdown>
									</div>

									<div className='flex gap-6 pt-6'>
										{images.length > 0 &&
											images.map(({ id, image, description }) => (
												<div key={id}>
													<img
														className='h-32 w-auto rounded-lg cursor-pointer transition hover:brightness-90'
														src={image}
														alt={description}
														onClick={() => {
															setLightboxImage({ src: image, alt: description })
															setLightboxOpen(true)
														}}
													/>
												</div>
											))}
									</div>
								</div>

								{/* Soluções */}
								{solutions.length > 0 && (
									<div className='flex w-full flex-col border-t border-zinc-200 p-8'>
										<div className='flex w-full items-center justify-between pb-6'>
											<div>
												<h3 className='text-xl font-medium'>Soluções</h3>
												<div>
													<span className='text-sm font-medium'>
														{solutions.length} soluções para o problema{' '}
														<span className='text-zinc-300 dark:text-zinc-600'>•</span>{' '}
														{solutions.filter((s) => s.verified).length} foram verificadas
													</span>
												</div>
											</div>
											<Button
												type='button'
												icon='icon-[lucide--plus]'
												style='unstyled'
												className='shrink-0 py-2'
												onClick={() => openSolutionModal('create')}
											>
												Adicionar solução
											</Button>
										</div>

										{/* Soluções principais */}
										<div className='flex flex-col gap-y-4'>
											{solutions
												.filter((solution) => solution.replyId === null)
												.map((solution) => {
													const isExpanded = expandedSolutionIds.includes(solution.id)
													const shouldTruncate = solution.description.length > 300 // ajuste conforme necessário
													return (
														<div key={solution.id} className='flex gap-x-2'>
															<div className='size-12 shrink-0'>
																<img
																	src={solution.user.image}
																	alt={solution.user.name}
																	className='size-full rounded-full'
																/>
															</div>
															<div className='flex flex-col'>
																<div className='flex flex-col gap-y-1'>
																	<div className='text-base'>
																		<span className='font-bold text-zinc-700 dark:text-zinc-200'>
																			{solution.user.name}
																		</span>{' '}
																		<span className='text-zinc-300 dark:text-zinc-600'>•</span>{' '}
																		<span className='text-sm text-zinc-400'>
																			{formatDate(solution.date)}
																		</span>
																		{solution.verified && (
																			<span className='ml-2 inline-flex items-center gap-x-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-500/10 dark:text-green-500'>
																				<span className='icon-[lucide--check] size-3 shrink-0'></span>
																				Resposta verificada
																			</span>
																		)}
																	</div>
																	{/* Descrição truncada/expandida */}
																	<div
																		className={clsx(
																			getMarkdownClasses(
																				'compact',
																				'text-zinc-600 dark:text-zinc-300',
																			),
																			!isExpanded && 'line-clamp-4',
																		)}
																		style={{
																			display: '-webkit-box',
																			WebkitLineClamp: 4,
																			WebkitBoxOrient: 'vertical',
																			overflow: 'hidden',
																		}}
																	>
																		<ReactMarkdown>{solution.description}</ReactMarkdown>
																	</div>
																	{/* Link leia mais/ver menos */}
																	{shouldTruncate && (
																		<button
																			type='button'
																			className='text-xs text-blue-600 hover:underline mt-1 self-start'
																			onClick={() => toggleExpandSolution(solution.id)}
																		>
																			{isExpanded ? '[ver menos]' : '[...leia mais]'}
																		</button>
																	)}
																	{/* Imagem da solução */}
																	{solution.image && solution.image.image && (
																		<div>
																			<img
																				src={solution.image.image}
																				alt={solution.image.description || 'Imagem da solução'}
																				className='mt-2 h-32 w-auto rounded-lg border border-zinc-200 shadow-sm cursor-pointer hover:brightness-90'
																				onClick={() => {
																					if (solution.image && solution.image.image) {
																						setLightboxImage({
																							src: solution.image.image,
																							alt: solution.image.description || '',
																						})
																						setLightboxOpen(true)
																					}
																				}}
																			/>
																		</div>
																	)}
																</div>
																{/* Botões de ação */}
																<div className='flex gap-1 py-2'>
																	<Button
																		type='button'
																		icon='icon-[lucide--reply]'
																		style='unstyled'
																		className='py-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800 dark:text-blue-500 dark:hover:bg-blue-800/30 dark:hover:text-blue-400'
																		onClick={() => openSolutionModal('reply', solution)}
																	>
																		Responder
																	</Button>
																	{solution.isMine && (
																		<>
																			<Button
																				type='button'
																				icon='icon-[lucide--edit]'
																				style='unstyled'
																				className='py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
																				onClick={() => openSolutionModal('edit', solution)}
																			>
																				Editar
																			</Button>
																			<Button
																				type='button'
																				icon='icon-[lucide--trash]'
																				style='unstyled'
																				className='py-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/30 dark:hover:text-red-300'
																				onClick={() => openDeleteSolutionDialog(solution)}
																			>
																				Excluir
																			</Button>
																		</>
																	)}
																</div>
																{/* Replies */}
																<div className='flex flex-col gap-y-3'>
																	{solutions
																		.filter((reply) => reply.replyId === solution.id)
																		.map((reply) => {
																			const isReplyExpanded = expandedSolutionIds.includes(reply.id)
																			const shouldReplyTruncate = reply.description.length > 300
																			return (
																				<div key={reply.id} className='flex gap-x-2 ml-4 mt-2'>
																					<div className='size-12 shrink-0'>
																						<img
																							src={reply.user.image}
																							alt={reply.user.name}
																							className='size-full rounded-full'
																						/>
																					</div>
																					<div className='flex flex-col'>
																						<div className='flex flex-col gap-y-1'>
																							<div className='text-base'>
																								<span className='font-bold text-zinc-700 dark:text-zinc-200'>
																									{reply.user.name}
																								</span>{' '}
																								<span className='text-zinc-300 dark:text-zinc-600'>
																									•
																								</span>{' '}
																								<span className='text-sm text-zinc-400'>
																									{formatDate(reply.date)}
																								</span>
																								{reply.verified && (
																									<span className='ml-2 inline-flex items-center gap-x-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-500/10 dark:text-green-500'>
																										<span className='icon-[lucide--check] size-3 shrink-0'></span>
																										Resposta verificada
																									</span>
																								)}
																							</div>
																							{/* Descrição truncada/expandida para reply */}
																							<div
																								className={clsx(
																									getMarkdownClasses(
																										'compact',
																										'text-zinc-600 dark:text-zinc-300',
																									),
																									!isReplyExpanded && 'line-clamp-4',
																								)}
																								style={{
																									display: '-webkit-box',
																									WebkitLineClamp: 4,
																									WebkitBoxOrient: 'vertical',
																									overflow: 'hidden',
																								}}
																							>
																								<ReactMarkdown>{reply.description}</ReactMarkdown>
																							</div>
																							{shouldReplyTruncate && (
																								<button
																									type='button'
																									className='text-xs text-blue-600 hover:underline mt-1 self-start'
																									onClick={() => toggleExpandSolution(reply.id)}
																								>
																									{isReplyExpanded
																										? '[ver menos]'
																										: '[...leia mais]'}
																								</button>
																							)}
																							{/* Imagem da reply */}
																							{reply.image && reply.image.image && (
																								<img
																									src={reply.image.image}
																									alt={
																										reply.image.description || 'Imagem da solução'
																									}
																									className='mt-2 h-32 w-auto rounded-lg border border-zinc-200 shadow-sm cursor-pointer hover:brightness-90'
																									onClick={() => {
																										// Já verificado que image existe no conditional acima
																										setLightboxImage({
																											src: reply.image!.image,
																											alt: reply.image!.description || '',
																										})
																										setLightboxOpen(true)
																									}}
																								/>
																							)}
																						</div>
																						{/* Botões de ação para replies */}
																						<div className='flex gap-2 py-2'>
																							<Button
																								type='button'
																								icon='icon-[lucide--plus]'
																								style='unstyled'
																								className='py-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800 dark:text-blue-500 dark:hover:bg-blue-800/30 dark:hover:text-blue-400'
																								onClick={() => openSolutionModal('reply', reply)}
																							>
																								Responder
																							</Button>
																							{reply.isMine && (
																								<>
																									<Button
																										type='button'
																										icon='icon-[lucide--edit]'
																										style='unstyled'
																										className='py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
																										onClick={() => openSolutionModal('edit', reply)}
																									>
																										Editar
																									</Button>
																									<Button
																										type='button'
																										icon='icon-[lucide--trash]'
																										style='unstyled'
																										className='py-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/30 dark:hover:text-red-300'
																										onClick={() => openDeleteSolutionDialog(reply)}
																									>
																										Excluir
																									</Button>
																								</>
																							)}
																						</div>
																					</div>
																				</div>
																			)
																		})}
																</div>
															</div>
														</div>
													)
												})}
										</div>
									</div>
								)}
								{/* Lightbox para imagem em destaque */}
								<Lightbox
									open={lightboxOpen}
									image={lightboxImage?.src || ''}
									alt={lightboxImage?.alt}
									onClose={() => setLightboxOpen(false)}
								/>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Offcanvas para adicionar problema */}
			<Offcanvas
				open={offcanvasOpen}
				onClose={() => {
					setOffcanvasOpen(false)
					setEditing(null)
				}}
				title={editing ? 'Editar problema' : 'Adicionar problema'}
				width='xl'
			>
				<form onSubmit={handleAddOrEditProblem} className='flex flex-col gap-6'>
					<div>
						<Label htmlFor='problem-title' required>
							Título do problema
						</Label>
						<Input
							id='problem-title'
							type='text'
							value={formTitle}
							setValue={setFormTitle}
							minLength={5}
							maxLength={120}
							required
							placeholder='Ex: Erro ao processar dados meteorológicos'
							isInvalid={form.field === 'title'}
							invalidMessage={form.field === 'title' ? (form.message ?? undefined) : undefined}
						/>
					</div>
					<div>
						<Label htmlFor='problem-description' required>
							Descrição detalhada
						</Label>
						<textarea
							id='problem-description'
							value={formDescription}
							onChange={(e) => setFormDescription(e.target.value)}
							minLength={20}
							maxLength={3000}
							required
							className={clsx(
								'block w-full rounded-lg border-zinc-200 px-4 py-3 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500',
								form.field === 'description' && 'border-red-400',
							)}
							rows={16}
							placeholder='Descreva o problema detalhadamente para facilitar o suporte e a resolução.'
						/>
					</div>
					{form.field === 'description' && (
						<div className='text-red-600 text-sm'>{form.message}</div>
					)}
					{!editing && (
						<div className='text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg'>
							Imagens poderão ser adicionadas após o cadastro do problema, na tela de edição.
						</div>
					)}
					{editing && (
						<div className='flex flex-col gap-4'>
							<div className='font-semibold'>Imagens do problema</div>
							<div className='flex gap-4 items-center flex-wrap'>
								{/* Grid de imagens existentes */}
								{images.length > 0 &&
									images.map((img) => (
										<div
											key={img.id}
											className='relative flex flex-col items-center justify-center'
										>
											{/* Miniatura com Lightbox */}
											<div
												className='group cursor-pointer flex items-center justify-center h-32 w-32 bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden relative'
												onClick={() => {
													setLightboxImage({ src: img.image, alt: img.description })
													setLightboxOpen(true)
												}}
											>
												<img
													src={img.image}
													alt={img.description}
													className='object-contain h-full w-full transition-transform duration-200 group-hover:scale-105'
													style={{ maxHeight: '8rem', maxWidth: '8rem' }}
												/>
												{/* Botão de apagar no canto superior direito */}
												<button
													type='button'
													className='absolute top-1 right-1 z-10 flex items-center justify-center size-8 bg-red-100/80 rounded-full p-0.5 text-red-600 shadow hover:bg-red-200 transition'
													title='Excluir imagem'
													onClick={(e) => {
														e.stopPropagation()
														setDeleteImageId(img.id)
													}}
												>
													<span className='icon-[lucide--trash] size-4 flex items-center justify-center' />
												</button>
											</div>
										</div>
									))}
								{/* Botão de upload (div quadrada) */}
								<div className='flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-blue-400 dark:border-zinc-600 dark:hover:border-blue-500 transition group relative'>
									<input
										type='file'
										name='file-upload'
										accept='image/png, image/jpeg, image/webp'
										className='absolute inset-0 opacity-0 cursor-pointer z-10'
										style={{ width: '100%', height: '100%' }}
										onChange={(e) => {
											const file = e.target.files?.[0]
											if (file) {
												setPreviewFile(file)
											}
										}}
									/>
									<span className='icon-[lucide--plus] size-10 text-zinc-400 group-hover:text-blue-500 dark:text-zinc-500 dark:group-hover:text-blue-400' />
									<span className='text-xs text-zinc-400 dark:text-zinc-500 mt-2'>Adicionar</span>
								</div>
								{/* Preview da imagem selecionada */}
								{previewFile && (
									<div className='flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-blue-400 rounded-lg relative'>
										<img
											src={URL.createObjectURL(previewFile)}
											alt='Preview'
											className='object-contain h-full w-full rounded-lg'
											style={{ maxHeight: '8rem', maxWidth: '8rem' }}
										/>
										<button
											type='button'
											className='absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow hover:bg-blue-700 transition'
											onClick={async () => {
												const formData = new FormData()
												formData.append('file', previewFile)
												formData.append('productProblemId', editing.id)
												const res = await fetch('/api/products/images', {
													method: 'POST',
													body: formData,
												})
												if (res.ok) {
													toast({ type: 'success', title: 'Imagem enviada' })
													setPreviewFile(null)
													// Atualiza lista de imagens
													const imagesRes = await fetch(
														`/api/products/images?problemId=${editing.id}`,
													)
													const imagesData = await imagesRes.json()
													setImages(imagesData.items)
												} else {
													toast({ type: 'error', title: 'Erro ao enviar imagem' })
												}
											}}
										>
											Enviar
										</button>
										<button
											type='button'
											className='absolute top-2 right-2 size-8 flex items-center justify-center bg-white/80 text-red-500 rounded-full hover:bg-red-100 dark:bg-zinc-800/80 dark:text-red-400 dark:hover:bg-red-800/30 transition'
											onClick={() => setPreviewFile(null)}
										>
											<span className='icon-[lucide--x] size-5' />
										</button>
									</div>
								)}
							</div>
							<Lightbox
								open={lightboxOpen}
								image={lightboxImage?.src || ''}
								alt={lightboxImage?.alt}
								onClose={() => setLightboxOpen(false)}
							/>
						</div>
					)}
					{formError && <div className='text-red-600 text-sm'>{formError}</div>}
					<div className='flex justify-between gap-2'>
						{editing && (
							<Button
								type='button'
								style='bordered'
								className='text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20'
								onClick={() => setDeleteDialogOpen(true)}
							>
								Excluir problema
							</Button>
						)}
						<div className='flex gap-2'>
							<Button
								type='button'
								style='bordered'
								onClick={() => {
									setOffcanvasOpen(false)
									setEditing(null)
								}}
							>
								Cancelar
							</Button>
							<Button type='submit' disabled={formLoading}>
								{formLoading
									? editing
										? 'Salvando...'
										: 'Adicionando...'
									: editing
										? 'Salvar'
										: 'Adicionar'}
							</Button>
						</div>
					</div>
				</form>
				{/* Dialog de confirmação de exclusão */}
				<Dialog
					open={deleteDialogOpen}
					onClose={() => setDeleteDialogOpen(false)}
					title={
						<div className='flex items-center gap-2 text-red-600'>
							<span className='icon-[lucide--trash-2] size-4' />
							Excluir problema
						</div>
					}
					description='Tem certeza que deseja excluir este problema? Todas as soluções, imagens e dados relacionados serão removidos permanentemente.'
				>
					<div className='flex gap-2 justify-end mt-6'>
						<Button type='button' style='bordered' onClick={() => setDeleteDialogOpen(false)}>
							Cancelar
						</Button>
						<Button
							type='button'
							className='bg-red-600 text-white hover:bg-red-700'
							disabled={deleteLoading}
							onClick={handleDeleteProblem}
						>
							{deleteLoading ? 'Excluindo...' : 'Excluir'}
						</Button>
					</div>
				</Dialog>
				{/* Dialog de confirmação de exclusão de imagem */}
				<Dialog
					open={!!deleteImageId}
					onClose={() => setDeleteImageId(null)}
					title={
						<div className='flex items-center gap-2 text-red-600'>
							<span className='icon-[lucide--trash] size-4' />
							Excluir imagem
						</div>
					}
					description='Tem certeza que deseja excluir esta imagem? Esta ação não poderá ser desfeita.'
				>
					<div className='flex gap-2 justify-end mt-6'>
						<Button type='button' style='bordered' onClick={() => setDeleteImageId(null)}>
							Cancelar
						</Button>
						<Button
							type='button'
							className='bg-red-600 text-white hover:bg-red-700'
							disabled={deleteImageLoading}
							onClick={async () => {
								if (!deleteImageId) return
								setDeleteImageLoading(true)
								const res = await fetch('/api/products/images', {
									method: 'DELETE',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ id: deleteImageId }),
								})
								setDeleteImageLoading(false)
								setDeleteImageId(null)
								if (res.ok) {
									toast({ type: 'success', title: 'Imagem excluída' })
									// Atualiza lista de imagens
									if (editing) {
										const imagesRes = await fetch(`/api/products/images?problemId=${editing.id}`)
										const imagesData = await imagesRes.json()
										setImages(imagesData.items)
									}
								} else {
									toast({ type: 'error', title: 'Erro ao excluir imagem' })
								}
							}}
						>
							{deleteImageLoading ? 'Excluindo...' : 'Excluir'}
						</Button>
					</div>
				</Dialog>
			</Offcanvas>

			{/* Modal de solução */}
			<Modal
				isOpen={solutionModalOpen}
				onClose={closeSolutionModal}
				title={
					solutionMode === 'edit'
						? 'Editar solução'
						: solutionMode === 'reply'
							? 'Responder solução'
							: 'Adicionar solução'
				}
			>
				<form className='flex flex-col gap-6 p-6' onSubmit={handleSolutionSubmit}>
					<div>
						<Label htmlFor='solution-description' required>
							Descrição da solução
						</Label>
						<textarea
							id='solution-description'
							value={solutionDescription}
							onChange={(e) => setSolutionDescription(e.target.value)}
							minLength={2}
							maxLength={3000}
							required
							className={clsx(
								'block w-full rounded-lg border-zinc-200 px-4 py-3 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500',
								solutionError && 'border-red-400',
							)}
							rows={6}
							placeholder='Descreva a solução detalhadamente.'
						/>
					</div>
					{/* Upload de imagem */}
					<div className='flex flex-col gap-2'>
						<div className='font-semibold'>Imagem (opcional)</div>
						{/* Se está editando e já existe imagem, exibe só a imagem com botão de remover */}
						{solutionMode === 'edit' &&
						editingSolution?.image &&
						editingSolution.image.image &&
						!solutionImagePreview ? (
							<div className='flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-blue-400 rounded-lg relative'>
								<img
									src={editingSolution.image.image}
									alt={editingSolution.image.description || 'Imagem da solução'}
									className='object-contain h-full w-full rounded-lg'
									style={{ maxHeight: '8rem', maxWidth: '8rem' }}
								/>
								<button
									type='button'
									className='absolute top-1 right-1 bg-red-100/75 hover:bg-red-100 dark:bg-red-800/30 dark:hover:bg-red-700/40 text-red-500 dark:text-red-400 rounded-full size-8 flex items-center justify-center transition'
									onClick={async () => {
										// Remove imagem da solução via API
										const formData = new FormData()
										formData.append('id', editingSolution.id)
										formData.append('description', solutionDescription)
										formData.append('removeImage', 'true')
										const res = await fetch('/api/products/solutions', {
											method: 'PUT',
											body: formData,
										})
										if (res.ok) {
											toast({ type: 'success', title: 'Imagem removida' })
											// Atualiza lista de soluções
											if (problem) await atualizarSolucoes(problem.id)
											// Atualiza imagem no modal
											setEditingSolution((prev) => prev && { ...prev, image: null })
										} else {
											toast({ type: 'error', title: 'Erro ao remover imagem' })
										}
									}}
								>
									<span className='icon-[lucide--trash] size-4' />
								</button>
							</div>
						) : (
							// Se não há imagem associada ou já foi removida, exibe campo de upload normalmente
							<>
								{!solutionImagePreview && (
									<div className='flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-blue-400 dark:border-zinc-600 dark:hover:border-blue-500 transition group relative'>
										<input
											type='file'
											accept='image/png, image/jpeg, image/webp'
											className='absolute inset-0 opacity-0 cursor-pointer z-10'
											style={{ width: '100%', height: '100%' }}
											onChange={(e) => {
												const file = e.target.files?.[0]
												if (file) {
													if (file.size > 4 * 1024 * 1024) {
														setSolutionError('A imagem deve ter no máximo 4MB.')
														return
													}
													setSolutionImage(file)
													setSolutionImagePreview(URL.createObjectURL(file))
													setSolutionError(null)
												}
											}}
										/>
										<span className='icon-[lucide--plus] size-10 text-zinc-400 group-hover:text-blue-500 dark:text-zinc-500 dark:group-hover:text-blue-400' />
										<span className='text-xs text-zinc-400 dark:text-zinc-500 mt-2'>
											Adicionar imagem
										</span>
									</div>
								)}
								{solutionImagePreview && (
									<div className='flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-blue-400 rounded-lg relative'>
										<img
											src={solutionImagePreview}
											alt='Preview'
											className='object-contain h-full w-full rounded-lg'
											style={{ maxHeight: '8rem', maxWidth: '8rem' }}
										/>
										<button
											type='button'
											className='absolute top-1 right-1 bg-red-100/75 hover:bg-red-100 dark:bg-red-800/30 dark:hover:bg-red-700/40 text-red-500 dark:text-red-400 rounded-full size-8 flex items-center justify-center transition'
											onClick={() => {
												setSolutionImage(null)
												setSolutionImagePreview(null)
											}}
										>
											<span className='icon-[lucide--trash] size-4' />
										</button>
									</div>
								)}
							</>
						)}
					</div>
					{solutionError && <div className='text-red-600 text-sm'>{solutionError}</div>}
					<div className='flex justify-between gap-2'>
						{/* Botão de excluir no modal, só se for modo edit e a solução for do usuário logado */}
						{solutionMode === 'edit' && editingSolution?.isMine && (
							<Button
								type='button'
								style='bordered'
								className='text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20'
								onClick={() => openDeleteSolutionDialog(editingSolution)}
							>
								Excluir solução
							</Button>
						)}
						<div className='flex gap-2'>
							<Button type='button' style='bordered' onClick={closeSolutionModal}>
								Cancelar
							</Button>
							<Button type='submit' disabled={solutionLoading}>
								{solutionLoading
									? solutionMode === 'edit'
										? 'Salvando...'
										: solutionMode === 'reply'
											? 'Respondendo...'
											: 'Adicionando...'
									: solutionMode === 'edit'
										? 'Salvar'
										: solutionMode === 'reply'
											? 'Responder'
											: 'Adicionar'}
							</Button>
						</div>
					</div>
				</form>
			</Modal>

			{/* Dialog de confirmação de exclusão de solução - fora do grid/layout principal */}
			<Dialog
				open={deleteSolutionDialogOpen}
				onClose={() => {
					setDeleteSolutionDialogOpen(false)
					setSolutionToDelete(null)
				}}
				title={
					<div className='flex items-center gap-2 text-red-600'>
						<span className='icon-[lucide--trash] size-4' />
						Excluir solução
					</div>
				}
				description='Tem certeza que deseja excluir esta solução? Esta ação não poderá ser desfeita.'
			>
				<div className='flex gap-2 justify-end mt-6'>
					<Button
						type='button'
						style='bordered'
						onClick={() => {
							setDeleteSolutionDialogOpen(false)
							setSolutionToDelete(null)
						}}
					>
						Cancelar
					</Button>
					<Button
						type='button'
						className='bg-red-600 text-white hover:bg-red-700'
						disabled={deleteSolutionLoading}
						onClick={confirmDeleteSolution}
					>
						{deleteSolutionLoading ? 'Excluindo...' : 'Excluir'}
					</Button>
				</div>
			</Dialog>
		</>
	)
}

function ListProblems({
	problems,
	solutionsCount,
	onSelect,
	selectedId,
	loadingDetail,
}: {
	problems: ProductProblem[]
	solutionsCount: Record<string, number>
	onSelect: (problem: ProductProblem) => void
	selectedId: string | null
	loadingDetail: boolean
}) {
	return (
		<div className='flex flex-col'>
			{problems.length > 0 &&
				problems.map((problem) => (
					<div
						key={problem.id}
						className={`flex flex-col border-b border-zinc-200 dark:border-zinc-700 cursor-pointer ${selectedId === problem.id ? 'bg-zinc-100 dark:bg-zinc-800' : ''} ${loadingDetail ? 'opacity-50 pointer-events-none' : ''}`}
						onClick={() => !loadingDetail && onSelect(problem)}
					>
						<div className='flex w-full flex-col gap-y-1 p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800'>
							<div className='flex w-full items-center justify-between gap-x-2'>
								<span
									className='text-base font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-2'
									style={{
										display: '-webkit-box',
										WebkitLineClamp: 2,
										WebkitBoxOrient: 'vertical',
										overflow: 'hidden',
									}}
								>
									{problem.title}
								</span>
								<span className='ms-1 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400'>
									{solutionsCount[problem.id] ?? 0}
								</span>
							</div>
							<div className='flex text-sm text-zinc-600 dark:text-zinc-400'>
								<p
									className='line-clamp-4'
									style={{
										display: '-webkit-box',
										WebkitLineClamp: 4,
										WebkitBoxOrient: 'vertical',
										overflow: 'hidden',
									}}
								>
									{problem.description}
								</p>
							</div>
						</div>
					</div>
				))}
		</div>
	)
}

function formatDate(date: Date) {
	return new Date(date).toLocaleDateString('pt-BR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}
