'use client'

import { useParams } from 'next/navigation'
import { Project } from '@/types/projects'
import Button from '@/components/ui/Button'
import ProductTabs from '@/components/admin/nav/ProductTabs'

interface ProjectDetailsHeaderProps {
	project: Project
	onEdit?: (project: Project) => void
}

export default function ProjectDetailsHeader({ project, onEdit }: ProjectDetailsHeaderProps) {
	const params = useParams()
	const projectId = params.id as string
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

	// Função para priority badge
	const getPriorityBadge = (priority: Project['priority']) => {
		const priorityStyles = {
			low: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
			medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
			high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
			urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		}

		const priorityLabels = {
			low: '⬇️ Baixa',
			medium: '➡️ Média',
			high: '⬆️ Alta',
			urgent: '🚨 Urgente',
		}

		return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityStyles[priority]}`}>{priorityLabels[priority]}</span>
	}

	// Função para formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Não definida'
		return new Date(dateString).toLocaleDateString('pt-BR')
	}

	// Abas de navegação
	const tabs = [
		{
			label: 'Quadro Principal',
			url: `/admin/projects/${projectId}`,
		},
		{
			label: 'Gantt',
			url: `/admin/projects/${projectId}/gantt`,
		},
		{
			label: 'Kanban',
			url: `/admin/projects/${projectId}/kanban`,
		},
	]

	return (
		<div className='bg-white dark:bg-zinc-900'>
			{/* Header Principal */}
			<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
				<div className='max-w-7xl mx-auto'>
					{/* Linha Principal */}
					<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
						{/* Informações do Projeto */}
						<div className='flex items-center gap-4 min-w-0 flex-1'>
							{/* Ícone do Projeto */}
							<div className='size-16 rounded-xl flex items-center justify-center flex-shrink-0' style={{ backgroundColor: `${project.color}20` }}>
								<span className={`icon-[lucide--${project.icon}] size-8`} style={{ color: project.color }} />
							</div>

							{/* Detalhes */}
							<div className='min-w-0 flex-1'>
								<div className='flex items-center gap-3 mb-2'>
									<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate'>{project.name}</h1>
									{getStatusBadge(project.status)}
									{getPriorityBadge(project.priority)}
								</div>
								{project.description && <p className='text-zinc-600 dark:text-zinc-400 text-lg mb-3'>{project.description}</p>}

								{/* Métricas Rápidas */}
								<div className='flex flex-wrap items-center gap-6 text-sm'>
									{/* Progresso */}
									<div className='flex items-center gap-2'>
										<span className='text-zinc-500 dark:text-zinc-400'>Progresso:</span>
										<div className='flex items-center gap-2'>
											<div className='w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2'>
												<div className='bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500' style={{ width: `${project.progress}%` }} />
											</div>
											<span className='font-medium text-zinc-900 dark:text-zinc-100'>{project.progress}%</span>
										</div>
									</div>

									{/* Membros */}
									<div className='flex items-center gap-2'>
										<span className='text-zinc-500 dark:text-zinc-400'>Membros:</span>
										<div className='flex items-center gap-1'>
											<div className='flex -space-x-2'>
												{project.members.slice(0, 3).map((member) => (
													<div key={member.id} className='size-6 bg-blue-100 dark:bg-blue-900/30 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center' title={member.user.name}>
														<span className='icon-[lucide--user] size-3 text-blue-600 dark:text-blue-400' />
													</div>
												))}
												{project.members.length > 3 && <div className='size-6 bg-zinc-500 text-white rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-medium'>+{project.members.length - 3}</div>}
											</div>
											<span className='font-medium text-zinc-900 dark:text-zinc-100 ml-1'>{project.members.length}</span>
										</div>
									</div>

									{/* Atividades */}
									<div className='flex items-center gap-2'>
										<span className='text-zinc-500 dark:text-zinc-400'>Atividades:</span>
										<span className='font-medium text-zinc-900 dark:text-zinc-100'>{project.activities.length}</span>
									</div>

									{/* Datas */}
									<div className='flex items-center gap-2'>
										<span className='text-zinc-500 dark:text-zinc-400'>Período:</span>
										<span className='font-medium text-zinc-900 dark:text-zinc-100'>
											{formatDate(project.startDate)} → {formatDate(project.endDate)}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Ações */}
						<div className='flex items-center gap-3 flex-shrink-0'>
							{onEdit && (
								<Button onClick={() => onEdit(project)} className='flex items-center gap-2'>
									<span className='icon-[lucide--edit] size-4' />
									<span className='hidden sm:inline'>Editar projeto</span>
								</Button>
							)}

							<Button className='flex items-center gap-2' style='bordered'>
								<span className='icon-[lucide--share] size-4' />
								<span className='hidden sm:inline'>Compartilhar</span>
							</Button>

							<Button className='flex items-center gap-2' style='bordered'>
								<span className='icon-[lucide--more-horizontal] size-4' />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Navegação por Abas */}
			<div className='border-b border-zinc-200 dark:border-zinc-700'>
				<div className='max-w-7xl mx-auto px-6'>
					<div className='flex w-full bg-zinc-100 py-3 transition dark:bg-zinc-700'>
						<ProductTabs tabs={tabs} />
					</div>
				</div>
			</div>
		</div>
	)
}
