import { test, expect } from './utils/auth-helpers'

test.describe('👥 Grupos - Relacionamentos e Validações', () => {
	test('✅ Associar usuários a grupos - funciona corretamente', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Clicar em um grupo
		const groupItem = authenticatedPage.locator('[data-testid="group-item"]').first()
		await groupItem.click()

		// Verificar se seção de usuários está visível
		await expect(authenticatedPage.getByText(/usuários do grupo|membros/i)).toBeVisible()

		// Clicar em adicionar usuário
		await authenticatedPage.getByRole('button', { name: /adicionar|associar/i }).click()

		// Verificar se seletor de usuários abriu
		await expect(authenticatedPage.getByText(/selecionar usuário/i)).toBeVisible()

		// Selecionar um usuário
		const userCheckbox = authenticatedPage.locator('[data-testid="user-checkbox"]').first()
		await userCheckbox.check()

		// Confirmar associação
		await authenticatedPage.getByRole('button', { name: 'Confirmar' }).click()

		// Verificar toast de sucesso
		await expect(authenticatedPage.getByText(/usuário associado|adicionado com sucesso/i)).toBeVisible()
	})

	test('✅ Remover usuários de grupos - desassociação', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Clicar em um grupo que tenha usuários
		const groupWithUsers = authenticatedPage.locator('[data-testid="group-item"]').first()
		await groupWithUsers.click()

		// Verificar se há usuários no grupo
		const groupUsers = authenticatedPage.locator('[data-testid="group-user"]')
		if ((await groupUsers.count()) > 0) {
			// Clicar no botão de remover do primeiro usuário
			const removeButton = groupUsers.first().locator('[data-testid="remove-user"]')
			await removeButton.click()

			// Verificar se confirmação apareceu
			await expect(authenticatedPage.getByText(/confirmar remoção|remover usuário/i)).toBeVisible()

			// Confirmar remoção
			await authenticatedPage.getByRole('button', { name: 'Confirmar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/usuário removido|desassociado com sucesso/i)).toBeVisible()
		}
	})

	test('✅ Reflexo na UI - ambos lados mostram relacionamentos', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Verificar um grupo
		const groupItem = authenticatedPage.locator('[data-testid="group-item"]').first()
		const groupName = await groupItem.locator('[data-testid="group-name"]').textContent()

		// Clicar no grupo
		await groupItem.click()

		// Verificar usuários do grupo
		const groupUsers = authenticatedPage.locator('[data-testid="group-user"]')
		const userCount = await groupUsers.count()

		// Ir para página de usuários
		await authenticatedPage.goto('/admin/groups/users')

		// Filtrar por grupo
		await authenticatedPage.getByRole('combobox', { name: /grupo/i }).selectOption(groupName || '')

		// Verificar se contagem de usuários é consistente
		const filteredUsers = authenticatedPage.locator('[data-testid="user-item"]')
		await expect(filteredUsers).toHaveCount(userCount)
	})

	test('✅ Estatísticas de usuários por grupo', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Verificar se estatísticas estão visíveis
		await expect(authenticatedPage.getByText(/total de grupos|total de usuários/i)).toBeVisible()

		// Verificar se contadores são números válidos
		const totalGroups = authenticatedPage.locator('[data-testid="total-groups"]')
		const totalUsers = authenticatedPage.locator('[data-testid="total-users"]')

		if ((await totalGroups.count()) > 0) {
			const groupsCount = await totalGroups.textContent()
			expect(parseInt(groupsCount || '0')).toBeGreaterThan(0)
		}

		if ((await totalUsers.count()) > 0) {
			const usersCount = await totalUsers.textContent()
			expect(parseInt(usersCount || '0')).toBeGreaterThan(0)
		}
	})

	test('✅ Validação de campos obrigatórios', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Clicar em criar novo grupo
		await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()

		// Tentar salvar sem preencher campos obrigatórios
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Verificar se erro de campo obrigatório aparece
		await expect(authenticatedPage.getByText(/nome é obrigatório|campo obrigatório/i)).toBeVisible()

		// Preencher campo obrigatório
		await authenticatedPage.getByLabel('Nome do grupo').fill('Grupo Válido')

		// Tentar salvar novamente
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Deve salvar com sucesso
		await expect(authenticatedPage.getByText(/grupo criado|salvo com sucesso/i)).toBeVisible()
	})

	test('✅ Confirmação para ações destrutivas', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Tentar excluir um grupo (que não seja padrão)
		const nonDefaultGroup = authenticatedPage.locator('[data-testid="group-item"]:not([data-default="true"])').first()
		if ((await nonDefaultGroup.count()) > 0) {
			await nonDefaultGroup.click()

			// Clicar em excluir
			await authenticatedPage.getByRole('button', { name: /excluir/i }).click()

			// Verificar se dialog de confirmação apareceu
			await expect(authenticatedPage.getByText(/confirmar exclusão|excluir grupo/i)).toBeVisible()

			// Cancelar exclusão
			await authenticatedPage.getByRole('button', { name: 'Cancelar' }).click()

			// Verificar se dialog fechou
			await expect(authenticatedPage.getByText(/confirmar exclusão|excluir grupo/i)).not.toBeVisible()
		}
	})
})
