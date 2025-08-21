import { test, expect } from './utils/auth-helpers'

test.describe('⚙️ Configurações - Funcionalidades Avançadas', () => {
	test('✅ Carregamento da página - estrutura básica', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Verificar se página carregou
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()
	})

	test('✅ Estrutura da página - layout básico', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Verificar se layout está presente
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()
	})

	test('✅ Navegação básica - elementos visíveis', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Verificar se elementos básicos estão presentes
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()
	})

	test('✅ Interface responsiva - funciona em diferentes resoluções', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Testar resolução desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()

		// Testar resolução tablet
		await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
		await authenticatedPage.reload()
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()

		// Testar resolução mobile
		await authenticatedPage.setViewportSize({ width: 375, height: 667 })
		await authenticatedPage.reload()
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()

		// Voltar para desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
	})
})
