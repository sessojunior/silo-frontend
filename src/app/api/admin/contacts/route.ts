import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { eq, desc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { contact } from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'
import { utapi, getFileKeyFromUrl } from '@/server/uploadthing'

// GET - Listar contatos com filtros
export async function GET(req: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const search = searchParams.get('search') || ''
		const status = searchParams.get('status') || 'all' // all, active, inactive

		console.log('🔵 Listando contatos...', { search, status })

		// Query simples sem filtros complexos por enquanto
		const contacts = await db.select().from(contact).orderBy(desc(contact.createdAt))

		// Aplicar filtros em JavaScript por simplicidade
		let filteredContacts = contacts

		if (search) {
			filteredContacts = contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()) || c.team.toLowerCase().includes(search.toLowerCase()))
		}

		if (status === 'active') {
			filteredContacts = filteredContacts.filter((c) => c.active)
		} else if (status === 'inactive') {
			filteredContacts = filteredContacts.filter((c) => !c.active)
		}

		console.log('✅ Contatos listados com sucesso:', filteredContacts.length)

		return NextResponse.json({
			success: true,
			data: {
				items: filteredContacts,
				total: filteredContacts.length,
			},
		})
	} catch (error) {
		console.error('❌ Erro ao listar contatos:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// POST - Criar novo contato
export async function POST(req: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

		const formData = await req.formData()
		const name = formData.get('name') as string
		const role = formData.get('role') as string
		const team = formData.get('team') as string
		const email = formData.get('email') as string
		const phone = formData.get('phone') as string | null
		const imageUrl = formData.get('imageUrl') as string | null
		const active = formData.get('active') === 'true'
		// const file = formData.get('file') as File | null - não mais usado, apenas UploadThing

		console.log('🔵 Criando novo contato:', { name, role, team, email, active })

		// Validações
		if (!name || name.trim().length < 2) {
			return NextResponse.json({ success: false, error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 })
		}
		if (!role || role.trim().length < 2) {
			return NextResponse.json({ success: false, error: 'Função deve ter pelo menos 2 caracteres' }, { status: 400 })
		}
		if (!team || team.trim().length < 2) {
			return NextResponse.json({ success: false, error: 'Equipe deve ter pelo menos 2 caracteres' }, { status: 400 })
		}
		if (!email || !email.includes('@')) {
			return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
		}

		// Verificar email único
		const existingContact = await db.select().from(contact).where(eq(contact.email, email))
		if (existingContact.length > 0) {
			return NextResponse.json({ success: false, error: 'Este email já está em uso' }, { status: 400 })
		}

		let imagePath: string | null = null

		// Definir imagem a partir de URL se fornecida
		if (imageUrl) {
			imagePath = imageUrl
		}

		// Upload de imagem agora é feito via UploadThing no frontend

		// Criar contato
		const contactId = randomUUID()
		await db.insert(contact).values({
			id: contactId,
			name: name.trim(),
			role: role.trim(),
			team: team.trim(),
			email: email.trim().toLowerCase(),
			phone: phone?.trim() || null,
			image: imagePath,
			active,
		})

		console.log('✅ Contato criado com sucesso:', contactId)

		return NextResponse.json({ success: true, data: { id: contactId } }, { status: 201 })
	} catch (error) {
		console.error('❌ Erro ao criar contato:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PUT - Editar contato
export async function PUT(req: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

		const formData = await req.formData()
		const id = formData.get('id') as string
		const name = formData.get('name') as string
		const role = formData.get('role') as string
		const team = formData.get('team') as string
		const email = formData.get('email') as string
		const phone = formData.get('phone') as string | null
		const imageUrl = formData.get('imageUrl') as string | null
		const active = formData.get('active') === 'true'
		// const file = formData.get('file') as File | null - não mais usado, apenas UploadThing
		const removeImage = formData.get('removeImage') === 'true'

		console.log('🔵 Editando contato:', { id, name, role, team, email, active })

		if (!id) {
			return NextResponse.json({ success: false, error: 'ID do contato é obrigatório' }, { status: 400 })
		}

		// Verificar se contato existe
		const existingContacts = await db.select().from(contact).where(eq(contact.id, id))
		if (existingContacts.length === 0) {
			return NextResponse.json({ success: false, error: 'Contato não encontrado' }, { status: 404 })
		}

		const existingContact = existingContacts[0]

		// Validações
		if (!name || name.trim().length < 2) {
			return NextResponse.json({ success: false, error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 })
		}
		if (!role || role.trim().length < 2) {
			return NextResponse.json({ success: false, error: 'Função deve ter pelo menos 2 caracteres' }, { status: 400 })
		}
		if (!team || team.trim().length < 2) {
			return NextResponse.json({ success: false, error: 'Equipe deve ter pelo menos 2 caracteres' }, { status: 400 })
		}
		if (!email || !email.includes('@')) {
			return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
		}

		// Verificar email único (exceto o próprio contato)
		if (email !== existingContact.email) {
			const emailCheck = await db.select().from(contact).where(eq(contact.email, email))
			if (emailCheck.length > 0) {
				return NextResponse.json({ success: false, error: 'Este email já está em uso' }, { status: 400 })
			}
		}

		let imagePath = existingContact.image

		// Se nova imagem via URL
		if (imageUrl) {
			imagePath = imageUrl
		}

		// Remover imagem se solicitado
		if (removeImage && existingContact.image) {
			// Exclui a imagem do UploadThing
			const fileKey = getFileKeyFromUrl(existingContact.image)
			if (fileKey) {
				try {
					console.log('🔵 Excluindo imagem de contato do UploadThing:', fileKey)
					await utapi.deleteFiles([fileKey])
					console.log('✅ Imagem de contato excluída do UploadThing com sucesso')
				} catch (error) {
					console.error('❌ Erro ao excluir imagem de contato do UploadThing:', error)
					// Continua mesmo se falhar a exclusão do arquivo remoto
				}
			}
			imagePath = null
		}

		// Upload de imagem agora é feito via UploadThing no frontend

		// Atualizar contato
		await db
			.update(contact)
			.set({
				name: name.trim(),
				role: role.trim(),
				team: team.trim(),
				email: email.trim().toLowerCase(),
				phone: phone?.trim() || null,
				image: imagePath,
				active,
				updatedAt: new Date(),
			})
			.where(eq(contact.id, id))

		console.log('✅ Contato atualizado com sucesso:', id)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Erro ao editar contato:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// DELETE - Excluir contato
export async function DELETE(req: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ field: null, message: 'Usuário não autenticado.' }, { status: 401 })
		}

		const { id } = await req.json()

		console.log('🔵 Excluindo contato:', id)

		if (!id) {
			return NextResponse.json({ success: false, error: 'ID do contato é obrigatório' }, { status: 400 })
		}

		// Verificar se contato existe
		const existingContacts = await db.select().from(contact).where(eq(contact.id, id))
		if (existingContacts.length === 0) {
			return NextResponse.json({ success: false, error: 'Contato não encontrado' }, { status: 404 })
		}

		const existingContact = existingContacts[0]

		// Exclui a imagem do UploadThing se existir
		if (existingContact.image) {
			const fileKey = getFileKeyFromUrl(existingContact.image)
			if (fileKey) {
				try {
					console.log('🔵 Excluindo imagem de contato do UploadThing:', fileKey)
					await utapi.deleteFiles([fileKey])
					console.log('✅ Imagem de contato excluída do UploadThing com sucesso')
				} catch (error) {
					console.error('❌ Erro ao excluir imagem de contato do UploadThing:', error)
					// Continua mesmo se falhar a exclusão do arquivo remoto
				}
			}
		}

		// Excluir contato (as associações serão removidas automaticamente por CASCADE)
		await db.delete(contact).where(eq(contact.id, id))

		console.log('✅ Contato excluído com sucesso:', id)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Erro ao excluir contato:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
