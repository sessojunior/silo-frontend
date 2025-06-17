'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'

import Offcanvas from '@/components/ui/Offcanvas'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import Label from '@/components/ui/Label'

// Tipos de configuração do Kanban
export interface KanbanColumnConfig {
	id: string
	title: string
	color: string
	icon: string
	visible: boolean
	rules: {
		maxCards: number | null
		allowPriorities: string[]
		blockIfFull: boolean
		autoAssignOwner: boolean
	}
}

export interface KanbanConfig {
	columns: KanbanColumnConfig[]
	general: {
		enableWipLimits: boolean
		showProgressBars: boolean
		enableDragDrop: boolean
		autoSave: boolean
		refreshInterval: number
	}
	notifications: {
		onLimitReached: boolean
		onCardMoved: boolean
		onCardCompleted: boolean
	}
}

interface KanbanConfigOffcanvasProps {
	isOpen: boolean
	onClose: () => void
	initialConfig?: KanbanConfig | null
	onSave: (config: KanbanConfig) => void
}

// Configuração padrão
const DEFAULT_CONFIG: KanbanConfig = {
	columns: [
		{
			id: 'todo',
			title: 'A Fazer',
			color: '#6b7280',
			icon: 'circle',
			visible: true,
			rules: { maxCards: 20, allowPriorities: ['low', 'medium', 'high', 'urgent'], blockIfFull: false, autoAssignOwner: false },
		},
		{
			id: 'in_progress',
			title: 'Em Progresso',
			color: '#3b82f6',
			icon: 'play-circle',
			visible: true,
			rules: { maxCards: 5, allowPriorities: ['medium', 'high', 'urgent'], blockIfFull: true, autoAssignOwner: true },
		},
		{
			id: 'blocked',
			title: 'Bloqueado',
			color: '#ef4444',
			icon: 'x-circle',
			visible: true,
			rules: { maxCards: 10, allowPriorities: ['medium', 'high', 'urgent'], blockIfFull: false, autoAssignOwner: false },
		},
		{
			id: 'review',
			title: 'Em Revisão',
			color: '#f59e0b',
			icon: 'eye',
			visible: true,
			rules: { maxCards: 3, allowPriorities: ['high', 'urgent'], blockIfFull: true, autoAssignOwner: false },
		},
		{
			id: 'done',
			title: 'Concluído',
			color: '#10b981',
			icon: 'check-circle',
			visible: true,
			rules: { maxCards: 100, allowPriorities: ['low', 'medium', 'high', 'urgent'], blockIfFull: false, autoAssignOwner: false },
		},
	],
	general: {
		enableWipLimits: true,
		showProgressBars: true,
		enableDragDrop: true,
		autoSave: true,
		refreshInterval: 30,
	},
	notifications: {
		onLimitReached: true,
		onCardMoved: false,
		onCardCompleted: true,
	},
}

// Opções de cores
const COLOR_OPTIONS = [
	{ value: '#6b7280', label: 'Cinza', preview: '#6b7280' },
	{ value: '#3b82f6', label: 'Azul', preview: '#3b82f6' },
	{ value: '#ef4444', label: 'Vermelho', preview: '#ef4444' },
	{ value: '#f59e0b', label: 'Amarelo', preview: '#f59e0b' },
	{ value: '#10b981', label: 'Verde', preview: '#10b981' },
	{ value: '#8b5cf6', label: 'Roxo', preview: '#8b5cf6' },
	{ value: '#f97316', label: 'Laranja', preview: '#f97316' },
	{ value: '#06b6d4', label: 'Ciano', preview: '#06b6d4' },
	{ value: '#84cc16', label: 'Lima', preview: '#84cc16' },
	{ value: '#ec4899', label: 'Rosa', preview: '#ec4899' },
]

// Opções de ícones
const ICON_OPTIONS = [
	{ value: 'circle', label: 'Círculo' },
	{ value: 'play-circle', label: 'Play' },
	{ value: 'x-circle', label: 'X' },
	{ value: 'eye', label: 'Olho' },
	{ value: 'check-circle', label: 'Check' },
	{ value: 'clock', label: 'Relógio' },
	{ value: 'flag', label: 'Bandeira' },
	{ value: 'star', label: 'Estrela' },
	{ value: 'heart', label: 'Coração' },
	{ value: 'zap', label: 'Raio' },
]

