'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

import ProjectMemberAssignOffcanvas from '@/components/admin/projects/ProjectMemberAssignOffcanvas'
import ProjectSelectorDialog from '@/components/admin/projects/ProjectSelectorDialog'

import { ProjectMember, Project } from '@/types/projects'
import { mockProjects } from '@/lib/data/projects-mock'

// Extensão do ProjectMember com dados do projeto
interface ProjectMemberWithProject extends ProjectMember {
	project: {
		id: string
		name: string
		icon: string
		color: string
		status: string
	}
}

interface UserWithProjects {
	id: string
	name: string
	email: string
	avatar: string | null
	isActive: boolean
	projects: ProjectMemberWithProject[]
	totalProjects: number
}

// Filtros para membros
type MemberRoleFilter = 'all' | 'owner' | 'manager' | 'member'
type MemberStatusFilter = 'all' | 'active' | 'inactive'

export default function ProjectMembersPage() {
	const [users, setUsers] = useState<UserWithProjects[]>([])
	const [filteredUsers, setFilteredUsers] = useState<UserWithProjects[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [roleFilter, setRoleFilter] = useState<MemberRoleFilter>('all')
	const [statusFilter, setStatusFilter] = useState<MemberStatusFilter>('all')
	const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())

	// Estados do formulário de atribuição
	const [showProjectSelector, setShowProjectSelector] = useState(false)
	const [showAssignForm, setShowAssignForm] = useState(false)
	const [selectedProject, setSelectedProject] = useState<Project | null>(null)

	// Carregar dados dos membros (simulando API)
	useEffect(() => {
		fetchMembers()
	}, [])

	// Filtrar usuários
	useEffect(() => {
		let filtered = users

		// Filtro de busca
		if (search) {
			filtered = filtered.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()))
		}

		// Filtro de status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((user) => (statusFilter === 'active' ? user.isActive : !user.isActive))
		}

		// Filtro de papel nos projetos
		if (roleFilter !== 'all') {
			filtered = filtered.filter((user) => user.projects.some((project) => project.role === roleFilter))
		}

		setFilteredUsers(filtered)
	}, [users, search, roleFilter, statusFilter])

	async function fetchMembers() {
		try {
			setLoading(true)
			console.log('🔵 Carregando membros dos projetos...')

			// Simular carregamento da API
			setTimeout(() => {
				// Extrair usuários únicos de todos os projetos
				const userMap = new Map<string, UserWithProjects>()

				mockProjects.forEach((project) => {
					project.members.forEach((member) => {
						const userId = member.user.id
						if (!userMap.has(userId)) {
							userMap.set(userId, {
								id: userId,
								name: member.user.name,
								email: member.user.email,
								avatar: member.user.avatar,
								isActive: member.user.isActive,
								projects: [],
								totalProjects: 0,
							})
						}

						const user = userMap.get(userId)!
						const memberWithProject: ProjectMemberWithProject = {
							...member,
							project: {
								id: project.id,
								name: project.name,
								icon: project.icon,
								color: project.color,
								status: project.status,
							},
						}
						user.projects.push(memberWithProject)
						user.totalProjects = user.projects.length
					})
				})

				const usersData = Array.from(userMap.values())
				setUsers(usersData)
				console.log('✅ Membros carregados:', usersData.length)
				setLoading(false)
			}, 800)
		} catch (error) {
			console.error('❌ Erro inesperado ao carregar membros:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado',
				description: 'Erro ao carregar membros dos projetos',
			})
			setLoading(false)
		}
	}

	function openAssignForm() {
		console.log('🔵 Abrindo seletor de projetos')
		setShowProjectSelector(true)
	}

	function handleProjectSelection(project: Project) {
		console.log('🔵 Projeto selecionado:', project.name)
		setSelectedProject(project)
		setShowAssignForm(true)
	}

	function closeAssignForm() {
		setShowAssignForm(false)
		setSelectedProject(null)
	}

	function closeProjectSelector() {
		setShowProjectSelector(false)
	}

	async function handleMemberAssignment(assignmentData: { projectId: string; userId: string; role: ProjectMember['role'] }) {
		try {
			console.log('🔵 Processando atribuição:', assignmentData)

			// Simular API call
			await new Promise((resolve) => setTimeout(resolve, 1000))

			// Aqui seria a chamada real para a API
			// const response = await fetch('/api/projects/members', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(assignmentData)
			// })

			// Simular sucesso e recarregar dados
			await fetchMembers()

			console.log('✅ Membro atribuído com sucesso')
		} catch (error) {
			console.error('❌ Erro ao atribuir membro:', error)
			throw error // Re-throw para que o formulário possa tratar
		}
	}

	function toggleUserExpansion(userId: string) {
		setExpandedUsers((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(userId)) {
				newSet.delete(userId)
				console.log('🔵 Colapsando usuário:', userId)
			} else {
				newSet.add(userId)
				console.log('🔵 Expandindo usuário:', userId)
			}
			return newSet
		})
	}

	function removeUserFromProject(userId: string, projectId: string) {
		console.log('🔵 Removendo usuário', userId, 'do projeto', projectId)
		// TODO: Implementar remoção via API
		toast({
			type: 'info',
			title: 'Em desenvolvimento',
			description: 'Remoção de membros será implementada na próxima etapa',
		})
	}

	// Calcular estatísticas
	const stats = {
		totalMembers: users.length,
		activeMembers: users.filter((u) => u.isActive).length,
		totalAssignments: users.reduce((sum, u) => sum + u.totalProjects, 0),
		owners: users.filter((u) => u.projects.some((p) => p.role === 'owner')).length,
	}

	return (
		<>
			{/* Conteúdo da aba Membros */}
			<div className='p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Ações e Filtros */}
					<div className='flex flex-col gap-4'>
						{/* Linha superior: Busca e Botão */}
						<div className='flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center'>
							{/* Busca */}
							<div className='relative flex-1 max-w-md w-full sm:w-auto'>
								<Input type='text' placeholder='Buscar membros...' value={search} setValue={setSearch} className='pl-10' />
								<span className='icon-[lucide--search] absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4' />
							</div>

							{/* Botão Atribuir */}
							<Button onClick={openAssignForm} className='flex items-center gap-2 w-full sm:w-auto'>
								<span className='icon-[lucide--user-plus] size-4' />
								Atribuir membro
							</Button>
						</div>

						{/* Linha inferior: Filtros */}
						<div className='flex flex-col sm:flex-row gap-3'>
							{/* Filtro de Status */}
							<div className='flex-1 sm:flex-initial sm:min-w-48'>
								<Select
									name='statusFilter'
									selected={statusFilter}
									onChange={(value) => setStatusFilter(value as MemberStatusFilter)}
									options={[
										{ value: 'all', label: 'Todos os status' },
										{ value: 'active', label: 'Membros ativos' },
										{ value: 'inactive', label: 'Inativos' },
									]}
									placeholder='Filtrar por status'
								/>
							</div>

							{/* Filtro de Papel */}
							<div className='flex-1 sm:flex-initial sm:min-w-48'>
								<Select
									name='roleFilter'
									selected={roleFilter}
									onChange={(value) => setRoleFilter(value as MemberRoleFilter)}
									options={[
										{ value: 'all', label: 'Todos os papéis' },
										{ value: 'owner', label: 'Proprietários' },
										{ value: 'manager', label: 'Gerentes' },
										{ value: 'member', label: 'Membros' },
									]}
									placeholder='Filtrar por papel'
								/>
							</div>
						</div>
					</div>

					{/* Cards de Estatísticas */}
					<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
						<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6'>
							<div className='flex items-center'>
								<div className='flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20'>
									<span className='icon-[lucide--users] size-6 text-blue-600 dark:text-blue-400' />
								</div>
								<div className='ml-4'>
									<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Total Membros</p>
									<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.totalMembers}</p>
								</div>
							</div>
						</div>

						<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6'>
							<div className='flex items-center'>
								<div className='flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
									<span className='icon-[lucide--user-check] size-6 text-green-600 dark:text-green-400' />
								</div>
								<div className='ml-4'>
									<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Ativos</p>
									<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.activeMembers}</p>
								</div>
							</div>
						</div>

						<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6'>
							<div className='flex items-center'>
								<div className='flex size-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20'>
									<span className='icon-[lucide--briefcase] size-6 text-orange-600 dark:text-orange-400' />
								</div>
								<div className='ml-4'>
									<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Atribuições</p>
									<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.totalAssignments}</p>
								</div>
							</div>
						</div>

						<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6'>
							<div className='flex items-center'>
								<div className='flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'>
									<span className='icon-[lucide--crown] size-6 text-purple-600 dark:text-purple-400' />
								</div>
								<div className='ml-4'>
									<p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>Proprietários</p>
									<p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{stats.owners}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Lista de Membros */}
					<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden'>
						{loading ? (
							<div className='flex items-center justify-center py-12'>
								<span className='icon-[lucide--loader-circle] size-6 animate-spin text-zinc-400' />
								<span className='ml-3 text-zinc-600 dark:text-zinc-400'>Carregando membros...</span>
							</div>
						) : filteredUsers.length === 0 ? (
							<div className='text-center py-12'>
								<span className='icon-[lucide--user-x] size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
								<h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>{search || roleFilter !== 'all' || statusFilter !== 'all' ? 'Nenhum membro encontrado' : 'Nenhum membro atribuído ainda'}</h3>
								<p className='text-zinc-600 dark:text-zinc-400 mb-4'>{search || roleFilter !== 'all' || statusFilter !== 'all' ? 'Tente ajustar os filtros para encontrar membros.' : 'Comece atribuindo membros aos projetos.'}</p>
							</div>
						) : (
							<div className='divide-y divide-zinc-200 dark:divide-zinc-700'>
								{filteredUsers.map((user) => (
									<div key={user.id} className='p-6'>
										{/* Linha Principal do Usuário */}
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-4 flex-1'>
												{/* Avatar */}
												<div className='size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg'>{user.name.charAt(0).toUpperCase()}</div>

												{/* Informações do Usuário */}
												<div className='flex-1 min-w-0'>
													<div className='flex items-center gap-2'>
														<h3 className='font-medium text-zinc-900 dark:text-zinc-100 truncate'>{user.name}</h3>
														{user.isActive ? <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'>Ativo</span> : <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'>Inativo</span>}
													</div>
													<p className='text-sm text-zinc-500 dark:text-zinc-400 truncate'>{user.email}</p>
													<p className='text-sm text-zinc-500 dark:text-zinc-400'>
														{user.totalProjects} projeto{user.totalProjects !== 1 ? 's' : ''}
													</p>
												</div>
											</div>

											{/* Ações */}
											<div className='flex items-center gap-2'>
												<Button type='button' onClick={() => toggleUserExpansion(user.id)} style='bordered' className='size-8 p-0'>
													<span className={`icon-[lucide--chevron-${expandedUsers.has(user.id) ? 'up' : 'down'}] size-4`} />
												</Button>
												<Button type='button' onClick={openAssignForm} className='size-8 p-0'>
													<span className='icon-[lucide--plus] size-4' />
												</Button>
											</div>
										</div>

										{/* Projetos Expandidos */}
										{expandedUsers.has(user.id) && user.projects.length > 0 && (
											<div className='mt-4 pl-16'>
												<h4 className='text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3'>Projetos atribuídos:</h4>
												<div className='space-y-3'>
													{user.projects.map((projectMember) => (
														<div key={`${user.id}-${projectMember.project.id}`} className='flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3'>
															<div className='flex items-center gap-3'>
																{/* Ícone do Projeto */}
																<div className='size-8 rounded-lg flex items-center justify-center' style={{ backgroundColor: `${projectMember.project.color}20` }}>
																	<span className={`icon-[lucide--${projectMember.project.icon}] size-4`} style={{ color: projectMember.project.color }} />
																</div>

																{/* Info do Projeto */}
																<div>
																	<div className='flex items-center gap-2'>
																		<span className='font-medium text-zinc-900 dark:text-zinc-100 text-sm'>{projectMember.project.name}</span>
																		<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${projectMember.role === 'owner' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' : projectMember.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>{projectMember.role === 'owner' ? '👑 Proprietário' : projectMember.role === 'manager' ? '⚙️ Gerente' : '👤 Membro'}</span>
																	</div>
																	<p className='text-xs text-zinc-500 dark:text-zinc-400'>Desde {new Date(projectMember.joinedAt).toLocaleDateString('pt-BR')}</p>
																</div>
															</div>

															{/* Ação Remover */}
															<Button type='button' onClick={() => removeUserFromProject(user.id, projectMember.project.id)} style='bordered' className='size-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400'>
																<span className='icon-[lucide--x] size-4' />
															</Button>
														</div>
													))}
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

			{/* Seletor de Projeto */}
			<ProjectSelectorDialog isOpen={showProjectSelector} onClose={closeProjectSelector} projects={mockProjects} onSelectProject={handleProjectSelection} />

			{/* Formulário de Atribuição de Membros */}
			<ProjectMemberAssignOffcanvas isOpen={showAssignForm} onClose={closeAssignForm} project={selectedProject} onSubmit={handleMemberAssignment} />
		</>
	)
}
