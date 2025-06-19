'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { useParams, useRouter } from 'next/navigation'

import ActivityCard from '@/components/admin/projects/ActivityCard'
import ProjectFormOffcanvas from '@/components/admin/projects/ProjectFormOffcanvas'
import ActivityFormOffcanvas from '@/components/admin/projects/ActivityFormOffcanvas'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import { Activity } from '@/types/projects'

// Interfaces para tipos de dados
interface Project {
	id: string
	name: string
	shortDescription: string
	description: string
	startDate: string | null
	endDate: string | null
	priority: 'low' | 'medium' | 'high' | 'urgent'
	status: 'active' | 'completed' | 'paused' | 'cancelled'
	createdAt: Date
	updatedAt: Date
}

interface ProjectActivity {
	id: string
	projectId: string
	name: string
	description: string
	category: string | null
	estimatedDays: number | null
	startDate: string | null
	endDate: string | null
	priority: 'low' | 'medium' | 'high' | 'urgent'
	status: 'todo' | 'progress' | 'done' | 'blocked'
	createdAt: Date
	updatedAt: Date
}

interface ActivitySubmissionData {
	name: string
	description: string
	status: 'todo' | 'todo_doing' | 'todo_done' | 'in_progress' | 'in_progress_doing' | 'in_progress_done' | 'review' | 'review_doing' | 'review_done' | 'done' | 'blocked'
	priority: ProjectActivity['priority']
	category: string
	startDate: string
	endDate: string
	days: string
	estimatedHours?: string // Manter compatibilidade com ActivityFormOffcanvas
}

