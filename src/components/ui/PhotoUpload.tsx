'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from '@/lib/toast'
import { UploadButton } from '@/lib/uploadthing'

/**
 * Componente de upload de foto de perfil usando UploadThing v7
 */

type PhotoUploadProps = {
	image?: string
	className?: string
}

export default function PhotoUpload({ image, className }: PhotoUploadProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [isInvalid, setIsInvalid] = useState(false)
	const [invalidMessage, setInvalidMessage] = useState('')

	// Carrega imagem inicial (caso exista)
	useEffect(() => {
		if (image) {
			console.log('🔵 Carregando imagem inicial:', image)
			setPreviewUrl(`${image}?t=${Date.now()}`)
		}
	}, [image])

	return (
		<div className={twMerge(clsx('flex w-full', className))}>
			<div className='flex w-full gap-4'>
				{/* Avatar/Preview */}
				<div className='flex items-center justify-center'>
					<div className='group relative flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-zinc-300 bg-zinc-100 transition duration-200 hover:border-zinc-400 hover:bg-zinc-200 hover:ring-2 hover:ring-zinc-300'>{previewUrl ? <Image src={previewUrl} onError={() => setPreviewUrl(null)} alt='Preview da imagem' fill className='object-cover transition-transform duration-200 group-hover:scale-105' /> : <span className='icon-[lucide--circle-user-round] size-9 text-zinc-400 transition-colors duration-200 group-hover:text-zinc-500' />}</div>
				</div>

				{/* Infos e ações */}
				<div className='flex flex-col justify-center gap-2'>
					<div className={twMerge(clsx('block font-semibold', isInvalid && 'text-red-500'))}>Foto de perfil</div>

					<div className='flex gap-2'>
						{/* UploadThing button personalizado */}
						<UploadButton
							endpoint='avatarUploader'
							onClientUploadComplete={async (res) => {
								const url = res?.[0]?.url
								if (url) {
									try {
										// Envia a URL para a API para atualizar no banco de dados
										const apiRes = await fetch('/api/user-profile-image/update', {
											method: 'POST',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify({ imageUrl: url }),
										})

										if (apiRes.ok) {
											setPreviewUrl(`${url}?t=${Date.now()}`)
											setIsInvalid(false)
											toast({ type: 'success', title: 'Imagem atualizada', description: 'Sua imagem de perfil foi alterada com sucesso.' })
										} else {
											throw new Error('Erro ao atualizar imagem no banco de dados')
										}
									} catch (error) {
										console.error('❌ Erro ao atualizar URL da imagem:', error)
										setIsInvalid(true)
										setInvalidMessage('Erro ao salvar a imagem. Tente novamente.')
										toast({ type: 'error', title: 'Erro ao salvar a imagem' })
									}
								}
							}}
							onUploadError={(error) => {
								setIsInvalid(true)
								setInvalidMessage(error.message)
								toast({ type: 'error', title: error.message })
							}}
							appearance={{
								button: 'inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700',
								container: '',
								allowedContent: 'hidden',
							}}
							content={{
								button: (
									<>
										<span className='icon-[lucide--upload] size-4' /> Alterar
									</>
								),
								allowedContent: 'Imagens até 4MB',
							}}
						/>

						{/* Botão de apagar (mantém API antiga por enquanto) */}
						<button
							type='button'
							className='inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-200 hover:bg-zinc-100'
							onClick={async () => {
								try {
									const ok = await fetch('/api/user-profile-image', { method: 'DELETE' }).then((r) => r.ok)
									if (ok) {
										setPreviewUrl(null)
										toast({ type: 'success', title: 'Imagem removida', description: 'Sua imagem de perfil foi removida.' })
									} else {
										throw new Error('Não foi possível remover a imagem.')
									}
								} catch (err) {
									setIsInvalid(true)
									const errorMessage = err instanceof Error ? err.message : 'Erro ao remover imagem'
									setInvalidMessage(errorMessage)
									toast({ type: 'error', title: errorMessage })
								}
							}}
						>
							<span className='icon-[lucide--trash] size-4' /> Apagar
						</button>
					</div>

					<p className={twMerge(clsx('mt-1 text-xs', isInvalid ? 'text-red-500' : 'text-zinc-400'))}>{isInvalid ? invalidMessage : 'Formatos aceitos: jpg, png ou webp.'}</p>
				</div>
			</div>
		</div>
	)
}
