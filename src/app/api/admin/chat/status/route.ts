import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { getNowTimestamp } from '@/lib/dateUtils'

/**
 * API endpoint para receber notificações sobre mudanças no status do chat
 * Permite que o servidor registre e controle quando o chat é ativado/desativado
 */
export async function POST(req: NextRequest) {
	try {
		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		// Obter dados da requisição
		const body = await req.json()
		const { status } = body

		// Validar status
		if (!status || !['enabled', 'disabled'].includes(status)) {
			return NextResponse.json({ success: false, error: 'Status inválido. Deve ser "enabled" ou "disabled"' }, { status: 400 })
		}

		// Log no servidor sobre mudança de status - timezone São Paulo
		const timestamp = getNowTimestamp()
		const statusText = status === 'enabled' ? 'ATIVADO' : 'DESATIVADO'

		console.log(`🔵 [SERVER] ${timestamp} - Sistema de chat ${statusText} para usuário: ${user.email} (${user.id})`)

		// Aqui você pode adicionar lógica adicional para:
		// - Registrar em log de sistema
		// - Atualizar métricas
		// - Notificar outros serviços
		// - Parar/iniciar processos de background

		if (status === 'disabled') {
			console.log(`🔵 [SERVER] ${timestamp} - Chat desabilitado - Polling e sincronização PARADOS para usuário: ${user.email}`)
		} else {
			console.log(`🔵 [SERVER] ${timestamp} - Chat habilitado - Polling e sincronização ATIVOS para usuário: ${user.email}`)
		}

		return NextResponse.json({
			success: true,
			message: `Status do chat atualizado para: ${status}`,
			userId: user.id,
			userEmail: user.email,
			status,
			timestamp,
		})
	} catch (error) {
		console.error('❌ [SERVER] Erro ao processar mudança de status do chat:', error)

		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
