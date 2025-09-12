import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import multer from 'multer'
import sharp from 'sharp'
import { fileTypeFromBuffer } from 'file-type'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Configuração
dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				imgSrc: ["'self'", 'data:', 'blob:', 'http://localhost:3000', 'http://localhost:4000'],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'"],
			},
		},
		crossOriginEmbedderPolicy: false,
	}),
)
app.use(
	cors({
		origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}),
)
app.use(express.json())

// Configuração Multer
const storage = multer.memoryStorage()
const upload = multer({
	storage,
	limits: {
		fileSize: parseInt(process.env.MAX_FILE_SIZE) || 4194304, // 4MB
		files: parseInt(process.env.MAX_FILES_COUNT) || 3,
	},
	fileFilter: (req, file, cb) => {
		console.log('🔵 Multer fileFilter:', {
			fieldname: file.fieldname,
			originalname: file.originalname,
			mimetype: file.mimetype,
			size: file.size,
		})

		// Validação básica de MIME type
		const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true)
		} else {
			console.log('❌ Multer rejeitou arquivo por MIME type:', file.mimetype)
			cb(new Error('Tipo de arquivo não permitido'), false)
		}
	},
})

// Função para gerar nome único
function generateUniqueFilename(originalName) {
	const ext = path.extname(originalName)
	const name = path.basename(originalName, ext)
	const timestamp = Date.now()
	const random = uuidv4().substring(0, 8)
	return `${timestamp}-${random}${ext}`
}

// Função para validar tipo de arquivo
async function validateFileType(buffer) {
	try {
		console.log('🔵 Iniciando validação de arquivo:', {
			bufferLength: buffer.length,
			firstBytes: buffer.slice(0, 10).toString('hex'),
		})

		const fileType = await fileTypeFromBuffer(buffer)
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

		console.log('🔵 Resultado da validação:', {
			detectedType: fileType?.mime,
			detectedExt: fileType?.ext,
			allowedTypes,
			isValid: allowedTypes.includes(fileType?.mime),
			fileTypeObject: fileType,
		})

		// Se file-type não detectar ou retornar undefined, rejeitar arquivo por segurança
		if (!fileType || !fileType.mime) {
			console.log('❌ file-type não detectou tipo, rejeitando arquivo por segurança')
			return false
		}

		const isValid = allowedTypes.includes(fileType.mime)
		console.log('✅ Validação concluída:', { isValid, mimeType: fileType.mime })
		return isValid
	} catch (error) {
		console.error('❌ Erro na validação de tipo:', error)
		// Em caso de erro, rejeitar o arquivo por segurança
		return false
	}
}

// Função para gerar thumbnail (baseada no código existente do SILO)
async function generateThumbnail(buffer, filename) {
	try {
		const thumbFilename = `thumb-${filename.replace(/\.[^/.]+$/, '')}.webp`
		const thumbPath = path.join(__dirname, '..', 'uploads', 'avatars', thumbFilename)

		// Configuração baseada em src/server/uploadthing.ts
		const thumbnailSize = parseInt(process.env.AVATAR_THUMBNAIL_SIZE) || 128
		const thumbnailQuality = parseInt(process.env.AVATAR_THUMBNAIL_QUALITY) || 85

		await sharp(buffer)
			.rotate() // Rotação automática baseada em EXIF (como em profileImage.ts)
			.resize(thumbnailSize, thumbnailSize, { fit: 'cover' })
			.webp({ quality: thumbnailQuality })
			.toFile(thumbPath)

		console.log('✅ Thumbnail gerado:', thumbFilename)
		return `${process.env.FILE_SERVER_URL}/files/avatars/${thumbFilename}`
	} catch (error) {
		console.error('❌ Erro ao gerar thumbnail:', error)
		return null
	}
}

