import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

// Validação das variáveis de ambiente
const environment = process.env.ENVIRONMENT as 'production' | 'development'
if (!['production', 'development'].includes(environment)) {
	throw new Error(`A variável ENVIRONMENT deve ser "production" ou "development". Valor atual: "${environment}"`)
}

// URLs do banco de dados por ambiente
const databaseUrls: Record<'production' | 'development', string> = {
	production: process.env.DATABASE_URL_PRODUCTION as string,
	development: process.env.DATABASE_URL_DEVELOPMENT as string,
}

// Seleciona a URL apropriada do banco de dados
const databaseUrl = databaseUrls[environment]

// Verifica se a URL do banco de dados foi definida
if (!databaseUrl) {
	const missingVariable = environment === 'production' ? 'DATABASE_URL_PRODUCTION' : 'DATABASE_URL_DEVELOPMENT'
	throw new Error(`A variável de ambiente ${missingVariable} não foi definida.`)
}

// Define o arquivo de schema de acordo com o dialect
const schema = environment === 'production' ? 'schema.postgres.ts' : 'schema.sqlite.ts'

// Define o dialect (postgresql para produção e sqlite para desenvolvimento)
const dialect = environment === 'production' ? 'postgresql' : 'sqlite'

export default defineConfig({
	out: './drizzle', // Diretório onde serão salvos os arquivos gerados
	schema: `./src/app/lib/db/${schema}`, // Caminho do schema
	dialect,
	dbCredentials: { url: databaseUrl },
})
