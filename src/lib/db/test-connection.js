// Teste simples de conexão PostgreSQL
// Execute: node test-connection.js

const { Pool } = require('pg')
require('dotenv').config()

async function testConnection() {
	console.log('🔄 Testando conexão PostgreSQL...')
	console.log('DATABASE_URL:', process.env.DATABASE_URL)

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	})

	try {
		const client = await pool.connect()
		const result = await client.query('SELECT NOW() as current_time')
		console.log('✅ Conexão OK!')
		console.log('Tempo atual:', result.rows[0].current_time)
		client.release()
	} catch (error) {
		console.error('❌ Erro de conexão:', error.message)
		console.error('Tipo de erro:', error.constructor.name)
	} finally {
		await pool.end()
	}
}

testConnection()
