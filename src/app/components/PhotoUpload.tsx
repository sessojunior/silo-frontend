'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function PhotoUpload({ image }: { image?: string }) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const submitButtonRef = useRef<HTMLButtonElement>(null)

	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [isInvalid, setIsInvalid] = useState(false)
	const [invalidMessage, setInvalidMessage] = useState('')

	// Define a imagem inicial após o carregamento para evitar erro de SSR
	useEffect(() => {
		if (image) {
			setPreviewUrl(`${image}?timestamp=${Date.now()}`)
		}
	}, [image])

	// Função que envia o arquivo e atualiza a imagem de perfil
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (e) => {
				setPreviewUrl(e.target?.result as string)
				// Dispara o clique no botão de submit
				submitButtonRef.current?.click()
			}
			reader.readAsDataURL(file)
		} else {
			setPreviewUrl(null)
		}
	}

	// Função que apaga a imagem de perfil
	const deleteProfileImage = async () => {
		const formData = new FormData()
		formData.append('intent', 'delete-profile-image')

		const res = await fetch('?/delete-profile-image', {
			method: 'POST',
			body: formData,
		})

		if (res.ok) {
			setPreviewUrl(null)
			if (fileInputRef.current) fileInputRef.current.value = ''
			setIsInvalid(false)
			// toast({
			// 	title: 'Imagem de perfil removida com sucesso!',
			// 	icon: 'icon-[lucide--trash-2]',
			// 	type: 'success',
			// 	duration: 10000,
			// 	position: 'bottom-right',
			// })
		} else {
			const { message } = await res.json()
			setInvalidMessage(message ?? 'Erro ao apagar imagem.')
			setIsInvalid(true)
			// toast({
			// 	title: message ?? 'Erro ao apagar imagem.',
			// 	icon: 'icon-[lucide--triangle-alert]',
			// 	type: 'error',
			// 	duration: 10000,
			// 	position: 'bottom-right',
			// })
		}
	}

	// Função que limpa o input de arquivo
	// const clearFile = () => {
	// 	if (fileInputRef.current) fileInputRef.current.value = ''
	// 	setPreviewUrl(null)
	// }

	return (
		<form
			className='flex w-full'
			method='post'
			action='?/upload-profile-image'
			encType='multipart/form-data'
			onSubmit={async (e) => {
				e.preventDefault()
				const formData = new FormData(e.currentTarget)
				const res = await fetch('?/upload-profile-image', {
					method: 'POST',
					body: formData,
				})

				if (res.ok) {
					setIsInvalid(false)
					// toast({
					// 	title: 'Imagem de perfil atualizada com sucesso!',
					// 	icon: 'icon-[lucide--circle-check]',
					// 	type: 'success',
					// 	duration: 10000,
					// 	position: 'bottom-right',
					// })
				} else {
					const result = await res.json()
					setIsInvalid(true)
					setInvalidMessage(result.message ?? 'Erro ao atualizar imagem de perfil.')
					setPreviewUrl(image ? `${image}?timestamp=${Date.now()}` : null)
					// toast({
					// 	title: result.message ?? 'Erro ao atualizar imagem de perfil.',
					// 	icon: 'icon-[lucide--triangle-alert]',
					// 	type: 'error',
					// 	duration: 10000,
					// 	position: 'bottom-right',
					// })
				}
			}}
		>
			<div className='flex w-full gap-4'>
				<div className='flex items-center justify-center'>
					{/* Preview */}
					<button type='button' onClick={() => fileInputRef.current?.click()} aria-label='Alterar imagem de perfil' className='group relative flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-zinc-300 bg-zinc-100 transition duration-200 hover:border-zinc-400 hover:bg-zinc-200 hover:ring-2 hover:ring-zinc-300'>
						{previewUrl ? <Image src={previewUrl} onError={() => setPreviewUrl(null)} alt='Preview da imagem' className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105' /> : <span className='icon-[lucide--circle-user-round] size-9 text-zinc-400 transition-colors duration-200 group-hover:text-zinc-500'></span>}
					</button>
				</div>

				<div className='flex flex-col justify-center gap-2'>
					<div className={`block font-semibold ${isInvalid ? 'text-red-500' : ''}`}>Foto de perfil</div>

					{/* Botões */}
					<div className='flex gap-2'>
						{/* Botão de alterar */}
						<button type='button' className='inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700' onClick={() => fileInputRef.current?.click()}>
							<span className='icon-[lucide--upload] size-4'></span>
							Alterar
						</button>

						{/* Botão de apagar */}
						<button type='button' className='inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-200 hover:bg-zinc-100' onClick={deleteProfileImage}>
							<span className='icon-[lucide--trash] size-4'></span>
							Apagar
						</button>
					</div>

					{isInvalid ? <p className='mt-1 text-xs text-red-500'>{invalidMessage}</p> : <p className='mt-1 text-xs text-zinc-400'>Formatos aceitos: JPEG, PNG e WEBP.</p>}
				</div>

				{/* Input de arquivo oculto */}
				<input ref={fileInputRef} type='file' name='fileToUpload' accept='image/png, image/jpeg, image/webp' className='hidden' onChange={handleFileChange} />

				{/* Botão de submit disparado programaticamente */}
				<button ref={submitButtonRef} type='submit' className='hidden'>
					Submeter
				</button>
			</div>
		</form>
	)
}
