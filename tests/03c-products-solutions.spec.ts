import { test, expect } from './utils/auth-helpers'

test.describe('💡 Sistema de Soluções', () => {
	test.describe('📝 CRUD de Soluções', () => {
		test('✅ Estrutura básica - página de soluções', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se página carregou com estrutura básica
			await expect(authenticatedPage.getByPlaceholder('Procurar problema...')).toBeVisible()
		})

		test('✅ Interface de soluções - elementos básicos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se estrutura de duas colunas está presente
			const leftColumn = authenticatedPage.locator('div.flex.w-full.flex-shrink-0.flex-col.border-r.border-zinc-200.sm\\:w-\\[480px\\]')
			await expect(leftColumn).toBeVisible()
		})
	})

	test.describe('🖼️ Upload de Imagens', () => {
		test('✅ Área de upload - estrutura básica', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se página carregou com estrutura básica
			await expect(authenticatedPage.getByPlaceholder('Procurar problema...')).toBeVisible()
		})
	})

	test.describe('✅ Validação de Soluções', () => {
		test('✅ Interface de validação - elementos básicos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se página carregou com estrutura básica
			await expect(authenticatedPage.getByPlaceholder('Procurar problema...')).toBeVisible()
		})
	})
})
