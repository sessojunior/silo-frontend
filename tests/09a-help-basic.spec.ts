import { test, expect } from './utils/auth-helpers'

test.describe('📚 SISTEMA DE AJUDA - Funcionalidades Básicas', () => {
	test.describe('🔍 Funcionalidades Principais', () => {
		test('✅ Carregamento da página - estrutura e elementos básicos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se página carregou
			await expect(authenticatedPage.locator('h2:has-text("Ajuda")')).toBeVisible()
			await expect(authenticatedPage.getByText('Documentação do Silo')).toBeVisible()

			// Verificar se sidebar está presente
			await expect(authenticatedPage.locator('div.w-96.border-r')).toBeVisible()

			// Verificar se botão de configurações está presente (pode não ter title)
			const settingsButton = authenticatedPage.locator('button:has(span.icon-\\[lucide--settings\\])')
			await expect(settingsButton).toBeVisible()
		})

		test('✅ Navegação por títulos - estrutura de navegação lateral', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se área de navegação está presente
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.p-3')).toBeVisible()

			// Se não houver títulos, verificar mensagem de ajuda
			const titlesArea = authenticatedPage.locator('div.space-y-0\\.5')
			if ((await titlesArea.count()) === 0) {
				await expect(authenticatedPage.getByText('Nenhum título encontrado')).toBeVisible()
				await expect(authenticatedPage.getByText('Use # ## ### para criar títulos')).toBeVisible()
			}
		})

		test('✅ Área de conteúdo - visualização da documentação', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se área de conteúdo está presente
			await expect(authenticatedPage.locator('div.flex-1.flex.flex-col.min-w-0')).toBeVisible()

			// Verificar se área de scroll está presente
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.bg-white.dark\\:bg-zinc-800')).toBeVisible()
		})

		test('✅ Botão de edição - presença do botão', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se botão de configurações está presente (abre o editor)
			const settingsButton = authenticatedPage.locator('button:has(span.icon-\\[lucide--settings\\])')
			await expect(settingsButton).toBeVisible()

			// Verificar se botão é clicável
			await expect(settingsButton).toBeEnabled()
		})
	})

	test.describe('📱 Responsividade e Layout', () => {
		test('✅ Layout responsivo - sidebar e conteúdo', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se layout flex está presente
			await expect(authenticatedPage.locator('div.flex.bg-zinc-50.dark\\:bg-zinc-900')).toBeVisible()

			// Verificar se sidebar tem largura fixa
			await expect(authenticatedPage.locator('div.w-96.border-r.border-zinc-200.dark\\:border-zinc-700')).toBeVisible()

			// Verificar se conteúdo principal é flexível
			await expect(authenticatedPage.locator('div.flex-1.flex.flex-col.min-w-0')).toBeVisible()
		})

		test('✅ Scroll e overflow - navegação e conteúdo', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se áreas de scroll estão configuradas
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.p-3')).toBeVisible()
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.bg-white.dark\\:bg-zinc-800')).toBeVisible()
		})
	})
})
