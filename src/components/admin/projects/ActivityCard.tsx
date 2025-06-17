'use client'

import { Activity } from '@/types/projects'
import { useRouter } from 'next/navigation'

interface ActivityCardProps {
	activity: Activity
	projectId: string
	onEdit?: (activity: Activity) => void
}

export default function ActivityCard({ activity, projectId, onEdit }: ActivityCardProps) {
	const router = useRouter()

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
	const handleClick = () => {
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

	return (
		<div onClick={handleClick} className='group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer'>
			{/* Primeira linha: Nome e descrição da atividade */}
			<div className='flex items-start justify-between gap-4 border-b bg-gray-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6'>
				<div>
					<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>{activity.name}</h3>
					{activity.description && <p className='text-sm text-zinc-600 dark:text-zinc-400'>{activity.description}</p>}
				</div>

				{/* Botão de editar */}
				{onEdit && (
					<button onClick={handleEdit} className='flex items-center justify-center size-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20' title='Editar atividade'>
						<span className='icon-[lucide--edit] size-5 text-blue-600 dark:text-blue-400' />
					</button>
				)}
			</div>

			{/* Terceira linha: Todas as informações em uma linha */}
			<div className='flex items-center gap-6 flex-wrap px-6 py-4'>
				{/* Prioridade */}
				<div className='flex items-center gap-2'>{getPriorityBadge(activity.priority)}</div>

				{/* Barra de progresso */}
				<div className='flex items-center gap-3 min-w-32'>
					<span className='text-base font-medium text-zinc-700 dark:text-zinc-300'>Progresso:</span>
					<div className='flex items-center gap-2'>
						<div className='w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2'>
							<div className={`h-2 rounded-full transition-all duration-300 ${activity.status === 'done' ? 'bg-green-500' : activity.status === 'blocked' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${activity.progress}%` }} />
						</div>
						<span className='text-base font-semibold text-zinc-900 dark:text-zinc-100 min-w-10'>{activity.progress}%</span>
					</div>
				</div>

				{/* Usuários atribuídos */}
				<div className='flex items-center gap-2'>
					<span className='text-base font-medium text-zinc-700 dark:text-zinc-300'>Atribuído:</span>
					<div className='flex items-center gap-1'>
						{activity.assignees.length > 0 ? (
							<>
								<div className='flex -space-x-2'>
									{activity.assignees.slice(0, 3).map((assignee) => (
										<div key={assignee.id} className='size-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white text-base font-semibold' title={assignee.user.name}>
											{assignee.user.name.charAt(0).toUpperCase()}
										</div>
									))}
									{activity.assignees.length > 3 && <div className='size-10 bg-zinc-500 text-white rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-sm font-medium'>+{activity.assignees.length - 3}</div>}
								</div>
								<span className='ml-2 text-base font-medium text-zinc-900 dark:text-zinc-100'>{activity.assignees.length}</span>
							</>
						) : (
							<span className='text-base text-zinc-400'>Não atribuída</span>
						)}
					</div>
				</div>

				{/* Datas */}
				<div className='flex items-center gap-4 text-base'>
					{activity.startDate && (
						<div className='flex items-center gap-2'>
							<span className='icon-[lucide--calendar] size-4 text-zinc-500' />
							<span className='text-zinc-700 dark:text-zinc-300'>
								<strong>Início:</strong> {formatDate(activity.startDate)}
							</span>
						</div>
					)}
					{activity.endDate && (
						<div className='flex items-center gap-2'>
							<span className='icon-[lucide--flag] size-4 text-zinc-500' />
							<span className='text-zinc-700 dark:text-zinc-300'>
								<strong>Fim:</strong> {formatDate(activity.endDate)}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
