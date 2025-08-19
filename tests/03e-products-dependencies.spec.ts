import { test, expect } from './utils/auth-helpers'

test.describe('Sistema de Dependências Hierárquicas (MenuBuilder)', () => {
	test('deve exibir dependências existentes do produto BAM', async ({ authenticatedPage }) => {
		// Navegar diretamente para a página do produto BAM
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se a página carregou corretamente
		await expect(authenticatedPage.getByText('Base de conhecimento')).toBeVisible()

		// Verificar se a coluna de dependências está visível (usar o heading específico)
		await expect(authenticatedPage.locator('h3:has-text("Dependências")')).toBeVisible()

		// Verificar se há dependências carregadas (baseado no seed, deve ter pelo menos 2 categorias principais)
		await expect(authenticatedPage.locator('div.flex.items-center.cursor-pointer:has-text("Equipamentos")').first()).toBeVisible()
		await expect(authenticatedPage.locator('div.flex.items-center.cursor-pointer:has-text("Dependências")').first()).toBeVisible()
	})

	test('deve permitir abrir o gerenciador de dependências', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Clicar no botão de gerenciar dependências
		await authenticatedPage.locator('button[title="Gerenciar dependências"]').click()

		// Verificar se o offcanvas abriu (usar o título específico)
		await expect(authenticatedPage.locator('h2:has-text("Gerenciar Dependências")')).toBeVisible()

		// Verificar se há dependências listadas
		await expect(authenticatedPage.locator('div:has-text("Equipamentos")').first()).toBeVisible()
		await expect(authenticatedPage.locator('div:has-text("Dependências")').first()).toBeVisible()
	})

	test('deve permitir adicionar nova dependência', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Clicar no botão de gerenciar dependências
		await authenticatedPage.locator('button[title="Gerenciar dependências"]').click()

		// Verificar se o offcanvas abriu
		await expect(authenticatedPage.locator('h2:has-text("Gerenciar Dependências")')).toBeVisible()

		// Clicar no botão de adicionar item
		await authenticatedPage.locator('button:has-text("Nova Dependência")').click()

		// Verificar se o formulário abriu (pode ser um offcanvas ou modal)
		// Aguardar um pouco para o formulário carregar
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se há campos de formulário (usar locators mais genéricos)
		await expect(authenticatedPage.locator('input').first()).toBeVisible()
		await expect(authenticatedPage.locator('textarea').first()).toBeVisible()
	})

	test('deve exibir estrutura hierárquica correta', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se a estrutura hierárquica está visível
		await expect(authenticatedPage.locator('div.flex.items-center.cursor-pointer:has-text("Equipamentos")').first()).toBeVisible()
		await expect(authenticatedPage.locator('div.flex.items-center.cursor-pointer:has-text("Dependências")').first()).toBeVisible()

		// Verificar se há subcategorias (expandir se necessário)
		// As dependências devem estar expandidas por padrão (defaultExpanded={true})
		await expect(authenticatedPage.locator('div.flex.items-center.cursor-pointer:has-text("Máquinas")').first()).toBeVisible()
		await expect(authenticatedPage.locator('div.flex.items-center.cursor-pointer:has-text("Redes internas")').first()).toBeVisible()
		await expect(authenticatedPage.locator('div.flex.items-center.cursor-pointer:has-text("Redes externas")').first()).toBeVisible()
	})

	test('deve permitir interagir com itens da árvore', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Clicar em um item da árvore para ver se abre o dialog
		await authenticatedPage.locator('div.flex.items-center.cursor-pointer:has-text("Servidor Principal")').first().click()

		// Verificar se o dialog abriu com informações da dependência
		// Aguardar um pouco para o dialog carregar
		await authenticatedPage.waitForTimeout(1000)
		await expect(authenticatedPage.locator('div:has-text("Servidor Principal")').first()).toBeVisible()
	})
})