// Função para otimizar imagem geral (baseada no código existente do SILO)
async function optimizeImage(buffer, filename, type = 'general') {
	try {
		// Substituir extensão original por .webp
		const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp'
		const uploadDir = path.join(__dirname, '..', 'uploads', type)
		const optimizedPath = path.join(uploadDir, optimizedFilename)

		// Configuração baseada em src/lib/profileImage.ts
		const maxWidth = parseInt(process.env.GENERAL_MAX_WIDTH) || 1920
		const maxHeight = parseInt(process.env.GENERAL_MAX_HEIGHT) || 1080
		const quality = parseInt(process.env.GENERAL_QUALITY) || 90

		await sharp(buffer)
			.rotate() // Rotação automática baseada em EXIF
			.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
			.webp({ quality })
			.toFile(optimizedPath)

		console.log('✅ Imagem otimizada e substituída:', optimizedFilename)
		return `${process.env.FILE_SERVER_URL}/files/${type}/${optimizedFilename}`
	} catch (error) {
		console.error('❌ Erro ao otimizar imagem:', error)
		return null
	}
}

// Função para gerar imagem de perfil (baseada em profileImage.ts)
async function generateProfileImage(buffer, userId) {
	try {
		const profileFilename = `${userId}.webp`
		const profilePath = path.join(__dirname, '..', 'uploads', 'avatars', profileFilename)

		// Configuração baseada em src/lib/profileImage.ts
		const profileSize = parseInt(process.env.PROFILE_IMAGE_SIZE) || 64
		const profileQuality = parseInt(process.env.PROFILE_IMAGE_QUALITY) || 85

		await sharp(buffer)
			.rotate() // Rotação automática baseada em EXIF
			.resize(profileSize, profileSize, { fit: 'cover' })
			.webp({ quality: profileQuality })
			.toFile(profilePath)

		console.log('✅ Imagem de perfil gerada:', profileFilename)
		return `${process.env.FILE_SERVER_URL}/files/avatars/${profileFilename}`
	} catch (error) {
		console.error('❌ Erro ao gerar imagem de perfil:', error)
		return null
	}
}

// Endpoint principal de upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'Nenhum arquivo enviado' })
		}

		// Validar tipo de arquivo
		const isValidType = await validateFileType(req.file.buffer)
		if (!isValidType) {
			return res.status(400).json({ error: 'Tipo de arquivo não permitido' })
		}

		// Gerar nome único
		const filename = generateUniqueFilename(req.file.originalname)
		const uploadDir = path.join(__dirname, '..', 'uploads', 'general')

		// Garantir que diretório existe
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true })
		}

		// Otimizar imagem automaticamente (baseado no código existente)
		const optimizedUrl = await optimizeImage(req.file.buffer, filename, 'general')
		const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp'
		const fileUrl = optimizedUrl || `${process.env.FILE_SERVER_URL}/files/general/${optimizedFilename}`

		// Resposta padronizada
		const response = {
			key: optimizedFilename,
			name: req.file.originalname,
			size: req.file.size,
			url: fileUrl,
			// Campos adicionais
			id: optimizedFilename,
			status: 'uploaded',
			optimized: !!optimizedUrl, // Indica se foi otimizada
		}

		console.log('✅ Upload concluído:', optimizedFilename)
		res.json(response)
	} catch (error) {
		console.error('❌ Erro no upload:', error)
		res.status(500).json({ error: 'Erro interno do servidor' })
	}
})

// Endpoint específico para avatars
app.post('/upload/avatar', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' })
		}

		const isValidType = await validateFileType(req.file.buffer)
		if (!isValidType) {
			return res.status(400).json({ success: false, error: 'Tipo de arquivo não permitido' })
		}

		const filename = generateUniqueFilename(req.file.originalname)
		const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars')

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true })
		}

		// Limpar avatars anteriores (manter apenas o mais recente)
		try {
			const existingFiles = fs.readdirSync(uploadDir)
			for (const file of existingFiles) {
				if (file.endsWith('.webp')) {
					const filePath = path.join(uploadDir, file)
					fs.unlinkSync(filePath)
					console.log('🗑️ Avatar anterior removido:', file)
				}
			}
		} catch (cleanupError) {
			console.log('⚠️ Erro ao limpar avatars anteriores:', cleanupError.message)
		}

		// Gerar avatar quadrado otimizado (baseado em src/lib/profileImage.ts)
		const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp'
		const optimizedPath = path.join(uploadDir, optimizedFilename)

		const avatarSize = parseInt(process.env.PROFILE_IMAGE_SIZE) || 64
		const avatarQuality = parseInt(process.env.PROFILE_IMAGE_QUALITY) || 85

		await sharp(req.file.buffer)
			.rotate() // Rotação automática baseada em EXIF
			.resize(avatarSize, avatarSize, { fit: 'cover' }) // Quadrado com crop
			.webp({ quality: avatarQuality })
			.toFile(optimizedPath)

		const fileUrl = `${process.env.FILE_SERVER_URL}/files/avatars/${optimizedFilename}`

		const response = {
			success: true,
			message: 'Upload de avatar concluído com sucesso!',
			data: {
				key: optimizedFilename,
				name: req.file.originalname,
				size: req.file.size,
				url: fileUrl,
				optimized: true,
			},
		}

		console.log('✅ Avatar upload concluído:', optimizedFilename)
		res.json(response)
	} catch (error) {
		console.error('❌ Erro no upload de avatar:', error)
		res.status(500).json({ success: false, error: 'Erro interno do servidor' })
	}
})

