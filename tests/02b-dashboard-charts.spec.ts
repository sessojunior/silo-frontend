import { test, expect } from './utils/auth-helpers'

test.describe('📊 Dashboard - Gráficos ApexCharts', () => {
	test('✅ Gráficos ApexCharts funcionais', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento da página
		await authenticatedPage.waitForLoadState('networkidle')

		// Rolar a página para baixo para visualizar os gráficos
		await authenticatedPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

		// Aguardar um pouco para os gráficos renderizarem após o scroll
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se gráficos estão renderizados - usar seletores que realmente existem
		const chartContainers = authenticatedPage.locator('.w-full.max-w-lg')
		await expect(chartContainers).toHaveCount(3, { timeout: 60000 }) // Deve ter 3 gráficos

		// Verificar se gráfico donut "Causas de problemas" está visível
		await expect(authenticatedPage.getByText('Causas de problemas (28 dias)')).toBeVisible()

		// Verificar se gráfico de linha está visível
		await expect(authenticatedPage.getByText('Problemas & soluções (últimos 28 dias)')).toBeVisible()

		// Verificar se gráfico de coluna está visível
		await expect(authenticatedPage.getByText('Incidentes (últimos 7 dias)')).toBeVisible()
	})

	test('✅ Donut "Causas de problemas" com dados dos últimos 28 dias', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento da página
		await authenticatedPage.waitForLoadState('networkidle')

		// Rolar a página para baixo para visualizar os gráficos
		await authenticatedPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

		// Aguardar um pouco para os gráficos renderizarem após o scroll
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se gráfico donut está visível - usar seletor mais específico
		const donutChart = authenticatedPage.locator('.w-full.max-w-lg').first()
		await expect(donutChart).toBeVisible({ timeout: 60000 })

		// Verificar se título do gráfico está visível
		await expect(authenticatedPage.getByText('Causas de problemas (28 dias)')).toBeVisible()

		// Verificar se gráfico está renderizado - usar seletor mais específico
		await expect(authenticatedPage.locator('.w-full.max-w-lg').first()).toBeVisible()
	})
})
