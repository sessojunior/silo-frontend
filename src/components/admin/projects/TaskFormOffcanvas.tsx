'use client'

import { useState, useEffect } from 'react'
import Offcanvas from '@/components/ui/Offcanvas'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'
import Dialog from '@/components/ui/Dialog'
import { toast } from '@/lib/toast'

interface KanbanTask {
	id: string
	project_id: string
	project_activity_id: string
	name: string
	description: string
	category: string
	estimated_days: number
	status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	sort: number
	start_date: string
	end_date: string
	priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface TaskFormOffcanvasProps {
	isOpen: boolean
	onClose: () => void
	task?: KanbanTask | null
	initialStatus?: KanbanTask['status'] // Para quando criar nova tarefa numa coluna específica
	onSubmit: (taskData: TaskFormData) => void
	onDelete?: (task: KanbanTask) => void
}

interface TaskFormData {
	name: string
	description: string
	category: string
	estimatedDays: number
	startDate: string
	endDate: string
	priority: KanbanTask['priority']
	status: KanbanTask['status']
}

export default function TaskFormOffcanvas({ isOpen, onClose, task, initialStatus = 'todo', onSubmit, onDelete }: TaskFormOffcanvasProps) {
	const [formData, setFormData] = useState<TaskFormData>({
		name: '',
		description: '',
		category: '',
		estimatedDays: 1,
		startDate: '',
		endDate: '',
		priority: 'medium',
		status: initialStatus,
	})
	const [saving, setSaving] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [deleting, setDeleting] = useState(false)

	// Opções de status (colunas do Kanban)
	const statusOptions = [
		{ value: 'todo', label: '📋 A fazer' },
		{ value: 'in_progress', label: '🔄 Em progresso' },
		{ value: 'blocked', label: '🚫 Bloqueado' },
		{ value: 'review', label: '👁️ Em revisão' },
		{ value: 'done', label: '🏆 Concluído' },
	]

	// Opções de prioridade
	const priorityOptions = [
		{ value: 'low', label: '⬇️ Baixa' },
		{ value: 'medium', label: '➡️ Média' },
		{ value: 'high', label: '⬆️ Alta' },
		{ value: 'urgent', label: '🚨 Urgente' },
	]

	// Opções de categoria
	const categoryOptions = [
		{ value: 'Desenvolvimento', label: '💻 Desenvolvimento' },
		{ value: 'Infraestrutura', label: '🏗️ Infraestrutura' },
		{ value: 'Planejamento', label: '📊 Planejamento' },
		{ value: 'Teste', label: '🧪 Teste' },
		{ value: 'Documentação', label: '📚 Documentação' },
		{ value: 'Geral', label: '⚙️ Geral' },
	]

	// Opções de estimativa de dias
	const estimatedDaysOptions = [
		{ value: '1', label: '1 dia' },
		{ value: '2', label: '2 dias' },
		{ value: '3', label: '3 dias' },
		{ value: '5', label: '5 dias' },
		{ value: '8', label: '8 dias' },
		{ value: '13', label: '13 dias' },
		{ value: '21', label: '21 dias' },
	]

	// Carregar dados da tarefa para edição
	useEffect(() => {
		if (task) {
			setFormData({
				name: task.name,
				description: task.description,
				category: task.category || '',
				estimatedDays: task.estimated_days,
				startDate: task.start_date || '',
				endDate: task.end_date || '',
				priority: task.priority,
				status: task.status,
			})
		} else {
			// Reset para nova tarefa
			setFormData({
				name: '',
				description: '',
				category: '',
				estimatedDays: 1,
				startDate: '',
				endDate: '',
				priority: 'medium',
				status: initialStatus,
			})
		}
	}, [task, initialStatus, isOpen])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validações básicas
		if (!formData.name.trim()) {
			toast({
				type: 'error',
				title: 'Erro na validação',
				description: 'Nome da tarefa é obrigatório',
			})
			return
		}

		if (!formData.description.trim()) {
			toast({
				type: 'error',
				title: 'Erro na validação',
				description: 'Descrição da tarefa é obrigatória',
			})
			return
		}

		if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
			toast({
				type: 'error',
				title: 'Erro na validação',
				description: 'Data de início deve ser anterior à data de fim',
			})
			return
		}

