'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'

import ProjectDetailsHeader from '@/components/admin/projects/ProjectDetailsHeader'
import KanbanBoard from '@/components/admin/projects/KanbanBoard'

import { Project, Activity } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectKanbanPage() {
	const params = useParams()
	const projectId = params.id as string
	const [project, setProject] = useState<Project | null>(null)
	const [activities, setActivities] = useState<Activity[]>([])
	const [loading, setLoading] = useState(true)

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

	function handleEditProject(project: Project) {
		console.log('🔵 Editando projeto:', project.name)
		toast({
			type: 'info',
			title: 'Em desenvolvimento',
			description: 'Edição será implementada na próxima etapa',
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
		<div className='w-full'>
			{/* Header do Projeto */}
			<ProjectDetailsHeader project={project} onEdit={handleEditProject} />

			{/* Conteúdo Principal */}
			<div className='p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Board Kanban */}
					<KanbanBoard activities={filteredActivities} onActivityMove={handleActivityMove} />
				</div>
			</div>
		</div>
	)
}