// Opções de prioridades
const PRIORITY_OPTIONS = [
	{ value: 'low', label: 'Baixa' },
	{ value: 'medium', label: 'Média' },
	{ value: 'high', label: 'Alta' },
	{ value: 'urgent', label: 'Urgente' },
]

export default function KanbanConfigOffcanvas({ isOpen, onClose, initialConfig, onSave }: KanbanConfigOffcanvasProps) {
	const [config, setConfig] = useState<KanbanConfig>(DEFAULT_CONFIG)
	const [activeTab, setActiveTab] = useState<'columns' | 'general' | 'notifications'>('columns')
	const [loading, setLoading] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)

	// Inicializar configuração
	useEffect(() => {
		if (isOpen) {
			setConfig(initialConfig || DEFAULT_CONFIG)
			setHasChanges(false)
			console.log('🔵 Abrindo configurações do Kanban')
		}
	}, [isOpen, initialConfig])

	// Detectar mudanças
	useEffect(() => {
		const hasChanges = JSON.stringify(config) !== JSON.stringify(initialConfig || DEFAULT_CONFIG)
		setHasChanges(hasChanges)
	}, [config, initialConfig])

	// Atualizar coluna específica
	const updateColumn = (columnId: string, updates: Partial<KanbanColumnConfig>) => {
		setConfig((prev) => ({
			...prev,
			columns: prev.columns.map((col) => (col.id === columnId ? { ...col, ...updates } : col)),
		}))
	}

	// Atualizar regra de coluna
	const updateColumnRule = (columnId: string, rule: string, value: number | string[] | boolean | null) => {
		setConfig((prev) => ({
			...prev,
			columns: prev.columns.map((col) => (col.id === columnId ? { ...col, rules: { ...col.rules, [rule]: value } } : col)),
		}))
	}

	// Atualizar configuração geral
	const updateGeneral = (key: string, value: boolean | number) => {
		setConfig((prev) => ({
			...prev,
			general: { ...prev.general, [key]: value },
		}))
	}

	// Atualizar notificações
	const updateNotification = (key: string, value: boolean) => {
		setConfig((prev) => ({
			...prev,
			notifications: { ...prev.notifications, [key]: value },
		}))
	}

	// Resetar para padrão
	const handleReset = () => {
		setConfig(DEFAULT_CONFIG)
		toast({
			type: 'info',
			title: 'Configurações resetadas',
			description: 'Todas as configurações foram restauradas para o padrão',
		})
	}

	// Salvar configurações
	const handleSave = async () => {
		try {
			setLoading(true)
			console.log('🔵 Salvando configurações do Kanban:', config)

			// Simular API call
			await new Promise((resolve) => setTimeout(resolve, 800))

			onSave(config)
			setHasChanges(false)
			console.log('✅ Configurações do Kanban salvas com sucesso')

			toast({
				type: 'success',
				title: 'Configurações salvas',
				description: 'As configurações do Kanban foram aplicadas com sucesso',
			})

			onClose()
		} catch (error) {
			console.error('❌ Erro ao salvar configurações:', error)
			toast({
				type: 'error',
				title: 'Erro ao salvar',
				description: 'Não foi possível salvar as configurações. Tente novamente.',
			})
		} finally {
			setLoading(false)
		}
	}

	// Fechar com verificação de mudanças
	const handleClose = () => {
		if (hasChanges) {
			const confirmClose = window.confirm('Você tem alterações não salvas. Deseja descartar as mudanças?')
			if (!confirmClose) return
		}
		onClose()
	}

	return (
		<Offcanvas open={isOpen} onClose={handleClose} title='Configurações do Kanban' width='lg'>
			<div className='flex flex-col h-full'>
				{/* Navegação por abas */}
				<div className='flex border-b border-zinc-200 dark:border-zinc-700 mb-6'>
					<button onClick={() => setActiveTab('columns')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'columns' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
						<span className='icon-[lucide--columns] size-4 mr-2' />
						Colunas
					</button>
					<button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
						<span className='icon-[lucide--settings] size-4 mr-2' />
						Geral
					</button>
					<button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notifications' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
						<span className='icon-[lucide--bell] size-4 mr-2' />
						Notificações
					</button>
				</div>

				{/* Conteúdo das abas */}
				<div className='flex-1 overflow-y-auto'>
					{/* Aba Colunas */}
					{activeTab === 'columns' && (
						<div className='space-y-6'>
							<div className='flex items-center justify-between'>
								<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>Configuração das Colunas</h3>
								<p className='text-sm text-zinc-500 dark:text-zinc-400'>Configure aparência e regras WIP</p>
							</div>

							{config.columns.map((column) => (
								<div key={column.id} className='bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 space-y-4'>
									{/* Header da coluna */}
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<div className='size-8 rounded-lg flex items-center justify-center' style={{ backgroundColor: `${column.color}20` }}>
												<span className={`icon-[lucide--${column.icon}] size-5`} style={{ color: column.color }} />
											</div>
											<h4 className='font-medium text-zinc-900 dark:text-zinc-100'>{column.title}</h4>
										</div>

										<Switch id={`visible-${column.id}`} name={`visible-${column.id}`} checked={column.visible} onChange={(checked) => updateColumn(column.id, { visible: checked })} title='Visível' />
									</div>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{/* Aparência */}
										<div className='space-y-3'>
											<Label>Título da Coluna</Label>
											<Input type='text' value={column.title} setValue={(title) => updateColumn(column.id, { title })} placeholder='Nome da coluna' />

											<Label>Cor</Label>
											<div className='grid grid-cols-5 gap-2'>
												{COLOR_OPTIONS.map((colorOption) => (
													<button key={colorOption.value} onClick={() => updateColumn(column.id, { color: colorOption.value })} className={`size-8 rounded-lg border-2 transition-all ${column.color === colorOption.value ? 'border-zinc-900 dark:border-zinc-100 scale-110' : 'border-zinc-300 dark:border-zinc-600 hover:scale-105'}`} style={{ backgroundColor: colorOption.preview }} title={colorOption.label} />
												))}
											</div>

											<Label>Ícone</Label>
											<Select name={`icon-${column.id}`} selected={column.icon} onChange={(icon) => updateColumn(column.id, { icon })} options={ICON_OPTIONS} placeholder='Escolha um ícone' />
										</div>

										{/* Regras WIP */}
										<div className='space-y-3'>
											<Label>Limite WIP (Work In Progress)</Label>
											<Input type='text' value={column.rules.maxCards?.toString() || ''} setValue={(value) => updateColumnRule(column.id, 'maxCards', value ? parseInt(value) : null)} placeholder='Limite de atividades (0 = ilimitado)' />

											<div className='space-y-3'>
												<Switch id={`blockIfFull-${column.id}`} name={`blockIfFull-${column.id}`} checked={column.rules.blockIfFull} onChange={(checked) => updateColumnRule(column.id, 'blockIfFull', checked)} title='Bloquear quando atingir limite' />

												<Switch id={`autoAssign-${column.id}`} name={`autoAssign-${column.id}`} checked={column.rules.autoAssignOwner} onChange={(checked) => updateColumnRule(column.id, 'autoAssignOwner', checked)} title='Auto-atribuir responsável' />
											</div>

											<Label>Prioridades Permitidas</Label>
											<div className='space-y-2'>
												{PRIORITY_OPTIONS.map((priority) => (
													<div key={priority.value} className='flex items-center gap-2'>
														<input
															type='checkbox'
															id={`${column.id}-${priority.value}`}
															checked={column.rules.allowPriorities.includes(priority.value)}
															onChange={(e) => {
																const priorities = e.target.checked ? [...column.rules.allowPriorities, priority.value] : column.rules.allowPriorities.filter((p) => p !== priority.value)
																updateColumnRule(column.id, 'allowPriorities', priorities)
															}}
															className='rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500'
														/>
														<label htmlFor={`${column.id}-${priority.value}`} className='text-sm text-zinc-700 dark:text-zinc-300'>
															{priority.label}
														</label>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Aba Geral */}
					{activeTab === 'general' && (
						<div className='space-y-6'>
							<div>
								<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1'>Configurações Gerais</h3>
								<p className='text-sm text-zinc-500 dark:text-zinc-400'>Configure o comportamento geral do Kanban</p>
							</div>

							<div className='bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 space-y-4'>
								{/* Funcionalidades */}
								<div className='space-y-4'>
									<h4 className='font-medium text-zinc-900 dark:text-zinc-100'>Funcionalidades</h4>

									<Switch id='enableWipLimits' name='enableWipLimits' checked={config.general.enableWipLimits} onChange={(checked) => updateGeneral('enableWipLimits', checked)} title='Habilitar limites WIP' description='Controla o número máximo de atividades por coluna' />

									<Switch id='showProgressBars' name='showProgressBars' checked={config.general.showProgressBars} onChange={(checked) => updateGeneral('showProgressBars', checked)} title='Mostrar barras de progresso' description='Exibe progresso visual nos cards das atividades' />

									<Switch id='enableDragDrop' name='enableDragDrop' checked={config.general.enableDragDrop} onChange={(checked) => updateGeneral('enableDragDrop', checked)} title='Habilitar arrastar e soltar' description='Permite mover atividades entre colunas arrastando' />

									<Switch id='autoSave' name='autoSave' checked={config.general.autoSave} onChange={(checked) => updateGeneral('autoSave', checked)} title='Salvamento automático' description='Salva alterações automaticamente' />
								</div>

								{/* Performance */}
								<div className='space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700'>
									<h4 className='font-medium text-zinc-900 dark:text-zinc-100'>Performance</h4>

									<div>
										<Label>Intervalo de atualização (segundos)</Label>
										<Input type='text' value={config.general.refreshInterval.toString()} setValue={(value) => updateGeneral('refreshInterval', parseInt(value) || 30)} placeholder='30' />
										<p className='text-xs text-zinc-500 dark:text-zinc-400 mt-1'>Frequência de sincronização com o servidor (10-300 segundos)</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Aba Notificações */}
					{activeTab === 'notifications' && (
						<div className='space-y-6'>
							<div>
								<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1'>Notificações</h3>
								<p className='text-sm text-zinc-500 dark:text-zinc-400'>Configure quando receber alertas</p>
							</div>

							<div className='bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 space-y-4'>
								<Switch id='onLimitReached' name='onLimitReached' checked={config.notifications.onLimitReached} onChange={(checked) => updateNotification('onLimitReached', checked)} title='Limite WIP atingido' description='Notifica quando uma coluna atinge o limite máximo' />

								<Switch id='onCardMoved' name='onCardMoved' checked={config.notifications.onCardMoved} onChange={(checked) => updateNotification('onCardMoved', checked)} title='Atividade movida' description='Notifica quando atividades são movidas entre colunas' />

								<Switch id='onCardCompleted' name='onCardCompleted' checked={config.notifications.onCardCompleted} onChange={(checked) => updateNotification('onCardCompleted', checked)} title='Atividade concluída' description='Notifica quando atividades são marcadas como concluídas' />
							</div>
						</div>
					)}
				</div>

				{/* Footer com ações */}
				<div className='border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-6'>
					<div className='flex items-center justify-between'>
						<Button onClick={handleReset} style='bordered' className='flex items-center gap-2'>
							<span className='icon-[lucide--rotate-ccw] size-4' />
							Resetar
						</Button>

						<div className='flex items-center gap-2'>
							{hasChanges && <span className='text-xs text-amber-600 dark:text-amber-400 mr-2'>• Alterações não salvas</span>}

							<Button onClick={handleClose} style='bordered' disabled={loading}>
								Cancelar
							</Button>

							<Button onClick={handleSave} disabled={loading} className='flex items-center gap-2'>
								{loading ? (
									<>
										<span className='icon-[lucide--loader-circle] size-4 animate-spin' />
										Salvando...
									</>
								) : (
									<>
										<span className='icon-[lucide--save] size-4' />
										Salvar
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Offcanvas>
	)
}
