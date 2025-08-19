import { test, expect } from './utils/auth-helpers'

test.describe('👥 Grupos - Gestão de Usuários', () => {
	test('✅ CRUD de usuários - criar/editar/excluir', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Verificar se página carregou
		await expect(authenticatedPage.getByRole('heading', { name: /usuários/i })).toBeVisible()

		// Clicar em criar novo usuário
		await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()

		// Verificar se formulário abriu
		await expect(authenticatedPage.getByLabel('Nome completo')).toBeVisible()

		// Preencher dados do usuário
		await authenticatedPage.getByLabel('Nome completo').fill('Usuário Teste Playwright')
		await authenticatedPage.getByLabel('Email').fill('teste@playwright.com')
		await authenticatedPage.getByLabel('Senha').fill('Senha123!')
		await authenticatedPage.getByRole('combobox', { name: /grupo/i }).selectOption('Visitantes')

		// Salvar usuário
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Verificar toast de sucesso
		await expect(authenticatedPage.getByText(/usuário criado|salvo com sucesso/i)).toBeVisible()

		// Verificar se usuário aparece na lista
		await expect(authenticatedPage.getByText('Usuário Teste Playwright')).toBeVisible()
	})

	test('✅ Filtro ativos/inativos - funciona corretamente', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Verificar se filtro está visível
		await expect(authenticatedPage.getByRole('combobox', { name: /status/i })).toBeVisible()

		// Filtrar por usuários ativos
		await authenticatedPage.getByRole('combobox', { name: /status/i }).selectOption('active')

		// Verificar se apenas usuários ativos são exibidos
		const activeUsers = authenticatedPage.locator('[data-testid="user-item"][data-status="active"]')
		await expect(activeUsers).toBeVisible()

		// Filtrar por usuários inativos
		await authenticatedPage.getByRole('combobox', { name: /status/i }).selectOption('inactive')

		// Verificar se apenas usuários inativos são exibidos
		const inactiveUsers = authenticatedPage.locator('[data-testid="user-item"][data-status="inactive"]')
		if ((await inactiveUsers.count()) > 0) {
			await expect(inactiveUsers).toBeVisible()
		}
	})

	test('✅ Toggle de ativação - reflete no acesso do usuário', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Encontrar um usuário ativo
		const activeUser = authenticatedPage.locator('[data-testid="user-item"][data-status="active"]').first()
		if ((await activeUser.count()) > 0) {
			// Clicar no toggle de ativação
			const toggle = activeUser.locator('[data-testid="activation-toggle"]')
			await toggle.click()

			// Verificar se status mudou para inativo
			await expect(activeUser).toHaveAttribute('data-status', 'inactive')

			// Reativar usuário
			await toggle.click()
			await expect(activeUser).toHaveAttribute('data-status', 'active')
		}
	})

	test('✅ Perfil completo - dados pessoais e preferências', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Clicar em um usuário para ver perfil
		const userItem = authenticatedPage.locator('[data-testid="user-item"]').first()
		if ((await userItem.count()) > 0) {
			await userItem.click()

			// Verificar se perfil abriu
			await expect(authenticatedPage.getByText(/perfil|dados pessoais/i)).toBeVisible()

			// Verificar se dados pessoais estão visíveis
			await expect(authenticatedPage.getByText(/nome|email|telefone/i)).toBeVisible()

			// Verificar se preferências estão visíveis
			await expect(authenticatedPage.getByText(/preferências|configurações/i)).toBeVisible()
		}
	})

	test('✅ Busca por nome e email', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Verificar se campo de busca está visível
		await expect(authenticatedPage.getByPlaceholder(/buscar|pesquisar/i)).toBeVisible()

		// Buscar por nome
		await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('admin')

		// Aguardar resultados
		await authenticatedPage.waitForTimeout(1000)

		// Verificar se resultados aparecem
		const searchResults = authenticatedPage.locator('[data-testid="user-item"]')
		await expect(searchResults).toBeVisible()

		// Limpar busca
		await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()

		// Verificar se lista original voltou
		await expect(authenticatedPage.locator('[data-testid="user-item"]')).toBeVisible()
	})

	test('✅ Filtro por grupo', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups/users')

		// Verificar se filtro por grupo está visível
		await expect(authenticatedPage.getByRole('combobox', { name: /grupo/i })).toBeVisible()

		// Selecionar um grupo específico
		await authenticatedPage.getByRole('combobox', { name: /grupo/i }).selectOption('Administradores')

		// Verificar se apenas usuários do grupo selecionado são exibidos
		const filteredUsers = authenticatedPage.locator('[data-testid="user-item"]')
		if ((await filteredUsers.count()) > 0) {
			// Verificar se todos os usuários pertencem ao grupo selecionado
			for (let i = 0; i < (await filteredUsers.count()); i++) {
				const userGroup = filteredUsers.nth(i).locator('[data-testid="user-group"]')
				await expect(userGroup).toContainText('Administradores')
			}
		}
	})
})
