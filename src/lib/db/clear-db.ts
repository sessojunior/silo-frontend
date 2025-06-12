// Limpa o banco de dados
// npx tsx src/lib/db/clear-db.ts

import 'dotenv/config'
import { db } from './index'

async function clearDatabase() {
	console.log('🔵 Limpando banco de dados...')

	try {
		// Ordem correta para evitar conflitos de foreign keys
		const tables = ['product_problem_image', 'product_solution_image', 'product_solution_checked', 'product_solution', 'product_problem', 'product_manual_chapter', 'product_manual_section', 'product_contact', 'product_dependency', 'system_file', 'user_preferences', 'user_profile', 'auth_code', 'auth_provider', 'auth_session', 'rate_limit', 'product', 'auth_user']

		for (const table of tables) {
			try {
				await db.execute(`DROP TABLE IF EXISTS "${table}" CASCADE;`)
				console.log(`✅ Tabela ${table} removida`)
			} catch (error) {
				console.log(`⚠️ Erro ao remover ${table}:`, error)
			}
		}

		console.log('✅ Banco de dados limpo com sucesso!')
	} catch (error) {
		console.error('❌ Erro ao limpar banco:', error)
	}
}

clearDatabase()
