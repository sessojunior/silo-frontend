import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

// Script de migração para adicionar sistema de status de leitura
export async function migrateChatStatus() {
	console.log('🔄 Iniciando migração do sistema de status de leitura...')

	try {
		// 1. Adicionar campo deliveredAt na tabela chat_message se não existir
		await db.execute(sql`
			ALTER TABLE chat_message 
			ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP
		`)
		console.log('✅ Campo delivered_at adicionado à tabela chat_message')

		// 2. Criar tabela chat_message_status se não existir
		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS chat_message_status (
				id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
				message_id TEXT NOT NULL REFERENCES chat_message(id) ON DELETE CASCADE,
				user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
				read_at TIMESTAMP NOT NULL DEFAULT NOW(),
				created_at TIMESTAMP NOT NULL DEFAULT NOW(),
				CONSTRAINT unique_message_user UNIQUE (message_id, user_id)
			)
		`)
		console.log('✅ Tabela chat_message_status criada')

		// 3. Criar índices para performance
		await db.execute(sql`
			CREATE INDEX IF NOT EXISTS idx_chat_message_status_message_id 
			ON chat_message_status(message_id)
		`)

		await db.execute(sql`
			CREATE INDEX IF NOT EXISTS idx_chat_message_status_user_id 
			ON chat_message_status(user_id)
		`)

		await db.execute(sql`
			CREATE INDEX IF NOT EXISTS idx_chat_message_delivered_at 
			ON chat_message(delivered_at)
		`)

		console.log('✅ Índices criados para performance')

		// 4. Marcar mensagens existentes como entregues (opcional)
		const result = await db.execute(sql`
			UPDATE chat_message 
			SET delivered_at = created_at 
			WHERE delivered_at IS NULL
		`)

		console.log(`✅ ${result.rowCount || 0} mensagens existentes marcadas como entregues`)

		console.log('🎉 Migração do sistema de status de leitura concluída com sucesso!')
		return true
	} catch (error) {
		console.log('❌ Erro na migração:', error)
		throw error
	}
}

// Script para reverter a migração (se necessário)
export async function rollbackChatStatus() {
	console.log('🔄 Revertendo migração do sistema de status de leitura...')

	try {
		// Remover índices
		await db.execute(sql`DROP INDEX IF EXISTS idx_chat_message_status_message_id`)
		await db.execute(sql`DROP INDEX IF EXISTS idx_chat_message_status_user_id`)
		await db.execute(sql`DROP INDEX IF EXISTS idx_chat_message_delivered_at`)

		// Remover tabela
		await db.execute(sql`DROP TABLE IF EXISTS chat_message_status`)

		// Remover campo (comentado pois pode ser perigoso)
		// await db.execute(sql`ALTER TABLE chat_message DROP COLUMN IF EXISTS delivered_at`)

		console.log('✅ Migração revertida com sucesso!')
		return true
	} catch (error) {
		console.log('❌ Erro ao reverter migração:', error)
		throw error
	}
}

// Executar se chamado diretamente
if (require.main === module) {
	migrateChatStatus()
		.then(() => {
			console.log('✅ Migração executada com sucesso!')
			process.exit(0)
		})
		.catch((error) => {
			console.log('❌ Erro ao executar migração:', error)
			process.exit(1)
		})
}
