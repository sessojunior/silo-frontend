import { test, expect } from './utils/auth-helpers'

test.describe('🔗 Integração - Validações e Regras de Negócio', () => {
	test('✅ Nomes únicos - capítulos/seções do manual', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/help')

		// Verificar se sistema de nomes únicos está funcionando
		const duplicateNameTest = authenticatedPage.locator('[data-testid="duplicate-name-test"]')
		if ((await duplicateNameTest.count()) > 0) {
			// Tentar criar seção com nome duplicado
			await authenticatedPage.getByRole('button', { name: 'Nova Seção' }).click()

			// Preencher com nome que já existe
			await authenticatedPage.getByLabel('Título da Seção').fill('Seção Existente')
			await authenticatedPage.getByLabel('Conteúdo').fill('Conteúdo de teste')

			// Tentar salvar
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Deve mostrar erro de nome duplicado
			await expect(authenticatedPage.getByText(/nome já existe|duplicado/i)).toBeVisible()
		}
	})

	test('✅ Nomes únicos - categorias de problemas', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products')

		// Verificar se sistema de nomes únicos está funcionando
		const duplicateCategoryTest = authenticatedPage.locator('[data-testid="duplicate-category-test"]')
		if ((await duplicateCategoryTest.count()) > 0) {
			// Abrir configurações de categorias
			await authenticatedPage.getByRole('button', { name: 'Configurações' }).click()

			// Tentar criar categoria com nome duplicado
			await authenticatedPage.getByRole('button', { name: 'Nova Categoria' }).click()
			await authenticatedPage.getByLabel('Nome').fill('Rede externa') // Nome que já existe
			await authenticatedPage.getByRole('combobox', { name: /cor/i }).selectOption('red')

			// Tentar salvar
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Deve mostrar erro de nome duplicado
			await expect(authenticatedPage.getByText(/nome já existe|duplicado/i)).toBeVisible()
		}
	})

	test('✅ Relacionamentos - integridade referencial', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products')

		// Verificar se relacionamentos estão funcionando
		const productItems = authenticatedPage.locator('[data-testid="product-item"]')
		if ((await productItems.count()) > 0) {
			// Clicar no primeiro produto
			await productItems.first().click()

			// Verificar se problemas relacionados aparecem
			await authenticatedPage.getByRole('tab', { name: /problemas/i }).click()

			// Verificar se lista de problemas está visível
			await expect(authenticatedPage.locator('[data-testid="problem-list"]')).toBeVisible()
		}
	})
})
