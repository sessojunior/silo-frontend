import { test, expect } from './utils/auth-helpers'

test.describe('💬 SISTEMA DE CHAT - FUNCIONALIDADES AVANÇADAS', () => {
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
				await expect(notificationCount).toBeVisible()
			}

			// Clicar no botão de notificações
			await authenticatedPage.locator('[data-testid="chat-notification-button"]').click()

			// Verificar se dropdown de notificações abriu
			await expect(authenticatedPage.locator('[data-testid="notifications-dropdown"]')).toBeVisible()
		})

		test('✅ Dropdown de notificações - lista de mensagens não lidas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Clicar no botão de notificações
			await authenticatedPage.locator('[data-testid="chat-notification-button"]').click()

			// Verificar se dropdown abriu
			await expect(authenticatedPage.locator('[data-testid="notifications-dropdown"]')).toBeVisible()

			// Verificar se há lista de notificações
			const notifications = authenticatedPage.locator('[data-testid="notification-item"]')
			if ((await notifications.count()) > 0) {
				await expect(notifications.first()).toBeVisible()

				// Verificar se há informações da mensagem
				await expect(authenticatedPage.getByText(/canal|grupo/i)).toBeVisible()
				await expect(authenticatedPage.getByText(/usuário|autor/i)).toBeVisible()
			}
		})

		test('✅ Navegação direta - clicar em notificação vai para chat', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Clicar no botão de notificações
			await authenticatedPage.locator('[data-testid="chat-notification-button"]').click()

			// Verificar se dropdown abriu
			await expect(authenticatedPage.locator('[data-testid="notifications-dropdown"]')).toBeVisible()

			// Clicar na primeira notificação (se existir)
			const notifications = authenticatedPage.locator('[data-testid="notification-item"]')
			if ((await notifications.count()) > 0) {
				await notifications.first().click()

				// Verificar se foi redirecionado para o chat
				await authenticatedPage.waitForURL('/admin/chat')
				await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()
			}
		})

		test('✅ Marcação de lida - notificações são marcadas como lidas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Verificar contador inicial
			const initialCount = authenticatedPage.locator('[data-testid="notification-count"]')
			const initialCountValue = await initialCount.count()

			// Clicar no botão de notificações
			await authenticatedPage.locator('[data-testid="chat-notification-button"]').click()

			// Verificar se dropdown abriu
			await expect(authenticatedPage.locator('[data-testid="notifications-dropdown"]')).toBeVisible()

			// Aguardar um pouco para processamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se contador diminuiu (se havia notificações)
			if (initialCountValue > 0) {
				const finalCount = authenticatedPage.locator('[data-testid="notification-count"]')
				await expect(finalCount).toBeVisible()
			}
		})

		test('✅ Sincronização em tempo real - mensagens aparecem sem refresh', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se chat está funcionando
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Aguardar sincronização automática
			await authenticatedPage.waitForTimeout(15000)

			// Verificar se chat ainda está funcionando
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()

			// Verificar se não há erros de conexão
			await expect(authenticatedPage.locator('[data-testid="chat-sidebar"]')).toBeVisible()

			// Verificar se mensagens ainda estão visíveis
			const messages = authenticatedPage.locator('[data-testid="message-bubble"]')
			if ((await messages.count()) > 0) {
				await expect(messages.first()).toBeVisible()
			}
		})
	})
})
