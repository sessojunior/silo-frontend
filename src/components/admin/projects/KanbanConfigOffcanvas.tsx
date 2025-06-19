'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'

import Offcanvas from '@/components/ui/Offcanvas'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import Label from '@/components/ui/Label'

// Interface para configuração de coluna do Kanban
export interface KanbanColumnConfig {
	isVisible: boolean
	order: number
	type: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	statusAvailable: string[]
	name: string
	color: string
	icon: string
	limitWip: number
	blockWipReached: boolean
}

// Interface para configuração completa do Kanban
export interface KanbanConfig {
	columns: KanbanColumnConfig[]
}

interface KanbanConfigOffcanvasProps {
	isOpen: boolean
	onClose: () => void
	currentConfig: KanbanColumnConfig[]
	onSave: (config: KanbanConfig) => void
}

// Configuração padrão das colunas
const DEFAULT_COLUMNS: KanbanColumnConfig[] = [
	{
		isVisible: true,
		order: 0,
		type: 'todo',
		statusAvailable: ['default'],
		name: 'A Fazer',
		color: 'blue',
		icon: 'circle',
		limitWip: 20,
		blockWipReached: false,
	},
	{
		isVisible: true,
		order: 1,
		type: 'in_progress',
		statusAvailable: ['default'],
		name: 'Em Progresso',
		color: 'yellow',
		icon: 'play-circle',
		limitWip: 5,
		blockWipReached: true,
	},
	{
		isVisible: true,
		order: 2,
		type: 'blocked',
		statusAvailable: ['default'],
		name: 'Bloqueado',
		color: 'red',
		icon: 'alert-circle',
		limitWip: 10,
		blockWipReached: false,
	},
	{
		isVisible: true,
		order: 3,
		type: 'review',
		statusAvailable: ['default'],
		name: 'Em Revisão',
		color: 'orange',
		icon: 'eye',
		limitWip: 3,
		blockWipReached: true,
	},
	{
		isVisible: true,
		order: 4,
		type: 'done',
		statusAvailable: ['default', 'done'],
		name: 'Concluído',
		color: 'green',
		icon: 'check-circle',
		limitWip: 100,
		blockWipReached: false,
	},
]

// Opções de cores disponíveis
const COLOR_OPTIONS = [
	{ value: 'blue', label: 'Azul', class: 'bg-blue-500' },
	{ value: 'red', label: 'Vermelho', class: 'bg-red-500' },
	{ value: 'green', label: 'Verde', class: 'bg-green-500' },
	{ value: 'yellow', label: 'Amarelo', class: 'bg-yellow-500' },
	{ value: 'orange', label: 'Laranja', class: 'bg-orange-500' },
	{ value: 'purple', label: 'Roxo', class: 'bg-purple-500' },
	{ value: 'pink', label: 'Rosa', class: 'bg-pink-500' },
	{ value: 'indigo', label: 'Índigo', class: 'bg-indigo-500' },
	{ value: 'gray', label: 'Cinza', class: 'bg-gray-500' },
	{ value: 'slate', label: 'Ardósia', class: 'bg-slate-500' },
]

// Opções de ícones disponíveis
const ICON_OPTIONS = [
	{ value: 'circle', label: 'Círculo' },
	{ value: 'play-circle', label: 'Play' },
	{ value: 'alert-circle', label: 'Alerta' },
	{ value: 'eye', label: 'Olho' },
	{ value: 'check-circle', label: 'Check' },
	{ value: 'clock', label: 'Relógio' },
	{ value: 'flag', label: 'Bandeira' },
	{ value: 'star', label: 'Estrela' },
	{ value: 'heart', label: 'Coração' },
	{ value: 'zap', label: 'Raio' },
]

