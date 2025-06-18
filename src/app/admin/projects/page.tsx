'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import ReactMarkdown from 'react-markdown'
import { getMarkdownClasses } from '@/lib/markdown'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Offcanvas from '@/components/ui/Offcanvas'
import ProjectStatsCards from '@/components/admin/projects/ProjectStatsCards'
import ProjectFormOffcanvas from '@/components/admin/projects/ProjectFormOffcanvas'
import ProjectDeleteDialog from '@/components/admin/projects/ProjectDeleteDialog'

import { Project } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectsPage() {
	const router = useRouter()
	const [projects, setProjects] = useState<Project[]>([])
	const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused' | 'cancelled'>('all')

	// Estados para formulários e dialogs
	const [formOpen, setFormOpen] = useState(false)
	const [editingProject, setEditingProject] = useState<Project | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
	const [viewDescriptionProject, setViewDescriptionProject] = useState<Project | null>(null)

	// Estado para controlar qual projeto tem dropdown expandido
	const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)

	// Carregar projetos (simulando API com dados mock)
	useEffect(() => {
		fetchProjects()
	}, [])

	// Filtrar projetos
	useEffect(() => {
		let filtered = projects

		// Filtro de busca
		if (search) {
			filtered = filtered.filter((project) => project.name.toLowerCase().includes(search.toLowerCase()) || project.description.toLowerCase().includes(search.toLowerCase()))
		}

		// Filtro de status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((project) => project.status === statusFilter)
		}

		setFilteredProjects(filtered)
	}, [projects, search, statusFilter])

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

	function openEditForm(project: Project, event: React.MouseEvent) {
		event.stopPropagation() // Evitar abrir página de detalhes
		console.log('🔵 Abrindo formulário de edição para:', project.name)
		setEditingProject(project)
		setFormOpen(true)
	}

	function openDeleteDialog(project: Project) {
		console.log('🔵 Abrindo dialog de exclusão para:', project.name)
		setProjectToDelete(project)
		setDeleteDialogOpen(true)
	}

	function openViewDescription(project: Project, event: React.MouseEvent) {
		event.stopPropagation()
		console.log('🔵 Visualizando descrição completa de:', project.name)
		setViewDescriptionProject(project)
	}

	function closeForm() {
		setFormOpen(false)
		setEditingProject(null)
	}

	function closeDeleteDialog() {
		setDeleteDialogOpen(false)
		setProjectToDelete(null)
	}

	function handleProjectClick(projectId: string) {
		console.log('🔵 Redirecionando para detalhes do projeto:', projectId)
		router.push(`/admin/projects/${projectId}`)
	}

	// Funções CRUD para projetos
	async function handleProjectSubmit(projectData: { name: string; shortDescription: string; description: string; status: Project['status']; priority: Project['priority']; startDate: string; endDate: string }) {
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
					name: projectData.name,
					shortDescription: projectData.shortDescription,
					description: projectData.description,
					status: projectData.status,
					priority: projectData.priority,
					startDate: projectData.startDate,
					endDate: projectData.endDate,
					icon: 'folder', // Valor padrão já que removemos do formulário
					color: '#3b82f6', // Valor padrão já que removemos do formulário
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
			console.log('✅ Projeto excluído com sucesso')
		} catch (error) {
			console.error('❌ Erro ao excluir projeto:', error)
			throw error
		}
	}

	// Formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Não definida'
		return new Date(dateString).toLocaleDateString('pt-BR')
	}

	// Função para controlar dropdown
	const toggleDropdown = (projectId: string) => {
		setExpandedProjectId(expandedProjectId === projectId ? null : projectId)
	}

	// Funções para ícones dos detalhes
	const getStatusIcon = (status: Project['status']) => {
		const statusIcons = {
			active: '🟢',
			completed: '🔵',
			paused: '🟡',
			cancelled: '🔴',
		}
		const statusLabels = {
			active: 'Ativo',
			completed: 'Finalizado',
			paused: 'Pausado',
			cancelled: 'Cancelado',
		}
		return `${statusIcons[status]} ${statusLabels[status]}`
	}

	const getPriorityIcon = (priority: Project['priority']) => {
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

	return (
		<>
			{/* Cabeçalho da Página de Projetos */}
			<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
				<div>
					<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Projetos</h1>
					<p className='text-zinc-600 dark:text-zinc-400 mt-1'>Gerencie seus projetos e acompanhe o progresso</p>
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
								<Input type='text' placeholder='Buscar projetos...' value={search} setValue={setSearch} className='pl-10' />
								<span className='icon-[lucide--search] absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4' />
							</div>

							{/* Filtro de Status */}
							<Select
								name='statusFilter'
								selected={statusFilter}
								onChange={(value) => setStatusFilter(value as 'all' | 'active' | 'completed' | 'paused' | 'cancelled')}
								options={[
									{ value: 'all', label: 'Todos os status' },
									{ value: 'active', label: 'Apenas ativos' },
									{ value: 'completed', label: 'Apenas finalizados' },
									{ value: 'paused', label: 'Apenas pausados' },
									{ value: 'cancelled', label: 'Apenas cancelados' },
								]}
								placeholder='Filtrar por status'
							/>
						</div>

						{/* Botão Criar */}
						<Button onClick={openCreateForm} className='flex items-center gap-2'>
							<span className='icon-[lucide--plus] size-4' />
							Novo projeto
						</Button>
					</div>

					{/* Estatísticas */}
					<ProjectStatsCards projects={projects} />

					{/* Lista de Projetos */}
					<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700'>
						<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
							<h2 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>Projetos ({filteredProjects.length})</h2>
							<p className='text-sm text-zinc-600 dark:text-zinc-400 mt-1'>Lista de todos os projetos cadastrados no sistema</p>
						</div>

						{loading ? (
							<div className='flex items-center justify-center py-12'>
								<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
								<span className='ml-3 text-zinc-600 dark:text-zinc-400'>Carregando projetos...</span>
							</div>
						) : filteredProjects.length === 0 ? (
							<div className='text-center py-12'>
								<span className='icon-[lucide--folder-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
								<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>{search || statusFilter !== 'all' ? 'Nenhum projeto encontrado' : 'Nenhum projeto criado ainda'}</h3>
								<p className='text-zinc-600 dark:text-zinc-400 mb-4'>{search || statusFilter !== 'all' ? 'Tente ajustar os filtros para encontrar projetos.' : 'Comece criando seu primeiro projeto para organizar as atividades.'}</p>
								{!search && statusFilter === 'all' && (
									<Button onClick={openCreateForm} className='flex items-center gap-2 mx-auto'>
										<span className='icon-[lucide--plus] size-4' />
										Criar primeiro projeto
									</Button>
								)}
							</div>
						) : (
							<div className='divide-y divide-zinc-200 dark:divide-zinc-700'>
								{filteredProjects.map((project) => (
									<div key={project.id}>
										<div className='flex items-center justify-between'>
											<div className='flex items-center justify-center gap-4 py-6 px-4'>
												{/* Botão Dropdown */}
												<button onClick={() => toggleDropdown(project.id)} className='size-10 rounded-full flex justify-center items-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors' title='Ver detalhes'>
													<span className={`icon-[lucide--chevron-down] size-4 text-zinc-600 dark:text-zinc-400 transition-transform ${expandedProjectId === project.id ? 'rotate-180' : ''}`} />
												</button>
												{/* Conteúdo principal - título e descrição resumida */}
												<div>
													<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate'>{project.name}</h3>
													{project.shortDescription && <p className='text-zinc-600 dark:text-zinc-400 truncate text-sm'>{project.shortDescription}</p>}
												</div>
											</div>

											{/* Container: Botões de ação */}
											<div className='px-6 flex items-center justify-center gap-2'>
												{/* Botões de ação - sempre visíveis */}
												<div className='flex items-center justify-center gap-2'>
													<button onClick={() => handleProjectClick(project.id)} className='size-10 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors' title='Visualizar projeto'>
														<span className='icon-[lucide--eye] size-4 text-blue-600 dark:text-blue-400' />
													</button>
													<button onClick={(e) => openViewDescription(project, e)} className='size-10 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors' title='Ver descrição completa'>
														<span className='icon-[lucide--file-text] size-4 text-purple-600 dark:text-purple-400' />
													</button>
													<button onClick={(e) => openEditForm(project, e)} className='size-10 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors' title='Editar projeto'>
														<span className='icon-[lucide--edit] size-4 text-yellow-600 dark:text-yellow-400' />
													</button>
												</div>
											</div>
										</div>

										{/* Linha expandida com detalhes (Status, Prioridade, Datas) */}
										{expandedProjectId === project.id && (
											<div className='p-6 bg-zinc-100 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700'>
												<div className='flex flex-wrap items-center gap-4'>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Status:</span>
														<span className='text-sm'>{getStatusIcon(project.status)}</span>
													</div>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Prioridade:</span>
														<span className='text-sm'>{getPriorityIcon(project.priority)}</span>
													</div>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Início:</span>
														<span className='text-sm text-zinc-600 dark:text-zinc-400'>{formatDate(project.startDate)}</span>
													</div>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Fim:</span>
														<span className='text-sm text-zinc-600 dark:text-zinc-400'>{formatDate(project.endDate)}</span>
													</div>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Formulário de Projeto (Criar/Editar) */}
			<ProjectFormOffcanvas isOpen={formOpen} onClose={closeForm} project={editingProject} onSubmit={handleProjectSubmit} onDelete={openDeleteDialog} />

			{/* Dialog de Exclusão */}
			<ProjectDeleteDialog isOpen={deleteDialogOpen} onClose={closeDeleteDialog} project={projectToDelete} onConfirm={handleProjectDelete} />

			{/* Offcanvas de Visualização de Descrição */}
			<Offcanvas open={!!viewDescriptionProject} onClose={() => setViewDescriptionProject(null)} title={`Descrição: ${viewDescriptionProject?.name || ''}`} width='lg'>
				{viewDescriptionProject?.description?.trim() ? (
					<div className={getMarkdownClasses('base', 'text-zinc-800 dark:text-zinc-200')}>
						<ReactMarkdown>{viewDescriptionProject.description}</ReactMarkdown>
					</div>
				) : (
					<div className='text-center py-12'>
						<span className='icon-[lucide--file-text] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
						<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>Nenhuma descrição disponível</h3>
						<p className='text-zinc-500 italic'>Este projeto ainda não possui uma descrição detalhada.</p>
					</div>
				)}
			</Offcanvas>
		</>
	)
}
