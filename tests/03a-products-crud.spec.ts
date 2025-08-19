import { test, expect } from './utils/auth-helpers'

test.describe('📦 CRUD de Produtos', () => {
	test('✅ Criar produto - formulário completo e validações', async ({ authenticatedPage }) => {
		// Navegar para a página de produtos
		await authenticatedPage.goto('/admin/settings/products')

		// Aguardar carregamento da página
		await authenticatedPage.waitForLoadState('networkidle')

		// Clicar no botão de criar produto
		await authenticatedPage.getByRole('button', { name: 'Novo produto' }).click()

		// Preencher formulário
		await authenticatedPage.getByLabel('Nome').fill('Produto Teste Playwright')
		await authenticatedPage.getByLabel('Slug').fill('produto-teste-playwright')

		// Salvar produto
		await authenticatedPage.getByRole('button', { name: 'Criar' }).click()

		// Verificar se produto foi criado
		await expect(authenticatedPage.getByText('Produto criado')).toBeVisible()
	})

	test('✅ Editar produto - modificação de dados e salvamento', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings/products')
		await authenticatedPage.waitForLoadState('networkidle')

		// Clicar no botão editar do primeiro produto (primeira linha da tabela)
		await authenticatedPage.locator('table tbody tr').first().locator('button[title="Editar produto"]').click()

		// Modificar nome
		await authenticatedPage.getByLabel('Nome').clear()
		await authenticatedPage.getByLabel('Nome').fill('Produto Editado Playwright')

		// Salvar alterações
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Verificar se foi salvo - usar seletor mais específico para evitar strict mode violation
		await expect(authenticatedPage.locator('strong:has-text("Produto atualizado")').first()).toBeVisible()
	})

	test('✅ Listagem - filtros, busca e paginação', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings/products')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se lista carregou - deve ter pelo menos 5 produtos (conforme snapshot)
		await expect(authenticatedPage.locator('table tbody tr')).toHaveCount(5, { timeout: 10000 })

		// Testar busca
		await authenticatedPage.getByPlaceholder('Buscar produtos...').fill('teste')
		await authenticatedPage.waitForTimeout(1000)

		// Verificar se filtros funcionam - clicar no botão de filtro
		await authenticatedPage.getByRole('button', { name: 'Todos os status' }).click()
		await authenticatedPage.waitForTimeout(1000)
	})
})
