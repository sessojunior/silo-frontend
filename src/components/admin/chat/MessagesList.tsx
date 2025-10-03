import { useMemo, useEffect, useRef } from 'react'
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
	activeTargetId,
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

	// === SISTEMA DE ROLAGEM AUTOMÁTICA INTELIGENTE ===
	
	// Refs para controle de rolagem automática
	const messagesEndRef = useRef<HTMLDivElement>(null) // Elemento invisível no final da lista para referência de scroll
	const messagesContainerRef = useRef<HTMLDivElement>(null) // Container principal com scroll
	const shouldAutoScrollRef = useRef(true) // Controla se deve fazer scroll automático (baseado na posição do usuário)
	const lastMessageCountRef = useRef(0) // Contador de mensagens anterior para detectar novas mensagens
	const isInitialLoadRef = useRef(true) // Flag para detectar carregamento inicial de uma conversa
	const isLoadingMessagesRef = useRef(false) // Flag para detectar quando está carregando mensagens (botões)

	/**
	 * DETECTOR DE MUDANÇA DE CONVERSA
	 * 
	 * Este useEffect detecta quando o usuário troca de conversa (activeTargetId muda)
	 * e reseta o estado de rolagem para garantir que a nova conversa role até o fim
	 */
	useEffect(() => {
		// Resetar estado para nova conversa
		isInitialLoadRef.current = true
		shouldAutoScrollRef.current = true
		lastMessageCountRef.current = 0
		isLoadingMessagesRef.current = false
	}, [activeTargetId])

	/**
	 * DETECTOR DE CARREGAMENTO DE MENSAGENS (BOTÕES)
	 * 
	 * Este useEffect detecta quando o usuário clica nos botões de carregar mensagens
	 * e desabilita temporariamente o auto-scroll para evitar rolagem indesejada
	 */
	useEffect(() => {
		// Se está carregando mensagens (botões), desabilitar auto-scroll
		if (isLoadingOlder || isLoadingNewer) {
			isLoadingMessagesRef.current = true
			shouldAutoScrollRef.current = false
			console.log('⚠️ [MessagesList] Carregando mensagens via botões - auto-scroll DESABILITADO')
		} else {
			// Quando termina o carregamento, reabilitar baseado na posição atual
			if (isLoadingMessagesRef.current) {
				isLoadingMessagesRef.current = false
				shouldAutoScrollRef.current = isUserNearBottom()
				console.log('✅ [MessagesList] Carregamento via botões finalizado - auto-scroll reabilitado:', shouldAutoScrollRef.current)
			}
		}
	}, [isLoadingOlder, isLoadingNewer])

	/**
	 * SISTEMA DE ROLAGEM AUTOMÁTICA UNIFICADO
	 * 
	 * Este useEffect gerencia TODA a rolagem automática de forma unificada:
	 * - Detecta mudanças no activeTargetId (nova conversa)
	 * - Detecta quando mensagens são carregadas pela primeira vez
	 * - Detecta novas mensagens (envio ou polling)
	 * - Executa rolagem apropriada para cada cenário
	 */
	useEffect(() => {
		const currentMessageCount = messages.length
		const previousMessageCount = lastMessageCountRef.current

		// CENÁRIO 1: Carregamento inicial da conversa (aguardar fim do loading)
		if (isInitialLoadRef.current && currentMessageCount > 0 && !isLoading) {
			shouldAutoScrollRef.current = true
			setTimeout(() => {
				console.log('✅ [MessagesList] Carregamento inicial - rolando para nova conversa')
				scrollToBottom()
				isInitialLoadRef.current = false
			}, 500) // Delay maior para garantir renderização completa
		}
		// CENÁRIO 2: Novas mensagens adicionadas (envio ou polling)
		else if (currentMessageCount > previousMessageCount && currentMessageCount > 0) {
			// NÃO ROLAR se estiver carregando mensagens via botões
			if (isLoadingMessagesRef.current) {
				console.log('⚠️ [MessagesList] Carregando mensagens via botões - NÃO rolando')
				return
			}
			
			// VERIFICAR POSIÇÃO ATUAL antes de decidir se rola
			const isCurrentlyAtBottom = isUserNearBottom()
			
			console.log('🔵 [MessagesList] Nova mensagem detectada:', {
				previousCount: previousMessageCount,
				currentCount: currentMessageCount,
				trigger: 'polling ou envio',
				isCurrentlyAtBottom,
				willScroll: isCurrentlyAtBottom
			})
			
			// SÓ ROLAR se o usuário estiver no fim da página
			if (isCurrentlyAtBottom) {
				setTimeout(() => {
					console.log('✅ [MessagesList] Usuário está no fim - rolando para nova mensagem')
					scrollToBottom()
				}, 200)
			} else {
				console.log('⚠️ [MessagesList] Usuário NÃO está no fim - NÃO rolando')
			}
		}
		// CENÁRIO 3: Conversa trocada (reset para nova conversa)
		else if (currentMessageCount === 0 && previousMessageCount > 0) {
			isInitialLoadRef.current = true
			shouldAutoScrollRef.current = true
		}
		
		lastMessageCountRef.current = currentMessageCount
	}, [activeTargetId, messages.length, isLoading])

	/**
	 * DETECTOR DE FIM DE CARREGAMENTO
	 * 
	 * Este useEffect detecta quando o carregamento termina e força a rolagem
	 * se for um carregamento inicial de uma nova conversa
	 */
	useEffect(() => {
		// Se acabou de carregar e há mensagens, e é carregamento inicial
		if (!isLoading && messages.length > 0 && isInitialLoadRef.current) {
			setTimeout(() => {
				console.log('✅ [MessagesList] Fim do carregamento - rolando para nova conversa')
				scrollToBottom()
				isInitialLoadRef.current = false
			}, 200)
		}
	}, [isLoading, messages.length])

	/**
	 * Verifica se o usuário está no fim da conversa
	 * Retorna true se o usuário estiver no final (com tolerância razoável)
	 * Tolerância de 20px para garantir que funcione quando está no final
	 */
	const isUserNearBottom = () => {
		if (!messagesContainerRef.current) return false
		
		const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
		const distanceFromBottom = scrollHeight - scrollTop - clientHeight
		
		// Verificação com tolerância razoável: considerar no fim se:
		// 1. Distância do fim <= 20px OU
		// 2. scrollTop está muito próximo do scrollHeight (usuário realmente no fim)
		const isAtBottom = distanceFromBottom <= 20 || scrollTop >= scrollHeight - clientHeight - 5
		
		
		return isAtBottom
	}

	/**
	 * Função para rolar suavemente até o final da lista de mensagens
	 * Versão suave e elegante
	 */
	const scrollToBottom = () => {
		// Estratégia principal: usar scrollIntoView com comportamento suave
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ 
				behavior: 'smooth',
				block: 'end'
			})
		}
		
		// Fallback: usar scrollTo com comportamento suave
		if (messagesContainerRef.current) {
			const container = messagesContainerRef.current
			
			// Verificar se realmente pode rolar
			if (container.scrollHeight <= container.clientHeight) {
				return
			}
			
			// Usar scrollTo com comportamento suave
			container.scrollTo({
				top: container.scrollHeight,
				behavior: 'smooth'
			})
		}
	}

	/**
	 * Detecta se o usuário está no fim da conversa para permitir auto-scroll inteligente
	 * 
	 * COMPORTAMENTO RIGOROSO:
	 * - Se usuário está no fim: auto-scroll para novas mensagens recebidas ou enviadas
	 * - Se usuário está no meio da rolagem: desabilita auto-scroll
	 * - Se usuário está lendo mensagens antigas: desabilita auto-scroll
	 * - Evita interromper a leitura do usuário com scrolls indesejados
	 * 
	 * CENÁRIOS DE ROLAGEM DESEJADA:
	 * ✅ Abertura de nova conversa (abrir grupo ou usuário): SEMPRE rola
	 * ✅ Envio de mensagem + usuário no fim: rola
	 * ❌ Envio de mensagem + usuário no meio: NÃO rola
	 * ❌ Clique em "mensagens anteriores": NÃO rola
	 * ❌ Clique em "mensagens posteriores": NÃO rola
	 */
	const handleScroll = () => {
		// Atualizar estado de rolagem baseado na posição atual
		shouldAutoScrollRef.current = isUserNearBottom()
	}


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
		CONTAINER PRINCIPAL COM SISTEMA DE SCROLL INTELIGENTE
		- ref={messagesContainerRef}: Referência para controle de scroll
		- onScroll={handleScroll}: Monitora posição do usuário para auto-scroll inteligente
		- overflow-y-auto: Permite scroll vertical
		- Background: Imagem de fundo do chat (claro/escuro)
	*/
	return (
		<div 
			ref={messagesContainerRef}
			onScroll={handleScroll}
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
					
					// Debug log para verificar a comparação (apenas quando currentUserId muda)
					if (process.env.NODE_ENV === 'development' && currentUserId) {
						console.log('🔵 [MessagesList] Usando mapa estável:', {
							messageId: message.id,
							senderUserId: message.senderUserId,
							currentUserId: currentUserId,
							isOwnMessage,
							senderName: message.senderName,
							mapSize: messageOwnershipMap.size
						})
					}
					
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

				{/* 
					ELEMENTO INVISÍVEL PARA SCROLL AUTOMÁTICO
					- Elemento de referência posicionado no final da lista
					- Usado pela função scrollToBottom() para rolar até o fim
					- Invisível ao usuário, apenas para controle de scroll
				*/}
				<div ref={messagesEndRef} />
			</div>
		</div>
	)
}
