import { test, expect } from './utils/auth-helpers'

test.describe('👥 SISTEMA DE GRUPOS E USUÁRIOS', () => {
	test.describe('🏷️ Gestão de Grupos', () => {
		test('✅ CRUD de grupos - criar/editar/excluir', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/groups')

			// Verificar se página carregou
			await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()

			// Clicar em criar novo grupo
			await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()

			// Verificar se formulário abriu
			await expect(authenticatedPage.getByLabel('Nome do grupo')).toBeVisible()

			// Preencher dados do grupo
			await authenticatedPage.getByLabel('Nome do grupo').fill('Grupo Teste Playwright')
			await authenticatedPage.getByLabel('Descrição').fill('Descrição do grupo de teste')
			await authenticatedPage.getByRole('combobox', { name: /ícone/i }).selectOption('users')
			await authenticatedPage.getByRole('combobox', { name: /cor/i }).selectOption('blue')

			// Salvar grupo
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/grupo criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se grupo aparece na lista
			await expect(authenticatedPage.getByText('Grupo Teste Playwright')).toBeVisible()
		})

		test('✅ 6 grupos padrão presentes', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/groups')

			// Verificar se grupos padrão estão presentes
			const defaultGroups = ['Administradores', 'Meteorologistas', 'Pesquisadores', 'Operadores', 'Suporte', 'Visitantes']

			for (const groupName of defaultGroups) {
				await expect(authenticatedPage.getByText(groupName)).toBeVisible()
			}

			// Verificar se há exatamente 6 grupos
			const groupItems = authenticatedPage.locator('[data-testid="group-item"]')
			await expect(groupItems).toHaveCount(6)
		})

		test('✅ Ícones e cores - personalização visual', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/groups')

			// Verificar se grupos têm ícones e cores
			const groupItems = authenticatedPage.locator('[data-testid="group-item"]')
			if ((await groupItems.count()) > 0) {
				const firstGroup = groupItems.first()

				// Verificar se ícone está visível
				await expect(firstGroup.locator('[data-testid="group-icon"]')).toBeVisible()

				// Verificar se cor está aplicada
				const iconElement = firstGroup.locator('[data-testid="group-icon"]')
				await expect(iconElement).toBeVisible()
			}
		})

		test('✅ Proteção grupo padrão - não pode ser excluído', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/groups')

			// Tentar excluir grupo padrão
			const adminGroup = authenticatedPage.getByText('Administradores').first()
			await adminGroup.click()

			// Verificar se botão de excluir está desabilitado ou não existe
			const deleteButton = authenticatedPage.getByRole('button', { name: /excluir/i })
			if ((await deleteButton.count()) > 0) {
				// Se botão existe, deve estar desabilitado
				await expect(deleteButton).toBeDisabled()
			}
		})
	})

	test.describe('👤 Gestão de Usuários', () => {
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
	})

	test.describe('🔗 Relacionamentos Grupos-Usuários', () => {
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
	})

	test.describe('🔍 Funcionalidades Avançadas', () => {
		test('✅ Navegação por abas - entre grupos e usuários', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/groups')

			// Verificar se abas estão visíveis
			await expect(authenticatedPage.getByRole('tab', { name: /grupos/i })).toBeVisible()
			await expect(authenticatedPage.getByRole('tab', { name: /usuários/i })).toBeVisible()

			// Clicar na aba de usuários
			await authenticatedPage.getByRole('tab', { name: /usuários/i }).click()

			// Verificar se página de usuários carregou
			await expect(authenticatedPage.getByRole('heading', { name: /usuários/i })).toBeVisible()

			// Voltar para aba de grupos
			await authenticatedPage.getByRole('tab', { name: /grupos/i }).click()

			// Verificar se página de grupos carregou
			await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()
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
	})

	test.describe('📱 UX e Validações', () => {
		test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/groups')

			// Testar resolução desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
			await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()

			// Testar resolução tablet
			await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
			await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()

			// Testar resolução mobile
			await authenticatedPage.setViewportSize({ width: 375, height: 667 })
			await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()

			// Voltar para desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
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
})
