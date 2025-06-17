'use client'

import { useState } from 'react'
import { Project } from '@/types/projects'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { toast } from '@/lib/toast'

interface ProjectDeleteDialogProps {
	isOpen: boolean
	onClose: () => void
	project: Project | null
	onConfirm: (projectId: string) => void
}

export default function ProjectDeleteDialog({ isOpen, onClose, project, onConfirm }: ProjectDeleteDialogProps) {
	const [deleting, setDeleting] = useState(false)

	const handleConfirm = async () => {
		if (!project) return

		try {
			setDeleting(true)
			console.log('🔵 Excluindo projeto:', project.name)

			await onConfirm(project.id)

			toast({
				type: 'success',
				title: 'Projeto excluído',
				description: `${project.name} foi excluído com sucesso`,
			})

			onClose()
		} catch (error) {
			console.error('❌ Erro ao excluir projeto:', error)
			toast({
				type: 'error',
				title: 'Erro ao excluir',
				description: 'Não foi possível excluir o projeto. Tente novamente.',
			})
		} finally {
			setDeleting(false)
		}
	}

	if (!project) return null

	return (
		<Dialog open={isOpen} onClose={onClose} title='Excluir Projeto'>
			<div className='space-y-4'>
				{/* Projeto a ser excluído */}
				<div className='bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700'>
					<div className='flex items-center gap-3'>
						<div className='size-10 rounded-lg flex items-center justify-center flex-shrink-0' style={{ backgroundColor: `${project.color}20` }}>
							<span className={`icon-[lucide--${project.icon}] size-5`} style={{ color: project.color }} />
						</div>
						<div className='min-w-0 flex-1'>
							<div className='font-medium text-zinc-900 dark:text-zinc-100'>{project.name}</div>
							<div className='text-sm text-zinc-500 dark:text-zinc-400 truncate'>{project.description}</div>
						</div>
					</div>
				</div>

				{/* Aviso */}
				<div className='text-sm text-zinc-600 dark:text-zinc-400'>
					<div className='flex items-start gap-2'>
						<span className='icon-[lucide--alert-triangle] size-5 text-red-500 mt-0.5 flex-shrink-0' />
						<div>
							<p className='font-medium text-red-600 dark:text-red-400'>Esta ação não pode ser desfeita!</p>
							<p className='mt-1'>O projeto e todos os seus dados associados serão permanentemente removidos.</p>
						</div>
					</div>
				</div>

				{/* Informações do projeto */}
				<div className='grid grid-cols-2 gap-4 text-sm'>
					<div>
						<span className='text-zinc-500 dark:text-zinc-400'>Status:</span>
						<div className='font-medium'>
							{project.status === 'active' && '🟢 Ativo'}
							{project.status === 'completed' && '🔵 Finalizado'}
							{project.status === 'paused' && '🟡 Pausado'}
							{project.status === 'cancelled' && '🔴 Cancelado'}
						</div>
					</div>
					<div>
						<span className='text-zinc-500 dark:text-zinc-400'>Progresso:</span>
						<div className='font-medium'>{project.progress}%</div>
					</div>
					<div>
						<span className='text-zinc-500 dark:text-zinc-400'>Membros:</span>
						<div className='font-medium'>{project.members?.length || 0}</div>
					</div>
					<div>
						<span className='text-zinc-500 dark:text-zinc-400'>Atividades:</span>
						<div className='font-medium'>{project.activities?.length || 0}</div>
					</div>
				</div>
			</div>

			{/* Botões */}
			<div className='flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700'>
				<Button type='button' onClick={onClose} style='bordered' className='flex-1' disabled={deleting}>
					Cancelar
				</Button>
				<Button type='button' onClick={handleConfirm} className='flex-1 bg-red-600 hover:bg-red-700 text-white' disabled={deleting}>
					{deleting ? (
						<>
							<span className='icon-[lucide--loader-circle] size-4 animate-spin mr-2' />
							Excluindo...
						</>
					) : (
						<>
							<span className='icon-[lucide--trash-2] size-4 mr-2' />
							Excluir Projeto
						</>
					)}
				</Button>
			</div>
		</Dialog>
	)
}
