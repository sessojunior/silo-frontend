'use client'

import ReactMarkdown from 'react-markdown'
import Button from '@/components/ui/Button'
import { useEffect, useState, useRef } from 'react'
import type { ProductProblem, ProductProblemImage, ProductSolution } from '@/lib/db/schema'
import { useParams, useRouter } from 'next/navigation'
import Lightbox from '@/components/ui/Lightbox'

export default function ProblemsPage() {
	const { slug } = useParams()
	const router = useRouter()
	const [problems, setProblems] = useState<ProductProblem[]>([])
	const [problem, setProblem] = useState<ProductProblem | null>(null)
	const [solutions, setSolutions] = useState<ProductSolution[]>([])
	const [images, setImages] = useState<ProductProblemImage[]>([])
	const [solutionsCount, setSolutionsCount] = useState<Record<string, number>>({})
	const [loadingDetail, setLoadingDetail] = useState(false)
	const [filter, setFilter] = useState('')
	const [visibleCount, setVisibleCount] = useState(10)
	const listRef = useRef<HTMLDivElement>(null)
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const [lightboxImage, setLightboxImage] = useState<{ src: string; alt?: string } | null>(null)

	// Função para selecionar um problema e buscar seus dados
	const handleSelectProblem = async (selected: ProductProblem) => {
		setProblem(selected)
		setLoadingDetail(true)
		try {
			const [solutionsRes, imagesRes] = await Promise.all([fetch(`/api/products/solutions?problemId=${selected.id}`), fetch(`/api/products/images?problemId=${selected.id}`)])
			const solutionsData = await solutionsRes.json()
			const imagesData = await imagesRes.json()
			setSolutions(solutionsData.items)
			setImages(imagesData.items)
		} finally {
			setLoadingDetail(false)
		}
	}

	useEffect(() => {
		const fetchProblems = async () => {
			const response = await fetch(`/api/products/problems?slug=${slug}`)
			const data = await response.json()

			if (!data.items || data.items.length === 0) {
				router.replace('/404')
				return
			}

			setProblems(data.items)

			// Busca a contagem de soluções para cada problema
			const counts: Record<string, number> = {}
			await Promise.all(
				data.items.map(async (problem: ProductProblem) => {
					const res = await fetch(`/api/products/solutions?problemId=${problem.id}`)
					const solData = await res.json()
					counts[problem.id] = solData.items.length
				}),
			)
			setSolutionsCount(counts)

			// Seleciona e carrega o primeiro problema
			if (data.items[0]) {
				handleSelectProblem(data.items[0])
			}
		}

		fetchProblems()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug])

	useEffect(() => {
		const handleScroll = () => {
			if (!listRef.current) return
			const { scrollTop, scrollHeight, clientHeight } = listRef.current
			console.log('scroll', scrollTop, scrollHeight, clientHeight)
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

	return (
		<div className='flex w-full'>
			{/* Coluna da esquerda */}
			<div className='flex w-full flex-shrink-0 flex-col border-r border-zinc-200 sm:w-[480px] dark:border-zinc-700'>
				<div ref={listRef} className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
					{/* Campo de busca */}
					<div className='border-b border-zinc-200 px-8 py-4 flex items-center gap-2'>
						<div className='relative flex flex-1 h-10'>
							<input type='text' name='problem' value={filter} onChange={(e) => setFilter(e.target.value)} className='block w-full rounded-lg border-zinc-200 px-4 py-2.5 pe-11 sm:py-3 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500' placeholder='Procurar problema...' />
							<div className='pointer-events-none absolute inset-y-0 end-0 z-20 flex items-center pe-4'>
								<span className='icon-[lucide--search] ml-1 size-4 shrink-0 text-zinc-400 dark:text-zinc-500'></span>
							</div>
						</div>
						<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='flex size-10' title='Adicionar problema' aria-label='Adicionar problema'></Button>
					</div>

					{filteredProblems.length > 0 ? (
						<ListProblems problems={problemsToShow} solutionsCount={solutionsCount} onSelect={handleSelectProblem} selectedId={problem?.id ?? null} loadingDetail={loadingDetail} />
					) : (
						<div className='border-b border-zinc-200 p-8'>
							<div className='rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-zinc-600 dark:bg-yellow-800/10 dark:text-zinc-500' role='alert'>
								<div className='flex flex-col'>
									<div className='flex justify-center pb-1'>
										<span className='icon-[lucide--search-x] size-12 shrink-0 text-zinc-300 dark:text-zinc-500'></span>
									</div>
									<div className='flex flex-col'>
										<h3 className='text-center text-base font-semibold text-zinc-600'>Nenhum resultado</h3>
										<div className='text-center text-sm text-zinc-700'>Nenhum resultado para o texto informado.</div>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className='px-8 py-4'>
						<div className='flex justify-center'>
							<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2'>
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
						<div className='flex items-center justify-center h-full'>Carregando detalhes...</div>
					) : (
						<>
							{/* Descrição do problema */}
							<div className='flex w-full flex-col p-8'>
								<div className='flex w-full items-center justify-between pb-6'>
									<div>
										<h3 className='text-xl font-medium'>{problem ? problem.title : 'Sem problemas'}</h3>
										{problem && solutions.length > 0 && (
											<div className='text-base'>
												<span className='text-sm font-medium'>{solutions.length} soluções</span> <span className='text-zinc-300'>•</span> <span className='text-sm text-zinc-400'>Registrado em {formatDate(problem.createdAt)}</span>
											</div>
										)}
									</div>
									{problem && (
										<Button type='button' icon='icon-[lucide--edit]' style='unstyled' className='shrink-0 py-2'>
											Editar problema
										</Button>
									)}
								</div>

								<div className='flex flex-col gap-y-2 text-zinc-800'>
									{/* Uso de Markdown para a descrição */}
									<ReactMarkdown>{problem ? problem.description : 'Nenhum problema registrado para este produto.'}</ReactMarkdown>
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
													{solutions.length} soluções para o problema <span className='text-zinc-300'>•</span> {solutions.filter((s) => s.verified).length} foram verificadas
												</span>
											</div>
										</div>
										<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='shrink-0 py-2'>
											Adicionar solução
										</Button>
									</div>

									{/* Soluções principais */}
									<div className='flex flex-col gap-y-4'>
										{solutions
											.filter((solution) => solution.replyId === null)
											.map((solution) => (
												<div key={solution.id} className='flex gap-x-2'>
													<div className='size-12 shrink-0'>
														<img src={solution.user.image} alt={solution.user.name} className='size-full rounded-full' />
													</div>
													<div className='flex flex-col'>
														<div className='flex flex-col gap-y-1'>
															<div className='text-base'>
																<span className='font-bold text-zinc-700'>{solution.user.name}</span> <span className='text-zinc-300'>•</span> <span className='text-sm text-zinc-400'>{formatDate(solution.date)}</span>
																{solution.verified && (
																	<span className='ml-2 inline-flex items-center gap-x-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-500/10 dark:text-green-500'>
																		<span className='icon-[lucide--check] size-3 shrink-0'></span>
																		Resposta verificada
																	</span>
																)}
															</div>
															<div className='text-sm font-medium text-zinc-600'>{solution.description}</div>
														</div>
														<div className='py-2'>
															<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2 hover:border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800 dark:text-blue-500 dark:hover:bg-blue-800/30 dark:hover:text-blue-400'>
																Responder
															</Button>
														</div>

														<div className='flex flex-col gap-y-3'>
															{/* Respostas a esta solução */}
															{solutions
																.filter((reply) => reply.replyId === solution.id)
																.map((reply) => (
																	<div key={reply.id} className='flex gap-x-2 ml-4 mt-2'>
																		<div className='size-12 shrink-0'>
																			<img src={reply.user.image} alt={reply.user.name} className='size-full rounded-full' />
																		</div>
																		<div className='flex flex-col'>
																			<div className='flex flex-col gap-y-1'>
																				<div className='text-base'>
																					<span className='font-bold text-zinc-700'>{reply.user.name}</span> <span className='text-zinc-300'>•</span> <span className='text-sm text-zinc-400'>{formatDate(reply.date)}</span>
																					{reply.verified && (
																						<span className='ml-2 inline-flex items-center gap-x-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-500/10 dark:text-green-500'>
																							<span className='icon-[lucide--check] size-3 shrink-0'></span>
																							Resposta verificada
																						</span>
																					)}
																				</div>
																				<div className='text-sm font-medium text-zinc-600'>{reply.description}</div>
																			</div>
																		</div>
																	</div>
																))}
														</div>
													</div>
												</div>
											))}
									</div>
								</div>
							)}
							{/* Lightbox para imagem em destaque */}
							<Lightbox open={lightboxOpen} image={lightboxImage?.src || ''} alt={lightboxImage?.alt} onClose={() => setLightboxOpen(false)} />
						</>
					)}
				</div>
			</div>
		</div>
	)
}

function ListProblems({ problems, solutionsCount, onSelect, selectedId, loadingDetail }: { problems: ProductProblem[]; solutionsCount: Record<string, number>; onSelect: (problem: ProductProblem) => void; selectedId: string | null; loadingDetail: boolean }) {
	return (
		<div className='flex flex-col'>
			{problems.length > 0 &&
				problems.map((problem) => (
					<div key={problem.id} className={`flex flex-col border-b border-zinc-200 cursor-pointer ${selectedId === problem.id ? 'bg-zinc-100 dark:bg-zinc-800' : ''} ${loadingDetail ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => !loadingDetail && onSelect(problem)}>
						<div className='flex w-full flex-col gap-y-1 p-8 hover:bg-zinc-100'>
							<div className='flex w-full items-center justify-between gap-x-2'>
								<span className='text-base font-semibold text-zinc-700 line-clamp-2' style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
									{problem.title}
								</span>
								<span className='ms-1 shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600'>{solutionsCount[problem.id] ?? 0}</span>
							</div>
							<div className='flex text-sm text-zinc-600'>
								<p className='line-clamp-4' style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
