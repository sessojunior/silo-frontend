'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import KanbanBoard from '@/components/admin/projects/KanbanBoard'
import { Task } from '@/types/projects'

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
	status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done' // Status da tabela project_task (sincronizado)
	createdAt: string | Date
	updatedAt: string | Date
	// 🎯 INFORMAÇÕES DO KANBAN (project_kanban.columns.tasks)
	kanbanColumnType?: string // 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	kanbanSubcolumn?: string // 'in_progress' | 'done' (subcoluna dentro da coluna)
	kanbanOrder?: number // order dentro da subcoluna
	kanbanStatus?: string // Status composto para compatibilidade: 'todo_in_progress', 'todo_done', etc.
}

// Interface removida - não mais necessária

export default function TaskKanbanPage() {
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
					// Extrair tarefas COM informação da subcoluna E ordenação

					const allTasksWithSubcolumn: Array<ProjectTask & { kanbanSubcolumn: string; kanbanOrder: number }> = []

					if (kanbanData.columns && Array.isArray(kanbanData.columns)) {
						kanbanData.columns.forEach((column: { name: string; type: string; tasks?: unknown[] }) => {
							if (column.tasks && Array.isArray(column.tasks)) {
								;(column.tasks as Array<{ task?: ProjectTask; project_task_id: string; subcolumn: string; order: number }>).forEach((kanbanTask) => {
									if (kanbanTask.task) {
										console.log('🔍 [loadAllData] Processando tarefa do Kanban:', {
											taskId: kanbanTask.task.id,
											taskName: kanbanTask.task.name,
											columnType: column.type,
											subcolumn: kanbanTask.subcolumn,
											order: kanbanTask.order,
										})

										// 🎯 CORREÇÃO ARQUITETURAL: Usar estrutura correta baseada na explicação do usuário
										// column.type: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
										// subcolumn: 'in_progress' | 'done' (dentro da coluna)

										const taskWithKanbanInfo = {
											...kanbanTask.task,
											// Manter informações originais do Kanban
											kanbanColumnType: column.type, // 'todo', 'in_progress', etc.
											kanbanSubcolumn: kanbanTask.subcolumn, // 'in_progress' | 'done'
											kanbanOrder: kanbanTask.order || 0,
											// Status composto para compatibilidade com KanbanBoard atual
											kanbanStatus: `${column.type}_${kanbanTask.subcolumn}`, // ex: 'todo_in_progress', 'todo_done'
										}

										console.log('🔍 [loadAllData] Tarefa processada:', {
											kanbanColumnType: taskWithKanbanInfo.kanbanColumnType,
											kanbanSubcolumn: taskWithKanbanInfo.kanbanSubcolumn,
											kanbanStatus: taskWithKanbanInfo.kanbanStatus,
										})

										allTasksWithSubcolumn.push(taskWithKanbanInfo)
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

	// Converter tasks para formato de tasks para o KanbanBoard
	const tasksFromTasks = useMemo((): Task[] => {
		return tasks.map((task): Task => {
			// 🎯 USAR ESTRUTURA CORRETA DO KANBAN
			let taskStatus: Task['status'] = 'todo_doing' // default

			if (task.kanbanStatus) {
				// 🎯 CORREÇÃO CRÍTICA: Mapear kanbanStatus corretamente
				console.log('🔍 [tasksFromTasks] Mapeando kanbanStatus:', {
					taskId: task.id,
					kanbanStatus: task.kanbanStatus,
					columnType: task.kanbanColumnType,
					subcolumn: task.kanbanSubcolumn,
				})

				// 🎯 USAR INFORMAÇÕES CORRETAS DO KANBAN
				if (task.kanbanColumnType && task.kanbanSubcolumn) {
					// Construir status baseado nas informações corretas do Kanban
					if (task.kanbanColumnType === 'blocked') {
						taskStatus = 'blocked'
					} else if (task.kanbanColumnType === 'done') {
						taskStatus = 'done'
					} else {
						// Para colunas normais: columnType + "_" + subcolumn convertida
						const frontendSubcolumn = task.kanbanSubcolumn === 'in_progress' ? 'doing' : 'done'
						taskStatus = `${task.kanbanColumnType}_${frontendSubcolumn}` as Task['status']
					}

					console.log('🔍 [tasksFromTasks] Status construído:', {
						kanbanColumnType: task.kanbanColumnType,
						kanbanSubcolumn: task.kanbanSubcolumn,
						frontendSubcolumn: task.kanbanSubcolumn === 'in_progress' ? 'doing' : 'done',
						finalStatus: taskStatus,
					})
				} else {
					// Fallback para kanbanStatus (formato antigo)
					switch (task.kanbanStatus) {
						case 'todo_in_progress':
							taskStatus = 'todo_doing'
							break
						case 'todo_done':
							taskStatus = 'todo_done'
							break
						case 'in_progress_in_progress':
							taskStatus = 'in_progress_doing'
							break
						case 'in_progress_done':
							taskStatus = 'in_progress_done'
							break
						case 'review_in_progress':
							taskStatus = 'review_doing'
							break
						case 'review_done':
							taskStatus = 'review_done'
							break
						case 'blocked':
							taskStatus = 'blocked'
							break
						case 'done':
							taskStatus = 'done'
							break
						default:
							taskStatus = 'todo_doing'
					}
				}
			} else {
				// Fallback baseado no status da tabela project_task
				console.log('🔍 [tasksFromTasks] Fallback para task.status:', task.status)
				switch (task.status) {
					case 'todo':
						taskStatus = 'todo_doing'
						break
					case 'in_progress':
						taskStatus = 'in_progress_doing'
						break
					case 'blocked':
						taskStatus = 'blocked'
						break
					case 'review':
						taskStatus = 'review_doing'
						break
					case 'done':
						taskStatus = 'done'
						break
					default:
						taskStatus = 'todo_doing'
				}
			}

			const taskDetails: Task & { kanbanOrder?: number } = {
				id: task.id,
				projectId: task.projectId,
				activityId: task.projectActivityId, // 🎯 CORREÇÃO: Mapear projectActivityId para activityId
				name: task.name,
				description: task.description,
				status: taskStatus,
				priority: task.priority,
				progress: task.status === 'done' ? 100 : task.status === 'in_progress' ? 50 : 0,
				category: task.category || '',
				startDate: task.startDate || '',
				endDate: task.endDate || '',
				estimatedHours: task.estimatedDays || 0,
				actualHours: 0,
				assignees: [],
				labels: [],
				kanbanOrder: task.kanbanOrder || 0, // 🎯 ORDENAÇÃO CRÍTICA DO KANBAN
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

			return taskDetails
		})
	}, [tasks])

	// Função para mover tarefa entre colunas (drag & drop OTIMISTA)
	const handleTaskMove = async (taskId: string, fromStatus: Task['status'], toStatus: Task['status'], overId?: string) => {
		console.log('🔍 [handleTaskMove] ======= INÍCIO MOVIMENTO =======')
		console.log('🔍 [handleTaskMove] Parâmetros:', { taskId, fromStatus, toStatus, overId })

		// 🎯 VERIFICAÇÃO CRÍTICA: Determinar se é movimento entre subcolunas ou reordenação
		const isSameSubcolumn = fromStatus === toStatus
		const isSameColumn = (() => {
			// 🎯 CORREÇÃO CRÍTICA: Extrair tipo de coluna corretamente
			// Precisa lidar com 'in_progress' que tem underscore no nome
			const extractColumnType = (status: string) => {
				if (status.startsWith('in_progress_')) return 'in_progress'
				if (status === 'blocked') return 'blocked'
				if (status === 'done') return 'done'
				// Para outros casos: 'todo_doing' → 'todo', 'review_done' → 'review'
				return status.split('_')[0]
			}

			const fromColumn = extractColumnType(fromStatus)
			const toColumn = extractColumnType(toStatus)
			return fromColumn === toColumn
		})()

		// 🎯 EXTRAIR INFORMAÇÕES CORRETAMENTE
		const extractColumnType = (status: string) => {
			if (status.startsWith('in_progress_')) return 'in_progress'
			if (status === 'blocked') return 'blocked'
			if (status === 'done') return 'done'
			return status.split('_')[0]
		}

		const extractSubcolumnType = (status: string) => {
			if (status === 'blocked' || status === 'done') return status
			const parts = status.split('_')
			return parts.slice(-1)[0] // Último elemento (doing/done)
		}

		const fromColumn = extractColumnType(fromStatus)
		const toColumn = extractColumnType(toStatus)
		const fromSubcolumn = extractSubcolumnType(fromStatus)
		const toSubcolumn = extractSubcolumnType(toStatus)

		console.log('🔍 [handleTaskMove] Análise do movimento:', {
			isSameSubcolumn,
			isSameColumn,
			fromColumn,
			toColumn,
			fromSubcolumn,
			toSubcolumn,
		})

		// 🎯 CASO 1: Movimento na mesma subcoluna (reordenação)
		if (isSameSubcolumn) {
			console.log('🔵 [handleTaskMove] Movimento na mesma subcoluna - verificando necessidade de reordenação')
			console.log('🔍 [handleTaskMove] OverId para reordenação:', overId)

			// Se não há overId, significa que foi solto em área vazia - não precisa reordenar
			if (!overId) {
				console.log('🔵 [handleTaskMove] Sem overId - sem necessidade de reordenação')
				toast({
					type: 'info',
					title: 'ℹ️ Sem mudança',
					description: 'A tarefa permanece na mesma posição',
				})
				return
			}

			// Verificar se a tarefa de destino é diferente e existe
			const targetTask = tasks.find((t) => t.id === overId)
			if (!targetTask) {
				console.log('🔵 [handleTaskMove] Tarefa de destino não encontrada - sem reordenação')
				return
			}

			// 🎯 CORREÇÃO CRÍTICA: Converter kanbanStatus para o formato Task['status'] para comparação
			const targetTaskStatus = (() => {
				if (!targetTask.kanbanStatus) return 'todo_doing'

				// Mapear kanbanStatus (formato banco) para Task['status'] (formato frontend)
				switch (targetTask.kanbanStatus) {
					case 'todo_in_progress':
						return 'todo_doing'
					case 'todo_done':
						return 'todo_done'
					case 'in_progress_in_progress':
						return 'in_progress_doing'
					case 'in_progress_done':
						return 'in_progress_done'
					case 'review_in_progress':
						return 'review_doing'
					case 'review_done':
						return 'review_done'
					case 'blocked':
						return 'blocked'
					case 'done':
						return 'done'
					default:
						return 'todo_doing'
				}
			})()

			// Verificar se a tarefa de destino está na mesma subcoluna
			if (targetTaskStatus !== toStatus) {
				console.log('🔵 [handleTaskMove] Tarefa de destino não está na mesma subcoluna - sem reordenação')
				console.log('🔍 [handleTaskMove] Comparação:', {
					targetTaskKanbanStatus: targetTask.kanbanStatus,
					targetTaskConvertedStatus: targetTaskStatus,
					toStatus: toStatus,
				})
				return
			}

			console.log('🔵 [handleTaskMove] Reordenação necessária - atualizando ordem local')

			// Reordenar tarefas na mesma subcoluna baseado no overId
			setTasks((prevTasks) => {
				const updatedTasks = [...prevTasks]
				const draggedTaskIndex = updatedTasks.findIndex((t) => t.id === taskId)

				if (draggedTaskIndex === -1) {
					console.log('❌ [handleTaskMove] Tarefa arrastada não encontrada:', taskId)
					return prevTasks
				}

				// Remover a tarefa arrastada da lista
				const [draggedTask] = updatedTasks.splice(draggedTaskIndex, 1)

				// Encontrar nova posição baseada na tarefa de destino
				const targetTaskIndex = updatedTasks.findIndex((t) => t.id === overId)
				if (targetTaskIndex !== -1) {
					// Inserir antes da tarefa de destino
					updatedTasks.splice(targetTaskIndex, 0, draggedTask)
					console.log('🔵 [handleTaskMove] Tarefa reordenada antes de:', overId)
				} else {
					// Fallback: adicionar no final da subcoluna
					const lastSameStatusIndex = updatedTasks.findLastIndex((t) => t.kanbanStatus === toStatus)
					if (lastSameStatusIndex === -1) {
						updatedTasks.push(draggedTask)
					} else {
						updatedTasks.splice(lastSameStatusIndex + 1, 0, draggedTask)
					}
					console.log('🔵 [handleTaskMove] Fallback: tarefa adicionada no final')
				}

				const newSequence = updatedTasks.filter((t) => t.kanbanStatus === toStatus).map((t) => ({ id: t.id, name: t.name.substring(0, 30) + '...' }))

				console.log('🔵 [handleTaskMove] Nova sequência:', newSequence)

				return updatedTasks
			})

			toast({
				type: 'success',
				title: '✅ Tarefa reordenada',
				description: 'A ordem foi atualizada na mesma coluna',
			})
			return
		}

		// 🎯 CASO 2: Movimento entre subcolunas da mesma coluna (ex: todo_doing → todo_done)
		if (isSameColumn && !isSameSubcolumn) {
			console.log('🔵 [handleTaskMove] Movimento entre subcolunas da mesma coluna')
			console.log('🔍 [handleTaskMove] Detalhes:', {
				from: `${fromStatus.split('_')[0]}_${fromStatus.split('_')[1]}`,
				to: `${toStatus.split('_')[0]}_${toStatus.split('_')[1]}`,
				columnType: fromStatus.split('_')[0], // Mesmo tipo de coluna
				fromSubcolumn: fromStatus.split('_')[1],
				toSubcolumn: toStatus.split('_')[1],
			})

			// 🎯 MOVIMENTO ENTRE SUBCOLUNAS: Mantém project_task.status, altera apenas subcolumn
			// Conforme especificação: "Ao mudar de subcoluna, 'subcolumn' de project_kanban.columns.tasks também é alterada"
			// Mas project_task.status permanece o mesmo (mesma coluna)

			// Backup do estado anterior
			const previousTasks = tasks.slice()

			// 🎯 ATUALIZAR UI IMEDIATAMENTE (otimista) - APENAS subcoluna muda
			setTasks((prevTasks) =>
				prevTasks.map((task) =>
					task.id === taskId
						? {
								...task,
								// ✅ MANTER project_task.status inalterado (mesma coluna)
								// ✅ ALTERAR informações do Kanban para refletir nova subcoluna
								kanbanStatus: toStatus, // Compatibilidade
								kanbanSubcolumn: toSubcolumn === 'doing' ? 'in_progress' : 'done',
							}
						: task,
				),
			)

			// PERSISTIR NO BACKEND (assíncrono)
			try {
				const parseTaskStatus = (status: Task['status']) => {
					// 🎯 USAR MESMAS FUNÇÕES DE EXTRAÇÃO
					const columnType = extractColumnType(status)
					const subcolumnType = extractSubcolumnType(status)

					let backendSubcolumn = 'in_progress'
					if (subcolumnType === 'done') {
						backendSubcolumn = 'done'
					} else if (subcolumnType === 'doing') {
						backendSubcolumn = 'in_progress'
					}

					if (status === 'blocked') return { columnType: 'blocked', subcolumn: 'in_progress' }
					if (status === 'done') return { columnType: 'done', subcolumn: 'done' }

					return { columnType, subcolumn: backendSubcolumn }
				}

				const fromParsed = parseTaskStatus(fromStatus)
				const toParsed = parseTaskStatus(toStatus)

				const requestBody = {
					taskId: taskId,
					fromColumnType: fromParsed.columnType,
					toColumnType: toParsed.columnType, // ✅ Mesmo tipo de coluna
					newOrder: 0, // TODO: Implementar ordem correta baseada no overId
					cardSubcolumn: toParsed.subcolumn, // ✅ Nova subcoluna
				}

				console.log('🔍 [handleTaskMove] Request body (movimento subcoluna):', requestBody)

				const response = await fetch(`/api/projects/${projectId}/activities/${activityId}/kanban`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(requestBody),
				})

				if (!response.ok) {
					throw new Error(`Erro HTTP ${response.status}`)
				}

				const result = await response.json()

				if (result.success) {
					console.log('✅ [handleTaskMove] Movimento entre subcolunas bem-sucedido!')
					toast({
						type: 'success',
						title: '✅ Tarefa movida',
						description: `Tarefa movida para ${toStatus.split('_')[1] === 'done' ? 'Feito' : 'Fazendo'}`,
					})
				} else {
					throw new Error(result.error)
				}
			} catch (error) {
				console.error('❌ Erro ao mover entre subcolunas:', error)
				setTasks(previousTasks)
				toast({
					type: 'error',
					title: '❌ Erro ao mover tarefa',
					description: 'A tarefa foi restaurada à posição original',
				})
			}
			return
		}

		// 🎯 CASO 3: Movimento entre colunas diferentes (ex: todo_doing → in_progress_doing)
		console.log('🔵 [handleTaskMove] Movimento entre colunas diferentes')

		// MOVIMENTO OTIMISTA: Atualizar UI PRIMEIRO
		const getTaskStatusFromTaskStatus = (taskStatus: Task['status']): ProjectTask['status'] => {
			if (taskStatus.startsWith('todo')) return 'todo'
			if (taskStatus.startsWith('in_progress')) return 'in_progress'
			if (taskStatus.startsWith('review')) return 'review'
			if (taskStatus === 'blocked') return 'blocked'
			if (taskStatus === 'done') return 'done'
			return 'todo'
		}

		const newTaskStatus = getTaskStatusFromTaskStatus(toStatus)

		// Backup do estado anterior para rollback se necessário
		const previousTasks = tasks.slice()

		// 🎯 ATUALIZAR UI IMEDIATAMENTE (otimista) COM INFORMAÇÕES CORRETAS
		setTasks((prevTasks) =>
			prevTasks.map((task) =>
				task.id === taskId
					? {
							...task,
							status: newTaskStatus,
							kanbanStatus: toStatus, // Compatibilidade
							// 🎯 ATUALIZAR INFORMAÇÕES CORRETAS DO KANBAN
							kanbanColumnType: toColumn,
							kanbanSubcolumn: toSubcolumn === 'doing' ? 'in_progress' : 'done',
						}
					: task,
			),
		)

		// PERSISTIR NO BACKEND (assíncrono)
		try {
			// 🎯 CORREÇÃO CRÍTICA: Mapear status de task para tipo de coluna e subcoluna
			// Compatível com o mapeamento do carregamento inicial
			const parseTaskStatus = (status: Task['status']) => {
				// 🎯 CORREÇÃO CRÍTICA: Parsing correto considerando 'in_progress'
				const columnType = extractColumnType(status)
				const subcolumnType = extractSubcolumnType(status)

				// Mapear subcoluna para o formato esperado pelo backend
				let backendSubcolumn = 'in_progress' // default
				if (subcolumnType === 'done') {
					backendSubcolumn = 'done'
				} else if (subcolumnType === 'doing') {
					backendSubcolumn = 'in_progress' // "doing" no frontend = "in_progress" no backend
				}

				// Casos especiais
				if (status === 'blocked') return { columnType: 'blocked', subcolumn: 'in_progress' }
				if (status === 'done') return { columnType: 'done', subcolumn: 'done' }

				return { columnType, subcolumn: backendSubcolumn }
			}

			const fromParsed = parseTaskStatus(fromStatus)
			const toParsed = parseTaskStatus(toStatus)

			console.log('🔍 [handleTaskMove] Mapeamento:', {
				fromStatus,
				fromParsed,
				toStatus,
				toParsed,
			})

			const requestBody = {
				taskId: taskId, // 🎯 CORREÇÃO CRÍTICA: API espera taskId (ID da tarefa)
				fromColumnType: fromParsed.columnType,
				toColumnType: toParsed.columnType,
				newOrder: 0,
				cardSubcolumn: toParsed.subcolumn,
			}

			console.log('🔍 [handleTaskMove] Request body:', requestBody)
			console.log('🔍 [handleTaskMove] URL:', `/api/projects/${projectId}/activities/${activityId}/kanban`)

			const response = await fetch(`/api/projects/${projectId}/activities/${activityId}/kanban`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody),
			})

			console.log('🔍 [handleTaskMove] Response status:', response.status)
			console.log('🔍 [handleTaskMove] Response ok:', response.ok)

			if (!response.ok) {
				const errorText = await response.text()
				console.error('❌ [handleTaskMove] Response error text:', errorText)
				throw new Error(`Erro HTTP ${response.status}: ${errorText}`)
			}

			const result = await response.json()
			console.log('🔍 [handleTaskMove] Response result:', result)

			if (result.success) {
				console.log('✅ [handleTaskMove] Movimento bem-sucedido!')
				toast({
					type: 'success',
					title: '✅ Tarefa movida',
					description: 'A tarefa foi movida com sucesso',
				})
			} else {
				console.error('❌ [handleTaskMove] Movimento falhou:', result.error)
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
	function handleEditTask(task: Task) {
		toast({
			type: 'info',
			title: 'Funcionalidade em desenvolvimento',
			description: 'O formulário de edição de tarefa será implementado na próxima etapa',
		})
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
		<div className='relative w-full h-[calc(100vh-64px)] flex flex-col overflow-x-auto overflow-y-auto'>
			{/* Header fixo - fazer com que fique fixo no topo, ao rolar página horizontalmente, o header fique fixo no topo */}
			<div className='w-full p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 sticky top-0 left-0 z-10'>
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
			<div className='flex-1 bg-zinc-50 dark:bg-zinc-900'>
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

						<KanbanBoard tasks={tasksFromTasks} onTaskMove={handleTaskMove} onCreateTask={handleCreateTask} onEditTask={handleEditTask} />
					)}
				</div>
			</div>
		</div>
	)
}
