import { test, expect } from './utils/auth-helpers'

test.describe('⚙️ Configurações - Funcionalidades Avançadas', () => {
	test('✅ Navegação entre abas', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Verificar se todas as abas estão visíveis
		await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toBeVisible()
		await expect(authenticatedPage.getByRole('tab', { name: /preferências/i })).toBeVisible()
		await expect(authenticatedPage.getByRole('tab', { name: /segurança/i })).toBeVisible()

		// Verificar se aba de perfil está ativa por padrão
		await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toHaveAttribute('aria-selected', 'true')

		// Clicar na aba de preferências
		await authenticatedPage.getByRole('tab', { name: /preferências/i }).click()

		// Verificar se aba de preferências está ativa
		await expect(authenticatedPage.getByRole('tab', { name: /preferências/i })).toHaveAttribute('aria-selected', 'true')
		await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).not.toHaveAttribute('aria-selected', 'true')

		// Clicar na aba de segurança
		await authenticatedPage.getByRole('tab', { name: /segurança/i }).click()

		// Verificar se aba de segurança está ativa
		await expect(authenticatedPage.getByRole('tab', { name: /segurança/i })).toHaveAttribute('aria-selected', 'true')
		await expect(authenticatedPage.getByRole('tab', { name: /preferências/i })).not.toHaveAttribute('aria-selected', 'true')
	})

	test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Testar resolução desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()
		await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toBeVisible()

		// Testar resolução tablet
		await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()
		await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toBeVisible()

		// Testar resolução mobile
		await authenticatedPage.setViewportSize({ width: 375, height: 667 })
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()
		await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toBeVisible()

		// Voltar para desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
	})
})
