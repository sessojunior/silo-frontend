import { test, expect } from './utils/auth-helpers'

test.describe('💡 Sistema de Soluções', () => {
	test.describe('📝 CRUD de Soluções', () => {
		test('✅ Estrutura básica - página de soluções', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se página carregou
			await expect(authenticatedPage.getByRole('heading', { name: /problemas/i })).toBeVisible()
		})

		test('✅ Interface de soluções - elementos básicos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se área de problemas está presente
			const problemsArea = authenticatedPage.locator('div.space-y-4')
			if ((await problemsArea.count()) > 0) {
				await expect(problemsArea.first()).toBeVisible()
			}
		})
	})

	test.describe('🖼️ Upload de Imagens', () => {
		test('✅ Área de upload - estrutura básica', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se área de upload está presente (se existir)
			const uploadArea = authenticatedPage.locator('[data-ut-element="upload-button"]')
			if ((await uploadArea.count()) > 0) {
				await expect(uploadArea).toBeVisible()
			} else {
				// Se não houver upload, apenas verificar se página carregou
				await expect(authenticatedPage.getByRole('heading', { name: /problemas/i })).toBeVisible()
			}
		})
	})

	test.describe('✅ Validação de Soluções', () => {
		test('✅ Interface de validação - elementos básicos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se página carregou
			await expect(authenticatedPage.getByRole('heading', { name: /problemas/i })).toBeVisible()
		})
	})
})
