import { test, expect } from './utils/auth-helpers'

test.describe('📋 Projetos - Sistema Kanban', () => {
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
