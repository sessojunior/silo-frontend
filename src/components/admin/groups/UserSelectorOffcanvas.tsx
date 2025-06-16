'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/lib/toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { AuthUser, Group } from '@/lib/db/schema'

interface UserSelectorOffcanvasProps {
	isOpen: boolean
	onClose: () => void
	group: Group | null
	onSuccess: () => void
}

export default function UserSelectorOffcanvas({ isOpen, onClose, group, onSuccess }: UserSelectorOffcanvasProps) {
	const [availableUsers, setAvailableUsers] = useState<AuthUser[]>([])
	const [filteredUsers, setFilteredUsers] = useState<AuthUser[]>([])
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
	const [loading, setLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const [search, setSearch] = useState('')

	const fetchAvailableUsers = useCallback(async () => {
		if (!group) return

		try {
			setLoading(true)
			console.log('🔵 Carregando usuários disponíveis para o grupo:', group.name)

			// Buscar todos os usuários que NÃO estão no grupo atual
			const response = await fetch('/api/users')
			const data = await response.json()

			if (data.success) {
				// Filtrar usuários que não estão no grupo atual
				const usersNotInGroup = data.data.items.filter((user: AuthUser) => user.groupId !== group.id)
				setAvailableUsers(usersNotInGroup)
				console.log('✅ Usuários disponíveis carregados:', usersNotInGroup.length)
			} else {
				console.error('❌ Erro ao carregar usuários:', data.error)
				toast({
					type: 'error',
					title: 'Erro ao carregar usuários',
					description: data.error || 'Erro desconhecido',
				})
			}
		} catch (error) {
			console.error('❌ Erro inesperado ao carregar usuários:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao carregar usuários disponíveis',
			})
		} finally {
			setLoading(false)
		}
	}, [group])

	// Carregar usuários disponíveis quando abrir
	useEffect(() => {
		if (isOpen && group) {
			fetchAvailableUsers()
		}
	}, [isOpen, group, fetchAvailableUsers])

	// Filtrar usuários por busca
	useEffect(() => {
		if (search.trim()) {
			const filtered = availableUsers.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()))
			setFilteredUsers(filtered)
		} else {
			setFilteredUsers(availableUsers)
		}
	}, [availableUsers, search])

	// Limpar estados ao fechar
	useEffect(() => {
		if (!isOpen) {
			setSelectedUsers(new Set())
			setSearch('')
			setAvailableUsers([])
			setFilteredUsers([])
		}
	}, [isOpen])

	function toggleUserSelection(userId: string) {
		setSelectedUsers((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(userId)) {
				newSet.delete(userId)
			} else {
				newSet.add(userId)
			}
			return newSet
		})
	}

	async function handleAddUsers() {
		if (!group || selectedUsers.size === 0) return

		try {
			setSaving(true)
			console.log('🔵 Adicionando usuários ao grupo:', group.name, 'Usuários:', selectedUsers.size)

			// Atualizar cada usuário selecionado para o grupo
			const updatePromises = Array.from(selectedUsers).map(async (userId) => {
				// Buscar dados completos do usuário
				const userToUpdate = availableUsers.find((user) => user.id === userId)
				if (!userToUpdate) {
					throw new Error(`Usuário ${userId} não encontrado`)
				}

				return fetch('/api/users', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: userId,
						name: userToUpdate.name,
						email: userToUpdate.email,
						emailVerified: userToUpdate.emailVerified,
						groupId: group.id,
						isActive: userToUpdate.isActive,
					}),
				})
			})

			const results = await Promise.all(updatePromises)
			const allSuccessful = results.every((res) => res.ok)

			if (allSuccessful) {
				console.log('✅ Usuários adicionados ao grupo com sucesso')
				toast({
					type: 'success',
					title: 'Usuários adicionados com sucesso',
					description: `${selectedUsers.size} ${selectedUsers.size === 1 ? 'usuário adicionado' : 'usuários adicionados'} ao grupo ${group.name}`,
				})
				onSuccess()
				onClose()
			} else {
				console.error('❌ Erro ao adicionar alguns usuários')

				// Log dos erros específicos para debug
				for (let i = 0; i < results.length; i++) {
					if (!results[i].ok) {
						const errorData = await results[i].json()
						console.error(`❌ Erro no usuário ${Array.from(selectedUsers)[i]}:`, errorData)
					}
				}

				toast({
					type: 'error',
					title: 'Erro ao adicionar usuários',
					description: 'Alguns usuários não foram adicionados. Verifique o console para mais detalhes.',
				})
			}
		} catch (error) {
			console.error('❌ Erro inesperado ao adicionar usuários:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao adicionar usuários ao grupo',
			})
		} finally {
			setSaving(false)
		}
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50'>
			{/* Backdrop */}
			<div className='fixed inset-0 bg-black/50' onClick={onClose} />

			{/* Offcanvas */}
			<div className='fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-zinc-900 shadow-xl transform transition-transform flex flex-col'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0'>
					<div>
						<h2 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>Adicionar Usuários</h2>
						<p className='text-sm text-zinc-600 dark:text-zinc-400'>Selecione usuários para adicionar ao grupo &quot;{group?.name}&quot;</p>
					</div>
					<Button onClick={onClose} className='size-8 p-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'>
						<span className='icon-[lucide--x] size-4 text-zinc-600 dark:text-zinc-400' />
					</Button>
				</div>

				{/* Search */}
				<div className='p-6 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0'>
					<div className='relative'>
						<Input type='text' placeholder='Buscar usuários...' value={search} setValue={setSearch} className='pl-10' />
						<span className='icon-[lucide--search] absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4' />
					</div>
				</div>

				{/* Users List */}
				<div className='flex-1 overflow-y-auto p-6'>
					{loading ? (
						<div className='flex items-center justify-center py-8'>
							<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
							<span className='ml-2 text-sm text-zinc-600 dark:text-zinc-400'>Carregando usuários...</span>
						</div>
					) : filteredUsers.length === 0 ? (
						<div className='text-center py-8'>
							<span className='icon-[lucide--user-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
							<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>{search ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}</h3>
							<p className='text-sm text-zinc-600 dark:text-zinc-400'>{search ? 'Tente ajustar o termo de busca.' : 'Todos os usuários já estão em grupos ou não há usuários cadastrados.'}</p>
						</div>
					) : (
						<div className='space-y-3'>
							{filteredUsers.map((user) => {
								const isSelected = selectedUsers.has(user.id)
								return (
									<div key={user.id} onClick={() => toggleUserSelection(user.id)} className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}>
										<div className='flex items-center gap-3'>
											{/* Checkbox visual */}
											<div className={`size-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-zinc-300 dark:border-zinc-600'}`}>{isSelected && <span className='icon-[lucide--check] size-3 text-white' />}</div>

											{/* Avatar */}
											<div className='size-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
												<span className='icon-[lucide--user] size-5 text-blue-600 dark:text-blue-400' />
											</div>

											{/* User info */}
											<div className='flex-1 min-w-0'>
												<div className='font-medium text-zinc-900 dark:text-zinc-100 truncate'>{user.name}</div>
												<div className='text-sm text-zinc-500 dark:text-zinc-400 truncate'>{user.email}</div>
												<div className='flex items-center gap-2 mt-1'>
													<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>{user.isActive ? '🟢 Ativo' : '🔴 Inativo'}</span>
													{user.groupId && <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'>Outro grupo</span>}
												</div>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className='p-6 border-t border-zinc-200 dark:border-zinc-700 flex-shrink-0'>
					<div className='flex items-center justify-between gap-4'>
						<div className='flex gap-3'>
							<Button onClick={onClose} style='bordered'>
								Cancelar
							</Button>
							<Button onClick={handleAddUsers} disabled={selectedUsers.size === 0 || saving} className='flex items-center gap-2'>
								{saving ? (
									<>
										<span className='icon-[lucide--loader-circle] size-4 animate-spin' />
										Adicionando...
									</>
								) : (
									<>
										<span className='icon-[lucide--user-plus] size-4' />
										Adicionar {selectedUsers.size > 0 && `(${selectedUsers.size})`}
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
