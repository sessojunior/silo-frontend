'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { useParams, useRouter } from 'next/navigation'

import ActivityStatsCards from '@/components/admin/projects/ActivityStatsCards'
import ActivityMiniKanban from '@/components/admin/projects/ActivityMiniKanban'
import ProjectFormOffcanvas from '@/components/admin/projects/ProjectFormOffcanvas'
import ActivityFormOffcanvas from '@/components/admin/projects/ActivityFormOffcanvas'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

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

	// Estado para controlar dropdown expandido
	const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null)

	// Estado para contar tarefas do kanban por atividade
	const [kanbanTaskCounts, setKanbanTaskCounts] = useState<Record<string, number>>({})

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

			const response = await fetch(`/api/admin/projects/${projectId}/activities`)
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

		// Filtro de prioridade (removido)

		return filtered.sort((a, b) => a.name.localeCompare(b.name))
	}, [activities, search, statusFilter])

	function handleEditActivity(activity: ProjectActivity) {
		console.log('🔵 Abrindo formulário de edição da atividade:', activity.name)

		// A atividade já está no formato correto ProjectActivity
		setEditingActivity(activity)
		setActivityFormOpen(true)
	}

	// Formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Não definida'
		return new Date(dateString).toLocaleDateString('pt-BR')
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

				const response = await fetch(`/api/admin/projects/${projectId}/activities`, {
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

				const response = await fetch(`/api/admin/projects/${projectId}/activities`, {
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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async function handleActivityDelete(activityId: string) {
		if (!project) return

		try {
			console.log('🔵 Excluindo atividade:', activityId)

			const response = await fetch(`/api/admin/projects/${projectId}/activities?activityId=${activityId}`, {
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
			<div className='flex flex-1 h-full items-center justify-center w-full'>
				<div className='flex items-center justify-center gap-3'>
					<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
					<span className='text-zinc-600 dark:text-zinc-400'>Carregando projeto...</span>
				</div>
			</div>
		)
	}

	if (!project) return null

	// Função para carregar contagem de tarefas do kanban
	const loadKanbanTaskCount = async (activityId: string) => {
		if (kanbanTaskCounts[activityId] !== undefined) return // Já carregado

		try {
			console.log('🔍 [loadKanbanTaskCount] Carregando contagem para atividade:', activityId)
			console.log('🔍 [loadKanbanTaskCount] URL:', `/api/admin/projects/${projectId}/activities/${activityId}/tasks`)

			const response = await fetch(`/api/admin/projects/${projectId}/activities/${activityId}/tasks`)
			console.log('🔍 [loadKanbanTaskCount] Response status:', response.status)

			if (response.ok) {
				const data = await response.json()
				console.log('🔍 [loadKanbanTaskCount] Response data para atividade', activityId, ':', data)

				if (data.success && data.tasks) {
					// A API retorna tasks como objeto agrupado por status: { "todo": [...], "in_progress": [...] }
					// Precisamos somar todas as tarefas de todos os status
					let totalTasks = 0
					if (typeof data.tasks === 'object' && !Array.isArray(data.tasks)) {
						// Somar tarefas de todos os status
						for (const status in data.tasks) {
							if (Array.isArray(data.tasks[status])) {
								totalTasks += data.tasks[status].length
							}
						}
					} else if (Array.isArray(data.tasks)) {
						// Fallback se for array direto
						totalTasks = data.tasks.length
					}

					console.log('🔍 [loadKanbanTaskCount] ===== RESULTADO FINAL =====')
					console.log('🔍 [loadKanbanTaskCount] Tasks agrupadas por status:', Object.keys(data.tasks || {}))
					console.log('🔍 [loadKanbanTaskCount] Total de tarefas para atividade', activityId, ':', totalTasks)
					console.log('🔍 [loadKanbanTaskCount] ============================')
					setKanbanTaskCounts((prev) => ({ ...prev, [activityId]: totalTasks }))
				} else {
					console.log('🔍 [loadKanbanTaskCount] API retornou falha ou sem tarefas para atividade:', activityId)
					setKanbanTaskCounts((prev) => ({ ...prev, [activityId]: 0 }))
				}
			} else {
				console.error('🔍 [loadKanbanTaskCount] Response não OK para atividade:', activityId, 'Status:', response.status)
				setKanbanTaskCounts((prev) => ({ ...prev, [activityId]: 0 }))
			}
		} catch (error) {
			console.error('❌ [loadKanbanTaskCount] Erro ao carregar contagem de tarefas para atividade:', activityId, error)
			setKanbanTaskCounts((prev) => ({ ...prev, [activityId]: 0 }))
		}
	}

	// Função para controlar dropdown
	const toggleDropdown = (activityId: string) => {
		const isExpanding = expandedActivityId !== activityId
		setExpandedActivityId(isExpanding ? activityId : null)

		// Carregar contagem de tarefas quando expandir
		if (isExpanding) {
			loadKanbanTaskCount(activityId)
		}
	}

	// Funções para ícones e badges
	const getStatusIcon = (status: ProjectActivity['status']) => {
		const statusIcons = {
			todo: '⏳',
			progress: '🔵',
			done: '✅',
			blocked: '🔴',
		}
		const statusLabels = {
			todo: 'A fazer',
			progress: 'Em progresso',
			done: 'Concluído',
			blocked: 'Bloqueado',
		}
		return `${statusIcons[status]} ${statusLabels[status]}`
	}

	const getPriorityIcon = (priority: ProjectActivity['priority']) => {
		const priorityIcons = {
			low: '⬇️',
			medium: '➡️',
			high: '⬆️',
			urgent: '🚨',
		}
		const priorityLabels = {
			low: 'Baixa',
			medium: 'Média',
			high: 'Alta',
			urgent: 'Urgente',
		}
		return `${priorityIcons[priority]} ${priorityLabels[priority]}`
	}

	// Função para navegar ao Kanban
	const handleGoToKanban = (activityId: string) => {
		const kanbanUrl = `/admin/projects/${projectId}/activities/${activityId}`
		console.log('🔍 [handleGoToKanban] Navegando para:', {
			activityId,
			projectId,
			kanbanUrl,
		})
		router.push(kanbanUrl)
	}

	return (
		<>
			{/* Cabeçalho da Página */}
			<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
				<div>
					<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Atividades ({filteredActivities.length})</h1>
					<p className='text-zinc-600 dark:text-zinc-400 mt-1'>Lista de todas as atividades do projeto {project.name}</p>
				</div>
			</div>

			{/* Conteúdo da Página */}
			<div className='p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Ações e Filtros */}
					<div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
						<div className='flex flex-col sm:flex-row gap-3 flex-1'>
							{/* Busca */}
							<div className='relative flex-1 min-w-80 max-w-md'>
								<Input type='text' placeholder='Buscar atividades...' value={search} setValue={setSearch} className='pl-10' />
								<span className='icon-[lucide--search] absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4' />
							</div>

							{/* Filtro de Status */}
							<Select
								name='statusFilter'
								selected={statusFilter}
								onChange={(value) => setStatusFilter(value as 'all' | 'todo' | 'progress' | 'done' | 'blocked')}
								options={[
									{ value: 'all', label: 'Todos os status' },
									{ value: 'todo', label: 'Apenas a fazer' },
									{ value: 'progress', label: 'Apenas em progresso' },
									{ value: 'done', label: 'Apenas concluídas' },
									{ value: 'blocked', label: 'Apenas bloqueadas' },
								]}
								placeholder='Filtrar por status'
							/>
						</div>

						{/* Botão Criar */}
						<Button onClick={handleCreateActivity} className='flex items-center gap-2'>
							<span className='icon-[lucide--plus] size-4' />
							Nova atividade
						</Button>
					</div>

					{/* Estatísticas */}
					<ActivityStatsCards activities={activities} />

					{/* Lista de Atividades */}
					<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700'>
						<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
							<h2 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>Atividades ({filteredActivities.length})</h2>
							<p className='text-sm text-zinc-600 dark:text-zinc-400 mt-1'>Lista de todas as atividades do projeto {project.name}</p>
						</div>

						{/* Cabeçalho da Tabela */}
						<div className='bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700'>
							<div className='px-6 py-3'>
								<div className='flex items-center justify-between'>
									<div className='text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>Atividade</div>
									<div className='text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right'>Ações</div>
								</div>
							</div>
						</div>

						{activitiesLoading ? (
							<div className='flex items-center justify-center py-12'>
								<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
								<span className='ml-3 text-zinc-600 dark:text-zinc-400'>Carregando atividades...</span>
							</div>
						) : filteredActivities.length === 0 ? (
							<div className='text-center py-12'>
								<span className='icon-[lucide--clipboard-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
								<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>{search || statusFilter !== 'all' ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade criada ainda'}</h3>
								<p className='text-zinc-600 dark:text-zinc-400 mb-4'>{search || statusFilter !== 'all' ? 'Tente ajustar os filtros para encontrar atividades.' : 'Comece criando sua primeira atividade para organizar as tarefas.'}</p>
								{!search && statusFilter === 'all' && (
									<Button onClick={handleCreateActivity} className='flex items-center gap-2 mx-auto'>
										<span className='icon-[lucide--plus] size-4' />
										Criar primeira atividade
									</Button>
								)}
							</div>
						) : (
							<div className='divide-y divide-zinc-200 dark:divide-zinc-700'>
								{filteredActivities.map((activity) => (
									<div key={activity.id}>
										<div className='flex items-center justify-between'>
											<div className='flex items-center justify-center gap-4 py-6 px-4'>
												{/* Botão Dropdown */}
												<button onClick={() => toggleDropdown(activity.id)} className='size-10 rounded-full flex justify-center items-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors' title='Ver detalhes'>
													<span className={`icon-[lucide--chevron-down] size-4 text-zinc-600 dark:text-zinc-400 transition-transform ${expandedActivityId === activity.id ? 'rotate-180' : ''}`} />
												</button>
												{/* Conteúdo principal - título e descrição resumida */}
												<div>
													<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate'>{activity.name}</h3>
													{activity.description && <p className='text-zinc-600 dark:text-zinc-400 truncate text-sm'>{activity.description}</p>}
												</div>
											</div>

											{/* Container: Botões de ação */}
											<div className='px-6 flex items-center justify-center gap-2'>
												{/* Botões de ação - sempre visíveis */}
												<div className='flex items-center justify-center gap-2'>
													<button onClick={() => handleGoToKanban(activity.id)} className='size-10 flex items-center justify-center rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors' title='Abrir Kanban'>
														<span className='icon-[lucide--kanban-square] size-4 text-blue-600 dark:text-blue-400' />
													</button>
													<button onClick={() => handleEditActivity(activity)} className='size-10 flex items-center justify-center rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors' title='Editar atividade'>
														<span className='icon-[lucide--edit] size-4 text-green-600 dark:text-green-400' />
													</button>
												</div>
											</div>
										</div>

										{/* Linha expandida com detalhes */}
										{expandedActivityId === activity.id && (
											<>
												<div className='px-6 py-4 border-t border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 transition-opacity duration-700 ease-in-out animate-in fade-in'>
													<div className='flex flex-wrap items-center gap-6'>
														{/* Status */}
														<div className='flex items-center gap-2'>
															<span className='icon-[lucide--check-circle] size-4 text-zinc-400' />
															<span className='text-sm'>{getStatusIcon(activity.status)}</span>
														</div>

														{/* Prioridade */}
														<div className='flex items-center gap-2'>
															<span className='icon-[lucide--triangle-alert] size-4 text-zinc-400' />
															<span className='text-sm'>{getPriorityIcon(activity.priority)}</span>
														</div>

														{/* Período */}
														<div className='flex items-center gap-2'>
															<span className='icon-[lucide--calendar] size-4 text-zinc-400' />
															<div className='flex items-center gap-2 text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md'>
																{activity.startDate && <span className='text-zinc-700 dark:text-zinc-300 font-medium'>{formatDate(activity.startDate)}</span>}
																{activity.startDate && activity.endDate && <span className='text-zinc-400'>→</span>}
																{activity.endDate && <span className='text-zinc-700 dark:text-zinc-300 font-medium'>{formatDate(activity.endDate)}</span>}
																{!activity.startDate && !activity.endDate && <span className='text-zinc-400'>Não definido</span>}
															</div>
														</div>

														{/* Progresso */}
														<div className='flex items-center gap-2'>
															<span className='icon-[lucide--trending-up] size-4 text-zinc-400' />
															<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Progresso:</span>
															<div className='flex items-center gap-3'>
																<div className='w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2'>
																	<div className={`h-2 rounded-full transition-all duration-300 ${activity.status === 'done' ? 'bg-green-500' : activity.status === 'progress' ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${activity.status === 'done' ? 100 : activity.status === 'progress' ? 50 : 0}%` }} />
																</div>
																<span className='text-sm font-semibold text-zinc-800 dark:text-zinc-200'>{activity.status === 'done' ? 100 : activity.status === 'progress' ? 50 : 0}%</span>
															</div>
														</div>

														{/* Kanban */}
														<div className='flex items-center gap-2'>
															<span className='icon-[lucide--kanban-square] size-4 text-zinc-400' />
															<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Kanban:</span>
															{kanbanTaskCounts[activity.id] !== undefined ? (
																<div className='flex items-center gap-2'>
																	<div className='flex items-center gap-2 text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md'>
																		<span className='text-zinc-700 dark:text-zinc-300 font-medium'>
																			{kanbanTaskCounts[activity.id]} tarefa{kanbanTaskCounts[activity.id] !== 1 ? 's' : ''}
																		</span>
																	</div>
																	<Button onClick={() => handleGoToKanban(activity.id)} className='h-8 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5' title='Abrir Kanban da atividade'>
																		<span className='icon-[lucide--external-link] size-3' />
																		Abrir Kanban
																	</Button>
																</div>
															) : (
																<div className='flex items-center gap-2 text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md'>
																	<span className='icon-[lucide--loader-circle] size-3 animate-spin text-zinc-400' />
																	<span className='text-zinc-700 dark:text-zinc-300 font-medium'>Carregando...</span>
																</div>
															)}
														</div>
													</div>
												</div>

												{/* Mini Kanban */}
												<ActivityMiniKanban activityId={activity.id} projectId={projectId} />
											</>
										)}
									</div>
								))}
							</div>
						)}
					</div>
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
		</>
	)
}
