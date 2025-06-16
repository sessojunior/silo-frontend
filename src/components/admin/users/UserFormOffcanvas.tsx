'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'

import Offcanvas from '@/components/ui/Offcanvas'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import Button from '@/components/ui/Button'
import { AuthUser, Group } from '@/lib/db/schema'

// Interface para usuário com informações do grupo
interface UserWithGroup extends AuthUser {
	groupId?: string // Adicionado para compatibilidade com novo sistema
	groupName?: string
	groupIcon?: string
	groupColor?: string
}

interface UserFormOffcanvasProps {
	isOpen: boolean
	onClose: () => void
	user: UserWithGroup | null
	groups: Group[]
	onSuccess: () => void
}

export default function UserFormOffcanvas({ isOpen, onClose, user, groups, onSuccess }: UserFormOffcanvasProps) {
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		emailVerified: false,
		groupId: '',
		isActive: true,
	})

	const isEditing = !!user

	useEffect(() => {
		if (isOpen) {
			if (user) {
				setFormData({
					name: user.name || '',
					email: user.email || '',
					password: '',
					emailVerified: user.emailVerified || false,
					groupId: user.groupId || '',
					isActive: user.isActive !== undefined ? user.isActive : true,
				})
			} else {
				setFormData({
					name: '',
					email: '',
					password: '',
					emailVerified: false,
					groupId: '',
					isActive: true,
				})
			}
		}
	}, [isOpen, user])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!formData.name.trim() || !formData.email.trim() || !formData.groupId) {
			toast({
				type: 'error',
				title: 'Campos obrigatórios',
				description: 'Preencha todos os campos obrigatórios.',
			})
			return
		}

		if (!isEditing && !formData.password) {
			toast({
				type: 'error',
				title: 'Senha obrigatória',
				description: 'Senha é obrigatória para novos usuários.',
			})
			return
		}

		try {
			setLoading(true)
			const method = isEditing ? 'PUT' : 'POST'
			const body = isEditing
				? {
						id: user.id,
						...formData,
						...(formData.password ? { password: formData.password } : {}),
					}
				: formData

			const response = await fetch('/api/users', {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			const data = await response.json()

			if (data.success) {
				toast({
					type: 'success',
					title: `Usuário ${isEditing ? 'atualizado' : 'criado'}`,
					description: `${formData.name} foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
				})
				onSuccess()
			} else {
				toast({
					type: 'error',
					title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} usuário`,
					description: data.message || data.error || 'Erro desconhecido',
				})
			}
		} catch {
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: `Erro ao ${isEditing ? 'atualizar' : 'criar'} usuário`,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Offcanvas open={isOpen} onClose={onClose} title={isEditing ? 'Editar Usuário' : 'Novo Usuário'}>
			<p className='text-sm text-zinc-600 dark:text-zinc-400 mb-6'>{isEditing ? 'Edite as informações do usuário abaixo.' : 'Preencha as informações do novo usuário.'}</p>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div>
					<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2'>
						Nome <span className='text-red-500'>*</span>
					</label>
					<Input type='text' placeholder='Digite o nome do usuário' value={formData.name} setValue={(value) => setFormData((prev) => ({ ...prev, name: value }))} />
				</div>

				<div>
					<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2'>
						Email <span className='text-red-500'>*</span>
					</label>
					<Input type='email' placeholder='Digite o email do usuário' value={formData.email} setValue={(value) => setFormData((prev) => ({ ...prev, email: value }))} />
				</div>

				<div>
					<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2'>
						Senha {!isEditing && <span className='text-red-500'>*</span>}
						{isEditing && <span className='text-zinc-500 text-xs'>(deixe vazio para manter atual)</span>}
					</label>
					<Input type='text' placeholder={isEditing ? 'Digite nova senha (opcional)' : 'Digite a senha do usuário'} value={formData.password} setValue={(value) => setFormData((prev) => ({ ...prev, password: value }))} />
				</div>

				<div>
					<label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2'>
						Grupo <span className='text-red-500'>*</span>
					</label>
					<Select
						name='groupId'
						selected={formData.groupId}
						onChange={(value) => setFormData((prev) => ({ ...prev, groupId: value }))}
						options={groups.map((group) => ({
							value: group.id,
							label: group.name,
						}))}
						placeholder='Selecione um grupo'
					/>
				</div>

				<div className='space-y-4'>
					<Switch id='emailVerified' name='emailVerified' checked={formData.emailVerified} onChange={(checked) => setFormData((prev) => ({ ...prev, emailVerified: checked }))} title='Email Verificado' description='Marque se o email do usuário foi verificado' disabled={loading} />

					<Switch id='isActive' name='isActive' checked={formData.isActive} onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))} title='Usuário Ativo' description='Usuários inativos não conseguem fazer login' disabled={loading} />
				</div>

				<div className='flex gap-3 pt-4'>
					<Button type='button' onClick={onClose} disabled={loading} className='flex-1 bg-zinc-500 hover:bg-zinc-600'>
						Cancelar
					</Button>
					<Button type='submit' disabled={loading} className='flex-1 flex items-center justify-center gap-2'>
						{loading ? (
							<>
								<span className='icon-[lucide--loader-circle] size-4 animate-spin' />
								{isEditing ? 'Atualizando...' : 'Criando...'}
							</>
						) : (
							<>
								<span className={`icon-[lucide--${isEditing ? 'save' : 'plus'}] size-4`} />
								{isEditing ? 'Atualizar' : 'Criar'} usuário
							</>
						)}
					</Button>
				</div>
			</form>
		</Offcanvas>
	)
}
