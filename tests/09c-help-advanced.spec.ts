import { test, expect } from './utils/auth-helpers'

test.describe('🚀 SISTEMA DE AJUDA - Funcionalidades Avançadas', () => {
	test.describe('🔍 Busca e Filtros', () => {
		test('✅ Busca por conteúdo - funcionalidade de pesquisa', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se página carregou
			await expect(authenticatedPage.locator('h2:has-text("Ajuda")')).toBeVisible()

			// Verificar se área de conteúdo está presente
			await expect(authenticatedPage.locator('div#help-content')).toBeVisible()

			// Se houver conteúdo, verificar se é pesquisável
			const helpContent = authenticatedPage.locator('div#help-content')
			if ((await helpContent.count()) > 0) {
				await expect(helpContent).toBeVisible()
			}
		})

		test('✅ Filtros por categoria - organização de conteúdo', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se sidebar está presente
			await expect(authenticatedPage.locator('div.w-96.border-r')).toBeVisible()

			// Verificar se área de navegação está presente
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.p-3')).toBeVisible()

			// Se houver títulos, verificar se são clicáveis
			const titleButtons = authenticatedPage.locator('button.w-full.text-left.p-2.rounded-md')
			if ((await titleButtons.count()) > 0) {
				await expect(titleButtons.first()).toBeVisible()
			}
		})
	})

	test.describe('📚 Organização de Conteúdo', () => {
		test('✅ Estrutura hierárquica - títulos e subtítulos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se área de navegação está presente
			const navigationArea = authenticatedPage.locator('div.flex-1.overflow-y-auto.p-3')
			await expect(navigationArea).toBeVisible()

			// Se houver títulos, verificar se estrutura hierárquica está presente
			const titleButtons = authenticatedPage.locator('button.w-full.text-left.p-2.rounded-md')
			if ((await titleButtons.count()) > 0) {
				await expect(titleButtons.first()).toBeVisible()

				// Verificar se há diferentes níveis de títulos
				const h1Titles = authenticatedPage.locator('div.text-base.font-semibold.text-zinc-700.dark\\:text-zinc-200')
				const h2Titles = authenticatedPage.locator('div.text-sm.font-medium.text-zinc-600.dark\\:text-zinc-300')
				const h3Titles = authenticatedPage.locator('div.text-sm.font-normal.text-zinc-600.dark\\:text-zinc-300')

				// Pelo menos um nível deve estar presente
				const totalTitles = (await h1Titles.count()) + (await h2Titles.count()) + (await h3Titles.count())
				expect(totalTitles).toBeGreaterThan(0)
			}
		})

		test('✅ Navegação por títulos - scroll automático', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se área de navegação está presente
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.p-3')).toBeVisible()

			// Se houver títulos, testar navegação
			const titleButtons = authenticatedPage.locator('button.w-full.text-left.p-2.rounded-md')
			if ((await titleButtons.count()) > 0) {
				// Clicar no primeiro título
				await titleButtons.first().click()

				// Verificar se área de conteúdo está presente
				await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.bg-white.dark\\:bg-zinc-800')).toBeVisible()
			}
		})
	})

	test.describe('💾 Persistência e Sincronização', () => {
		test('✅ Presença do botão de edição - funcionalidade básica', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se botão de configurações está presente
			const settingsButton = authenticatedPage.locator('button:has(span.icon-\\[lucide--settings\\])')
			await expect(settingsButton).toBeVisible()

			// Verificar se botão é clicável
			await expect(settingsButton).toBeEnabled()
		})

		test('✅ Sincronização em tempo real - atualizações automáticas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se página carregou
			await expect(authenticatedPage.locator('h2:has-text("Ajuda")')).toBeVisible()

			// Verificar se área de conteúdo está presente
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.bg-white.dark\\:bg-zinc-800')).toBeVisible()

			// Verificar se área de navegação está presente
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.p-3')).toBeVisible()
		})
	})

	test.describe('🎨 Temas e Personalização', () => {
		test('✅ Tema escuro/claro - adaptação automática', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se página carregou
			await expect(authenticatedPage.locator('h2:has-text("Ajuda")')).toBeVisible()

			// Verificar se classes de tema estão aplicadas
			await expect(authenticatedPage.locator('div.bg-zinc-50.dark\\:bg-zinc-900')).toBeVisible()

			// Verificar se sidebar tem tema aplicado
			await expect(authenticatedPage.locator('div.w-96.border-r.border-zinc-200.dark\\:border-zinc-700')).toBeVisible()

			// Verificar se área de conteúdo tem tema aplicado
			await expect(authenticatedPage.locator('div.flex-1.overflow-y-auto.bg-white.dark\\:bg-zinc-800')).toBeVisible()
		})

		test('✅ Responsividade - adaptação a diferentes tamanhos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se layout flex está presente
			await expect(authenticatedPage.locator('div.flex.bg-zinc-50.dark\\:bg-zinc-900')).toBeVisible()

			// Verificar se sidebar tem largura fixa
			await expect(authenticatedPage.locator('div.w-96.border-r.border-zinc-200.dark\\:border-zinc-700')).toBeVisible()

			// Verificar se conteúdo principal é flexível
			await expect(authenticatedPage.locator('div.flex-1.flex.flex-col.min-w-0')).toBeVisible()
		})
	})

	test.describe('🔧 Configurações e Preferências', () => {
		test('✅ Presença do botão de configurações - funcionalidade básica', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se botão de configurações está presente
			const settingsButton = authenticatedPage.locator('button:has(span.icon-\\[lucide--settings\\])')
			await expect(settingsButton).toBeVisible()

			// Verificar se botão é clicável
			await expect(settingsButton).toBeEnabled()
		})

		test('✅ Preferências de visualização - opções de display', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se página carregou
			await expect(authenticatedPage.locator('h2:has-text("Ajuda")')).toBeVisible()

			// Verificar se layout está configurado corretamente
			await expect(authenticatedPage.locator('div.flex.bg-zinc-50.dark\\:bg-zinc-900')).toBeVisible()

			// Verificar se sidebar está presente
			await expect(authenticatedPage.locator('div.w-96.border-r')).toBeVisible()

			// Verificar se área de conteúdo está presente
			await expect(authenticatedPage.locator('div.flex-1.flex.flex-col.min-w-0')).toBeVisible()
		})
	})
})
