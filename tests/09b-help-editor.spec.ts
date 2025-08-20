import { test, expect } from './utils/auth-helpers'

test.describe('📝 SISTEMA DE AJUDA - Editor Markdown', () => {
	test.describe('✏️ Editor de Documentação', () => {
		test('✅ Presença do botão de edição - acesso ao editor', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se botão de configurações está presente
			const settingsButton = authenticatedPage.locator('button:has(span.icon-\\[lucide--settings\\])')
			await expect(settingsButton).toBeVisible()

			// Verificar se botão é clicável
			await expect(settingsButton).toBeEnabled()
		})

		test('✅ Estrutura da página - elementos básicos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se página carregou
			await expect(authenticatedPage.locator('h2:has-text("Ajuda")')).toBeVisible()

			// Verificar se sidebar está presente
			await expect(authenticatedPage.locator('div.w-96.border-r')).toBeVisible()

			// Verificar se área de conteúdo está presente
			await expect(authenticatedPage.locator('div.flex-1.flex.flex-col.min-w-0')).toBeVisible()
		})
	})

	test.describe('📋 Dicas e Ajuda', () => {
		test('✅ Estrutura da página - navegação e conteúdo', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se área de navegação está presente
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.p-3')).toBeVisible()

			// Verificar se área de conteúdo está presente
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.bg-white.dark\\:bg-zinc-800')).toBeVisible()
		})
	})

	test.describe('🎨 Interface e Estilo', () => {
		test('✅ Layout da página - estrutura visual', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se layout flex está presente
			await expect(authenticatedPage.locator('div.flex.bg-zinc-50.dark\\:bg-zinc-900')).toBeVisible()

			// Verificar se sidebar tem largura fixa
			await expect(authenticatedPage.locator('div.w-96.border-r.border-zinc-200.dark\\:border-zinc-700')).toBeVisible()

			// Verificar se conteúdo principal é flexível
			await expect(authenticatedPage.locator('div.flex-1.flex.flex-col.min-w-0')).toBeVisible()
		})

		test('✅ Estilos e cores - tema consistente', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se cores do tema estão aplicadas
			await expect(authenticatedPage.locator('div.bg-zinc-50.dark\\:bg-zinc-900')).toBeVisible()

			// Verificar se sidebar tem tema aplicado
			await expect(authenticatedPage.locator('div.w-96.border-r.border-zinc-200.dark\\:border-zinc-700')).toBeVisible()

			// Verificar se área de conteúdo tem tema aplicado
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.bg-white.dark\\:bg-zinc-800')).toBeVisible()
		})
	})
})
