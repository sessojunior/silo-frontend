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
	onDelete?: (activityId: string) => void
}

interface ActivityFormData {
	name: string
	description: string
	status: Activity['status']
	priority: Activity['priority']
	category: string
	startDate: string
	endDate: string
	days: string // Dias estimados (conforme DB)
}

export default function ActivityFormOffcanvas({ isOpen, onClose, activity, project, onSubmit, onDelete }: ActivityFormOffcanvasProps) {
	const [formData, setFormData] = useState<ActivityFormData>({
		name: '',
		description: '',
		status: 'todo',
		priority: 'medium',
		category: '',
		startDate: '',
		endDate: '',
		days: '',
	})
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)

	// Opções de status - seguindo padrão do banco
	const statusOptions = [
		{ value: 'todo', label: '📋 A fazer' },
		{ value: 'progress', label: '🔄 Em progresso' },
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

	// Categorias organizadas para atividades
	const categoryOptions = [
		{ value: 'Desenvolvimento', label: '💻 Desenvolvimento' },
		{ value: 'Design', label: '🎨 Design' },
		{ value: 'Testes', label: '🧪 Testes' },
		{ value: 'Documentação', label: '📝 Documentação' },
		{ value: 'Pesquisa', label: '🔍 Pesquisa' },
		{ value: 'Reunião', label: '🤝 Reunião' },
		{ value: 'Planejamento', label: '📋 Planejamento' },
		{ value: 'Deploy', label: '🚀 Deploy' },
		{ value: 'Análise', label: '📊 Análise' },
		{ value: 'Correção', label: '🔧 Correção' },
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
				days: activity.estimatedHours ? activity.estimatedHours.toString() : '',
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
				days: '',
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

		if (formData.days && (isNaN(Number(formData.days)) || Number(formData.days) < 0)) {
			toast({
				type: 'error',
				title: 'Erro na validação',
				description: 'Dias estimados deve ser um número válido e positivo',
			})
			return
		}

		try {
			setSaving(true)
			console.log('🔵 Salvando atividade:', formData.name)

			// Converter days de string para number para o backend
			const submissionData = {
				...formData,
				estimatedHours: formData.days, // Manter compatibilidade com interface atual
			}

			await onSubmit(submissionData)

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

	const handleDelete = async () => {
		if (!activity || !onDelete) return

		// Confirmação dupla para exclusão
		if (!confirm(`Tem certeza que deseja excluir a atividade "${activity.name}"? Esta ação não pode ser desfeita.`)) {
			return
		}

		try {
			setDeleting(true)
			console.log('🔵 Excluindo atividade:', activity.id)

			await onDelete(activity.id)

			toast({
				type: 'success',
				title: 'Atividade excluída',
				description: `${activity.name} foi excluída com sucesso`,
			})

			onClose()
		} catch (error) {
			console.error('❌ Erro ao excluir atividade:', error)
			toast({
				type: 'error',
				title: 'Erro ao excluir',
				description: 'Não foi possível excluir a atividade. Tente novamente.',
			})
		} finally {
			setDeleting(false)
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
					<Input id='name' type='text' placeholder='Ex: Implementar autenticação de usuários' value={formData.name} setValue={(value) => handleFieldChange('name', value)} disabled={saving || deleting} required />
				</div>

				{/* Descrição */}
				<div>
					<Label htmlFor='description'>Descrição *</Label>
					<Textarea id='description' placeholder='Descreva o que deve ser feito nesta atividade...' value={formData.description} onChange={(e) => handleFieldChange('description', e.target.value)} disabled={saving || deleting} rows={3} required />
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

				{/* Linha: Prioridade e Dias Estimados */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{/* Prioridade */}
					<div>
						<Label htmlFor='priority'>Prioridade</Label>
						<Select name='priority' selected={formData.priority} onChange={(value) => handleFieldChange('priority', value)} options={priorityOptions} placeholder='Selecionar prioridade' />
					</div>

					{/* Dias Estimados - usando componente Input */}
					<div>
						<Label htmlFor='days'>Dias Estimados</Label>
						<Input id='days' type='text' placeholder='Ex: 3 ou 1.5' value={formData.days} setValue={(value) => handleFieldChange('days', value)} disabled={saving || deleting} />
					</div>
				</div>

				{/* Linha: Datas */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{/* Data de Início */}
					<div>
						<Label htmlFor='startDate'>Data de Início</Label>
						<input id='startDate' type='date' value={formData.startDate} onChange={(e) => handleFieldChange('startDate', e.target.value)} disabled={saving || deleting} className='block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300' />
					</div>

					{/* Data de Fim */}
					<div>
						<Label htmlFor='endDate'>Data de Fim</Label>
						<input id='endDate' type='date' value={formData.endDate} onChange={(e) => handleFieldChange('endDate', e.target.value)} disabled={saving || deleting} className='block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300' />
					</div>
				</div>

				{/* Botões - Layout: Excluir à esquerda, Cancelar e Salvar à direita */}
				<div className='flex justify-between items-center pt-6 border-t border-zinc-200 dark:border-zinc-700'>
					{/* Botão Excluir - Lado esquerdo */}
					<div>
						{activity && onDelete && (
							<Button type='button' onClick={handleDelete} style='bordered' className='text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20' disabled={saving || deleting}>
								{deleting ? (
									<>
										<span className='icon-[lucide--loader-circle] size-4 animate-spin mr-2' />
										Excluindo...
									</>
								) : (
									<>
										<span className='icon-[lucide--trash-2] size-4 mr-2' />
										Excluir
									</>
								)}
							</Button>
						)}
					</div>

					{/* Botões principais - Lado direito */}
					<div className='flex gap-3'>
						<Button type='button' onClick={onClose} style='bordered' disabled={saving || deleting}>
							Cancelar
						</Button>
						<Button type='submit' disabled={saving || deleting}>
							{saving ? (
								<>
									<span className='icon-[lucide--loader-circle] size-4 animate-spin mr-2' />
									Salvando...
								</>
							) : (
								<>
									<span className={`icon-[lucide--${activity ? 'edit' : 'plus'}] size-4 mr-2`} />
									Salvar atividade
								</>
							)}
						</Button>
					</div>
				</div>
			</form>
		</Offcanvas>
	)
}
