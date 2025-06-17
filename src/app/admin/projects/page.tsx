'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'

import Button from '@/components/ui/Button'
import ProjectStatsCards from '@/components/admin/projects/ProjectStatsCards'
import ProjectFormOffcanvas from '@/components/admin/projects/ProjectFormOffcanvas'
import ProjectDeleteDialog from '@/components/admin/projects/ProjectDeleteDialog'

import { Project } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

export default function ProjectsPage() {
	const router = useRouter()
	const [projects, setProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)

	// Estados para formulários e dialogs
	const [formOpen, setFormOpen] = useState(false)
	const [editingProject, setEditingProject] = useState<Project | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

	// Carregar projetos (simulando API com dados mock)
	useEffect(() => {
		fetchProjects()
	}, [])

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
			console.log('✅ Projeto excluído com sucesso')
		} catch (error) {
			console.error('❌ Erro ao excluir projeto:', error)
			throw error
		}
	}

	// Função para status badge
	const getStatusBadge = (status: Project['status']) => {
		const statusStyles = {
			active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
			completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
			paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
			cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		}

		const statusLabels = {
			active: '🟢 Ativo',
			completed: '🔵 Finalizado',
			paused: '🟡 Pausado',
			cancelled: '🔴 Cancelado',
		}

		return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>{statusLabels[status]}</span>
	}

	return (
		<>
			{/* Cabeçalho da Página de Projetos */}
			<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Projetos</h1>
						<p className='text-zinc-600 dark:text-zinc-400 mt-1'>Gerencie seus projetos e acompanhe o progresso</p>
					</div>
					<Button onClick={openCreateForm} className='flex items-center gap-2'>
						<span className='icon-[lucide--plus] size-4' />
						Novo projeto
					</Button>
				</div>
			</div>

			{/* Conteúdo da Página */}
			<div className='p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					<ProjectStatsCards projects={projects} />

					{/* Lista Simples de Projetos */}
					<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden'>
						{loading ? (
							<div className='flex items-center justify-center py-12'>
								<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
								<span className='ml-3 text-zinc-600 dark:text-zinc-400'>Carregando projetos...</span>
							</div>
						) : projects.length === 0 ? (
							<div className='text-center py-12'>
								<span className='icon-[lucide--folder-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
								<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>Nenhum projeto criado ainda</h3>
								<p className='text-zinc-600 dark:text-zinc-400 mb-4'>Comece criando seu primeiro projeto para organizar as atividades.</p>
								<Button onClick={openCreateForm} className='flex items-center gap-2 mx-auto'>
									<span className='icon-[lucide--plus] size-4' />
									Criar primeiro projeto
								</Button>
							</div>
						) : (
							<div className='divide-y divide-zinc-200 dark:divide-zinc-700'>
								{projects.map((project) => (
									<div key={project.id} className='p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group' onClick={() => handleProjectClick(project.id)}>
										<div className='flex items-center justify-between'>
											{/* Informações do Projeto */}
											<div className='flex items-center gap-4 min-w-0 flex-1'>
												{/* Ícone do Projeto */}
												<div className='size-12 rounded-lg flex items-center justify-center flex-shrink-0' style={{ backgroundColor: `${project.color}20` }}>
													<span className={`icon-[lucide--${project.icon}] size-6`} style={{ color: project.color }} />
												</div>

												{/* Detalhes */}
												<div className='min-w-0 flex-1'>
													<div className='flex items-center gap-3 mb-2'>
														<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate'>{project.name}</h3>
														{getStatusBadge(project.status)}
													</div>
													{project.description && <p className='text-zinc-600 dark:text-zinc-400 truncate'>{project.description}</p>}

													{/* Métricas simples */}
													<div className='flex items-center gap-6 mt-3 text-sm text-zinc-500 dark:text-zinc-400'>
														{/* Progresso */}
														<div className='flex items-center gap-2'>
															<span>Progresso:</span>
															<div className='flex items-center gap-2'>
																<div className='w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2'>
																	<div className='bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500' style={{ width: `${project.progress}%` }} />
																</div>
																<span className='font-medium text-zinc-900 dark:text-zinc-100'>{project.progress}%</span>
															</div>
														</div>

														{/* Membros */}
														<div className='flex items-center gap-2'>
															<span className='icon-[lucide--users] size-4' />
															<span>{project.members.length} membros</span>
														</div>

														{/* Atividades */}
														<div className='flex items-center gap-2'>
															<span className='icon-[lucide--check-square] size-4' />
															<span>{project.activities.length} atividades</span>
														</div>
													</div>
												</div>
											</div>

											{/* Botão Editar */}
											<div className='flex-shrink-0'>
												<Button onClick={(e) => openEditForm(project, e)} className='size-10 p-0 rounded-lg bg-transparent hover:bg-yellow-50 dark:hover:bg-yellow-900/20 opacity-0 group-hover:opacity-100 transition-opacity' title='Editar projeto'>
													<span className='icon-[lucide--edit] size-5 text-yellow-600 dark:text-yellow-400' />
												</Button>
											</div>
										</div>
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
		</>
	)
}
