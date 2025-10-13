import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { fileTypeFromBuffer } from 'file-type'
import { v4 as uuidv4 } from 'uuid'
import { config } from './config.js'
import { MulterFile } from './types.js'
 
/**
 * Gera nome único para arquivo baseado no nome original
 * @param originalName - Nome original do arquivo
 * @returns Nome único gerado
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const name = path.basename(originalName, ext)
  const timestamp = Date.now()
  const random = uuidv4().substring(0, 8)
  return `${timestamp}-${random}${ext}`
}

/**
 * Valida tipo de arquivo usando file-type para maior segurança
 * @param buffer - Buffer do arquivo
 * @returns Promise<boolean> - true se válido, false caso contrário
 */
export async function validateFileType(buffer: Buffer): Promise<boolean> {
  try {
    console.log('🔵 Iniciando validação de arquivo:', {
      bufferLength: buffer.length,
      firstBytes: buffer.slice(0, 10).toString('hex'),
    })

    const fileType = await fileTypeFromBuffer(buffer)
    const allowedTypes = config.upload.allowedMimes

    console.log('🔵 Resultado da validação:', {
      detectedType: fileType?.mime,
      detectedExt: fileType?.ext,
      allowedTypes,
      isValid: allowedTypes.includes(fileType?.mime || ''),
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

/**
 * Gera thumbnail para avatar (baseado no código existente do SILO)
 * @param buffer - Buffer da imagem
 * @param filename - Nome do arquivo
 * @returns Promise<string | null> - URL do thumbnail ou null se erro
 */
export async function generateThumbnail(buffer: Buffer, filename: string): Promise<string | null> {
  try {
    const thumbFilename = `thumb-${filename.replace(/\.[^/.]+$/, '')}.webp`
    const thumbPath = path.join(process.cwd(), 'uploads', 'avatars', thumbFilename)

    // Configuração baseada em src/server/uploadthing.ts
    const thumbnailSize = config.optimization.avatar.thumbnailSize
    const thumbnailQuality = config.optimization.avatar.thumbnailQuality

    await sharp(buffer)
      .rotate() // Rotação automática baseada em EXIF (como em profileImage.ts)
      .resize(thumbnailSize, thumbnailSize, { fit: 'cover' })
      .webp({ quality: thumbnailQuality })
      .toFile(thumbPath)

    console.log('✅ Thumbnail gerado:', thumbFilename)
    return `${config.fileServerUrl}/files/avatars/${thumbFilename}`
  } catch (error) {
    console.error('❌ Erro ao gerar thumbnail:', error)
    return null
  }
}

/**
 * Otimiza imagem geral (baseada no código existente do SILO)
 * @param buffer - Buffer da imagem
 * @param filename - Nome do arquivo
 * @param type - Tipo de upload (general, problems, solutions, etc.)
 * @returns Promise<string | null> - URL da imagem otimizada ou null se erro
 */
export async function optimizeImage(buffer: Buffer, filename: string, type: string = 'general'): Promise<string | null> {
  try {
    // Substituir extensão original por .webp
    const optimizedFilename = filename.replace(/\.[^/.]+$/, '') + '.webp'
    const uploadDir = path.join(process.cwd(), 'uploads', type)
    const optimizedPath = path.join(uploadDir, optimizedFilename)

    // Configuração baseada em src/lib/profileImage.ts
    const maxWidth = config.optimization.general.maxWidth
    const maxHeight = config.optimization.general.maxHeight
    const quality = config.optimization.general.quality

    await sharp(buffer)
      .rotate() // Rotação automática baseada em EXIF
      .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toFile(optimizedPath)

    console.log('✅ Imagem otimizada e substituída:', optimizedFilename)
    return `${config.fileServerUrl}/files/${type}/${optimizedFilename}`
  } catch (error) {
    console.error('❌ Erro ao otimizar imagem:', error)
    return null
  }
}

/**
 * Gera imagem de perfil (baseada em profileImage.ts)
 * @param buffer - Buffer da imagem
 * @param userId - ID do usuário
 * @returns Promise<string | null> - URL da imagem de perfil ou null se erro
 */
export async function generateProfileImage(buffer: Buffer, userId: string): Promise<string | null> {
  try {
    const profileFilename = `${userId}.webp`
    const profilePath = path.join(process.cwd(), 'uploads', 'avatars', profileFilename)

    // Configuração baseada em src/lib/profileImage.ts
    const profileSize = config.optimization.profile.size
    const profileQuality = config.optimization.profile.quality

    await sharp(buffer)
      .rotate() // Rotação automática baseada em EXIF
      .resize(profileSize, profileSize, { fit: 'cover' })
      .webp({ quality: profileQuality })
      .toFile(profilePath)

    console.log('✅ Imagem de perfil gerada:', profileFilename)
    return `${config.fileServerUrl}/files/avatars/${profileFilename}`
  } catch (error) {
    console.error('❌ Erro ao gerar imagem de perfil:', error)
    return null
  }
}

/**
 * Cria diretório se não existir
 * @param dirPath - Caminho do diretório
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log('📁 Diretório criado:', dirPath)
  }
}

/**
 * Limpa arquivos antigos de um diretório específico
 * @param dirPath - Caminho do diretório
 * @param extension - Extensão dos arquivos a serem removidos (ex: '.webp')
 */
export function cleanupOldFiles(dirPath: string, extension: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      return
    }

    const existingFiles = fs.readdirSync(dirPath)
    for (const file of existingFiles) {
      if (file.endsWith(extension)) {
        const filePath = path.join(dirPath, file)
        fs.unlinkSync(filePath)
        console.log('🗑️ Arquivo anterior removido:', file)
      }
    }
  } catch (cleanupError) {
    console.log('⚠️ Erro ao limpar arquivos anteriores:', cleanupError instanceof Error ? cleanupError.message : 'Erro desconhecido')
  }
}

/**
 * Limpeza automática de arquivos temporários
 */
export function cleanupTempFiles(): void {
  const tempDir = path.join(process.cwd(), 'uploads', 'temp')
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
