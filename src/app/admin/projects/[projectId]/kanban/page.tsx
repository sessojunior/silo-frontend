'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'

import KanbanBoard from '@/components/admin/projects/KanbanBoard'
import ActivityFormOffcanvas from '@/components/admin/projects/ActivityFormOffcanvas'
import KanbanConfigOffcanvas from '@/components/admin/projects/KanbanConfigOffcanvas'
import Button from '@/components/ui/Button'

import { Project, Activity } from '@/types/projects'

// Interfaces para o sistema Kanban baseado no banco de dados
interface ProjectTask {
	id: string
	projectId: string
	projectActivityId: string
	name: string
	description: string
	category: string | null
	estimatedDays: number | null
	startDate: string | null
	endDate: string | null
	priority: 'low' | 'medium' | 'high' | 'urgent'
	status?: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	createdAt: Date
	updatedAt: Date
	activityName?: string
}

interface KanbanCard {
	projectTaskId: string
	status: 'default' | 'done'
	order: number
}

interface KanbanColumn {
	type: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	order: number
	cards: KanbanCard[]
}

interface KanbanConfigColumn {
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

interface TaskFormData {
	name: string
	description: string
	projectActivityId: string
	category: string
	estimatedDays?: string
	startDate: string
	endDate: string
	priority: ProjectTask['priority']
}

// Interface para configuração do Kanban
interface KanbanConfig {
	columns: KanbanConfigColumn[]
}

export default function ProjectKanbanPage() {
	const params = useParams()
	const projectId = params.id as string

	// Estados principais
	const [project, setProject] = useState<Project | null>(null)
	const [tasks, setTasks] = useState<ProjectTask[]>([])
	const [activities, setActivities] = useState<Activity[]>([])
	const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([])
	const [kanbanConfig, setKanbanConfig] = useState<KanbanConfigColumn[]>([])

	const [loading, setLoading] = useState(true)

	// Estados dos offcanvas
	const [taskFormOpen, setTaskFormOpen] = useState(false)
	const [kanbanConfigOpen, setKanbanConfigOpen] = useState(false)
	const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)

