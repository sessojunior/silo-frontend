'use client'

import { useState } from 'react'
import { Activity } from '@/types/projects'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface ActivityCardProps {
	activity: Activity
	projectId: string
	onEdit?: (activity: Activity) => void
}

export default function ActivityCard({ activity, projectId, onEdit }: ActivityCardProps) {
	const router = useRouter()
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)

	// Mock data para o plano de ação (normalmente viria do kanban)
	const actionPlan = [
		{
			id: '1',
			action: 'Configurar ambiente de desenvolvimento',
			responsible: { name: 'João Silva', avatar: null },
			startDate: '2024-01-15',
			endDate: '2024-01-20',
			resources: 'Servidor de desenvolvimento, IDE, Git',
			status: 85,
		},
		{
			id: '2',
			action: 'Implementar funcionalidade principal',
			responsible: { name: 'Maria Santos', avatar: null },
			startDate: '2024-01-21',
			endDate: '2024-02-10',
			resources: 'Framework, bibliotecas, documentação',
			status: 45,
		},
		{
			id: '3',
			action: 'Testes e validação',
			responsible: { name: 'Carlos Oliveira', avatar: null },
			startDate: '2024-02-11',
			endDate: '2024-02-20',
			resources: 'Ferramentas de teste, ambiente de staging',
			status: 10,
		},
	]

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
						<Button onClick={handleGoToKanban} className='px-4 py-2 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-0'>
							<span className='icon-[lucide--kanban-square] size-3.5' />
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
							<h4 className='text-lg font-semibold text-zinc-600 dark:text-zinc-100'>Plano de Ação</h4>

							{/* Objetivo */}
							{activity.description && (
								<div>
									<p className='text-base text-zinc-600 dark:text-zinc-300 leading-relaxed'>
										<span className='font-semibold text-zinc-600 dark:text-zinc-200'>Objetivo detalhado:</span> {activity.description}
									</p>
								</div>
							)}
						</div>

						<div className='overflow-x-auto'>
							<table className='w-full text-base'>
								<thead className='bg-zinc-50 dark:bg-zinc-800/50'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider'>Ação</th>
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
													<div className='size-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold'>{item.responsible.name.charAt(0).toUpperCase()}</div>
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
					</div>
				)}
			</div>
		</div>
	)
}
