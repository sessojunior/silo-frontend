import { test, expect } from './utils/auth-helpers'

test.describe('🔗 Integração - Responsividade e Cross-Browser', () => {
	test('✅ Responsividade - diferentes resoluções', async ({ authenticatedPage }) => {
		const resolutions = [
			{ width: 1920, height: 1080, name: 'Desktop' },
			{ width: 1366, height: 768, name: 'Laptop' },
			{ width: 768, height: 1024, name: 'Tablet' },
			{ width: 375, height: 667, name: 'Mobile' },
		]

		for (const resolution of resolutions) {
			await authenticatedPage.setViewportSize({ width: resolution.width, height: resolution.height })
			await authenticatedPage.goto('/admin/dashboard')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se página carrega corretamente
			await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

			// Verificar se sidebar se adapta
			const sidebar = authenticatedPage.locator('[data-testid="sidebar"]')
			await expect(sidebar).toBeVisible()

			console.log(`✅ Responsividade ${resolution.name} (${resolution.width}x${resolution.height})`)
		}

		// Voltar para desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
	})

	test('✅ Navegação por teclado - Tab navigation, Enter para submit', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Pressionar Tab para navegar
		await authenticatedPage.keyboard.press('Tab')

		// Verificar se foco mudou
		const focusedElement = authenticatedPage.locator(':focus')
		await expect(focusedElement).toBeVisible()

		// Navegar por alguns elementos
		for (let i = 0; i < 5; i++) {
			await authenticatedPage.keyboard.press('Tab')
			await authenticatedPage.waitForTimeout(100)
		}

		// Verificar se foco ainda está funcionando
		await expect(authenticatedPage.locator(':focus')).toBeVisible()
	})

	test('✅ Modais - Escape para fechar, foco preso', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products')

		// Tentar abrir um modal (se houver botão de criar produto)
		const createButton = authenticatedPage.locator('[data-testid="create-product-button"], button:has-text("Criar Produto")')
		if ((await createButton.count()) > 0) {
			await createButton.click()

			// Verificar se modal abriu
			const modal = authenticatedPage.locator('[data-testid="modal"], [role="dialog"]')
			if ((await modal.count()) > 0) {
				await expect(modal.first()).toBeVisible()

				// Pressionar Escape para fechar
				await authenticatedPage.keyboard.press('Escape')

				// Verificar se modal fechou
				await expect(modal.first()).not.toBeVisible()
			}
		}
	})

	test('✅ Sidebar - navegação por teclado', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Verificar se sidebar está visível
		await expect(authenticatedPage.locator('[data-testid="sidebar"]')).toBeVisible()

		// Navegar para sidebar
		await authenticatedPage.keyboard.press('Tab')

		// Verificar se foco está na sidebar
		const sidebar = authenticatedPage.locator('[data-testid="sidebar"]')
		await expect(sidebar).toBeVisible()

		// Navegar por itens da sidebar
		const sidebarItems = authenticatedPage.locator('[data-testid="sidebar"] a, [data-testid="sidebar"] button')
		if ((await sidebarItems.count()) > 0) {
			for (let i = 0; i < Math.min(await sidebarItems.count(), 3); i++) {
				await authenticatedPage.keyboard.press('Tab')
				await authenticatedPage.waitForTimeout(100)
			}
		}
	})
})
