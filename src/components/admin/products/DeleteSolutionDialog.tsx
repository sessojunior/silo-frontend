'use client'

import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'

// Tipo customizado para soluções retornadas pela API
interface SolutionWithDetails {
	id: string
	replyId: string | null
	date: Date
	description: string
	verified: boolean
	user: {
		id: string
		name: string
		image: string
	}
	image: {
		image: string
		description: string
	} | null
	isMine: boolean
}

interface DeleteSolutionDialogProps {
	open: boolean
	onClose: () => void
	solutionToDelete: SolutionWithDetails | null
	deleteSolutionLoading: boolean
	onConfirmDelete: () => Promise<void>
}

export default function DeleteSolutionDialog({ open, onClose, solutionToDelete: _solutionToDelete, deleteSolutionLoading, onConfirmDelete }: DeleteSolutionDialogProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			title={
				<div className='flex items-center gap-2 text-red-600'>
					<span className='icon-[lucide--trash] size-4' />
					Excluir solução
				</div>
			}
			description='Tem certeza que deseja excluir esta solução? Esta ação não poderá ser desfeita.'
		>
			<div className='flex gap-2 justify-end mt-6'>
				<Button type='button' style='bordered' onClick={onClose}>
					Cancelar
				</Button>
				<Button type='button' className='bg-red-600 text-white hover:bg-red-700' disabled={deleteSolutionLoading} onClick={onConfirmDelete}>
					{deleteSolutionLoading ? 'Excluindo...' : 'Excluir'}
				</Button>
			</div>
		</Dialog>
	)
}
