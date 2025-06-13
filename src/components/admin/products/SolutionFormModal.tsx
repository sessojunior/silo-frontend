'use client'

import Modal from '@/components/ui/Modal'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import clsx from 'clsx'
import { toast } from '@/lib/toast'

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

interface SolutionFormModalProps {
	isOpen: boolean
	onClose: () => void
	mode: 'create' | 'edit' | 'reply'
	editingSolution: SolutionWithDetails | null
	replyTo: SolutionWithDetails | null
	solutionDescription: string
	setSolutionDescription: (value: string) => void
	solutionImage: File | null
	setSolutionImage: (file: File | null) => void
	solutionImagePreview: string | null
	setSolutionImagePreview: (preview: string | null) => void
	solutionLoading: boolean
	solutionError: string | null
	setSolutionError: (error: string | null) => void
	onSubmit: (e: React.FormEvent) => Promise<void>
	onDeleteSolution: (solution: SolutionWithDetails) => void
	onUpdateSolutions: (problemId: string) => Promise<void>
	onUpdateEditingSolution: (solution: SolutionWithDetails) => void
	problemId: string | null
}

export default function SolutionFormModal({ isOpen, onClose, mode, editingSolution, replyTo: _replyTo, solutionDescription, setSolutionDescription, solutionImage: _solutionImage, setSolutionImage, solutionImagePreview, setSolutionImagePreview, solutionLoading, solutionError, setSolutionError, onSubmit, onDeleteSolution, onUpdateSolutions, onUpdateEditingSolution, problemId }: SolutionFormModalProps) {
	const getTitle = () => {
		switch (mode) {
			case 'edit':
				return 'Editar solução'
			case 'reply':
				return 'Responder solução'
			default:
				return 'Adicionar solução'
		}
	}

	const getSubmitButtonText = () => {
		if (solutionLoading) {
			switch (mode) {
				case 'edit':
					return 'Salvando...'
				case 'reply':
					return 'Respondendo...'
				default:
					return 'Adicionando...'
			}
		}
		switch (mode) {
			case 'edit':
				return 'Salvar'
			case 'reply':
				return 'Responder'
			default:
				return 'Adicionar'
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
			<form className='flex flex-col gap-6 p-6' onSubmit={onSubmit}>
				<div>
					<Label htmlFor='solution-description' required>
						Descrição da solução
					</Label>
					<textarea id='solution-description' value={solutionDescription} onChange={(e) => setSolutionDescription(e.target.value)} minLength={2} maxLength={3000} required className={clsx('block w-full rounded-lg border-zinc-200 px-4 py-3 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500', solutionError && 'border-red-400')} rows={6} placeholder='Descreva a solução detalhadamente.' />
				</div>

				{/* Upload de imagem */}
				<div className='flex flex-col gap-2'>
					<div className='font-semibold'>Imagem (opcional)</div>
					{/* Se está editando e já existe imagem, exibe só a imagem com botão de remover */}
					{mode === 'edit' && editingSolution?.image && editingSolution.image.image && !solutionImagePreview ? (
						<div className='flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-blue-400 rounded-lg relative'>
							<img src={editingSolution.image.image} alt={editingSolution.image.description || 'Imagem da solução'} className='object-contain h-full w-full rounded-lg' style={{ maxHeight: '8rem', maxWidth: '8rem' }} />
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
										if (problemId) await onUpdateSolutions(problemId)
										// Atualiza imagem no modal
										onUpdateEditingSolution({ ...editingSolution, image: null })
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
									<span className='text-xs text-zinc-400 dark:text-zinc-500 mt-2'>Adicionar imagem</span>
								</div>
							)}
							{solutionImagePreview && (
								<div className='flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-blue-400 rounded-lg relative'>
									<img src={solutionImagePreview} alt='Preview' className='object-contain h-full w-full rounded-lg' style={{ maxHeight: '8rem', maxWidth: '8rem' }} />
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
					{mode === 'edit' && editingSolution?.isMine && (
						<Button type='button' style='bordered' className='text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20' onClick={() => onDeleteSolution(editingSolution)}>
							Excluir solução
						</Button>
					)}
					<div className='flex gap-2'>
						<Button type='button' style='bordered' onClick={onClose}>
							Cancelar
						</Button>
						<Button type='submit' disabled={solutionLoading}>
							{getSubmitButtonText()}
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	)
}
