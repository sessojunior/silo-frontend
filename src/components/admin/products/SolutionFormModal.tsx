'use client'

import Modal from '@/components/ui/Modal'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import { toast } from '@/lib/toast'
import Image from 'next/image'
import { UploadButton } from '@/lib/uploadthing'

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
	solutionDescription: string
	setSolutionDescription: (value: string) => void
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

export default function SolutionFormModal({ isOpen, onClose, mode, editingSolution, solutionDescription, setSolutionDescription, setSolutionImage, solutionImagePreview, setSolutionImagePreview, solutionLoading, solutionError, setSolutionError, onSubmit, onDeleteSolution, onUpdateSolutions, onUpdateEditingSolution, problemId }: SolutionFormModalProps) {
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
					<div className='mt-2'>
						<Markdown value={solutionDescription} onChange={setSolutionDescription} height={200} preview='edit' compact />
					</div>
				</div>

				{/* Upload de imagem */}
				<div className='flex flex-col gap-2'>
					<div className='font-semibold'>Imagem (opcional)</div>
					{/* Se está editando e já existe imagem, exibe só a imagem com botão de remover */}
					{mode === 'edit' && editingSolution?.image && editingSolution.image.image && !solutionImagePreview ? (
						<div className='flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-blue-400 rounded-lg relative'>
							<Image src={editingSolution.image.image} alt={editingSolution.image.description || 'Imagem da solução'} className='object-contain h-full w-full rounded-lg' width={128} height={128} style={{ objectFit: 'contain', maxHeight: '8rem', maxWidth: '8rem' }} />
							<button
								type='button'
								className='absolute top-1 right-1 bg-red-100/75 hover:bg-red-100 dark:bg-red-800/30 dark:hover:bg-red-700/40 text-red-500 dark:text-red-400 rounded-full size-8 flex items-center justify-center transition'
								onClick={async () => {
									// Remove imagem da solução via API
									const formData = new FormData()
									formData.append('id', editingSolution.id)
									formData.append('description', solutionDescription)
									formData.append('removeImage', 'true')
									const res = await fetch('/api/admin/products/solutions', {
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
						<div className='flex justify-start'>
							{!solutionImagePreview && (
								<UploadButton
									endpoint='problemImageUploader'
									onClientUploadComplete={(res) => {
										const url = res?.[0]?.url
										if (url) {
											console.log('✅ Imagem carregada via UploadThing:', url)
											setSolutionImagePreview(url)
											setSolutionImage(null)
											setSolutionError(null)
											toast({ type: 'success', title: 'Imagem carregada' })
										}
									}}
									onUploadError={(error) => setSolutionError(error.message)}
									appearance={{
										button: 'flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-zinc-300 rounded-lg hover:border-blue-400 dark:border-zinc-600 dark:hover:border-blue-500 transition',
										container: '',
										allowedContent: 'hidden',
									}}
									content={{
										button: (
											<>
												<span className='icon-[lucide--plus] size-10 text-zinc-400' />
												<span className='text-xs text-zinc-400 mt-2'>Adicionar imagem</span>
											</>
										),
										allowedContent: 'Imagens até 4MB',
									}}
								/>
							)}
							{solutionImagePreview && (
								<div className='flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-blue-400 rounded-lg relative'>
									<Image src={`${solutionImagePreview}?t=${Date.now()}`} alt='Preview' className='object-contain h-full w-full rounded-lg' width={128} height={128} style={{ objectFit: 'contain', maxHeight: '8rem', maxWidth: '8rem' }} unoptimized={true} />
									<button
										type='button'
										className='absolute top-1 right-1 bg-red-100/75 hover:bg-red-100 dark:bg-red-800/30 dark:hover:bg-red-700/40 text-red-500 dark:text-red-400 rounded-full size-8 flex items-center justify-center transition'
										onClick={() => {
											setSolutionImage(null)
											setSolutionImagePreview(null)
											setSolutionError(null)
										}}
									>
										<span className='icon-[lucide--trash] size-4' />
									</button>
								</div>
							)}
						</div>
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
