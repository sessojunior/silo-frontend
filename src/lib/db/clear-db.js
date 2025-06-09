import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
})

async function clearDatabase() {
	try {
		console.log('🔄 Limpando banco de dados...')

		// Deletar dados em ordem para respeitar foreign keys
		await pool.query('DELETE FROM product_solution_checked')
		await pool.query('DELETE FROM product_solution_image')
		await pool.query('DELETE FROM product_solution')
		await pool.query('DELETE FROM product_problem_image')
		await pool.query('DELETE FROM product_problem')
		await pool.query('DELETE FROM product_manual_chapter')
		await pool.query('DELETE FROM product_manual_section')
		await pool.query('DELETE FROM product_contact')
		await pool.query('DELETE FROM product_dependency')
		await pool.query('DELETE FROM product')
		await pool.query('DELETE FROM system_file')
		await pool.query('DELETE FROM user_preferences')
		await pool.query('DELETE FROM user_profile')
		await pool.query('DELETE FROM auth_provider')
		await pool.query('DELETE FROM auth_code')
		await pool.query('DELETE FROM auth_session')
		await pool.query('DELETE FROM auth_user')
		await pool.query('DELETE FROM rate_limit')

		console.log('✅ Banco de dados limpo com sucesso!')
	} catch (error) {
		console.error('❌ Erro ao limpar banco:', error)
	} finally {
		await pool.end()
	}
}

clearDatabase()
