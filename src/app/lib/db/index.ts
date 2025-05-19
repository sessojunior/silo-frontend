import { drizzle as drizzlePostgres, type NodePgDatabase, type NodePgClient } from 'drizzle-orm/node-postgres'
import { drizzle as drizzleSqlite, type LibSQLDatabase } from 'drizzle-orm/libsql'
import type { Client as LibSQLClient } from '@libsql/client'
import * as schemaSqlite from './schema.sqlite'
import * as schemaPostgres from './schema.postgres'
import 'dotenv/config'

// Define o ambiente a partir das variáveis de ambiente
export const environment = process.env.ENVIRONMENT as 'production' | 'development'
if (!['production', 'development'].includes(environment)) {
	throw new Error(`A variável ENVIRONMENT deve ser "production" ou "development". Valor atual: "${environment}"`)
}

// URLs do banco de dados por ambiente
const databaseUrls: Record<'production' | 'development', string> = {
	production: process.env.DATABASE_URL_PRODUCTION as string,
	development: process.env.DATABASE_URL_DEVELOPMENT as string,
}

// Seleciona a URL apropriada do banco de dados e verifica se ela foi definida
const databaseUrl = databaseUrls[environment]
if (!databaseUrl) {
	const missingVariable = environment === 'production' ? 'DATABASE_URL_PRODUCTION' : 'DATABASE_URL_DEVELOPMENT'
	throw new Error(`A variável de ambiente ${missingVariable} não foi definida.`)
}

// Cria um objeto de conexão para cada tipo de banco de dados,
// com tipos explícitos, e exporta cada um separadamente

// Banco de dados e schema de “production” (Postgres)
export const dbProduction: NodePgDatabase<typeof schemaPostgres> & { $client: NodePgClient } = drizzlePostgres(databaseUrl, { schema: schemaPostgres })
export const schemaProduction = schemaPostgres

// Banco de dados e schema de “development” (SQLite/LibSQL)
export const dbDevelopment: LibSQLDatabase<typeof schemaSqlite> & { $client: LibSQLClient } = drizzleSqlite(databaseUrl, { schema: schemaSqlite })
export const schemaDevelopment = schemaSqlite

// Banco de dados e schema de acordo com o ambiente
export const db = environment === 'production' ? dbProduction : dbDevelopment
export const schema = environment === 'production' ? schemaProduction : schemaDevelopment
