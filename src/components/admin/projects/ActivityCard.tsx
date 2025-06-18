'use client'

import { useState } from 'react'
import { Activity } from '@/types/projects'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import ActivityDeleteDialog from '@/components/admin/projects/ActivityDeleteDialog'

interface ActivityCardProps {
	activity: Activity
	projectId: string
	onEdit?: (activity: Activity) => void
	onDelete?: (activityId: string) => Promise<void>
}

export default function ActivityCard({ activity, projectId, onEdit, onDelete }: ActivityCardProps) {
	const router = useRouter()
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

	// As tarefas virão do Kanban - aqui apenas mostramos placeholder
	const actionPlan: any[] = []

	// Calcular estatísticas das tarefas
	const totalTasks = actionPlan.length
	const completedTasks = actionPlan.filter((task) => task.status >= 100).length
	const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

	// Função para priority badge
	const getPriorityBadge = (priority: Activity['priority']) => {
		const priorityStyles = {
			low: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
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

		return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${priorityStyles[priority]}`}>{priorityLabels[priority]}</span>
	}

	// Função para formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Não definida'
		return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
	}

	// Função para navegar ao Kanban
	const handleGoToKanban = (e: React.MouseEvent) => {
		e.stopPropagation()
		console.log('🔵 Navegando para o Kanban do projeto:', projectId)
		router.push(`/admin/projects/${projectId}/kanban`)
	}

	// Função para editar (impede propagação)
	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (onEdit) {
			onEdit(activity)
		}
	}

	// Função para abrir dialog de exclusão
	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation()
		setDeleteDialogOpen(true)
	}

	// Função para confirmar exclusão
	const handleConfirmDelete = async (activityId: string) => {
		if (onDelete) {
			await onDelete(activityId)
		}
	}

	// Função para toggle dropdown
	const toggleDropdown = (e: React.MouseEvent) => {
		e.stopPropagation()
		setIsDropdownOpen(!isDropdownOpen)
	}

	// Componente mini donut para status
	const MiniDonut = ({ percentage }: { percentage: number }) => {
		const radius = 24
		const strokeWidth = 3
		const normalizedRadius = radius - strokeWidth * 2
		const circumference = normalizedRadius * 2 * Math.PI
		const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

		return (
			<div className='relative size-12 flex items-center justify-center'>
				<svg height={radius * 2} width={radius * 2} className='transform -rotate-90'>
					<circle stroke='#e4e7eb' fill='transparent' strokeWidth={strokeWidth} r={normalizedRadius} cx={radius} cy={radius} />
					<circle stroke={percentage >= 100 ? '#22c55e' : percentage >= 50 ? '#3b82f6' : '#f59e0b'} fill='transparent' strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinecap='round' r={normalizedRadius} cx={radius} cy={radius} />
				</svg>
				<span className='absolute size-12 inset-0 pb-0.5 flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-300'>{percentage}%</span>
			</div>
		)
	}

	return (
		<div className='group bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow duration-200'>
			{/* Header Principal */}
			<div className='p-6 pb-5'>
				<div className='flex justify-center items-center gap-4'>
					<div className='flex-1 min-w-0'>
						<h3 className='text-lg font-semibold text-zinc-600 dark:text-zinc-100 leading-tight'>{activity.name}</h3>
					</div>

					{/* Ações no header */}
					<div className='flex items-center flex-shrink-0'>
						{onEdit && (
							<button onClick={handleEdit} className='size-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200' title='Editar atividade'>
								<span className='icon-[lucide--edit] size-5 text-zinc-500' />
							</button>
						)}
						{onDelete && (
							<button onClick={handleDelete} className='size-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200' title='Excluir atividade'>
								<span className='icon-[lucide--trash-2] size-5 text-red-500' />
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Footer com progresso */}
			<div className='px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30'>
				<div className='flex items-center justify-between gap-4'>
					<div>
						{/* Meta informações em linha horizontal */}
						<div className='flex flex-wrap items-center gap-6 text-base'>
							{/* Prioridade */}
							<div className='flex items-center gap-2'>
								<span className='icon-[lucide--triangle-alert] size-5 text-zinc-400' />
								{getPriorityBadge(activity.priority)}
							</div>

							{/* Responsáveis */}
							<div className='flex items-center gap-2'>
								<span className='icon-[lucide--users] size-5 text-zinc-400' />
								<div className='flex items-center gap-1.5'>
									{activity.assignees.length > 0 ? (
										<>
											<div className='flex -space-x-1.5'>
												{activity.assignees.slice(0, 3).map((assignee) => (
													<div key={assignee.id} className='size-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white text-sm font-medium' title={assignee.user.name}>
														{assignee.user.name.charAt(0).toUpperCase()}
													</div>
												))}
												{activity.assignees.length > 3 && <div className='size-10 bg-zinc-400 text-white rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-sm font-medium'>+{activity.assignees.length - 3}</div>}
											</div>
											<span className='text-zinc-600 dark:text-zinc-300 text-sm font-medium ml-1'>
												{activity.assignees.length} {activity.assignees.length === 1 ? 'pessoa' : 'pessoas'}
											</span>
										</>
									) : (
										<span className='text-zinc-400 text-sm px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md'>Não atribuída</span>
									)}
								</div>
							</div>

							{/* Período */}
							<div className='flex items-center gap-2'>
								<span className='icon-[lucide--calendar] size-5 text-zinc-400' />
								<div className='flex items-center gap-2 text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md'>
									{activity.startDate && <span className='text-zinc-700 dark:text-zinc-300 font-medium'>{formatDate(activity.startDate)}</span>}
									{activity.startDate && activity.endDate && <span className='text-zinc-400'>→</span>}
									{activity.endDate && <span className='text-zinc-700 dark:text-zinc-300 font-medium'>{formatDate(activity.endDate)}</span>}
									{!activity.startDate && !activity.endDate && <span className='text-zinc-400'>Não definido</span>}
								</div>
							</div>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						{/* Progresso */}
						<div className='flex items-center gap-3 flex-1 min-w-0'>
							<div className='flex-1 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mt-1'>
								<div className={`h-1.5 rounded-full transition-all duration-300 ${activity.status === 'done' ? 'bg-green-500' : activity.status === 'blocked' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${completionPercentage}%` }} />
							</div>
							<div className='flex items-center gap-2 text-base text-zinc-600 dark:text-zinc-400'>
								<span className='text-zinc-800 dark:text-zinc-200 font-semibold'>
									{completedTasks}/{totalTasks} ({completionPercentage}%)
								</span>
							</div>
						</div>
						<Button onClick={handleGoToKanban} style='bordered' className='px-4 py-2'>
							<span className='icon-[lucide--kanban-square] size-4' />
							<span>Kanban</span>
						</Button>
						{/* Dropdown toggle */}
						<button onClick={toggleDropdown} className='flex items-center justify-center size-7 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200' title='Ver plano de ação'>
							<span className={`icon-[lucide--chevron-down] size-4 text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
						</button>
					</div>
				</div>

				{/* Dropdown expandido */}
				{isDropdownOpen && (
					<div className='mt-4 -mx-6 border-t border-zinc-200 dark:border-zinc-700'>
						<div className='flex flex-col items-start justify-between px-6 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700'>
							<h4 className='text-lg font-semibold text-zinc-600 dark:text-zinc-100'>Tarefas do Kanban</h4>

							{/* Objetivo */}
							{activity.description && (
								<div>
									<p className='text-base text-zinc-600 dark:text-zinc-300 leading-relaxed'>
										<span className='font-semibold text-zinc-600 dark:text-zinc-200'>Plano de ação:</span> {activity.description}
									</p>
								</div>
							)}
						</div>

						{actionPlan.length === 0 ? (
							/* Placeholder quando não há tarefas */
							<div className='py-12 text-center'>
								<span className='icon-[lucide--clipboard-x] size-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4 block' />
								<h4 className='text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2'>Nenhuma tarefa criada ainda</h4>
								<p className='text-zinc-600 dark:text-zinc-400 mb-6'>
									As tarefas são criadas e gerenciadas no quadro Kanban.
									<br />
									Vá para o Kanban para começar a organizar suas atividades.
								</p>
								<Button onClick={handleGoToKanban} style='bordered' className='flex items-center gap-2 mx-auto'>
									<span className='icon-[lucide--kanban-square] size-5' />
									Ir para o Kanban
								</Button>
							</div>
						) : (
							<div className='overflow-x-auto'>
								<table className='w-full text-base'>
									<thead className='bg-zinc-50 dark:bg-zinc-800/50'>
										<tr>
											<th className='px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider'>Ação (Tarefa)</th>
											<th className='px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider'>Responsável</th>
											<th className='px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider'>Início</th>
											<th className='px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider'>Término</th>
											<th className='px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider'>Recursos</th>
											<th className='px-4 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider'>Status</th>
										</tr>
									</thead>
									<tbody className='bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800'>
										{actionPlan.map((item) => (
											<tr key={item.id} className='hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-150'>
												<td className='px-6 py-4'>
													<div className='text-zinc-900 dark:text-zinc-100 font-medium leading-tight'>{item.action}</div>
												</td>
												<td className='px-4 py-4'>
													<div className='flex items-center gap-2.5'>
														<div className='size-8 shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white text-xs font-semibold'>{item.responsible.name.charAt(0).toUpperCase()}</div>
														<span className='text-zinc-800 dark:text-zinc-200 text-base font-medium'>{item.responsible.name}</span>
													</div>
												</td>
												<td className='px-4 py-4 text-zinc-600 dark:text-zinc-400 text-base'>{formatDate(item.startDate)}</td>
												<td className='px-4 py-4 text-zinc-600 dark:text-zinc-400 text-base'>{formatDate(item.endDate)}</td>
												<td className='px-4 py-4'>
													<div className='text-zinc-600 dark:text-zinc-400 text-base max-w-48 truncate' title={item.resources}>
														{item.resources}
													</div>
												</td>
												<td className='px-4 py-4'>
													<div className='flex justify-center'>
														<MiniDonut percentage={item.status} />
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Dialog de Exclusão */}
			<ActivityDeleteDialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				activity={
					activity
						? {
								id: activity.id,
								name: activity.name,
								description: activity.description,
							}
						: null
				}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	)
}
