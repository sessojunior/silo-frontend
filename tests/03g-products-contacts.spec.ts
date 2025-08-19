import { test, expect } from './utils/auth-helpers'

test.describe('👥 Associação Produto-Contato', () => {
	test('✅ Visualização - exibe contatos associados', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se a página carregou corretamente
		await expect(authenticatedPage.getByText('Base de conhecimento')).toBeVisible()

		// Verificar se há contatos associados
		await expect(authenticatedPage.locator('h3:has-text("Contatos em caso de problemas")')).toBeVisible()

		// Verificar se há pelo menos um contato listado (usar .first() para evitar strict mode)
		await expect(authenticatedPage.locator('div:has-text("Carlos Eduardo Silva")').first()).toBeVisible()
	})

	test('✅ Gerenciamento - permite abrir seletor de contatos', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se a página carregou corretamente
		await expect(authenticatedPage.getByText('Base de conhecimento')).toBeVisible()

		// Clicar no botão de gerenciar contatos
		await authenticatedPage.locator('button:has-text("Gerenciar contatos")').click()

		// Verificar se o seletor de contatos abriu
		await expect(authenticatedPage.locator('div:has-text("Selecionar Contatos")').first()).toBeVisible()

		// Aguardar um pouco para os contatos carregarem
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se há contatos disponíveis para seleção (usar .first() para evitar strict mode)
		await expect(authenticatedPage.locator('div:has-text("Carlos Eduardo Silva")').first()).toBeVisible()
		await expect(authenticatedPage.locator('div:has-text("Maria Fernanda Santos")').first()).toBeVisible()
	})

	test('✅ Interface - exibe informações de contatos corretamente', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se a página carregou corretamente
		await expect(authenticatedPage.getByText('Base de conhecimento')).toBeVisible()

		// Verificar se a seção de contatos está visível
		await expect(authenticatedPage.locator('h3:has-text("Contatos em caso de problemas")')).toBeVisible()

		// Verificar se há informações sobre responsáveis técnicos
		await expect(authenticatedPage.locator('div:has-text("responsáveis técnicos")').first()).toBeVisible()

		// Verificar se há botão de gerenciar contatos
		await expect(authenticatedPage.locator('button:has-text("Gerenciar contatos")')).toBeVisible()
	})
})