	// Carregar dados iniciais
	useEffect(() => {
		if (projectId) {
			loadAllData()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId])

	// Função para carregar todos os dados
	async function loadAllData() {
		try {
			setLoading(true)
			console.log('🔵 Carregando dados do Kanban para projeto:', projectId)

			// Carregar projeto
			const projectResponse = await fetch(`/api/admin/projects?id=${projectId}`)
			if (!projectResponse.ok) {
				console.error('❌ Projeto não encontrado:', projectId)
				notFound()
				return
			}

			const projectsData = await projectResponse.json()
			const projectData = projectsData.find((p: { id: string }) => p.id === projectId)

			if (!projectData) {
				console.error('❌ Projeto não encontrado nos dados:', projectId)
				notFound()
				return
			}

			// Converter projeto para formato da interface
			const formattedProject: Project = {
				id: projectData.id,
				name: projectData.name,
				shortDescription: projectData.shortDescription,
				description: projectData.description,
				status: projectData.status,
				priority: projectData.priority,
				startDate: projectData.startDate,
				endDate: projectData.endDate,
				icon: 'folder',
				color: '#3b82f6',
				progress: 0,
				members: [],
				activities: [],
				createdAt: new Date(projectData.createdAt).toISOString(),
				updatedAt: new Date(projectData.updatedAt).toISOString(),
			}

			setProject(formattedProject)

			// Carregar atividades do projeto
			const activitiesResponse = await fetch(`/api/projects/${projectId}/activities`)
			let activitiesData = []

			if (activitiesResponse.ok) {
				const activitiesResult = await activitiesResponse.json()
				if (activitiesResult.success) {
					activitiesData = activitiesResult.activities
				}
			}

			// Converter atividades para formato da interface
			const formattedActivities: Activity[] = activitiesData.map((activity: { id: string; projectId: string; name: string; description: string; status: 'todo' | 'progress' | 'done' | 'blocked'; priority: 'low' | 'medium' | 'high' | 'urgent'; category: string | null; startDate: string | null; endDate: string | null; estimatedDays: number | null; createdAt: Date; updatedAt: Date }) => ({
				id: activity.id,
				projectId: activity.projectId,
				name: activity.name,
				description: activity.description,
				status: convertActivityStatusFromDB(activity.status),
				priority: activity.priority,
				progress: 0,
				category: activity.category || '',
				startDate: activity.startDate || '',
				endDate: activity.endDate || '',
				estimatedHours: activity.estimatedDays || 0,
				actualHours: 0,
				assignees: [],
				labels: [],
				createdAt: new Date(activity.createdAt).toISOString(),
				updatedAt: new Date(activity.updatedAt).toISOString(),
			}))

			setActivities(formattedActivities)

			// Carregar dados do Kanban (tarefas, configuração e colunas)
			const kanbanResponse = await fetch(`/api/projects/${projectId}/kanban`)
			if (kanbanResponse.ok) {
				const kanbanData = await kanbanResponse.json()
				if (kanbanData.success) {
					console.log('🔵 Dados do Kanban recebidos:', {
						tasks: kanbanData.tasks?.length || 0,
						columns: kanbanData.columns?.length || 0,
						config: kanbanData.config?.length || 0,
					})
					console.log('🔵 Tasks completas:', kanbanData.tasks)
					console.log('🔵 Estrutura das colunas:', kanbanData.columns)
					console.log('🔵 Config do Kanban:', kanbanData.config)

					setTasks(kanbanData.tasks || [])
					setKanbanColumns(kanbanData.columns || [])
					setKanbanConfig(kanbanData.config || [])
				} else {
					console.error('❌ Erro na resposta do Kanban:', kanbanData.error)
				}
			} else {
				console.error('❌ Erro na requisição do Kanban:', kanbanResponse.status)
			}

			console.log('✅ Dados do Kanban carregados com sucesso')
		} catch (error) {
			console.error('❌ Erro ao carregar dados do Kanban:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao carregar dados do Kanban',
			})
		} finally {
			setLoading(false)
		}
	}

	// Função para converter status de atividade do banco
	function convertActivityStatusFromDB(dbStatus: 'todo' | 'progress' | 'done' | 'blocked'): Activity['status'] {
		const statusMapping: Record<'todo' | 'progress' | 'done' | 'blocked', Activity['status']> = {
			todo: 'todo',
			progress: 'in_progress',
			done: 'done',
			blocked: 'blocked',
		}
		return statusMapping[dbStatus] || 'todo'
	}

