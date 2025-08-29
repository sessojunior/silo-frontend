'use client'

import { useEffect, useRef } from 'react'
import { useChat } from '@/context/ChatContext'

/**
 * Hook personalizado para controlar o polling do chat baseado na preferência do usuário
 * Permite parar e iniciar o polling quando o chat é desabilitado/habilitado
 * Notifica o servidor sobre mudanças no status do chat
 */
export function useChatPolling() {
	const { startPolling, stopPolling } = useChat()
	const isPollingActive = useRef(false)

	// Listener para mudanças na preferência de chat
	useEffect(() => {
		const handleChatPreferenceChange = async (event: CustomEvent) => {
			const { chatEnabled } = event.detail

			if (chatEnabled) {
				console.log('🔵 [useChatPolling] Chat habilitado - iniciando polling')
				if (!isPollingActive.current) {
					startPolling()
					isPollingActive.current = true
				}

				// Notificar o servidor que o chat foi ativado
				try {
					await fetch('/api/admin/chat/status', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status: 'enabled' }),
					})
					console.log('🔵 [useChatPolling] Servidor notificado: Chat ATIVADO')
				} catch (error) {
					console.error('❌ [useChatPolling] Erro ao notificar servidor:', error)
				}
			} else {
				console.log('🔵 [useChatPolling] Chat desabilitado - parando polling')
				if (isPollingActive.current) {
					stopPolling()
					isPollingActive.current = false
				}

				// Notificar o servidor que o chat foi desativado
				try {
					await fetch('/api/admin/chat/status', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status: 'disabled' }),
					})
					console.log('🔵 [useChatPolling] Servidor notificado: Chat DESATIVADO')
				} catch (error) {
					console.error('❌ [useChatPolling] Erro ao notificar servidor:', error)
				}
			}
		}

		// Verificar estado inicial das preferências
		const checkInitialChatState = async () => {
			try {
				const response = await fetch('/api/user-preferences')
				if (response.ok) {
					const data = await response.json()
					const enabled = data.userPreferences?.chatEnabled !== false

					if (!enabled) {
						console.log('🔵 [useChatPolling] Chat inicialmente desabilitado - parando polling')
						stopPolling()
						isPollingActive.current = false

						// Notificar servidor sobre estado inicial
						try {
							await fetch('/api/admin/chat/status', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ status: 'disabled' }),
							})
							console.log('🔵 [useChatPolling] Servidor notificado: Estado inicial - Chat DESATIVADO')
						} catch (error) {
							console.error('❌ [useChatPolling] Erro ao notificar servidor sobre estado inicial:', error)
						}
					} else {
						console.log('🔵 [useChatPolling] Chat inicialmente habilitado - polling ativo')
						isPollingActive.current = true

						// Notificar servidor sobre estado inicial
						try {
							await fetch('/api/admin/chat/status', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ status: 'enabled' }),
							})
							console.log('🔵 [useChatPolling] Servidor notificado: Estado inicial - Chat ATIVADO')
						} catch (error) {
							console.error('❌ [useChatPolling] Erro ao notificar servidor sobre estado inicial:', error)
						}
					}
				}
			} catch (error) {
				console.error('❌ [useChatPolling] Erro ao verificar preferências iniciais:', error)
			}
		}

		// Verificar estado inicial
		checkInitialChatState()

		// Adicionar listener para mudanças
		window.addEventListener('chatPreferenceChanged', handleChatPreferenceChange as unknown as EventListener)

		// Cleanup
		return () => {
			window.removeEventListener('chatPreferenceChanged', handleChatPreferenceChange as unknown as EventListener)
		}
	}, [startPolling, stopPolling])

	return {
		isPollingActive: isPollingActive.current,
	}
}
