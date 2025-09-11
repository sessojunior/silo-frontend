import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

type ProductActivityHistoryEntry = Omit<typeof schema.productActivityHistory.$inferInsert, 'id' | 'createdAt'> & {
	productActivityId: string
	userId: string
	status: string
	description?: string | null
}

export async function recordProductActivityHistory(entry: ProductActivityHistoryEntry) {
	try {
		await db.insert(schema.productActivityHistory).values(entry)
		console.log('✅ [ProductActivityHistory] Histórico registrado:', entry.productActivityId)
	} catch (error) {
		console.error('❌ [ProductActivityHistory] Erro ao registrar histórico:', error)
	}
}

export async function recordBulkProductActivityHistory(entries: ProductActivityHistoryEntry[]) {
	try {
		if (entries.length > 0) {
			await db.insert(schema.productActivityHistory).values(entries)
			console.log(`✅ [ProductActivityHistory] ${entries.length} entradas de histórico registradas`)
		}
	} catch (error) {
		console.error('❌ [ProductActivityHistory] Erro ao registrar histórico em massa:', error)
	}
}
