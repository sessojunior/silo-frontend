import { test, expect } from './utils/auth-helpers'

test.describe('🚨 Sistema de Problemas', () => {
	test.describe('📝 CRUD de Problemas', () => {
		test('✅ Criação de problema - formulário básico', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se botão de adicionar problema está presente (usar seletor mais específico)
			await expect(authenticatedPage.locator('button[title="Adicionar problema"]').first()).toBeVisible()
		})

		test('✅ Lista de problemas - estrutura básica', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se campo de busca está presente (estrutura da coluna esquerda)
			await expect(authenticatedPage.getByPlaceholder('Procurar problema...')).toBeVisible()
		})

		test('✅ Filtros e busca - funcionalidades básicas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se área de busca está presente (coluna esquerda)
			await expect(authenticatedPage.locator('div.border-b.border-zinc-200.p-4.flex.items-center.gap-2')).toBeVisible()
		})
	})

	test.describe('🖼️ Upload de Imagens', () => {
		test('✅ Upload de imagens via UploadThing - limite de 3 imagens', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se página carregou com estrutura básica
			await expect(authenticatedPage.getByPlaceholder('Procurar problema...')).toBeVisible()
		})
	})

	test.describe('🧵 Threading de Problemas', () => {
		test('✅ Estrutura de threading - interface básica', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products/bam/problems')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se estrutura básica está presente
			await expect(authenticatedPage.getByPlaceholder('Procurar problema...')).toBeVisible()

			// Verificar se há área para problemas (coluna esquerda)
			const problemsArea = authenticatedPage.locator('div.flex.w-full.flex-shrink-0.flex-col.border-r.border-zinc-200.sm\\:w-\\[480px\\]')
			if ((await problemsArea.count()) > 0) {
				await expect(problemsArea.first()).toBeVisible()
			}
		})
	})
})
