'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/projects'
import Offcanvas from '@/components/ui/Offcanvas'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'
import { toast } from '@/lib/toast'

interface ProjectFormOffcanvasProps {
	isOpen: boolean
	onClose: () => void
	project?: Project | null
	onSubmit: (projectData: ProjectFormData) => void
	onDelete?: (project: Project) => void
}

interface ProjectFormData {
	name: string
	description: string
	icon: string
	color: string
	status: Project['status']
	priority: Project['priority']
	startDate: string
	endDate: string
}

export default function ProjectFormOffcanvas({ isOpen, onClose, project, onSubmit, onDelete }: ProjectFormOffcanvasProps) {
	const [formData, setFormData] = useState<ProjectFormData>({
		name: '',
		description: '',
		icon: 'folder',
		color: '#3b82f6',
		status: 'active',
		priority: 'medium',
		startDate: '',
		endDate: '',
	})
	const [saving, setSaving] = useState(false)

	// Ícones disponíveis para projetos
	const availableIcons = [
		{ value: 'folder', label: '📁 Pasta' },
		{ value: 'rocket', label: '🚀 Foguete' },
		{ value: 'target', label: '🎯 Alvo' },
		{ value: 'cloud', label: '☁️ Nuvem' },
		{ value: 'monitor', label: '🖥️ Monitor' },
		{ value: 'database', label: '🗄️ Database' },
		{ value: 'radar', label: '📡 Radar' },
		{ value: 'alert-triangle', label: '⚠️ Alerta' },
		{ value: 'settings', label: '⚙️ Configurações' },
		{ value: 'chart-line', label: '📈 Gráfico' },
	]

	// Cores disponíveis para projetos
	const availableColors = [
		{ value: '#3b82f6', label: 'Azul', color: '#3b82f6' },
		{ value: '#10b981', label: 'Verde', color: '#10b981' },
		{ value: '#f59e0b', label: 'Amarelo', color: '#f59e0b' },
		{ value: '#ef4444', label: 'Vermelho', color: '#ef4444' },
		{ value: '#8b5cf6', label: 'Roxo', color: '#8b5cf6' },
		{ value: '#06b6d4', label: 'Ciano', color: '#06b6d4' },
		{ value: '#f97316', label: 'Laranja', color: '#f97316' },
		{ value: '#84cc16', label: 'Lima', color: '#84cc16' },
		{ value: '#ec4899', label: 'Rosa', color: '#ec4899' },
		{ value: '#6b7280', label: 'Cinza', color: '#6b7280' },
	]

	// Opções de status
	const statusOptions = [
		{ value: 'active', label: '🟢 Ativo' },
		{ value: 'completed', label: '🔵 Finalizado' },
		{ value: 'paused', label: '🟡 Pausado' },
		{ value: 'cancelled', label: '🔴 Cancelado' },
	]

	// Opções de prioridade
	const priorityOptions = [
		{ value: 'low', label: '⬇️ Baixa' },
		{ value: 'medium', label: '➡️ Média' },
		{ value: 'high', label: '⬆️ Alta' },
		{ value: 'urgent', label: '🚨 Urgente' },
	]

	// Carregar dados do projeto para edição
	useEffect(() => {
		if (project) {
			setFormData({
				name: project.name,
				description: project.description,
				icon: project.icon,
				color: project.color,
				status: project.status,
				priority: project.priority,
				startDate: project.startDate || '',
				endDate: project.endDate || '',
			})
		} else {
			// Reset para novo projeto
			setFormData({
				name: '',
				description: '',
				icon: 'folder',
				color: '#3b82f6',
				status: 'active',
				priority: 'medium',
				startDate: '',
				endDate: '',
			})
		}
	}, [project, isOpen])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validações básicas
		if (!formData.name.trim()) {
			toast({
				type: 'error',
				title: 'Erro na validação',
				description: 'Nome do projeto é obrigatório',
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
			console.log('🔵 Salvando projeto:', formData.name)

			await onSubmit(formData)

			toast({
				type: 'success',
				title: project ? 'Projeto atualizado' : 'Projeto criado',
				description: `${formData.name} ${project ? 'foi atualizado' : 'foi criado'} com sucesso`,
			})

			onClose()
		} catch (error) {
			console.error('❌ Erro ao salvar projeto:', error)
			toast({
				type: 'error',
				title: 'Erro ao salvar',
				description: 'Não foi possível salvar o projeto. Tente novamente.',
			})
		} finally {
			setSaving(false)
		}
	}

	const handleFieldChange = (field: keyof ProjectFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}))
	}

	return (
		<Offcanvas open={isOpen} onClose={onClose} title={project ? 'Editar Projeto' : 'Novo Projeto'} width='lg'>
			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Nome do Projeto */}
				<div>
					<Label htmlFor='name'>Nome do Projeto *</Label>
					<Input id='name' type='text' placeholder='Ex: Sistema de Previsão BAM' value={formData.name} setValue={(value) => handleFieldChange('name', value)} disabled={saving} required />
				</div>

				{/* Descrição */}
				<div>
					<Label htmlFor='description'>Descrição</Label>
					<Textarea id='description' placeholder='Descreva o objetivo e escopo do projeto...' value={formData.description} onChange={(e) => handleFieldChange('description', e.target.value)} disabled={saving} rows={3} />
				</div>

				{/* Linha: Ícone e Cor */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{/* Ícone */}
					<div>
						<Label htmlFor='icon'>Ícone</Label>
						<Select name='icon' selected={formData.icon} onChange={(value) => handleFieldChange('icon', value)} options={availableIcons} placeholder='Selecionar ícone' />
					</div>

					{/* Cor */}
					<div>
						<Label htmlFor='color'>Cor</Label>
						<div className='space-y-2'>
							<div className='grid grid-cols-5 gap-2'>
								{availableColors.map((color) => (
									<button key={color.value} type='button' onClick={() => handleFieldChange('color', color.value)} className={`size-8 rounded-lg border-2 transition-all duration-200 ${formData.color === color.value ? 'border-zinc-400 scale-110' : 'border-zinc-200 dark:border-zinc-700 hover:scale-105'}`} style={{ backgroundColor: color.color }} title={color.label} disabled={saving} />
								))}
							</div>
							<div className='text-xs text-zinc-500 dark:text-zinc-400'>Cor selecionada: {availableColors.find((c) => c.value === formData.color)?.label}</div>
						</div>
					</div>
				</div>

				{/* Linha: Status e Prioridade */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{/* Status */}
					<div>
						<Label htmlFor='status'>Status</Label>
						<Select name='status' selected={formData.status} onChange={(value) => handleFieldChange('status', value)} options={statusOptions} placeholder='Selecionar status' />
					</div>

					{/* Prioridade */}
					<div>
						<Label htmlFor='priority'>Prioridade</Label>
						<Select name='priority' selected={formData.priority} onChange={(value) => handleFieldChange('priority', value)} options={priorityOptions} placeholder='Selecionar prioridade' />
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

				{/* Preview do Projeto */}
				<div className='bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700'>
					<Label>Preview</Label>
					<div className='flex items-center gap-3 mt-2'>
						<div className='size-10 rounded-lg flex items-center justify-center' style={{ backgroundColor: `${formData.color}20` }}>
							<span className={`icon-[lucide--${formData.icon}] size-5`} style={{ color: formData.color }} />
						</div>
						<div>
							<div className='font-medium text-zinc-900 dark:text-zinc-100'>{formData.name || 'Nome do projeto'}</div>
							<div className='text-sm text-zinc-500 dark:text-zinc-400'>{formData.description || 'Descrição do projeto'}</div>
						</div>
					</div>
				</div>

				{/* Botões */}
				<div className='flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700'>
					{/* Botão de Exclusão (apenas para edição) */}
					{project && onDelete && (
						<Button
							type='button'
							onClick={() => {
								onDelete(project)
								onClose()
							}}
							className='bg-red-600 hover:bg-red-700 text-white'
							disabled={saving}
						>
							<span className='icon-[lucide--trash-2] size-4 mr-2' />
							Excluir
						</Button>
					)}

					{/* Botões Principais */}
					<div className='flex gap-3 flex-1'>
						<Button type='button' onClick={onClose} style='bordered' className='flex-1' disabled={saving}>
							Cancelar
						</Button>
						<Button type='submit' className='flex-1' disabled={saving}>
							{saving ? (
								<>
									<span className='icon-[lucide--loader-circle] size-4 animate-spin mr-2' />
									{project ? 'Atualizando...' : 'Criando...'}
								</>
							) : (
								<>
									<span className={`icon-[lucide--${project ? 'edit' : 'plus'}] size-4 mr-2`} />
									{project ? 'Atualizar' : 'Criar'} Projeto
								</>
							)}
						</Button>
					</div>
				</div>
			</form>
		</Offcanvas>
	)
}
