import { test, expect } from './utils/auth-helpers'

test.describe('📊 DASHBOARD PRINCIPAL', () => {
	test('✅ Carregamento inicial do dashboard', async ({ authenticatedPage }) => {
		// Navegar para o dashboard
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento da página
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se está na página correta - usar elementos que realmente existem
		await expect(authenticatedPage.getByText('Causas de problemas (28 dias)')).toBeVisible({ timeout: 60000 })

		// Fazer scroll de forma mais específica - rolar para baixo em etapas
		await authenticatedPage.evaluate(() => {
			// Rolar para o meio da página primeiro
			window.scrollTo(0, document.body.scrollHeight / 2)
		})

		// Aguardar um pouco
		await authenticatedPage.waitForTimeout(1000)

		// Rolar para o final
		await authenticatedPage.evaluate(() => {
			window.scrollTo(0, document.body.scrollHeight)
		})

		// Aguardar mais tempo para os gráficos renderizarem após o scroll
		await authenticatedPage.waitForTimeout(5000)

		// Verificar se gráficos estão renderizados - usar seletores que realmente existem
		// Os gráficos ApexCharts são renderizados como divs com classes específicas
		const chartContainers = authenticatedPage.locator('.w-full.max-w-lg')
		await expect(chartContainers).toHaveCount(3, { timeout: 60000 }) // Deve ter 3 gráficos

		// Verificar se gráfico donut "Causas de problemas" está visível
		await expect(authenticatedPage.getByText('Causas de problemas (28 dias)')).toBeVisible()

		// Verificar se gráfico de linha está visível
		await expect(authenticatedPage.getByText('Problemas & soluções (últimos 28 dias)')).toBeVisible()

		// Verificar se gráfico de coluna está visível
		await expect(authenticatedPage.getByText('Incidentes (últimos 7 dias)')).toBeVisible()
	})

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

	test('✅ Métricas de resumo funcionais', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento da página
		await authenticatedPage.waitForLoadState('networkidle')

		// Definir resolução maior para visualizar todos os elementos
		await authenticatedPage.setViewportSize({ width: 1920, height: 1200 })

		// Aguardar um pouco para a resolução ser aplicada
		await authenticatedPage.waitForTimeout(1000)

		// Rolar a página para baixo para visualizar os gráficos
		await authenticatedPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

		// Aguardar um pouco para os gráficos renderizarem após o scroll
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se seção de resumo está visível - fazer scroll para cima primeiro
		await authenticatedPage.evaluate(() => window.scrollTo(0, 0))
		await authenticatedPage.waitForTimeout(1000)

		// Verificar se métricas estão visíveis - usar seletores mais específicos
		await expect(authenticatedPage.getByRole('heading', { name: 'Produtos (últimos 28 dias)' })).toBeVisible()
		await expect(authenticatedPage.getByRole('heading', { name: 'Resumo de 7 dias' })).toBeVisible()

		// Verificar se projetos em andamento estão visíveis
		await expect(authenticatedPage.getByText('Projetos em andamento')).toBeVisible()

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

	test('✅ Performance de carregamento', async ({ authenticatedPage }) => {
		const startTime = Date.now()

		// Navegar para o dashboard
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento completo
		await authenticatedPage.waitForLoadState('networkidle')

		// Rolar a página para baixo para visualizar os gráficos
		await authenticatedPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

		// Aguardar um pouco para os gráficos renderizarem após o scroll
		await authenticatedPage.waitForTimeout(2000)

		const endTime = Date.now()
		const loadTime = endTime - startTime

		// Verificar se carregou em tempo razoável (menos de 30 segundos)
		expect(loadTime).toBeLessThan(30000)

		console.log(`✅ Dashboard carregou em ${loadTime}ms`)

		// Verificar se todos os elementos principais estão visíveis
		await expect(authenticatedPage.getByText('Causas de problemas (28 dias)')).toBeVisible()
		await expect(authenticatedPage.locator('.w-full.max-w-lg').first()).toBeVisible()
	})
})
