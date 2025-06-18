'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { useParams, useRouter } from 'next/navigation'

import ActivityCard from '@/components/admin/projects/ActivityCard'
import ProjectFormOffcanvas from '@/components/admin/projects/ProjectFormOffcanvas'
import ActivityFormOffcanvas from '@/components/admin/projects/ActivityFormOffcanvas'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import { Project, Activity } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectDetailsPage() {
	const params = useParams()
	const router = useRouter()
	const projectId = params.id as string
	const [project, setProject] = useState<Project | null>(null)
	const [loading, setLoading] = useState(true)

	// Estados dos offcanvas
	const [projectFormOpen, setProjectFormOpen] = useState(false)
	const [activityFormOpen, setActivityFormOpen] = useState(false)
	const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

	// Estados para filtros de atividades
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'progress' | 'done' | 'blocked'>('all')
	const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all')

	// Carregar projeto
	useEffect(() => {
		if (projectId) {
			fetchProject()
		}
	}, [projectId])

	async function fetchProject() {
		if (!projectId) return

		try {
			setLoading(true)
			console.log('🔵 Carregando detalhes do projeto:', projectId)

			// Simular API call
			setTimeout(() => {
				const foundProject = mockProjects.find((p) => p.id === projectId)
				if (!foundProject) {
					console.log('❌ Projeto não encontrado:', projectId)
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
				setLoading(false)
			}, 800)
		} catch (error) {
			console.error('❌ Erro ao carregar projeto:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao carregar detalhes do projeto',
			})
			setLoading(false)
		}
	}

	// Filtrar atividades
	const filteredActivities = useMemo(() => {
		if (!project) return []

		let filtered = project.activities

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
	}, [project, search, statusFilter, priorityFilter])

	function handleEditActivity(activity: Activity) {
		console.log('🔵 Abrindo formulário de edição da atividade:', activity.name)
		setEditingActivity(activity)
		setActivityFormOpen(true)
	}

	function handleCreateActivity() {
		console.log('🔵 Abrindo formulário de nova atividade para projeto:', project?.name)
		setEditingActivity(null)
		setActivityFormOpen(true)
	}

	// Funções para os offcanvas
	async function handleProjectSubmit(projectData: { name: string; shortDescription: string; description: string; status: Project['status']; priority: Project['priority']; startDate: string; endDate: string }) {
		if (!project) return

		try {
			console.log('🔵 Atualizando projeto:', projectData.name)

			// Simular API call
			const updatedProject: Project = {
				...project,
				...projectData,
				updatedAt: new Date().toISOString(),
			}

			setProject(updatedProject)
			console.log('✅ Projeto atualizado com sucesso')
		} catch (error) {
			console.error('❌ Erro ao atualizar projeto:', error)
			throw error
		}
	}

	async function handleActivitySubmit(activityData: { name: string; description: string; status: Activity['status']; priority: Activity['priority']; category: string; startDate: string; endDate: string; estimatedHours: string }) {
		if (!project) return

		try {
			if (editingActivity) {
				// Editar atividade existente
				console.log('🔵 Atualizando atividade:', editingActivity.id, activityData)

				const updatedActivity: Activity = {
					...editingActivity,
					...activityData,
					estimatedHours: activityData.estimatedHours ? Number(activityData.estimatedHours) : null,
					updatedAt: new Date().toISOString(),
				}

				const updatedProject = {
					...project,
					activities: project.activities.map((a) => (a.id === editingActivity.id ? updatedActivity : a)),
				}

				setProject(updatedProject)
				console.log('✅ Atividade atualizada com sucesso')
			} else {
				// Criar nova atividade
				console.log('🔵 Criando nova atividade:', activityData)

				const newActivity: Activity = {
					id: `activity-${Date.now()}`,
					projectId: project.id,
					...activityData,
					progress: 0,
					assignees: [],
					labels: [],
					estimatedHours: activityData.estimatedHours ? Number(activityData.estimatedHours) : null,
					actualHours: null,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}

				const updatedProject = {
					...project,
					activities: [newActivity, ...project.activities],
				}

				setProject(updatedProject)
				console.log('✅ Atividade criada com sucesso')
			}
		} catch (error) {
			console.error('❌ Erro ao salvar atividade:', error)
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
					{filteredActivities.length === 0 ? (
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
								<ActivityCard key={activity.id} activity={activity} projectId={project.id} onEdit={handleEditActivity} />
							))}
						</div>
					)}
				</div>
			</div>

			{/* Offcanvas para editar projeto */}
			{project && <ProjectFormOffcanvas isOpen={projectFormOpen} onClose={closeProjectForm} project={project} onSubmit={handleProjectSubmit} />}

			{/* Offcanvas para criar/editar atividade */}
			{project && <ActivityFormOffcanvas isOpen={activityFormOpen} onClose={closeActivityForm} activity={editingActivity} project={project} onSubmit={handleActivitySubmit} />}
		</div>
	)
}
