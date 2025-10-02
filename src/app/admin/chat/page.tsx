'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useChat } from '@/context/ChatContext'
import ChatSidebar from '@/components/admin/chat/ChatSidebar'
import ChatArea from '@/components/admin/chat/ChatArea'

export default function ChatPage() {
	const searchParams = useSearchParams()

	// Estado global do chat
	const { groups, users } = useChat()

	// Estado local para responsividade e seleção
	const [showSidebar, setShowSidebar] = useState(true)
	const [activeTargetId, setActiveTargetId] = useState<string | null>(null)
	const [activeTargetType, setActiveTargetType] = useState<'group' | 'user' | null>(null)

	// Verificar parâmetros da URL para abrir conversa específica
	useEffect(() => {
		const groupId = searchParams.get('groupId')
		const userId = searchParams.get('userId')

		if (groupId) {
			console.log('🔵 [ChatPage] Abrindo grupo via URL:', groupId)
			setActiveTargetId(groupId)
			setActiveTargetType('group')
		} else if (userId) {
			console.log('🔵 [ChatPage] Abrindo conversa via URL:', userId)
			setActiveTargetId(userId)
			setActiveTargetType('user')
		}
	}, [searchParams])

	// Debug: carregar dados e verificar se há grupos/usuários
	useEffect(() => {
		console.log('🔵 [ChatPage] Dados carregados:', {
			groups: groups?.length || 0,
			users: users?.length || 0,
		})

		if (groups?.length > 0) {
			console.log(
				'🔵 [ChatPage] Grupos disponíveis:',
				groups.map((g) => ({ id: g.id, name: g.name })),
			)
		}

		if (users?.length > 0) {
			console.log(
				'🔵 [ChatPage] Usuários com conversas:',
				users.map((u) => ({ id: u.id, name: u.name, unread: u.unreadCount })),
			)
		}
	}, [groups, users])

	// Debug: monitorar mudanças de target ativo
	useEffect(() => {
		console.log('🔵 [ChatPage] Target ativo mudou:', {
			id: activeTargetId,
			type: activeTargetType,
		})
	}, [activeTargetId, activeTargetType])

	// Removido: Auto-seleção do primeiro grupo
	// O usuário deve clicar manualmente em um grupo para abrir a conversa

	// Handler para seleção de target (grupo ou usuário)
	const handleTargetSelect = (targetId: string, type: 'group' | 'user') => {
		console.log('🔵 [ChatPage] Selecionando target:', { targetId, type })
		setActiveTargetId(targetId)
		setActiveTargetType(type)
	}

	// Encontrar dados do target ativo
	const activeTarget = activeTargetType === 'group' ? groups.find((g) => g.id === activeTargetId) : users.find((u) => u.id === activeTargetId)

	return (
		<div className='flex flex-1 min-h-0 bg-zinc-50 dark:bg-zinc-900 overflow-hidden'>
			{/* Sidebar de Chat - 384px (w-96) */}
			<div
				className={`
					${showSidebar ? 'w-96' : 'w-0'} 
					transition-all duration-300 border-r border-zinc-200 dark:border-zinc-700 
					bg-white dark:bg-zinc-800 flex-shrink-0 overflow-hidden
				`}
			>
				<ChatSidebar activeTargetId={activeTargetId} activeTargetType={activeTargetType} onTargetSelect={handleTargetSelect} />
			</div>

			{/* Área Principal de Chat */}
			<div className='flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden'>
				<ChatArea activeTargetId={activeTargetId} activeTargetType={activeTargetType} activeTarget={activeTarget} onToggleSidebar={() => setShowSidebar(!showSidebar)} />
			</div>
		</div>
	)
}
