import { db } from '@/lib/db'
import { userGroup, group } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Verifica se um usuário é administrador do sistema
 * @param userId - ID do usuário a ser verificado
 * @returns Promise<boolean> - true se o usuário for administrador
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
	try {
		console.log('🔍 Verificando se usuário é administrador:', userId)
		
		// Buscar grupos do usuário onde ele tem role 'admin' ou 'owner'
		const userGroups = await db
			.select({
				groupId: userGroup.groupId,
				role: userGroup.role,
				groupName: group.name,
			})
			.from(userGroup)
			.innerJoin(group, eq(userGroup.groupId, group.id))
			.where(
				and(
					eq(userGroup.userId, userId),
					eq(group.name, 'Administradores')
				)
			)

		// Verificar se o usuário está no grupo Administradores com role admin ou owner
		const isAdmin = userGroups.some(ug => 
			ug.groupName === 'Administradores' && 
			(ug.role === 'admin' || ug.role === 'owner')
		)

		console.log(`✅ Usuário ${userId} é administrador:`, isAdmin)
		return isAdmin
	} catch (error) {
		console.error('❌ Erro ao verificar se usuário é administrador:', error)
		return false
	}
}

/**
 * Middleware para verificar permissões de administrador
 * @param userId - ID do usuário a ser verificado
 * @returns Promise<{ success: boolean, error?: string }>
 */
export async function requireAdmin(userId: string): Promise<{ success: boolean, error?: string }> {
	try {
		const isAdmin = await isUserAdmin(userId)
		
		if (!isAdmin) {
			console.log('🚨 Usuário não é administrador:', userId)
			return {
				success: false,
				error: 'Apenas administradores podem realizar esta ação'
			}
		}

		return { success: true }
	} catch (error) {
		console.error('❌ Erro ao verificar permissões de administrador:', error)
		return {
			success: false,
			error: 'Erro interno do servidor'
		}
	}
}