export default function ProjectDetailsPage() {
	const params = useParams()
	const router = useRouter()
	const projectId = params.projectId as string
	const [project, setProject] = useState<Project | null>(null)
	const [activities, setActivities] = useState<ProjectActivity[]>([])
	const [loading, setLoading] = useState(true)
	const [activitiesLoading, setActivitiesLoading] = useState(false)

	// Estados dos offcanvas
	const [projectFormOpen, setProjectFormOpen] = useState(false)
	const [activityFormOpen, setActivityFormOpen] = useState(false)
	const [editingActivity, setEditingActivity] = useState<ProjectActivity | null>(null)

	// Estados para filtros de atividades
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'progress' | 'done' | 'blocked'>('all')
	const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all')

	// Carregar projeto e atividades
	useEffect(() => {
		if (projectId) {
			fetchProject()
			fetchActivities()
		}
	}, [projectId])

	async function fetchProject() {
		if (!projectId) return

		try {
			setLoading(true)
			console.log('🔵 Carregando detalhes do projeto:', projectId)

			const response = await fetch(`/api/admin/projects?id=${projectId}`)

			if (!response.ok) {
				console.log('❌ Erro HTTP ao buscar projeto:', response.status)
				toast({
					type: 'error',
					title: 'Projeto não encontrado',
					description: 'O projeto solicitado não existe ou foi removido.',
				})
				router.push('/admin/projects')
				return
			}

			const projects = await response.json()

			// A API retorna um array de projetos filtrados
			const foundProject = projects.find((p: Project) => p.id === projectId)

			if (!foundProject) {
				console.log('❌ Projeto não encontrado no array:', projectId)
				toast({
					type: 'error',
					title: 'Projeto não encontrado',
					description: 'O projeto solicitado não existe ou foi removido.',
				})
				router.push('/admin/projects')
				return
			}

			setProject(foundProject)
			console.log('✅ Projeto carregado:', foundProject.name)
		} catch (error) {
			console.error('❌ Erro ao carregar projeto:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao carregar detalhes do projeto',
			})
			router.push('/admin/projects')
		} finally {
			setLoading(false)
		}
	}

	async function fetchActivities() {
		if (!projectId) return

		try {
			setActivitiesLoading(true)
			console.log('🔵 Carregando atividades do projeto:', projectId)

			const response = await fetch(`/api/projects/${projectId}/activities`)
			const data = await response.json()

			if (!response.ok || !data.success) {
				console.error('❌ Erro ao carregar atividades:', data.error)
				toast({
					type: 'error',
					title: 'Erro ao carregar atividades',
					description: data.error || 'Erro interno do servidor',
				})
				return
			}

			setActivities(data.activities)
			console.log('✅ Atividades carregadas:', data.activities.length)
		} catch (error) {
			console.error('❌ Erro ao carregar atividades:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao carregar atividades do projeto',
			})
		} finally {
			setActivitiesLoading(false)
		}
	}

	// Função para converter status do banco para o formato do componente
	function convertActivityStatus(dbStatus: ProjectActivity['status']): 'todo' | 'todo_doing' | 'todo_done' | 'in_progress' | 'in_progress_doing' | 'in_progress_done' | 'review' | 'review_doing' | 'review_done' | 'done' | 'blocked' {
		switch (dbStatus) {
			case 'todo':
				return 'todo'
			case 'progress':
				return 'in_progress'
			case 'done':
				return 'done'
			case 'blocked':
				return 'blocked'
			default:
				return 'todo'
		}
	}

	// Filtrar atividades
	const filteredActivities = useMemo(() => {
		let filtered = activities

		// Filtro de busca
		if (search) {
			filtered = filtered.filter((activity) => activity.name.toLowerCase().includes(search.toLowerCase()) || activity.description.toLowerCase().includes(search.toLowerCase()))
		}

		// Filtro de status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((activity) => activity.status === statusFilter)
		}

		// Filtro de prioridade
		if (priorityFilter !== 'all') {
			filtered = filtered.filter((activity) => activity.priority === priorityFilter)
		}

		return filtered.sort((a, b) => a.name.localeCompare(b.name))
	}, [activities, search, statusFilter, priorityFilter])

	function handleEditActivity(activity: Activity) {
		console.log('🔵 Abrindo formulário de edição da atividade:', activity.name)

		// Converter de Activity para ProjectActivity
		const projectActivity: ProjectActivity = {
			id: activity.id,
			projectId: activity.projectId,
			name: activity.name,
			description: activity.description,
			category: activity.category,
			estimatedDays: activity.estimatedHours,
			startDate: activity.startDate || '',
			endDate: activity.endDate || '',
			priority: activity.priority,
			status: activity.status === 'in_progress' ? 'progress' : activity.status === 'in_progress_doing' ? 'progress' : activity.status === 'in_progress_done' ? 'progress' : activity.status === 'review' ? 'progress' : activity.status === 'review_doing' ? 'progress' : activity.status === 'review_done' ? 'progress' : activity.status === 'todo' ? 'todo' : activity.status === 'todo_doing' ? 'todo' : activity.status === 'todo_done' ? 'todo' : activity.status === 'done' ? 'done' : 'blocked',
			createdAt: new Date(activity.createdAt),
			updatedAt: new Date(activity.updatedAt),
		}

		setEditingActivity(projectActivity)
		setActivityFormOpen(true)
	}

	function handleCreateActivity() {
		console.log('🔵 Abrindo formulário de nova atividade para projeto:', project?.name)
		setEditingActivity(null)
		setActivityFormOpen(true)
	}

	// Função para atualizar projeto
	async function handleProjectSubmit(projectData: { name: string; shortDescription: string; description: string; status: Project['status']; priority: Project['priority']; startDate: string; endDate: string }) {
		if (!project) return

		try {
			console.log('🔵 Atualizando projeto:', projectData.name)

			const response = await fetch(`/api/admin/projects`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: project.id,
					...projectData,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Erro ao atualizar projeto')
			}

			const updatedProject = await response.json()
			setProject(updatedProject)
			console.log('✅ Projeto atualizado com sucesso')

			toast({
				type: 'success',
				title: 'Projeto atualizado',
				description: 'As informações do projeto foram atualizadas com sucesso.',
			})
		} catch (error) {
			console.error('❌ Erro ao atualizar projeto:', error)
			toast({
				type: 'error',
				title: 'Erro ao atualizar projeto',
				description: error instanceof Error ? error.message : 'Erro interno do servidor',
			})
			throw error
		}
	}

	// Função para converter status do componente para o banco
	function convertStatusToDatabase(componentStatus: ActivitySubmissionData['status']): ProjectActivity['status'] {
		switch (componentStatus) {
			case 'todo':
			case 'todo_doing':
			case 'todo_done':
				return 'todo'
			case 'in_progress':
			case 'in_progress_doing':
			case 'in_progress_done':
			case 'review':
			case 'review_doing':
			case 'review_done':
				return 'progress'
			case 'done':
				return 'done'
			case 'blocked':
				return 'blocked'
			default:
				return 'todo'
		}
	}

	// Função para criar/editar atividade
	async function handleActivitySubmit(activityData: ActivitySubmissionData) {
		if (!project) return

		try {
			console.log('🔵 Dados recebidos do formulário:', activityData)

			const dbStatus = convertStatusToDatabase(activityData.status)

			// Usar 'estimatedHours' se disponível, senão 'days'
			const estimatedDays = activityData.estimatedHours || activityData.days

			const requestData = {
				id: editingActivity?.id,
				name: activityData.name,
				description: activityData.description,
				category: activityData.category || null,
				estimatedDays: estimatedDays ? Number(estimatedDays) : null,
				startDate: activityData.startDate || null,
				endDate: activityData.endDate || null,
				priority: activityData.priority,
				status: dbStatus,
			}

			console.log('🔵 Dados que serão enviados para API:', requestData)

			if (editingActivity) {
				// Editar atividade existente
				console.log('🔵 Atualizando atividade:', editingActivity.id)

				const response = await fetch(`/api/projects/${projectId}/activities`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestData),
				})

				console.log('🔵 Status da resposta:', response.status)
				console.log('🔵 Headers da resposta:', Object.fromEntries(response.headers.entries()))

				let data
				try {
					const responseText = await response.text()
					console.log('🔵 Texto bruto da resposta:', responseText)
					data = JSON.parse(responseText)
				} catch (parseError) {
					console.error('❌ Erro ao fazer parse da resposta:', parseError)
					console.error('❌ Resposta não é JSON válido')
					throw new Error('Resposta da API não é JSON válido - possível erro 500 interno')
				}

				if (!response.ok || !data.success) {
					console.error('❌ Erro na resposta da API ao atualizar:', data)
					throw new Error(data.error || 'Erro ao atualizar atividade')
				}

				// Atualizar lista de atividades
				setActivities((prev) => prev.map((a) => (a.id === editingActivity.id ? data.activity : a)))

				console.log('✅ Atividade atualizada com sucesso')
				toast({
					type: 'success',
					title: 'Atividade atualizada',
					description: 'A atividade foi atualizada com sucesso.',
				})
			} else {
				// Criar nova atividade
				console.log('🔵 Criando nova atividade')

				const response = await fetch(`/api/projects/${projectId}/activities`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestData),
				})

				console.log('🔵 Status da resposta:', response.status)
				console.log('🔵 Headers da resposta:', Object.fromEntries(response.headers.entries()))

				let data
				try {
					const responseText = await response.text()
					console.log('🔵 Texto bruto da resposta:', responseText)
					data = JSON.parse(responseText)
				} catch (parseError) {
					console.error('❌ Erro ao fazer parse da resposta:', parseError)
					console.error('❌ Resposta não é JSON válido')
					throw new Error('Resposta da API não é JSON válido - possível erro 500 interno')
				}

				if (!response.ok || !data.success) {
					console.error('❌ Erro na resposta da API ao criar:', data)
					throw new Error(data.error || 'Erro ao criar atividade')
				}

				// Adicionar à lista de atividades
				setActivities((prev) => [data.activity, ...prev])

				console.log('✅ Atividade criada com sucesso')
				toast({
					type: 'success',
					title: 'Atividade criada',
					description: 'A nova atividade foi criada com sucesso.',
				})
			}

			// Fechar o formulário
			closeActivityForm()
		} catch (error) {
			console.error('❌ Erro ao salvar atividade:', error)
			toast({
				type: 'error',
				title: 'Erro ao salvar atividade',
				description: error instanceof Error ? error.message : 'Erro interno do servidor',
			})
			throw error
		}
	}

	// Função para excluir atividade
	async function handleActivityDelete(activityId: string) {
		if (!project) return

		try {
			console.log('🔵 Excluindo atividade:', activityId)

			const response = await fetch(`/api/projects/${projectId}/activities?activityId=${activityId}`, {
				method: 'DELETE',
			})

			const data = await response.json()

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Erro ao excluir atividade')
			}

			// Remover da lista de atividades
			setActivities((prev) => prev.filter((a) => a.id !== activityId))

			console.log('✅ Atividade excluída com sucesso')
			toast({
				type: 'success',
				title: 'Atividade excluída',
				description: 'A atividade foi excluída com sucesso.',
			})
		} catch (error) {
			console.error('❌ Erro ao excluir atividade:', error)
			toast({
				type: 'error',
				title: 'Erro ao excluir atividade',
				description: error instanceof Error ? error.message : 'Erro interno do servidor',
			})
			throw error
		}
	}

	function closeProjectForm() {
		setProjectFormOpen(false)
	}

	function closeActivityForm() {
		setActivityFormOpen(false)
		setEditingActivity(null)
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[400px] w-full'>
				<div className='flex items-center justify-center gap-3'>
					<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
					<span className='text-zinc-600 dark:text-zinc-400'>Carregando projeto...</span>
				</div>
			</div>
		)
	}

	if (!project) return null

	return (
		<div className='flex flex-col w-full'>
			{/* Header do Projeto */}
			<div className='w-full p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'>
				<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
					{/* Informações do Projeto */}
					<div className='flex items-center gap-4 min-w-0 flex-1'>
						<div className='min-w-0 flex-1'>
							<div className='flex items-center gap-3 mb-2'>
								<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Atividades de {project.name}</h1>
							</div>
							<p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{project.description}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Conteúdo Principal */}
			<div className='p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Filtros e Nova Atividade */}
					<div className='flex flex-col lg:flex-row lg:items-center gap-4'>
						{/* Filtros */}
						<div className='flex flex-1 gap-4'>
							<div className='flex-1'>
								<Input type='text' placeholder='Buscar atividades...' value={search} setValue={setSearch} className='pl-10' />
							</div>
							<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'todo' | 'progress' | 'done' | 'blocked')} className='w-40 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 text-sm text-zinc-700 dark:text-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
								<option value='all'>Todos os status</option>
								<option value='todo'>🔵 A fazer</option>
								<option value='progress'>🟡 Em progresso</option>
								<option value='done'>🟢 Concluída</option>
								<option value='blocked'>🔴 Bloqueada</option>
							</select>
							<select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'low' | 'medium' | 'high' | 'urgent')} className='w-40 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 text-sm text-zinc-700 dark:text-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
								<option value='all'>Todas prioridades</option>
								<option value='low'>⬇️ Baixa</option>
								<option value='medium'>➡️ Média</option>
								<option value='high'>⬆️ Alta</option>
								<option value='urgent'>🚨 Urgente</option>
							</select>
						</div>

						{/* Botão Nova Atividade */}
						<Button onClick={handleCreateActivity} className='flex items-center gap-2'>
							<span className='icon-[lucide--plus] size-4' />
							<span className='hidden sm:inline'>Nova atividade</span>
						</Button>
					</div>

					{/* Lista de Atividades */}
					{activitiesLoading ? (
						<div className='flex items-center justify-center py-12'>
							<div className='flex items-center gap-3'>
								<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
								<span className='text-zinc-600 dark:text-zinc-400'>Carregando atividades...</span>
							</div>
						</div>
					) : filteredActivities.length === 0 ? (
						<div className='text-center py-12'>
							<span className='icon-[lucide--clipboard-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
							<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>{search || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade criada ainda'}</h3>
							<p className='text-zinc-600 dark:text-zinc-400 mb-4'>{search || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Tente ajustar os filtros de busca.' : 'Comece criando a primeira atividade do projeto.'}</p>
							{!search && statusFilter === 'all' && priorityFilter === 'all' && (
								<Button onClick={handleCreateActivity} className='flex items-center gap-2 mx-auto'>
									<span className='icon-[lucide--plus] size-4' />
									Criar primeira atividade
								</Button>
							)}
						</div>
					) : (
						<div className='space-y-4'>
							{filteredActivities.map((activity) => (
								<ActivityCard
									key={activity.id}
									activity={{
										id: activity.id,
										projectId: activity.projectId,
										name: activity.name,
										description: activity.description,
										category: activity.category || '',
										status: convertActivityStatus(activity.status),
										priority: activity.priority,
										estimatedHours: activity.estimatedDays,
										actualHours: null,
										progress: activity.status === 'done' ? 100 : activity.status === 'progress' ? 50 : 0,
										startDate: activity.startDate || '',
										endDate: activity.endDate || '',
										assignees: [],
										labels: [],
										createdAt: activity.createdAt.toString(),
										updatedAt: activity.updatedAt.toString(),
									}}
									projectId={project.id}
									onEdit={handleEditActivity}
									onDelete={handleActivityDelete}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Offcanvas para editar projeto */}
			{project && (
				<ProjectFormOffcanvas
					isOpen={projectFormOpen}
					onClose={closeProjectForm}
					project={{
						id: project.id,
						name: project.name,
						shortDescription: project.shortDescription,
						description: project.description,
						icon: 'folder',
						color: '#3b82f6',
						status: project.status,
						priority: project.priority,
						startDate: project.startDate || '',
						endDate: project.endDate || '',
						members: [],
						progress: 0,
						activities: [],
						createdAt: project.createdAt.toString(),
						updatedAt: project.updatedAt.toString(),
					}}
					onSubmit={handleProjectSubmit}
				/>
			)}

			{/* Offcanvas para criar/editar atividade */}
			{project && (
				<ActivityFormOffcanvas
					isOpen={activityFormOpen}
					onClose={closeActivityForm}
					activity={
						editingActivity
							? {
									id: editingActivity.id,
									projectId: editingActivity.projectId,
									name: editingActivity.name,
									description: editingActivity.description,
									category: editingActivity.category || '',
									status: convertActivityStatus(editingActivity.status),
									priority: editingActivity.priority,
									estimatedHours: editingActivity.estimatedDays,
									actualHours: null,
									progress: 0,
									startDate: editingActivity.startDate || '',
									endDate: editingActivity.endDate || '',
									assignees: [],
									labels: [],
									createdAt: editingActivity.createdAt.toString(),
									updatedAt: editingActivity.updatedAt.toString(),
								}
							: null
					}
					project={{
						id: project.id,
						name: project.name,
						shortDescription: project.shortDescription,
						description: project.description,
						icon: 'folder',
						color: '#3b82f6',
						status: project.status,
						priority: project.priority,
						startDate: project.startDate || '',
						endDate: project.endDate || '',
						members: [],
						progress: 0,
						activities: [],
						createdAt: project.createdAt.toString(),
						updatedAt: project.updatedAt.toString(),
					}}
					onSubmit={handleActivitySubmit}
				/>
			)}
		</div>
	)
}
