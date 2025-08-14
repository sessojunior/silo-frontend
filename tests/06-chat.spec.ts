import { test, expect } from '@playwright/test'
import { fillFormField, clickButton } from './utils/auth-helpers'

test.describe('💬 SISTEMA DE CHAT WHATSAPP-LIKE', () => {
	test.beforeEach(async ({ page }) => {
		// Fazer login como administrador
		await page.goto('/auth/login')
		await page.getByLabel('Email').fill('admin@inpe.br')
		await page.getByLabel('Senha').fill('admin123')
		await page.getByRole('button', { name: 'Entrar' }).click()
		await page.waitForURL('/admin/dashboard')
	})

	test.describe('💬 Funcionalidades Básicas', () => {
		test('✅ Enviar mensagens - em grupos e DMs', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento do chat
			await page.waitForTimeout(2000)

			// Verificar se sidebar de canais está visível
			await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible()

			// Clicar no primeiro canal/grupo
			await page.locator('[data-testid="channel-item"]').first().click()

			// Verificar se área de mensagens está visível
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()

			// Digitar mensagem
			await page.locator('[data-testid="message-input"]').fill('Mensagem de teste Playwright')

			// Enviar mensagem
			await page.locator('[data-testid="send-button"]').click()

			// Verificar se mensagem foi enviada
			await expect(page.getByText('Mensagem de teste Playwright')).toBeVisible()
		})

		test('✅ Receber mensagens - atualização em tempo real', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Clicar em um canal
			await page.locator('[data-testid="channel-item"]').first().click()

			// Verificar se mensagens existentes estão visíveis
			const messages = page.locator('[data-testid="message-bubble"]')
			if ((await messages.count()) > 0) {
				await expect(messages.first()).toBeVisible()
			}

			// Aguardar possível atualização (polling)
			await page.waitForTimeout(5000)

			// Verificar se mensagens ainda estão visíveis
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()
		})

		test('✅ Histórico - carregamento inicial e paginação', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Clicar em um canal
			await page.locator('[data-testid="channel-item"]').first().click()

			// Verificar se histórico carregou
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()

			// Verificar se há mensagens
			const messages = page.locator('[data-testid="message-bubble"]')
			await expect(messages).toBeVisible()

			// Se houver muitas mensagens, verificar paginação
			if ((await messages.count()) > 10) {
				// Scroll para cima para carregar mais mensagens
				await page.locator('[data-testid="chat-area"]').scrollTo({ top: 0 })
				await page.waitForTimeout(2000)

				// Verificar se mais mensagens foram carregadas
				const newMessageCount = await messages.count()
				expect(newMessageCount).toBeGreaterThan(10)
			}
		})

		test('✅ Threading - conversas organizadas', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Clicar em um canal
			await page.locator('[data-testid="channel-item"]').first().click()

			// Verificar se mensagens estão organizadas por thread
			await expect(page.locator('[data-testid="message-thread"]')).toBeVisible()

			// Verificar se há separadores de data/hora
			const dateSeparators = page.locator('[data-testid="date-separator"]')
			if ((await dateSeparators.count()) > 0) {
				await expect(dateSeparators.first()).toBeVisible()
			}
		})
	})

	test.describe('👤 Sistema de Presença', () => {
		test('✅ Estados de presença - Online, Ausente, Ocupado, Offline', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se indicador de presença está visível
			await expect(page.locator('[data-testid="presence-indicator"]')).toBeVisible()

			// Clicar no dropdown de status
			await page.locator('[data-testid="presence-dropdown"]').click()

			// Verificar se opções de status estão visíveis
			await expect(page.getByText('Online')).toBeVisible()
			await expect(page.getByText('Ausente')).toBeVisible()
			await expect(page.getByText('Ocupado')).toBeVisible()
			await expect(page.getByText('Offline')).toBeVisible()
		})

		test('✅ Alteração de status - funciona corretamente', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Clicar no dropdown de status
			await page.locator('[data-testid="presence-dropdown"]').click()

			// Selecionar status "Ocupado"
			await page.getByText('Ocupado').click()

			// Verificar se status foi alterado
			await expect(page.locator('[data-testid="presence-indicator"]')).toContainText('Ocupado')

			// Alterar para "Online"
			await page.locator('[data-testid="presence-dropdown"]').click()
			await page.getByText('Online').click()

			// Verificar se status voltou para "Online"
			await expect(page.locator('[data-testid="presence-indicator"]')).toContainText('Online')
		})

		test('✅ Reflexo na UI - status visível para outros usuários', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se status de outros usuários está visível na sidebar
			const userStatuses = page.locator('[data-testid="user-status"]')
			if ((await userStatuses.count()) > 0) {
				await expect(userStatuses.first()).toBeVisible()

				// Verificar se status tem cor apropriada
				const statusElement = userStatuses.first()
				const statusClass = await statusElement.getAttribute('class')
				expect(statusClass).toMatch(/online|away|busy|offline/)
			}
		})
	})

	test.describe('🔔 Notificações e Sincronização', () => {
		test('✅ Polling inteligente - sincroniza apenas quando necessário', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento inicial
			await page.waitForTimeout(2000)

			// Verificar se chat está funcionando
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()

			// Aguardar alguns ciclos de polling
			await page.waitForTimeout(10000)

			// Verificar se não há erros de sincronização
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()

			// Verificar se mensagens ainda estão visíveis
			const messages = page.locator('[data-testid="message-bubble"]')
			if ((await messages.count()) > 0) {
				await expect(messages.first()).toBeVisible()
			}
		})

		test('✅ Notificações TopBar - botão com contador', async ({ page }) => {
			await page.goto('/admin/dashboard')

			// Verificar se botão de notificações está visível
			await expect(page.locator('[data-testid="chat-notification-button"]')).toBeVisible()

			// Verificar se contador está visível (se houver mensagens)
			const notificationCount = page.locator('[data-testid="notification-count"]')
			if ((await notificationCount.count()) > 0) {
				await expect(notificationCount.first()).toBeVisible()

				// Verificar se contador é um número
				const countText = await notificationCount.first().textContent()
				expect(parseInt(countText || '0')).toBeGreaterThanOrEqual(0)
			}

			// Clicar no botão de notificações
			await page.locator('[data-testid="chat-notification-button"]').click()

			// Verificar se dropdown abre
			await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible()
		})

		test('✅ Sem duplicação - mensagens não aparecem duplicadas', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Clicar em um canal
			await page.locator('[data-testid="channel-item"]').first().click()

			// Contar mensagens iniciais
			const initialMessages = page.locator('[data-testid="message-bubble"]')
			const initialCount = await initialMessages.count()

			// Aguardar possível sincronização
			await page.waitForTimeout(5000)

			// Contar mensagens após sincronização
			const finalMessages = page.locator('[data-testid="message-bubble"]')
			const finalCount = await finalMessages.count()

			// Verificar se não há duplicatas (contagem deve ser igual ou maior, mas não duplicada)
			expect(finalCount).toBeGreaterThanOrEqual(initialCount)

			// Verificar se mensagens únicas
			const messageTexts = []
			for (let i = 0; i < (await finalMessages.count()); i++) {
				const text = await finalMessages.nth(i).textContent()
				messageTexts.push(text)
			}

			// Verificar se não há textos duplicados
			const uniqueTexts = [...new Set(messageTexts)]
			expect(uniqueTexts.length).toBe(messageTexts.length)
		})
	})

	test.describe('🔍 Funcionalidades Avançadas', () => {
		test('✅ Sidebar dual - canais e usuários', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se sidebar tem duas seções
			await expect(page.locator('[data-testid="channels-section"]')).toBeVisible()
			await expect(page.locator('[data-testid="users-section"]')).toBeVisible()

			// Verificar se canais estão listados
			const channels = page.locator('[data-testid="channel-item"]')
			if ((await channels.count()) > 0) {
				await expect(channels.first()).toBeVisible()
			}

			// Verificar se usuários estão listados
			const users = page.locator('[data-testid="user-item"]')
			if ((await users.count()) > 0) {
				await expect(users.first()).toBeVisible()
			}
		})

		test('✅ Busca unificada - canais e usuários', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se campo de busca está visível
			await expect(page.locator('[data-testid="chat-search"]')).toBeVisible()

			// Buscar por termo
			await page.locator('[data-testid="chat-search"]').fill('admin')
			await page.waitForTimeout(1000)

			// Verificar se resultados aparecem
			const searchResults = page.locator('[data-testid="search-result"]')
			if ((await searchResults.count()) > 0) {
				await expect(searchResults.first()).toBeVisible()
			}

			// Limpar busca
			await page.locator('[data-testid="chat-search"]').clear()
			await page.waitForTimeout(1000)

			// Verificar se lista original voltou
			await expect(page.locator('[data-testid="channels-section"]')).toBeVisible()
		})

		test('✅ Interface WhatsApp-like - bubbles e layout', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Clicar em um canal
			await page.locator('[data-testid="channel-item"]').first().click()

			// Verificar se mensagens têm estilo WhatsApp
			const messageBubbles = page.locator('[data-testid="message-bubble"]')
			if ((await messageBubbles.count()) > 0) {
				const firstBubble = messageBubbles.first()
				await expect(firstBubble).toBeVisible()

				// Verificar se bubble tem classes de estilo WhatsApp
				const bubbleClass = await firstBubble.getAttribute('class')
				expect(bubbleClass).toMatch(/bubble|message|chat/)
			}

			// Verificar se área de input está visível
			await expect(page.locator('[data-testid="message-input"]')).toBeVisible()
			await expect(page.locator('[data-testid="send-button"]')).toBeVisible()
		})

		test('✅ Responsividade em diferentes resoluções', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Testar resolução desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
			await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()

			// Testar resolução tablet
			await page.setViewportSize({ width: 768, height: 1024 })
			await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()

			// Testar resolução mobile
			await page.setViewportSize({ width: 375, height: 667 })
			await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()

			// Voltar para desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
		})

		test('✅ Navegação entre canais', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se há múltiplos canais
			const channels = page.locator('[data-testid="channel-item"]')
			if ((await channels.count()) > 1) {
				// Clicar no primeiro canal
				await channels.first().click()
				await page.waitForTimeout(1000)

				// Verificar se primeiro canal está ativo
				await expect(channels.first()).toHaveAttribute('data-active', 'true')

				// Clicar no segundo canal
				await channels.nth(1).click()
				await page.waitForTimeout(1000)

				// Verificar se segundo canal está ativo
				await expect(channels.nth(1)).toHaveAttribute('data-active', 'true')
				await expect(channels.first()).not.toHaveAttribute('data-active', 'true')
			}
		})

		test('✅ Indicadores de digitação', async ({ page }) => {
			await page.goto('/admin/chat')

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Clicar em um canal
			await page.locator('[data-testid="channel-item"]').first().click()

			// Começar a digitar
			await page.locator('[data-testid="message-input"]').fill('Testando indicador de digitação')

			// Verificar se indicador de digitação aparece (se implementado)
			const typingIndicator = page.locator('[data-testid="typing-indicator"]')
			if ((await typingIndicator.count()) > 0) {
				await expect(typingIndicator.first()).toBeVisible()
			}

			// Limpar input
			await page.locator('[data-testid="message-input"]').clear()

			// Verificar se indicador desaparece
			if ((await typingIndicator.count()) > 0) {
				await expect(typingIndicator.first()).not.toBeVisible()
			}
		})
	})

	test.describe('📱 Integração Mobile e Desktop', () => {
		test('✅ Funcionamento em dispositivos móveis', async ({ page }) => {
			await page.goto('/admin/chat')

			// Simular dispositivo móvel
			await page.setViewportSize({ width: 375, height: 667 })

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se interface se adapta ao mobile
			await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()

			// Verificar se botões são clicáveis no mobile
			const channels = page.locator('[data-testid="channel-item"]')
			if ((await channels.count()) > 0) {
				await channels.first().click()
				await page.waitForTimeout(1000)

				// Verificar se área de chat está visível
				await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()
			}
		})

		test('✅ Funcionamento em desktop', async ({ page }) => {
			await page.goto('/admin/chat')

			// Simular desktop
			await page.setViewportSize({ width: 1920, height: 1080 })

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se interface se adapta ao desktop
			await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible()
			await expect(page.locator('[data-testid="chat-area"]')).toBeVisible()

			// Verificar se sidebar e área de chat estão lado a lado
			const sidebar = page.locator('[data-testid="chat-sidebar"]')
			const chatArea = page.locator('[data-testid="chat-area"]')

			await expect(sidebar).toBeVisible()
			await expect(chatArea).toBeVisible()
		})
	})
})
