'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { notFound, useParams } from 'next/navigation'

import Button from '@/components/ui/Button'
import ActivityFormOffcanvas from '@/components/admin/projects/ActivityFormOffcanvas'

import { Project, Activity } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectGanttPage() {
	const params = useParams()
	const projectId = params.id as string
	const [project, setProject] = useState<Project | null>(null)
	const [loading, setLoading] = useState(true)

	// Estados dos componentes
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

	function handleCreateActivity() {
		setEditingActivity(null)
		setActivityFormOpen(true)
	}

	async function handleActivitySubmit(activityData: { name: string; description: string; status: Activity['status']; priority: Activity['priority']; category: string; startDate: string; endDate: string; estimatedHours: string }) {
		try {
			console.log('🔵 Salvando atividade:', activityData)

			// Simular API call
			setTimeout(() => {
				if (editingActivity) {
					// Editar atividade existente
					const updatedActivities = project!.activities.map((activity) =>
						activity.id === editingActivity.id
							? {
									...activity,
									name: activityData.name,
									description: activityData.description,
									status: activityData.status,
									priority: activityData.priority,
									category: activityData.category,
									startDate: activityData.startDate,
									endDate: activityData.endDate,
									estimatedHours: parseInt(activityData.estimatedHours) || 0,
								}
							: activity,
					)

					setProject({
						...project!,
						activities: updatedActivities,
					})

					console.log('✅ Atividade editada com sucesso')
					toast({
						type: 'success',
						title: 'Atividade editada',
						description: 'Atividade editada com sucesso',
					})
				} else {
					// Criar nova atividade
					const newActivity: Activity = {
						id: `activity-${Date.now()}`,
						projectId: project!.id,
						name: activityData.name,
						description: activityData.description,
						status: activityData.status,
						priority: activityData.priority,
						category: activityData.category,
						startDate: activityData.startDate,
						endDate: activityData.endDate,
						estimatedHours: parseInt(activityData.estimatedHours) || 0,
						actualHours: null,
						progress: 0,
						assignees: [],
						labels: [],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					}

					setProject({
						...project!,
						activities: [...project!.activities, newActivity],
					})

					console.log('✅ Atividade criada com sucesso')
					toast({
						type: 'success',
						title: 'Atividade criada',
						description: 'Atividade criada com sucesso',
					})
				}

				closeActivityForm()
			}, 1000)
		} catch (error) {
			console.error('❌ Erro ao salvar atividade:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao salvar atividade',
			})
		}
	}

	function closeActivityForm() {
		setActivityFormOpen(false)
		setEditingActivity(null)
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center h-96'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-zinc-600 dark:text-zinc-400'>Carregando projeto...</p>
				</div>
			</div>
		)
	}

	if (!project) {
		return <div className='text-center py-8 text-zinc-600 dark:text-zinc-400'>Projeto não encontrado</div>
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700'>
				<div>
					<h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>Gráfico de Gantt da atividade</h2>
					<p className='text-sm text-zinc-600 dark:text-zinc-400 mt-1'>Visualização temporal das atividades com dependências</p>
				</div>
				<Button onClick={handleCreateActivity} className='bg-blue-600 hover:bg-blue-700'>
					Nova Atividade
				</Button>
			</div>

			{/* Placeholder Em Desenvolvimento */}
			<div className='bg-white dark:bg-zinc-900 rounded-lg overflow-hidden'>
				<div className='p-12 text-center'>
					<div className='text-zinc-400 mb-4'>
						<svg className='w-20 h-20 mx-auto' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' />
						</svg>
					</div>
					<h3 className='text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3'>Gráfico de Gantt</h3>
					<div className='inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg mb-4'>
						<span className='icon-[lucide--alert-triangle] size-5 mr-2'></span>
						<span className='font-medium'>Em desenvolvimento</span>
					</div>
					<p className='text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto'>O cronograma Gantt está sendo desenvolvido para fornecer uma visualização temporal completa das atividades do projeto com dependências, marcos e recursos.</p>
					<div className='text-sm text-zinc-500 dark:text-zinc-500'>
						<p className='mb-2'>
							🔄 <strong>Funcionalidades planejadas:</strong>
						</p>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-left max-w-lg mx-auto'>
							<p>📊 Barras de progresso temporais</p>
							<p>🔗 Dependências entre atividades</p>
							<p>🎯 Marcos e milestones</p>
							<p>👥 Alocação de recursos</p>
							<p>📅 Múltiplas visualizações</p>
							<p>⚡ Atualização em tempo real</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
