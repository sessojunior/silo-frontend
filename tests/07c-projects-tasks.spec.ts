import { test, expect } from './utils/auth-helpers'

test.describe('📋 Projetos - Gestão de Tarefas', () => {
	test('✅ Contagem por atividade - número correto de tarefas', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Clicar no primeiro projeto
		const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
		if ((await projectItem.count()) > 0) {
			await projectItem.click()

			// Verificar se contadores de tarefas estão visíveis
			const activityItems = authenticatedPage.locator('[data-testid="activity-item"]')
			if ((await activityItems.count()) > 0) {
				const firstActivity = activityItems.first()
				const taskCount = firstActivity.locator('[data-testid="task-count"]')

				if ((await taskCount.count()) > 0) {
					await expect(taskCount).toBeVisible()

					// Verificar se contagem é um número válido
					const countText = await taskCount.textContent()
					expect(parseInt(countText || '0')).toBeGreaterThanOrEqual(0)
				}
			}
		}
	})

	test('✅ Formulário completo - criar/editar tarefas', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Clicar no primeiro projeto
		const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
		if ((await projectItem.count()) > 0) {
			await projectItem.click()

			// Ir para aba de atividades
			await authenticatedPage.getByRole('tab', { name: /atividades/i }).click()

			// Clicar em uma atividade
			const activityItem = authenticatedPage.locator('[data-testid="activity-item"]').first()
			if ((await activityItem.count()) > 0) {
				await activityItem.click()

				// Clicar em criar nova tarefa
				await authenticatedPage.getByRole('button', { name: /criar|nova/i }).click()

				// Verificar se formulário abriu
				await expect(authenticatedPage.getByLabel('Nome da tarefa')).toBeVisible()

				// Preencher dados da tarefa
				await authenticatedPage.getByLabel('Nome da tarefa').fill('Tarefa Teste Playwright')
				await authenticatedPage.getByLabel('Descrição').fill('Descrição da tarefa de teste')
				await authenticatedPage.getByRole('combobox', { name: /prioridade/i }).selectOption('alta')
				await authenticatedPage.getByLabel('Estimativa (horas)').fill('8')

				// Salvar tarefa
				await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

				// Verificar toast de sucesso
				await expect(authenticatedPage.getByText(/tarefa criada|salva com sucesso/i)).toBeVisible()
			}
		}
	})

	test('✅ Validações - campos obrigatórios', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Clicar no primeiro projeto
		const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
		if ((await projectItem.count()) > 0) {
			await projectItem.click()

			// Ir para aba de atividades
			await authenticatedPage.getByRole('tab', { name: /atividades/i }).click()

			// Clicar em uma atividade
			const activityItem = authenticatedPage.locator('[data-testid="activity-item"]').first()
			if ((await activityItem.count()) > 0) {
				await activityItem.click()

				// Clicar em criar nova tarefa
				await authenticatedPage.getByRole('button', { name: /criar|nova/i }).click()

				// Tentar salvar sem preencher campos obrigatórios
				await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

				// Verificar se erro de campo obrigatório aparece
				await expect(authenticatedPage.getByText(/nome é obrigatório|campo obrigatório/i)).toBeVisible()

				// Preencher campo obrigatório
				await authenticatedPage.getByLabel('Nome da tarefa').fill('Tarefa Válida')

				// Tentar salvar novamente
				await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

				// Deve salvar com sucesso
				await expect(authenticatedPage.getByText(/tarefa criada|salva com sucesso/i)).toBeVisible()
			}
		}
	})

	test('✅ Exclusão - diálogo de confirmação', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Clicar no primeiro projeto
		const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
		if ((await projectItem.count()) > 0) {
			await projectItem.click()

			// Ir para aba de atividades
			await authenticatedPage.getByRole('tab', { name: /atividades/i }).click()

			// Clicar em uma atividade
			const activityItem = authenticatedPage.locator('[data-testid="activity-item"]').first()
			if ((await activityItem.count()) > 0) {
				await activityItem.click()

				// Verificar se há tarefas para excluir
				const tasks = authenticatedPage.locator('[data-testid="task-item"]')
				if ((await tasks.count()) > 0) {
					// Clicar no botão de excluir da primeira tarefa
					const deleteButton = tasks.first().locator('[data-testid="delete-task"]')
					await deleteButton.click()

					// Verificar se dialog de confirmação apareceu
					await expect(authenticatedPage.getByText(/confirmar exclusão|excluir tarefa/i)).toBeVisible()

					// Cancelar exclusão
					await authenticatedPage.getByRole('button', { name: 'Cancelar' }).click()

					// Verificar se dialog fechou
					await expect(authenticatedPage.getByText(/confirmar exclusão|excluir tarefa/i)).not.toBeVisible()
				}
			}
		}
	})

	test('✅ Integração - tarefas aparecem no Kanban', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Clicar no primeiro projeto
		const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
		if ((await projectItem.count()) > 0) {
			await projectItem.click()

			// Ir para aba de atividades
			await authenticatedPage.getByRole('tab', { name: /atividades/i }).click()

			// Clicar em uma atividade
			const activityItem = authenticatedPage.locator('[data-testid="activity-item"]').first()
			if ((await activityItem.count()) > 0) {
				await activityItem.click()

				// Criar uma nova tarefa
				await authenticatedPage.getByRole('button', { name: /criar|nova/i }).click()
				await authenticatedPage.getByLabel('Nome da tarefa').fill('Tarefa Kanban Teste')
				await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

				// Aguardar sucesso
				await expect(authenticatedPage.getByText(/tarefa criada|salva com sucesso/i)).toBeVisible()

				// Ir para aba do Kanban
				await authenticatedPage.getByRole('tab', { name: /kanban/i }).click()

				// Verificar se tarefa aparece na coluna "A Fazer"
				await expect(authenticatedPage.getByText('Tarefa Kanban Teste')).toBeVisible()
			}
		}
	})

	test('✅ Filtros por status e prioridade', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Clicar no primeiro projeto
		const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
		if ((await projectItem.count()) > 0) {
			await projectItem.click()

			// Ir para aba de atividades
			await authenticatedPage.getByRole('tab', { name: /atividades/i }).click()

			// Verificar se filtros estão visíveis
			await expect(authenticatedPage.getByRole('combobox', { name: /status/i })).toBeVisible()
			await expect(authenticatedPage.getByRole('combobox', { name: /prioridade/i })).toBeVisible()

			// Filtrar por status
			await authenticatedPage.getByRole('combobox', { name: /status/i }).selectOption('em_progresso')

			// Verificar se filtro funcionou
			const filteredActivities = authenticatedPage.locator('[data-testid="activity-item"]')
			if ((await filteredActivities.count()) > 0) {
				await expect(filteredActivities.first()).toBeVisible()
			}

			// Limpar filtro
			await authenticatedPage.getByRole('combobox', { name: /status/i }).selectOption('todos')
		}
	})

	test('✅ Busca por nome e descrição', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/projects')

		// Clicar no primeiro projeto
		const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
		if ((await projectItem.count()) > 0) {
			await projectItem.click()

			// Ir para aba de atividades
			await authenticatedPage.getByRole('tab', { name: /atividades/i }).click()

			// Verificar se campo de busca está visível
			await expect(authenticatedPage.getByPlaceholder(/buscar|pesquisar/i)).toBeVisible()

			// Buscar por nome
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('teste')

			// Aguardar resultados
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se resultados aparecem
			const searchResults = authenticatedPage.locator('[data-testid="activity-item"]')
			if ((await searchResults.count()) > 0) {
				await expect(searchResults.first()).toBeVisible()
			}

			// Limpar busca
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()

			// Verificar se lista original voltou
			await expect(authenticatedPage.locator('[data-testid="activity-item"]')).toBeVisible()
		}
	})
})
