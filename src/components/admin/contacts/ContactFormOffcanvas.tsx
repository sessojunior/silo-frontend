'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from '@/lib/toast'

import Offcanvas from '@/components/ui/Offcanvas'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Contact } from '@/lib/db/schema'

interface ContactFormOffcanvasProps {
	isOpen: boolean
	onClose: () => void
	contact?: Contact | null
	onSuccess?: () => void
}

export default function ContactFormOffcanvas({ isOpen, onClose, contact, onSuccess }: ContactFormOffcanvasProps) {
	const [loading, setLoading] = useState(false)
	const [imagePreview, setImagePreview] = useState<string | null>(contact?.image || null)
	const [removeImage, setRemoveImage] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Estados do formulário
	const [formData, setFormData] = useState({
		name: contact?.name || '',
		role: contact?.role || '',
		team: contact?.team || '',
		email: contact?.email || '',
		phone: contact?.phone || '',
		active: contact?.active ?? true,
	})

	// Atualizar form quando contato mudar
	useEffect(() => {
		if (contact) {
			setFormData({
				name: contact.name,
				role: contact.role,
				team: contact.team,
				email: contact.email,
				phone: contact.phone || '',
				active: contact.active,
			})
			setImagePreview(contact.image || null)
			setRemoveImage(false)
		} else {
			setFormData({
				name: '',
				role: '',
				team: '',
				email: '',
				phone: '',
				active: true,
			})
			setImagePreview(null)
			setRemoveImage(false)
		}
	}, [contact])

	const handleInputChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Validações
		if (file.size > 4 * 1024 * 1024) {
			toast({
				type: 'error',
				title: 'Arquivo muito grande',
				description: 'A imagem deve ter no máximo 4MB',
			})
			return
		}

		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
		if (!allowedTypes.includes(file.type)) {
			toast({
				type: 'error',
				title: 'Formato não suportado',
				description: 'Use apenas imagens JPG, PNG ou WebP',
			})
			return
		}

		// Preview
		const reader = new FileReader()
		reader.onload = (e) => {
			setImagePreview(e.target?.result as string)
			setRemoveImage(false)
		}
		reader.readAsDataURL(file)
	}

	const handleRemoveImage = () => {
		setImagePreview(null)
		setRemoveImage(true)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validações
		if (!formData.name.trim() || formData.name.trim().length < 2) {
			toast({
				type: 'error',
				title: 'Nome inválido',
				description: 'O nome deve ter pelo menos 2 caracteres',
			})
			return
		}

		if (!formData.role.trim() || formData.role.trim().length < 2) {
			toast({
				type: 'error',
				title: 'Função inválida',
				description: 'A função deve ter pelo menos 2 caracteres',
			})
			return
		}

		if (!formData.team.trim() || formData.team.trim().length < 2) {
			toast({
				type: 'error',
				title: 'Equipe inválida',
				description: 'A equipe deve ter pelo menos 2 caracteres',
			})
			return
		}

		if (!formData.email.trim() || !formData.email.includes('@')) {
			toast({
				type: 'error',
				title: 'Email inválido',
				description: 'Digite um email válido',
			})
			return
		}

		try {
			setLoading(true)

			const submitFormData = new FormData()

			// Dados básicos
			submitFormData.append('name', formData.name.trim())
			submitFormData.append('role', formData.role.trim())
			submitFormData.append('team', formData.team.trim())
			submitFormData.append('email', formData.email.trim().toLowerCase())
			submitFormData.append('phone', formData.phone.trim())
			submitFormData.append('active', formData.active.toString())

			// Para edição, incluir ID
			if (contact) {
				submitFormData.append('id', contact.id)
			}

			// Imagem
			const fileInput = fileInputRef.current
			if (fileInput?.files?.[0]) {
				submitFormData.append('file', fileInput.files[0])
			}

			if (removeImage) {
				submitFormData.append('removeImage', 'true')
			}

			const method = contact ? 'PUT' : 'POST'
			const response = await fetch('/api/contacts', {
				method,
				body: submitFormData,
			})

			const data = await response.json()

			if (data.success) {
				toast({
					type: 'success',
					title: contact ? 'Contato atualizado' : 'Contato criado',
					description: `${formData.name} foi ${contact ? 'atualizado' : 'criado'} com sucesso`,
				})

				onSuccess?.()
				onClose()

				// Reset form
				setFormData({
					name: '',
					role: '',
					team: '',
					email: '',
					phone: '',
					active: true,
				})
				setImagePreview(null)
				setRemoveImage(false)
				if (fileInputRef.current) {
					fileInputRef.current.value = ''
				}
			} else {
				toast({
					type: 'error',
					title: contact ? 'Erro ao atualizar' : 'Erro ao criar',
					description: data.error || 'Erro desconhecido',
				})
			}
		} catch (error) {
			console.error('❌ Erro ao salvar contato:', error)
			toast({
				type: 'error',
				title: 'Erro',
				description: 'Erro ao salvar contato',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleClose = () => {
		if (!loading) {
			onClose()
			// Reset form apenas se não estiver carregando
			setTimeout(() => {
				setFormData({
					name: '',
					role: '',
					team: '',
					email: '',
					phone: '',
					active: true,
				})
				setImagePreview(null)
				setRemoveImage(false)
				if (fileInputRef.current) {
					fileInputRef.current.value = ''
				}
			}, 300)
		}
	}

	return (
		<Offcanvas open={isOpen} onClose={handleClose} title={contact ? 'Editar Contato' : 'Novo Contato'}>
			<form onSubmit={handleSubmit} className='flex flex-col h-full -m-6'>
				<div className='flex-1 space-y-6 p-6'>
					{/* Upload de Imagem */}
					<div>
						<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3'>Foto do Contato</label>

						<div className='flex items-center gap-4'>
							{/* Preview da imagem */}
							<div className='size-20 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center'>{imagePreview ? <img src={imagePreview} alt='Preview' className='size-full object-cover' /> : <span className='icon-[lucide--user] size-8 text-zinc-400' />}</div>

							{/* Controles */}
							<div className='flex-1 space-y-2'>
								<input ref={fileInputRef} type='file' accept='image/jpeg,image/jpg,image/png,image/webp' onChange={handleImageChange} className='hidden' />

								<div className='flex gap-2'>
									<Button type='button' style='bordered' onClick={() => fileInputRef.current?.click()}>
										<span className='icon-[lucide--upload] size-4 mr-2' />
										Escolher imagem
									</Button>

									{imagePreview && (
										<Button type='button' style='bordered' onClick={handleRemoveImage} className='text-red-600 hover:text-red-700'>
											<span className='icon-[lucide--x] size-4 mr-2' />
											Remover
										</Button>
									)}
								</div>

								<p className='text-xs text-zinc-500'>JPG, PNG ou WebP • Máximo 4MB</p>
							</div>
						</div>
					</div>

					{/* Nome */}
					<div>
						<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2'>Nome Completo *</label>
						<Input type='text' placeholder='Ex: Dr. João Silva' value={formData.name} setValue={(value) => handleInputChange('name', value)} required />
					</div>

					{/* Função */}
					<div>
						<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2'>Função *</label>
						<Input type='text' placeholder='Ex: Pesquisador Sênior' value={formData.role} setValue={(value) => handleInputChange('role', value)} required />
					</div>

					{/* Equipe */}
					<div>
						<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2'>Equipe/Departamento *</label>
						<Input type='text' placeholder='Ex: Meteorologia Dinâmica' value={formData.team} setValue={(value) => handleInputChange('team', value)} required />
					</div>

					{/* Email */}
					<div>
						<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2'>Email *</label>
						<Input type='email' placeholder='joao.silva@inpe.br' value={formData.email} setValue={(value) => handleInputChange('email', value)} required />
					</div>

					{/* Telefone */}
					<div>
						<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2'>Telefone</label>
						<Input type='text' mask='phone' placeholder='(12) 3208-6000' value={formData.phone} setValue={(value) => handleInputChange('phone', value)} />
					</div>

					{/* Status */}
					<div>
						<label className='flex items-center gap-3'>
							<input type='checkbox' checked={formData.active} onChange={(e) => handleInputChange('active', e.target.checked)} className='size-4 text-blue-600 bg-zinc-100 border-zinc-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600' />
							<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Contato ativo</span>
						</label>
						<p className='text-xs text-zinc-500 mt-1 ml-7'>Contatos ativos aparecem na seleção de produtos</p>
					</div>
				</div>

				{/* Footer com botões */}
				<div className='border-t border-zinc-200 dark:border-zinc-700 p-6 flex gap-3 justify-end'>
					<Button type='button' style='bordered' onClick={handleClose} disabled={loading}>
						Cancelar
					</Button>
					<Button type='submit' disabled={loading}>
						{loading ? (
							<>
								<span className='icon-[lucide--loader-2] size-4 animate-spin mr-2' />
								Salvando...
							</>
						) : (
							<>{contact ? 'Atualizar' : 'Criar'} contato</>
						)}
					</Button>
				</div>
			</form>
		</Offcanvas>
	)
}
