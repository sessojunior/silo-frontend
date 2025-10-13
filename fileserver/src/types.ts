import { Request, Response } from 'express'

// Tipos para respostas de upload
export interface UploadResponse {
  key: string
  name: string
  size: number
  url: string
  id: string
  status: 'uploaded'
  optimized: boolean
}

export interface MultiUploadResponse {
  success: boolean
  message: string
  data: UploadResponse[]
}

export interface SingleUploadResponse {
  success: boolean
  message: string
  data: UploadResponse
}

// Tipos para respostas de erro
export interface ErrorResponse {
  success: false
  error: string
}

// Tipos para health check
export interface HealthCheckResponse {
  success: true
  message: string
  timestamp: string
  port: number
}

// Tipos para configuração do Multer
export interface MulterFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer
}

// Tipos para handlers do Express
export type ExpressHandler = (req: Request, res: Response) => Promise<void> | void
export type ExpressHandlerSync = (req: Request, res: Response) => void

// Tipos para configuração de otimização
export interface OptimizationConfig {
  avatar: {
    thumbnailSize: number
    thumbnailQuality: number
  }
  profile: {
    size: number
    quality: number
  }
  general: {
    maxWidth: number
    maxHeight: number
    quality: number
  }
}

// Tipos para configuração de upload
export interface UploadConfig {
  maxFileSize: number
  maxFilesCount: number
  allowedExtensions: string[]
  allowedMimes: string[]
}

// Tipos para configuração principal
export interface FileServerConfig {
  port: number
  fileServerUrl: string
  nextPublicAppUrl: string
  upload: UploadConfig
  optimization: OptimizationConfig
}
