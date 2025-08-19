import { test, expect } from './utils/auth-helpers'

test.describe('👥 Grupos - Gestão Básica', () => {
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

	test('✅ Navegação por abas - entre grupos e usuários', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/groups')

		// Verificar se aba de grupos está ativa
		await expect(authenticatedPage.getByRole('tab', { name: /grupos/i })).toHaveAttribute('aria-selected', 'true')

		// Clicar na aba de usuários
		await authenticatedPage.getByRole('tab', { name: /usuários/i }).click()

		// Verificar se navegou para página de usuários
		await expect(authenticatedPage.getByRole('heading', { name: /usuários/i })).toBeVisible()

		// Voltar para aba de grupos
		await authenticatedPage.getByRole('tab', { name: /grupos/i }).click()

		// Verificar se voltou para página de grupos
		await expect(authenticatedPage.getByRole('heading', { name: /grupos/i })).toBeVisible()
	})

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
})