// Endpoint para upload de contatos
app.post('/upload/contact', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' })
		}

		const isValidType = await validateFileType(req.file.buffer)
		if (!isValidType) {
			return res.status(400).json({ success: false, error: 'Tipo de arquivo não permitido' })
		}

		const filename = generateUniqueFilename(req.file.originalname)
		const uploadDir = path.join(__dirname, '..', 'uploads', 'contacts')

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true })
		}

		// Limpar imagens anteriores de contatos (manter apenas a mais recente)
		try {
			const existingFiles = fs.readdirSync(uploadDir)
			for (const file of existingFiles) {
				if (file.endsWith('.webp')) {
					const filePath = path.join(uploadDir, file)
					fs.unlinkSync(filePath)
					console.log('🗑️ Imagem anterior de contato removida:', file)
				}
			}
		} catch (cleanupError) {
			console.log('⚠️ Erro ao limpar imagens anteriores de contatos:', cleanupError.message)
		}

		// Gerar imagem quadrada otimizada (igual ao avatar)
		const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp'
		const optimizedPath = path.join(uploadDir, optimizedFilename)

		const contactSize = parseInt(process.env.PROFILE_IMAGE_SIZE) || 64
		const contactQuality = parseInt(process.env.PROFILE_IMAGE_QUALITY) || 85

		await sharp(req.file.buffer)
			.rotate() // Rotação automática baseada em EXIF
			.resize(contactSize, contactSize, { fit: 'cover' }) // Quadrado com crop
			.webp({ quality: contactQuality })
			.toFile(optimizedPath)

		const fileUrl = `${process.env.FILE_SERVER_URL}/files/contacts/${optimizedFilename}`

		const response = {
			success: true,
			message: 'Upload de contato concluído com sucesso!',
			data: {
				key: optimizedFilename,
				name: req.file.originalname,
				size: req.file.size,
				url: fileUrl,
				optimized: true,
			},
		}

		console.log('✅ Contato upload concluído:', optimizedFilename)
		res.json(response)
	} catch (error) {
		console.error('❌ Erro no upload de contato:', error)
		res.status(500).json({ success: false, error: 'Erro interno do servidor' })
	}
})

// Endpoint para upload múltiplo de problemas
app.post('/upload/problem', upload.array('files', 3), async (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' })
		}

		const uploadedFiles = []
		const uploadDir = path.join(__dirname, '..', 'uploads', 'problems')

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true })
		}

		for (const file of req.files) {
			const isValidType = await validateFileType(file.buffer)
			if (!isValidType) {
				continue // Pular arquivos inválidos
			}

			const filename = generateUniqueFilename(file.originalname)

			// Otimizar imagem automaticamente
			const optimizedUrl = await optimizeImage(file.buffer, filename, 'problems')
			const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp'
			const fileUrl = optimizedUrl || `${process.env.FILE_SERVER_URL}/files/problems/${optimizedFilename}`

			uploadedFiles.push({
				key: optimizedFilename,
				name: file.originalname,
				size: file.size,
				url: fileUrl,
				optimized: !!optimizedUrl, // Indica se foi otimizada
			})
		}

		const response = {
			success: true,
			message: `${uploadedFiles.length} arquivo(s) de problema enviado(s) com sucesso!`,
			data: uploadedFiles,
		}

		console.log('✅ Problema upload concluído:', uploadedFiles.length, 'arquivos')
		res.json(response)
	} catch (error) {
		console.error('❌ Erro no upload de problema:', error)
		res.status(500).json({ success: false, error: 'Erro interno do servidor' })
	}
})

