'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import { formatDateBR } from '@/lib/dateUtils'
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

// Tipo para dados do banco de dados
interface ProjectDB {
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

			const response = await fetch('/api/admin/projects')

			if (!response.ok) {
				throw new Error(`Erro HTTP: ${response.status}`)
			}

			const projectsData: ProjectDB[] = await response.json()

			// Converter dados do banco para formato da interface
			const formattedProjects: Project[] = projectsData.map((project) => ({
				id: project.id,
				name: project.name,
				shortDescription: project.shortDescription,
				description: project.description,
				status: project.status,
				priority: project.priority,
				startDate: project.startDate,
				endDate: project.endDate,
				// Campos padrão para compatibilidade com interface existente
				icon: 'folder',
				color: '#3b82f6',
				progress: Math.floor(Math.random() * 101), // Progresso aleatório por enquanto
				members: [], // Sem membros por enquanto
				activities: [], // Sem atividades por enquanto
				createdAt: new Date(project.createdAt).toISOString(),
				updatedAt: new Date(project.updatedAt).toISOString(),
			}))

			setProjects(formattedProjects)
			console.log('✅ Projetos carregados:', formattedProjects.length)
		} catch (error) {
			console.error('❌ Erro ao carregar projetos:', error)
			toast({
				type: 'error',
				title: 'Erro ao carregar projetos',
				description: 'Não foi possível carregar os projetos. Tente novamente.',
			})
		} finally {
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

				const response = await fetch('/api/admin/projects', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						id: editingProject.id,
						...projectData,
					}),
				})

				if (!response.ok) {
					throw new Error(`Erro HTTP: ${response.status}`)
				}

				const updatedProjectData: ProjectDB = await response.json()

				const updatedProject: Project = {
					...editingProject,
					name: updatedProjectData.name,
					shortDescription: updatedProjectData.shortDescription,
					description: updatedProjectData.description,
					status: updatedProjectData.status,
					priority: updatedProjectData.priority,
					startDate: updatedProjectData.startDate,
					endDate: updatedProjectData.endDate,
					updatedAt: new Date(updatedProjectData.updatedAt).toISOString(),
				}

				setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updatedProject : p)))
				console.log('✅ Projeto atualizado com sucesso')

				toast({
					type: 'success',
					title: 'Projeto atualizado',
					description: 'O projeto foi atualizado com sucesso.',
				})
			} else {
				// Criar novo projeto
				console.log('🔵 Criando novo projeto:', projectData)

				const response = await fetch('/api/admin/projects', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(projectData),
				})

				if (!response.ok) {
					throw new Error(`Erro HTTP: ${response.status}`)
				}

				const newProjectData: ProjectDB = await response.json()

				const newProject: Project = {
					id: newProjectData.id,
					name: newProjectData.name,
					shortDescription: newProjectData.shortDescription,
					description: newProjectData.description,
					status: newProjectData.status,
					priority: newProjectData.priority,
					startDate: newProjectData.startDate,
					endDate: newProjectData.endDate,
					icon: 'folder',
					color: '#3b82f6',
					progress: 0,
					members: [],
					activities: [],
					createdAt: new Date(newProjectData.createdAt).toISOString(),
					updatedAt: new Date(newProjectData.updatedAt).toISOString(),
				}

				setProjects((prev) => [newProject, ...prev])
				console.log('✅ Projeto criado com sucesso')

				toast({
					type: 'success',
					title: 'Projeto criado',
					description: 'O projeto foi criado com sucesso.',
				})
			}
		} catch (error) {
			console.error('❌ Erro ao salvar projeto:', error)
			toast({
				type: 'error',
				title: 'Erro ao salvar projeto',
				description: 'Não foi possível salvar o projeto. Tente novamente.',
			})
			throw error
		}
	}

	async function handleProjectDelete(projectId: string) {
		try {
			console.log('🔵 Excluindo projeto:', projectId)

			const response = await fetch(`/api/admin/projects?id=${projectId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error(`Erro HTTP: ${response.status}`)
			}

			setProjects((prev) => prev.filter((p) => p.id !== projectId))
			console.log('✅ Projeto excluído com sucesso')

			toast({
				type: 'success',
				title: 'Projeto excluído',
				description: 'O projeto foi excluído com sucesso.',
			})
		} catch (error) {
			console.error('❌ Erro ao excluir projeto:', error)
			toast({
				type: 'error',
				title: 'Erro ao excluir projeto',
				description: 'Não foi possível excluir o projeto. Tente novamente.',
			})
			throw error
		}
	}

	// Formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Não definida'
		return formatDateBR(dateString)
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
							<div className='relative flex-1 min-w-80 max-w-lg'>
								<Input type='text' placeholder='Buscar projetos...' value={search} setValue={setSearch} className='pr-10' />
								<span className='icon-[lucide--search] absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4' />
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

						{/* Cabeçalho da Tabela */}
						<div className='bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700'>
							<div className='px-6 py-3'>
								<div className='flex items-center justify-between'>
									<div className='text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>Projeto</div>
									<div className='text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right'>Ações</div>
								</div>
							</div>
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
													<button onClick={() => handleProjectClick(project.id)} className='size-10 flex items-center justify-center  rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors' title='Visualizar projeto'>
														<span className='icon-[lucide--eye] size-4 text-blue-600 dark:text-blue-400' />
													</button>
													<button onClick={(e) => openViewDescription(project, e)} className='size-10 flex items-center justify-center  rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors' title='Ver descrição completa'>
														<span className='icon-[lucide--file-text] size-4 text-purple-600 dark:text-purple-400' />
													</button>
													<button onClick={(e) => openEditForm(project, e)} className='size-10 flex items-center justify-center  rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors' title='Editar projeto'>
														<span className='icon-[lucide--edit] size-4 text-green-600 dark:text-green-400' />
													</button>
												</div>
											</div>
										</div>

										{/* Linha expandida com detalhes (Status, Prioridade, Datas) */}
										{expandedProjectId === project.id && (
											<div className='px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 transition-opacity duration-700 ease-in-out animate-in fade-in'>
												<div className='flex flex-wrap items-center gap-6'>
													{/* Status */}
													<div className='flex items-center gap-2'>
														<span className='icon-[lucide--check-circle] size-4 text-zinc-400' />
														<span className='text-sm'>{getStatusIcon(project.status)}</span>
													</div>

													{/* Prioridade */}
													<div className='flex items-center gap-2'>
														<span className='icon-[lucide--triangle-alert] size-4 text-zinc-400' />
														<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Prioridade:</span>
														<span className='text-sm'>{getPriorityIcon(project.priority)}</span>
													</div>

													{/* Usuários/Membros */}
													<div className='flex items-center gap-2'>
														<span className='icon-[lucide--users] size-4 text-zinc-400' />
														<div className='flex items-center gap-1.5'>
															{project.members.length > 0 ? (
																<>
																	<div className='flex -space-x-1.5'>
																		{project.members.slice(0, 3).map((member) => (
																			<div key={member.id} className='size-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white text-xs font-medium' title={member.user.name}>
																				{member.user.name.charAt(0).toUpperCase()}
																			</div>
																		))}
																		{project.members.length > 3 && <div className='size-8 bg-zinc-400 text-white rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-medium'>+{project.members.length - 3}</div>}
																	</div>
																	<span className='text-zinc-600 dark:text-zinc-300 text-sm font-medium ml-1'>
																		{project.members.length} {project.members.length === 1 ? 'pessoa' : 'pessoas'}
																	</span>
																</>
															) : (
																<span className='text-zinc-400 text-sm px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md'>Não atribuído</span>
															)}
														</div>
													</div>

													{/* Período */}
													<div className='flex items-center gap-2'>
														<span className='icon-[lucide--calendar] size-4 text-zinc-400' />
														<div className='flex items-center gap-2 text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md'>
															{project.startDate && <span className='text-zinc-700 dark:text-zinc-300 font-medium'>{formatDate(project.startDate)}</span>}
															{project.startDate && project.endDate && <span className='text-zinc-400'>→</span>}
															{project.endDate && <span className='text-zinc-700 dark:text-zinc-300 font-medium'>{formatDate(project.endDate)}</span>}
															{!project.startDate && !project.endDate && <span className='text-zinc-400'>Não definido</span>}
														</div>
													</div>

													{/* Progresso */}
													<div className='flex items-center gap-2'>
														<span className='icon-[lucide--trending-up] size-4 text-zinc-400' />
														<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Progresso:</span>
														<div className='flex items-center gap-3'>
															<div className='w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2'>
																<div className={`h-2 rounded-full transition-all duration-300 ${project.progress >= 100 ? 'bg-green-500' : project.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${project.progress}%` }} />
															</div>
															<span className='text-sm font-semibold text-zinc-800 dark:text-zinc-200'>{project.progress}%</span>
														</div>
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
