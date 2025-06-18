// Interfaces para o Sistema de Projetos - Silo
// Relacionamento many-to-many entre usuários e projetos

export interface Project {
	id: string
	name: string
	shortDescription: string
	description: string
	icon: string // Ícone Lucide (ex: 'folder', 'rocket', 'target')
	color: string // Cor hex (ex: '#3b82f6', '#10b981')
	status: 'active' | 'completed' | 'paused' | 'cancelled'
	priority: 'low' | 'medium' | 'high' | 'urgent'
	progress: number // 0-100 (calculado automaticamente das atividades)
	startDate: string | null
	endDate: string | null
	createdAt: string
	updatedAt: string

	// Relacionamentos
	members: ProjectMember[] // Usuários atribuídos ao projeto
	activities: Activity[] // Atividades do projeto
}

export interface ProjectMember {
	id: string
	projectId: string
	userId: string
	role: 'owner' | 'manager' | 'member' | 'viewer'
	joinedAt: string

	// Dados do usuário (populated)
	user: {
		id: string
		name: string
		email: string
		avatar: string | null
		isActive: boolean
	}
}

export interface Activity {
	id: string
	projectId: string
	name: string
	description: string
	status: 'todo' | 'todo_doing' | 'todo_done' | 'in_progress' | 'in_progress_doing' | 'in_progress_done' | 'review' | 'review_doing' | 'review_done' | 'done' | 'blocked'
	priority: 'low' | 'medium' | 'high' | 'urgent'
	progress: number // 0-100
	category: string // Sprint, Backlog, etc.
	startDate: string | null
	endDate: string | null
	estimatedHours: number | null
	actualHours: number | null

	// Relacionamentos
	assignees: ActivityAssignee[] // Usuários atribuídos à atividade
	labels: string[] // Tags/categorias

	createdAt: string
	updatedAt: string
}

export interface ActivityAssignee {
	id: string
	activityId: string
	userId: string
	assignedAt: string

	// Dados do usuário (populated)
	user: {
		id: string
		name: string
		email: string
		avatar: string | null
		isActive: boolean
	}
}

// Interface para estatísticas
export interface ProjectStats {
	total: number
	active: number
	completed: number
	paused: number
	cancelled: number
	avgProgress: number
}

// Tipos para filtros
export type ProjectStatusFilter = 'all' | 'active' | 'completed' | 'paused' | 'cancelled'
export type ProjectPriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'urgent'
