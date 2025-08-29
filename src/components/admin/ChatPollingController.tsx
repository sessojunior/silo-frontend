'use client'

import { useChatPolling } from '@/hooks/useChatPolling'

/**
 * Componente que controla o polling do chat baseado na preferência do usuário
 * Este componente não renderiza nada visual, apenas controla o comportamento do polling
 */
export default function ChatPollingController() {
	// Usar o hook personalizado para controlar o polling
	useChatPolling()

	// Este componente não renderiza nada visual
	return null
}
