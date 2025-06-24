'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface FileUploadProps {
	channelId: string
	onFileUploaded: (file: unknown) => void
	onClose: () => void
}

interface FilePreview {
	file: File
	url: string
	category: 'image' | 'video' | 'audio' | 'document'
}

export default function FileUpload({ channelId, onFileUploaded, onClose }: FileUploadProps) {
	const [isDragOver, setIsDragOver] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([])
	const [uploadProgress, setUploadProgress] = useState(0)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Tipos de arquivo permitidos
	const ALLOWED_TYPES = {
		images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
		videos: ['video/mp4', 'video/webm'],
		audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
		documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
	}

	const getAllowedTypes = () => [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.videos, ...ALLOWED_TYPES.audio, ...ALLOWED_TYPES.documents]

	// Processar arquivos selecionados
	const processFiles = useCallback((files: FileList) => {
		// Constantes locais para evitar dependências externas
		const allowedTypes = {
			images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
			videos: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
			audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
			documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
		}

		const getAllowedTypesLocal = () => [...allowedTypes.images, ...allowedTypes.videos, ...allowedTypes.audio, ...allowedTypes.documents]

		// Determinar categoria do arquivo
		const getFileCategory = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
			if (allowedTypes.images.includes(mimeType)) return 'image'
			if (allowedTypes.videos.includes(mimeType)) return 'video'
			if (allowedTypes.audio.includes(mimeType)) return 'audio'
			return 'document'
		}

		// Validar arquivo
		const validateFile = (file: File): string | null => {
			const maxSize = 10 * 1024 * 1024 // 10MB

			if (!getAllowedTypesLocal().includes(file.type)) {
				return 'Tipo de arquivo não permitido'
			}

			if (file.size > maxSize) {
				return 'Arquivo muito grande (máximo 10MB)'
			}

			return null
		}

		const validFiles: FilePreview[] = []

		Array.from(files).forEach((file) => {
			const error = validateFile(file)
			if (!error) {
				const url = URL.createObjectURL(file)
				const category = getFileCategory(file.type)
				validFiles.push({ file, url, category })
			} else {
				console.log('❌ Erro no arquivo', file.name + ':', error)
			}
		})

		setSelectedFiles(validFiles)
	}, [])

	// Handlers de drag & drop
	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragOver(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragOver(false)
	}, [])

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			setIsDragOver(false)

			const files = e.dataTransfer.files
			if (files.length > 0) {
				processFiles(files)
			}
		},
		[processFiles],
	)

	// Handler de seleção via input
	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files
			if (files && files.length > 0) {
				processFiles(files)
			}
		},
		[processFiles],
	)

	// Upload de arquivos
	const handleUpload = async () => {
		if (selectedFiles.length === 0) return

		setIsUploading(true)
		setUploadProgress(0)

		try {
			for (let i = 0; i < selectedFiles.length; i++) {
				const filePreview = selectedFiles[i]
				const formData = new FormData()
				formData.append('file', filePreview.file)
				formData.append('channelId', channelId)

				const response = await fetch('/api/admin/chat/upload', {
					method: 'POST',
					body: formData,
				})

				if (response.ok) {
					const result = await response.json()
					onFileUploaded(result.file)
					console.log('✅ Arquivo enviado:', result.file.originalName)
				} else {
					const error = await response.json()
					console.log('❌ Erro no upload:', error.message)
				}

				// Atualizar progresso
				setUploadProgress(((i + 1) / selectedFiles.length) * 100)
			}

			// Limpar e fechar
			setSelectedFiles([])
			onClose()
		} catch (error) {
			console.log('❌ Erro no upload:', error)
		} finally {
			setIsUploading(false)
			setUploadProgress(0)
		}
	}

	// Remover arquivo da lista
	const removeFile = (index: number) => {
		setSelectedFiles((prev) => {
			const newFiles = [...prev]
			URL.revokeObjectURL(newFiles[index].url) // Limpar URL
			newFiles.splice(index, 1)
			return newFiles
		})
	}

	// Ícone por categoria
	const getFileIcon = (category: string) => {
		switch (category) {
			case 'image':
				return 'icon-[lucide--image]'
			case 'video':
				return 'icon-[lucide--video]'
			case 'audio':
				return 'icon-[lucide--audio-lines]'
			default:
				return 'icon-[lucide--file-text]'
		}
	}

	// Formatar tamanho do arquivo
	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
			<div className='w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-zinc-900'>
				{/* Header */}
				<div className='mb-4 flex items-center justify-between'>
					<h3 className='text-lg font-semibold'>Enviar Arquivos</h3>
					<button onClick={onClose} className='rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800'>
						<span className='icon-[lucide--x] size-5'></span>
					</button>
				</div>

				{/* Drop Zone */}
				{selectedFiles.length === 0 && (
					<div className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-600'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
						<input ref={fileInputRef} type='file' multiple accept={getAllowedTypes().join(',')} onChange={handleFileSelect} className='absolute inset-0 cursor-pointer opacity-0' />

						<div className='flex flex-col items-center gap-4'>
							<div className='rounded-full bg-zinc-100 p-4 dark:bg-zinc-800'>
								<span className='icon-[lucide--upload] size-8 text-zinc-400'></span>
							</div>
							<div>
								<p className='text-lg font-medium'>Arraste arquivos aqui ou clique para selecionar</p>
								<p className='mt-1 text-sm text-zinc-500'>Imagens, documentos, vídeos e áudios até 10MB</p>
							</div>
						</div>
					</div>
				)}

				{/* Lista de Arquivos Selecionados */}
				{selectedFiles.length > 0 && (
					<div className='space-y-4'>
						<div className='max-h-60 space-y-2 overflow-y-auto'>
							{selectedFiles.map((filePreview, index) => (
								<div key={index} className='flex items-center gap-3 rounded-lg border p-3 dark:border-zinc-700'>
									{/* Preview */}
									<div className='flex size-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800'>{filePreview.category === 'image' ? <Image src={filePreview.url} alt={filePreview.file.name} width={48} height={48} className='size-full rounded-lg object-cover' unoptimized /> : <span className={`${getFileIcon(filePreview.category)} size-6 text-zinc-400`}></span>}</div>

									{/* Info */}
									<div className='flex-1 min-w-0'>
										<p className='truncate font-medium'>{filePreview.file.name}</p>
										<p className='text-sm text-zinc-500'>
											{formatFileSize(filePreview.file.size)} • {filePreview.category}
										</p>
									</div>

									{/* Remover */}
									<button onClick={() => removeFile(index)} className='rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800'>
										<span className='icon-[lucide--x] size-4'></span>
									</button>
								</div>
							))}
						</div>

						{/* Progress */}
						{isUploading && (
							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span>Enviando arquivos...</span>
									<span>{Math.round(uploadProgress)}%</span>
								</div>
								<div className='h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700'>
									<div className='h-full bg-blue-500 transition-all duration-300' style={{ width: `${uploadProgress}%` }}></div>
								</div>
							</div>
						)}

						{/* Actions */}
						<div className='flex justify-end gap-3'>
							<button onClick={onClose} disabled={isUploading} className='rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800'>
								Cancelar
							</button>
							<button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0} className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'>
								{isUploading ? 'Enviando...' : `Enviar ${selectedFiles.length} arquivo${selectedFiles.length > 1 ? 's' : ''}`}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
