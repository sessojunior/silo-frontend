'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'
import KanbanBoard from '@/components/admin/projects/KanbanBoard'
import { ProjectTask } from '@/lib/db/schema'
import Button from '@/components/ui/Button'

// Interface Task do KanbanBoard
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

// Função para converter ProjectTask para KanbanTask
const convertToKanbanTask = (projectTask: ProjectTask): KanbanTask => {
	return {
		id: projectTask.id,
		project_id: projectTask.projectId,
		project_activity_id: projectTask.projectActivityId,
		name: projectTask.name,
		description: projectTask.description || '',
		category: projectTask.category || 'Geral',
		estimated_days: projectTask.estimatedDays || 1,
		status: projectTask.status as KanbanTask['status'],
		sort: projectTask.sort,
		start_date: projectTask.startDate || new Date().toISOString().split('T')[0],
		end_date: projectTask.endDate || new Date().toISOString().split('T')[0],
		priority: projectTask.priority as KanbanTask['priority'],
	}
}

interface Project {
	id: string
	name: string
}

interface Activity {
	id: string
	name: string
	description?: string
}

export default function TaskKanbanPage() {
	const params = useParams()
	const projectId = params.projectId as string
	const activityId = params.activityId as string

	// Estados principais
	const [project, setProject] = useState<Project | null>(null)
	const [activity, setActivity] = useState<Activity | null>(null)
	const [tasks, setTasks] = useState<ProjectTask[]>([]) // eslint-disable-line @typescript-eslint/no-unused-vars
	const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Função para carregar dados do projeto
	const fetchProject = useCallback(async () => {
		try {
			const response = await fetch(`/api/admin/projects?projectId=${projectId}`)
			if (!response.ok) {
				throw new Error('Projeto não encontrado')
			}

			const projectsData = await response.json()
			const projectData = projectsData.find((p: Project) => p.id === projectId)

			if (!projectData) {
				throw new Error('Projeto não encontrado nos dados')
			}

			setProject(projectData)
			return projectData
		} catch (error) {
			console.error('❌ Erro ao carregar projeto:', error)
			throw error
		}
	}, [projectId])

	// Função para carregar dados da atividade
	const fetchActivity = useCallback(async () => {
		try {
			const response = await fetch(`/api/projects/${projectId}/activities`)
			if (!response.ok) {
				throw new Error('Erro ao carregar atividades')
			}

			const result = await response.json()
			if (!result.success) {
				throw new Error(result.error || 'Erro ao carregar atividades')
			}

			const foundActivity = result.activities.find((a: Activity) => a.id === activityId)
			if (!foundActivity) {
				throw new Error('Atividade não encontrada')
			}

			setActivity(foundActivity)
			return foundActivity
		} catch (error) {
			console.error('❌ Erro ao carregar atividade:', error)
			throw error
		}
	}, [projectId, activityId])

	// Função para carregar tarefas
	const fetchTasks = useCallback(async () => {
		try {
			const response = await fetch(`/api/projects/${projectId}/activities/${activityId}/tasks`)
			if (!response.ok) {
				throw new Error(`Erro HTTP ${response.status}`)
			}

			const result = await response.json()
			if (!result.success) {
				throw new Error(result.error || 'Erro ao carregar tarefas')
			}

			// Converter tasksByStatus para array simples
			const allTasks: ProjectTask[] = []
			Object.entries(result.tasks).forEach(([, tasksInStatus]) => {
				;(tasksInStatus as ProjectTask[]).forEach((task) => {
					allTasks.push(task)
				})
			})

			setTasks(allTasks)

			// Converter para formato do Kanban
			const convertedTasks = allTasks.map(convertToKanbanTask)
			setKanbanTasks(convertedTasks)

			return allTasks
		} catch (error) {
			console.error('❌ Erro ao carregar tarefas:', error)
			throw error
		}
	}, [projectId, activityId])

	// Função para carregar todos os dados
	const loadAllData = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)

			await Promise.all([fetchProject(), fetchActivity(), fetchTasks()])
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
			setError(errorMessage)

			if (errorMessage.includes('não encontrado')) {
				notFound()
			} else {
				toast({
					type: 'error',
					title: '❌ Erro ao carregar dados',
					description: errorMessage,
				})
			}
		} finally {
			setLoading(false)
		}
	}, [fetchProject, fetchActivity, fetchTasks])

	// Função para persistir a movimentação no backend
	const handleTasksReorder = useCallback(
		async (tasksBeforeMove: KanbanTask[], tasksAfterMove: KanbanTask[]) => {
			try {
				const payload = {
					tasksBeforeMove: tasksBeforeMove.map((t) => ({ taskId: t.id, status: t.status, sort: t.sort })),
					tasksAfterMove: tasksAfterMove.map((t) => ({ taskId: t.id, status: t.status, sort: t.sort })),
				}

				const response = await fetch(`/api/projects/${projectId}/activities/${activityId}/tasks`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				})

				const result = await response.json()

				if (!response.ok && result.error === 'KANBAN_OUTDATED') {
					toast({
						type: 'warning',
						title: '⚠️ Kanban desatualizado',
						description: 'O Kanban foi atualizado por outro usuário ou aba. Recarregando...',
					})
					// Bloqueia movimentação até recarregar
					await fetchTasks() // Isso já faz setKanbanTasks e libera o bloqueio
					return
				}

				if (!result.success) {
					toast({
						type: 'error',
						title: '❌ Erro ao salvar Kanban',
						description: result.error || 'Erro desconhecido ao salvar Kanban',
					})
					// Não atualiza o estado local, apenas libera o bloqueio
					return
				}

				// Sucesso: só agora atualiza o estado local
				await fetchTasks() // Isso faz setKanbanTasks com o estado real do backend
				toast({
					type: 'success',
					title: '✅ Kanban salvo',
					description: 'Movimentação salva com sucesso!',
				})
			} catch (error) {
				console.error('❌ Erro ao persistir Kanban:', error)
				toast({
					type: 'error',
					title: '❌ Erro ao salvar Kanban',
					description: 'Erro inesperado ao salvar Kanban',
				})
				// Não atualiza o estado local, apenas libera o bloqueio
			}
		},
		[projectId, activityId, fetchTasks],
	)

	// Carregar dados ao montar o componente
	useEffect(() => {
		loadAllData()
	}, [loadAllData])

	// Estados de loading e erro
	if (loading) {
		return (
			<div className='flex flex-1 h-full items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full size-10 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-zinc-600 dark:text-zinc-400'>Carregando tarefas no kanban...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<div className='text-red-500 mb-4'>
						<span className='icon-[lucide--alert-circle] size-12 mx-auto block' />
					</div>
					<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>Erro ao carregar dados</h3>
					<p className='text-zinc-600 dark:text-zinc-400 mb-4'>{error}</p>
					<button onClick={loadAllData} className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
						Tentar novamente
					</button>
				</div>
			</div>
		)
	}

	if (!activity || !project) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<p className='text-zinc-600 dark:text-zinc-400'>Dados não encontrados</p>
				</div>
			</div>
		)
	}

	return (
		<div className='relative w-full h-[calc(100vh-64px)] flex flex-col overflow-x-auto overflow-y-auto'>
			{/* Cabeçalho */}
			<div className='w-full p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 sticky top-0 left-0 z-10'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Kanban - {activity.name}</h1>
						<p className='text-zinc-600 dark:text-zinc-400 mt-1'>Projeto: {project.name} • Gerencie as tarefas desta atividade</p>
					</div>
				</div>
			</div>

			{/* Conteúdo */}
			<div className='flex-1 bg-zinc-50 dark:bg-zinc-900'>
				<KanbanBoard tasks={kanbanTasks} onTasksReorder={handleTasksReorder} />
			</div>
		</div>
	)
}
