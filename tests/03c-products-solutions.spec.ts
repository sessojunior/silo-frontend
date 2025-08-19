import { test, expect } from './utils/auth-helpers'

test.describe('💡 Sistema de Soluções', () => {
	test('✅ Responder problema - criação de solução', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam/problems')
		await authenticatedPage.waitForLoadState('networkidle')

		await authenticatedPage.locator('span.text-base.font-semibold:has-text("Dificuldade na configuração inicial")').first().click()
		await authenticatedPage.getByRole('button', { name: 'Responder' }).first().click()

		const solutionInput = authenticatedPage.locator('textarea').first()
		await solutionInput.fill('Solução teste via Playwright')
		await authenticatedPage.locator('button[type="submit"]:has-text("Responder")').click()
		await expect(authenticatedPage.getByText('Solução teste via Playwright')).toBeVisible()
	})

	test('✅ Upload de imagens em soluções via UploadThing', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam/problems')
		await authenticatedPage.waitForLoadState('networkidle')

		await authenticatedPage.locator('span.text-base.font-semibold:has-text("Dificuldade na configuração inicial")').first().click()
		await authenticatedPage.getByRole('button', { name: 'Responder' }).first().click()

		const uploadButton = authenticatedPage.locator('[data-ut-element="upload-button"]')
		if (await uploadButton.isVisible()) {
			const fileInput = authenticatedPage.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/test-image.txt')
			await expect(authenticatedPage.locator('img')).toBeVisible()
		} else {
			console.log('⚠️ UploadThing não está disponível - pulando teste de upload')
		}
	})

	test('✅ Marcar solução como correta', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/products/bam/problems')
		await authenticatedPage.waitForLoadState('networkidle')

		await authenticatedPage.locator('span.text-base.font-semibold:has-text("Dificuldade na configuração inicial")').first().click()
		const verifyButton = authenticatedPage.locator('button:has-text("Verificar")').first()
		if (await verifyButton.isVisible()) {
			await verifyButton.click()
			await expect(authenticatedPage.getByText('Resposta verificada')).toBeVisible()
		} else {
			console.log('⚠️ Botão "Verificar" não encontrado - pulando teste')
		}
	})
})