// Endpoint para upload múltiplo de soluções
app.post('/upload/solution', upload.array('files', 3), async (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' })
		}

		const uploadedFiles = []
		const uploadDir = path.join(__dirname, '..', 'uploads', 'solutions')

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true })
		}

		for (const file of req.files) {
			const isValidType = await validateFileType(file.buffer)
			if (!isValidType) {
				continue // Pular arquivos inválidos
			}

			const filename = generateUniqueFilename(file.originalname)

			// Otimizar imagem automaticamente
			const optimizedUrl = await optimizeImage(file.buffer, filename, 'solutions')
			const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp'
			const fileUrl = optimizedUrl || `${process.env.FILE_SERVER_URL}/files/solutions/${optimizedFilename}`

			uploadedFiles.push({
				key: optimizedFilename,
				name: file.originalname,
				size: file.size,
				url: fileUrl,
				optimized: !!optimizedUrl, // Indica se foi otimizada
			})
		}

		const response = {
			success: true,
			message: `${uploadedFiles.length} arquivo(s) de solução enviado(s) com sucesso!`,
			data: uploadedFiles,
		}

		console.log('✅ Solução upload concluído:', uploadedFiles.length, 'arquivos')
		res.json(response)
	} catch (error) {
		console.error('❌ Erro no upload de solução:', error)
		res.status(500).json({ success: false, error: 'Erro interno do servidor' })
	}
})

// Preflight OPTIONS para arquivos
app.options('/files/:type/:filename', (req, res) => {
	res.header('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
	res.header('Access-Control-Allow-Credentials', 'true')
	res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	res.header('Cross-Origin-Resource-Policy', 'cross-origin')
	res.status(200).end()
})

// Endpoint para servir arquivos
app.get('/files/:type/:filename', (req, res) => {
	const { type, filename } = req.params
	const filePath = path.join(__dirname, '..', 'uploads', type, filename)

	// Headers CORS específicos para arquivos
	res.header('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
	res.header('Access-Control-Allow-Credentials', 'true')
	res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	res.header('Cross-Origin-Resource-Policy', 'cross-origin')

	if (fs.existsSync(filePath)) {
		res.sendFile(filePath)
	} else {
		res.status(404).json({ error: 'Arquivo não encontrado' })
	}
})

// Endpoint para deletar arquivos
app.delete('/files/:type/:filename', (req, res) => {
	const { type, filename } = req.params
	const filePath = path.join(__dirname, '..', 'uploads', type, filename)

	try {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath)
			res.json({ success: true, message: 'Arquivo deletado com sucesso' })
		} else {
			res.status(404).json({ success: false, error: 'Arquivo não encontrado' })
		}
	} catch (error) {
		console.error('❌ Erro ao deletar arquivo:', error)
		res.status(500).json({ success: false, error: 'Erro interno do servidor' })
	}
})

// Health check
app.get('/health', (req, res) => {
	res.json({
		success: true,
		message: 'Servidor de arquivos funcionando',
		timestamp: new Date().toISOString(),
		port: PORT,
	})
})

// Função para limpeza automática de arquivos temporários
function cleanupTempFiles() {
	const tempDir = path.join(__dirname, '..', 'uploads', 'temp')
	if (fs.existsSync(tempDir)) {
		const files = fs.readdirSync(tempDir)
		const now = Date.now()
		const maxAge = 24 * 60 * 60 * 1000 // 24 horas

		files.forEach((file) => {
			const filePath = path.join(tempDir, file)
			const stats = fs.statSync(filePath)

			if (now - stats.mtime.getTime() > maxAge) {
				fs.unlinkSync(filePath)
				console.log('🗑️ Arquivo temporário removido:', file)
			}
		})
	}
}

// Limpeza automática a cada hora
setInterval(cleanupTempFiles, 60 * 60 * 1000)

// Iniciar servidor
app.listen(PORT, () => {
	console.log(`🚀 Servidor de arquivos SILO rodando na porta ${PORT}`)
	console.log(`📁 Uploads em: ${path.join(__dirname, '..', 'uploads')}`)
	console.log(`🔗 URL: ${process.env.FILE_SERVER_URL}`)
	console.log(`🗑️ Limpeza automática de arquivos temporários ativada`)
})
