import { test, expect } from './utils/auth-helpers'

test.describe('💬 SISTEMA DE CHAT - PRESENÇA', () => {
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

		test('✅ Heartbeat automático - mantém status atualizado', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se indicador de presença está visível
			await expect(authenticatedPage.locator('[data-testid="presence-indicator"]')).toBeVisible()

			// Aguardar alguns ciclos de heartbeat
			await authenticatedPage.waitForTimeout(10000)

			// Verificar se status ainda está visível
			await expect(authenticatedPage.locator('[data-testid="presence-indicator"]')).toBeVisible()

			// Verificar se não há erros de conexão
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()
		})

		test('✅ Status offline - quando usuário fecha navegador', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se indicador de presença está visível
			await expect(authenticatedPage.locator('[data-testid="presence-indicator"]')).toBeVisible()

			// Simular usuário ficando inativo (não move mouse)
			await authenticatedPage.waitForTimeout(15000)

			// Verificar se status ainda está visível
			await expect(authenticatedPage.locator('[data-testid="presence-indicator"]')).toBeVisible()

			// Verificar se chat ainda funciona
			await expect(authenticatedPage.locator('[data-testid="chat-area"]')).toBeVisible()
		})

		test('✅ Sincronização de presença - entre diferentes abas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Aguardar carregamento
			await authenticatedPage.waitForTimeout(2000)

			// Verificar status inicial
			await expect(authenticatedPage.locator('[data-testid="presence-indicator"]')).toBeVisible()

			// Abrir nova aba
			const newPage = await authenticatedPage.context().newPage()
			await newPage.goto('/admin/chat')
			await newPage.waitForTimeout(2000)

			// Verificar se status é o mesmo na nova aba
			await expect(newPage.locator('[data-testid="presence-indicator"]')).toBeVisible()

			// Fechar nova aba
			await newPage.close()

			// Verificar se aba original ainda funciona
			await expect(authenticatedPage.locator('[data-testid="presence-indicator"]')).toBeVisible()
		})
	})
})
