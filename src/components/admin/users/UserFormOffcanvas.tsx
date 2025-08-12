'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'

import Offcanvas from '@/components/ui/Offcanvas'
import Input from '@/components/ui/Input'
import Switch from '@/components/ui/Switch'
import Button from '@/components/ui/Button'
import { AuthUser, Group } from '@/lib/db/schema'

// Interface para grupos selecionados (apenas IDs dos grupos)
interface SelectedGroup {
	groupId: string
}

// Interface para usuário com informações do grupo
interface UserWithGroup extends AuthUser {
	groupId?: string // Mantido para compatibilidade com código legado
	groupName?: string
	groupIcon?: string
	groupColor?: string
	groups?: Array<{
		groupId: string
		groupName: string
		groupIcon: string
		groupColor: string
	}>
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
		emailVerified: false,
		isActive: true,
	})
	const [selectedGroups, setSelectedGroups] = useState<SelectedGroup[]>([])

	const isEditing = !!user

	useEffect(() => {
		if (isOpen) {
			if (user) {
				setFormData({
					name: user.name || '',
					email: user.email || '',
					emailVerified: user.emailVerified || false,
					isActive: user.isActive !== undefined ? user.isActive : true,
				})

				// Carregar grupos selecionados (novo formato ou compatibilidade com legado)
				if (user.groups && user.groups.length > 0) {
					// Formato novo: múltiplos grupos
					setSelectedGroups(
						user.groups.map((g) => ({
							groupId: g.groupId,
						})),
					)
				} else if (user.groupId) {
					// Formato legado: um grupo apenas
					setSelectedGroups([{ groupId: user.groupId }])
				} else {
					setSelectedGroups([])
				}
			} else {
				setFormData({
					name: '',
					email: '',
					emailVerified: false,
					isActive: true,
				})
				setSelectedGroups([])
			}
		}
	}, [isOpen, user])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!formData.name.trim() || !formData.email.trim() || selectedGroups.length === 0) {
			toast({
				type: 'error',
				title: 'Campos obrigatórios',
				description: 'Preencha todos os campos obrigatórios e selecione pelo menos um grupo.',
			})
			return
		}

		try {
			setLoading(true)
			const method = isEditing ? 'PUT' : 'POST'

			// Preparar dados com múltiplos grupos (apenas IDs dos grupos)
			const bodyData = {
				...formData,
				groups: selectedGroups.map((sg) => ({ groupId: sg.groupId, role: 'member' })), // API ainda espera role
				// Manter compatibilidade com API legado
				groupId: selectedGroups[0]?.groupId || '',
			}

			const body = isEditing
				? {
						id: user.id,
						...bodyData,
					}
				: bodyData

			const response = await fetch('/api/admin/users', {
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
						Grupos <span className='text-red-500'>*</span>
					</label>
					<div className='max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg p-1'>
						{groups.map((group) => {
							const isSelected = selectedGroups.some((sg) => sg.groupId === group.id)

							return (
								<div key={group.id} className='flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md py-1 px-2'>
									<input
										type='checkbox'
										id={`group-${group.id}`}
										checked={isSelected}
										onChange={(e) => {
											if (e.target.checked) {
												setSelectedGroups((prev) => [...prev, { groupId: group.id }])
											} else {
												setSelectedGroups((prev) => prev.filter((sg) => sg.groupId !== group.id))
											}
										}}
										className='h-4 w-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500'
										disabled={loading}
									/>
									<div className='flex items-center'>
										<span className={`icon-[lucide--${group.icon}] size-4`} style={{ color: group.color || '#6b7280' }} />
										<label htmlFor={`group-${group.id}`} className='text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer'>
											{group.name}
										</label>
									</div>
								</div>
							)
						})}
					</div>

					{selectedGroups.length === 0 && <p className='text-xs text-zinc-500 dark:text-zinc-400 mt-1'>Selecione pelo menos um grupo</p>}

					{selectedGroups.length > 0 && (
						<p className='text-xs text-zinc-600 dark:text-zinc-400 mt-1'>
							{selectedGroups.length} grupo{selectedGroups.length !== 1 ? 's' : ''} selecionado{selectedGroups.length !== 1 ? 's' : ''}
						</p>
					)}
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
