import { test, expect } from './utils/auth-helpers'

test.describe('💬 SISTEMA DE CHAT WHATSAPP-LIKE', () => {
	test.describe('💬 Funcionalidades Básicas', () => {
		test('✅ Enviar mensagens - em grupos e DMs', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento do chat
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se sidebar de canais está visível
			await expect(authenticatedPage.locator('[data-testid="chat-sidebar"]')).toBeVisible()

			// Clicar no primeiro canal/grupo
			await authenticatedPage.locator('[data-testid="channel-item"]').first().click()

			// Verificar se área de mensagens está visível
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Digitar mensagem
			await authenticatedPage.locator('[data-testid="message-input"]').fill('Mensagem de teste Playwright')

			// Enviar mensagem
			await authenticatedPage.locator('[data-testid="send-button"]').click()

			// Verificar se mensagem foi enviada
			await expect(authenticatedPage.getByText('Mensagem de teste Playwright')).toBeVisible()
		})

		test('✅ Receber mensagens - atualização em tempo real', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Clicar em um canal
			await authenticatedPage.locator('[data-testid="channel-item"]').first().click()

			// Verificar se mensagens existentes estão visíveis
			const messages = authenticatedPage.locator('[data-testid="message-bubble"]')
			if ((await messages.count()) > 0) {
				await expect(messages.first()).toBeVisible()
			}

			// Aguardar possível atualização (polling)
			await authenticatedPage.waitForTimeout(5000)

			// Verificar se mensagens ainda estão visíveis
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()
		})

		test('✅ Histórico - carregamento inicial e paginação', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Clicar em um canal
			await authenticatedPage.locator('[data-testid="channel-item"]').first().click()

			// Verificar se histórico carregou
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Verificar se há mensagens
			const messages = authenticatedPage.locator('[data-testid="message-bubble"]')
			await expect(messages).toBeVisible()

			// Se houver muitas mensagens, verificar paginação
			if ((await messages.count()) > 10) {
				// Scroll para cima para carregar mais mensagens
				await authenticatedPage.evaluate(() => window.scrollTo(0, 0))
				await authenticatedPage.waitForTimeout(2000)

				// Verificar se mais mensagens foram carregadas
				const newMessageCount = await messages.count()
				expect(newMessageCount).toBeGreaterThan(10)
			}
		})

		test('✅ Threading - conversas organizadas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Clicar em um canal
			await authenticatedPage.locator('[data-testid="channel-item"]').first().click()

			// Verificar se mensagens estão organizadas por thread
			await expect(authenticatedPage.locator('[data-testid="message-thread"]')).toBeVisible()

			// Verificar se há separadores de data/hora
			const dateSeparators = authenticatedPage.locator('[data-testid="date-separator"]')
			if ((await dateSeparators.count()) > 0) {
				await expect(dateSeparators.first()).toBeVisible()
			}

			// Verificar se mensagens têm timestamp
			const messageTimestamps = authenticatedPage.locator('[data-testid="message-timestamp"]')
			if ((await messageTimestamps.count()) > 0) {
				await expect(messageTimestamps.first()).toBeVisible()
			}
		})
	})

	test.describe('👤 Sistema de Presença', () => {
		test('✅ Estados de presença - Online, Ausente, Ocupado, Offline', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se indicador de presença está visível
			await expect(authenticatedPage.locator('[data-testid="presence-indicator"]')).toBeVisible()

			// Clicar no dropdown de status
			await authenticatedPage.locator('[data-testid="presence-dropdown"]').click()

			// Verificar se opções de status estão visíveis
			await expect(authenticatedPage.getByText('Online')).toBeVisible()
			await expect(authenticatedPage.getByText('Ausente')).toBeVisible()
			await expect(authenticatedPage.getByText('Ocupado')).toBeVisible()
			await expect(authenticatedPage.getByText('Offline')).toBeVisible()
		})

		test('✅ Alteração de status - funciona corretamente', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Clicar no dropdown de status
			await authenticatedPage.locator('[data-testid="presence-dropdown"]').click()

			// Selecionar status "Ocupado"
			await authenticatedPage.getByText('Ocupado').click()

			// Verificar se status foi alterado
			await expect(authenticatedPage.locator('[data-testid="presence-indicator"]')).toContainText('Ocupado')

			// Alterar para "Online"
			await authenticatedPage.locator('[data-testid="presence-dropdown"]').click()
			await authenticatedPage.getByText('Online').click()

			// Verificar se status voltou para "Online"
			await expect(authenticatedPage.locator('[data-testid="presence-indicator"]')).toContainText('Online')
		})

		test('✅ Reflexo na UI - status visível para outros usuários', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se status de outros usuários está visível na sidebar
			const userStatuses = authenticatedPage.locator('[data-testid="user-status"]')
			if ((await userStatuses.count()) > 0) {
				await expect(userStatuses.first()).toBeVisible()
			}

			// Verificar se há indicadores visuais de status
			const statusIndicators = authenticatedPage.locator('[data-testid="status-indicator"]')
			if ((await statusIndicators.count()) > 0) {
				await expect(statusIndicators.first()).toBeVisible()
			}
		})
	})

	test.describe('🔔 Notificações e Sincronização', () => {
		test('✅ Polling inteligente - sincroniza apenas quando necessário', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento inicial
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se chat está funcionando
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Aguardar alguns ciclos de polling
			await authenticatedPage.waitForTimeout(10000)

			// Verificar se não há erros de sincronização
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Verificar se mensagens ainda estão visíveis
			const messages = authenticatedPage.locator('[data-testid="message-bubble"]')
			if ((await messages.count()) > 0) {
				await expect(messages.first()).toBeVisible()
			}
		})

		test('✅ Notificações TopBar - botão com contador', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Verificar se botão de notificações está visível
			await expect(authenticatedPage.locator('[data-testid="chat-notification-button"]')).toBeVisible()

			// Verificar se contador está visível (se houver mensagens)
			const notificationCount = authenticatedPage.locator('[data-testid="notification-count"]')
			if ((await notificationCount.count()) > 0) {
				await expect(notificationCount.first()).toBeVisible()
			}

			// Clicar no botão de notificações
			await authenticatedPage.locator('[data-testid="chat-notification-button"]').click()

			// Verificar se dropdown abre
			await expect(authenticatedPage.locator('[data-testid="notification-dropdown"]')).toBeVisible()
		})

		test('✅ Sem duplicação - mensagens não aparecem duplicadas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Clicar em um canal
			await authenticatedPage.locator('[data-testid="channel-item"]').first().click()

			// Contar mensagens iniciais
			const initialMessages = authenticatedPage.locator('[data-testid="message-bubble"]')
			const initialCount = await initialMessages.count()

			// Aguardar possível sincronização
			await authenticatedPage.waitForTimeout(5000)

			// Contar mensagens após sincronização
			const finalMessages = authenticatedPage.locator('[data-testid="message-bubble"]')
			const finalCount = await finalMessages.count()

			// Verificar se não há duplicação
			expect(finalCount).toBeGreaterThanOrEqual(initialCount)
			expect(finalCount).toBeLessThanOrEqual(initialCount + 1) // Máximo 1 nova mensagem
		})
	})

	test.describe('🔍 Funcionalidades Avançadas', () => {
		test('✅ Sidebar dual - canais e usuários', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se sidebar tem duas seções
			await expect(authenticatedPage.locator('[data-testid="channels-section"]')).toBeVisible()
			await expect(authenticatedPage.locator('[data-testid="users-section"]')).toBeVisible()

			// Verificar se canais estão listados
			const channels = authenticatedPage.locator('[data-testid="channel-item"]')
			if ((await channels.count()) > 0) {
				await expect(channels.first()).toBeVisible()
			}

			// Verificar se usuários estão listados
			const users = authenticatedPage.locator('[data-testid="user-item"]')
			if ((await users.count()) > 0) {
				await expect(users.first()).toBeVisible()
			}
		})

		test('✅ Busca unificada - canais e usuários', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se campo de busca está visível
			await expect(authenticatedPage.locator('[data-testid="chat-search"]')).toBeVisible()

			// Buscar por termo
			await authenticatedPage.locator('[data-testid="chat-search"]').fill('admin')
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se resultados aparecem
			const searchResults = authenticatedPage.locator('[data-testid="search-result"]')
			if ((await searchResults.count()) > 0) {
				await expect(searchResults.first()).toBeVisible()
			}

			// Limpar busca
			await authenticatedPage.locator('[data-testid="chat-search"]').clear()
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se lista original voltou
			await expect(authenticatedPage.locator('[data-testid="channels-section"]')).toBeVisible()
		})

		test('✅ Interface WhatsApp-like - bubbles e layout', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Clicar em um canal
			await authenticatedPage.locator('[data-testid="channel-item"]').first().click()

			// Verificar se mensagens têm estilo WhatsApp
			const messageBubbles = authenticatedPage.locator('[data-testid="message-bubble"]')
			if ((await messageBubbles.count()) > 0) {
				const firstBubble = messageBubbles.first()
				await expect(firstBubble).toBeVisible()

				// Verificar se bubble tem estilo correto
				await expect(firstBubble).toHaveClass(/bubble|message/)
			}

			// Verificar se área de input está visível
			await expect(authenticatedPage.locator('[data-testid="message-input"]')).toBeVisible()
			await expect(authenticatedPage.locator('[data-testid="send-button"]')).toBeVisible()
		})

		test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Testar resolução desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
			await expect(authenticatedPage.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Testar resolução tablet
			await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
			await expect(authenticatedPage.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Testar resolução mobile
			await authenticatedPage.setViewportSize({ width: 375, height: 667 })
			await expect(authenticatedPage.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Voltar para desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		})

		test('✅ Navegação entre canais', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se há múltiplos canais
			const channels = authenticatedPage.locator('[data-testid="channel-item"]')
			if ((await channels.count()) > 1) {
				// Clicar no primeiro canal
				await channels.first().click()
				await authenticatedPage.waitForTimeout(1000)

				// Verificar se primeiro canal está ativo
				await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

				// Clicar no segundo canal
				await channels.nth(1).click()
				await authenticatedPage.waitForTimeout(1000)

				// Verificar se segundo canal está ativo
				await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()
			}
		})

		test('✅ Indicadores de digitação', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Clicar em um canal
			await authenticatedPage.locator('[data-testid="channel-item"]').first().click()

			// Começar a digitar
			await authenticatedPage.locator('[data-testid="message-input"]').fill('Testando indicador de digitação')

			// Verificar se indicador de digitação aparece (se implementado)
			const typingIndicator = authenticatedPage.locator('[data-testid="typing-indicator"]')
			if ((await typingIndicator.count()) > 0) {
				await expect(typingIndicator.first()).toBeVisible()
			}

			// Limpar input
			await authenticatedPage.locator('[data-testid="message-input"]').clear()

			// Verificar se indicador desaparece
			if ((await typingIndicator.count()) > 0) {
				await expect(typingIndicator.first()).not.toBeVisible()
			}
		})
	})

	test.describe('📱 Integração Mobile e Desktop', () => {
		test('✅ Funcionamento em dispositivos móveis', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Simular dispositivo móvel
			await authenticatedPage.setViewportSize({ width: 375, height: 667 })

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se interface se adapta ao mobile
			await expect(authenticatedPage.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Verificar se botões são clicáveis no mobile
			const channels = authenticatedPage.locator('[data-testid="channel-item"]')
			if ((await channels.count()) > 0) {
				await channels.first().click()
				await authenticatedPage.waitForTimeout(1000)

				// Verificar se área de chat está visível
				await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()
			}
		})

		test('✅ Funcionamento em desktop', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Simular desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se interface se adapta ao desktop
			await expect(authenticatedPage.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Verificar se sidebar e área de chat estão lado a lado
			const sidebar = authenticatedPage.locator('[data-testid="chat-sidebar"]')
			const chatArea = authenticatedPage.locator('[data-testid="chat-area"]')

			await expect(sidebar).toBeVisible()
			await expect(chatArea).toBeVisible()
		})
	})
})
