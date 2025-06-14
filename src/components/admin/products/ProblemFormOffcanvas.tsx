import React from 'react'
import Offcanvas from '@/components/ui/Offcanvas'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Dialog from '@/components/ui/Dialog'
import Lightbox from '@/components/ui/Lightbox'
import { toast } from '@/lib/toast'
import clsx from 'clsx'
import Image from 'next/image'
import type { ProductProblem, ProductProblemImage } from '@/lib/db/schema'

interface ProblemFormOffcanvasProps {
	open: boolean
	onClose: () => void
	editing: ProductProblem | null
	formTitle: string
	setFormTitle: (value: string) => void
	formDescription: string
	setFormDescription: (value: string) => void
	onSubmit: (e: React.FormEvent) => void
	formLoading: boolean
	formError: string | null
	form: { field: string | null; message: string | null }
	images: ProductProblemImage[]
	previewFile: File | null
	setPreviewFile: (file: File | null) => void
	onDeleteProblem: () => void
	deleteDialogOpen: boolean
	setDeleteDialogOpen: (open: boolean) => void
	deleteLoading: boolean
	deleteImageId: string | null
	setDeleteImageId: (id: string | null) => void
	deleteImageLoading: boolean
	lightboxOpen: boolean
	setLightboxOpen: (open: boolean) => void
	lightboxImage: { src: string; alt?: string } | null
	setLightboxImage: (image: { src: string; alt?: string } | null) => void
	onImagesUpdate: () => Promise<void>
}

export default function ProblemFormOffcanvas({ open, onClose, editing, formTitle, setFormTitle, formDescription, setFormDescription, onSubmit, formLoading, formError, form, images, previewFile, setPreviewFile, onDeleteProblem, deleteDialogOpen, setDeleteDialogOpen, deleteLoading, deleteImageId, setDeleteImageId, deleteImageLoading, lightboxOpen, setLightboxOpen, lightboxImage, setLightboxImage, onImagesUpdate }: ProblemFormOffcanvasProps) {
	const handleCloseOffcanvas = () => {
		onClose()
	}

	return (
		<>
			<Offcanvas open={open} onClose={handleCloseOffcanvas} title={editing ? 'Editar problema' : 'Adicionar problema'} width='xl'>
				<form onSubmit={onSubmit} className='flex flex-col gap-6'>
					<div>
						<Label htmlFor='problem-title' required>
							Título do problema
						</Label>
						<Input id='problem-title' type='text' value={formTitle} setValue={setFormTitle} minLength={5} maxLength={120} required placeholder='Ex: Erro ao processar dados meteorológicos' isInvalid={form.field === 'title'} invalidMessage={form.field === 'title' ? (form.message ?? undefined) : undefined} />
					</div>
					<div>
						<Label htmlFor='problem-description' required>
							Descrição detalhada
						</Label>
						<textarea id='problem-description' value={formDescription} onChange={(e) => setFormDescription(e.target.value)} minLength={20} maxLength={3000} required className={clsx('block w-full rounded-lg border-zinc-200 px-4 py-3 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500', form.field === 'description' && 'border-red-400')} rows={16} placeholder='Descreva o problema detalhadamente para facilitar o suporte e a resolução.' />
					</div>
					{form.field === 'description' && <div className='text-red-600 text-sm'>{form.message}</div>}
					{!editing && <div className='text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg'>Imagens poderão ser adicionadas após o cadastro do problema, na tela de edição.</div>}
					{editing && (
						<div className='flex flex-col gap-4'>
							<div className='font-semibold'>Imagens do problema</div>
							<div className='flex gap-4 items-center flex-wrap'>
								{/* Grid de imagens existentes */}
								{images.length > 0 &&
									images.map((img) => (
										<div key={img.id} className='relative flex flex-col items-center justify-center'>
											{/* Miniatura com Lightbox */}
											<div
												className='group cursor-pointer flex items-center justify-center h-32 w-32 bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden relative'
												onClick={() => {
													setLightboxImage({ src: img.image, alt: img.description })
													setLightboxOpen(true)
												}}
											>
												<Image src={img.image} alt={img.description} className='object-contain h-full w-full transition-transform duration-200 group-hover:scale-105 max-h-32 max-w-32' width={128} height={128} style={{ objectFit: 'contain' }} />
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
										<Image src={URL.createObjectURL(previewFile)} alt='Preview' className='object-contain h-full w-full rounded-lg max-h-32 max-w-32' width={128} height={128} style={{ objectFit: 'contain' }} unoptimized={true} />
										<button
											type='button'
											className='absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow hover:bg-blue-700 transition'
											onClick={async () => {
												if (!editing) return
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
													// Atualiza lista de imagens na página parent
													await onImagesUpdate()
												} else {
													toast({ type: 'error', title: 'Erro ao enviar imagem' })
												}
											}}
										>
											Enviar
										</button>
										<button type='button' className='absolute top-2 right-2 size-8 flex items-center justify-center bg-white/80 text-red-500 rounded-full hover:bg-red-100 dark:bg-zinc-800/80 dark:text-red-400 dark:hover:bg-red-800/30 transition' onClick={() => setPreviewFile(null)}>
											<span className='icon-[lucide--x] size-5' />
										</button>
									</div>
								)}
							</div>
							<Lightbox open={lightboxOpen} image={lightboxImage?.src || ''} alt={lightboxImage?.alt} onClose={() => setLightboxOpen(false)} />
						</div>
					)}
					{formError && <div className='text-red-600 text-sm'>{formError}</div>}
					<div className='flex justify-between gap-2'>
						{editing && (
							<Button type='button' style='bordered' className='text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20' onClick={() => setDeleteDialogOpen(true)}>
								Excluir problema
							</Button>
						)}
						<div className='flex gap-2'>
							<Button type='button' style='bordered' onClick={handleCloseOffcanvas}>
								Cancelar
							</Button>
							<Button type='submit' disabled={formLoading}>
								{formLoading ? (editing ? 'Salvando...' : 'Adicionando...') : editing ? 'Salvar' : 'Adicionar'}
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
						<Button type='button' className='bg-red-600 text-white hover:bg-red-700' disabled={deleteLoading} onClick={onDeleteProblem}>
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
								if (!editing) return
								const res = await fetch('/api/products/images', {
									method: 'DELETE',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ id: deleteImageId }),
								})
								setDeleteImageId(null)
								if (res.ok) {
									toast({ type: 'success', title: 'Imagem excluída' })
									// Atualiza lista de imagens na página parent
									await onImagesUpdate()
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
		</>
	)
}
