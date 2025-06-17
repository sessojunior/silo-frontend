'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ProjectStatsCards from '@/components/admin/projects/ProjectStatsCards'
import ProjectMainRow from '@/components/admin/projects/ProjectMainRow'
import ProjectActivitiesSection from '@/components/admin/projects/ProjectActivitiesSection'
import ProjectFormOffcanvas from '@/components/admin/projects/ProjectFormOffcanvas'
import ProjectDeleteDialog from '@/components/admin/projects/ProjectDeleteDialog'

import { Project, ProjectStatusFilter, ProjectPriorityFilter } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectsPage() {
	const router = useRouter()
	const [projects, setProjects] = useState<Project[]>([])
	const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all')
	const [priorityFilter, setPriorityFilter] = useState<ProjectPriorityFilter>('all')

	// Estados para expansão dos projetos
	const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

	// Estados para formulários e dialogs
	const [formOpen, setFormOpen] = useState(false)
	const [editingProject, setEditingProject] = useState<Project | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

	// Carregar projetos (simulando API com dados mock)
	useEffect(() => {
		fetchProjects()
	}, [])

	// Filtrar projetos
	useEffect(() => {
		let filtered = projects

		// Filtro de busca
		if (search) {
			filtered = filtered.filter((project) => project.name.toLowerCase().includes(search.toLowerCase()) || (project.description && project.description.toLowerCase().includes(search.toLowerCase())))
		}

		// Filtro de status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((project) => project.status === statusFilter)
		}

		// Filtro de prioridade
		if (priorityFilter !== 'all') {
			filtered = filtered.filter((project) => project.priority === priorityFilter)
		}

		setFilteredProjects(filtered)
	}, [projects, search, statusFilter, priorityFilter])

	async function fetchProjects() {
		try {
			setLoading(true)
			console.log('🔵 Carregando projetos...')

			// Simular carregamento da API
			setTimeout(() => {
				setProjects(mockProjects)
				console.log('✅ Projetos carregados:', mockProjects.length)
				setLoading(false)
			}, 1000)
		} catch (error) {
			console.error('❌ Erro inesperado ao carregar projetos:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao carregar projetos',
			})
			setLoading(false)
		}
	}

	function openCreateForm() {
		console.log('🔵 Abrindo formulário para novo projeto')
		setEditingProject(null)
		setFormOpen(true)
	}

	function openEditForm(project: Project) {
		console.log('🔵 Abrindo formulário de edição para:', project.name)
		setEditingProject(project)
		setFormOpen(true)
	}

	function openDeleteDialog(project: Project) {
		console.log('🔵 Abrindo dialog de exclusão para:', project.name)
		setProjectToDelete(project)
		setDeleteDialogOpen(true)
	}

	function closeForm() {
		setFormOpen(false)
		setEditingProject(null)
	}

	function closeDeleteDialog() {
		setDeleteDialogOpen(false)
		setProjectToDelete(null)
	}

	function handleViewDetails(projectId: string) {
		console.log('🔵 Redirecionando para detalhes do projeto:', projectId)
		// Navegar para a página de detalhes do projeto usando Next.js router
		router.push(`/admin/projects/${projectId}`)
	}

	function toggleProjectExpansion(projectId: string) {
		setExpandedProjects((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(projectId)) {
				newSet.delete(projectId)
				console.log('🔵 Colapsando projeto:', projectId)
			} else {
				newSet.add(projectId)
				console.log('🔵 Expandindo projeto:', projectId)
			}
			return newSet
		})
	}

	// Funções CRUD para projetos
	async function handleProjectSubmit(projectData: Omit<Project, 'id' | 'progress' | 'members' | 'activities' | 'createdAt' | 'updatedAt'>) {
		try {
			if (editingProject) {
				// Editar projeto existente
				console.log('🔵 Atualizando projeto:', editingProject.id, projectData)

				const updatedProject: Project = {
					...editingProject,
					...projectData,
					updatedAt: new Date().toISOString(),
				}

				setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updatedProject : p)))
				console.log('✅ Projeto atualizado com sucesso')
			} else {
				// Criar novo projeto
				console.log('🔵 Criando novo projeto:', projectData)

				const newProject: Project = {
					id: `proj-${Date.now()}`,
					...projectData,
					progress: 0,
					members: [],
					activities: [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}

				setProjects((prev) => [newProject, ...prev])
				console.log('✅ Projeto criado com sucesso')
			}
		} catch (error) {
			console.error('❌ Erro ao salvar projeto:', error)
			throw error
		}
	}

	async function handleProjectDelete(projectId: string) {
		try {
			console.log('🔵 Excluindo projeto:', projectId)

			setProjects((prev) => prev.filter((p) => p.id !== projectId))

			// Remover da lista de expandidos se estiver expandido
			setExpandedProjects((prev) => {
				const newSet = new Set(prev)
				newSet.delete(projectId)
				return newSet
			})

			console.log('✅ Projeto excluído com sucesso')
		} catch (error) {
			console.error('❌ Erro ao excluir projeto:', error)
			throw error
		}
	}

	return (
		<>
			<div className='max-w-7xl mx-auto space-y-6 p-6'>
				{/* Ações e Filtros */}
				<div className='flex flex-col gap-4'>
					{/* Linha superior: Busca e Botão */}
					<div className='flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center'>
						{/* Busca */}
						<div className='relative flex-1 max-w-md w-full sm:w-auto'>
							<Input type='text' placeholder='Buscar projetos...' value={search} setValue={setSearch} className='pl-10' />
							<span className='icon-[lucide--search] absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4' />
						</div>

						{/* Botão Criar */}
						<Button onClick={openCreateForm} className='flex items-center gap-2 w-full sm:w-auto'>
							<span className='icon-[lucide--plus] size-4' />
							Novo projeto
						</Button>
					</div>

					{/* Linha inferior: Filtros */}
					<div className='flex flex-col sm:flex-row gap-3'>
						{/* Filtro de Status */}
						<div className='flex-1 sm:flex-initial sm:min-w-48'>
							<Select
								name='statusFilter'
								selected={statusFilter}
								onChange={(value) => setStatusFilter(value as ProjectStatusFilter)}
								options={[
									{ value: 'all', label: 'Todos os status' },
									{ value: 'active', label: 'Projetos ativos' },
									{ value: 'completed', label: 'Finalizados' },
									{ value: 'paused', label: 'Pausados' },
									{ value: 'cancelled', label: 'Cancelados' },
								]}
								placeholder='Filtrar por status'
							/>
						</div>

						{/* Filtro de Prioridade */}
						<div className='flex-1 sm:flex-initial sm:min-w-48'>
							<Select
								name='priorityFilter'
								selected={priorityFilter}
								onChange={(value) => setPriorityFilter(value as ProjectPriorityFilter)}
								options={[
									{ value: 'all', label: 'Todas prioridades' },
									{ value: 'urgent', label: 'Urgente' },
									{ value: 'high', label: 'Alta' },
									{ value: 'medium', label: 'Média' },
									{ value: 'low', label: 'Baixa' },
								]}
								placeholder='Filtrar por prioridade'
							/>
						</div>
					</div>
				</div>

				{/* Cards de Estatísticas */}
				<ProjectStatsCards projects={projects} />

				{/* Lista Expansível de Projetos */}
				<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden'>
					{loading ? (
						<div className='flex items-center justify-center py-12'>
							<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
							<span className='ml-3 text-zinc-600 dark:text-zinc-400'>Carregando projetos...</span>
						</div>
					) : filteredProjects.length === 0 ? (
						<div className='text-center py-12'>
							<span className='icon-[lucide--folder-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
							<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>{search || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Nenhum projeto encontrado' : 'Nenhum projeto criado ainda'}</h3>
							<p className='text-zinc-600 dark:text-zinc-400 mb-4'>{search || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Tente ajustar os filtros para encontrar projetos.' : 'Comece criando seu primeiro projeto para organizar as atividades.'}</p>
							{!search && statusFilter === 'all' && priorityFilter === 'all' && (
								<Button onClick={openCreateForm} className='flex items-center gap-2 mx-auto'>
									<span className='icon-[lucide--plus] size-4' />
									Criar primeiro projeto
								</Button>
							)}
						</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='w-full min-w-[800px]'>
								<thead className='bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>Projeto</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>Status</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden sm:table-cell'>Prioridade</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>Progresso</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell'>Datas</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell'>Membros</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>Ações</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-zinc-200 dark:divide-zinc-700'>
									{filteredProjects.map((project) => (
										<React.Fragment key={project.id}>
											{/* Linha Principal do Projeto */}
											<ProjectMainRow project={project} isExpanded={expandedProjects.has(project.id)} onToggleExpansion={() => toggleProjectExpansion(project.id)} onEdit={openEditForm} onDelete={openDeleteDialog} onViewDetails={handleViewDetails} />

											{/* Seção de Atividades Expandida */}
											<ProjectActivitiesSection project={project} isExpanded={expandedProjects.has(project.id)} />
										</React.Fragment>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* Formulário de Projeto (Criar/Editar) */}
			<ProjectFormOffcanvas isOpen={formOpen} onClose={closeForm} project={editingProject} onSubmit={handleProjectSubmit} />

			{/* Dialog de Exclusão */}
			<ProjectDeleteDialog isOpen={deleteDialogOpen} onClose={closeDeleteDialog} project={projectToDelete} onConfirm={handleProjectDelete} />
		</>
	)
}
