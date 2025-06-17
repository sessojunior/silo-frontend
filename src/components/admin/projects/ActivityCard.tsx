'use client'

import { Activity } from '@/types/projects'
import Button from '@/components/ui/Button'

interface ActivityCardProps {
	activity: Activity
	onEdit?: (activity: Activity) => void
	onStatusChange?: (activityId: string, newStatus: Activity['status']) => void
}

export default function ActivityCard({ activity, onEdit, onStatusChange }: ActivityCardProps) {
	// Função para status circle
	const getStatusStyles = (status: Activity['status']) => {
		const statusStyles = {
			todo: {
				circle: 'bg-zinc-200 dark:bg-zinc-700',
				text: 'text-zinc-600 dark:text-zinc-400',
				bg: 'bg-zinc-50 dark:bg-zinc-800',
				border: 'border-zinc-200 dark:border-zinc-700',
			},
			in_progress: {
				circle: 'bg-blue-500',
				text: 'text-blue-600 dark:text-blue-400',
				bg: 'bg-blue-50 dark:bg-blue-900/20',
				border: 'border-blue-200 dark:border-blue-700',
			},
			review: {
				circle: 'bg-yellow-500',
				text: 'text-yellow-600 dark:text-yellow-400',
				bg: 'bg-yellow-50 dark:bg-yellow-900/20',
				border: 'border-yellow-200 dark:border-yellow-700',
			},
			done: {
				circle: 'bg-green-500',
				text: 'text-green-600 dark:text-green-400',
				bg: 'bg-green-50 dark:bg-green-900/20',
				border: 'border-green-200 dark:border-green-700',
			},
			blocked: {
				circle: 'bg-red-500',
				text: 'text-red-600 dark:text-red-400',
				bg: 'bg-red-50 dark:bg-red-900/20',
				border: 'border-red-200 dark:border-red-700',
			},
		}

		return statusStyles[status]
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

		const priorityLabels = {
			low: 'Baixa',
			medium: 'Média',
			high: 'Alta',
			urgent: 'Urgente',
		}

		return (
			<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[priority]}`}>
				<span className={`icon-[lucide--${priorityIcons[priority]}] size-3`} />
				{priorityLabels[priority]}
			</span>
		)
	}

	// Função para formatar data
	const formatDate = (dateString: string | null) => {
		if (!dateString) return null
		return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
	}

	// Status options para quick actions
	const statusOptions: { value: Activity['status']; label: string; icon: string }[] = [
		{ value: 'todo', label: 'À fazer', icon: 'circle' },
		{ value: 'in_progress', label: 'Em progresso', icon: 'play-circle' },
		{ value: 'review', label: 'Em revisão', icon: 'eye' },
		{ value: 'done', label: 'Concluído', icon: 'check-circle' },
		{ value: 'blocked', label: 'Bloqueado', icon: 'x-circle' },
	]

	const styles = getStatusStyles(activity.status)

	return (
		<div className={`group relative bg-white dark:bg-zinc-900 rounded-lg border-2 ${styles.border} p-4 hover:shadow-md transition-all duration-200 cursor-pointer`}>
			{/* Header do Card */}
			<div className='flex items-start justify-between gap-3 mb-3'>
				{/* Status Circle + Nome */}
				<div className='flex items-start gap-3 min-w-0 flex-1'>
					<div className={`size-3 rounded-full ${styles.circle} mt-1.5 flex-shrink-0`} title={`Status: ${activity.status}`} />

					<div className='min-w-0 flex-1'>
						<h3 className='font-medium text-zinc-900 dark:text-zinc-100 leading-tight mb-1 line-clamp-2'>{activity.name}</h3>
						{activity.description && <p className='text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2'>{activity.description}</p>}
					</div>
				</div>

				{/* Actions - Aparecem no hover */}
				<div className='opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0'>
					{onEdit && (
						<Button onClick={() => onEdit(activity)} className='size-7 p-0 rounded-md bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20' title='Editar atividade'>
							<span className='icon-[lucide--edit] size-3.5 text-blue-600 dark:text-blue-400' />
						</Button>
					)}
				</div>
			</div>

			{/* Badges: Prioridade + Categoria */}
			<div className='flex flex-wrap items-center gap-2 mb-3'>
				{getPriorityBadge(activity.priority)}
				{activity.category && (
					<span className='inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium'>
						<span className='icon-[lucide--tag] size-3' />
						{activity.category}
					</span>
				)}
			</div>

			{/* Barra de Progresso */}
			<div className='mb-3'>
				<div className='flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1'>
					<span>Progresso</span>
					<span className='font-medium'>{activity.progress}%</span>
				</div>
				<div className='w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5'>
					<div className={`h-1.5 rounded-full transition-all duration-300 ${activity.status === 'done' ? 'bg-green-500' : activity.status === 'blocked' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${activity.progress}%` }} />
				</div>
			</div>

			{/* Assignees */}
			<div className='mb-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<div className='flex -space-x-2'>
							{activity.assignees.slice(0, 3).map((assignee) => (
								<div key={assignee.id} className='size-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white text-xs font-semibold' title={assignee.user.name}>
									{assignee.user.name.charAt(0).toUpperCase()}
								</div>
							))}
							{activity.assignees.length > 3 && <div className='size-6 bg-zinc-500 text-white rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-medium'>+{activity.assignees.length - 3}</div>}
						</div>
						{activity.assignees.length === 0 && <span className='text-xs text-zinc-400'>Não atribuída</span>}
					</div>

					{/* Quick Status Change */}
					{onStatusChange && (
						<div className='opacity-0 group-hover:opacity-100 transition-opacity'>
							<select value={activity.status} onChange={(e) => onStatusChange(activity.id, e.target.value as Activity['status'])} className='text-xs bg-transparent border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>

			{/* Footer: Datas */}
			{(activity.startDate || activity.endDate) && (
				<div className='flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700'>
					{activity.startDate && (
						<div className='flex items-center gap-1'>
							<span className='icon-[lucide--calendar] size-3' />
							<span>Início: {formatDate(activity.startDate)}</span>
						</div>
					)}
					{activity.endDate && (
						<div className='flex items-center gap-1'>
							<span className='icon-[lucide--flag] size-3' />
							<span>Fim: {formatDate(activity.endDate)}</span>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
