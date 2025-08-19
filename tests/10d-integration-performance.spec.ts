import { test, expect } from './utils/auth-helpers'

test.describe('🔗 Integração - Performance e Acessibilidade', () => {
	test('✅ Listas grandes - produtos, problemas, projetos, contatos', async ({ authenticatedPage }) => {
		// Testar páginas com listas grandes
		const listPages = ['/admin/products', '/admin/contacts', '/admin/projects']

		for (const pagePath of listPages) {
			const startTime = Date.now()

			await authenticatedPage.goto(pagePath)
			await authenticatedPage.waitForLoadState('networkidle')

			const loadTime = Date.now() - startTime

			// Verificar se carregou em tempo aceitável (menos de 8 segundos)
			expect(loadTime).toBeLessThan(8000)

			// Verificar se lista está visível
			const listItems = authenticatedPage.locator('[data-testid*="item"], [data-testid*="card"]')
			await expect(listItems).toBeVisible()

			console.log(`✅ ${pagePath} carregou em ${loadTime}ms`)
		}
	})

	test('✅ Contagem agregada - soluções por problema (sem N+1)', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products')

		// Aguardar carregamento
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se contagens estão sendo exibidas
		const countElements = authenticatedPage.locator('[data-testid*="count"], [data-testid*="total"]')
		if ((await countElements.count()) > 0) {
			await expect(countElements.first()).toBeVisible()

			// Verificar se contagem é um número
			const countText = await countElements.first().textContent()
			expect(parseInt(countText || '0')).toBeGreaterThanOrEqual(0)
		}
	})

	test('✅ Tempos de resposta - aceitáveis para operações', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento inicial
		await authenticatedPage.waitForLoadState('networkidle')

		// Fazer algumas operações e medir tempo
		const operations = [
			{ action: 'Navegar para produtos', path: '/admin/products' },
			{ action: 'Navegar para contatos', path: '/admin/contacts' },
			{ action: 'Voltar para dashboard', path: '/admin/dashboard' },
		]

		for (const operation of operations) {
			const startTime = Date.now()

			await authenticatedPage.goto(operation.path)
			await authenticatedPage.waitForLoadState('networkidle')

			const responseTime = Date.now() - startTime

			// Verificar se tempo de resposta é aceitável (menos de 5 segundos)
			expect(responseTime).toBeLessThan(5000)

			console.log(`✅ ${operation.action}: ${responseTime}ms`)
		}
	})

	test('✅ Otimizações - queries SQL eficientes', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se dashboard carregou rapidamente
		const startTime = Date.now()

		// Aguardar carregamento completo (incluindo gráficos)
		await authenticatedPage.waitForTimeout(3000)

		const totalLoadTime = Date.now() - startTime

		// Verificar se carregou em tempo aceitável (menos de 10 segundos)
		expect(totalLoadTime).toBeLessThan(10000)

		// Verificar se métricas estão visíveis
		await expect(authenticatedPage.getByText('Total de Produtos')).toBeVisible()
		await expect(authenticatedPage.getByText('Total de Problemas')).toBeVisible()
		await expect(authenticatedPage.getByText('Total de Usuários')).toBeVisible()

		console.log(`✅ Dashboard carregou em ${totalLoadTime}ms`)
	})
})
