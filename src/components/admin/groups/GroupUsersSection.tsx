'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/lib/toast'
import Button from '@/components/ui/Button'
import UserSelectorOffcanvas from './UserSelectorOffcanvas'
import { AuthUser, Group } from '@/lib/db/schema'

interface GroupUsersSectionProps {
	group: Group
	isExpanded: boolean
	onUserAdded?: () => void
}

export default function GroupUsersSection({ group, isExpanded, onUserAdded }: GroupUsersSectionProps) {
	const [users, setUsers] = useState<AuthUser[]>([])
	const [loading, setLoading] = useState(false)
	const [selectorOpen, setSelectorOpen] = useState(false)

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true)
			console.log('🔵 Carregando usuários do grupo:', group.name)

			const response = await fetch(`/api/admin/users?groupId=${group.id}`)
			const data = await response.json()

			if (data.success) {
				setUsers(data.data.items)
				console.log('✅ Usuários do grupo carregados:', data.data.items.length)
			} else {
				console.error('❌ Erro ao carregar usuários do grupo:', data.error)
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
				description: 'Erro ao carregar usuários do grupo',
			})
		} finally {
			setLoading(false)
		}
	}, [group.id, group.name])

	// Carregar usuários quando expandido
	useEffect(() => {
		if (isExpanded && group.id) {
			fetchUsers()
		}
	}, [isExpanded, group.id, fetchUsers])

	function handleOpenSelector() {
		console.log('🔵 Abrindo seletor de usuários para o grupo:', group.name)
		setSelectorOpen(true)
	}

	function handleUserAdded() {
		// Recarregar usuários do grupo
		fetchUsers()
		// Notificar componente pai se necessário
		if (onUserAdded) {
			onUserAdded()
		}
	}

	async function handleRemoveUser(userId: string, userName: string) {
		try {
			console.log('🔵 Removendo usuário do grupo:', userName)

			// Buscar dados completos do usuário
			const userToUpdate = users.find((user) => user.id === userId)
			if (!userToUpdate) {
				console.error('❌ Usuário não encontrado na lista atual')
				toast({
					type: 'error',
					title: 'Erro',
					description: 'Usuário não encontrado na lista atual',
				})
				return
			}

			const response = await fetch(`/api/admin/groups/users?userId=${userId}&groupId=${group.id}`, {
				method: 'DELETE',
			})

			const data = await response.json()

			if (data.success) {
				console.log('✅ Usuário removido do grupo com sucesso')
				toast({
					type: 'success',
					title: 'Usuário removido',
					description: `${userName} foi removido do grupo ${group.name}`,
				})
				fetchUsers() // Recarregar lista
				if (onUserAdded) onUserAdded() // Atualizar estatísticas
			} else {
				console.error('❌ Erro ao remover usuário:', data.error || data.message)
				toast({
					type: 'error',
					title: 'Erro ao remover usuário',
					description: data.error || data.message || 'Erro desconhecido',
				})
			}
		} catch (error) {
			console.error('❌ Erro inesperado ao remover usuário:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao remover usuário do grupo',
			})
		}
	}

	if (!isExpanded) return null

	return (
		<>
			<tr>
				<td colSpan={5}>
					{/* Header da seção de usuários */}
					<div className='px-6 py-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<span className='icon-[lucide--users] size-4 text-zinc-600 dark:text-zinc-400' />
							<h4 className='font-medium text-zinc-900 dark:text-zinc-100'>Usuários do grupo {group.name}</h4>
							<span className='text-sm text-zinc-500 dark:text-zinc-400'>
								({users.length} {users.length === 1 ? 'usuário' : 'usuários'})
							</span>
						</div>
						<Button onClick={handleOpenSelector} className='flex items-center gap-2 text-sm px-3 py-1.5'>
							<span className='icon-[lucide--plus] size-3.5' />
							Adicionar usuário
						</Button>
					</div>

					{/* Conteúdo dos usuários */}
					<div className='p-4'>
						{loading ? (
							<div className='flex items-center justify-center py-8'>
								<span className='icon-[lucide--loader-circle] size-5 animate-spin text-zinc-400' />
								<span className='ml-2 text-sm text-zinc-600 dark:text-zinc-400'>Carregando usuários...</span>
							</div>
						) : users.length === 0 ? (
							<div className='text-center py-6'>
								<span className='icon-[lucide--user-x] size-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2 block' />
								<p className='text-sm text-zinc-600 dark:text-zinc-400 mb-3'>Nenhum usuário neste grupo ainda.</p>
								<Button onClick={handleOpenSelector} className='flex items-center gap-2 text-sm px-3 py-1.5 mx-auto' style='bordered'>
									<span className='icon-[lucide--plus] size-3.5' />
									Adicionar usuário
								</Button>
							</div>
						) : (
							<div className='space-y-2'>
								{users.map((user) => (
									<div key={user.id} className='flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700'>
										<div className='flex items-center gap-3'>
											{/* Avatar placeholder */}
											<div className='size-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
												<span className='icon-[lucide--user] size-4 text-blue-600 dark:text-blue-400' />
											</div>
											<div>
												<div className='font-medium text-zinc-900 dark:text-zinc-100 text-sm'>{user.name}</div>
												<div className='text-xs text-zinc-500 dark:text-zinc-400'>{user.email}</div>
											</div>
										</div>
										<div className='flex items-center gap-2'>
											{/* Status do usuário */}
											<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>{user.isActive ? '🟢 Ativo' : '🔴 Inativo'}</span>
											{/* Ação: Remover usuário do grupo */}
											<Button onClick={() => handleRemoveUser(user.id, user.name)} className='size-7 p-0 rounded-md bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20' title={`Remover ${user.name} do grupo ${group.name}`}>
												<span className='icon-[lucide--user-minus] size-3.5 text-red-600 dark:text-red-400' />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</td>
			</tr>

			{/* Offcanvas de Seleção de Usuários */}
			<UserSelectorOffcanvas isOpen={selectorOpen} onClose={() => setSelectorOpen(false)} group={group} onSuccess={handleUserAdded} />
		</>
	)
}
