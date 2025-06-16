import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { group, userGroup } from '@/lib/db/schema'
import { eq, desc, ilike, and, count, sql, not } from 'drizzle-orm'
import { randomUUID } from 'crypto'

// GET - Listar grupos com busca e filtros
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const search = searchParams.get('search') || ''
		const status = searchParams.get('status') || 'all'

		console.log('ℹ️ Buscando grupos:', { search, status })

		// Construir condições de filtro
		const conditions = []

		if (search) {
			conditions.push(ilike(group.name, `%${search}%`))
		}

		if (status === 'active') {
			conditions.push(eq(group.active, true))
		} else if (status === 'inactive') {
			conditions.push(eq(group.active, false))
		}

		// Buscar grupos
		const groups = await db
			.select()
			.from(group)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(group.isDefault), desc(group.createdAt))

		console.log('✅ Grupos carregados com sucesso:', groups.length)

		return NextResponse.json({
			success: true,
			data: {
				items: groups,
				total: groups.length,
			},
		})
	} catch (error) {
		console.error('❌ Erro ao buscar grupos:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro ao carregar grupos',
			},
			{ status: 500 },
		)
	}
}

// POST - Criar novo grupo
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, description, icon, color, active, isDefault, maxUsers } = body

		console.log('ℹ️ Criando novo grupo:', { name, description, active, isDefault })

		// Validações
		if (!name || name.trim().length < 2) {
			return NextResponse.json(
				{
					success: false,
					field: 'name',
					message: 'Nome do grupo é obrigatório e deve ter pelo menos 2 caracteres.',
				},
				{ status: 400 },
			)
		}

		// Verificar se nome já existe
		const existingGroup = await db.select().from(group).where(eq(group.name, name.trim())).limit(1)

		if (existingGroup.length > 0) {
			return NextResponse.json(
				{
					success: false,
					field: 'name',
					message: 'Já existe um grupo com este nome.',
				},
				{ status: 400 },
			)
		}

		// Se marcado como padrão, remover padrão dos outros grupos
		if (isDefault) {
			await db
				.update(group)
				.set({ isDefault: false, updatedAt: sql`NOW()` })
				.where(eq(group.isDefault, true))
		}

		// Criar grupo
		const newGroup = {
			id: randomUUID(),
			name: name.trim(),
			description: description?.trim() || null,
			icon: icon || 'icon-[lucide--users]',
			color: color || '#3B82F6',
			active: active !== undefined ? active : true,
			isDefault: isDefault || false,
			maxUsers: maxUsers || null,
		}

		await db.insert(group).values(newGroup)

		console.log('✅ Grupo criado com sucesso:', newGroup.id)

		return NextResponse.json({
			success: true,
			data: newGroup,
		})
	} catch (error) {
		console.error('❌ Erro ao criar grupo:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro interno do servidor',
			},
			{ status: 500 },
		)
	}
}

// PUT - Atualizar grupo
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { id, name, description, icon, color, active, isDefault, maxUsers } = body

		console.log('ℹ️ Atualizando grupo:', { id, name, active, isDefault })

		// Validações
		if (!id) {
			return NextResponse.json(
				{
					success: false,
					field: 'id',
					message: 'ID do grupo é obrigatório.',
				},
				{ status: 400 },
			)
		}

		if (!name || name.trim().length < 2) {
			return NextResponse.json(
				{
					success: false,
					field: 'name',
					message: 'Nome do grupo é obrigatório e deve ter pelo menos 2 caracteres.',
				},
				{ status: 400 },
			)
		}

		// Verificar se grupo existe
		const existingGroup = await db.select().from(group).where(eq(group.id, id)).limit(1)

		if (existingGroup.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: 'Grupo não encontrado.',
				},
				{ status: 404 },
			)
		}

		// Verificar se nome já existe em outro grupo
		const duplicateGroup = await db
			.select()
			.from(group)
			.where(and(eq(group.name, name.trim()), not(eq(group.id, id))))
			.limit(1)

		if (duplicateGroup.length > 0) {
			return NextResponse.json(
				{
					success: false,
					field: 'name',
					message: 'Já existe outro grupo com este nome.',
				},
				{ status: 400 },
			)
		}

		// Se marcado como padrão, remover padrão dos outros grupos
		if (isDefault && !existingGroup[0].isDefault) {
			await db
				.update(group)
				.set({ isDefault: false, updatedAt: sql`NOW()` })
				.where(and(eq(group.isDefault, true), not(eq(group.id, id))))
		}

		// Atualizar grupo
		const updatedData = {
			name: name.trim(),
			description: description?.trim() || null,
			icon: icon || 'icon-[lucide--users]',
			color: color || '#3B82F6',
			active: active !== undefined ? active : true,
			isDefault: isDefault || false,
			maxUsers: maxUsers || null,
			updatedAt: sql`NOW()`,
		}

		await db.update(group).set(updatedData).where(eq(group.id, id))

		console.log('✅ Grupo atualizado com sucesso:', id)

		return NextResponse.json({
			success: true,
			data: { id, ...updatedData },
		})
	} catch (error) {
		console.error('❌ Erro ao atualizar grupo:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro interno do servidor',
			},
			{ status: 500 },
		)
	}
}

// DELETE - Excluir grupo
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		console.log('ℹ️ Excluindo grupo:', { id })

		if (!id) {
			return NextResponse.json(
				{
					success: false,
					message: 'ID do grupo é obrigatório.',
				},
				{ status: 400 },
			)
		}

		// Verificar se grupo existe
		const existingGroup = await db.select().from(group).where(eq(group.id, id)).limit(1)

		if (existingGroup.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: 'Grupo não encontrado.',
				},
				{ status: 404 },
			)
		}

		// Verificar se é grupo padrão
		if (existingGroup[0].isDefault) {
			return NextResponse.json(
				{
					success: false,
					message: 'Não é possível excluir o grupo padrão.',
				},
				{ status: 400 },
			)
		}

		// Verificar se há usuários no grupo
		const usersInGroup = await db.select({ count: count() }).from(userGroup).where(eq(userGroup.groupId, id))

		if (usersInGroup[0].count > 0) {
			return NextResponse.json(
				{
					success: false,
					message: `Não é possível excluir o grupo pois ele possui ${usersInGroup[0].count} usuário(s).`,
				},
				{ status: 400 },
			)
		}

		// Excluir grupo
		await db.delete(group).where(eq(group.id, id))

		console.log('✅ Grupo excluído com sucesso:', id)

		return NextResponse.json({
			success: true,
			message: 'Grupo excluído com sucesso.',
		})
	} catch (error) {
		console.error('❌ Erro ao excluir grupo:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erro interno do servidor',
			},
			{ status: 500 },
		)
	}
}
