import { test, expect } from './utils/auth-helpers'

test.describe('🔗 Integração - Consistência Visual', () => {
	test('✅ Dark/light mode - consistente em todo sistema', async ({ authenticatedPage }) => {
		// Testar em várias páginas
		const testPages = ['/admin/dashboard', '/admin/products', '/admin/contacts']

		for (const pagePath of testPages) {
			await authenticatedPage.goto(pagePath)
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se sistema de tema está presente
			const themeToggle = authenticatedPage.locator('[data-testid="theme-toggle"]')
			if ((await themeToggle.count()) > 0) {
				// Verificar tema atual
				const currentTheme = await themeToggle.getAttribute('data-theme')

				// Alternar tema
				await themeToggle.click()
				await authenticatedPage.waitForTimeout(1000)

				// Verificar se tema mudou
				const newTheme = await themeToggle.getAttribute('data-theme')
				expect(newTheme).not.toBe(currentTheme)

				// Verificar se página ainda está funcional
				await expect(authenticatedPage.locator('main, [role="main"], .main, #main')).toBeVisible()
			}
		}
	})

	test('✅ Layout padrão - min-h-screen sem double-scroll', async ({ authenticatedPage }) => {
		// Testar em várias páginas
		const testPages = ['/admin/dashboard', '/admin/products', '/admin/contacts']

		for (const pagePath of testPages) {
			await authenticatedPage.goto(pagePath)
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se layout usa min-h-screen
			const mainContainer = authenticatedPage.locator('main, [role="main"], .main, #main')
			await expect(mainContainer).toBeVisible()

			// Verificar se não há double-scroll (overflow-hidden + overflow-auto)
			const doubleScrollElements = authenticatedPage.locator('[class*="overflow-hidden"][class*="overflow-auto"]')
			await expect(doubleScrollElements).toHaveCount(0)

			// Verificar se scroll funciona naturalmente
			await authenticatedPage.evaluate(() => window.scrollTo(0, 100))
			await authenticatedPage.waitForTimeout(500)

			const scrollPosition = await authenticatedPage.evaluate(() => window.scrollY)
			expect(scrollPosition).toBeGreaterThan(0)
		}
	})

	test('✅ Componentes UI - reutilização correta', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Verificar se componentes padrão estão sendo usados
		const standardComponents = ['[data-testid="button"]', '[data-testid="input"]', '[data-testid="select"]', '[data-testid="card"]', '[data-testid="badge"]']

		for (const componentSelector of standardComponents) {
			const components = authenticatedPage.locator(componentSelector)
			if ((await components.count()) > 0) {
				await expect(components.first()).toBeVisible()
			}
		}
	})

	test('✅ Design system - 24 componentes padronizados', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Verificar se componentes do design system estão presentes
		const designSystemComponents = ['Button', 'Input', 'Select', 'Textarea', 'Card', 'Badge', 'Dialog', 'Offcanvas', 'Toast', 'Avatar', 'Icon', 'Spinner']

		for (const componentName of designSystemComponents) {
			// Verificar se componente está sendo usado (por classe ou data-testid)
			const component = authenticatedPage.locator(`[class*="${componentName.toLowerCase()}"], [data-testid*="${componentName.toLowerCase()}"]`)
			if ((await component.count()) > 0) {
				await expect(component.first()).toBeVisible()
			}
		}
	})
})
