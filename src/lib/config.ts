/**
 * Configuração centralizada do sistema SILO
 * 
 * Este arquivo centraliza todas as configurações de URLs e hosts,
 * garantindo que não haja URLs hardcoded em produção.
 * 
 * Em produção, todas as variáveis de ambiente devem estar configuradas,
 * caso contrário o sistema falhará explicitamente.
 */

/**
 * Configurações de URLs do sistema
 */
export const config = {
	/**
	 * URL do servidor de arquivos local
	 * Fallback para localhost:4000 em desenvolvimento
	 */
	get fileServerUrl(): string {
		const url = process.env.FILE_SERVER_URL
		if (!url && process.env.NODE_ENV === 'production') {
			throw new Error('FILE_SERVER_URL deve ser configurada em produção')
		}
		return url || 'http://localhost:4000'
	},

	/**
	 * URL base da aplicação Next.js
	 * Usado para redirecionamentos e callbacks
	 */
	get appUrl(): string {
		const url = process.env.APP_URL
		if (!url && process.env.NODE_ENV === 'production') {
			throw new Error('APP_URL deve ser configurada em produção')
		}
		return url || 'http://localhost:3000'
	},

	/**
	 * URL de callback do Google OAuth
	 * Usado para autenticação Google
	 */
	get googleCallbackUrl(): string {
		const url = process.env.GOOGLE_CALLBACK_URL
		if (!url && process.env.NODE_ENV === 'production') {
			throw new Error('GOOGLE_CALLBACK_URL deve ser configurada em produção')
		}
		return url || 'http://localhost:3000/api/auth/callback/google'
	},

	/**
	 * URL do proxy de upload
	 * Usado para interceptar uploads via Next.js
	 */
	get uploadProxyUrl(): string {
		const url = process.env.UPLOAD_PROXY_URL
		if (!url && process.env.NODE_ENV === 'production') {
			throw new Error('UPLOAD_PROXY_URL deve ser configurada em produção')
		}
		return url || 'http://localhost:4000/api/upload'
	},

	/**
	 * URL do banco de dados
	 * Deve estar sempre definida em produção
	 */
	get databaseUrl(): string {
		const url = process.env.DATABASE_URL
		if (!url && process.env.NODE_ENV === 'production') {
			throw new Error('DATABASE_URL deve ser configurada em produção')
		}
		return url || ''
	},

	/**
	 * Credenciais do Google OAuth
	 * Centraliza acesso aos valores sensíveis
	 */
	get googleClientId(): string {
		const id = process.env.GOOGLE_CLIENT_ID
		if (!id && process.env.NODE_ENV === 'production') {
			throw new Error('GOOGLE_CLIENT_ID deve ser configurada em produção')
		}
		return id || ''
	},

	get googleClientSecret(): string {
		const secret = process.env.GOOGLE_CLIENT_SECRET
		if (!secret && process.env.NODE_ENV === 'production') {
			throw new Error('GOOGLE_CLIENT_SECRET deve ser configurada em produção')
		}
		return secret || ''
	},

	/**
	 * Configurações de email (SMTP)
	 */
	get email() {
		const host = process.env.SMTP_HOST || ''
		const portRaw = process.env.SMTP_PORT || '587'
		const secure = process.env.SMTP_SECURE === 'true'
		const username = process.env.SMTP_USERNAME || ''
		const password = process.env.SMTP_PASSWORD || ''
		const from = username

		if (process.env.NODE_ENV === 'production') {
			const missing: string[] = []
			if (!host) missing.push('SMTP_HOST')
			if (!portRaw) missing.push('SMTP_PORT')
			if (!username) missing.push('SMTP_USERNAME')
			if (!password) missing.push('SMTP_PASSWORD')
			if (missing.length > 0) {
				throw new Error(`Variáveis SMTP obrigatórias não configuradas em produção: ${missing.join(', ')}`)
			}
		}

		const port = Number.parseInt(portRaw, 10)
		return { host, port, secure, username, password, from }
	},
}

/**
 * Utilitários para extrair informações de requisições HTTP
 */
export const requestUtils = {
	/**
	 * Extrai o host completo de uma requisição HTTP
	 * Considera headers de proxy (x-forwarded-proto, x-forwarded-host)
	 */
	getHostFromRequest(req: Request): string {
		const protocol = req.headers.get('x-forwarded-proto') || 'http'
		const host = req.headers.get('host') || config.appUrl.replace(/^https?:\/\//, '')
		return `${protocol}://${host}`
	},

	/**
	 * Verifica se uma URL é do servidor de arquivos local
	 */
	isFileServerUrl(url: string): boolean {
		return url.includes(`${config.fileServerUrl}/files/`)
	},

	/**
	 * Extrai o caminho do arquivo de uma URL do servidor de arquivos
	 */
	extractFilePath(url: string): string | null {
		if (!this.isFileServerUrl(url)) return null
		
		const urlParts = url.split('/files/')
		if (urlParts.length === 2) {
			return urlParts[1] // ex: "contacts/filename.webp"
		}
		return null
	},

	/**
	 * Constrói URL de delete para um arquivo no servidor de arquivos
	 */
	buildDeleteUrl(filePath: string): string {
		return `${config.fileServerUrl}/files/${filePath}`
	}
}

/**
 * Validações de configuração para produção
 */
export const configValidation = {
	/**
	 * Valida se todas as configurações necessárias estão definidas
	 * Deve ser chamada na inicialização da aplicação em produção
	 */
	validateProductionConfig(): void {
		if (process.env.NODE_ENV !== 'production') return

		const requiredVars = [
			'FILE_SERVER_URL',
			'APP_URL',
			'GOOGLE_CALLBACK_URL',
			'UPLOAD_PROXY_URL',
			'DATABASE_URL'
		]

		const missingVars = requiredVars.filter(varName => !process.env[varName])
		
		if (missingVars.length > 0) {
			throw new Error(
				`Variáveis de ambiente obrigatórias não configuradas em produção: ${missingVars.join(', ')}`
			)
		}
	}
}
