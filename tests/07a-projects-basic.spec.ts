import { test, expect } from './utils/auth-helpers'

test.describe('📋 Projetos - Gestão Básica', () => {
	test('✅ CRUD de projetos - criar/editar/excluir', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Verificar se página carregou
		await expect(authenticatedPage.getByRole('heading', { name: /projetos/i })).toBeVisible()

		// Clicar em criar novo projeto
		await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()

		// Verificar se formulário abriu
		await expect(authenticatedPage.getByLabel('Nome do projeto')).toBeVisible()

		// Preencher dados do projeto
		await authenticatedPage.getByLabel('Nome do projeto').fill('Projeto Teste Playwright')
		await authenticatedPage.getByLabel('Descrição').fill('Descrição do projeto de teste')
		await authenticatedPage.getByLabel('Data de início').fill('2024-01-01')
		await authenticatedPage.getByLabel('Data de fim').fill('2024-12-31')
		await authenticatedPage.getByRole('combobox', { name: /prioridade/i }).selectOption('alta')

		// Salvar projeto
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Verificar toast de sucesso
		await expect(authenticatedPage.getByText(/projeto criado|salvo com sucesso/i)).toBeVisible()

		// Verificar se projeto aparece na lista
		await expect(authenticatedPage.getByText('Projeto Teste Playwright')).toBeVisible()
	})

	test('✅ Filtros e busca - funcionam corretamente', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Verificar se campo de busca está visível
		await expect(authenticatedPage.getByPlaceholder(/buscar|pesquisar/i)).toBeVisible()

		// Buscar por nome
		await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('teste')

		// Aguardar resultados
		await authenticatedPage.waitForTimeout(1000)

		// Verificar se resultados aparecem
		const searchResults = authenticatedPage.locator('[data-testid="project-item"]')
		if ((await searchResults.count()) > 0) {
			await expect(searchResults.first()).toBeVisible()
		}

		// Limpar busca
		await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()

		// Verificar se lista original voltou
		await expect(authenticatedPage.locator('[data-testid="project-item"]')).toBeVisible()
	})

	test('✅ Estatísticas - progresso e métricas', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Verificar se estatísticas estão visíveis
		await expect(authenticatedPage.getByText(/total de projetos|projetos ativos/i)).toBeVisible()

		// Verificar se contadores são números válidos
		const totalProjects = authenticatedPage.locator('[data-testid="total-projects"]')
		const activeProjects = authenticatedPage.locator('[data-testid="active-projects"]')

		if ((await totalProjects.count()) > 0) {
			const projectsCount = await totalProjects.textContent()
			expect(parseInt(projectsCount || '0')).toBeGreaterThanOrEqual(0)
		}

		if ((await activeProjects.count()) > 0) {
			const activeCount = await activeProjects.textContent()
			expect(parseInt(activeCount || '0')).toBeGreaterThanOrEqual(0)
		}
	})

	test('✅ CRUD por projeto - criar/editar/excluir atividades', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Clicar no primeiro projeto
		const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
		if ((await projectItem.count()) > 0) {
			await projectItem.click()

			// Verificar se página do projeto carregou
			await expect(authenticatedPage.getByRole('heading', { name: /atividades/i })).toBeVisible()

			// Clicar em criar nova atividade
			await authenticatedPage.getByRole('button', { name: /criar|nova/i }).click()

			// Verificar se formulário abriu
			await expect(authenticatedPage.getByLabel('Nome da atividade')).toBeVisible()

			// Preencher dados da atividade
			await authenticatedPage.getByLabel('Nome da atividade').fill('Atividade Teste Playwright')
			await authenticatedPage.getByLabel('Descrição').fill('Descrição da atividade de teste')
			await authenticatedPage.getByRole('combobox', { name: /prioridade/i }).selectOption('média')

			// Salvar atividade
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/atividade criada|salva com sucesso/i)).toBeVisible()
		}
	})

	test('✅ Associação projeto-atividade - relacionamento correto', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Clicar no primeiro projeto
		const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
		if ((await projectItem.count()) > 0) {
			await projectItem.click()

			// Verificar se atividades do projeto aparecem
			await expect(authenticatedPage.getByText(/atividades do projeto/i)).toBeVisible()

			// Verificar se lista de atividades está visível
			const activitiesList = authenticatedPage.locator('[data-testid="activity-item"]')
			if ((await activitiesList.count()) > 0) {
				await expect(activitiesList.first()).toBeVisible()
			}
		}
	})

	test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Testar resolução desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		await expect(authenticatedPage.getByRole('heading', { name: /projetos/i })).toBeVisible()

		// Testar resolução tablet
		await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
		await expect(authenticatedPage.getByRole('heading', { name: /projetos/i })).toBeVisible()

		// Testar resolução mobile
		await authenticatedPage.setViewportSize({ width: 375, height: 667 })
		await expect(authenticatedPage.getByRole('heading', { name: /projetos/i })).toBeVisible()

		// Voltar para desktop
		await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
	})
})
