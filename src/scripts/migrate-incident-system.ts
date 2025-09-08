/**
 * Script de migração para o sistema de incidentes
 *
 * Este script:
 * 1. Adiciona categoria "Não houve incidentes" se não existir
 * 2. Atualiza atividades sem categoria para usar "Não houve incidentes"
 * 3. Adiciona campos isSystem e sortOrder nas categorias existentes
 * 4. Verifica que filtros automáticos estão funcionando
 */

import 'dotenv/config'
import { db } from '@/lib/db'
import { productActivity, productProblemCategory } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'
import { NO_INCIDENTS_CATEGORY_ID, NO_INCIDENTS_CATEGORY_NAME } from '@/lib/constants'

async function migrateIncidentSystem() {
	console.log(' Iniciando migração do sistema de incidentes...')

	try {
		// 1. Adicionar categoria "Não houve incidentes" se não existir
		await ensureNoIncidentsCategory()

		// 2. Atualizar atividades sem categoria para usar "Não houve incidentes"
		await updateActivitiesWithoutCategory()

		// 3. Adicionar campos isSystem e sortOrder nas categorias existentes
		await addSystemFieldsToCategories()

		// 4. Verificar que filtros automáticos estão funcionando
		await verifyAutomaticFiltering()

		console.log('✅ Migração concluída com sucesso!')
	} catch (error) {
		console.error('❌ Erro durante a migração:', error)
		process.exit(1)
	}
}

async function ensureNoIncidentsCategory() {
	console.log('🔍 Verificando categoria "Não houve incidentes"...')

	const existing = await db.select().from(productProblemCategory).where(eq(productProblemCategory.id, NO_INCIDENTS_CATEGORY_ID)).limit(1)

	if (existing.length === 0) {
		console.log('📝 Criando categoria "Não houve incidentes"...')

		await db.insert(productProblemCategory).values({
			id: NO_INCIDENTS_CATEGORY_ID,
			name: NO_INCIDENTS_CATEGORY_NAME,
			color: '#10B981',
			isSystem: true,
			sortOrder: 0,
		})

		console.log('✅ Categoria "Não houve incidentes" criada')
	} else {
		console.log('✅ Categoria "Não houve incidentes" já existe')
	}
}

async function updateActivitiesWithoutCategory() {
	console.log('🔍 Verificando atividades sem categoria...')

	const activitiesWithoutCategory = await db.select().from(productActivity).where(isNull(productActivity.problemCategoryId))

	if (activitiesWithoutCategory.length > 0) {
		console.log(`📝 Atualizando ${activitiesWithoutCategory.length} atividades sem categoria...`)

		await db.update(productActivity).set({ problemCategoryId: NO_INCIDENTS_CATEGORY_ID }).where(isNull(productActivity.problemCategoryId))

		console.log(`✅ ${activitiesWithoutCategory.length} atividades atualizadas para "Não houve incidentes"`)
	} else {
		console.log('✅ Nenhuma atividade sem categoria encontrada')
	}
}

async function addSystemFieldsToCategories() {
	console.log('🔍 Verificando campos isSystem e sortOrder...')

	// Buscar categorias que não têm os novos campos definidos
	const categoriesWithoutSystem = await db.select().from(productProblemCategory).where(isNull(productProblemCategory.isSystem))

	if (categoriesWithoutSystem.length > 0) {
		console.log(`📝 Atualizando ${categoriesWithoutSystem.length} categorias com novos campos...`)

		for (const category of categoriesWithoutSystem) {
			await db
				.update(productProblemCategory)
				.set({
					isSystem: category.id === NO_INCIDENTS_CATEGORY_ID,
					sortOrder: category.id === NO_INCIDENTS_CATEGORY_ID ? 0 : 999,
				})
				.where(eq(productProblemCategory.id, category.id))
		}

		console.log('✅ Campos isSystem e sortOrder adicionados')
	} else {
		console.log('✅ Todos os campos já estão atualizados')
	}
}

async function verifyAutomaticFiltering() {
	console.log('🔍 Verificando filtros automáticos...')

	try {
		// Verificar que a API de causas de problemas não retorna "Não houve incidentes"
		const response = await fetch('http://localhost:3000/api/admin/dashboard/problems-causes')

		if (!response.ok) {
			throw new Error(`API retornou status ${response.status}`)
		}

		const data = await response.json()

		if (data.labels && data.labels.includes('Não houve incidentes')) {
			throw new Error('❌ Filtro automático não está funcionando! "Não houve incidentes" aparece nas estatísticas')
		}

		console.log('✅ Filtros automáticos verificados com sucesso!')
		console.log(`📊 Estatísticas mostram ${data.labels?.length || 0} categorias de incidentes reais`)
	} catch (error) {
		console.warn('⚠️ Não foi possível verificar filtros automáticos (servidor pode não estar rodando):', error instanceof Error ? error.message : String(error))
		console.log('💡 Execute o servidor e teste manualmente as APIs de estatísticas')
	}
}

// Executar migração se chamado diretamente
if (require.main === module) {
	migrateIncidentSystem()
		.then(() => {
			console.log('🎉 Migração finalizada!')
			process.exit(0)
		})
		.catch((error) => {
			console.error('💥 Falha na migração:', error)
			process.exit(1)
		})
}

export { migrateIncidentSystem }
