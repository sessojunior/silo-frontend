'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'

import ProjectDetailsHeader from '@/components/admin/projects/ProjectDetailsHeader'

import { Project, Activity } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectGanttPage() {
	const params = useParams()
	const projectId = params.id as string
	const [project, setProject] = useState<Project | null>(null)
	const [loading, setLoading] = useState(true)
	const [timelineStart, setTimelineStart] = useState<Date>(new Date())
	const [timelineEnd, setTimelineEnd] = useState<Date>(new Date())
	const [zoomLevel, setZoomLevel] = useState<'days' | 'weeks' | 'months'>('weeks')

	// Carregar projeto
	useEffect(() => {
		if (projectId) {
			fetchProject()
		}
	}, [projectId])

	// Calcular intervalo da timeline
	useEffect(() => {
		if (project && project.activities.length > 0) {
			const dates = project.activities
				.flatMap((activity) => [activity.startDate, activity.endDate])
				.filter(Boolean)
				.map((date) => new Date(date!))

			if (dates.length > 0) {
				const earliest = new Date(Math.min(...dates.map((d) => d.getTime())))
				const latest = new Date(Math.max(...dates.map((d) => d.getTime())))

				// Adicionar margem
				const margin = zoomLevel === 'days' ? 7 : zoomLevel === 'weeks' ? 30 : 90
				earliest.setDate(earliest.getDate() - margin)
				latest.setDate(latest.getDate() + margin)

				setTimelineStart(earliest)
				setTimelineEnd(latest)
			} else {
				// Fallback para projeto sem datas
				const now = new Date()
				const start = new Date(now)
				start.setDate(now.getDate() - 30)
				const end = new Date(now)
				end.setDate(now.getDate() + 60)

				setTimelineStart(start)
				setTimelineEnd(end)
			}
		}
	}, [project, zoomLevel])

	async function fetchProject() {
		if (!projectId) return

		try {
			setLoading(true)
			console.log('🔵 Carregando projeto para Gantt:', projectId)

			// Simular API call
			setTimeout(() => {
				const foundProject = mockProjects.find((p) => p.id === projectId)
				if (!foundProject) {
					notFound()
					return
				}

				setProject(foundProject)
				console.log('✅ Projeto carregado para Gantt:', foundProject.name)
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
		if (!project) return []
		return project.activities
	}, [project])

	// Gerar colunas da timeline
	const timelineColumns = useMemo(() => {
		const columns: Date[] = []
		const current = new Date(timelineStart)

		while (current <= timelineEnd) {
			columns.push(new Date(current))

			if (zoomLevel === 'days') {
				current.setDate(current.getDate() + 1)
			} else if (zoomLevel === 'weeks') {
				current.setDate(current.getDate() + 7)
			} else {
				current.setMonth(current.getMonth() + 1)
			}
		}

		return columns
	}, [timelineStart, timelineEnd, zoomLevel])

	// Calcular posição e largura das barras no Gantt
	const calculateGanttBar = (activity: Activity) => {
		if (!activity.startDate || !activity.endDate) return null

		const start = new Date(activity.startDate)
		const end = new Date(activity.endDate)
		const totalDuration = timelineEnd.getTime() - timelineStart.getTime()

		const startOffset = ((start.getTime() - timelineStart.getTime()) / totalDuration) * 100
		const width = ((end.getTime() - start.getTime()) / totalDuration) * 100

		return {
			left: `${Math.max(0, startOffset)}%`,
			width: `${Math.max(1, width)}%`,
		}
	}

	// Formatadores de data
	const formatColumnHeader = (date: Date) => {
		if (zoomLevel === 'days') {
			return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
		} else if (zoomLevel === 'weeks') {
			return `Sem ${Math.ceil(date.getDate() / 7)} - ${date.toLocaleDateString('pt-BR', { month: 'short' })}`
		} else {
			return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
		}
	}

	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Não definida'
		return new Date(dateString).toLocaleDateString('pt-BR')
	}

	const calculateDuration = (activity: Activity) => {
		if (!activity.startDate || !activity.endDate) return 'N/A'
		const start = new Date(activity.startDate)
		const end = new Date(activity.endDate)
		const diffTime = Math.abs(end.getTime() - start.getTime())
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
		return `${diffDays} dia${diffDays !== 1 ? 's' : ''}`
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
					<span className='text-zinc-600 dark:text-zinc-400'>Carregando Gantt...</span>
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
					{/* Controles do Gantt */}
					<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4'>
						<div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between'>
							<div>
								<h2 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>Gantt do Projeto</h2>
								<p className='text-zinc-600 dark:text-zinc-400'>
									{filteredActivities.length} de {project.activities.length} atividade{project.activities.length !== 1 ? 's' : ''}
								</p>
							</div>

							{/* Controles de Zoom */}
							<div className='flex items-center gap-2'>
								<span className='text-sm text-zinc-500 dark:text-zinc-400'>Visualizar por:</span>
								<div className='flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1'>
									<button onClick={() => setZoomLevel('days')} className={`px-3 py-1 text-sm rounded-md transition-colors ${zoomLevel === 'days' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
										Dias
									</button>
									<button onClick={() => setZoomLevel('weeks')} className={`px-3 py-1 text-sm rounded-md transition-colors ${zoomLevel === 'weeks' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
										Semanas
									</button>
									<button onClick={() => setZoomLevel('months')} className={`px-3 py-1 text-sm rounded-md transition-colors ${zoomLevel === 'months' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
										Meses
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Diagrama de Gantt */}
					{filteredActivities.length === 0 ? (
						<div className='text-center py-12'>
							<span className='icon-[lucide--calendar-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
							<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>Nenhuma atividade para exibir</h3>
							<p className='text-zinc-600 dark:text-zinc-400'>Ajuste os filtros ou crie atividades com datas para visualizar o Gantt.</p>
						</div>
					) : (
						<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden'>
							{/* Layout Dual */}
							<div className='flex'>
								{/* Lista de Atividades (Esquerda) */}
								<div className='w-80 border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'>
									{/* Header */}
									<div className='p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-700'>
										<div className='grid grid-cols-4 gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase'>
											<div className='col-span-2'>Atividade</div>
											<div>Início</div>
											<div>Duração</div>
										</div>
									</div>

									{/* Lista */}
									<div className='max-h-96 overflow-y-auto'>
										{filteredActivities.map((activity) => (
											<div key={activity.id} className='p-4 border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors'>
												<div className='grid grid-cols-4 gap-2 text-sm'>
													{/* Nome + Status */}
													<div className='col-span-2'>
														<div className='flex items-center gap-2 mb-1'>
															<div className={`size-2 rounded-full ${activity.status === 'todo' ? 'bg-zinc-400' : activity.status === 'in_progress' ? 'bg-blue-500' : activity.status === 'review' ? 'bg-yellow-500' : activity.status === 'done' ? 'bg-green-500' : 'bg-red-500'}`} />
															<span className='font-medium text-zinc-900 dark:text-zinc-100 truncate'>{activity.name}</span>
														</div>
														{activity.category && <div className='text-xs text-zinc-500 dark:text-zinc-400 truncate'>{activity.category}</div>}
													</div>

													{/* Data de Início */}
													<div className='text-zinc-600 dark:text-zinc-400'>{formatDate(activity.startDate)}</div>

													{/* Duração */}
													<div className='text-zinc-600 dark:text-zinc-400'>{calculateDuration(activity)}</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Diagrama (Direita) */}
								<div className='flex-1 overflow-x-auto'>
									{/* Header da Timeline */}
									<div className='sticky top-0 bg-zinc-100 dark:bg-zinc-700 border-b border-zinc-200 dark:border-zinc-700 p-4'>
										<div className='flex gap-1 min-w-max'>
											{timelineColumns.map((date, index) => (
												<div key={index} className={`text-xs font-medium text-zinc-600 dark:text-zinc-400 text-center ${zoomLevel === 'days' ? 'w-8' : zoomLevel === 'weeks' ? 'w-16' : 'w-24'}`}>
													{formatColumnHeader(date)}
												</div>
											))}
										</div>
									</div>

									{/* Barras do Gantt */}
									<div className='p-4 space-y-1 min-w-max' style={{ minWidth: `${timelineColumns.length * (zoomLevel === 'days' ? 32 : zoomLevel === 'weeks' ? 64 : 96)}px` }}>
										{filteredActivities.map((activity) => {
											const barPosition = calculateGanttBar(activity)
											return (
												<div key={activity.id} className='relative h-12 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700'>
													{barPosition && (
														<div className='absolute top-1 bottom-1 rounded transition-all duration-200 hover:shadow-md group' style={{ left: barPosition.left, width: barPosition.width, backgroundColor: `${activity.status === 'done' ? '#10b981' : activity.status === 'blocked' ? '#ef4444' : activity.status === 'in_progress' ? '#3b82f6' : activity.status === 'review' ? '#f59e0b' : '#6b7280'}` }}>
															<div className='px-2 py-1 text-white text-xs font-medium truncate' title={activity.name}>
																{activity.name}
															</div>
															<div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10'>
																{activity.name} ({activity.progress}%)
															</div>
														</div>
													)}
												</div>
											)
										})}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
