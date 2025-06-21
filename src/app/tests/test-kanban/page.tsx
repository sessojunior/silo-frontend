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
}

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

// Initial data
const initialTasks: Task[] = [
	{
		id: 'task-1',
		project_id: 'proj-001',
		project_activity_id: 'act-001',
		name: 'Configurar ambiente de rede',
		description: 'Configurar a rede interna e externa do CPTEC',
		category: 'Infraestrutura',
		estimated_days: 10,
		status: 'todo',
		sort: 0,
		start_date: '2025-06-22',
		end_date: '2025-07-02',
		priority: 'high',
	},
	{
		id: 'task-2',
		project_id: 'proj-001',
		project_activity_id: 'act-002',
		name: 'Desenvolver API de autenticação',
		description: 'Implementar sistema de login e controle de acesso',
		category: 'Desenvolvimento',
		estimated_days: 5,
		status: 'todo',
		sort: 1,
		start_date: '2025-06-23',
		end_date: '2025-06-28',
		priority: 'urgent',
	},
	{
		id: 'task-3',
		project_id: 'proj-001',
		project_activity_id: 'act-003',
		name: 'Planejar arquitetura do sistema',
		description: 'Definir estrutura de microserviços e banco de dados',
		category: 'Planejamento',
		estimated_days: 3,
		status: 'in_progress',
		sort: 0,
		start_date: '2025-06-21',
		end_date: '2025-06-24',
		priority: 'medium',
	},
	{
		id: 'task-4',
		project_id: 'proj-001',
		project_activity_id: 'act-004',
		name: 'Implementar testes unitários',
		description: 'Criar suite de testes para validação do código',
		category: 'Desenvolvimento',
		estimated_days: 7,
		status: 'in_progress',
		sort: 1,
		start_date: '2025-06-25',
		end_date: '2025-07-02',
		priority: 'medium',
	},
	{
		id: 'task-5',
		project_id: 'proj-001',
		project_activity_id: 'act-005',
		name: 'Revisar documentação técnica',
		description: 'Validar e atualizar documentação do projeto',
		category: 'Planejamento',
		estimated_days: 2,
		status: 'review',
		sort: 0,
		start_date: '2025-06-20',
		end_date: '2025-06-22',
		priority: 'low',
	},
	{
		id: 'task-6',
		project_id: 'proj-001',
		project_activity_id: 'act-006',
		name: 'Deploy em produção',
		description: 'Realizar deploy da aplicação no ambiente de produção',
		category: 'Infraestrutura',
		estimated_days: 1,
		status: 'done',
		sort: 0,
		start_date: '2025-06-19',
		end_date: '2025-06-20',
		priority: 'high',
	},
	{
		id: 'task-7',
		project_id: 'proj-001',
		project_activity_id: 'act-007',
		name: 'Configurar monitoramento',
		description: 'Implementar sistema de logs e métricas',
		category: 'Infraestrutura',
		estimated_days: 4,
		status: 'blocked',
		sort: 0,
		start_date: '2025-06-26',
		end_date: '2025-06-30',
		priority: 'medium',
	},
]

