import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { help } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const HELP_ID = 'system-help'

// GET - Buscar a documentação de ajuda
export async function GET() {
	try {
		console.log('🔵 Buscando documentação de ajuda...')

		let helpDoc = await db.select().from(help).where(eq(help.id, HELP_ID)).limit(1)

		// Se não existe, criar um registro vazio
		if (helpDoc.length === 0) {
			console.log('🔵 Criando registro inicial de ajuda...')
			await db.insert(help).values({
				id: HELP_ID,
				description: '',
			})

			helpDoc = await db.select().from(help).where(eq(help.id, HELP_ID)).limit(1)
		}

		console.log('✅ Documentação de ajuda carregada')
		return NextResponse.json({
			success: true,
			data: helpDoc[0],
		})
	} catch (error) {
		console.error('❌ Erro ao buscar documentação de ajuda:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro ao carregar documentação',
			},
			{ status: 500 },
		)
	}
}

// PUT - Atualizar a documentação de ajuda
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { description } = body

		console.log('🔵 Atualizando documentação de ajuda...')

		// Garantir que o registro existe
		const existing = await db.select().from(help).where(eq(help.id, HELP_ID)).limit(1)

		if (existing.length === 0) {
			// Criar se não existe
			await db.insert(help).values({
				id: HELP_ID,
				description: description || '',
			})
		} else {
			// Atualizar se existe
			await db
				.update(help)
				.set({
					description: description || '',
					updatedAt: new Date(),
				})
				.where(eq(help.id, HELP_ID))
		}

		console.log('✅ Documentação de ajuda atualizada')
		return NextResponse.json({
			success: true,
			message: 'Documentação atualizada com sucesso',
		})
	} catch (error) {
		console.error('❌ Erro ao atualizar documentação de ajuda:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro ao salvar documentação',
			},
			{ status: 500 },
		)
	}
}
