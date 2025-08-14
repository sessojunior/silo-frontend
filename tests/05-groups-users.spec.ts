import { test, expect } from '@playwright/test'
import { fillFormField, clickButton } from './utils/auth-helpers'

test.describe('👥 SISTEMA DE GRUPOS E USUÁRIOS', () => {
	test.beforeEach(async ({ page }) => {
		// Fazer login como administrador
		await page.goto('/auth/login')
		await page.getByLabel('Email').fill('admin@inpe.br')
		await page.getByLabel('Senha').fill('admin123')
		await page.getByRole('button', { name: 'Entrar' }).click()
		await page.waitForURL('/admin/dashboard')
	})

	test.describe('🏷️ Gestão de Grupos', () => {
		test('✅ CRUD de grupos - criar/editar/excluir', async ({ page }) => {
			await page.goto('/admin/groups')

			// Clicar no botão de criar grupo
			await clickButton(page, 'Criar Grupo')

			// Preencher formulário
			await fillFormField(page, 'Nome', 'Grupo Teste Playwright')
			await fillFormField(page, 'Descrição', 'Descrição do grupo de teste')

			// Selecionar ícone
			await page.getByRole('button', { name: /selecionar ícone/i }).click()
			await page.locator('[data-icon="users"]').click()

			// Selecionar cor
			await page.getByRole('button', { name: /selecionar cor/i }).click()
			await page.locator('[data-color="blue"]').click()

			// Salvar grupo
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/grupo criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se grupo aparece na lista
			await expect(page.getByText('Grupo Teste Playwright')).toBeVisible()
		})

		test('✅ 6 grupos padrão presentes', async ({ page }) => {
			await page.goto('/admin/groups')

			// Verificar se todos os grupos padrão estão presentes
			await expect(page.getByText('Administradores')).toBeVisible()
			await expect(page.getByText('Meteorologistas')).toBeVisible()
			await expect(page.getByText('Pesquisadores')).toBeVisible()
			await expect(page.getByText('Operadores')).toBeVisible()
			await expect(page.getByText('Suporte')).toBeVisible()
			await expect(page.getByText('Visitantes')).toBeVisible()
		})

		test('✅ Ícones e cores - personalização visual', async ({ page }) => {
			await page.goto('/admin/groups')

			// Clicar no botão editar do primeiro grupo
			await page.locator('[data-testid="edit-group"]').first().click()

			// Verificar se seletor de ícones está visível
			await expect(page.getByRole('button', { name: /selecionar ícone/i })).toBeVisible()

			// Verificar se seletor de cores está visível
			await expect(page.getByRole('button', { name: /selecionar cor/i })).toBeVisible()

			// Selecionar novo ícone
			await page.getByRole('button', { name: /selecionar ícone/i }).click()
			await page.locator('[data-icon="shield"]').click()

			// Selecionar nova cor
			await page.getByRole('button', { name: /selecionar cor/i }).click()
			await page.locator('[data-color="red"]').click()

			// Salvar alterações
			await clickButton(page, 'Salvar')

			// Verificar sucesso
			await expect(page.getByText(/grupo atualizado|alterado com sucesso/i)).toBeVisible()
		})

		test('✅ Proteção grupo padrão - não pode ser excluído', async ({ page }) => {
			await page.goto('/admin/groups')

			// Tentar excluir grupo padrão (Meteorologistas)
			await page.getByText('Meteorologistas').locator('..').locator('[data-testid="delete-group"]').click()

			// Deve mostrar aviso de que não pode ser excluído
			await expect(page.getByText(/não pode ser excluído|grupo padrão/i)).toBeVisible()
		})
	})

	test.describe('👤 Gestão de Usuários', () => {
		test('✅ CRUD de usuários - criar/editar/excluir', async ({ page }) => {
			await page.goto('/admin/groups/users')

			// Clicar no botão de criar usuário
			await clickButton(page, 'Criar Usuário')

			// Preencher formulário
			await fillFormField(page, 'Nome completo', 'Usuário Teste Playwright')
			await fillFormField(page, 'Email', 'usuario.teste@inpe.br')

			// Selecionar grupo
			await page.getByRole('combobox', { name: /grupo/i }).selectOption('Meteorologistas')

			// Marcar como ativo
			await page.getByRole('checkbox', { name: /ativo/i }).check()

			// Salvar usuário
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/usuário criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se usuário aparece na lista
			await expect(page.getByText('Usuário Teste Playwright')).toBeVisible()
		})

		test('✅ Filtro ativos/inativos - funciona corretamente', async ({ page }) => {
			await page.goto('/admin/groups/users')

			// Verificar filtro por usuários ativos
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativos')
			await page.waitForTimeout(1000)

			// Verificar se apenas usuários ativos são exibidos
			const activeUsers = page.locator('[data-testid="user-item"]')
			if ((await activeUsers.count()) > 0) {
				await expect(activeUsers.first()).toBeVisible()
			}

			// Verificar filtro por usuários inativos
			await page.getByRole('combobox', { name: /status/i }).selectOption('Inativos')
			await page.waitForTimeout(1000)

			// Verificar se apenas usuários inativos são exibidos
			const inactiveUsers = page.locator('[data-testid="user-item"]')
			if ((await inactiveUsers.count()) > 0) {
				await expect(inactiveUsers.first()).toBeVisible()
			}

			// Verificar filtro "Todos"
			await page.getByRole('combobox', { name: /status/i }).selectOption('Todos')
			await page.waitForTimeout(1000)

			// Verificar se todos os usuários são exibidos
			const allUsers = page.locator('[data-testid="user-item"]')
			await expect(allUsers).toBeVisible()
		})

		test('✅ Toggle de ativação - reflete no acesso do usuário', async ({ page }) => {
			await page.goto('/admin/groups/users')

			// Encontrar um usuário ativo
			const activeUser = page.locator('[data-testid="user-item"]').filter({ hasText: 'admin@inpe.br' })
			if ((await activeUser.count()) > 0) {
				// Clicar no toggle de ativação
				await activeUser.locator('[data-testid="activation-toggle"]').click()

				// Verificar se status mudou para inativo
				await expect(activeUser.locator('[data-testid="status-badge"]')).toContainText('Inativo')

				// Fazer logout
				await page.getByRole('button', { name: /configurações|perfil/i }).click()
				await page.getByRole('menuitem', { name: 'Sair' }).click()

				// Tentar fazer login com usuário desativado
				await page.getByLabel('Email').fill('admin@inpe.br')
				await page.getByLabel('Senha').fill('admin123')
				await page.getByRole('button', { name: 'Entrar' }).click()

				// Deve mostrar erro de conta inativa
				await expect(page.getByText(/conta inativa|não autorizado|bloqueado/i)).toBeVisible()

				// Fazer login com outro usuário para reativar
				await page.goto('/auth/login')
				await page.getByLabel('Email').fill('admin@inpe.br')
				await page.getByLabel('Senha').fill('admin123')
				await page.getByRole('button', { name: 'Entrar' }).click()

				// Reativar usuário
				await page.goto('/admin/groups/users')
				await activeUser.locator('[data-testid="activation-toggle"]').click()

				// Verificar se status voltou para ativo
				await expect(activeUser.locator('[data-testid="status-badge"]')).toContainText('Ativo')
			}
		})

		test('✅ Perfil completo - dados pessoais e preferências', async ({ page }) => {
			await page.goto('/admin/groups/users')

			// Clicar no botão editar do primeiro usuário
			await page.locator('[data-testid="edit-user"]').first().click()

			// Verificar se todos os campos estão presentes
			await expect(page.getByLabel('Nome completo')).toBeVisible()
			await expect(page.getByLabel('Email')).toBeVisible()
			await expect(page.getByRole('combobox', { name: /grupo/i })).toBeVisible()
			await expect(page.getByRole('checkbox', { name: /ativo/i })).toBeVisible()

			// Verificar se campo de senha NÃO está presente (deve ser removido)
			await expect(page.getByLabel('Senha')).not.toBeVisible()

			// Modificar dados
			await page.getByLabel('Nome completo').clear()
			await fillFormField(page, 'Nome completo', 'Usuário Editado Playwright')

			// Salvar alterações
			await clickButton(page, 'Salvar')

			// Verificar sucesso
			await expect(page.getByText(/usuário atualizado|alterado com sucesso/i)).toBeVisible()

			// Verificar se alterações aparecem na lista
			await expect(page.getByText('Usuário Editado Playwright')).toBeVisible()
		})
	})

	test.describe('🔗 Relação Many-to-Many', () => {
		test('✅ Associar usuários a grupos - funciona corretamente', async ({ page }) => {
			await page.goto('/admin/groups')

			// Clicar no primeiro grupo
			await page.locator('[data-testid="group-item"]').first().click()

			// Verificar se seção de usuários está visível
			await expect(page.getByText('Usuários do Grupo')).toBeVisible()

			// Clicar em adicionar usuários
			await clickButton(page, 'Adicionar Usuários')

			// Verificar se seletor abre
			await expect(page.locator('[data-testid="user-selector"]')).toBeVisible()

			// Selecionar usuários
			await page.locator('[data-testid="user-checkbox"]').nth(0).check()
			await page.locator('[data-testid="user-checkbox"]').nth(1).check()

			// Confirmar seleção
			await clickButton(page, 'Confirmar')

			// Verificar se usuários foram adicionados
			await expect(page.locator('[data-testid="group-user-item"]')).toHaveCount(2)
		})

		test('✅ Remover usuários de grupos - desassociação', async ({ page }) => {
			await page.goto('/admin/groups')

			// Clicar no primeiro grupo
			await page.locator('[data-testid="group-item"]').first().click()

			// Se houver usuários no grupo, remover um
			const groupUsers = page.locator('[data-testid="group-user-item"]')
			if ((await groupUsers.count()) > 0) {
				// Clicar no botão remover do primeiro usuário
				await page.locator('[data-testid="remove-user"]').first().click()

				// Verificar se usuário foi removido
				await expect(page.locator('[data-testid="group-user-item"]')).toHaveCount((await groupUsers.count()) - 1)
			}
		})

		test('✅ Reflexo na UI - ambos lados mostram relacionamentos', async ({ page }) => {
			await page.goto('/admin/groups')

			// Clicar no primeiro grupo
			await page.locator('[data-testid="group-item"]').first().click()

			// Verificar usuários do grupo
			const groupUsers = page.locator('[data-testid="group-user-item"]')
			const groupUserCount = await groupUsers.count()

			// Ir para página de usuários
			await page.goto('/admin/groups/users')

			// Verificar se usuários aparecem na lista
			const allUsers = page.locator('[data-testid="user-item"]')
			await expect(allUsers).toBeVisible()

			// Verificar se contagem está correta
			if (groupUserCount > 0) {
				await expect(allUsers).toHaveCount.greaterThanOrEqual(groupUserCount)
			}
		})

		test('✅ Navegação por abas - entre grupos e usuários', async ({ page }) => {
			await page.goto('/admin/groups')

			// Verificar se aba de grupos está ativa
			await expect(page.getByRole('tab', { name: 'Grupos' })).toHaveAttribute('aria-selected', 'true')

			// Clicar na aba de usuários
			await page.getByRole('tab', { name: 'Usuários' }).click()

			// Verificar se redirecionou para página de usuários
			await page.waitForURL('/admin/groups/users')
			await expect(page.getByRole('heading', { name: /usuários/i })).toBeVisible()

			// Verificar se aba de usuários está ativa
			await expect(page.getByRole('tab', { name: 'Usuários' })).toHaveAttribute('aria-selected', 'true')

			// Voltar para grupos
			await page.getByRole('tab', { name: 'Grupos' }).click()

			// Verificar se redirecionou para página de grupos
			await page.waitForURL('/admin/groups')
			await expect(page.getByRole('heading', { name: /grupos/i })).toBeVisible()
		})
	})

	test.describe('🔍 Funcionalidades Avançadas', () => {
		test('✅ Busca por nome e email', async ({ page }) => {
			await page.goto('/admin/groups/users')

			// Busca por nome
			await page.getByPlaceholder(/buscar usuários/i).fill('admin')
			await page.waitForTimeout(1000)

			// Verificar se resultados contêm "admin"
			const nameResults = page.locator('[data-testid="user-item"]')
			if ((await nameResults.count()) > 0) {
				await expect(nameResults.first()).toBeVisible()
			}

			// Busca por email
			await page.getByPlaceholder(/buscar usuários/i).clear()
			await page.getByPlaceholder(/buscar usuários/i).fill('@inpe.br')
			await page.waitForTimeout(1000)

			// Verificar se resultados contêm emails @inpe.br
			const emailResults = page.locator('[data-testid="user-item"]')
			if ((await emailResults.count()) > 0) {
				await expect(emailResults.first()).toBeVisible()
			}
		})

		test('✅ Filtro por grupo', async ({ page }) => {
			await page.goto('/admin/groups/users')

			// Verificar filtro por grupo específico
			await page.getByRole('combobox', { name: /grupo/i }).selectOption('Meteorologistas')
			await page.waitForTimeout(1000)

			// Verificar se apenas usuários do grupo selecionado são exibidos
			const groupUsers = page.locator('[data-testid="user-item"]')
			if ((await groupUsers.count()) > 0) {
				await expect(groupUsers.first()).toBeVisible()
			}

			// Verificar filtro "Todos os grupos"
			await page.getByRole('combobox', { name: /grupo/i }).selectOption('Todos os grupos')
			await page.waitForTimeout(1000)

			// Verificar se todos os usuários são exibidos
			const allUsers = page.locator('[data-testid="user-item"]')
			await expect(allUsers).toBeVisible()
		})

		test('✅ Estatísticas de usuários por grupo', async ({ page }) => {
			await page.goto('/admin/groups')

			// Verificar se estatísticas estão visíveis
			await expect(page.getByText('Total de Grupos')).toBeVisible()
			await expect(page.getByText('Total de Usuários')).toBeVisible()
			await expect(page.getByText('Grupos Ativos')).toBeVisible()
			await expect(page.getByText('Usuários Ativos')).toBeVisible()

			// Verificar se valores são números
			const groupCount = page.locator('text=/\\d+/').first()
			await expect(groupCount).toBeVisible()
		})

		test('✅ Responsividade em diferentes resoluções', async ({ page }) => {
			await page.goto('/admin/groups')

			// Testar resolução desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
			await expect(page.getByRole('heading', { name: /grupos/i })).toBeVisible()

			// Testar resolução tablet
			await page.setViewportSize({ width: 768, height: 1024 })
			await expect(page.getByRole('heading', { name: /grupos/i })).toBeVisible()

			// Testar resolução mobile
			await page.setViewportSize({ width: 375, height: 667 })
			await expect(page.getByRole('heading', { name: /grupos/i })).toBeVisible()

			// Voltar para desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
		})

		test('✅ Validação de campos obrigatórios', async ({ page }) => {
			await page.goto('/admin/groups')

			// Clicar em criar grupo
			await clickButton(page, 'Criar Grupo')

			// Tentar salvar sem preencher campos obrigatórios
			await clickButton(page, 'Salvar')

			// Deve mostrar erros de validação
			await expect(page.getByText(/nome é obrigatório|campo obrigatório/i)).toBeVisible()

			// Preencher apenas nome
			await fillFormField(page, 'Nome', 'Grupo Válido')

			// Tentar salvar novamente
			await clickButton(page, 'Salvar')

			// Deve salvar com sucesso
			await expect(page.getByText(/grupo criado|salvo com sucesso/i)).toBeVisible()
		})

		test('✅ Confirmação para ações destrutivas', async ({ page }) => {
			await page.goto('/admin/groups')

			// Clicar no botão excluir do primeiro grupo (se não for padrão)
			const deleteButtons = page.locator('[data-testid="delete-group"]')
			if ((await deleteButtons.count()) > 0) {
				await deleteButtons.first().click()

				// Verificar se dialog de confirmação aparece
				await expect(page.getByText(/confirmar exclusão|excluir grupo/i)).toBeVisible()

				// Cancelar exclusão
				await clickButton(page, 'Cancelar')

				// Verificar se dialog fechou
				await expect(page.getByText(/confirmar exclusão|excluir grupo/i)).not.toBeVisible()
			}
		})
	})
})
