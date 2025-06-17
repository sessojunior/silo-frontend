'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'

import ProjectDetailsHeader from '@/components/admin/projects/ProjectDetailsHeader'
import ActivityFilters, { FilterOptions } from '@/components/admin/projects/ActivityFilters'
import ActivityCard from '@/components/admin/projects/ActivityCard'
import Button from '@/components/ui/Button'

import { Project, Activity } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectDetailsPage() {
	const params = useParams()
	const projectId = params.id as string
	const [project, setProject] = useState<Project | null>(null)
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState<FilterOptions>({
		search: '',
		status: 'all',
		priority: 'all',
		category: 'all',
		assignee: 'all',
	})

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

	// Filtrar atividades
	const filteredActivities = useMemo(() => {
		if (!project) return []

		let filtered = project.activities

		// Filtro de busca
		if (filters.search) {
			filtered = filtered.filter((activity) => activity.name.toLowerCase().includes(filters.search.toLowerCase()) || (activity.description && activity.description.toLowerCase().includes(filters.search.toLowerCase())))
		}

		// Filtro de status
		if (filters.status !== 'all') {
			filtered = filtered.filter((activity) => activity.status === filters.status)
		}

		// Filtro de prioridade
		if (filters.priority !== 'all') {
			filtered = filtered.filter((activity) => activity.priority === filters.priority)
		}

		// Filtro de categoria
		if (filters.category !== 'all') {
			filtered = filtered.filter((activity) => activity.category === filters.category)
		}

		// Filtro de assignee
		if (filters.assignee !== 'all') {
			filtered = filtered.filter((activity) => activity.assignees.some((assignee) => assignee.userId === filters.assignee))
		}

		return filtered
	}, [project, filters])

	// Agrupar atividades por categoria
	const activitiesByCategory = useMemo(() => {
		const grouped = filteredActivities.reduce(
			(acc, activity) => {
				const category = activity.category || 'Sem categoria'
				if (!acc[category]) {
					acc[category] = []
				}
				acc[category].push(activity)
				return acc
			},
			{} as Record<string, Activity[]>,
		)

		// Ordenar categorias
		const orderedCategories = Object.keys(grouped).sort()
		const orderedGrouped: Record<string, Activity[]> = {}
		orderedCategories.forEach((category) => {
			orderedGrouped[category] = grouped[category]
		})

		return orderedGrouped
	}, [filteredActivities])

	// Extrair categorias únicas para filtros
	const availableCategories = useMemo(() => {
		if (!project) return []
		return Array.from(new Set(project.activities.map((activity) => activity.category || 'Sem categoria')))
	}, [project])

	function handleEditProject(project: Project) {
		console.log('🔵 Editando projeto:', project.name)
		// TODO: Implementar edição do projeto
		toast({
			type: 'info',
			title: 'Em desenvolvimento',
			description: 'Edição será implementada na próxima etapa',
		})
	}

	function handleEditActivity(activity: Activity) {
		console.log('🔵 Editando atividade:', activity.name)
		// TODO: Implementar edição da atividade
		toast({
			type: 'info',
			title: 'Em desenvolvimento',
			description: 'Edição será implementada na próxima etapa',
		})
	}

	function handleStatusChange(activityId: string, newStatus: Activity['status']) {
		console.log('🔵 Alterando status da atividade:', activityId, 'para:', newStatus)
		// TODO: Implementar mudança de status via API
		toast({
			type: 'success',
			title: 'Status atualizado',
			description: 'Status da atividade foi alterado com sucesso',
		})
	}

	function handleCreateActivity() {
		console.log('🔵 Criando nova atividade para projeto:', project?.name)
		// TODO: Implementar criação de atividade
		toast({
			type: 'info',
			title: 'Em desenvolvimento',
			description: 'Criação será implementada na próxima etapa',
		})
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
		<div className='w-full'>
			{/* Header do Projeto */}
			<ProjectDetailsHeader project={project} onEdit={handleEditProject} />

			{/* Conteúdo Principal */}
			<div className='p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Filtros */}
					<ActivityFilters onFilterChange={setFilters} members={project.members} categories={availableCategories} />

					{/* Header de Ações */}
					<div className='flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center'>
						<div>
							<h2 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>Atividades do Projeto</h2>
							<p className='text-zinc-600 dark:text-zinc-400'>
								{filteredActivities.length} de {project.activities.length} atividade{project.activities.length !== 1 ? 's' : ''}
								{filteredActivities.length !== project.activities.length && ' (filtradas)'}
							</p>
						</div>

						<Button onClick={handleCreateActivity} className='flex items-center gap-2'>
							<span className='icon-[lucide--plus] size-4' />
							Nova atividade
						</Button>
					</div>

					{/* Lista de Atividades por Categoria */}
					{Object.keys(activitiesByCategory).length === 0 ? (
						<div className='text-center py-12'>
							<span className='icon-[lucide--clipboard-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
							<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>{project.activities.length === 0 ? 'Nenhuma atividade criada ainda' : 'Nenhuma atividade encontrada'}</h3>
							<p className='text-zinc-600 dark:text-zinc-400 mb-4'>{project.activities.length === 0 ? 'Comece criando a primeira atividade do projeto.' : 'Tente ajustar os filtros para encontrar atividades.'}</p>
							{project.activities.length === 0 && (
								<Button onClick={handleCreateActivity} className='flex items-center gap-2 mx-auto'>
									<span className='icon-[lucide--plus] size-4' />
									Criar primeira atividade
								</Button>
							)}
						</div>
					) : (
						<div className='space-y-8'>
							{Object.entries(activitiesByCategory).map(([category, activities]) => (
								<div key={category} className='space-y-4'>
									{/* Header da Categoria */}
									<div className='flex items-center gap-3'>
										<div className='flex items-center gap-2'>
											<span className='icon-[lucide--folder] size-5 text-zinc-500 dark:text-zinc-400' />
											<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>{category}</h3>
										</div>
										<div className='h-px bg-zinc-200 dark:bg-zinc-700 flex-1' />
										<span className='text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full'>
											{activities.length} atividade{activities.length !== 1 ? 's' : ''}
										</span>
									</div>

									{/* Grid de Atividades */}
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
										{activities.map((activity) => (
											<ActivityCard key={activity.id} activity={activity} onEdit={handleEditActivity} onStatusChange={handleStatusChange} />
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
