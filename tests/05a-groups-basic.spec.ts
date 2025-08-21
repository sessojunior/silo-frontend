import { test, expect } from './utils/auth-helpers'

test.describe('👥 Grupos - Gestão Básica', () => {
	test('✅ Carregamento da página - estrutura básica', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Verificar se página carregou
		await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()

		// Verificar se botão de criar está presente
		await expect(authenticatedPage.getByRole('button', { name: /criar|novo/i })).toBeVisible()
	})

	test('✅ 6 grupos padrão presentes', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Verificar se grupos padrão estão presentes
		const defaultGroups = ['Administradores', 'Meteorologistas', 'Pesquisadores', 'Operadores', 'Suporte', 'Visitantes']

		for (const groupName of defaultGroups) {
			// Usar .first() para evitar strict mode violation
			await expect(authenticatedPage.getByText(groupName).first()).toBeVisible()
		}
	})

	test('✅ Navegação por abas - estrutura básica', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Verificar se abas estão presentes
		await expect(authenticatedPage.locator('a[role="button"]:has-text("Grupos")')).toBeVisible()
		await expect(authenticatedPage.locator('a[role="button"]:has-text("Usuários")')).toBeVisible()
	})

	test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Testar em resolução desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()

		// Testar em resolução tablet
		await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
		await authenticatedPage.reload()
		await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()

		// Testar em resolução mobile
		await authenticatedPage.setViewportSize({ width: 375, height: 667 })
		await authenticatedPage.reload()
		await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()

		// Voltar para desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
	})
})
