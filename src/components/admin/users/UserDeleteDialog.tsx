'use client'

import { useState } from 'react'
import { toast } from '@/lib/toast'

import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { AuthUser } from '@/lib/db/schema'

interface UserDeleteDialogProps {
	isOpen: boolean
	onClose: () => void
	user: AuthUser | null
	onSuccess: () => void
}

export default function UserDeleteDialog({ isOpen, onClose, user, onSuccess }: UserDeleteDialogProps) {
	const [loading, setLoading] = useState(false)

	async function handleDelete() {
		if (!user) return

		try {
			setLoading(true)
			console.log('🔵 Excluindo usuário:', user.name)

			const response = await fetch('/api/admin/users', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id: user.id }),
			})

			const data = await response.json()

			if (data.success) {
				console.log('✅ Usuário excluído com sucesso')
				toast({
					type: 'success',
					title: 'Usuário excluído',
					description: `${user.name} foi excluído com sucesso.`,
				})
				onSuccess()
			} else {
				console.error('❌ Erro ao excluir usuário:', data.error)
				toast({
					type: 'error',
					title: 'Erro ao excluir usuário',
					description: data.message || data.error || 'Erro desconhecido',
				})
			}
		} catch (error) {
			console.error('❌ Erro inesperado ao excluir usuário:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao excluir usuário',
			})
		} finally {
			setLoading(false)
		}
	}

	if (!user) return null

	return (
		<Dialog open={isOpen} onClose={onClose} title='Excluir Usuário' description={`Tem certeza que deseja excluir o usuário "${user.name}"?`}>
			<div className='space-y-4'>
				<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
					<div className='flex items-start gap-3'>
						<span className='icon-[lucide--alert-triangle] size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
						<div>
							<h4 className='text-sm font-medium text-red-800 dark:text-red-200 mb-1'>Atenção! Esta ação é irreversível</h4>
							<p className='text-sm text-red-700 dark:text-red-300'>O usuário será permanentemente removido do sistema. Todos os dados associados (problemas, soluções, etc.) serão mantidos, mas ficarão sem referência ao usuário.</p>
						</div>
					</div>
				</div>

				{/* Informações do usuário */}
				<div className='bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4'>
					<h4 className='text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2'>Dados do usuário:</h4>
					<div className='space-y-1 text-sm text-zinc-600 dark:text-zinc-400'>
						<p>
							<strong>Nome:</strong> {user.name}
						</p>
						<p>
							<strong>Email:</strong> {user.email}
						</p>
						<p>
							<strong>Status:</strong> {user.isActive ? 'Ativo' : 'Inativo'}
						</p>
						<p>
							<strong>Email verificado:</strong> {user.emailVerified ? 'Sim' : 'Não'}
						</p>
					</div>
				</div>

				{/* Botões */}
				<div className='flex gap-3 pt-2'>
					<Button type='button' onClick={onClose} disabled={loading} className='flex-1 bg-zinc-500 hover:bg-zinc-600'>
						Cancelar
					</Button>
					<Button type='button' onClick={handleDelete} disabled={loading} className='flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2'>
						{loading ? (
							<>
								<span className='icon-[lucide--loader-circle] size-4 animate-spin' />
								Excluindo...
							</>
						) : (
							<>
								<span className='icon-[lucide--trash] size-4' />
								Excluir usuário
							</>
						)}
					</Button>
				</div>
			</div>
		</Dialog>
	)
}
