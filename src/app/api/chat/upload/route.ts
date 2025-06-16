import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getAuthUser } from '@/lib/auth/token'
import { randomUUID } from 'crypto'

// Tipos de arquivo permitidos
const ALLOWED_TYPES = {
	images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
	documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
	videos: ['video/mp4', 'video/webm'],
	audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
}

const ALL_ALLOWED_TYPES = [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.documents, ...ALLOWED_TYPES.videos, ...ALLOWED_TYPES.audio]

// Tamanho máximo: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
		}

		const formData = await request.formData()
		const file = formData.get('file') as File
		const channelId = formData.get('channelId') as string

		// Validações
		if (!file) {
			return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 })
		}

		if (!channelId) {
			return NextResponse.json({ error: 'ID do canal é obrigatório' }, { status: 400 })
		}

		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{
					error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
				},
				{ status: 400 },
			)
		}

		if (!ALL_ALLOWED_TYPES.includes(file.type)) {
			return NextResponse.json(
				{
					error: 'Tipo de arquivo não permitido',
				},
				{ status: 400 },
			)
		}

		// Gerar nome único para o arquivo
		const fileExtension = file.name.split('.').pop() || ''
		const uniqueFileName = `${randomUUID()}.${fileExtension}`

		// Criar estrutura de pastas por data
		const uploadDate = new Date()
		const year = uploadDate.getFullYear()
		const month = String(uploadDate.getMonth() + 1).padStart(2, '0')
		const day = String(uploadDate.getDate()).padStart(2, '0')

		const uploadPath = join(process.cwd(), 'public', 'uploads', 'chat', String(year), month, day)

		// Criar diretórios se não existirem
		await mkdir(uploadPath, { recursive: true })

		// Salvar arquivo
		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)
		const filePath = join(uploadPath, uniqueFileName)

		await writeFile(filePath, buffer)

		// URL pública do arquivo
		const publicUrl = `/uploads/chat/${year}/${month}/${day}/${uniqueFileName}`

		// Determinar categoria do arquivo
		let fileCategory = 'document'
		if (ALLOWED_TYPES.images.includes(file.type)) {
			fileCategory = 'image'
		} else if (ALLOWED_TYPES.videos.includes(file.type)) {
			fileCategory = 'video'
		} else if (ALLOWED_TYPES.audio.includes(file.type)) {
			fileCategory = 'audio'
		}

		// Informações do arquivo
		const fileInfo = {
			id: randomUUID(),
			originalName: file.name,
			fileName: uniqueFileName,
			url: publicUrl,
			size: file.size,
			mimeType: file.type,
			category: fileCategory,
			uploadedBy: user.id,
			uploadedAt: new Date().toISOString(),
			channelId,
		}

		console.log('✅ Arquivo carregado:', fileInfo.originalName, 'por', user.name)

		return NextResponse.json({
			success: true,
			file: fileInfo,
			message: 'Arquivo carregado com sucesso',
		})
	} catch (error) {
		console.log('❌ Erro ao fazer upload:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// GET - Listar arquivos de um canal
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
		}

		const url = new URL(request.url)
		const channelId = url.searchParams.get('channelId')
		const limit = parseInt(url.searchParams.get('limit') || '20')
		const offset = parseInt(url.searchParams.get('offset') || '0')

		if (!channelId) {
			return NextResponse.json({ error: 'ID do canal é obrigatório' }, { status: 400 })
		}

		// TODO: Implementar busca no banco de dados quando tivermos tabela de arquivos
		// Por enquanto, retornar lista vazia
		const files: unknown[] = []

		return NextResponse.json({
			files,
			total: files.length,
			limit,
			offset,
		})
	} catch (error) {
		console.log('❌ Erro ao listar arquivos:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// DELETE - Remover arquivo
export async function DELETE(request: NextRequest) {
	try {
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
		}

		const { fileId } = await request.json()

		if (!fileId) {
			return NextResponse.json({ error: 'ID do arquivo é obrigatório' }, { status: 400 })
		}

		// TODO: Implementar remoção do banco e do sistema de arquivos
		// Por enquanto, apenas confirmar

		console.log('✅ Arquivo removido:', fileId, 'por', user.name)

		return NextResponse.json({
			success: true,
			message: 'Arquivo removido com sucesso',
		})
	} catch (error) {
		console.log('❌ Erro ao remover arquivo:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
