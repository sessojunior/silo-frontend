import { useEffect, useState } from 'react'
import Offcanvas from '@/components/ui/Offcanvas'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { toast } from '@/lib/toast'
import ProblemCategoryFormOffcanvas from '@/components/admin/products/ProblemCategoryFormOffcanvas'

interface Category {
	id: string
	name: string
	color: string | null
}

interface Props {
	open: boolean
	onClose: () => void
}

export default function ProblemCategoryOffcanvas({ open, onClose }: Props) {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(false)
	const [formOpen, setFormOpen] = useState(false)
	const [editing, setEditing] = useState<Category | null>(null)
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; cat: Category | null }>({ open: false, cat: null })

	async function load() {
		setLoading(true)
		try {
			const res = await fetch('/api/admin/products/problems/categories')
			const json = await res.json()
			if (res.ok) {
				setCategories(json.data || [])
			}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (open) load()
	}, [open])

	const openCreate = () => {
		setEditing(null)
		setFormOpen(true)
	}

	const handleEdit = (cat: Category) => {
		setEditing(cat)
		setFormOpen(true)
	}

	const confirmDelete = async () => {
		if (!deleteDialog.cat) return
		const res = await fetch(`/api/admin/products/problems/categories?id=${deleteDialog.cat.id}`, { method: 'DELETE' })
		const json = await res.json()
		if (res.ok && json.success) {
			toast({ type: 'success', title: 'Categoria excluída' })
			setDeleteDialog({ open: false, cat: null })
			load()
		} else {
			toast({ type: 'error', title: json.message || 'Erro ao excluir' })
		}
	}

	return (
		<>
			<Offcanvas title='Gerenciar categorias de problemas' open={open} onClose={onClose} side='right' width='lg'>
				<div>
					{/* Botão cadastrar quando já existem itens */}
					{categories.length > 0 && (
						<div className='flex items-center pb-4 mb-4 border-b border-dashed border-zinc-200 dark:border-zinc-700'>
							<Button style='bordered' onClick={openCreate}>
								Cadastrar categoria
							</Button>
						</div>
					)}

					{/* Lista */}
					<div className='flex flex-col gap-2 max-h-[50vh] overflow-y-auto'>
						{loading && <div>Carregando...</div>}
						{!loading && categories.length === 0 && (
							<div className='flex flex-col items-center justify-center gap-3 text-zinc-500 py-12'>
								<span className='icon-[lucide--tag] size-12 text-zinc-300'></span>
								<p className='text-center'>Nenhuma categoria cadastrada.</p>
								<Button style='bordered' onClick={openCreate}>
									Cadastrar
								</Button>
							</div>
						)}
						{!loading &&
							categories.map((cat) => (
								<div key={cat.id} className='flex items-center justify-between rounded border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 p-4'>
									<div className='flex items-center gap-2'>
										<span className='size-3 rounded-full' style={{ backgroundColor: cat.color || '#64748B' }}></span>
										<span className='text-base'>{cat.name}</span>
									</div>
									<div className='flex gap-2'>
										<button title='Editar' onClick={() => handleEdit(cat)} className='inline-flex items-center justify-center size-8 rounded-full text-zinc-500 hover:bg-blue-100 hover:text-blue-700 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700 transition'>
											<span className='icon-[lucide--pencil] size-4'></span>
										</button>
										<button title='Excluir' onClick={() => setDeleteDialog({ open: true, cat })} className='inline-flex items-center justify-center size-8 rounded-full text-zinc-500 hover:bg-red-100 hover:text-red-700 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700 transition'>
											<span className='icon-[lucide--trash] size-4'></span>
										</button>
									</div>
								</div>
							))}
					</div>
				</div>
			</Offcanvas>

			{/* Dialog de exclusão */}
			<Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, cat: null })} title='Excluir categoria' description={`Tem certeza que deseja excluir "${deleteDialog.cat?.name}"? Essa ação não pode ser desfeita.`}>
				<div className='flex justify-end gap-2'>
					<Button style='bordered' onClick={() => setDeleteDialog({ open: false, cat: null })}>
						Cancelar
					</Button>
					<Button style='filled' className='bg-red-600 hover:bg-red-700' onClick={confirmDelete}>
						Excluir
					</Button>
				</div>
			</Dialog>

			{/* Offcanvas formulário */}
			<ProblemCategoryFormOffcanvas open={formOpen} onClose={() => setFormOpen(false)} category={editing} onSaved={load} />
		</>
	)
}
