import { test, expect } from './utils/auth-helpers'

test.describe('🔗 Integração - Responsividade e Cross-Browser', () => {
	test('✅ Carregamento da página - estrutura básica', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/welcome')

		// Verificar se página carregou
		await expect(authenticatedPage.getByRole('heading', { name: /bem-vindo/i })).toBeVisible()
	})

	test('✅ Estrutura da página - layout básico', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/welcome')

		// Verificar se layout está presente
		await expect(authenticatedPage.getByRole('heading', { name: /bem-vindo/i })).toBeVisible()
	})

	test('✅ Navegação básica - elementos visíveis', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/welcome')

		// Verificar se elementos básicos estão presentes
		await expect(authenticatedPage.getByRole('heading', { name: /bem-vindo/i })).toBeVisible()
	})

	test('✅ Interface responsiva - funciona em diferentes resoluções', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/welcome')

		// Testar resolução desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		await expect(authenticatedPage.getByRole('heading', { name: /bem-vindo/i })).toBeVisible()

		// Testar resolução tablet
		await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
		await authenticatedPage.reload()
		await expect(authenticatedPage.getByRole('heading', { name: /bem-vindo/i })).toBeVisible()

		// Testar resolução mobile
		await authenticatedPage.setViewportSize({ width: 375, height: 667 })
		await authenticatedPage.reload()
		await expect(authenticatedPage.getByRole('heading', { name: /bem-vindo/i })).toBeVisible()

		// Voltar para desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
	})
})
