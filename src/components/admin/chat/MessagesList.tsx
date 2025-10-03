import { useMemo, useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import { LoadMessagesButton } from './LoadMessagesButton'
import type { ChatMessage } from '@/context/ChatContext'

interface MessagesListProps {
	messages: ChatMessage[]
	isLoading: boolean
	isLoadingOlder: boolean
	isLoadingNewer: boolean
	hasMoreOlderMessages: boolean
	hasMoreNewerMessages: boolean
	olderMessagesRemaining: number
	newerMessagesRemaining: number
	currentUserId?: string
	activeTargetId?: string // ID da conversa ativa para detectar mudanças
	onLoadOlderMessages: () => void
	onLoadNewerMessages: () => void
}

export function MessagesList({
	messages,
	isLoading,
	isLoadingOlder,
	isLoadingNewer,
	hasMoreOlderMessages,
	hasMoreNewerMessages,
	olderMessagesRemaining,
	newerMessagesRemaining,
	currentUserId,
	onLoadOlderMessages,
	onLoadNewerMessages
}: MessagesListProps) {
	// Criar mapa estável de isOwnMessage para evitar mudanças de lado
	const messageOwnershipMap = useMemo(() => {
		const map = new Map<string, boolean>()
		
		if (currentUserId) {
			messages.forEach((message) => {
				const senderUserId = String(message.senderUserId || '')
				const currentUserIdStr = String(currentUserId || '')
				const isOwnMessage = Boolean(currentUserIdStr && senderUserId === currentUserIdStr)
				map.set(message.id, isOwnMessage)
			})
		}
		
		return map
	}, [messages, currentUserId])

	// === SISTEMA DE ROLAGEM SIMPLIFICADO ===
	
	// Refs para controle de rolagem
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const messagesContainerRef = useRef<HTMLDivElement>(null)

	// Estado para controlar visibilidade do botão "Ir para o fim"
	const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false)

	/**
	 * FUNÇÃO ÚNICA: Rola para o final da conversa
	 * Usada em todos os cenários que precisam rolar
	 */
	const scrollToBottom = (): void => {
		if (messagesContainerRef.current) {
			const container = messagesContainerRef.current
			// Scroll direto para o máximo possível (scrollHeight)
			container.scrollTo({
				top: container.scrollHeight,
				behavior: 'smooth'
			})
		}
	}


	/**
	 * FUNÇÃO: Verifica se usuário está TOTALMENTE no fim da conversa (para mostrar/esconder botão)
	 */
	const isUserTotallyAtBottom = (): boolean => {
		if (!messagesContainerRef.current) return false
		
		const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
		const distanceFromBottom = scrollHeight - scrollTop - clientHeight
		
		// Totalmente no fim = distância <= 5px (praticamente zero)
		return distanceFromBottom <= 5
	}

	// === CONTROLE DE VISIBILIDADE DO BOTÃO ===

	/**
	 * FUNÇÃO: Atualiza visibilidade do botão baseado na posição do scroll
	 */
	const updateScrollButtonVisibility = (): void => {
		if (!messagesContainerRef.current || !messages.length) {
			setShowScrollToBottomButton(false)
			return
		}

		const isTotallyAtBottom = isUserTotallyAtBottom()
		setShowScrollToBottomButton(!isTotallyAtBottom)
	}

	/**
	 * EFFECT: Detecta mudanças no scroll para controlar visibilidade do botão
	 */
	useEffect(() => {
		const container = messagesContainerRef.current
		if (!container) return

		const handleScroll = (): void => {
			updateScrollButtonVisibility()
		}

		// Adicionar listener de scroll
		container.addEventListener('scroll', handleScroll)

		// Verificar estado inicial
		updateScrollButtonVisibility()

		// Cleanup
		return () => {
			container.removeEventListener('scroll', handleScroll)
		}
	}, [messages.length, messagesContainerRef.current])

	/**
	 * EFFECT: Atualizar visibilidade quando mensagens mudam
	 */
	useEffect(() => {
		updateScrollButtonVisibility()
	}, [messages.length])



	if (isLoading) {
		return (
			<div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-700 relative bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/images/chat-light.jpg')] dark:bg-[url('/images/chat-dark.jpg')]">
				<div className="flex flex-col items-center justify-center min-h-full px-4">
					<div className="text-center">
						<div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
							<span className="icon-[lucide--loader-2] w-8 h-8 text-zinc-400 dark:text-zinc-500 animate-spin" />
						</div>
						<h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
							Carregando mensagens
						</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
							Aguarde enquanto buscamos as mensagens desta conversa...
						</p>
					</div>
				</div>
			</div>
		)
	}

	/* 
		CONTAINER PRINCIPAL COM SISTEMA DE SCROLL SIMPLIFICADO
		- ref={messagesContainerRef}: Referência para controle de scroll
		- overflow-y-auto: Permite scroll vertical
		- Background: Imagem de fundo do chat (claro/escuro)
	*/
	return (
		<div 
			ref={messagesContainerRef}
			className="flex-1 flex flex-col overflow-y-auto min-h-0 h-full p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-700 bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/images/chat-light.jpg')] dark:bg-[url('/images/chat-dark.jpg')]"
		>
			<div className="flex-1 flex flex-col">

				{/* Botão para carregar mensagens anteriores */}
				<LoadMessagesButton
					onClick={onLoadOlderMessages}
					isLoading={isLoadingOlder}
					hasMore={hasMoreOlderMessages}
					direction="older"
					count={olderMessagesRemaining}
				/>

				{/* Placeholder para conversa vazia */}
				{!isLoading && messages.length === 0 && (
					<div className="flex-1 flex flex-col items-center justify-center p-4">
						<div className="text-center">
							<div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
								<span className="icon-[lucide--message-circle] w-8 h-8 text-zinc-400 dark:text-zinc-500" />
							</div>
							<h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
								Nenhuma mensagem ainda
							</h3>
							<p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
								Esta conversa está vazia. Envie a primeira mensagem para começar!
							</p>
						</div>
					</div>
				)}

				{/* Placeholder de início da conversa - apenas quando não há mais mensagens antigas E há mensagens */}
				{!hasMoreOlderMessages && messages.length > 0 && (
					<div className="flex justify-center py-3">
						<div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-300 dark:border-zinc-700 rounded-full px-4 pt-0.5 pb-1">
							<span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
								Início da conversa
							</span>
						</div>
					</div>
				)}

				{/* Lista de mensagens */}
				{messages.map((message) => {
					// Usar mapa estável para evitar mudanças de lado
					const isOwnMessage = messageOwnershipMap.get(message.id) || false
					
					return (
						<MessageBubble
							key={message.id}
							message={message}
							isOwnMessage={isOwnMessage}
							showAvatar={true}
						/>
					)
				})}

				{/* Botão para carregar mensagens mais recentes */}
				<LoadMessagesButton
					onClick={onLoadNewerMessages}
					isLoading={isLoadingNewer}
					hasMore={hasMoreNewerMessages}
					direction="newer"
					count={newerMessagesRemaining}
				/>

				{/* Elemento invisível para scroll automático */}
				<div ref={messagesEndRef} />
			</div>

			{/* Botão fixo "Ir para o fim" - canto inferior direito */}
			{showScrollToBottomButton && (
				<div className="absolute bottom-32 right-6 z-10">
					<button
						onClick={scrollToBottom}
						className="bg-zinc-700 hover:bg-zinc-600 text-white size-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
						title="Ir para o fim da conversa"
					>
						<span className="icon-[lucide--arrow-down] w-5 h-5" />
					</button>
				</div>
			)}
		</div>
	)
}

