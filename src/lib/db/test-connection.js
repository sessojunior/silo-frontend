// Teste simples de conexão PostgreSQL
// Execute: node test-connection.js

import { db } from './index.js'

async function testConnection() {
	console.log('ℹ️ Testando conexão PostgreSQL...')
	console.log('DATABASE_URL:', process.env.DATABASE_URL)

	try {
		// Testa uma query simples
		const result = await db.execute('SELECT NOW() as current_time')

		// Verifica se a query retornou resultado
		if (result.rows && result.rows.length > 0) {
			console.log('✅ Conexão OK!')
			console.log('Tempo atual:', result.rows[0].current_time)
		}
	} catch (error) {
		console.error('❌ Erro de conexão:', error.message)
		console.error('Tipo de erro:', error.constructor.name)
	} finally {
		// Fecha a conexão
		process.exit(0)
	}
}

testConnection()
