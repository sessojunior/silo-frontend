'use client'

import ReactMarkdown from 'react-markdown'
import Button from '@/components/ui/Button'
import { getMarkdownClasses } from '@/lib/markdown'
import clsx from 'clsx'

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

interface ProblemSolutionsSectionProps {
	solutions: SolutionWithDetails[]
	expandedSolutionIds: string[]
	onOpenSolutionModal: (mode: 'create' | 'edit' | 'reply', solution?: SolutionWithDetails) => void
	onOpenDeleteSolutionDialog: (solution: SolutionWithDetails) => void
	onToggleExpandSolution: (id: string) => void
	onImageClick: (image: string, description: string) => void
	formatDate: (date: Date) => string
}

export function ProblemSolutionsSection({ solutions, expandedSolutionIds, onOpenSolutionModal, onOpenDeleteSolutionDialog, onToggleExpandSolution, onImageClick, formatDate }: ProblemSolutionsSectionProps) {
	if (solutions.length === 0) {
		return null
	}

	return (
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
				<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='shrink-0 py-2' onClick={() => onOpenSolutionModal('create')}>
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
									<div className='flex flex-col'>
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
											<button type='button' className='text-xs text-blue-600 hover:underline mt-1 self-start' onClick={() => onToggleExpandSolution(solution.id)}>
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
															onImageClick(solution.image.image, solution.image.description || '')
														}
													}}
												/>
											</div>
										)}
									</div>
									{/* Botões de ação */}
									<div className='flex gap-1 py-2'>
										<Button type='button' icon='icon-[lucide--reply]' style='unstyled' className='py-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800 dark:text-blue-500 dark:hover:bg-blue-800/30 dark:hover:text-blue-400' onClick={() => onOpenSolutionModal('reply', solution)}>
											Responder
										</Button>
										{solution.isMine && (
											<>
												<Button type='button' icon='icon-[lucide--edit]' style='unstyled' className='py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300' onClick={() => onOpenSolutionModal('edit', solution)}>
													Editar
												</Button>
												<Button type='button' icon='icon-[lucide--trash]' style='unstyled' className='py-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/30 dark:hover:text-red-300' onClick={() => onOpenDeleteSolutionDialog(solution)}>
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
															<div className='flex flex-col'>
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
																	<button type='button' className='text-xs text-blue-600 hover:underline mt-1 self-start' onClick={() => onToggleExpandSolution(reply.id)}>
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
																			onImageClick(reply.image!.image, reply.image!.description || '')
																		}}
																	/>
																)}
															</div>
															{/* Botões de ação para replies */}
															<div className='flex gap-2 py-2'>
																<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800 dark:text-blue-500 dark:hover:bg-blue-800/30 dark:hover:text-blue-400' onClick={() => onOpenSolutionModal('reply', reply)}>
																	Responder
																</Button>
																{reply.isMine && (
																	<>
																		<Button type='button' icon='icon-[lucide--edit]' style='unstyled' className='py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300' onClick={() => onOpenSolutionModal('edit', reply)}>
																			Editar
																		</Button>
																		<Button type='button' icon='icon-[lucide--trash]' style='unstyled' className='py-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/30 dark:hover:text-red-300' onClick={() => onOpenDeleteSolutionDialog(reply)}>
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
	)
}
