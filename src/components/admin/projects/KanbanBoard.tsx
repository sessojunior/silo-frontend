'use client'

import React, { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, pointerWithin, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Types
interface Task {
	id: string
	project_id: string
	project_activity_id: string
	name: string
	description: string
	category: string
	estimated_days: number
	status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	sort: number
	start_date: string
	end_date: string
	priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface Column {
	id: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	title: string
	icon: string
	color: string
	textColor: string
	headerColor: string
}

interface KanbanBoardProps {
	tasks?: Task[]
	onTasksReorder?: (tasksBeforeMove: Task[], tasksAfterMove: Task[]) => void
}

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

const columns: Column[] = [
	{ id: 'todo', title: 'To Do', icon: 'icon-[lucide--circle]', color: 'bg-gray-100 border-gray-300', textColor: 'text-gray-400', headerColor: 'bg-gray-50' },
	{ id: 'in_progress', title: 'Em Progresso', icon: 'icon-[lucide--clock]', color: 'bg-blue-100 border-blue-300', textColor: 'text-blue-500', headerColor: 'bg-blue-50' },
	{ id: 'blocked', title: 'Bloqueado', icon: 'icon-[lucide--pause]', color: 'bg-red-100 border-red-300', textColor: 'text-red-500', headerColor: 'bg-red-50' },
	{ id: 'review', title: 'Revisão', icon: 'icon-[lucide--alert-circle]', color: 'bg-yellow-100 border-yellow-300', textColor: 'text-yellow-500', headerColor: 'bg-yellow-50' },
	{ id: 'done', title: 'Feito', icon: 'icon-[lucide--check-circle]', color: 'bg-green-100 border-green-300', textColor: 'text-green-500', headerColor: 'bg-green-50' },
]

const priorityColors: Record<TaskPriority, string> = {
	low: 'bg-green-500',
	medium: 'bg-yellow-500',
	high: 'bg-orange-500',
	urgent: 'bg-red-500',
}

const categoryColors: Record<string, string> = {
	Desenvolvimento: 'bg-blue-100 text-blue-800',
	Infraestrutura: 'bg-purple-100 text-purple-800',
	Planejamento: 'bg-gray-100 text-gray-800',
}

function SortableTaskCard({ task, activeTask }: { task: Task; activeTask: Task | null }) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: task.id,
		data: {
			type: 'Task',
			task: task,
		},
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	const isBeingDragged = activeTask?.id === task.id

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString('pt-BR')
	}

	const cardContent = (
		<>
			<div className='flex items-start justify-between mb-2'>
				<div className='flex items-center space-x-2'>
					<div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} />
					<span className={`text-xs px-2 py-1 rounded-full ${categoryColors[task.category] || 'bg-gray-100 text-gray-800'}`}>{task.category}</span>
				</div>
				<div className='icon-[lucide--grip-vertical] w-4 h-4 text-gray-400' />
			</div>
			<h3 className='font-medium text-gray-900 mb-1'>{task.name}</h3>
			<p className='text-sm text-gray-600 mb-3'>{task.description}</p>
			<div className='flex items-center justify-between text-xs text-gray-500'>
				<div className='flex items-center space-x-1'>
					<div className='icon-[lucide--clock] w-3 h-3' />
					<span>{task.estimated_days}d</span>
				</div>
				<div className='flex items-center space-x-1'>
					<div className='icon-[lucide--calendar] w-3 h-3' />
					<span>{formatDate(task.start_date)}</span>
				</div>
			</div>
		</>
	)

	if (isBeingDragged) {
		return (
			<div ref={setNodeRef} style={style} className='bg-white rounded-lg shadow-sm border p-4 opacity-50'>
				{cardContent}
			</div>
		)
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className='bg-white rounded-lg shadow-sm border p-4 cursor-move hover:shadow-md transition-shadow'>
			{cardContent}
		</div>
	)
}

function TaskCard({ task }: { task: Task }) {
	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString('pt-BR')
	}

	return (
		<div className='bg-white rounded-lg shadow-lg border p-4 rotate-3 transform'>
			<div className='flex items-start justify-between mb-2'>
				<div className='flex items-center space-x-2'>
					<div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} />
					<span className={`text-xs px-2 py-1 rounded-full ${categoryColors[task.category] || 'bg-gray-100 text-gray-800'}`}>{task.category}</span>
				</div>
				<div className='icon-[lucide--grip-vertical] w-4 h-4 text-gray-400' />
			</div>
			<h3 className='font-medium text-gray-900 mb-1'>{task.name}</h3>
			<p className='text-sm text-gray-600 mb-3'>{task.description}</p>
			<div className='flex items-center justify-between text-xs text-gray-500'>
				<div className='flex items-center space-x-1'>
					<div className='icon-[lucide--clock] w-3 h-3' />
					<span>{task.estimated_days}d</span>
				</div>
				<div className='flex items-center space-x-1'>
					<div className='icon-[lucide--calendar] w-3 h-3' />
					<span>{formatDate(task.start_date)}</span>
				</div>
			</div>
		</div>
	)
}

