import { test, expect } from './utils/auth-helpers'

test.describe('👥 Grupos - Gestão de Usuários', () => {
	test('✅ Carregamento da página - estrutura básica', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Verificar se página carregou
		await expect(authenticatedPage.getByRole('heading', { name: /usuários/i })).toBeVisible()

		// Verificar se botão de criar está presente
		await expect(authenticatedPage.getByRole('button', { name: /criar|novo/i })).toBeVisible()
	})

	test('✅ Lista de usuários - estrutura básica', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Verificar se página carregou
		await expect(authenticatedPage.getByRole('heading', { name: /usuários/i })).toBeVisible()

		// Verificar se há usuários na lista
		await expect(authenticatedPage.locator('table tbody tr').first()).toBeVisible()
	})

	test('✅ Navegação por abas - estrutura básica', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Verificar se abas estão presentes
		await expect(authenticatedPage.locator('a[role="button"]:has-text("Grupos")')).toBeVisible()
		await expect(authenticatedPage.locator('a[role="button"]:has-text("Usuários")')).toBeVisible()
	})

	test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Testar em resolução desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		await expect(authenticatedPage.getByRole('heading', { name: /usuários/i })).toBeVisible()

		// Testar em resolução tablet
		await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
		await authenticatedPage.reload()
		await expect(authenticatedPage.getByRole('heading', { name: /usuários/i })).toBeVisible()

		// Testar em resolução mobile
		await authenticatedPage.setViewportSize({ width: 375, height: 667 })
		await authenticatedPage.reload()
		await expect(authenticatedPage.getByRole('heading', { name: /usuários/i })).toBeVisible()

		// Voltar para desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
	})
})
