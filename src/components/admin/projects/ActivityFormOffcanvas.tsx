'use client'

import { useState, useEffect } from 'react'
import { Activity, Project } from '@/types/projects'
import Offcanvas from '@/components/ui/Offcanvas'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'
import { toast } from '@/lib/toast'

interface ActivityFormOffcanvasProps {
	isOpen: boolean
	onClose: () => void
	activity?: Activity | null
	project: Project
	onSubmit: (activityData: ActivityFormData) => void
}

interface ActivityFormData {
	name: string
	description: string
	status: Activity['status']
	priority: Activity['priority']
	category: string
	startDate: string
	endDate: string
	estimatedHours: string
}

export default function ActivityFormOffcanvas({ isOpen, onClose, activity, project, onSubmit }: ActivityFormOffcanvasProps) {
	const [formData, setFormData] = useState<ActivityFormData>({
		name: '',
		description: '',
		status: 'todo',
		priority: 'medium',
		category: '',
		startDate: '',
		endDate: '',
		estimatedHours: '',
	})
	const [saving, setSaving] = useState(false)

	// Opções de status
	const statusOptions = [
		{ value: 'todo', label: '📋 A fazer' },
		{ value: 'in_progress', label: '🔄 Em progresso' },
		{ value: 'review', label: '👀 Em revisão' },
		{ value: 'done', label: '✅ Concluída' },
		{ value: 'blocked', label: '🚫 Bloqueada' },
	]

	// Opções de prioridade
	const priorityOptions = [
		{ value: 'low', label: '⬇️ Baixa' },
		{ value: 'medium', label: '➡️ Média' },
		{ value: 'high', label: '⬆️ Alta' },
		{ value: 'urgent', label: '🚨 Urgente' },
	]

	// Categorias comuns para atividades
	const categoryOptions = [
		{ value: 'Sprint 1', label: '🏃 Sprint 1' },
		{ value: 'Sprint 2', label: '🏃 Sprint 2' },
		{ value: 'Sprint 3', label: '🏃 Sprint 3' },
		{ value: 'Backlog', label: '📋 Backlog' },
		{ value: 'Bug Fix', label: '🐛 Correção de Bug' },
		{ value: 'Feature', label: '⭐ Nova Funcionalidade' },
		{ value: 'Research', label: '🔍 Pesquisa' },
		{ value: 'Documentation', label: '📝 Documentação' },
		{ value: 'Testing', label: '🧪 Teste' },
		{ value: 'Deployment', label: '🚀 Deploy' },
	]

	// Carregar dados da atividade para edição
	useEffect(() => {
		if (activity) {
			setFormData({
				name: activity.name,
				description: activity.description,
				status: activity.status,
				priority: activity.priority,
				category: activity.category,
				startDate: activity.startDate || '',
				endDate: activity.endDate || '',
				estimatedHours: activity.estimatedHours ? activity.estimatedHours.toString() : '',
			})
		} else {
			// Reset para nova atividade
			setFormData({
				name: '',
				description: '',
				status: 'todo',
				priority: 'medium',
				category: '',
				startDate: '',
				endDate: '',
				estimatedHours: '',
			})
		}
	}, [activity, isOpen])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validações básicas
		if (!formData.name.trim()) {
			toast({
				type: 'error',
				title: 'Erro na validação',
				description: 'Nome da atividade é obrigatório',
			})
			return
		}

		if (!formData.description.trim()) {
			toast({
				type: 'error',
				title: 'Erro na validação',
				description: 'Descrição da atividade é obrigatória',
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

		if (formData.estimatedHours && isNaN(Number(formData.estimatedHours))) {
			toast({
				type: 'error',
				title: 'Erro na validação',
				description: 'Horas estimadas deve ser um número válido',
			})
			return
		}

		try {
			setSaving(true)
			console.log('🔵 Salvando atividade:', formData.name)

			await onSubmit(formData)

			toast({
				type: 'success',
				title: activity ? 'Atividade atualizada' : 'Atividade criada',
				description: `${formData.name} ${activity ? 'foi atualizada' : 'foi criada'} com sucesso`,
			})

			onClose()
		} catch (error) {
			console.error('❌ Erro ao salvar atividade:', error)
			toast({
				type: 'error',
				title: 'Erro ao salvar',
				description: 'Não foi possível salvar a atividade. Tente novamente.',
			})
		} finally {
			setSaving(false)
		}
	}

	const handleFieldChange = (field: keyof ActivityFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}))
	}

	return (
		<Offcanvas open={isOpen} onClose={onClose} title={activity ? 'Editar Atividade' : 'Nova Atividade'} width='lg'>
			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Informações do Projeto */}
				<div className='bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700'>
					<div className='flex items-center gap-3'>
						<div className='size-8 rounded-lg flex items-center justify-center' style={{ backgroundColor: `${project.color}20` }}>
							<span className={`icon-[lucide--${project.icon}] size-4`} style={{ color: project.color }} />
						</div>
						<div>
							<p className='font-medium text-zinc-900 dark:text-zinc-100'>{project.name}</p>
							<p className='text-sm text-zinc-500 dark:text-zinc-400'>Atividade para este projeto</p>
						</div>
					</div>
				</div>

				{/* Nome da Atividade */}
				<div>
					<Label htmlFor='name'>Nome da Atividade *</Label>
					<Input id='name' type='text' placeholder='Ex: Implementar autenticação de usuários' value={formData.name} setValue={(value) => handleFieldChange('name', value)} disabled={saving} required />
				</div>

				{/* Descrição */}
				<div>
					<Label htmlFor='description'>Descrição *</Label>
					<Textarea id='description' placeholder='Descreva o que deve ser feito nesta atividade...' value={formData.description} onChange={(e) => handleFieldChange('description', e.target.value)} disabled={saving} rows={3} required />
				</div>

				{/* Linha: Categoria e Status */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{/* Categoria */}
					<div>
						<Label htmlFor='category'>Categoria</Label>
						<Select name='category' selected={formData.category} onChange={(value) => handleFieldChange('category', value)} options={categoryOptions} placeholder='Selecionar categoria' />
					</div>

					{/* Status */}
					<div>
						<Label htmlFor='status'>Status</Label>
						<Select name='status' selected={formData.status} onChange={(value) => handleFieldChange('status', value)} options={statusOptions} placeholder='Selecionar status' />
					</div>
				</div>

				{/* Linha: Prioridade e Horas Estimadas */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{/* Prioridade */}
					<div>
						<Label htmlFor='priority'>Prioridade</Label>
						<Select name='priority' selected={formData.priority} onChange={(value) => handleFieldChange('priority', value)} options={priorityOptions} placeholder='Selecionar prioridade' />
					</div>

					{/* Horas Estimadas */}
					<div>
						<Label htmlFor='estimatedHours'>Horas Estimadas</Label>
						<input id='estimatedHours' type='number' placeholder='Ex: 8' value={formData.estimatedHours} onChange={(e) => handleFieldChange('estimatedHours', e.target.value)} disabled={saving} min='0' step='0.5' className='block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300' />
					</div>
				</div>

				{/* Linha: Datas */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{/* Data de Início */}
					<div>
						<Label htmlFor='startDate'>Data de Início</Label>
						<input id='startDate' type='date' value={formData.startDate} onChange={(e) => handleFieldChange('startDate', e.target.value)} disabled={saving} className='block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300' />
					</div>

					{/* Data de Fim */}
					<div>
						<Label htmlFor='endDate'>Data de Fim</Label>
						<input id='endDate' type='date' value={formData.endDate} onChange={(e) => handleFieldChange('endDate', e.target.value)} disabled={saving} className='block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300' />
					</div>
				</div>

				{/* Preview da Atividade */}
				<div className='bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700'>
					<Label>Preview</Label>
					<div className='mt-2 space-y-2'>
						<div className='flex items-center gap-2'>
							<div className={`size-2 rounded-full ${formData.status === 'todo' ? 'bg-zinc-400' : formData.status === 'in_progress' ? 'bg-blue-500' : formData.status === 'review' ? 'bg-yellow-500' : formData.status === 'done' ? 'bg-green-500' : 'bg-red-500'}`} />
							<span className='font-medium text-zinc-900 dark:text-zinc-100'>{formData.name || 'Nome da atividade'}</span>
						</div>
						<p className='text-sm text-zinc-500 dark:text-zinc-400'>{formData.description || 'Descrição da atividade'}</p>
						{formData.category && <span className='inline-block text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>{formData.category}</span>}
					</div>
				</div>

				{/* Botões */}
				<div className='flex gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-700'>
					<Button type='button' onClick={onClose} style='bordered' className='flex-1' disabled={saving}>
						Cancelar
					</Button>
					<Button type='submit' className='flex-1' disabled={saving}>
						{saving ? (
							<>
								<span className='icon-[lucide--loader-circle] size-4 animate-spin mr-2' />
								{activity ? 'Atualizando...' : 'Criando...'}
							</>
						) : (
							<>
								<span className={`icon-[lucide--${activity ? 'edit' : 'plus'}] size-4 mr-2`} />
								{activity ? 'Atualizar' : 'Criar'} Atividade
							</>
						)}
					</Button>
				</div>
			</form>
		</Offcanvas>
	)
}
