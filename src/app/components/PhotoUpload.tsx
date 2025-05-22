'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { clsx } from 'clsx' // Usado para juntar classes condicionalmente
import { twMerge } from 'tailwind-merge' // Junta classes do Tailwind com priorização de estilos

// Tipagem dos props aceitos pelo componente
type PhotoUploadProps = {
	image?: string // URL da imagem atual (opcional)
} & React.FormHTMLAttributes<HTMLFormElement> // Permite passar atributos nativos de formulário

export default function PhotoUpload({ image, className, ...props }: PhotoUploadProps) {
	// Referência para o input de arquivo (acesso direto ao DOM)
	const fileInputRef = useRef<HTMLInputElement>(null)
	// Referência para o botão de submit oculto
	const submitButtonRef = useRef<HTMLButtonElement>(null)

	// Estado da URL de preview da imagem selecionada
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	// Estado para controle de erro
	const [isInvalid, setIsInvalid] = useState(false)
	// Mensagem de erro personalizada
	const [invalidMessage, setInvalidMessage] = useState('')

	// Quando o componente monta ou a prop `image` mudar, define a URL de preview com timestamp (força recarregamento da imagem)
	useEffect(() => {
		if (image) {
			setPreviewUrl(`${image}?timestamp=${Date.now()}`)
		}
	}, [image])

	// Manipula a seleção de arquivo
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			// Quando terminar de ler o arquivo, define o preview e dispara o submit oculto
			reader.onload = (e) => {
				setPreviewUrl(e.target?.result as string)
				submitButtonRef.current?.click()
			}
			reader.readAsDataURL(file) // Lê a imagem como base64 para preview imediato
		} else {
			setPreviewUrl(null)
		}
	}

	// Envia requisição para apagar imagem de perfil
	const deleteProfileImage = async () => {
		const formData = new FormData()
		formData.append('intent', 'delete-profile-image')

		const res = await fetch('?/delete-profile-image', {
			method: 'POST',
			body: formData,
		})

		if (res.ok) {
			// Remove preview, limpa input, reseta erro
			setPreviewUrl(null)
			if (fileInputRef.current) fileInputRef.current.value = ''
			setIsInvalid(false)
		} else {
			// Exibe mensagem de erro vinda do backend
			const { message } = await res.json()
			setInvalidMessage(message ?? 'Erro ao apagar imagem.')
			setIsInvalid(true)
		}
	}

	// Envia a imagem de perfil via fetch ao fazer submit
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const formData = new FormData(e.currentTarget)
		const res = await fetch('?/upload-profile-image', {
			method: 'POST',
			body: formData,
		})

		if (res.ok) {
			// Upload OK, remove mensagens de erro
			setIsInvalid(false)
		} else {
			// Upload falhou, mostra erro e reseta preview
			const result = await res.json()
			setIsInvalid(true)
			setInvalidMessage(result.message ?? 'Erro ao atualizar imagem de perfil.')
			setPreviewUrl(image ? `${image}?timestamp=${Date.now()}` : null)
		}
	}

	return (
		<form method='post' action='?/upload-profile-image' encType='multipart/form-data' onSubmit={handleSubmit} className={twMerge(clsx('flex w-full', className))} {...props}>
			<div className='flex w-full gap-4'>
				{/* Seção da imagem de perfil com botão para clicar e abrir o seletor de arquivo */}
				<div className='flex items-center justify-center'>
					<button type='button' onClick={() => fileInputRef.current?.click()} aria-label='Alterar imagem de perfil' className='group relative flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-zinc-300 bg-zinc-100 transition duration-200 hover:border-zinc-400 hover:bg-zinc-200 hover:ring-2 hover:ring-zinc-300'>
						{/* Exibe imagem se houver preview; caso contrário, ícone padrão */}
						{previewUrl ? (
							<Image
								src={previewUrl}
								onError={() => setPreviewUrl(null)} // Remove imagem quebrada
								alt='Preview da imagem'
								fill
								className='object-cover transition-transform duration-200 group-hover:scale-105'
							/>
						) : (
							<span className='icon-[lucide--circle-user-round] size-9 text-zinc-400 transition-colors duration-200 group-hover:text-zinc-500' />
						)}
					</button>
				</div>

				{/* Informações e botões de ação */}
				<div className='flex flex-col justify-center gap-2'>
					{/* Título da seção com erro em vermelho, se necessário */}
					<div className={twMerge(clsx('block font-semibold', isInvalid && 'text-red-500'))}>Foto de perfil</div>

					{/* Botões de ação: alterar e apagar imagem */}
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

					{/* Mensagem auxiliar: erro ou texto padrão */}
					<p className={twMerge(clsx('mt-1 text-xs', isInvalid ? 'text-red-500' : 'text-zinc-400'))}>{isInvalid ? invalidMessage : 'Formatos aceitos: JPEG, PNG e WEBP.'}</p>
				</div>

				{/* Input de arquivo escondido, acionado por botões */}
				<input ref={fileInputRef} type='file' name='fileToUpload' accept='image/png, image/jpeg, image/webp' className='hidden' onChange={handleFileChange} />

				{/* Botão de submit escondido, usado programaticamente após seleção */}
				<button ref={submitButtonRef} type='submit' className='hidden'>
					Submeter
				</button>
			</div>
		</form>
	)
}
