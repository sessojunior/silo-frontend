'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export type WebSocketMessage = {
	type: string
	[key: string]: unknown
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export type UseWebSocketOptions = {
	url: string
	token?: string
	autoConnect?: boolean
	reconnectInterval?: number
	maxReconnectAttempts?: number
	onMessage?: (message: WebSocketMessage) => void
	onConnect?: () => void
	onDisconnect?: () => void
	onError?: (error: Event) => void
}

export function useWebSocket(options: UseWebSocketOptions) {
	const { url, token, autoConnect = true, reconnectInterval = 3000, maxReconnectAttempts = 5, onMessage, onConnect, onDisconnect, onError } = options

	const [status, setStatus] = useState<WebSocketStatus>('disconnected')
	const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

	const ws = useRef<WebSocket | null>(null)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const reconnectAttemptsRef = useRef(0)
	const isManualCloseRef = useRef(false)

	// Construir URL com token
	const buildWebSocketUrl = useCallback(() => {
		const wsUrl = url.replace('http://', 'ws://').replace('https://', 'wss://')
		const separator = wsUrl.includes('?') ? '&' : '?'
		return token ? `${wsUrl}${separator}token=${encodeURIComponent(token)}` : wsUrl
	}, [url, token])

	// Conectar ao WebSocket
	const connect = useCallback(() => {
		if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
			return
		}

		try {
			console.log('🔵 Conectando ao WebSocket...')
			setStatus('connecting')

			const websocketUrl = buildWebSocketUrl()
			ws.current = new WebSocket(websocketUrl)

			ws.current.onopen = () => {
				console.log('✅ WebSocket conectado!')
				setStatus('connected')
				reconnectAttemptsRef.current = 0
				onConnect?.()
			}

			ws.current.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data)
					console.log('🔵 Mensagem WebSocket recebida:', message.type)
					setLastMessage(message)
					onMessage?.(message)
				} catch (error) {
					console.log('❌ Erro ao processar mensagem WebSocket:', error)
				}
			}

			ws.current.onclose = (event) => {
				console.log('🔵 WebSocket desconectado:', event.code, event.reason)
				setStatus('disconnected')
				ws.current = null
				onDisconnect?.()

				// Tentar reconectar se não foi fechamento manual
				if (!isManualCloseRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
					reconnectAttemptsRef.current++
					console.log(`🔄 Tentando reconectar... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)

					reconnectTimeoutRef.current = setTimeout(() => {
						connect()
					}, reconnectInterval)
				}
			}

			ws.current.onerror = (error) => {
				console.log('❌ Erro WebSocket:', error)
				setStatus('error')
				onError?.(error)
			}
		} catch (error) {
			console.log('❌ Erro ao criar WebSocket:', error)
			setStatus('error')
		}
	}, [buildWebSocketUrl, maxReconnectAttempts, reconnectInterval, onConnect, onMessage, onDisconnect, onError])

	// Desconectar do WebSocket
	const disconnect = useCallback(() => {
		isManualCloseRef.current = true

		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current)
			reconnectTimeoutRef.current = null
		}

		if (ws.current) {
			ws.current.close(1000, 'Manual disconnect')
			ws.current = null
		}

		setStatus('disconnected')
	}, [])

	// Enviar mensagem
	const sendMessage = useCallback((message: WebSocketMessage) => {
		if (ws.current?.readyState === WebSocket.OPEN) {
			try {
				ws.current.send(JSON.stringify(message))
				console.log('🔵 Mensagem WebSocket enviada:', message.type)
				return true
			} catch (error) {
				console.log('❌ Erro ao enviar mensagem WebSocket:', error)
				return false
			}
		} else {
			console.log('⚠️ WebSocket não está conectado')
			return false
		}
	}, [])

	// Reconectar manualmente
	const reconnect = useCallback(() => {
		isManualCloseRef.current = false
		reconnectAttemptsRef.current = 0
		disconnect()
		setTimeout(connect, 1000)
	}, [connect, disconnect])

	// Auto-conectar quando componente monta
	useEffect(() => {
		if (autoConnect) {
			connect()
		}

		return () => {
			disconnect()
		}
	}, [autoConnect, connect, disconnect])

	// Limpar timeouts quando componente desmonta
	useEffect(() => {
		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}
		}
	}, [])

	return {
		status,
		lastMessage,
		isConnected: status === 'connected',
		isConnecting: status === 'connecting',
		connect,
		disconnect,
		reconnect,
		sendMessage,
	}
}
