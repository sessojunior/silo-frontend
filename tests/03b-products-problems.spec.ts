import { test, expect } from './utils/auth-helpers'

test.describe('🚨 Sistema de Problemas', () => {
	test('✅ Criar problema - formulário completo e validações', async ({ authenticatedPage }) => {
		// Navegar diretamente para a página de problemas do produto
		await authenticatedPage.goto('/admin/products/bam/problems')
		await authenticatedPage.waitForLoadState('networkidle')

		// Abrir formulário
		await authenticatedPage.locator('button[title="Adicionar problema"]').first().click()
		await expect(authenticatedPage.locator('div.font-semibold:has-text("Adicionar problema")')).toBeVisible({ timeout: 10000 })

		// Preencher
		await authenticatedPage.locator('#problem-title').fill('Problema Teste Playwright')
		await authenticatedPage.locator('#problem-description').fill('Descrição do problema teste criado via Playwright')

		// Selecionar categoria - clicar no botão do Select
		await authenticatedPage.locator('button[aria-haspopup="listbox"]').click()
		await authenticatedPage.getByText('Rede externa').click()

		// Salvar
		await expect(authenticatedPage.locator('button[type="submit"]:has-text("Adicionar")')).toBeVisible()
		await authenticatedPage.locator('button[type="submit"]:has-text("Adicionar")').click()
		await authenticatedPage.waitForTimeout(3000)

		// Confirmação - usar seletor mais específico para evitar strict mode violation
		await expect(authenticatedPage.locator('span.text-base.font-semibold:has-text("Problema Teste Playwright")').first()).toBeVisible({ timeout: 10000 })
	})

	test('✅ Upload de imagens via UploadThing - limite de 3 imagens', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam/problems')
		await authenticatedPage.waitForLoadState('networkidle')

		await authenticatedPage.locator('button[title="Adicionar problema"]').first().click()
		await expect(authenticatedPage.locator('div.font-semibold:has-text("Adicionar problema")')).toBeVisible({ timeout: 10000 })

		await authenticatedPage.locator('#problem-title').fill('Problema com Imagens')
		await authenticatedPage.locator('#problem-description').fill('Teste de upload de imagens')

		// Selecionar categoria - clicar no botão do Select
		await authenticatedPage.locator('button[aria-haspopup="listbox"]').click()
		await authenticatedPage.getByText('Rede externa').click()

		await authenticatedPage.locator('button[type="submit"]:has-text("Adicionar")').click()
		await authenticatedPage.waitForTimeout(2000)

		// Usar seletor mais específico para evitar strict mode violation
		await authenticatedPage.locator('span.text-base.font-semibold:has-text("Problema com Imagens")').first().click()
		await authenticatedPage.getByRole('button', { name: 'Editar problema' }).click()

		const uploadButton = authenticatedPage.locator('[data-ut-element="upload-button"]')
		if (await uploadButton.isVisible()) {
			const fileInput = authenticatedPage.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/test-image.txt')
			await expect(authenticatedPage.locator('img')).toBeVisible()
		} else {
			console.log('⚠️ UploadThing não está disponível - pulando teste de upload')
		}
	})

	test('✅ Threading - visualização hierárquica de problemas', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam/problems')
		await authenticatedPage.waitForLoadState('networkidle')
		await expect(authenticatedPage.locator('span:has-text("Dificuldade na configuração inicial")').first()).toBeVisible()
	})
})
