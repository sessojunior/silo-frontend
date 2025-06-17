'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'

import KanbanBoard from '@/components/admin/projects/KanbanBoard'
import ActivityFormOffcanvas from '@/components/admin/projects/ActivityFormOffcanvas'
import KanbanConfigOffcanvas, { KanbanConfig } from '@/components/admin/projects/KanbanConfigOffcanvas'
import Button from '@/components/ui/Button'

import { Project, Activity } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectKanbanPage() {
	const params = useParams()
	const projectId = params.id as string
	const [project, setProject] = useState<Project | null>(null)
	const [activities, setActivities] = useState<Activity[]>([])
	const [loading, setLoading] = useState(true)
	const [kanbanConfig, setKanbanConfig] = useState<KanbanConfig | null>(null)

	// Estados dos offcanvas
	const [activityFormOpen, setActivityFormOpen] = useState(false)
	const [kanbanConfigOpen, setKanbanConfigOpen] = useState(false)
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
			console.log('🔵 Carregando projeto para Kanban:', projectId)

			// Simular API call
			setTimeout(() => {
				const foundProject = mockProjects.find((p) => p.id === projectId)
				if (!foundProject) {
					notFound()
					return
				}

				setProject(foundProject)
				setActivities(foundProject.activities)
				console.log('✅ Projeto carregado para Kanban:', foundProject.name)
				setLoading(false)
			}, 800)
		} catch (error) {
			console.error('❌ Erro ao carregar projeto:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao carregar projeto',
			})
			setLoading(false)
		}
	}

	// Filtrar atividades
	const filteredActivities = useMemo(() => {
		return activities
	}, [activities])

	// Atualizar atividade individual
	const handleActivityUpdate = (activityId: string, updates: Partial<Activity>) => {
		console.log('🔵 Atualizando atividade:', activityId, updates)

		setActivities((prev) => prev.map((activity) => (activity.id === activityId ? { ...activity, ...updates } : activity)))

		// Atualizar no projeto também
		if (project) {
			const updatedProject = {
				...project,
				activities: project.activities.map((activity) => (activity.id === activityId ? { ...activity, ...updates } : activity)),
			}
			setProject(updatedProject)
		}

		toast({
			type: 'success',
			title: 'Atividade atualizada',
			description: 'As alterações foram salvas com sucesso',
		})
	}

	// Mover atividade entre colunas
	const handleActivityMove = (activityId: string, fromStatus: Activity['status'], toStatus: Activity['status']) => {
		console.log('🔵 Movendo atividade no Kanban:', activityId, 'de', fromStatus, 'para', toStatus)

		// Simular API call
		setTimeout(() => {
			handleActivityUpdate(activityId, { status: toStatus })

			// Log de auditoria
			console.log('✅ Atividade movida com sucesso:', {
				activityId,
				from: fromStatus,
				to: toStatus,
				timestamp: new Date().toISOString(),
			})
		}, 300)
	}

	function handleCreateActivity() {
		console.log('🔵 Abrindo formulário de nova atividade no Kanban')
		setEditingActivity(null)
		setActivityFormOpen(true)
	}

	function handleEditActivity(activity: Activity) {
		console.log('🔵 Abrindo formulário de edição da atividade no Kanban:', activity.name)
		setEditingActivity(activity)
		setActivityFormOpen(true)
	}

	function handleConfigureKanban() {
		console.log('🔵 Abrindo configurações do Kanban')
		setKanbanConfigOpen(true)
	}

	// Funções para os offcanvas

	async function handleActivitySubmit(activityData: { name: string; description: string; status: Activity['status']; priority: Activity['priority']; category: string; startDate: string; endDate: string; estimatedHours: string }) {
		if (!project) return

		try {
			if (editingActivity) {
				// Editar atividade existente
				console.log('🔵 Atualizando atividade no Kanban:', editingActivity.id, activityData)

				const updatedActivity: Activity = {
					...editingActivity,
					...activityData,
					estimatedHours: activityData.estimatedHours ? Number(activityData.estimatedHours) : null,
					updatedAt: new Date().toISOString(),
				}

				const updatedActivities = activities.map((a) => (a.id === editingActivity.id ? updatedActivity : a))
				setActivities(updatedActivities)

				const updatedProject = {
					...project,
					activities: updatedActivities,
				}
				setProject(updatedProject)
				console.log('✅ Atividade atualizada com sucesso no Kanban')
			} else {
				// Criar nova atividade
				console.log('🔵 Criando nova atividade no Kanban:', activityData)

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

				const updatedActivities = [newActivity, ...activities]
				setActivities(updatedActivities)

				const updatedProject = {
					...project,
					activities: updatedActivities,
				}
				setProject(updatedProject)
				console.log('✅ Atividade criada com sucesso no Kanban')
			}
		} catch (error) {
			console.error('❌ Erro ao salvar atividade no Kanban:', error)
			throw error
		}
	}

	function closeActivityForm() {
		setActivityFormOpen(false)
		setEditingActivity(null)
	}

	function closeKanbanConfig() {
		setKanbanConfigOpen(false)
	}

	function handleKanbanConfigSave(config: KanbanConfig) {
		console.log('🔵 Salvando configurações do Kanban:', config)
		setKanbanConfig(config)

		toast({
			type: 'success',
			title: 'Configurações aplicadas',
			description: 'As configurações do Kanban foram atualizadas com sucesso',
		})
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[400px] w-full'>
				<div className='flex items-center justify-center gap-3'>
					<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
					<span className='text-zinc-600 dark:text-zinc-400'>Carregando Kanban...</span>
				</div>
			</div>
		)
	}

	if (!project) return null

	return (
		<div className='w-full h-full flex flex-col'>
			{/* Header do Projeto Customizado para Kanban */}
			<div className='w-full p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex-shrink-0'>
				<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
					{/* Informações do Projeto */}
					<div className='flex items-center gap-4 min-w-0 flex-1'>
						{/* Detalhes */}
						<div className='min-w-0 flex-1'>
							<div className='flex items-center gap-3 mb-2'>
								<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Kanban de {project.name}</h1>
								<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : project.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'}`}>{project.status === 'active' ? '🟢 Ativo' : project.status === 'paused' ? '⏸️ Pausado' : project.status === 'completed' ? '✅ Concluído' : '⭕ Planejamento'}</span>
							</div>
							<p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{project.description}</p>
						</div>
					</div>

					{/* Ações */}
					<div className='flex items-center gap-2 flex-shrink-0'>
						<Button onClick={handleConfigureKanban} className='flex items-center gap-2' style='bordered'>
							<span className='icon-[lucide--settings] size-4' />
							<span className='hidden sm:inline'>Configurar Kanban</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Conteúdo Principal com Scroll Horizontal DIRETO - SEM padding que cause scroll vertical */}
			<div className='flex-1 overflow-x-auto overflow-y-hidden bg-zinc-50 dark:bg-zinc-900'>
				<div className='min-w-max h-full p-6'>
					{/* Board Kanban */}
					<KanbanBoard activities={filteredActivities} project={project} onActivityMove={handleActivityMove} onCreateActivity={handleCreateActivity} onEditActivity={handleEditActivity} onConfigureKanban={handleConfigureKanban} />
				</div>
			</div>

			{/* Offcanvas para criar/editar atividade */}
			{project && <ActivityFormOffcanvas isOpen={activityFormOpen} onClose={closeActivityForm} activity={editingActivity} project={project} onSubmit={handleActivitySubmit} />}

			{/* Offcanvas para configurar Kanban */}
			<KanbanConfigOffcanvas isOpen={kanbanConfigOpen} onClose={closeKanbanConfig} initialConfig={kanbanConfig} onSave={handleKanbanConfigSave} />
		</div>
	)
}
