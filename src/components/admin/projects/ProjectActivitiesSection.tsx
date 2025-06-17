'use client'

import { useState, useEffect } from 'react'
import { Project, Activity } from '@/types/projects'
import Button from '@/components/ui/Button'

interface ProjectActivitiesSectionProps {
	project: Project
	isExpanded: boolean
}

export default function ProjectActivitiesSection({ project, isExpanded }: ProjectActivitiesSectionProps) {
	const [activities, setActivities] = useState<Activity[]>([])
	const [loading, setLoading] = useState(false)

	// Carregar atividades quando expandido
	useEffect(() => {
		if (isExpanded && project.id) {
			setLoading(true)
			// Simular carregamento das atividades (usando dados mock)
			setTimeout(() => {
				setActivities(project.activities)
				setLoading(false)
				console.log('✅ Atividades do projeto carregadas:', project.activities.length)
			}, 500)
		}
	}, [isExpanded, project.id, project.activities])

	// Função para status circle
	const getStatusCircle = (status: Activity['status']) => {
		const statusStyles = {
			todo: 'bg-zinc-200 dark:bg-zinc-700',
			in_progress: 'bg-blue-500',
			review: 'bg-yellow-500',
			done: 'bg-green-500',
			blocked: 'bg-red-500',
		}

		return <div className={`size-3 rounded-full ${statusStyles[status]}`} />
	}

	// Função para priority badge
	const getPriorityBadge = (priority: Activity['priority']) => {
		const priorityStyles = {
			low: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
			medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
			high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
			urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		}

		const priorityIcons = {
			low: 'arrow-down',
			medium: 'arrow-right',
			high: 'arrow-up',
			urgent: 'alert-circle',
		}

		return (
			<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[priority]}`}>
				<span className={`icon-[lucide--${priorityIcons[priority]}] size-3`} />
				{priority === 'low' ? 'Baixa' : priority === 'medium' ? 'Média' : priority === 'high' ? 'Alta' : 'Urgente'}
			</span>
		)
	}

	// Função para formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Não definida'
		return new Date(dateString).toLocaleDateString('pt-BR')
	}

	const handleViewDetails = () => {
		console.log('🔵 Redirecionando para detalhes do projeto:', project.id)
		// TODO: Implementar navegação para página de detalhes
	}

	const handleCreateActivity = () => {
		console.log('🔵 Abrindo formulário de nova atividade para projeto:', project.id)
		// TODO: Implementar modal/offcanvas de criação de atividade
	}

	if (!isExpanded) return null

	return (
		<tr>
			<td colSpan={7} className='p-0'>
				{/* Header da seção de atividades */}
				<div className='px-6 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700'>
					<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
						<div className='flex items-center gap-2 min-w-0'>
							<span className='icon-[lucide--check-square] size-4 text-zinc-600 dark:text-zinc-400' />
							<h4 className='font-medium text-zinc-900 dark:text-zinc-100 truncate'>Atividades do projeto {project.name}</h4>
							<span className='text-sm text-zinc-500 dark:text-zinc-400 flex-shrink-0'>
								({activities.length} {activities.length === 1 ? 'atividade' : 'atividades'})
							</span>
						</div>

						<div className='flex items-center gap-2 flex-shrink-0'>
							<Button onClick={handleViewDetails} className='flex items-center gap-2 text-sm px-3 py-1.5' style='bordered'>
								<span className='icon-[lucide--external-link] size-3.5' />
								<span className='hidden sm:inline'>Ver detalhes</span>
							</Button>

							<Button onClick={handleCreateActivity} className='flex items-center gap-2 text-sm px-3 py-1.5'>
								<span className='icon-[lucide--plus] size-3.5' />
								<span className='hidden sm:inline'>Nova atividade</span>
							</Button>
						</div>
					</div>
				</div>

				{/* Conteúdo das atividades */}
				<div className='p-4 bg-zinc-25 dark:bg-zinc-850'>
					{loading ? (
						<div className='flex items-center justify-center py-8'>
							<span className='icon-[lucide--loader-circle] size-5 animate-spin text-zinc-400' />
							<span className='ml-2 text-sm text-zinc-600 dark:text-zinc-400'>Carregando atividades...</span>
						</div>
					) : activities.length === 0 ? (
						<div className='text-center py-6'>
							<span className='icon-[lucide--clipboard-x] size-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2 block' />
							<p className='text-sm text-zinc-600 dark:text-zinc-400 mb-3'>Nenhuma atividade criada ainda para este projeto.</p>
							<Button onClick={handleCreateActivity} className='flex items-center gap-2 text-sm px-3 py-1.5 mx-auto' style='bordered'>
								<span className='icon-[lucide--plus] size-3.5' />
								Criar primeira atividade
							</Button>
						</div>
					) : (
						<div className='space-y-3'>
							{activities.map((activity) => (
								<div key={activity.id} className='flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-sm transition-shadow group'>
									{/* Status Circle */}
									<div className='flex-shrink-0' title={activity.status}>
										{getStatusCircle(activity.status)}
									</div>

									{/* Info Principal da Atividade */}
									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between gap-4'>
											{/* Lado Esquerdo: Nome e Info Básica */}
											<div className='flex-1 min-w-0'>
												<div className='font-medium text-zinc-900 dark:text-zinc-100 truncate'>{activity.name}</div>
												{activity.description && <div className='text-sm text-zinc-500 dark:text-zinc-400 truncate'>{activity.description}</div>}
												<div className='flex items-center gap-3 mt-2'>
													<div className='text-xs text-zinc-400'>{activity.category}</div>

													{/* Mobile: Progresso compacto */}
													<div className='flex items-center gap-2 sm:hidden'>
														<div className='w-12 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5'>
															<div className='bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-300' style={{ width: `${activity.progress}%` }} />
														</div>
														<span className='text-xs text-zinc-500 dark:text-zinc-400'>{activity.progress}%</span>
													</div>
												</div>
											</div>

											{/* Desktop: Info detalhada */}
											<div className='hidden sm:flex items-center gap-4'>
												{/* Avatares dos Usuários */}
												<div className='flex-shrink-0'>
													<div className='flex -space-x-2'>
														{activity.assignees.slice(0, 3).map((assignee) => (
															<div key={assignee.id} className='size-6 bg-blue-100 dark:bg-blue-900/30 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center' title={assignee.user.name}>
																<span className='icon-[lucide--user] size-3 text-blue-600 dark:text-blue-400' />
															</div>
														))}
														{activity.assignees.length > 3 && <div className='size-6 bg-zinc-500 text-white rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-medium'>+{activity.assignees.length - 3}</div>}
													</div>
													{activity.assignees.length === 0 && <span className='text-xs text-zinc-400'>Não atribuída</span>}
												</div>

												{/* Priority Badge */}
												<div className='flex-shrink-0'>{getPriorityBadge(activity.priority)}</div>

												{/* Barra de Progresso */}
												<div className='flex-shrink-0 w-20'>
													<div className='flex items-center gap-1'>
														<div className='w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5'>
															<div className='bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-300' style={{ width: `${activity.progress}%` }} />
														</div>
														<span className='text-xs text-zinc-500 dark:text-zinc-400 min-w-8'>{activity.progress}%</span>
													</div>
												</div>

												{/* Datas */}
												<div className='flex-shrink-0 text-right hidden lg:block'>
													<div className='text-xs text-zinc-500 dark:text-zinc-400'>
														{activity.startDate && <div>Início: {formatDate(activity.startDate)}</div>}
														{activity.endDate && <div>Fim: {formatDate(activity.endDate)}</div>}
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Ações sempre visíveis */}
									<div className='flex items-center gap-1 flex-shrink-0'>
										<Button className='size-8 p-0 rounded-md bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20' title='Editar atividade'>
											<span className='icon-[lucide--edit] size-4 text-blue-600 dark:text-blue-400' />
										</Button>
										<Button className='size-8 p-0 rounded-md bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20' title='Excluir atividade'>
											<span className='icon-[lucide--trash] size-4 text-red-600 dark:text-red-400' />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</td>
		</tr>
	)
}
