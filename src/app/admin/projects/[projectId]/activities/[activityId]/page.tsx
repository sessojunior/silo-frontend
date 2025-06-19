'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import KanbanBoard from '@/components/admin/projects/KanbanBoard'
import { Activity } from '@/types/projects'

// Interfaces para o sistema Kanban
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
	status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	createdAt: string | Date
	updatedAt: string | Date
	kanbanSubcolumn?: string // Ex: "in_progress_done", "todo_in_progress"
}

// Interface removida - não mais necessária

export default function ActivityKanbanPage() {
	const params = useParams()
	const projectId = params.projectId as string
	const activityId = params.activityId as string

	// Estados principais
	const [project, setProject] = useState<{ id: string; name: string } | null>(null)
	const [activity, setActivity] = useState<{ id: string; name: string } | null>(null)
	const [tasks, setTasks] = useState<ProjectTask[]>([])
	const [loading, setLoading] = useState(true)

	// Carregar dados iniciais
	useEffect(() => {
		if (projectId && activityId) {
			loadAllData()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, activityId])

	// Função para carregar todos os dados
	async function loadAllData() {
		try {
			setLoading(true)

			// Carregar projeto
			const projectResponse = await fetch(`/api/admin/projects?projectId=${projectId}`)
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

			setProject(projectData)

			// Carregar atividade específica
			const activitiesResponse = await fetch(`/api/projects/${projectId}/activities`)
			if (activitiesResponse.ok) {
				const activitiesResult = await activitiesResponse.json()
				if (activitiesResult.success) {
					const foundActivity = activitiesResult.activities.find((a: { id: string }) => a.id === activityId)
					if (!foundActivity) {
						console.error('❌ Atividade não encontrada:', activityId)
						notFound()
						return
					}

					setActivity(foundActivity)
				}
			}

			// Carregar dados do Kanban desta atividade específica
			const kanbanResponse = await fetch(`/api/projects/${projectId}/activities/${activityId}/kanban`)
			if (kanbanResponse.ok) {
				const kanbanData = await kanbanResponse.json()

				if (kanbanData.success) {
					// Extrair tarefas COM informação da subcoluna

					const allTasksWithSubcolumn: Array<ProjectTask & { kanbanSubcolumn: string }> = []

					if (kanbanData.columns && Array.isArray(kanbanData.columns)) {
						kanbanData.columns.forEach((column: { name: string; type: string; tasks?: unknown[] }) => {
							if (column.tasks && Array.isArray(column.tasks)) {
								;(column.tasks as Array<{ task?: ProjectTask; project_task_id: string; subcolumn: string }>).forEach((kanbanTask) => {
									if (kanbanTask.task) {
										// Mapear subcolumn "in_progress" para "_doing" para compatibilidade com KanbanBoard
										let kanbanSubcolumnSuffix = kanbanTask.subcolumn
										if (kanbanTask.subcolumn === 'in_progress') {
											kanbanSubcolumnSuffix = 'doing'
										}

										const taskWithSubcolumn = {
											...kanbanTask.task,
											kanbanSubcolumn: `${column.type}_${kanbanSubcolumnSuffix}`,
										}
										allTasksWithSubcolumn.push(taskWithSubcolumn)
									}
								})
							}
						})
					}

					setTasks(allTasksWithSubcolumn)
				} else {
					console.error('❌ Erro na resposta do Kanban:', kanbanData.error)
				}
			} else {
				console.error('❌ Erro na requisição do Kanban:', kanbanResponse.status)
				const errorText = await kanbanResponse.text()
				console.error('❌ Detalhes do erro:', errorText)
			}
		} catch (error) {
			console.error('❌ Erro ao carregar dados:', error)
			toast({
				type: 'error',
				title: 'Erro ao carregar',
				description: 'Erro interno do servidor',
			})
		} finally {
			setLoading(false)
		}
	}

	// Converter tasks para formato de activities para o KanbanBoard
	const activitiesFromTasks = useMemo((): Activity[] => {
		return tasks.map((task): Activity => {
			// Usar kanbanSubcolumn se disponível, senão fallback
			let activityStatus: Activity['status'] = 'todo'

			if (task.kanbanSubcolumn) {
				// Usar informação precisa da subcoluna do JSON Kanban
				activityStatus = task.kanbanSubcolumn as Activity['status']
			} else {
				// Fallback: Mapear status simples para subcolunas (_doing por padrão, exceto done e blocked)
				switch (task.status) {
					case 'todo':
						activityStatus = 'todo_doing'
						break
					case 'in_progress':
						activityStatus = 'in_progress_doing'
						break
					case 'blocked':
						activityStatus = 'blocked'
						break
					case 'review':
						activityStatus = 'review_doing'
						break
					case 'done':
						activityStatus = 'done'
						break
					default:
						activityStatus = 'todo_doing'
				}
			}

			const activity: Activity = {
				id: task.id,
				projectId: task.projectId,
				name: task.name,
				description: task.description,
				status: activityStatus,
				priority: task.priority,
				progress: task.status === 'done' ? 100 : task.status === 'in_progress' ? 50 : 0,
				category: task.category || '',
				startDate: task.startDate || '',
				endDate: task.endDate || '',
				estimatedHours: task.estimatedDays || 0,
				actualHours: 0,
				assignees: [],
				labels: [],
				createdAt: (() => {
					try {
						const date = task.createdAt ? new Date(task.createdAt) : new Date()
						return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
					} catch {
						return new Date().toISOString()
					}
				})(),
				updatedAt: (() => {
					try {
						const date = task.updatedAt ? new Date(task.updatedAt) : new Date()
						return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
					} catch {
						return new Date().toISOString()
					}
				})(),
			}

			return activity
		})
	}, [tasks])

	// Função para mover tarefa entre colunas (drag & drop OTIMISTA)
	const handleTaskMove = async (taskId: string, fromStatus: Activity['status'], toStatus: Activity['status']) => {
		// MOVIMENTO OTIMISTA: Atualizar UI PRIMEIRO
		const getTaskStatusFromActivityStatus = (activityStatus: Activity['status']): ProjectTask['status'] => {
			if (activityStatus.startsWith('todo')) return 'todo'
			if (activityStatus.startsWith('in_progress')) return 'in_progress'
			if (activityStatus.startsWith('review')) return 'review'
			if (activityStatus === 'blocked') return 'blocked'
			if (activityStatus === 'done') return 'done'
			return 'todo'
		}

		const newTaskStatus = getTaskStatusFromActivityStatus(toStatus)

		// Backup do estado anterior para rollback se necessário
		const previousTasks = tasks.slice()

		// ATUALIZAR UI IMEDIATAMENTE (otimista)
		setTasks((prevTasks) =>
			prevTasks.map((task) =>
				task.id === taskId
					? {
							...task,
							status: newTaskStatus,
							kanbanSubcolumn: toStatus,
						}
					: task,
			),
		)

		// PERSISTIR NO BACKEND (assíncrono)
		try {
			// Mapear status de activity para tipo de coluna e subcoluna
			const parseActivityStatus = (status: Activity['status']) => {
				if (status.startsWith('todo')) return { columnType: 'todo', subcolumn: status.endsWith('_done') ? 'done' : 'in_progress' }
				if (status.startsWith('in_progress')) return { columnType: 'in_progress', subcolumn: status.endsWith('_done') ? 'done' : 'in_progress' }
				if (status.startsWith('review')) return { columnType: 'review', subcolumn: status.endsWith('_done') ? 'done' : 'in_progress' }
				if (status === 'blocked') return { columnType: 'blocked', subcolumn: 'in_progress' }
				if (status === 'done') return { columnType: 'done', subcolumn: 'done' }
				return { columnType: 'todo', subcolumn: 'in_progress' }
			}

			const fromParsed = parseActivityStatus(fromStatus)
			const toParsed = parseActivityStatus(toStatus)

			const response = await fetch(`/api/projects/${projectId}/activities/${activityId}/kanban`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					taskId,
					fromColumnType: fromParsed.columnType,
					toColumnType: toParsed.columnType,
					newOrder: 0,
					cardSubcolumn: toParsed.subcolumn,
				}),
			})

			if (!response.ok) {
				throw new Error('Erro ao mover tarefa')
			}

			const result = await response.json()
			if (result.success) {
				toast({
					type: 'success',
					title: '✅ Tarefa movida',
					description: 'A tarefa foi movida com sucesso',
				})
			} else {
				throw new Error(result.error)
			}
		} catch (error) {
			console.error('❌ Erro ao persistir movimento:', error)

			// ROLLBACK: Restaurar estado anterior
			setTasks(previousTasks)

			toast({
				type: 'error',
				title: '❌ Erro ao mover tarefa',
				description: 'A tarefa foi restaurada à posição original',
			})
		}
	}

	// Função para criar nova tarefa
	function handleCreateTask() {
		toast({
			type: 'info',
			title: 'Funcionalidade em desenvolvimento',
			description: 'O formulário de nova tarefa será implementado na próxima etapa',
		})
	}

	// Função para editar tarefa
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function handleEditTask(activity: Activity) {
		toast({
			type: 'info',
			title: 'Funcionalidade em desenvolvimento',
			description: 'O formulário de edição de tarefa será implementado na próxima etapa',
		})
	}

	// Função para excluir tarefa
	async function handleDeleteTask(taskId: string) {
		try {
			const response = await fetch(`/api/projects/${projectId}/tasks`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId }),
			})

			if (!response.ok) {
				throw new Error('Erro ao excluir tarefa')
			}

			const result = await response.json()
			if (result.success) {
				await loadAllData()

				toast({
					type: 'success',
					title: 'Tarefa excluída',
					description: 'A tarefa foi excluída com sucesso',
				})
			} else {
				throw new Error(result.error)
			}
		} catch (error) {
			console.error('❌ Erro ao excluir tarefa:', error)
			toast({
				type: 'error',
				title: 'Erro ao excluir',
				description: 'Não foi possível excluir a tarefa',
			})
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen w-full flex items-center justify-center'>
				<div className='text-center'>
					<div className='size-8 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-zinc-600 dark:text-zinc-400'>Carregando Kanban...</p>
				</div>
			</div>
		)
	}

	if (!project || !activity) {
		return notFound()
	}

	return (
		<div className='w-full h-full flex flex-col'>
			{/* Header fixo */}
			<div className='w-full p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex-shrink-0'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Kanban - {activity.name}</h1>
						<p className='text-zinc-600 dark:text-zinc-400 mt-1'>Projeto: {project.name} • Gerencie as tarefas desta atividade</p>
					</div>
					<div className='flex items-center gap-3'>
						<Button onClick={handleCreateTask} className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white'>
							<span className='icon-[lucide--plus] size-4' />
							<span>Nova Tarefa</span>
						</Button>
						<Button onClick={() => toast({ type: 'info', title: 'Em desenvolvimento', description: 'Configurações do Kanban em breve' })} className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white'>
							<span className='icon-[lucide--settings] size-4' />
							<span>Configurar</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Conteúdo do Kanban */}
			<div className='flex-1 overflow-x-auto overflow-y-hidden bg-zinc-50 dark:bg-zinc-900'>
				<div className='min-w-max h-full p-6'>
					{tasks.length === 0 ? (
						// Estado vazio - sem tarefas
						<div className='bg-zinc-50 dark:bg-zinc-800 rounded-lg p-12 text-center'>
							<span className='icon-[lucide--kanban-square] size-16 text-zinc-400 mb-4 block mx-auto' />
							<h3 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2'>Kanban da Atividade</h3>
							<p className='text-zinc-600 dark:text-zinc-400 mb-6'>Esta atividade ainda não possui tarefas. Crie a primeira tarefa para começar a usar o Kanban.</p>
							<div className='space-y-3 text-sm text-zinc-500 mb-6'>
								<p>
									<strong>Atividade:</strong> {activity.name}
								</p>
								<p>
									<strong>Projeto:</strong> {project.name}
								</p>
							</div>
							<Button onClick={handleCreateTask} className='bg-blue-600 hover:bg-blue-700 text-white'>
								<span className='icon-[lucide--plus] size-4 mr-2' />
								Criar Primeira Tarefa
							</Button>
						</div>
					) : (
						// Estado com tarefas - Kanban Board real com drag & drop

						<KanbanBoard activities={activitiesFromTasks} selectedActivity={undefined} onActivityMove={handleTaskMove} onCreateActivity={handleCreateTask} onEditActivity={handleEditTask} onDeleteActivity={handleDeleteTask} />
					)}
				</div>
			</div>
		</div>
	)
}
