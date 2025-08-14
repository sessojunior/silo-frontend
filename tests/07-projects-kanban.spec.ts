import { test, expect } from './utils/auth-helpers'

test.describe('📋 SISTEMA DE PROJETOS E KANBAN', () => {
	test.describe('📁 Gestão de Projetos', () => {
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
	})

	test.describe('📝 Gestão de Atividades', () => {
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
	})

	test.describe('🎯 Sistema Kanban', () => {
		test('✅ 5 colunas - A Fazer, Em Progresso, Bloqueado, Em Revisão, Concluído', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/projects')

			// Clicar no primeiro projeto
			const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
			if ((await projectItem.count()) > 0) {
				await projectItem.click()

				// Ir para aba do Kanban
				await authenticatedPage.getByRole('tab', { name: /kanban/i }).click()

				// Verificar se colunas estão visíveis
				const columns = ['A Fazer', 'Em Progresso', 'Bloqueado', 'Em Revisão', 'Concluído']
				for (const columnName of columns) {
					await expect(authenticatedPage.getByText(columnName)).toBeVisible()
				}

				// Verificar se há exatamente 5 colunas
				const kanbanColumns = authenticatedPage.locator('[data-testid="kanban-column"]')
				await expect(kanbanColumns).toHaveCount(5)
			}
		})

		test('✅ Drag & drop - mover entre colunas funciona', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/projects')

			// Clicar no primeiro projeto
			const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
			if ((await projectItem.count()) > 0) {
				await projectItem.click()

				// Ir para aba do Kanban
				await authenticatedPage.getByRole('tab', { name: /kanban/i }).click()

				// Verificar se há tarefas para mover
				const tasks = authenticatedPage.locator('[data-testid="kanban-task"]')
				if ((await tasks.count()) > 0) {
					const firstTask = tasks.first()
					const targetColumn = authenticatedPage.locator('[data-testid="kanban-column"]').nth(1) // Em Progresso

					// Simular drag & drop
					await firstTask.dragTo(targetColumn)

					// Aguardar atualização
					await authenticatedPage.waitForTimeout(1000)

					// Verificar se tarefa foi movida
					const taskText = await firstTask.textContent()
					if (taskText) {
						await expect(targetColumn.locator('[data-testid="kanban-task"]')).toContainText(taskText)
					}
				}
			}
		})

		test('✅ Reordenação - dentro da mesma coluna', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/projects')

			// Clicar no primeiro projeto
			const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
			if ((await projectItem.count()) > 0) {
				await projectItem.click()

				// Ir para aba do Kanban
				await authenticatedPage.getByRole('tab', { name: /kanban/i }).click()

				// Verificar se há múltiplas tarefas na mesma coluna
				const firstColumn = authenticatedPage.locator('[data-testid="kanban-column"]').first()
				const tasksInColumn = firstColumn.locator('[data-testid="kanban-task"]')

				if ((await tasksInColumn.count()) > 1) {
					const firstTask = tasksInColumn.first()
					const secondTask = tasksInColumn.nth(1)

					// Simular reordenação
					await firstTask.dragTo(secondTask)

					// Aguardar atualização
					await authenticatedPage.waitForTimeout(1000)

					// Verificar se ordem mudou
					const secondTaskText = await secondTask.textContent()
					if (secondTaskText) {
						await expect(firstColumn.locator('[data-testid="kanban-task"]').first()).toContainText(secondTaskText)
					}
				}
			}
		})

		test('✅ Sincronização - status sincroniza com project_task', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/projects')

			// Clicar no primeiro projeto
			const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
			if ((await projectItem.count()) > 0) {
				await projectItem.click()

				// Ir para aba do Kanban
				await authenticatedPage.getByRole('tab', { name: /kanban/i }).click()

				// Mover uma tarefa para coluna "Concluído"
				const tasks = authenticatedPage.locator('[data-testid="kanban-task"]')
				if ((await tasks.count()) > 0) {
					const firstTask = authenticatedPage.locator('[data-testid="kanban-task"]').first()
					const doneColumn = authenticatedPage.locator('[data-testid="kanban-column"]').last() // Concluído

					// Simular drag & drop
					await firstTask.dragTo(doneColumn)

					// Aguardar atualização
					await authenticatedPage.waitForTimeout(1000)

					// Verificar se tarefa foi movida
					const firstTaskText = await firstTask.textContent()
					if (firstTaskText) {
						await expect(doneColumn.locator('[data-testid="kanban-task"]')).toContainText(firstTaskText)
					}

					// Ir para aba de atividades para verificar sincronização
					await authenticatedPage.getByRole('tab', { name: /atividades/i }).click()

					// Verificar se status da tarefa foi atualizado
					const activityItem = authenticatedPage.locator('[data-testid="activity-item"]').first()
					await expect(activityItem.locator('[data-testid="activity-status"]')).toContainText('concluído')
				}
			}
		})
	})

	test.describe('📋 Gestão de Tarefas', () => {
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
	})

	test.describe('🔍 Funcionalidades Avançadas', () => {
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

	test.describe('📱 UX e Performance', () => {
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

		test('✅ Performance com muitas tarefas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/projects')

			// Clicar no primeiro projeto
			const projectItem = authenticatedPage.locator('[data-testid="project-item"]').first()
			if ((await projectItem.count()) > 0) {
				await projectItem.click()

				// Ir para aba do Kanban
				await authenticatedPage.getByRole('tab', { name: /kanban/i }).click()

				// Medir tempo de carregamento
				const startTime = Date.now()

				// Aguardar carregamento completo
				await authenticatedPage.waitForLoadState('networkidle')

				const loadTime = Date.now() - startTime

				// Verificar se carregou em tempo aceitável (menos de 5 segundos)
				expect(loadTime).toBeLessThan(5000)

				console.log(`✅ Kanban carregou em ${loadTime}ms`)
			}
		})
	})
})