export default function KanbanConfigOffcanvas({ isOpen, onClose, currentConfig, onSave }: KanbanConfigOffcanvasProps) {
	const [columns, setColumns] = useState<KanbanColumnConfig[]>(DEFAULT_COLUMNS)
	const [saving, setSaving] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)

	// Inicializar dados quando o offcanvas abre
	useEffect(() => {
		if (isOpen) {
			if (currentConfig && currentConfig.length > 0) {
				setColumns(currentConfig)
			} else {
				setColumns(DEFAULT_COLUMNS)
			}
			setHasChanges(false)
			console.log('🔵 Iniciando configurações do Kanban')
		}
	}, [isOpen, currentConfig])

	// Detectar mudanças
	useEffect(() => {
		if (isOpen) {
			const configChanged = JSON.stringify(columns) !== JSON.stringify(currentConfig)
			setHasChanges(configChanged)
		}
	}, [columns, currentConfig, isOpen])

	// Atualizar configuração de uma coluna específica
	const updateColumn = (type: string, field: keyof KanbanColumnConfig, value: string | number | boolean) => {
		setColumns((prev) => prev.map((col) => (col.type === type ? { ...col, [field]: value } : col)))
	}

	// Resetar para configuração padrão
	const handleReset = () => {
		setColumns(DEFAULT_COLUMNS)
		toast({
			type: 'info',
			title: 'Configurações resetadas',
			description: 'Todas as configurações foram restauradas para o padrão',
		})
	}

	// Salvar configurações
	const handleSave = async () => {
		try {
			setSaving(true)
			console.log('🔵 Salvando configurações do Kanban')

			const config: KanbanConfig = {
				columns,
			}

			await onSave(config)

			toast({
				type: 'success',
				title: 'Configurações salvas',
				description: 'As configurações do Kanban foram atualizadas com sucesso',
			})

			setHasChanges(false)
			onClose()
		} catch (error) {
			console.error('❌ Erro ao salvar configurações:', error)
			toast({
				type: 'error',
				title: 'Erro ao salvar',
				description: 'Ocorreu um erro ao salvar as configurações',
			})
		} finally {
			setSaving(false)
		}
	}

	// Fechar com confirmação se houver mudanças
	const handleClose = () => {
		if (hasChanges) {
			if (confirm('Você tem alterações não salvas. Deseja realmente fechar?')) {
				onClose()
			}
		} else {
			onClose()
		}
	}

	return (
		<Offcanvas open={isOpen} onClose={handleClose} title='Configurações do Kanban' width='lg'>
			<div className='space-y-6'>
				{/* Configuração das Colunas */}
				<div>
					<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4'>Configuração das Colunas</h3>

					<div className='space-y-4'>
						{columns.map((column) => (
							<div key={column.type} className='bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4'>
								{/* Cabeçalho da Coluna */}
								<div className='flex items-center justify-between mb-4'>
									<div className='flex items-center gap-3 w-full'>
										<div className={`size-6 rounded-full flex items-center justify-center ${COLOR_OPTIONS.find((c) => c.value === column.color)?.class || 'bg-gray-500'}`}>
											<span className={`icon-[lucide--${column.icon}] size-4 text-white`} />
										</div>
										<h4 className='font-medium text-zinc-900 dark:text-zinc-100'>{column.name}</h4>
									</div>

									<Switch id={`visible-${column.type}`} name={`visible-${column.type}`} checked={column.isVisible} onChange={(checked) => updateColumn(column.type, 'isVisible', checked)} title='' description='' />
								</div>

								{column.isVisible && (
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{/* Nome da Coluna */}
										<div>
											<Label htmlFor={`name-${column.type}`}>Nome</Label>
											<Input type='text' value={column.name} setValue={(value) => updateColumn(column.type, 'name', value)} placeholder='Nome da coluna' />
										</div>

										{/* Limite WIP */}
										<div>
											<Label htmlFor={`wip-${column.type}`}>Limite WIP</Label>
											<Input type='text' value={column.limitWip.toString()} setValue={(value) => updateColumn(column.type, 'limitWip', Number(value) || 1)} placeholder='20' />
										</div>

										{/* Cor */}
										<div>
											<Label htmlFor={`color-${column.type}`}>Cor</Label>
											<Select name={`color-${column.type}`} selected={column.color} onChange={(value) => updateColumn(column.type, 'color', value)} options={COLOR_OPTIONS} placeholder='Selecionar cor' />
										</div>

										{/* Ícone */}
										<div>
											<Label htmlFor={`icon-${column.type}`}>Ícone</Label>
											<Select name={`icon-${column.type}`} selected={column.icon} onChange={(value) => updateColumn(column.type, 'icon', value)} options={ICON_OPTIONS} placeholder='Selecionar ícone' />
										</div>

										{/* Bloquear ao atingir WIP */}
										<div className='md:col-span-2'>
											<Switch id={`block-${column.type}`} name={`block-${column.type}`} checked={column.blockWipReached} onChange={(checked) => updateColumn(column.type, 'blockWipReached', checked)} title='Bloquear quando atingir limite' description='Impedir que novos cards sejam adicionados quando o limite WIP for atingido' />
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Botões de Ação */}
			<div className='flex justify-between pt-6 border-t border-zinc-200 dark:border-zinc-700'>
				{/* Botão Reset (esquerda) */}
				<div>
					<Button type='button' onClick={handleReset} className='bg-zinc-500 hover:bg-zinc-600 text-white' disabled={saving}>
						<span className='icon-[lucide--rotate-ccw] size-4 mr-2' />
						Resetar
					</Button>
				</div>

				{/* Botões Cancelar/Salvar (direita) */}
				<div className='flex gap-3'>
					{hasChanges && <span className='text-xs text-amber-600 dark:text-amber-400 self-center mr-2'>• Alterações não salvas</span>}

					<Button type='button' onClick={handleClose} className='bg-zinc-500 hover:bg-zinc-600 text-white' disabled={saving}>
						Cancelar
					</Button>

					<Button type='button' onClick={handleSave} className='bg-blue-600 hover:bg-blue-700 text-white' disabled={saving}>
						{saving ? (
							<>
								<span className='icon-[lucide--loader-circle] size-4 animate-spin mr-2' />
								Salvando...
							</>
						) : (
							<>
								<span className='icon-[lucide--save] size-4 mr-2' />
								Salvar configurações
							</>
						)}
					</Button>
				</div>
			</div>
		</Offcanvas>
	)
}
