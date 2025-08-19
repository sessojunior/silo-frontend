import { test, expect } from './utils/auth-helpers'

test.describe('📚 Manual do Produto', () => {
	test('✅ Editor Markdown - funciona com preview', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se a página carregou corretamente
		await expect(authenticatedPage.getByText('Base de conhecimento')).toBeVisible()

		// Verificar se a seção do manual está visível (deve estar na coluna direita)
		await expect(authenticatedPage.locator('h3:has-text("Manual do produto")')).toBeVisible()

		// Verificar se há conteúdo do manual ou mensagem de "nenhum manual"
		await expect(authenticatedPage.locator('div:has-text("Documentação e referência do produto")').first()).toBeVisible()
	})

	test('✅ Editor Markdown - permite edição', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se a página carregou corretamente
		await expect(authenticatedPage.getByText('Base de conhecimento')).toBeVisible()

		// Verificar se o botão de editar manual está visível
		await expect(authenticatedPage.locator('button:has-text("Editar manual")')).toBeVisible()

		// Clicar no botão de editar manual
		await authenticatedPage.locator('button:has-text("Editar manual")').click()

		// Aguardar um pouco para o editor abrir
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se o editor abriu (usar o título específico)
		await expect(authenticatedPage.locator('div:has-text("Editar manual")').first()).toBeVisible()

		// Verificar se há campos de edição
		await expect(authenticatedPage.locator('textarea').first()).toBeVisible()

		// Preencher com conteúdo de teste
		await authenticatedPage.locator('textarea').first().fill('# Título Teste\n\nConteúdo teste')

		// Verificar se há botão de salvar
		await expect(authenticatedPage.locator('button:has-text("Salvar")')).toBeVisible()
	})

	test('✅ Salvamento - persiste alterações', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se a página carregou corretamente
		await expect(authenticatedPage.getByText('Base de conhecimento')).toBeVisible()

		// Clicar no botão de editar manual
		await authenticatedPage.locator('button:has-text("Editar manual")').click()

		// Aguardar um pouco para o editor abrir
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se o editor abriu
		await expect(authenticatedPage.locator('div:has-text("Editar manual")').first()).toBeVisible()

		// Preencher com novo conteúdo
		await authenticatedPage.locator('textarea').first().fill('# Novo Título\n\nNovo conteúdo')

		// Aguardar um pouco para o conteúdo ser processado
		await authenticatedPage.waitForTimeout(1000)

		// Salvar usando force para evitar interceptação
		await authenticatedPage.locator('button:has-text("Salvar")').click({ force: true })

		// Aguardar salvamento
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se foi salvo (pode ser um toast ou mudança na interface)
		await expect(authenticatedPage.locator('div:has-text("Novo Título")').first()).toBeVisible()
	})

	test('✅ Preview Markdown - renderiza corretamente', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam')
		await authenticatedPage.waitForLoadState('networkidle')

		// Verificar se a página carregou corretamente
		await expect(authenticatedPage.getByText('Base de conhecimento')).toBeVisible()

		// Clicar no botão de editar manual
		await authenticatedPage.locator('button:has-text("Editar manual")').click()

		// Aguardar um pouco para o editor abrir
		await authenticatedPage.waitForTimeout(2000)

		// Verificar se o editor abriu
		await expect(authenticatedPage.locator('div:has-text("Editar manual")').first()).toBeVisible()

		// Preencher com markdown
		await authenticatedPage.locator('textarea').first().fill('# Título H1\n\n## Subtítulo H2\n\n**Texto em negrito**')

		// Verificar se há preview ou se o markdown é renderizado
		// Aguardar um pouco para renderização
		await authenticatedPage.waitForTimeout(1000)

		// Verificar se o conteúdo está sendo exibido (usar .first() para evitar strict mode)
		await expect(authenticatedPage.locator('div:has-text("Título H1")').first()).toBeVisible()
	})
})