	// Função para mover tarefa entre colunas
	const handleTaskMove = async (taskId: string, fromColumnType: string, toColumnType: string, newOrder: number, cardStatus: 'default' | 'done') => {
		try {
			console.log('🔵 Movendo tarefa:', { taskId, fromColumnType, toColumnType, newOrder, cardStatus })

			// Verificar regras de negócio
			const targetConfig = kanbanConfig.find((config) => config.type === toColumnType)
			if (targetConfig) {
				// Verificar se a coluna está visível
				if (!targetConfig.isVisible) {
					toast({
						type: 'error',
						title: 'Coluna oculta',
						description: 'Não é possível mover para uma coluna oculta',
					})
					return
				}

				// Verificar limite WIP
				const targetColumn = kanbanColumns.find((col) => col.type === toColumnType)
				if (targetColumn && targetConfig.limitWip > 0) {
					const currentCardsCount = targetColumn.cards.length
					const wouldExceedLimit = currentCardsCount >= targetConfig.limitWip && fromColumnType !== toColumnType

					if (wouldExceedLimit && targetConfig.blockWipReached) {
						toast({
							type: 'error',
							title: 'Limite WIP atingido',
							description: `Limite de tarefas em andamento atingido para a coluna "${targetConfig.name}" (${targetConfig.limitWip} tarefas)`,
						})
						return
					}
				}
			}

			// Atualizar estado local otimisticamente
			const updatedColumns = kanbanColumns.map((column) => {
				if (column.type === fromColumnType) {
					// Remover tarefa da coluna origem
					return {
						...column,
						cards: column.cards.filter((card) => card.projectTaskId !== taskId),
					}
				} else if (column.type === toColumnType) {
					// Adicionar tarefa na coluna destino
					const newCard: KanbanCard = {
						projectTaskId: taskId,
						status: cardStatus,
						order: newOrder,
					}

					// Reordenar cards
					const otherCards = column.cards.filter((card) => card.projectTaskId !== taskId)
					const sortedCards = [...otherCards, newCard].sort((a, b) => a.order - b.order)

					return {
						...column,
						cards: sortedCards,
					}
				}
				return column
			})

			setKanbanColumns(updatedColumns)

			// Salvar no banco de dados
			const saveResponse = await fetch(`/api/projects/${projectId}/kanban`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					type: 'columns',
					columns: updatedColumns,
				}),
			})

			if (!saveResponse.ok) {
				throw new Error('Erro ao salvar movimentação')
			}

			console.log('✅ Tarefa movida com sucesso')

			toast({
				type: 'success',
				title: 'Sucesso',
				description: 'Tarefa movida com sucesso',
			})
		} catch (error) {
			console.error('❌ Erro ao mover tarefa:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao mover tarefa',
			})

			// Recarregar dados em caso de erro
			loadAllData()
		}
	}

	// Função para criar nova tarefa
	function handleCreateTask() {
		setEditingTask(null)
		setTaskFormOpen(true)
	}

	// Função para editar tarefa
	function handleEditTask(task: ProjectTask) {
		setEditingTask(task)
		setTaskFormOpen(true)
	}

	// Função para configurar Kanban
	function handleConfigureKanban() {
		setKanbanConfigOpen(true)
	}

	// Função para excluir tarefa
	async function handleDeleteTask(taskId: string) {
		try {
			console.log('🔵 Excluindo tarefa:', taskId)

			const response = await fetch(`/api/projects/${projectId}/tasks?taskId=${taskId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Erro ao excluir tarefa')
			}

			// Remover tarefa das colunas do Kanban
			const updatedColumns = kanbanColumns.map((column) => ({
				...column,
				cards: column.cards.filter((card) => card.projectTaskId !== taskId),
			}))

			setKanbanColumns(updatedColumns)

			// Salvar colunas atualizadas
			await fetch(`/api/projects/${projectId}/kanban`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					type: 'columns',
					columns: updatedColumns,
				}),
			})

			// Recarregar tarefas
			await loadAllData()

			console.log('✅ Tarefa excluída com sucesso')
			toast({
				type: 'success',
				title: 'Sucesso',
				description: 'Tarefa excluída com sucesso',
			})
		} catch (error) {
			console.error('❌ Erro ao excluir tarefa:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: error instanceof Error ? error.message : 'Erro ao excluir tarefa',
			})
		}
	}

	// Função para submeter formulário de tarefa
	async function handleTaskSubmit(taskData: TaskFormData) {
		try {
			console.log('🔵 Salvando tarefa:', taskData)

			const url = editingTask ? `/api/projects/${projectId}/tasks` : `/api/projects/${projectId}/tasks`

			const method = editingTask ? 'PUT' : 'POST'

			const payload = editingTask ? { ...taskData, id: editingTask.id } : taskData

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Erro ao salvar tarefa')
			}

			const result = await response.json()

			// Recarregar dados
			await loadAllData()

			console.log('✅ Tarefa salva com sucesso:', result.task?.id || result.task?.id)
			toast({
				type: 'success',
				title: 'Sucesso',
				description: editingTask ? 'Tarefa atualizada com sucesso' : 'Tarefa criada com sucesso',
			})

			closeTaskForm()
		} catch (error) {
			console.error('❌ Erro ao salvar tarefa:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: error instanceof Error ? error.message : 'Erro ao salvar tarefa',
			})
		}
	}

	// Função para fechar formulário de tarefa
	function closeTaskForm() {
		setTaskFormOpen(false)
		setEditingTask(null)
	}

	// Função para fechar configuração do Kanban
	function closeKanbanConfig() {
		setKanbanConfigOpen(false)
	}

	// Função para salvar configuração do Kanban
	async function handleKanbanConfigSave(config: KanbanConfig) {
		try {
			console.log('🔵 Salvando configuração do Kanban:', config)

			// Verificar regra de negócio: não pode ocultar coluna que possui cards
			const configColumns = config.columns

			for (const configCol of configColumns) {
				if (!configCol.isVisible) {
					const column = kanbanColumns.find((col) => col.type === configCol.type)
					if (column && column.cards.length > 0) {
						toast({
							type: 'error',
							title: 'Validação de coluna',
							description: `Não é possível ocultar a coluna "${configCol.name}" pois ela possui ${column.cards.length} tarefa(s)`,
						})
						return
					}
				}
			}

			const response = await fetch(`/api/projects/${projectId}/kanban`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					type: 'config',
					config: configColumns,
				}),
			})

			if (!response.ok) {
				throw new Error('Erro ao salvar configuração')
			}

			// Atualizar estado local
			setKanbanConfig(configColumns)

			console.log('✅ Configuração do Kanban salva com sucesso')
			toast({
				type: 'success',
				title: 'Sucesso',
				description: 'Configuração do Kanban salva com sucesso',
			})

			closeKanbanConfig()
		} catch (error) {
			console.error('❌ Erro ao salvar configuração do Kanban:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao salvar configuração do Kanban',
			})
		}
	}

	// Converter tarefas para formato de atividades para compatibilidade com componentes existentes
	const activitiesFromTasks = useMemo((): Activity[] => {
		console.log('🔵 ========== CONVERSÃO DE TASKS ==========')
		console.log('🔵 Total de tarefas disponíveis:', tasks.length)
		console.log('🔵 Total de colunas kanban:', kanbanColumns.length)
		console.log(
			'🔵 Tasks recebidas:',
			tasks.map((t) => ({ id: t.id, name: t.name, status: t.status })),
		)
		console.log(
			'🔵 Colunas recebidas:',
			kanbanColumns.map((c) => ({ type: c.type, cards: c.cards.length })),
		)

		// Se não temos tarefas, retornar array vazio
		if (tasks.length === 0) {
			console.log('⚠️ Nenhuma tarefa encontrada - retornando array vazio')
			return []
		}

		const activities = tasks.map((task, index): Activity => {
			console.log(`🔵 ---------- PROCESSANDO TASK ${index + 1}/${tasks.length} ----------`)
			console.log(`🔵 Task ID: ${task.id}`)
			console.log(`🔵 Task Name: ${task.name}`)
			console.log(`🔵 Task Status no banco: ${task.status}`)

			// Buscar em qual coluna a tarefa está posicionada
			let taskStatus: Activity['status'] = 'todo' // Status padrão
			let foundInKanban = false

			// Verificar em todas as colunas do kanban apenas se temos dados
			if (kanbanColumns.length > 0) {
				console.log(`🔵 Buscando task ${task.id} nas colunas do kanban...`)
				for (const column of kanbanColumns) {
					if (column.cards && Array.isArray(column.cards)) {
						console.log(`  🔍 Verificando coluna ${column.type} com ${column.cards.length} cards`)
						const taskCard = column.cards.find((card) => card.projectTaskId === task.id)
						if (taskCard) {
							foundInKanban = true
							console.log(`  ✅ Task encontrada na coluna ${column.type}!`)
							// Mapear tipo de coluna para status de activity
							switch (column.type) {
								case 'todo':
									taskStatus = taskCard.status === 'done' ? 'todo_done' : 'todo'
									break
								case 'in_progress':
									taskStatus = taskCard.status === 'done' ? 'in_progress_done' : 'in_progress'
									break
								case 'blocked':
									taskStatus = 'blocked'
									break
								case 'review':
									taskStatus = taskCard.status === 'done' ? 'review_done' : 'review'
									break
								case 'done':
									taskStatus = 'done'
									break
								default:
									taskStatus = 'todo'
							}
							break
						} else {
							console.log(`  ❌ Task não encontrada na coluna ${column.type}`)
						}
					}
				}
			} else {
				console.log('⚠️ Nenhuma coluna kanban disponível')
			}

			// Se não encontrou no kanban, usar status da tabela project_task
			if (!foundInKanban && task.status) {
				console.log(`🔍 Task não encontrada no kanban, usando status do banco: ${task.status}`)
				// ⚠️ CORREÇÃO CRÍTICA: Mapear status correto do banco para activity status
				switch (
					task.status as string // ⚠️ Cast para string para evitar erro de tipo
				) {
					case 'todo':
						taskStatus = 'todo'
						break
					case 'progress': // ⚠️ No banco é 'progress', não 'in_progress'
						taskStatus = 'in_progress'
						break
					case 'blocked':
						taskStatus = 'blocked'
						break
					case 'done':
						taskStatus = 'done'
						break
					default:
						taskStatus = 'todo'
				}
			}

			console.log(`🎯 RESULTADO: Task "${task.name}" -> Status DB: ${task.status} -> Status Activity: ${taskStatus} (encontrada no kanban: ${foundInKanban})`)

			return {
				id: task.id,
				projectId: task.projectId,
				name: task.name,
				description: task.description,
				status: taskStatus,
				priority: task.priority,
				progress: 0,
				category: task.category || '',
				startDate: task.startDate || '',
				endDate: task.endDate || '',
				estimatedHours: task.estimatedDays || 0,
				actualHours: 0,
				assignees: [],
				labels: [],
				createdAt: new Date(task.createdAt).toISOString(),
				updatedAt: new Date(task.updatedAt).toISOString(),
			}
		})

		console.log('🔵 ========== RESULTADO FINAL ==========')
		console.log(`🔵 Total de activities criadas: ${activities.length}`)
		console.log(
			'🔵 Activities por status:',
			activities.reduce(
				(acc, act) => {
					acc[act.status] = (acc[act.status] || 0) + 1
					return acc
				},
				{} as Record<string, number>,
			),
		)
		console.log('🔵 ======================================')

		return activities
	}, [tasks, kanbanColumns])

	if (loading) {
		return (
			<div className='w-full h-full p-6 flex items-center justify-center'>
				<div className='flex items-center justify-center gap-2'>
					<div className='animate-spin rounded-full size-8 border-b-2 border-blue-600 dark:border-blue-400'></div>
					<p className='text-zinc-600 dark:text-zinc-400'>Carregando Kanban...</p>
				</div>
			</div>
		)
	}

	if (!project) {
		return notFound()
	}

	return (
		<div className='w-full h-full flex flex-col'>
			{/* Header */}
			<div className='w-full p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex-shrink-0'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold text-zinc-900 dark:text-white'>Kanban - {project.name}</h1>
						<p className='text-zinc-600 dark:text-zinc-400 mt-1'>Gerencie as tarefas do projeto usando o quadro Kanban</p>
					</div>
					<div className='flex items-center gap-3'>
						<Button
							style='bordered'
							onClick={async () => {
								try {
									console.log('🔧 Resetando dados do kanban...')
									const response = await fetch(`/api/projects/${projectId}/kanban/reset`, {
										method: 'POST',
									})

									if (response.ok) {
										console.log('✅ Reset concluído, recarregando dados...')
										toast({
											type: 'success',
											title: 'Reset concluído',
											description: 'Dados do kanban resetados. Recarregando...',
										})
										await loadAllData()
									} else {
										throw new Error('Erro no reset')
									}
								} catch (error) {
									console.error('❌ Erro no reset:', error)
									toast({
										type: 'error',
										title: 'Erro no reset',
										description: 'Erro ao resetar dados do kanban',
									})
								}
							}}
							className='text-orange-600 dark:text-orange-400 px-3 py-2 text-sm'
						>
							<i className='icon-[lucide--refresh-cw] mr-2 h-4 w-4' />
							Reset Kanban
						</Button>
						<Button style='bordered' onClick={handleConfigureKanban} className='text-zinc-600 dark:text-zinc-400 px-3 py-2 text-sm'>
							<i className='icon-[lucide--settings] mr-2 h-4 w-4' />
							Configurar
						</Button>
						<Button style='filled' onClick={handleCreateTask} className='px-3 py-2 text-sm'>
							<i className='icon-[lucide--plus] mr-2 h-4 w-4' />
							Nova Tarefa
						</Button>
					</div>
				</div>
			</div>

			{/* Conteúdo do Kanban com scroll horizontal */}
			<div className='p-6 overflow-x-auto flex-1'>
				<div className='min-w-max flex-1'>
					<KanbanBoard
						activities={activitiesFromTasks}
						project={project}
						onActivityMove={(activityId, fromStatus, toStatus) => {
							// Converter status de volta para tipo de coluna
							const columnTypeMap: Record<Activity['status'], string> = {
								todo: 'todo',
								todo_doing: 'todo',
								todo_done: 'todo',
								in_progress: 'in_progress',
								in_progress_doing: 'in_progress',
								in_progress_done: 'in_progress',
								review: 'review',
								review_doing: 'review',
								review_done: 'review',
								done: 'done',
								blocked: 'blocked',
							}
							const fromColumnType = columnTypeMap[fromStatus] || 'todo'
							const toColumnType = columnTypeMap[toStatus] || 'todo'
							handleTaskMove(activityId, fromColumnType, toColumnType, 0, 'default')
						}}
						onCreateActivity={handleCreateTask}
						onEditActivity={(activity) => {
							const task = tasks.find((t) => t.id === activity.id)
							if (task) handleEditTask(task)
						}}
						onDeleteActivity={handleDeleteTask}
						onConfigureKanban={handleConfigureKanban}
					/>
				</div>
			</div>

			{/* Offcanvas para formulário de tarefa */}
			<ActivityFormOffcanvas
				isOpen={taskFormOpen}
				onClose={closeTaskForm}
				project={project}
				activity={
					editingTask
						? {
								id: editingTask.id,
								projectId: editingTask.projectId,
								name: editingTask.name,
								description: editingTask.description,
								status: 'todo',
								priority: editingTask.priority,
								progress: 0,
								category: editingTask.category || '',
								startDate: editingTask.startDate || '',
								endDate: editingTask.endDate || '',
								estimatedHours: editingTask.estimatedDays || 0,
								actualHours: 0,
								assignees: [],
								labels: [],
								createdAt: new Date(editingTask.createdAt).toISOString(),
								updatedAt: new Date(editingTask.updatedAt).toISOString(),
							}
						: undefined
				}
				onSubmit={async (activityData) => {
					// Converter ActivityFormData para TaskFormData
					const taskData: TaskFormData = {
						name: activityData.name,
						description: activityData.description,
						projectActivityId: activities.length > 0 ? activities[0].id : '', // Usar primeira atividade ou criar uma default
						category: activityData.category,
						estimatedDays: activityData.days || '',
						startDate: activityData.startDate,
						endDate: activityData.endDate,
						priority: activityData.priority,
					}
					await handleTaskSubmit(taskData)
				}}
			/>

			{/* Offcanvas para configuração do Kanban */}
			<KanbanConfigOffcanvas isOpen={kanbanConfigOpen} onClose={closeKanbanConfig} currentConfig={kanbanConfig} onSave={handleKanbanConfigSave} />
		</div>
	)
}
