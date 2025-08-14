import { test, expect } from '@playwright/test'
import { test as authTest } from './utils/auth-helpers'

test.describe('📊 DASHBOARD PRINCIPAL', () => {
	test.beforeEach(async ({ page }) => {
		// Fazer login como administrador
		await page.goto('/auth/login')
		await page.getByLabel('Email').fill('admin@inpe.br')
		await page.getByLabel('Senha').fill('admin123')
		await page.getByRole('button', { name: 'Entrar' }).click()
		await page.waitForURL('/admin/dashboard')
	})

	test('✅ Carregamento inicial do dashboard', async ({ page }) => {
		await page.goto('/admin/dashboard')

		// Verificar se página carregou
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

		// Verificar se métricas estão visíveis
		await expect(page.getByText('Total de Produtos')).toBeVisible()
		await expect(page.getByText('Total de Problemas')).toBeVisible()
		await expect(page.getByText('Total de Usuários')).toBeVisible()
	})

	test('✅ Gráficos ApexCharts funcionais', async ({ page }) => {
		await page.goto('/admin/dashboard')

		// Aguardar carregamento dos gráficos
		await page.waitForTimeout(2000)

		// Verificar se gráficos estão renderizados
		const charts = page.locator('[data-testid="apexcharts"]')
		await expect(charts).toHaveCount(3) // Deve ter 3 gráficos

		// Verificar se gráfico donut "Causas de problemas" está visível
		await expect(page.getByText('Causas de problemas')).toBeVisible()

		// Verificar se gráfico de colunas está visível
		await expect(page.getByText('Status dos Produtos')).toBeVisible()

		// Verificar se gráfico de linha está visível
		await expect(page.getByText('Atividade dos Últimos 28 Dias')).toBeVisible()
	})

	test('✅ Donut "Causas de problemas" com dados dos últimos 28 dias', async ({ page }) => {
		await page.goto('/admin/dashboard')

		// Aguardar carregamento do gráfico
		await page.waitForTimeout(2000)

		// Verificar se gráfico donut está visível
		const donutChart = page.locator('[data-testid="apexcharts"]').first()
		await expect(donutChart).toBeVisible()

		// Verificar se categorias padrão estão presentes
		await expect(page.getByText('Rede externa')).toBeVisible()
		await expect(page.getByText('Rede interna')).toBeVisible()
		await expect(page.getByText('Servidor indisponível')).toBeVisible()
		await expect(page.getByText('Falha humana')).toBeVisible()
		await expect(page.getByText('Erro no software')).toBeVisible()
		await expect(page.getByText('Outros')).toBeVisible()
	})

	test('✅ Responsividade em diferentes resoluções', async ({ page }) => {
		await page.goto('/admin/dashboard')

		// Testar resolução desktop
		await page.setViewportSize({ width: 1920, height: 1080 })
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

		// Testar resolução tablet
		await page.setViewportSize({ width: 768, height: 1024 })
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

		// Testar resolução mobile
		await page.setViewportSize({ width: 375, height: 667 })
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

		// Voltar para desktop
		await page.setViewportSize({ width: 1920, height: 1080 })
	})

	test('✅ Modo dark/light para gráficos', async ({ page }) => {
		await page.goto('/admin/dashboard')

		// Aguardar carregamento
		await page.waitForTimeout(2000)

		// Verificar se gráficos estão visíveis no modo light
		const charts = page.locator('[data-testid="apexcharts"]')
		await expect(charts).toHaveCount(3)

		// Alternar para modo dark
		await page.getByRole('button', { name: /tema|dark|light/i }).click()

		// Aguardar transição
		await page.waitForTimeout(1000)

		// Verificar se gráficos ainda estão visíveis no modo dark
		await expect(charts).toHaveCount(3)
	})

	test('✅ Métricas de resumo funcionais', async ({ page }) => {
		await page.goto('/admin/dashboard')

		// Verificar cards de métricas
		await expect(page.getByText('Total de Produtos')).toBeVisible()
		await expect(page.getByText('Total de Problemas')).toBeVisible()
		await expect(page.getByText('Total de Usuários')).toBeVisible()

		// Verificar se valores são números
		const productCount = page.locator('text=/\\d+/').first()
		await expect(productCount).toBeVisible()
	})

	test('✅ Navegação para outras páginas a partir do dashboard', async ({ page }) => {
		await page.goto('/admin/dashboard')

		// Clicar no link de produtos
		await page.getByRole('link', { name: /produtos/i }).click()
		await page.waitForURL('/admin/products')
		await expect(page.getByRole('heading', { name: /produtos/i })).toBeVisible()

		// Voltar para dashboard
		await page.goto('/admin/dashboard')

		// Clicar no link de problemas
		await page.getByRole('link', { name: /problemas/i }).click()
		await page.waitForURL('/admin/problems')
		await expect(page.getByRole('heading', { name: /problemas/i })).toBeVisible()
	})

	test('✅ Atualização automática de dados', async ({ page }) => {
		await page.goto('/admin/dashboard')

		// Aguardar carregamento inicial
		await page.waitForTimeout(2000)

		// Fazer refresh da página
		await page.reload()

		// Verificar se dados carregaram novamente
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
		await expect(page.getByText('Total de Produtos')).toBeVisible()

		// Aguardar carregamento dos gráficos
		await page.waitForTimeout(2000)
		const charts = page.locator('[data-testid="apexcharts"]')
		await expect(charts).toHaveCount(3)
	})

	test('✅ Performance de carregamento', async ({ page }) => {
		const startTime = Date.now()

		await page.goto('/admin/dashboard')

		// Aguardar carregamento completo
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(2000) // Aguardar gráficos

		const loadTime = Date.now() - startTime

		// Verificar se carregou em tempo aceitável (menos de 10 segundos)
		expect(loadTime).toBeLessThan(10000)

		// Verificar se todos os elementos estão visíveis
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
		await expect(page.getByText('Total de Produtos')).toBeVisible()

		const charts = page.locator('[data-testid="apexcharts"]')
		await expect(charts).toHaveCount(3)
	})
})
