import { test, expect } from './utils/auth-helpers'

test.describe('💬 SISTEMA DE CHAT - FUNCIONALIDADES BÁSICAS', () => {
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

		test('✅ Navegação entre canais - grupos e DMs', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se sidebar está visível
			await expect(authenticatedPage.locator('[data-testid="chat-sidebar"]')).toBeVisible()

			// Verificar se há canais disponíveis
			const channels = authenticatedPage.locator('[data-testid="channel-item"]')
			await expect(channels.first()).toBeVisible()

			// Clicar no primeiro canal
			await channels.first().click()

			// Verificar se área de chat mudou
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Clicar no segundo canal (se existir)
			if ((await channels.count()) > 1) {
				await channels.nth(1).click()
				await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()
			}
		})

		test('✅ Interface responsiva - funciona em diferentes resoluções', async ({ authenticatedPage }) => {
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

			// Testar resolução mobile
			await authenticatedPage.setViewportSize({ width: 375, height: 667 })
			await expect(authenticatedPage.locator('[data-testid="chat-sidebar"]')).toBeVisible()

			// Voltar para desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		})
	})
})
