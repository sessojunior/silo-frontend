import 'dotenv/config'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { db } from './index.js'

async function clearDatabase() {
	console.log('ℹ️ Limpando banco de dados...')

	try {
		// Ler arquivos .sql da pasta migrations
		const __filename = fileURLToPath(import.meta.url)
		const __dirname = dirname(__filename)
		const migrationsDir = join(__dirname, '../../drizzle')

		// Buscar todos os arquivos SQL nas subpastas
		const files = readdirSync(migrationsDir, { recursive: true }).filter((file) => file.toString().endsWith('.sql'))

		// Ler e executar cada arquivo em ordem reversa (para reverter)
		for (const file of files.reverse()) {
			const sqlContent = readFileSync(join(migrationsDir, file.toString()), 'utf8')
			// Executar DROP TABLE se existir
			const dropStatements = sqlContent.match(/DROP TABLE[^;]+;/gi)
			if (dropStatements) {
				for (const statement of dropStatements) {
					await db.execute(statement)
				}
			}
		}

		console.log('✅ Banco de dados limpo com sucesso!')
	} catch (error) {
		console.error('❌ Erro ao limpar banco:', error)
	}
}

clearDatabase()
