import multer from 'multer'
import { config } from './config.js'

/**
 * Configuração do storage do Multer (memória)
 */
const storage = multer.memoryStorage()

/**
 * Configuração do Multer com validações
 */
export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFilesCount,
  },
  fileFilter: (req, file, cb) => {
    console.log('🔵 Multer fileFilter:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })

    // Validação básica de MIME type
    const allowedMimes = config.upload.allowedMimes
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      console.log('❌ Multer rejeitou arquivo por MIME type:', file.mimetype)
      cb(new Error('Tipo de arquivo não permitido') as any, false)
    }
  },
})

/**
 * Middleware para upload único
 */
export const uploadSingle = upload.single('file')

/**
 * Middleware para upload múltiplo
 */
export const uploadMultiple = upload.array('files', config.upload.maxFilesCount)
