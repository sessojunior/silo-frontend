import { db } from './index'
import * as schema from './schema'
import { eq } from 'drizzle-orm'

/**
 * Função para sincronizar o status de uma atividade baseado no progresso das tarefas
 * @param activityId ID da atividade
 * @returns Novo status calculado
 */
export async function syncActivityStatus(activityId: string): Promise<'todo' | 'progress' | 'done' | 'blocked'> {
	try {
		console.log('🔄 [syncActivityStatus] Sincronizando status da atividade:', activityId)

		// Buscar todas as tarefas da atividade
		const tasks = await db.select().from(schema.projectTask).where(eq(schema.projectTask.projectActivityId, activityId))

		if (tasks.length === 0) {
			console.log('📝 [syncActivityStatus] Nenhuma tarefa encontrada, mantendo status atual')
			return 'todo'
		}

		// Calcular estatísticas das tarefas
		const totalTasks = tasks.length
		const completedTasks = tasks.filter((task) => task.status === 'done').length
		const blockedTasks = tasks.filter((task) => task.status === 'blocked').length
		const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length

		console.log('📊 [syncActivityStatus] Estatísticas:', {
			totalTasks,
			completedTasks,
			blockedTasks,
			inProgressTasks,
		})

		// Lógica de determinação do status
		let newStatus: 'todo' | 'progress' | 'done' | 'blocked'

		if (blockedTasks > 0) {
			// Se há tarefas bloqueadas, atividade fica bloqueada
			newStatus = 'blocked'
		} else if (completedTasks === totalTasks) {
			// Se todas as tarefas estão concluídas, atividade está concluída
			newStatus = 'done'
		} else if (completedTasks > 0 || inProgressTasks > 0) {
			// Se há progresso (tarefas concluídas ou em progresso), atividade está em progresso
			newStatus = 'progress'
		} else {
			// Se não há progresso, atividade está a fazer
			newStatus = 'todo'
		}

		console.log('🎯 [syncActivityStatus] Novo status calculado:', newStatus)

		// Atualizar status da atividade no banco
		await db
			.update(schema.projectActivity)
			.set({
				status: newStatus,
				updatedAt: new Date(),
			})
			.where(eq(schema.projectActivity.id, activityId))

		console.log('✅ [syncActivityStatus] Status da atividade atualizado para:', newStatus)

		return newStatus
	} catch (error) {
		console.error('❌ [syncActivityStatus] Erro ao sincronizar status:', error)
		throw error
	}
}

/**
 * Função para sincronizar status de todas as atividades de um projeto
 * @param projectId ID do projeto
 */
export async function syncAllActivitiesStatus(projectId: string): Promise<void> {
	try {
		console.log('🔄 [syncAllActivitiesStatus] Sincronizando todas as atividades do projeto:', projectId)

		// Buscar todas as atividades do projeto
		const activities = await db.select().from(schema.projectActivity).where(eq(schema.projectActivity.projectId, projectId))

		console.log(`📋 [syncAllActivitiesStatus] Encontradas ${activities.length} atividades`)

		// Sincronizar cada atividade
		for (const activity of activities) {
			await syncActivityStatus(activity.id)
		}

		console.log('✅ [syncAllActivitiesStatus] Todas as atividades sincronizadas')
	} catch (error) {
		console.error('❌ [syncAllActivitiesStatus] Erro ao sincronizar atividades:', error)
		throw error
	}
}