const columns: Column[] = [
	{ id: 'todo', title: 'To Do', icon: 'icon-[lucide--circle]', color: 'bg-gray-100 border-gray-300' },
	{ id: 'in_progress', title: 'Em Progresso', icon: 'icon-[lucide--clock]', color: 'bg-blue-100 border-blue-300' },
	{ id: 'blocked', title: 'Bloqueado', icon: 'icon-[lucide--pause]', color: 'bg-red-100 border-red-300' },
	{ id: 'review', title: 'Revisão', icon: 'icon-[lucide--alert-circle]', color: 'bg-yellow-100 border-yellow-300' },
	{ id: 'done', title: 'Feito', icon: 'icon-[lucide--check-circle]', color: 'bg-green-100 border-green-300' },
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

// Sortable Task Card Component
function SortableTaskCard({ task }: { task: Task }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString('pt-BR')
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`bg-white rounded-lg shadow-sm border p-4 cursor-move hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}>
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

// Task Card for Drag Overlay
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

// Droppable Column Component
function DroppableColumn({ column, tasks }: { column: Column; tasks: Task[] }) {
	// Hook para tornar o contêiner droppable
	const { setNodeRef } = useDroppable({ id: column.id })

	const taskIds = tasks.map((task: Task) => task.id)

	return (
		// Ref apontando para o droppable
		<div ref={setNodeRef} className={`rounded-lg border-2 ${column.color} p-4 min-h-96`}>
			<div className='flex items-center space-x-2 mb-4'>
				<div className={`${column.icon} w-[18px] h-[18px] text-gray-600`} />
				<h2 className='font-semibold text-gray-900'>{column.title}</h2>
				<span className='bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full'>{tasks.length}</span>
			</div>

			<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
				<div className='space-y-3'>
					{tasks.map((task: Task) => (
						<SortableTaskCard key={task.id} task={task} />
					))}

					{tasks.length === 0 && (
						<div className='h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
							<span className='text-gray-500 text-sm'>Solte aqui</span>
						</div>
					)}
				</div>
			</SortableContext>
		</div>
	)
}

// Main Kanban Board Component
export default function KanbanBoard() {
	const [tasks, setTasks] = useState<Task[]>(initialTasks)
	const [activeTask, setActiveTask] = useState<Task | null>(null)
	const [isClient, setIsClient] = useState(false)

	// Resolver problema de hidratação do DnD Kit
	useEffect(() => {
		setIsClient(true)
	}, [])

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	)

	const getTasksByStatus = (status: TaskStatus) => tasks.filter((task) => task.status === status).sort((a, b) => a.sort - b.sort)

	const handleDragStart = (event: DragStartEvent) => {
		const task = tasks.find((t) => t.id === event.active.id)
		setActiveTask(task || null)
	}

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event
		if (!over) return

		const activeId = active.id as string
		const overId = over.id as string

		const activeTask = tasks.find((t) => t.id === activeId)
		const overTask = tasks.find((t) => t.id === overId)

		if (!activeTask) return

		// Se estiver sobre uma coluna
		if (columns.some((col) => col.id === overId)) {
			const newStatus = overId as TaskStatus
			if (activeTask.status === newStatus) return

			setTasks((prev) => prev.map((task) => (task.id === activeId ? { ...task, status: newStatus, sort: prev.filter((t) => t.status === newStatus).length } : task)))
			return
		}

		// Se estiver sobre outro task
		if (overTask && activeTask.status !== overTask.status) {
			setTasks((prev) => {
				const updatedTasks = prev.map((task) => (task.id === activeId ? { ...task, status: overTask.status, sort: overTask.sort } : task))

				const targetTasks = updatedTasks.filter((t) => t.status === overTask.status).sort((a, b) => a.sort - b.sort)

				return updatedTasks.map((task) => {
					if (task.status === overTask.status) {
						const index = targetTasks.findIndex((t) => t.id === task.id)
						return { ...task, sort: index }
					}
					return task
				})
			})
		}
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (!over) {
			setActiveTask(null)
			return
		}

		const activeId = active.id as string
		const overId = over.id as string
		const activeTask = tasks.find((t) => t.id === activeId)
		const overTask = tasks.find((t) => t.id === overId)

		if (!activeTask) {
			setActiveTask(null)
			return
		}

		// Caso solte diretamente sobre uma coluna (ex: coluna vazia)
		if (columns.some((col) => col.id === overId)) {
			const newStatus = overId as TaskStatus
			if (activeTask.status !== newStatus) {
				setTasks((prev) => {
					const updated = prev.map((task) => (task.id === activeId ? { ...task, status: newStatus, sort: prev.filter((t) => t.status === newStatus).length } : task))

					const targetTasks = updated.filter((t) => t.status === newStatus).sort((a, b) => a.sort - b.sort)
					return updated.map((task) => {
						if (task.status === newStatus) {
							const index = targetTasks.findIndex((t) => t.id === task.id)
							return { ...task, sort: index }
						}
						return task
					})
				})
			}
		}

		// Caso reordene dentro da mesma coluna
		else if (overTask && activeTask.status === overTask.status) {
			setTasks((prevTasks) => {
				const oldIndex = prevTasks.findIndex((t) => t.id === activeId)
				const newIndex = prevTasks.findIndex((t) => t.id === overId)

				const updatedTasks = [...prevTasks]
				const [removed] = updatedTasks.splice(oldIndex, 1)
				updatedTasks.splice(newIndex, 0, removed)

				const columnTasks = updatedTasks.filter((t) => t.status === activeTask.status)
				return updatedTasks.map((task) => {
					if (task.status === activeTask.status) {
						const index = columnTasks.findIndex((t) => t.id === task.id)
						return { ...task, sort: index }
					}
					return task
				})
			})
		}

		setActiveTask(null)
	}

	// Loading state para evitar problemas de hidratação
	if (!isClient) {
		return (
			<div className='p-6 bg-gray-50 min-h-screen'>
				<h1 className='text-2xl font-bold text-gray-900 mb-6'>Kanban Board</h1>
				<div className='grid grid-cols-5 gap-6'>
					{columns.map((column) => (
						<div key={column.id} className={`rounded-lg border-2 ${column.color} p-4 min-h-96`}>
							<div className='flex items-center space-x-2 mb-4'>
								<div className={`${column.icon} w-[18px] h-[18px] text-gray-600`} />
								<h2 className='font-semibold text-gray-900'>{column.title}</h2>
								<span className='bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full'>{getTasksByStatus(column.id).length}</span>
							</div>
							<div className='space-y-3'>
								{getTasksByStatus(column.id).map((task) => (
									<div key={task.id} className='bg-white rounded-lg shadow-sm border p-4'>
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
												<span>{new Date(task.start_date).toLocaleDateString('pt-BR')}</span>
											</div>
										</div>
									</div>
								))}
								{getTasksByStatus(column.id).length === 0 && (
									<div className='h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
										<span className='text-gray-500 text-sm'>Solte aqui</span>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className='p-6 bg-gray-50 min-h-screen'>
			<h1 className='text-2xl font-bold text-gray-900 mb-6'>Kanban Board</h1>

			<DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className='grid grid-cols-5 gap-6'>
					{columns.map((column) => (
						<DroppableColumn key={column.id} column={column} tasks={getTasksByStatus(column.id)} />
					))}
				</div>

				<DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
			</DndContext>
		</div>
	)
}
