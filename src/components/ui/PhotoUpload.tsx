'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from '@/lib/toast'

type PhotoUploadProps = {
	image?: string
} & React.FormHTMLAttributes<HTMLFormElement>

export default function PhotoUpload({ image, className, ...props }: PhotoUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const submitButtonRef = useRef<HTMLButtonElement>(null)

	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [isInvalid, setIsInvalid] = useState(false)
	const [invalidMessage, setInvalidMessage] = useState('')

	useEffect(() => {
		if (image) {
			setPreviewUrl(`${image}?timestamp=${Date.now()}`)
		}
	}, [image])

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (e) => {
				setPreviewUrl(e.target?.result as string)
				submitButtonRef.current?.click()
			}
			reader.readAsDataURL(file)
		} else {
			setPreviewUrl(null)
		}
	}

	const deleteProfileImage = async () => {
		const formData = new FormData()
		formData.append('intent', 'delete-profile-image')

		const res = await fetch('/api/user-profile-image', {
			method: 'DELETE',
			body: formData,
		})

		if (res.ok) {
			setPreviewUrl(null)
			if (fileInputRef.current) fileInputRef.current.value = ''
			setIsInvalid(false)

			toast({
				type: 'success',
				title: 'Imagem removida',
				description: 'Sua imagem de perfil foi removida com sucesso.',
			})
		} else {
			const { message } = await res.json()
			setInvalidMessage(message ?? 'Erro ao remover a imagem de perfil.')
			setIsInvalid(true)

			toast({
				type: 'error',
				title: 'Não foi possível remover a imagem de perfil.',
			})
		}
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const res = await fetch('/api/user-profile-image', {
			method: 'POST',
			body: formData,
		})

		if (res.ok) {
			setIsInvalid(false)

			toast({
				type: 'success',
				title: 'Imagem atualizada',
				description: 'Sua imagem de perfil foi alterada com sucesso.',
			})
		} else {
			const result = await res.json()
			setIsInvalid(true)
			setInvalidMessage(result.message ?? 'Erro ao atualizar imagem de perfil.')
			setPreviewUrl(image ? `${image}?timestamp=${Date.now()}` : null)

			toast({
				type: 'error',
				title: result.message ?? 'Não foi possível alterar a imagem de perfil.',
			})
		}
	}

	return (
		<form method='post' action='/api/user-profile-image' encType='multipart/form-data' onSubmit={handleSubmit} className={twMerge(clsx('flex w-full', className))} {...props}>
			<div className='flex w-full gap-4'>
				{/* Avatar/Preview */}
				<div className='flex items-center justify-center'>
					<button type='button' onClick={() => fileInputRef.current?.click()} aria-label='Alterar imagem de perfil' className='group relative flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-zinc-300 bg-zinc-100 transition duration-200 hover:border-zinc-400 hover:bg-zinc-200 hover:ring-2 hover:ring-zinc-300'>
						{previewUrl ? <Image src={previewUrl} onError={() => setPreviewUrl(null)} alt='Preview da imagem' fill className='object-cover transition-transform duration-200 group-hover:scale-105' /> : <span className='icon-[lucide--circle-user-round] size-9 text-zinc-400 transition-colors duration-200 group-hover:text-zinc-500' />}
					</button>
				</div>

				{/* Infos e ações */}
				<div className='flex flex-col justify-center gap-2'>
					<div className={twMerge(clsx('block font-semibold', isInvalid && 'text-red-500'))}>Foto de perfil</div>

					<div className='flex gap-2'>
						<button type='button' className='inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700' onClick={() => fileInputRef.current?.click()}>
							<span className='icon-[lucide--upload] size-4' />
							Alterar
						</button>

						<button type='button' className='inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-200 hover:bg-zinc-100' onClick={deleteProfileImage}>
							<span className='icon-[lucide--trash] size-4' />
							Apagar
						</button>
					</div>

					<p className={twMerge(clsx('mt-1 text-xs', isInvalid ? 'text-red-500' : 'text-zinc-400'))}>{isInvalid ? invalidMessage : 'Formatos aceitos: jpg, png ou webp.'}</p>
				</div>

				{/* Input oculto */}
				<input ref={fileInputRef} type='file' name='fileToUpload' accept='image/png, image/jpeg, image/webp' className='hidden' onChange={handleFileChange} />

				{/* Submit programático */}
				<button ref={submitButtonRef} type='submit' className='hidden'>
					Submeter
				</button>
			</div>
		</form>
	)
}
