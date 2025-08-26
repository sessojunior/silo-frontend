import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { project, projectActivity, projectTask, authUser } from '@/lib/db/schema'
import { eq, gte, lte, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const dateRange = searchParams.get('dateRange') || '30d'
		const startDate = searchParams.get('startDate')
		const endDate = searchParams.get('endDate')

		// Calcular datas baseado no período
		let start: Date
		let end: Date = new Date()

		switch (dateRange) {
			case '7d':
				start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
				break
			case '90d':
				start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000)
				break
			case 'custom':
				if (startDate && endDate) {
					start = new Date(startDate)
					end = new Date(endDate)
				} else {
					start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
				}
				break
			default: // 30d
				start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
		}

		console.log('🔵 Buscando relatório de projetos:', { start, end, dateRange })

		// Buscar projetos no período
		const projectsInPeriod = await db
			.select({
				id: project.id,
				name: project.name,
				description: project.description,
				status: project.status,
				priority: project.priority,
				startDate: project.startDate,
				endDate: project.endDate,
				createdAt: project.createdAt,
			})
			.from(project)
			.where(
				and(
					gte(project.createdAt, start),
					lte(project.createdAt, end)
				)
			)

		// Buscar atividades dos projetos
		const activitiesInPeriod = await db
			.select({
				id: projectActivity.id,
				projectId: projectActivity.projectId,
				name: projectActivity.name,
				status: projectActivity.status,
				createdAt: projectActivity.createdAt,
			})
			.from(projectActivity)
			.where(
				and(
					gte(projectActivity.createdAt, start),
					lte(projectActivity.createdAt, end)
				)
			)

		// Buscar tarefas dos projetos
		const tasksInPeriod = await db
			.select({
				id: projectTask.id,
				projectId: projectTask.projectId,
				projectActivityId: projectTask.projectActivityId,
				name: projectTask.name,
				status: projectTask.status,
				priority: projectTask.priority,
				createdAt: projectTask.createdAt,
			})
			.from(projectTask)
			.where(
				and(
					gte(projectTask.createdAt, start),
					lte(projectTask.createdAt, end)
				)
			)

		// Buscar usuários ativos
		const activeUsers = await db
			.select({
				id: authUser.id,
				name: authUser.name,
				email: authUser.email,
			})
			.from(authUser)
			.where(eq(authUser.isActive, true))

		// Calcular métricas
		const totalProjects = projectsInPeriod.length
		const totalActivities = activitiesInPeriod.length
		const totalTasks = tasksInPeriod.length
		const activeUsersCount = activeUsers.length

		// Projetos por status
		const projectsByStatus = projectsInPeriod.reduce((acc, p) => {
			const status = p.status || 'unknown'
			acc[status] = (acc[status] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		// Projetos por prioridade
		const projectsByPriority = projectsInPeriod.reduce((acc, p) => {
			const priority = p.priority || 'unknown'
			acc[priority] = (acc[priority] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		// Tarefas por status
		const tasksByStatus = tasksInPeriod.reduce((acc, t) => {
			const status = t.status || 'unknown'
			acc[status] = (acc[status] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		// Projetos mais ativos (por número de atividades)
		const projectActivityCounts = activitiesInPeriod.reduce((acc, a) => {
			acc[a.projectId] = (acc[a.projectId] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		const mostActiveProjects = Object.entries(projectActivityCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([projectId, count]) => {
				const project = projectsInPeriod.find(p => p.id === projectId)
				return {
					projectId,
					name: project?.name || 'Projeto Desconhecido',
					activityCount: count,
				}
			})

		// Calcular progresso médio dos projetos
		const projectsWithProgress = projectsInPeriod.map(p => {
			const projectTasks = tasksInPeriod.filter(t => t.projectId === p.id)
			const completedTasks = projectTasks.filter(t => t.status === 'done').length
			const totalProjectTasks = projectTasks.length
			const progress = totalProjectTasks > 0 ? (completedTasks / totalProjectTasks) * 100 : 0

			return {
				id: p.id,
				name: p.name,
				progress: Math.round(progress),
				status: p.status,
				priority: p.priority,
			}
		})

		const avgProgress = projectsWithProgress.length > 0
			? projectsWithProgress.reduce((sum, p) => sum + p.progress, 0) / projectsWithProgress.length
			: 0

		const response = {
			summary: {
				totalProjects,
				totalActivities,
				totalTasks,
				activeUsers: activeUsersCount,
				avgProgress: Math.round(avgProgress),
			},
			projectsByStatus,
			projectsByPriority,
			tasksByStatus,
			mostActiveProjects,
			projectsWithProgress,
			period: {
				start: start.toISOString(),
				end: end.toISOString(),
				dateRange,
			},
		}

		console.log('✅ Relatório de projetos gerado:', {
			totalProjects,
			totalActivities,
			totalTasks,
			activeUsers: activeUsersCount,
			avgProgress: Math.round(avgProgress),
		})

		return NextResponse.json(response)
	} catch (error) {
		console.error('❌ Erro ao gerar relatório de projetos:', error)
		return NextResponse.json(
			{ error: 'Erro interno do servidor' },
			{ status: 500 }
		)
	}
}
