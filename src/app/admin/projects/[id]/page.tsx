'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'

import ActivityCard from '@/components/admin/projects/ActivityCard'
import ProjectFormOffcanvas from '@/components/admin/projects/ProjectFormOffcanvas'
import ActivityFormOffcanvas from '@/components/admin/projects/ActivityFormOffcanvas'
import Button from '@/components/ui/Button'

import { Project, Activity } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectDetailsPage() {
	const params = useParams()
	const projectId = params.id as string
	const [project, setProject] = useState<Project | null>(null)
	const [loading, setLoading] = useState(true)

	// Estados dos offcanvas
	const [projectFormOpen, setProjectFormOpen] = useState(false)
	const [activityFormOpen, setActivityFormOpen] = useState(false)
	const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

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
					notFound()
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

	// Todas as atividades sem filtros
	const allActivities = useMemo(() => {
		if (!project) return []
		return project.activities
	}, [project])

	// Não agrupar por categoria - lista simples
	const sortedActivities = useMemo(() => {
		return allActivities.sort((a, b) => a.name.localeCompare(b.name))
	}, [allActivities])

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
	async function handleProjectSubmit(projectData: Omit<Project, 'id' | 'progress' | 'members' | 'activities' | 'createdAt' | 'updatedAt'>) {
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
			{/* Header do Projeto Customizado para Atividades */}
			<div className='w-full p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'>
				<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
					{/* Informações do Projeto */}
					<div className='flex items-center gap-4 min-w-0 flex-1'>
						{/* Detalhes */}
						<div className='min-w-0 flex-1'>
							<div className='flex items-center gap-3 mb-2'>
								<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Atividades de {project.name}</h1>
								<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : project.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'}`}>{project.status === 'active' ? '🟢 Ativo' : project.status === 'paused' ? '⏸️ Pausado' : project.status === 'completed' ? '✅ Concluído' : '⭕ Planejamento'}</span>
							</div>
							<p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{project.description}</p>
						</div>
					</div>

					{/* Ações */}
					<div className='flex items-center gap-2 flex-shrink-0'>
						<Button onClick={handleCreateActivity} className='flex items-center gap-2'>
							<span className='icon-[lucide--plus] size-4' />
							<span className='hidden sm:inline'>Nova atividade</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Conteúdo Principal */}
			<div className='p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Lista Simples de Atividades */}
					{sortedActivities.length === 0 ? (
						<div className='text-center py-12'>
							<span className='icon-[lucide--clipboard-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
							<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>Nenhuma atividade criada ainda</h3>
							<p className='text-zinc-600 dark:text-zinc-400 mb-4'>Comece criando a primeira atividade do projeto.</p>
							<Button onClick={handleCreateActivity} className='flex items-center gap-2 mx-auto'>
								<span className='icon-[lucide--plus] size-4' />
								Criar primeira atividade
							</Button>
						</div>
					) : (
						<div className='space-y-4'>
							{sortedActivities.map((activity) => (
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
