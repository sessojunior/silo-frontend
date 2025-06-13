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
import { useParams } from 'next/navigation'
import Lightbox from '@/components/ui/Lightbox'
import { toast } from '@/lib/toast'
import clsx from 'clsx'
import { useUser } from '@/context/UserContext'
import ProblemFormOffcanvas from '@/components/admin/products/ProblemFormOffcanvas'
import SolutionFormModal from '@/components/admin/products/SolutionFormModal'
import DeleteSolutionDialog from '@/components/admin/products/DeleteSolutionDialog'
import { ProblemsListColumn } from '@/components/admin/products/ProblemsListColumn'
import { ProblemDetailColumn } from '@/components/admin/products/ProblemDetailColumn'

export default function ProblemsPage() {
	const { slug } = useParams()
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
	const [form] = useState<{ field: string | null; message: string | null }>({
		field: null,
		message: null,
	})
	const [productId, setProductId] = useState<string | null>(null)
	const [editing, setEditing] = useState<ProductProblem | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [previewFile, setPreviewFile] = useState<File | null>(null)
	const [deleteImageId, setDeleteImageId] = useState<string | null>(null)
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
			const [solutionsRes, imagesRes] = await Promise.all([fetch(`/api/products/solutions?problemId=${selected.id}`), fetch(`/api/products/images?problemId=${selected.id}`)])
			const solutionsData = await solutionsRes.json()
			const imagesData = await imagesRes.json()

			// Sobrescreve isMine para cada solução
			const solutionsWithIsMine = (solutionsData.items || []).map((sol: SolutionWithDetails) => ({
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

	const filteredProblems = problems.filter((p) => filter.trim().length === 0 || p.title.toLowerCase().includes(filter.toLowerCase()) || p.description.toLowerCase().includes(filter.toLowerCase()))
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
		const solutionsWithIsMine = (solutionsData.items || []).map((sol: SolutionWithDetails) => ({
			...sol,
			isMine: sol.user?.id === user.id,
		}))
		setSolutions(solutionsWithIsMine)
	}

	// Função para alternar expansão da descrição
	function toggleExpandSolution(id: string) {
		setExpandedSolutionIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]))
	}

	// Função para atualizar as imagens do problema atual
	async function updateProblemImages() {
		if (!problem) return
		try {
			const imagesRes = await fetch(`/api/products/images?problemId=${problem.id}`)
			const imagesData = await imagesRes.json()
			setImages(imagesData.items || [])
		} catch (error) {
			console.error('❌ Erro ao atualizar imagens:', error)
		}
	}

	if (initialLoading) {
		return (
			<div className='flex h-[calc(100vh-131px)] w-full items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin text-4xl'>⏳</div>
					<p className='mt-2 text-zinc-600 dark:text-zinc-400'>Carregando problemas e soluções...</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className='flex w-full'>
				{/* Coluna da esquerda */}
				<ProblemsListColumn listRef={listRef} filter={filter} setFilter={setFilter} onAddProblem={() => setOffcanvasOpen(true)} filteredProblems={filteredProblems} problemsToShow={problemsToShow} solutionsCount={solutionsCount} onSelectProblem={handleSelectProblem} selectedProblemId={problem?.id ?? null} loadingDetail={loadingDetail} />

				{/* Coluna direita com o problema selecionado */}
				<div className='flex w-full flex-grow flex-col'>
					<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
						<ProblemDetailColumn
							loadingDetail={loadingDetail}
							problem={problem}
							solutions={solutions}
							images={images}
							onEditProblem={handleEditProblem}
							onImageClick={(image, description) => {
								setLightboxImage({ src: image, alt: description })
								setLightboxOpen(true)
							}}
							formatDate={formatDate}
						/>

						{/* Soluções */}
						{solutions.length > 0 && (
							<div className='flex w-full flex-col border-t border-zinc-200 p-8'>
								<div className='flex w-full items-center justify-between pb-6'>
									<div>
										<h3 className='text-xl font-medium'>Soluções</h3>
										<div>
											<span className='text-sm font-medium'>
												{solutions.length} soluções para o problema <span className='text-zinc-300 dark:text-zinc-600'>•</span> {solutions.filter((s) => s.verified).length} foram verificadas
											</span>
										</div>
									</div>
									<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='shrink-0 py-2' onClick={() => openSolutionModal('create')}>
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
														<img src={solution.user.image} alt={solution.user.name} className='size-full rounded-full' />
													</div>
													<div className='flex flex-col'>
														<div className='flex flex-col gap-y-1'>
															<div className='text-base'>
																<span className='font-bold text-zinc-700 dark:text-zinc-200'>{solution.user.name}</span> <span className='text-zinc-300 dark:text-zinc-600'>•</span> <span className='text-sm text-zinc-400'>{formatDate(solution.date)}</span>
																{solution.verified && (
																	<span className='ml-2 inline-flex items-center gap-x-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-500/10 dark:text-green-500'>
																		<span className='icon-[lucide--check] size-3 shrink-0'></span>
																		Resposta verificada
																	</span>
																)}
															</div>
															{/* Descrição truncada/expandida */}
															<div
																className={clsx(getMarkdownClasses('compact', 'text-zinc-600 dark:text-zinc-300'), !isExpanded && 'line-clamp-4')}
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
																<button type='button' className='text-xs text-blue-600 hover:underline mt-1 self-start' onClick={() => toggleExpandSolution(solution.id)}>
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
															<Button type='button' icon='icon-[lucide--reply]' style='unstyled' className='py-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800 dark:text-blue-500 dark:hover:bg-blue-800/30 dark:hover:text-blue-400' onClick={() => openSolutionModal('reply', solution)}>
																Responder
															</Button>
															{solution.isMine && (
																<>
																	<Button type='button' icon='icon-[lucide--edit]' style='unstyled' className='py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300' onClick={() => openSolutionModal('edit', solution)}>
																		Editar
																	</Button>
																	<Button type='button' icon='icon-[lucide--trash]' style='unstyled' className='py-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/30 dark:hover:text-red-300' onClick={() => openDeleteSolutionDialog(solution)}>
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
																				<img src={reply.user.image} alt={reply.user.name} className='size-full rounded-full' />
																			</div>
																			<div className='flex flex-col'>
																				<div className='flex flex-col gap-y-1'>
																					<div className='text-base'>
																						<span className='font-bold text-zinc-700 dark:text-zinc-200'>{reply.user.name}</span> <span className='text-zinc-300 dark:text-zinc-600'>•</span> <span className='text-sm text-zinc-400'>{formatDate(reply.date)}</span>
																						{reply.verified && (
																							<span className='ml-2 inline-flex items-center gap-x-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-500/10 dark:text-green-500'>
																								<span className='icon-[lucide--check] size-3 shrink-0'></span>
																								Resposta verificada
																							</span>
																						)}
																					</div>
																					{/* Descrição truncada/expandida para reply */}
																					<div
																						className={clsx(getMarkdownClasses('compact', 'text-zinc-600 dark:text-zinc-300'), !isReplyExpanded && 'line-clamp-4')}
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
																						<button type='button' className='text-xs text-blue-600 hover:underline mt-1 self-start' onClick={() => toggleExpandSolution(reply.id)}>
																							{isReplyExpanded ? '[ver menos]' : '[...leia mais]'}
																						</button>
																					)}
																					{/* Imagem da reply */}
																					{reply.image && reply.image.image && (
																						<img
																							src={reply.image.image}
																							alt={reply.image.description || 'Imagem da solução'}
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
																					<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800 dark:text-blue-500 dark:hover:bg-blue-800/30 dark:hover:text-blue-400' onClick={() => openSolutionModal('reply', reply)}>
																						Responder
																					</Button>
																					{reply.isMine && (
																						<>
																							<Button type='button' icon='icon-[lucide--edit]' style='unstyled' className='py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300' onClick={() => openSolutionModal('edit', reply)}>
																								Editar
																							</Button>
																							<Button type='button' icon='icon-[lucide--trash]' style='unstyled' className='py-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/30 dark:hover:text-red-300' onClick={() => openDeleteSolutionDialog(reply)}>
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
					</div>
				</div>
			</div>

			{/* Offcanvas para adicionar/editar problema */}
			<ProblemFormOffcanvas
				open={offcanvasOpen}
				onClose={() => {
					setOffcanvasOpen(false)
					setEditing(null)
				}}
				editing={editing}
				formTitle={formTitle}
				setFormTitle={setFormTitle}
				formDescription={formDescription}
				setFormDescription={setFormDescription}
				onSubmit={handleAddOrEditProblem}
				formLoading={formLoading}
				formError={formError}
				form={form}
				images={images}
				previewFile={previewFile}
				setPreviewFile={setPreviewFile}
				onDeleteProblem={handleDeleteProblem}
				deleteDialogOpen={deleteDialogOpen}
				setDeleteDialogOpen={setDeleteDialogOpen}
				deleteLoading={deleteLoading}
				deleteImageId={deleteImageId}
				setDeleteImageId={setDeleteImageId}
				deleteImageLoading={deleteLoading}
				lightboxOpen={lightboxOpen}
				setLightboxOpen={setLightboxOpen}
				lightboxImage={lightboxImage}
				setLightboxImage={setLightboxImage}
				onImagesUpdate={updateProblemImages}
			/>

			{/* Modal de solução */}
			<SolutionFormModal isOpen={solutionModalOpen} onClose={closeSolutionModal} mode={solutionMode} editingSolution={editingSolution} replyTo={replyTo} solutionDescription={solutionDescription} setSolutionDescription={setSolutionDescription} solutionImage={solutionImage} setSolutionImage={setSolutionImage} solutionImagePreview={solutionImagePreview} setSolutionImagePreview={setSolutionImagePreview} solutionLoading={solutionLoading} solutionError={solutionError} setSolutionError={setSolutionError} onSubmit={handleSolutionSubmit} onDeleteSolution={openDeleteSolutionDialog} onUpdateSolutions={atualizarSolucoes} onUpdateEditingSolution={setEditingSolution} problemId={problem?.id || null} />

			{/* Dialog de confirmação de exclusão de solução */}
			<DeleteSolutionDialog
				open={deleteSolutionDialogOpen}
				onClose={() => {
					setDeleteSolutionDialogOpen(false)
					setSolutionToDelete(null)
				}}
				solutionToDelete={solutionToDelete}
				deleteSolutionLoading={deleteSolutionLoading}
				onConfirmDelete={confirmDeleteSolution}
			/>

			{/* Lightbox para imagem em destaque */}
			<Lightbox open={lightboxOpen} image={lightboxImage?.src || ''} alt={lightboxImage?.alt} onClose={() => setLightboxOpen(false)} />
		</>
	)
}

function formatDate(date: Date) {
	return new Date(date).toLocaleDateString('pt-BR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}
