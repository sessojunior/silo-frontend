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
			console.log('🔵 [FRONTEND] Carregando dados do Kanban para:', {
				projectId,
				activityId,
				url: `/api/projects/${projectId}/activities/${activityId}/kanban`,
			})

			// Carregar projeto
			const projectResponse = await fetch(`/api/admin/projects?projectId=${projectId}`)
			if (!projectResponse.ok) {
				console.error('❌ [FRONTEND] Projeto não encontrado:', projectId)
				notFound()
				return
			}

			const projectsData = await projectResponse.json()
			const projectData = projectsData.find((p: { id: string }) => p.id === projectId)

			if (!projectData) {
				console.error('❌ [FRONTEND] Projeto não encontrado nos dados:', projectId)
				notFound()
				return
			}

			setProject(projectData)
			console.log('✅ [FRONTEND] Projeto carregado:', projectData.name)

			// Carregar atividade específica
			const activitiesResponse = await fetch(`/api/projects/${projectId}/activities`)
			if (activitiesResponse.ok) {
				const activitiesResult = await activitiesResponse.json()
				if (activitiesResult.success) {
					const foundActivity = activitiesResult.activities.find((a: { id: string }) => a.id === activityId)
					if (!foundActivity) {
						console.error('❌ [FRONTEND] Atividade não encontrada:', activityId)
						notFound()
						return
					}

					setActivity(foundActivity)
					console.log('✅ [FRONTEND] Atividade carregada:', foundActivity.name)
				}
			}

			// Carregar dados do Kanban desta atividade específica
			console.log('🔵 [FRONTEND] Fazendo requisição para:', `/api/projects/${projectId}/activities/${activityId}/kanban`)
			const kanbanResponse = await fetch(`/api/projects/${projectId}/activities/${activityId}/kanban`)
			if (kanbanResponse.ok) {
				const kanbanData = await kanbanResponse.json()
				console.log('🔵 [FRONTEND] Resposta completa da API:', kanbanData)

				if (kanbanData.success) {
					console.log('🔵 [FRONTEND] Dados do Kanban da atividade recebidos:', {
						columns: kanbanData.columns?.length || 0,
					})
					console.log('🔵 [FRONTEND] Columns recebidas detalhadas:', kanbanData.columns)

					// VERIFICAR AS TAREFAS DENTRO DAS COLUNAS
					if (kanbanData.columns && kanbanData.columns.length > 0) {
						const totalTasks = kanbanData.columns.reduce((total: number, column: { tasks?: unknown[] }) => total + (column.tasks?.length || 0), 0)
						console.log('🔍 [FRONTEND] Total de tarefas encontradas nas colunas:', totalTasks)

						// Verificar primeira tarefa encontrada
						for (const column of kanbanData.columns) {
							if (column.tasks && column.tasks.length > 0) {
								const firstTask = column.tasks[0]
								console.log('🔍 [FRONTEND] Verificando primeira task da coluna', column.name, ':', {
									project_task_id: firstTask.project_task_id,
									taskData: firstTask.task,
									hasTaskData: !!firstTask.task,
								})
								break
							}
						}
					}

					// 🎯 NOVA ABORDAGEM: Extrair tarefas COM informação da subcoluna
					console.log('🔍 [FRONTEND] Estrutura das colunas recebidas:', kanbanData.columns)

					const allTasksWithSubcolumn: Array<ProjectTask & { kanbanSubcolumn: string }> = []

					if (kanbanData.columns && Array.isArray(kanbanData.columns)) {
						kanbanData.columns.forEach((column: { name: string; type: string; tasks?: unknown[] }, columnIndex: number) => {
							console.log(`🔍 [FRONTEND] Coluna ${columnIndex + 1}: ${column.name} tem ${column.tasks?.length || 0} tarefas`)

							if (column.tasks && Array.isArray(column.tasks)) {
								;(column.tasks as Array<{ task?: ProjectTask; project_task_id: string; subcolumn: string }>).forEach((kanbanTask, taskIndex: number) => {
									console.log(`🔍 [FRONTEND] Task ${taskIndex + 1} na coluna ${column.name}:`, {
										hasTask: !!kanbanTask.task,
										taskData: kanbanTask.task,
										project_task_id: kanbanTask.project_task_id,
										subcolumn: kanbanTask.subcolumn,
										columnType: column.type,
									})

									if (kanbanTask.task) {
										// Adicionar informação da subcoluna para conversão correta
										// Mapear subcolumn "in_progress" para "_doing" para compatibilidade com KanbanBoard
										let kanbanSubcolumnSuffix = kanbanTask.subcolumn
										if (kanbanTask.subcolumn === 'in_progress') {
											kanbanSubcolumnSuffix = 'doing'
										}

										const taskWithSubcolumn = {
											...kanbanTask.task,
											kanbanSubcolumn: `${column.type}_${kanbanSubcolumnSuffix}`, // Ex: "in_progress_doing", "in_progress_done"
										}
										allTasksWithSubcolumn.push(taskWithSubcolumn)
									}
								})
							}
						})
					}

					console.log('🔵 [FRONTEND] Total de tarefas extraídas com subcoluna:', allTasksWithSubcolumn.length)
					console.log('🔍 [FRONTEND] Primeira tarefa com subcoluna:', allTasksWithSubcolumn[0])
					setTasks(allTasksWithSubcolumn)
				} else {
					console.error('❌ [FRONTEND] Erro na resposta do Kanban:', kanbanData.error)
				}
			} else {
				console.error('❌ [FRONTEND] Erro na requisição do Kanban:', kanbanResponse.status)
				const errorText = await kanbanResponse.text()
				console.error('❌ [FRONTEND] Detalhes do erro:', errorText)
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
		console.log('🔵 Convertendo tasks para activities:', {
			tasksCount: tasks.length,
			tasks: tasks.map((t) => ({ id: t.id, name: t.name, status: t.status, kanbanSubcolumn: t.kanbanSubcolumn })),
		})

		return tasks.map((task): Activity => {
			// 🎯 NOVA LÓGICA: Usar kanbanSubcolumn se disponível, senão fallback
			let activityStatus: Activity['status'] = 'todo'

			if (task.kanbanSubcolumn) {
				// Usar informação precisa da subcoluna do JSON Kanban
				activityStatus = task.kanbanSubcolumn as Activity['status']
				console.log('🔵 Usando kanbanSubcolumn:', {
					taskId: task.id,
					taskName: task.name,
					kanbanSubcolumn: task.kanbanSubcolumn,
					activityStatus,
				})
			} else {
				// Fallback: Mapear status simples para subcolunas (_doing por padrão, exceto done e blocked)
				switch (task.status) {
					case 'todo':
						activityStatus = 'todo_doing' // KanbanBoard espera subcoluna
						break
					case 'in_progress':
						activityStatus = 'in_progress_doing' // KanbanBoard espera subcoluna
						break
					case 'blocked':
						activityStatus = 'blocked' // Já coincide
						break
					case 'review':
						activityStatus = 'review_doing' // KanbanBoard espera subcoluna
						break
					case 'done':
						activityStatus = 'done' // Já coincide
						break
					default:
						activityStatus = 'todo_doing'
				}

				console.log('🔵 Usando fallback para status:', {
					taskId: task.id,
					taskName: task.name,
					taskStatus: task.status,
					activityStatus,
				})
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

			console.log('🔵 Task convertida:', {
				taskId: task.id,
				taskName: task.name,
				taskStatus: task.status,
				activityStatus: activity.status,
			})

			return activity
		})
	}, [tasks])

	// Função para mover tarefa entre colunas (drag & drop OTIMISTA)
	const handleTaskMove = async (taskId: string, fromStatus: Activity['status'], toStatus: Activity['status']) => {
		console.log('🔵 Iniciando movimento otimista:', { taskId, fromStatus, toStatus })

		// 🎯 MOVIMENTO OTIMISTA: Atualizar UI PRIMEIRO
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

		// 🚀 ATUALIZAR UI IMEDIATAMENTE (otimista)
		setTasks((prevTasks) =>
			prevTasks.map((task) =>
				task.id === taskId
					? {
							...task,
							status: newTaskStatus,
							kanbanSubcolumn: toStatus, // Preservar subcoluna exata
						}
					: task,
			),
		)

		console.log('✅ UI atualizada otimisticamente:', {
			taskId,
			fromActivityStatus: fromStatus,
			toActivityStatus: toStatus,
			newTaskStatus,
			newKanbanSubcolumn: toStatus,
		})

		// 🌐 PERSISTIR NO BACKEND (assíncrono)
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

			console.log('🔍 Persistindo movimento:', {
				from: { status: fromStatus, ...fromParsed },
				to: { status: toStatus, ...toParsed },
			})

			const response = await fetch(`/api/projects/${projectId}/activities/${activityId}/kanban`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					taskId,
					fromColumnType: fromParsed.columnType,
					toColumnType: toParsed.columnType,
					newOrder: 0,
					cardSubcolumn: toParsed.subcolumn, // Usar subcolumn correta
				}),
			})

			if (!response.ok) {
				throw new Error('Erro ao mover tarefa')
			}

			const result = await response.json()
			if (result.success) {
				console.log('✅ Movimento persistido com sucesso')
				// UI já foi atualizada otimisticamente - apenas toast de confirmação
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

			// 🔄 ROLLBACK: Restaurar estado anterior
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
			console.log('🔵 Excluindo tarefa:', taskId)

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

	// Debug final antes do render
	console.log('🔍 [FRONTEND] Dados finais antes do render:', {
		tasksCount: tasks.length,
		activitiesCount: activitiesFromTasks.length,
		activitiesData: activitiesFromTasks.map((a) => ({ id: a.id, name: a.name, status: a.status })),
		statusDistribution: activitiesFromTasks.reduce(
			(acc, a) => {
				acc[a.status] = (acc[a.status] || 0) + 1
				return acc
			},
			{} as Record<string, number>,
		),
	})

	return (
		<div className='min-h-screen w-full'>
			{/* Header fixo */}
			<div className='p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'>
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
			<div className='p-6'>
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
						<div className='mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
							<p className='text-green-800 dark:text-green-200 font-semibold'>✅ NAVEGAÇÃO FUNCIONANDO!</p>
							<p className='text-green-600 dark:text-green-300 text-sm mt-1'>
								URL correta: /admin/projects/{projectId}/activities/{activityId}
							</p>
						</div>
					</div>
				) : (
					// Estado com tarefas - Kanban Board real com drag & drop
					<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 overflow-x-auto'>
						<div className='mb-6'>
							<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2'>
								Kanban Board - {tasks.length} {tasks.length === 1 ? 'Tarefa' : 'Tarefas'}
							</h3>
							<p className='text-sm text-zinc-600 dark:text-zinc-400'>Arraste e solte as tarefas entre as colunas para alterar seu status</p>
						</div>

						{/* DEBUG: Exibir dados das tarefas */}
						<div className='mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
							<h4 className='font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>🐛 DEBUG - Dados das Tarefas</h4>
							<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
								<div>
									<p className='text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2'>Tasks Originais ({tasks.length}):</p>
									<pre className='text-xs bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded overflow-auto max-h-40'>
										{JSON.stringify(
											tasks.map((t) => ({ id: t.id, name: t.name, status: t.status })),
											null,
											2,
										)}
									</pre>
								</div>
								<div>
									<p className='text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2'>Activities Convertidas ({activitiesFromTasks.length}):</p>
									<pre className='text-xs bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded overflow-auto max-h-40'>
										{JSON.stringify(
											activitiesFromTasks.map((a) => ({ id: a.id, name: a.name, status: a.status })),
											null,
											2,
										)}
									</pre>
								</div>
							</div>
						</div>

						<div className='min-w-max'>
							<KanbanBoard activities={activitiesFromTasks} selectedActivity={undefined} onActivityMove={handleTaskMove} onCreateActivity={handleCreateTask} onEditActivity={handleEditTask} onDeleteActivity={handleDeleteTask} />
						</div>
						<div className='mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
							<p className='text-green-800 dark:text-green-200 font-semibold'>🎉 KANBAN BOARD ATIVO!</p>
							<p className='text-green-600 dark:text-green-300 text-sm mt-1'>Drag & drop funcionando • Sincronização automática com o banco de dados</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