		try {
			setSaving(true)
			console.log('🔵 Salvando tarefa:', formData.name)

			await onSubmit(formData)

			toast({
				type: 'success',
				title: task ? 'Tarefa atualizada' : 'Tarefa criada',
				description: `${formData.name} ${task ? 'foi atualizada' : 'foi criada'} com sucesso`,
			})

			onClose()
		} catch (error) {
			console.error('❌ Erro ao salvar tarefa:', error)
			toast({
				type: 'error',
				title: 'Erro ao salvar',
				description: 'Não foi possível salvar a tarefa. Tente novamente.',
			})
		} finally {
			setSaving(false)
		}
	}

	const handleFieldChange = (field: keyof TaskFormData, value: string | number) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}))
	}

	const handleDelete = () => {
		setDeleteDialogOpen(true)
	}

	const handleConfirmDelete = async () => {
		if (!task || !onDelete) return

		setDeleting(true)
		try {
			await onDelete(task)
			setDeleteDialogOpen(false)
			onClose()
		} finally {
			setDeleting(false)
		}
	}

	return (
		<>
			<Offcanvas open={isOpen} onClose={onClose} title={task ? 'Editar Tarefa' : 'Nova Tarefa'} width='xl'>
				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Nome da Tarefa */}
					<div>
						<Label htmlFor='name'>Nome da Tarefa *</Label>
						<Input id='name' type='text' placeholder='Ex: Implementar autenticação JWT' value={formData.name} setValue={(value) => handleFieldChange('name', value)} disabled={saving} required />
					</div>

					{/* Descrição */}
					<div>
						<Label htmlFor='description'>Descrição *</Label>
						<textarea id='description' value={formData.description} onChange={(e) => handleFieldChange('description', e.target.value)} placeholder='Descreva detalhadamente o que precisa ser feito nesta tarefa...' rows={4} disabled={saving} required className='w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none' />
					</div>

					{/* Linha: Status e Prioridade */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						{/* Status */}
						<div>
							<Label htmlFor='status'>Status</Label>
							<Select name='status' selected={formData.status} onChange={(value) => handleFieldChange('status', value as KanbanTask['status'])} options={statusOptions} placeholder='Selecionar status' />
						</div>

						{/* Prioridade */}
						<div>
							<Label htmlFor='priority'>Prioridade</Label>
							<Select name='priority' selected={formData.priority} onChange={(value) => handleFieldChange('priority', value as KanbanTask['priority'])} options={priorityOptions} placeholder='Selecionar prioridade' />
						</div>
					</div>

					{/* Linha: Categoria e Estimativa */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						{/* Categoria */}
						<div>
							<Label htmlFor='category'>Categoria</Label>
							<Select name='category' selected={formData.category} onChange={(value) => handleFieldChange('category', value)} options={categoryOptions} placeholder='Selecionar categoria' />
						</div>

						{/* Estimativa de dias */}
						<div>
							<Label htmlFor='estimatedDays'>Estimativa</Label>
							<Select name='estimatedDays' selected={formData.estimatedDays.toString()} onChange={(value) => handleFieldChange('estimatedDays', parseInt(value))} options={estimatedDaysOptions} placeholder='Estimativa de dias' />
						</div>
					</div>

					{/* Linha: Datas */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						{/* Data de Início */}
						<div>
							<Label htmlFor='startDate'>Data de Início</Label>
							<input id='startDate' type='date' value={formData.startDate} onChange={(e) => handleFieldChange('startDate', e.target.value)} disabled={saving} className='w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50' />
						</div>

						{/* Data de Fim */}
						<div>
							<Label htmlFor='endDate'>Data de Fim</Label>
							<input id='endDate' type='date' value={formData.endDate} onChange={(e) => handleFieldChange('endDate', e.target.value)} disabled={saving} className='w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50' />
						</div>
					</div>

					{/* Botões - Excluir à esquerda, Cancelar/Salvar à direita */}
					<div className='flex justify-between pt-6 border-t border-zinc-200 dark:border-zinc-700'>
						{/* Botão Excluir (esquerda) */}
						<div>
							{task && onDelete && (
								<Button type='button' onClick={handleDelete} className='bg-red-600 hover:bg-red-700 text-white' disabled={saving}>
									<span className='icon-[lucide--trash] size-4 mr-2' />
									Excluir
								</Button>
							)}
						</div>

						{/* Botões Cancelar/Salvar (direita) */}
						<div className='flex gap-3'>
							<Button type='button' onClick={onClose} className='bg-zinc-500 hover:bg-zinc-600 text-white' disabled={saving}>
								Cancelar
							</Button>
							<Button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white' disabled={saving}>
								{saving ? (
									<>
										<span className='icon-[lucide--loader-circle] size-4 animate-spin mr-2' />
										Salvando...
									</>
								) : (
									<>
										<span className='icon-[lucide--save] size-4 mr-2' />
										{task ? 'Salvar tarefa' : 'Criar tarefa'}
									</>
								)}
							</Button>
						</div>
					</div>
				</form>
			</Offcanvas>

			{/* Dialog de confirmação de exclusão integrado */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} title='Confirmar exclusão' description={`Tem certeza que deseja excluir a tarefa "${task?.name}"? Esta ação não pode ser desfeita.`}>
				<div className='flex gap-3 justify-end mt-6'>
					<Button type='button' style='bordered' onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
						Cancelar
					</Button>
					<Button type='button' onClick={handleConfirmDelete} disabled={deleting} className='bg-red-600 hover:bg-red-700 focus:bg-red-700'>
						{deleting ? (
							<>
								<span className='icon-[lucide--loader-2] size-4 animate-spin mr-2' />
								Excluindo...
							</>
						) : (
							<>
								<span className='icon-[lucide--trash] size-4 mr-2' />
								Excluir tarefa
							</>
						)}
					</Button>
				</div>
			</Dialog>
		</>
	)
}
