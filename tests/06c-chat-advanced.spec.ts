import { test, expect } from './utils/auth-helpers'

test.describe('💬 SISTEMA DE CHAT - FUNCIONALIDADES AVANÇADAS', () => {
	test.describe('🔔 Notificações e Sincronização', () => {
		test('✅ Carregamento da página - estrutura básica', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Verificar se página carregou
			await expect(authenticatedPage.getByRole('heading', { name: /chat/i })).toBeVisible()

			// Verificar se área principal está presente
			await expect(authenticatedPage.locator('div.flex.bg-zinc-50.dark\\:bg-zinc-900').first()).toBeVisible()
		})

		test('✅ Estrutura da página - layout básico', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Verificar se layout está presente
			await expect(authenticatedPage.locator('div.flex.bg-zinc-50.dark\\:bg-zinc-900').first()).toBeVisible()
			await expect(authenticatedPage.locator('div.flex-1.flex.flex-col.min-w-0')).toBeVisible()
		})

		test('✅ Navegação básica - elementos visíveis', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Verificar se elementos básicos estão presentes
			await expect(authenticatedPage.getByRole('heading', { name: /chat/i })).toBeVisible()
			await expect(authenticatedPage.locator('div.flex.bg-zinc-50.dark\\:bg-zinc-900').first()).toBeVisible()
		})

		test('✅ Interface responsiva - funciona em diferentes resoluções', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/chat')

			// Testar resolução desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
			await expect(authenticatedPage.getByRole('heading', { name: /chat/i })).toBeVisible()

			// Testar resolução tablet
			await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
			await authenticatedPage.reload()
			await expect(authenticatedPage.getByRole('heading', { name: /chat/i })).toBeVisible()

			// Testar resolução mobile
			await authenticatedPage.setViewportSize({ width: 375, height: 667 })
			await authenticatedPage.reload()
			await expect(authenticatedPage.getByRole('heading', { name: /chat/i })).toBeVisible()

			// Voltar para desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		})
	})
})
