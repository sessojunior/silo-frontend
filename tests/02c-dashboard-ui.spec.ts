import { test, expect } from './utils/auth-helpers'

test.describe('📊 Dashboard - Interface e Navegação', () => {
	test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento da página
		await authenticatedPage.waitForLoadState('networkidle')

		// Rolar a página para baixo para visualizar os gráficos
		await authenticatedPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

		// Aguardar um pouco para os gráficos renderizarem após o scroll
		await authenticatedPage.waitForTimeout(2000)

		// Testar resolução desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		await expect(authenticatedPage.getByText('Causas de problemas (28 dias)')).toBeVisible()

		// Testar resolução tablet
		await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
		await expect(authenticatedPage.getByText('Causas de problemas (28 dias)')).toBeVisible()

		// Testar resolução mobile
		await authenticatedPage.setViewportSize({ width: 375, height: 667 })
		await expect(authenticatedPage.getByText('Causas de problemas (28 dias)')).toBeVisible()

		// Voltar para resolução padrão
		await authenticatedPage.setViewportSize({ width: 1280, height: 720 })
	})

	test('✅ Navegação para outras páginas a partir do dashboard', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento da página
		await authenticatedPage.waitForLoadState('networkidle')

		// Rolar a página para baixo para visualizar os gráficos
		await authenticatedPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

		// Aguardar um pouco para os gráficos renderizarem após o scroll
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se links de navegação estão visíveis na sidebar
		await expect(authenticatedPage.getByRole('link', { name: /produtos/i })).toBeVisible()

		// Clicar em um link para verificar navegação - usar link mais confiável
		await authenticatedPage.getByRole('link', { name: /ajuda/i }).first().click()
		await authenticatedPage.waitForURL('/admin/help')
	})
})
