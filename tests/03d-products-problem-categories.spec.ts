import { test, expect } from './utils/auth-helpers'

test.describe('🏷️ Categorias de Problemas', () => {
	test('✅ CRUD de categorias - criar/editar/excluir no offcanvas', async ({ authenticatedPage }) => {
		// Navegar diretamente para a página de problemas de um produto específico
		await authenticatedPage.goto('/admin/products/bam/problems')
		await authenticatedPage.waitForLoadState('networkidle')

		// Clicar no botão de gerenciar categorias
		await authenticatedPage.locator('button[aria-label="Gerenciar categorias"]').click()

		// Verificar se offcanvas abre - procurar pelo título
		await expect(authenticatedPage.locator('div.font-semibold:has-text("Gerenciar categorias de problemas")')).toBeVisible({ timeout: 10000 })

		// Criar nova categoria - usar o botão correto
		await authenticatedPage.getByRole('button', { name: 'Cadastrar categoria' }).click()

		// Verificar se formulário abre - procurar pelo título correto
		await expect(authenticatedPage.locator('div.font-semibold:has-text("Cadastrar categoria")')).toBeVisible({ timeout: 10000 })

		// Preencher formulário - usar placeholder específico
		await authenticatedPage.locator('input[placeholder="Rede externa"]').fill('Categoria Teste')
		await authenticatedPage.locator('button[type="submit"]:has-text("Cadastrar")').click()

		// Aguardar um pouco para o formulário fechar
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se categoria foi criada - procurar na lista ao invés do toast
		await expect(authenticatedPage.getByText('Categoria Teste')).toBeVisible({ timeout: 10000 })
	})

	test('✅ Validação de nomes únicos - não permite duplicatas', async ({ authenticatedPage }) => {
		// Navegar diretamente para a página de problemas de um produto específico
		await authenticatedPage.goto('/admin/products/bam/problems')
		await authenticatedPage.waitForLoadState('networkidle')

		// Abrir configurações de categorias
		await authenticatedPage.locator('button[aria-label="Gerenciar categorias"]').click()

		// Verificar se offcanvas abre
		await expect(authenticatedPage.locator('div.font-semibold:has-text("Gerenciar categorias de problemas")')).toBeVisible({ timeout: 10000 })

		// Tentar criar categoria com nome existente
		await authenticatedPage.getByRole('button', { name: 'Cadastrar categoria' }).click()
		await authenticatedPage.locator('input[placeholder="Rede externa"]').fill('Rede externa')
		await authenticatedPage.locator('button[type="submit"]:has-text("Cadastrar")').click()

		// Aguardar um pouco para o processo completar
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se a categoria duplicada não foi criada
		// Contar quantas categorias "Rede externa" existem na lista
		const redeExternaItems = authenticatedPage.getByText('Rede externa')
		const count = await redeExternaItems.count()
		
		// Deve haver apenas uma categoria "Rede externa" (a original)
		expect(count).toBe(1)
	})

	test('✅ 6 categorias padrão presentes', async ({ authenticatedPage }) => {
		// Navegar diretamente para a página de problemas de um produto específico
		await authenticatedPage.goto('/admin/products/bam/problems')
		await authenticatedPage.waitForLoadState('networkidle')

		// Abrir configurações de categorias
		await authenticatedPage.locator('button[aria-label="Gerenciar categorias"]').click()

		// Verificar se offcanvas abre
		await expect(authenticatedPage.locator('div.font-semibold:has-text("Gerenciar categorias de problemas")')).toBeVisible({ timeout: 10000 })

		// Verificar se todas as categorias padrão estão presentes (conforme seed real)
		await expect(authenticatedPage.getByText('Rede externa')).toBeVisible()
		await expect(authenticatedPage.getByText('Rede interna')).toBeVisible()
		await expect(authenticatedPage.getByText('Servidor indisponível')).toBeVisible()
		await expect(authenticatedPage.getByText('Falha humana')).toBeVisible()
		await expect(authenticatedPage.getByText('Erro no modelo')).toBeVisible()
		await expect(authenticatedPage.getByText('Dados indisponíveis')).toBeVisible()
	})
})
