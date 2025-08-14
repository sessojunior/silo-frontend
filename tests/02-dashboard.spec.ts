import { test, expect } from './utils/auth-helpers'

test.describe('📊 DASHBOARD PRINCIPAL', () => {
	test('✅ Carregamento inicial do dashboard', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Verificar se página carregou
		await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

		// Verificar se métricas estão visíveis
		await expect(authenticatedPage.getByText('Total de Produtos')).toBeVisible()
		await expect(authenticatedPage.getByText('Total de Problemas')).toBeVisible()
		await expect(authenticatedPage.getByText('Total de Usuários')).toBeVisible()
	})

	test('✅ Gráficos ApexCharts funcionais', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento dos gráficos
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se gráficos estão renderizados
		const charts = authenticatedPage.locator('[data-testid="apexcharts"]')
		await expect(charts).toHaveCount(3) // Deve ter 3 gráficos

		// Verificar se gráfico donut "Causas de problemas" está visível
		await expect(authenticatedPage.getByText('Causas de problemas')).toBeVisible()

		// Verificar se gráfico de colunas está visível
		await expect(authenticatedPage.getByText('Status dos Produtos')).toBeVisible()

		// Verificar se gráfico de linha está visível
		await expect(authenticatedPage.getByText('Atividade dos Últimos 28 Dias')).toBeVisible()
	})

	test('✅ Donut "Causas de problemas" com dados dos últimos 28 dias', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento do gráfico
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se gráfico donut está visível
		const donutChart = authenticatedPage.locator('[data-testid="apexcharts"]').first()
		await expect(donutChart).toBeVisible()

		// Verificar se categorias padrão estão presentes
		await expect(authenticatedPage.getByText('Rede externa')).toBeVisible()
		await expect(authenticatedPage.getByText('Rede interna')).toBeVisible()
		await expect(authenticatedPage.getByText('Servidor indisponível')).toBeVisible()
		await expect(authenticatedPage.getByText('Falha humana')).toBeVisible()
		await expect(authenticatedPage.getByText('Erro no software')).toBeVisible()
		await expect(authenticatedPage.getByText('Outros')).toBeVisible()
	})

	test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Testar resolução desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

		// Testar resolução tablet
		await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
		await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

		// Testar resolução mobile
		await authenticatedPage.setViewportSize({ width: 375, height: 667 })
		await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

		// Voltar para desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
	})

	test('✅ Modo dark/light para gráficos', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se gráficos estão visíveis no modo light
		const charts = authenticatedPage.locator('[data-testid="apexcharts"]')
		await expect(charts).toHaveCount(3)

		// Alternar para modo dark
		await authenticatedPage.getByRole('button', { name: /tema|dark|light/i }).click()

		// Aguardar transição
		await authenticatedPage.waitForTimeout(1000)

		// Verificar se gráficos ainda estão visíveis no modo dark
		await expect(charts).toHaveCount(3)

		// Verificar se tema mudou
		const body = authenticatedPage.locator('body')
		await expect(body).toHaveClass(/dark|dark-mode/i)
	})

	test('✅ Métricas de resumo funcionais', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Verificar se métricas estão visíveis
		await expect(authenticatedPage.getByText('Total de Produtos')).toBeVisible()
		await expect(authenticatedPage.getByText('Total de Problemas')).toBeVisible()
		await expect(authenticatedPage.getByText('Total de Usuários')).toBeVisible()

		// Verificar se valores são números
		const productCount = authenticatedPage.locator('[data-testid="product-count"]')
		const problemCount = authenticatedPage.locator('[data-testid="problem-count"]')
		const userCount = authenticatedPage.locator('[data-testid="user-count"]')

		if ((await productCount.count()) > 0) {
			const count = await productCount.textContent()
			expect(parseInt(count || '0')).toBeGreaterThanOrEqual(0)
		}

		if ((await problemCount.count()) > 0) {
			const count = await problemCount.textContent()
			expect(parseInt(count || '0')).toBeGreaterThanOrEqual(0)
		}

		if ((await userCount.count()) > 0) {
			const count = await userCount.textContent()
			expect(parseInt(count || '0')).toBeGreaterThanOrEqual(0)
		}
	})

	test('✅ Navegação para outras páginas a partir do dashboard', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Verificar se links de navegação estão visíveis
		await expect(authenticatedPage.getByRole('link', { name: /produtos/i })).toBeVisible()
		await expect(authenticatedPage.getByRole('link', { name: /problemas/i })).toBeVisible()
		await expect(authenticatedPage.getByRole('link', { name: /usuários/i })).toBeVisible()

		// Clicar em produtos
		await authenticatedPage.getByRole('link', { name: /produtos/i }).click()
		await authenticatedPage.waitForURL('/admin/products')

		// Verificar se página de produtos carregou
		await expect(authenticatedPage.getByRole('heading', { name: /produtos/i })).toBeVisible()

		// Voltar para dashboard
		await authenticatedPage.goto('/admin/dashboard')
		await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
	})

	test('✅ Atualização automática de dados', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Aguardar carregamento inicial
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se dados estão visíveis
		await expect(authenticatedPage.getByText('Total de Produtos')).toBeVisible()

		// Aguardar possível atualização automática
		await authenticatedPage.waitForTimeout(5000)

		// Verificar se dados ainda estão visíveis
		await expect(authenticatedPage.getByText('Total de Produtos')).toBeVisible()

		// Verificar se não há erros de carregamento
		await expect(authenticatedPage.locator('body')).not.toContainText('Erro ao carregar')
		await expect(authenticatedPage.locator('body')).not.toContainText('Falha na conexão')
	})

	test('✅ Performance de carregamento', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/dashboard')

		// Medir tempo de carregamento
		const startTime = Date.now()

		// Aguardar carregamento completo
		await authenticatedPage.waitForLoadState('networkidle')

		const loadTime = Date.now() - startTime

		// Verificar se carregou em tempo aceitável (menos de 10 segundos)
		expect(loadTime).toBeLessThan(10000)

		console.log(`✅ Dashboard carregou em ${loadTime}ms`)

		// Verificar se todos os elementos principais estão visíveis
		await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
		await expect(authenticatedPage.getByText('Total de Produtos')).toBeVisible()
		await expect(authenticatedPage.locator('[data-testid="apexcharts"]')).toBeVisible()
	})
})
