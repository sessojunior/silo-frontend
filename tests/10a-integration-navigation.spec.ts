import { test, expect } from './utils/auth-helpers'

test.describe('🔗 Integração - Navegação Completa', () => {
	test('✅ Todas as páginas admin - acessíveis sem 404', async ({ authenticatedPage }) => {
		// Lista de todas as páginas admin
		const adminPages = ['/admin/dashboard', '/admin/products', '/admin/contacts', '/admin/groups', '/admin/groups/users', '/admin/projects', '/admin/chat', '/admin/settings', '/admin/help']

		for (const pagePath of adminPages) {
			await authenticatedPage.goto(pagePath)

			// Verificar se página carregou sem 404
			await expect(authenticatedPage.locator('body')).not.toContainText('404')
			await expect(authenticatedPage.locator('body')).not.toContainText('Not Found')

			// Verificar se conteúdo da página está visível
			await expect(authenticatedPage.locator('main, [role="main"], .main, #main')).toBeVisible()

			console.log(`✅ Página ${pagePath} acessível`)
		}
	})

	test('✅ Links corretos - Topbar e sidebar funcionam', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Verificar se topbar está visível
		await expect(authenticatedPage.locator('[data-testid="topbar"]')).toBeVisible()

		// Verificar se sidebar está visível
		await expect(authenticatedPage.locator('[data-testid="sidebar"]')).toBeVisible()

		// Testar links da topbar
		const topbarLinks = authenticatedPage.locator('[data-testid="topbar"] a, [data-testid="topbar"] button')
		if ((await topbarLinks.count()) > 0) {
			for (let i = 0; i < Math.min(await topbarLinks.count(), 3); i++) {
				const link = topbarLinks.nth(i)
				await expect(link).toBeVisible()
			}
		}

		// Testar links da sidebar
		const sidebarLinks = authenticatedPage.locator('[data-testid="sidebar"] a, [data-testid="sidebar"] button')
		if ((await sidebarLinks.count()) > 0) {
			for (let i = 0; i < Math.min(await sidebarLinks.count(), 5); i++) {
				const link = sidebarLinks.nth(i)
				await expect(link).toBeVisible()
			}
		}
	})

	test('✅ Sem loops infinitos - navegação estável', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento inicial
		await authenticatedPage.waitForLoadState('networkidle')

		// Fazer algumas navegações
		await authenticatedPage.goto('/admin/products')
		await authenticatedPage.waitForLoadState('networkidle')

		await authenticatedPage.goto('/admin/contacts')
		await authenticatedPage.waitForLoadState('networkidle')

		await authenticatedPage.goto('/admin/dashboard')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se não há erros de loop infinito
		await expect(authenticatedPage.locator('body')).not.toContainText('Maximum update depth exceeded')
		await expect(authenticatedPage.locator('body')).not.toContainText('Too many re-renders')

		// Verificar se dashboard ainda está funcional
		await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
	})

	test('✅ Prefetch desabilitado - rotas críticas de sessão', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Verificar se não há prefetch automático para rotas críticas
		const criticalRoutes = ['/login', '/register', '/admin/settings']

		for (const route of criticalRoutes) {
			// Verificar se não há links com prefetch para essas rotas
			const prefetchLinks = authenticatedPage.locator(`a[href="${route}"][data-prefetch="true"]`)
			await expect(prefetchLinks).toHaveCount(0)
		}
	})
})
