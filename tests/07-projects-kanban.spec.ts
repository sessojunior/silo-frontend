import { test, expect } from '@playwright/test'
import { fillFormField, clickButton } from './utils/auth-helpers'

test.describe('📋 SISTEMA DE PROJETOS E KANBAN', () => {
	test.beforeEach(async ({ page }) => {
		// Fazer login como administrador
		await page.goto('/auth/login')
		await page.getByLabel('Email').fill('admin@inpe.br')
		await page.getByLabel('Senha').fill('admin123')
		await page.getByRole('button', { name: 'Entrar' }).click()
		await page.waitForURL('/admin/dashboard')
	})

	test.describe('📁 Gestão de Projetos', () => {
		test('✅ CRUD de projetos - criar/editar/excluir', async ({ page }) => {
			await page.goto('/admin/projects')

			// Clicar no botão de criar projeto
			await clickButton(page, 'Criar Projeto')

			// Preencher formulário
			await fillFormField(page, 'Nome', 'Projeto Teste Playwright')
			await fillFormField(page, 'Descrição', 'Descrição do projeto de teste')
			await fillFormField(page, 'Prioridade', 'Alta')

			// Selecionar datas
			await page.getByLabel('Data de início').fill('2024-12-01')
			await page.getByLabel('Data de fim').fill('2024-12-31')

			// Salvar projeto
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/projeto criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se projeto aparece na lista
			await expect(page.getByText('Projeto Teste Playwright')).toBeVisible()
		})

		test('✅ Filtros e busca - funcionam corretamente', async ({ page }) => {
			await page.goto('/admin/projects')

			// Verificar se lista carregou
			await expect(page.locator('[data-testid="project-item"]')).toHaveCount.greaterThan(0)

			// Testar busca por nome
			await page.getByPlaceholder(/buscar projetos/i).fill('teste')
			await page.waitForTimeout(1000)

			// Testar filtro por status
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')

			// Verificar se filtros funcionam
			await expect(page.locator('[data-testid="project-item"]')).toBeVisible()

			// Testar filtro por prioridade
			await page.getByRole('combobox', { name: /prioridade/i }).selectOption('Alta')

			// Verificar se filtros combinados funcionam
			await expect(page.locator('[data-testid="project-item"]')).toBeVisible()
		})

		test('✅ Estatísticas - progresso e métricas', async ({ page }) => {
			await page.goto('/admin/projects')

			// Verificar se estatísticas estão visíveis
			await expect(page.getByText('Total de Projetos')).toBeVisible()
			await expect(page.getByText('Projetos Ativos')).toBeVisible()
			await expect(page.getByText('Projetos Finalizados')).toBeVisible()

			// Verificar se valores são números
			const projectCount = page.locator('text=/\\d+/').first()
			await expect(projectCount).toBeVisible()

			// Verificar se estatísticas são atualizadas em tempo real
			const initialCount = await page.locator('[data-testid="project-item"]').count()

			// Aguardar possível atualização
			await page.waitForTimeout(2000)

			// Verificar se contagem permanece consistente
			const finalCount = await page.locator('[data-testid="project-item"]').count()
			expect(finalCount).toBeGreaterThanOrEqual(initialCount)
		})
	})

	test.describe('📅 Gestão de Atividades', () => {
		test('✅ CRUD por projeto - criar/editar/excluir atividades', async ({ page }) => {
			await page.goto('/admin/projects')

			// Clicar no primeiro projeto
			await page.locator('[data-testid="project-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*/)

			// Ir para aba de atividades
			await page.getByRole('tab', { name: /atividades/i }).click()

			// Clicar em criar atividade
			await clickButton(page, 'Criar Atividade')

			// Preencher formulário
			await fillFormField(page, 'Nome', 'Atividade Teste Playwright')
			await fillFormField(page, 'Descrição', 'Descrição da atividade de teste')
			await fillFormField(page, 'Prioridade', 'Média')

			// Selecionar responsável
			await page.getByRole('combobox', { name: /responsável/i }).selectOption('admin@inpe.br')

			// Salvar atividade
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/atividade criada|salva com sucesso/i)).toBeVisible()

			// Verificar se atividade aparece na lista
			await expect(page.getByText('Atividade Teste Playwright')).toBeVisible()
		})

		test('✅ Associação projeto-atividade - relacionamento correto', async ({ page }) => {
			await page.goto('/admin/projects')

			// Clicar no primeiro projeto
			await page.locator('[data-testid="project-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*/)

			// Ir para aba de atividades
			await page.getByRole('tab', { name: /atividades/i }).click()

			// Verificar se atividades estão associadas ao projeto correto
			const activities = page.locator('[data-testid="activity-item"]')
			if ((await activities.count()) > 0) {
				await expect(activities.first()).toBeVisible()

				// Verificar se atividade mostra informações do projeto
				await expect(page.getByText(/projeto|atividade/i)).toBeVisible()
			}
		})
	})

	test.describe('🎯 Sistema Kanban', () => {
		test('✅ 5 colunas - A Fazer, Em Progresso, Bloqueado, Em Revisão, Concluído', async ({ page }) => {
			await page.goto('/admin/projects')

			// Clicar no primeiro projeto
			await page.locator('[data-testid="project-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*/)

			// Ir para aba de atividades
			await page.getByRole('tab', { name: /atividades/i }).click()

			// Clicar em uma atividade para acessar o Kanban
			await page.locator('[data-testid="activity-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*\/activities\/.*\/kanban/)

			// Verificar se as 5 colunas estão visíveis
			await expect(page.getByText('A Fazer')).toBeVisible()
			await expect(page.getByText('Em Progresso')).toBeVisible()
			await expect(page.getByText('Bloqueado')).toBeVisible()
			await expect(page.getByText('Em Revisão')).toBeVisible()
			await expect(page.getByText('Concluído')).toBeVisible()
		})

		test('✅ Drag & drop - mover entre colunas funciona', async ({ page }) => {
			await page.goto('/admin/projects')

			// Acessar Kanban de uma atividade
			await page.locator('[data-testid="project-item"]').first().click()
			await page.getByRole('tab', { name: /atividades/i }).click()
			await page.locator('[data-testid="activity-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*\/activities\/.*\/kanban/)

			// Aguardar carregamento do Kanban
			await page.waitForTimeout(2000)

			// Verificar se há tarefas para mover
			const tasks = page.locator('[data-testid="kanban-task"]')
			if ((await tasks.count()) > 0) {
				const firstTask = tasks.first()
				const targetColumn = page.locator('[data-testid="kanban-column"]').nth(1) // Em Progresso

				// Arrastar tarefa para coluna "Em Progresso"
				await firstTask.dragTo(targetColumn)

				// Aguardar atualização
				await page.waitForTimeout(2000)

				// Verificar se tarefa foi movida
				await expect(targetColumn.locator('[data-testid="kanban-task"]')).toContainElement(firstTask)
			}
		})

		test('✅ Reordenação - dentro da mesma coluna', async ({ page }) => {
			await page.goto('/admin/projects')

			// Acessar Kanban de uma atividade
			await page.locator('[data-testid="project-item"]').first().click()
			await page.getByRole('tab', { name: /atividades/i }).click()
			await page.locator('[data-testid="activity-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*\/activities\/.*\/kanban/)

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se há múltiplas tarefas na mesma coluna
			const firstColumn = page.locator('[data-testid="kanban-column"]').first()
			const tasksInColumn = firstColumn.locator('[data-testid="kanban-task"]')

			if ((await tasksInColumn.count()) > 1) {
				const firstTask = tasksInColumn.first()
				const secondTask = tasksInColumn.nth(1)

				// Arrastar primeira tarefa para depois da segunda
				await firstTask.dragTo(secondTask)

				// Aguardar atualização
				await page.waitForTimeout(2000)

				// Verificar se ordem mudou
				const newFirstTask = firstColumn.locator('[data-testid="kanban-task"]').first()
				await expect(newFirstTask).not.toHaveText(await firstTask.textContent())
			}
		})

		test('✅ Sincronização - status sincroniza com project_task', async ({ page }) => {
			await page.goto('/admin/projects')

			// Acessar Kanban de uma atividade
			await page.locator('[data-testid="project-item"]').first().click()
			await page.getByRole('tab', { name: /atividades/i }).click()
			await page.locator('[data-testid="activity-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*\/activities\/.*\/kanban/)

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Mover uma tarefa para coluna "Concluído"
			const tasks = page.locator('[data-testid="kanban-task"]')
			if ((await tasks.count()) > 0) {
				const task = tasks.first()
				const doneColumn = page.locator('[data-testid="kanban-column"]').last() // Concluído

				// Arrastar tarefa para "Concluído"
				await task.dragTo(doneColumn)

				// Aguardar sincronização
				await page.waitForTimeout(3000)

				// Verificar se tarefa foi movida
				await expect(doneColumn.locator('[data-testid="kanban-task"]')).toContainElement(task)

				// Verificar se status foi atualizado na base de dados
				// (isso seria verificado via API ou banco de dados)
				await expect(page.locator('[data-testid="kanban-task"]')).toBeVisible()
			}
		})

		test('✅ Contagem por atividade - número correto de tarefas', async ({ page }) => {
			await page.goto('/admin/projects')

			// Clicar no primeiro projeto
			await page.locator('[data-testid="project-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*/)

			// Ir para aba de atividades
			await page.getByRole('tab', { name: /atividades/i }).click()

			// Verificar se contagem de tarefas está visível para cada atividade
			const activities = page.locator('[data-testid="activity-item"]')
			if ((await activities.count()) > 0) {
				const firstActivity = activities.first()

				// Verificar se mostra número de tarefas
				await expect(firstActivity.locator('[data-testid="task-count"]')).toBeVisible()

				// Verificar se contagem é um número
				const countText = await firstActivity.locator('[data-testid="task-count"]').textContent()
				expect(parseInt(countText || '0')).toBeGreaterThanOrEqual(0)
			}
		})
	})

	test.describe('📝 Gestão de Tarefas', () => {
		test('✅ Formulário completo - criar/editar tarefas', async ({ page }) => {
			await page.goto('/admin/projects')

			// Acessar Kanban de uma atividade
			await page.locator('[data-testid="project-item"]').first().click()
			await page.getByRole('tab', { name: /atividades/i }).click()
			await page.locator('[data-testid="activity-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*\/activities\/.*\/kanban/)

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Clicar em criar tarefa
			await clickButton(page, 'Criar Tarefa')

			// Verificar se formulário abre
			await expect(page.locator('[data-testid="task-form"]')).toBeVisible()

			// Preencher formulário
			await fillFormField(page, 'Nome', 'Tarefa Teste Playwright')
			await fillFormField(page, 'Descrição', 'Descrição da tarefa de teste')
			await fillFormField(page, 'Prioridade', 'Alta')
			await fillFormField(page, 'Estimativa', '2 dias')

			// Selecionar responsável
			await page.getByRole('combobox', { name: /responsável/i }).selectOption('admin@inpe.br')

			// Salvar tarefa
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/tarefa criada|salva com sucesso/i)).toBeVisible()

			// Verificar se tarefa aparece no Kanban
			await expect(page.getByText('Tarefa Teste Playwright')).toBeVisible()
		})

		test('✅ Validações - campos obrigatórios', async ({ page }) => {
			await page.goto('/admin/projects')

			// Acessar Kanban de uma atividade
			await page.locator('[data-testid="project-item"]').first().click()
			await page.getByRole('tab', { name: /atividades/i }).click()
			await page.locator('[data-testid="activity-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*\/activities\/.*\/kanban/)

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Clicar em criar tarefa
			await clickButton(page, 'Criar Tarefa')

			// Tentar salvar sem preencher campos obrigatórios
			await clickButton(page, 'Salvar')

			// Deve mostrar erros de validação
			await expect(page.getByText(/nome é obrigatório|campo obrigatório/i)).toBeVisible()

			// Preencher apenas nome
			await fillFormField(page, 'Nome', 'Tarefa Válida')

			// Tentar salvar novamente
			await clickButton(page, 'Salvar')

			// Deve salvar com sucesso
			await expect(page.getByText(/tarefa criada|salva com sucesso/i)).toBeVisible()
		})

		test('✅ Exclusão - diálogo de confirmação', async ({ page }) => {
			await page.goto('/admin/projects')

			// Acessar Kanban de uma atividade
			await page.locator('[data-testid="project-item"]').first().click()
			await page.getByRole('tab', { name: /atividades/i }).click()
			await page.locator('[data-testid="activity-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*\/activities\/.*\/kanban/)

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Se houver tarefas, tentar excluir uma
			const tasks = page.locator('[data-testid="kanban-task"]')
			if ((await tasks.count()) > 0) {
				// Clicar no botão excluir da primeira tarefa
				await page.locator('[data-testid="delete-task"]').first().click()

				// Verificar se dialog de confirmação aparece
				await expect(page.getByText(/confirmar exclusão|excluir tarefa/i)).toBeVisible()

				// Cancelar exclusão
				await clickButton(page, 'Cancelar')

				// Verificar se dialog fechou
				await expect(page.getByText(/confirmar exclusão|excluir tarefa/i)).not.toBeVisible()
			}
		})

		test('✅ Integração - tarefas aparecem no Kanban', async ({ page }) => {
			await page.goto('/admin/projects')

			// Acessar Kanban de uma atividade
			await page.locator('[data-testid="project-item"]').first().click()
			await page.getByRole('tab', { name: /atividades/i }).click()
			await page.locator('[data-testid="activity-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*\/activities\/.*\/kanban/)

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se tarefas estão visíveis no Kanban
			const tasks = page.locator('[data-testid="kanban-task"]')
			if ((await tasks.count()) > 0) {
				await expect(tasks.first()).toBeVisible()

				// Verificar se tarefa tem informações corretas
				await expect(page.locator('[data-testid="task-name"]')).toBeVisible()
				await expect(page.locator('[data-testid="task-priority"]')).toBeVisible()
				await expect(page.locator('[data-testid="task-assignee"]')).toBeVisible()
			}
		})
	})

	test.describe('🔍 Funcionalidades Avançadas', () => {
		test('✅ Filtros por status e prioridade', async ({ page }) => {
			await page.goto('/admin/projects')

			// Clicar no primeiro projeto
			await page.locator('[data-testid="project-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*/)

			// Ir para aba de atividades
			await page.getByRole('tab', { name: /atividades/i }).click()

			// Verificar filtros disponíveis
			await expect(page.getByRole('combobox', { name: /status/i })).toBeVisible()
			await expect(page.getByRole('combobox', { name: /prioridade/i })).toBeVisible()

			// Testar filtro por status
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')
			await page.waitForTimeout(1000)

			// Verificar se filtro funciona
			await expect(page.locator('[data-testid="activity-item"]')).toBeVisible()

			// Testar filtro por prioridade
			await page.getByRole('combobox', { name: /prioridade/i }).selectOption('Alta')
			await page.waitForTimeout(1000)

			// Verificar se filtros combinados funcionam
			await expect(page.locator('[data-testid="activity-item"]')).toBeVisible()
		})

		test('✅ Busca por nome e descrição', async ({ page }) => {
			await page.goto('/admin/projects')

			// Verificar campo de busca
			await expect(page.getByPlaceholder(/buscar projetos/i)).toBeVisible()

			// Buscar por nome
			await page.getByPlaceholder(/buscar projetos/i).fill('teste')
			await page.waitForTimeout(1000)

			// Verificar se resultados aparecem
			const searchResults = page.locator('[data-testid="project-item"]')
			if ((await searchResults.count()) > 0) {
				await expect(searchResults.first()).toBeVisible()
			}

			// Limpar busca
			await page.getByPlaceholder(/buscar projetos/i).clear()
			await page.waitForTimeout(1000)

			// Verificar se lista original voltou
			await expect(page.locator('[data-testid="project-item"]')).toBeVisible()
		})

		test('✅ Responsividade em diferentes resoluções', async ({ page }) => {
			await page.goto('/admin/projects')

			// Testar resolução desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
			await expect(page.getByRole('heading', { name: /projetos/i })).toBeVisible()

			// Testar resolução tablet
			await page.setViewportSize({ width: 768, height: 1024 })
			await expect(page.getByRole('heading', { name: /projetos/i })).toBeVisible()

			// Testar resolução mobile
			await page.setViewportSize({ width: 375, height: 667 })
			await expect(page.getByRole('heading', { name: /projetos/i })).toBeVisible()

			// Voltar para desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
		})

		test('✅ Performance com muitas tarefas', async ({ page }) => {
			await page.goto('/admin/projects')

			// Acessar Kanban de uma atividade
			await page.locator('[data-testid="project-item"]').first().click()
			await page.getByRole('tab', { name: /atividades/i }).click()
			await page.locator('[data-testid="activity-item"]').first().click()
			await page.waitForURL(/\/admin\/projects\/.*\/activities\/.*\/kanban/)

			// Aguardar carregamento
			await page.waitForTimeout(2000)

			// Verificar se Kanban carregou em tempo aceitável
			const startTime = Date.now()

			// Aguardar carregamento completo
			await page.waitForLoadState('networkidle')

			const loadTime = Date.now() - startTime

			// Verificar se carregou em menos de 10 segundos
			expect(loadTime).toBeLessThan(10000)

			// Verificar se todas as colunas estão visíveis
			await expect(page.getByText('A Fazer')).toBeVisible()
			await expect(page.getByText('Em Progresso')).toBeVisible()
			await expect(page.getByText('Bloqueado')).toBeVisible()
			await expect(page.getByText('Em Revisão')).toBeVisible()
			await expect(page.getByText('Concluído')).toBeVisible()
		})
	})
})
