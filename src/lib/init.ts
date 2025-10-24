/**
 * Inicialização da aplicação
 * Executa validações e configurações que devem rodar apenas em runtime
 */

import { configValidation } from '@/lib/config'

// Flag para evitar execução múltipla
let initialized = false

export function initializeApp(): void {
	if (initialized) return
	
	// Validar configuração apenas em produção e runtime
	if (process.env.NODE_ENV === 'production') {
		try {
			configValidation.validateProductionConfig()
			console.log('✅ [INIT] Configuração validada com sucesso')
		} catch (error) {
			console.error('❌ [INIT] Erro na validação de configuração:', error)
			throw error
		}
	}
	
	initialized = true
}

// Auto-inicialização quando o módulo é importado (apenas em runtime)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
	// Executa apenas no servidor e em produção
	initializeApp()
}
