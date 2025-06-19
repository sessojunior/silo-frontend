'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function ActivityKanbanPage() {
	const params = useParams()
	const projectId = params.projectId as string
	const activityId = params.activityId as string

	// Estados principais
	const [project, setProject] = useState<{ id: string; name: string } | null>(null)
	const [activity, setActivity] = useState<{ id: string; name: string } | null>(null)
	const [tasks, setTasks] = useState<any[]>([])
	const [kanbanColumns, setKanbanColumns] = useState<any[]>([])
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
			console.log('🔵 Carregando dados do Kanban para atividade:', activityId, 'do projeto:', projectId)

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
					console.log('🔵 Dados do Kanban da atividade recebidos:', {
						tasks: kanbanData.tasks?.length || 0,
						columns: kanbanData.columns?.length || 0,
					})

					setTasks(kanbanData.tasks || [])
					setKanbanColumns(kanbanData.columns || [])
				} else {
					console.error('❌ Erro na resposta do Kanban:', kanbanData.error)
				}
			} else {
				console.error('❌ Erro na requisição do Kanban:', kanbanResponse.status)
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
		<div className='min-h-screen w-full'>
			{/* Header fixo */}
			<div className='p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Kanban - {activity.name}</h1>
						<p className='text-zinc-600 dark:text-zinc-400 mt-1'>Projeto: {project.name} • Gerencie as tarefas desta atividade</p>
					</div>
					<div className='flex items-center gap-3'>
						<Button onClick={() => toast({ type: 'info', title: 'Em desenvolvimento', description: 'Formulário de nova tarefa em breve' })} className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white'>
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
						<Button onClick={() => toast({ type: 'info', title: 'Em desenvolvimento', description: 'Formulário de nova tarefa em breve' })} className='bg-blue-600 hover:bg-blue-700 text-white'>
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
					// Estado com tarefas - Kanban simples
					<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700'>
						<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
							<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4'>Tarefas da Atividade ({tasks.length})</h3>
						</div>
						<div className='p-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{tasks.map((task) => (
									<div key={task.id} className='bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700'>
										<h4 className='font-semibold text-zinc-900 dark:text-zinc-100 mb-2'>{task.name}</h4>
										{task.description && <p className='text-sm text-zinc-600 dark:text-zinc-400 mb-3'>{task.description}</p>}
										<div className='flex items-center justify-between text-xs text-zinc-500'>
											<span className={`px-2 py-1 rounded ${task.status === 'done' ? 'bg-green-100 text-green-800' : task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : task.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-zinc-100 text-zinc-800'}`}>{task.status}</span>
											<span className={`px-2 py-1 rounded ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' : task.priority === 'high' ? 'bg-orange-100 text-orange-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-zinc-100 text-zinc-800'}`}>{task.priority}</span>
										</div>
									</div>
								))}
							</div>
							<div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
								<p className='text-blue-800 dark:text-blue-200 font-semibold'>🚧 Kanban em Desenvolvimento</p>
								<p className='text-blue-600 dark:text-blue-300 text-sm mt-1'>As funcionalidades de drag & drop e colunas interativas serão implementadas na próxima fase.</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