function DroppableColumn({ column, tasks, activeTask }: { column: Column; tasks: Task[]; activeTask: Task | null }) {
	const { setNodeRef } = useDroppable({ id: column.id })
	const taskIds = tasks.map((task: Task) => task.id)

	return (
		<div ref={setNodeRef} className={`w-72 flex flex-col rounded-xl border-2 ${column.color} shadow-md bg-white`}>
			{/* Cabeçalho da coluna */}
			<div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border-b ${column.headerColor}`}>
				<div className='flex items-center gap-2'>
					<span className={`${column.icon} w-5 h-5 ${column.textColor}`} />
					<span className='font-semibold text-base text-zinc-900'>{column.title}</span>
					<span className={`${column.color} flex items-center justify-center ${column.textColor} text-xs size-6 rounded-full`}>{tasks.length}</span>
				</div>
				<button
					className={`flex items-center justify-center size-8 rounded-full hover:bg-zinc-200 transition group`}
					title='Adicionar tarefa'
					onClick={() => {
						/* TODO: abrir modal de nova tarefa */
					}}
					type='button'
				>
					<span className={`icon-[lucide--plus] size-5 ${column.textColor}`} />
				</button>
			</div>
			{/* Lista de cards com scroll */}
			<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
				<div className='flex-1 px-3 py-3 space-y-3 overflow-y-auto'>
					{tasks.map((task: Task) => (
						<SortableTaskCard key={task.id} task={task} activeTask={activeTask} />
					))}
					{tasks.length === 0 && (
						<div className='h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-zinc-50'>
							<span className='text-gray-500 text-sm'>Solte aqui</span>
						</div>
					)}
				</div>
			</SortableContext>
		</div>
	)
}

export default function KanbanBoard({ tasks: externalTasks = [], onTasksReorder }: KanbanBoardProps) {
	const [tasks, setTasks] = useState<Task[]>(externalTasks)
	const [activeTask, setActiveTask] = useState<Task | null>(null)
	const [isClient, setIsClient] = useState(false)
	const [tasksBeforeMove, setTasksBeforeMove] = useState<Task[] | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		setIsClient(true)
	}, [])

	useEffect(() => {
		setTasks(externalTasks)
	}, [externalTasks])

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	)

	const getTasksByStatus = (status: TaskStatus) => tasks.filter((task) => task.status === status).sort((a, b) => a.sort - b.sort)

	const calculateNewPosition = (activeId: string, overId: string) => {
		const activeTask = tasks.find((t) => t.id === activeId)
		if (!activeTask) return null

		const isColumn = columns.some((col) => col.id === overId)
		const overTask = tasks.find((t) => t.id === overId)

		if (isColumn) {
			const newStatus = overId as TaskStatus
			const targetTasks = tasks.filter((t) => t.status === newStatus && t.id !== activeId)
			return { newStatus, targetIndex: targetTasks.length }
		}

		if (overTask) {
			const newStatus = overTask.status
			let targetTasks = tasks.filter((t) => t.status === newStatus && t.id !== activeId).sort((a, b) => a.sort - b.sort)
			if (activeTask.status === newStatus) {
				targetTasks = tasks.filter((t) => t.status === newStatus).sort((a, b) => a.sort - b.sort)
			}
			let targetIndex = targetTasks.findIndex((t) => t.id === overId)
			if (targetIndex === -1) {
				targetIndex = targetTasks.length
			}
			return { newStatus, targetIndex }
		}
		return null
	}

	const applyPositionChange = (activeId: string, newStatus: TaskStatus, targetIndex: number) => {
		const activeTask = tasks.find((t) => t.id === activeId)
		if (!activeTask) return
		const originalStatus = activeTask.status
		setTasks((prevTasks) => {
			let updatedTasks = [...prevTasks]
			updatedTasks = updatedTasks.map((task) => (task.id === activeId ? { ...task, status: newStatus } : task))
			const destinationTasks = updatedTasks.filter((t) => t.status === newStatus).sort((a, b) => a.sort - b.sort)
			const taskToMove = destinationTasks.find((t) => t.id === activeId)!
			const otherTasks = destinationTasks.filter((t) => t.id !== activeId)
			const finalOrder = [...otherTasks]
			finalOrder.splice(targetIndex, 0, taskToMove)
			updatedTasks = updatedTasks.map((task) => {
				if (task.status === newStatus) {
					const newIndex = finalOrder.findIndex((t) => t.id === task.id)
					return { ...task, sort: newIndex }
				}
				return task
			})
			if (originalStatus !== newStatus) {
				const originTasks = updatedTasks.filter((t) => t.status === originalStatus).sort((a, b) => a.sort - b.sort)
				updatedTasks = updatedTasks.map((task) => {
					if (task.status === originalStatus) {
						const newIndex = originTasks.findIndex((t) => t.id === task.id)
						return { ...task, sort: newIndex >= 0 ? newIndex : 0 }
					}
					return task
				})
			}
			return updatedTasks
		})
	}

	const handleDragStart = (event: DragStartEvent) => {
		if (isSaving) return
		const task = tasks.find((t) => t.id === event.active.id)
		setActiveTask(task || null)
		setTasksBeforeMove(tasks.map((t) => ({ ...t })))
		console.log('🟡 [KANBAN] Drag Start:', {
			taskId: event.active.id,
			snapshot: tasks.map((t) => ({ id: t.id, status: t.status, sort: t.sort })),
		})
	}

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event
		if (!over) return
		const activeId = active.id
		const overId = over.id
		if (activeId === overId) return
		const activeTask = tasks.find((t) => t.id === activeId)
		if (!activeTask) return
		const isOverATask = over.data.current?.type === 'Task'
		const isOverAColumn = columns.some((col) => col.id === overId)
		let newStatus: TaskStatus | undefined = undefined
		if (isOverAColumn) {
			newStatus = overId as TaskStatus
		} else if (isOverATask) {
			const overTask = tasks.find((t) => t.id === overId)
			if (overTask) newStatus = overTask.status
		}
		if (newStatus && activeTask.status !== newStatus) {
			setTasks((prevTasks) => {
				const activeIndex = prevTasks.findIndex((t) => t.id === activeId)
				if (activeIndex !== -1) {
					prevTasks[activeIndex].status = newStatus!
					return [...prevTasks]
				}
				return prevTasks
			})
		}
	}

	const handleDragEnd = async (event: DragEndEvent) => {
		if (isSaving) return
		setActiveTask(null)
		const { active, over } = event
		if (!over) {
			setTasksBeforeMove(null)
			setIsSaving(false)
			return
		}
		const activeId = active.id as string
		const overId = over.id as string
		const position = calculateNewPosition(activeId, overId)
		if (!position) {
			setTasksBeforeMove(null)
			setIsSaving(false)
			return
		}
		applyPositionChange(activeId, position.newStatus, position.targetIndex)
		// Checagem: só envia PATCH se houve mudança real de status ou ordem
		const after = tasks.map((t) => ({ ...t }))
		const before = tasksBeforeMove
		const houveMudanca =
			before &&
			after.some((t, idx) => {
				const b = before[idx]
				return !b || b.id !== t.id || b.status !== t.status || b.sort !== t.sort
			})
		if (!houveMudanca) {
			setTasksBeforeMove(null)
			setIsSaving(false)
			return
		}
		console.log('🟠 [KANBAN] Enviando PATCH para backend', {
			tasksBeforeMove: tasksBeforeMove.map((t) => ({ id: t.id, status: t.status, sort: t.sort })),
			tasksAfterMove: tasks.map((t) => ({ id: t.id, status: t.status, sort: t.sort })),
		})
		if (onTasksReorder && tasksBeforeMove) {
			setIsSaving(true)
			setTimeout(async () => {
				console.log('🟠 [KANBAN] Enviando PATCH para backend', {
					tasksBeforeMove: tasksBeforeMove.map((t) => ({ id: t.id, status: t.status, sort: t.sort })),
					tasksAfterMove: tasks.map((t) => ({ id: t.id, status: t.status, sort: t.sort })),
				})
				await onTasksReorder(
					tasksBeforeMove,
					tasks.map((t) => ({ ...t })),
				)
				setTasksBeforeMove(null)
				setIsSaving(false)
			}, 0)
		}
	}

	if (!isClient) {
		return (
			<div className='p-6 bg-gray-50 min-h-screen'>
				<h1 className='text-2xl font-bold text-gray-900 mb-6'>Carregando Kanban...</h1>
			</div>
		)
	}

	return (
		<div className='flex-1 bg-zinc-50 dark:bg-zinc-900'>
			<div className='min-w-max h-full p-6 relative'>
				<DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
					<div className='flex gap-6 items-start overflow-x-auto'>
						{columns.map((column) => (
							<DroppableColumn key={column.id} column={column} tasks={getTasksByStatus(column.id)} activeTask={activeTask} />
						))}
					</div>
					<DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
				</DndContext>
				{isSaving && (
					<div className='absolute inset-0 bg-white/60 dark:bg-zinc-900/60 flex items-center justify-center z-50 pointer-events-auto'>
						<div className='flex flex-col items-center gap-2'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
							<span className='text-zinc-700 dark:text-zinc-200 text-sm'>Salvando movimentação...</span>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
