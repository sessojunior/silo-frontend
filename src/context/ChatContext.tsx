'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useUser } from '@/context/UserContext'

// === TIPOS ===

export type ChatChannel = {
	id: string
	name: string
	type: 'group' | 'direct'
	description: string
	icon: string
	color: string
	participantCount: number
	lastMessage: string
	lastMessageAt?: Date
	unreadCount: number
	isOnline: boolean
	lastSeen?: Date
}

export type ChatMessage = {
	id: string
	channelId: string
	senderId: string
	senderName: string
	senderEmail: string
	content: string | null
	messageType: string
	fileUrl: string | null
	fileName: string | null
	fileSize: number | null
	fileMimeType: string | null
	replyToId: string | null
	threadCount: number
	isEdited: boolean
	editedAt: Date | null
	createdAt: Date
	deletedAt: Date | null
}

export type TypingUser = {
	userId: string
	userName: string
	channelId: string
	timestamp: Date
}

type ChatContextType = {
	// Estados
	channels: ChatChannel[]
	messages: Record<string, ChatMessage[]>
	typingUsers: TypingUser[]
	isConnected: boolean
	isConnecting: boolean

	// Funções principais
	loadChannels: () => Promise<void>
	loadMessages: (channelId: string) => Promise<void>
	sendMessage: (channelId: string, content: string) => Promise<void>

	// WebSocket functions
	joinChannel: (channelId: string) => void
	leaveChannel: (channelId: string) => void
	startTyping: (channelId: string) => Promise<void>
	stopTyping: (channelId: string) => Promise<void>
	markMessagesAsRead: (messageIds: string[]) => Promise<void>

	// Legacy functions (mantidas para compatibilidade)
	fetchTypingIndicators: () => Promise<void>
	loadNotifications: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const user = useUser()
	const [channels, setChannels] = useState<ChatChannel[]>([])
	const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({})
	const [typingUsers] = useState<TypingUser[]>([])
	const [isConnected, setIsConnected] = useState(false)
	const [isConnecting] = useState(false)

	// === FUNÇÕES PRINCIPAIS ===

	const loadChannels = useCallback(async () => {
		try {
			console.log('🔵 [ChatContext] Carregando canais de chat...')
			const response = await fetch('/api/chat/channels')
			console.log('🔵 [ChatContext] Resposta da API canais:', response.status, response.statusText)

			if (response.ok) {
				const channelsData = await response.json()
				console.log('✅ [ChatContext] Canais carregados:', channelsData.length, channelsData)
				setChannels(channelsData)
			} else {
				const errorText = await response.text()
				console.log('❌ [ChatContext] Erro na API canais:', response.status, errorText)
			}
		} catch (error) {
			console.log('❌ [ChatContext] Erro ao carregar canais:', error)
		}
	}, [])

	const loadMessages = useCallback(async (channelId: string) => {
		try {
			console.log('🔵 [ChatContext] Carregando mensagens do canal:', channelId)
			const response = await fetch(`/api/chat/channels/${channelId}/messages`)
			console.log('🔵 [ChatContext] Resposta da API mensagens:', response.status, response.statusText)

			if (response.ok) {
				const messagesData = await response.json()
				console.log('✅ [ChatContext] Mensagens carregadas:', messagesData.length, messagesData)
				setMessages((prev) => ({ ...prev, [channelId]: messagesData }))
			} else {
				const errorText = await response.text()
				console.log('❌ [ChatContext] Erro na API mensagens:', response.status, errorText)
			}
		} catch (error) {
			console.log('❌ [ChatContext] Erro ao carregar mensagens:', error)
		}
	}, [])

	const sendMessage = useCallback(async (channelId: string, content: string) => {
		try {
			console.log('🔵 Enviando mensagem:', content.substring(0, 50))
			const response = await fetch('/api/chat/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ channelId, content }),
			})

			if (response.ok) {
				const newMessage = await response.json()
				console.log('✅ Mensagem criada:', newMessage)

				// Atualizar estado local imediatamente
				setMessages((prev) => ({
					...prev,
					[channelId]: [...(prev[channelId] || []), newMessage],
				}))

				console.log('✅ Mensagem adicionada ao estado local!')
			} else {
				const errorText = await response.text()
				console.log('❌ Erro na API ao enviar mensagem:', response.status, errorText)
			}
		} catch (error) {
			console.log('❌ Erro ao enviar mensagem:', error)
		}
	}, [])

	// === FUNÇÕES WEBSOCKET SIMPLIFICADAS ===

	const joinChannel = useCallback((channelId: string) => {
		console.log('🔵 Entrando no canal:', channelId)
		// TODO: Implementar WebSocket real
	}, [])

	const leaveChannel = useCallback((channelId: string) => {
		console.log('🔵 Saindo do canal:', channelId)
		// TODO: Implementar WebSocket real
	}, [])

	const startTyping = useCallback(async (channelId: string) => {
		console.log('🔵 Iniciando typing:', channelId)
		// TODO: Implementar WebSocket real
	}, [])

	const stopTyping = useCallback(async (channelId: string) => {
		console.log('🔵 Parando typing:', channelId)
		// TODO: Implementar WebSocket real
	}, [])

	const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
		try {
			console.log('🔵 Marcando mensagens como lidas:', messageIds.length)
			const response = await fetch('/api/chat/messages/read-status', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messageIds }),
			})

			if (response.ok) {
				console.log('✅ Mensagens marcadas como lidas')
			}
		} catch (error) {
			console.log('❌ Erro ao marcar mensagens como lidas:', error)
		}
	}, [])

	// === FUNÇÕES LEGACY ===

	const fetchTypingIndicators = useCallback(async () => {
		console.log('🔵 Carregando typing indicators')
		// TODO: Implementar
	}, [])

	const loadNotifications = useCallback(async () => {
		console.log('🔵 Carregando notificações')
		// TODO: Implementar
	}, [])

	// === INICIALIZAÇÃO ===

	useEffect(() => {
		if (user) {
			loadChannels()
			setIsConnected(true) // Mock connection
		}
	}, [user, loadChannels])

	const value: ChatContextType = {
		channels,
		messages,
		typingUsers,
		isConnected,
		isConnecting,
		loadChannels,
		loadMessages,
		sendMessage,
		joinChannel,
		leaveChannel,
		startTyping,
		stopTyping,
		markMessagesAsRead,
		fetchTypingIndicators,
		loadNotifications,
	}

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
	const context = useContext(ChatContext)
	if (context === undefined) {
		throw new Error('useChat must be used within a ChatProvider')
	}
	return context
}
