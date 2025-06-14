import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import { eq, desc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { contact } from '@/lib/db/schema'
import { getAuthUser } from '@/lib/auth/token'

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
		const active = formData.get('active') === 'true'
		const file = formData.get('file') as File | null

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

		// Upload de imagem (se fornecida)
		if (file) {
			if (file.size > 4 * 1024 * 1024) {
				return NextResponse.json({ success: false, error: 'A imagem deve ter no máximo 4MB' }, { status: 400 })
			}

			const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
			if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
				return NextResponse.json({ success: false, error: 'Formato de imagem não suportado' }, { status: 400 })
			}

			const imageId = randomUUID()
			const fileName = `${imageId}.${ext}`
			const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'contacts')

			// Criar diretório se não existir
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true })
			}

			const filePath = path.join(uploadDir, fileName)
			const arrayBuffer = await file.arrayBuffer()
			fs.writeFileSync(filePath, Buffer.from(arrayBuffer))

			imagePath = `/uploads/contacts/${fileName}`
			console.log('✅ Imagem salva:', imagePath)
		}

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
		const active = formData.get('active') === 'true'
		const file = formData.get('file') as File | null
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

		// Remover imagem existente se solicitado
		if (removeImage && existingContact.image) {
			try {
				const filePath = path.join(process.cwd(), 'public', existingContact.image.startsWith('/') ? existingContact.image.slice(1) : existingContact.image)
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath)
				}
			} catch (error) {
				console.error('⚠️ Erro ao remover imagem:', error)
			}
			imagePath = null
		}

		// Upload de nova imagem
		if (file) {
			if (file.size > 4 * 1024 * 1024) {
				return NextResponse.json({ success: false, error: 'A imagem deve ter no máximo 4MB' }, { status: 400 })
			}

			const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
			if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
				return NextResponse.json({ success: false, error: 'Formato de imagem não suportado' }, { status: 400 })
			}

			// Remover imagem anterior se existir
			if (existingContact.image) {
				try {
					const oldFilePath = path.join(process.cwd(), 'public', existingContact.image.startsWith('/') ? existingContact.image.slice(1) : existingContact.image)
					if (fs.existsSync(oldFilePath)) {
						fs.unlinkSync(oldFilePath)
					}
				} catch (error) {
					console.error('⚠️ Erro ao remover imagem anterior:', error)
				}
			}

			const imageId = randomUUID()
			const fileName = `${imageId}.${ext}`
			const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'contacts')

			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true })
			}

			const filePath = path.join(uploadDir, fileName)
			const arrayBuffer = await file.arrayBuffer()
			fs.writeFileSync(filePath, Buffer.from(arrayBuffer))

			imagePath = `/uploads/contacts/${fileName}`
			console.log('✅ Nova imagem salva:', imagePath)
		}

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

		// Remover imagem se existir
		if (existingContact.image) {
			try {
				const filePath = path.join(process.cwd(), 'public', existingContact.image.startsWith('/') ? existingContact.image.slice(1) : existingContact.image)
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath)
				}
				console.log('✅ Imagem removida:', existingContact.image)
			} catch (error) {
				console.error('⚠️ Erro ao remover imagem:', error)
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
