import { test, expect } from './utils/auth-helpers'

test.describe('⚙️ Configurações - Perfil do Usuário', () => {
	test('✅ Editar dados - nome, email, informações pessoais', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Verificar se página de configurações carregou
		await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()

		// Ir para aba de perfil
		await authenticatedPage.getByRole('tab', { name: /perfil/i }).click()

		// Verificar se formulário está visível
		await expect(authenticatedPage.getByLabel('Nome completo')).toBeVisible()
		await expect(authenticatedPage.getByLabel('Email')).toBeVisible()

		// Modificar nome
		await authenticatedPage.getByLabel('Nome completo').clear()
		await authenticatedPage.getByLabel('Nome completo').fill('Usuário Editado Playwright')

		// Modificar informações pessoais
		await authenticatedPage.getByLabel('Telefone').clear()
		await authenticatedPage.getByLabel('Telefone').fill('(11) 99999-9999')

		// Salvar alterações
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Verificar toast de sucesso
		await expect(authenticatedPage.getByText(/perfil atualizado|alterado com sucesso/i)).toBeVisible()

		// Verificar se alterações foram salvas
		await expect(authenticatedPage.getByLabel('Nome completo')).toHaveValue('Usuário Editado Playwright')
		await expect(authenticatedPage.getByLabel('Telefone')).toHaveValue('(11) 99999-9999')
	})

	test('✅ Upload de avatar - via UploadThing, resize automático', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Ir para aba de perfil
		await authenticatedPage.getByRole('tab', { name: /perfil/i }).click()

		// Verificar se área de upload está visível
		await expect(authenticatedPage.locator('[data-testid="avatar-upload"]')).toBeVisible()

		// Verificar se avatar atual está visível
		await expect(authenticatedPage.locator('[data-testid="current-avatar"]')).toBeVisible()

		// Clicar em alterar avatar
		await authenticatedPage.getByRole('button', { name: 'Alterar Avatar' }).click()

		// Verificar se seletor de arquivo está visível
		await expect(authenticatedPage.locator('input[type="file"]')).toBeVisible()

		// Upload de nova imagem
		const fileInput = authenticatedPage.locator('input[type="file"]')
		await fileInput.setInputFiles('tests/fixtures/avatar-image.jpg')

		// Verificar se preview da nova imagem aparece
		await expect(authenticatedPage.locator('[data-testid="avatar-preview"]')).toBeVisible()

		// Salvar alterações
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Verificar toast de sucesso
		await expect(authenticatedPage.getByText(/avatar atualizado|alterado com sucesso/i)).toBeVisible()

		// Verificar se novo avatar está visível
		await expect(authenticatedPage.locator('[data-testid="current-avatar"]')).toBeVisible()
	})

	test('✅ Salvamento - persiste alterações', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Ir para aba de perfil
		await authenticatedPage.getByRole('tab', { name: /perfil/i }).click()

		// Modificar dados
		await authenticatedPage.getByLabel('Nome completo').clear()
		await authenticatedPage.getByLabel('Nome completo').fill('Usuário Persistente')

		// Salvar
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Verificar sucesso
		await expect(authenticatedPage.getByText(/perfil atualizado|alterado com sucesso/i)).toBeVisible()

		// Recarregar página
		await authenticatedPage.reload()

		// Verificar se dados foram persistidos
		await expect(authenticatedPage.getByLabel('Nome completo')).toHaveValue('Usuário Persistente')
	})

	test('✅ Validação de campos obrigatórios', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Ir para aba de perfil
		await authenticatedPage.getByRole('tab', { name: /perfil/i }).click()

		// Limpar campo obrigatório
		await authenticatedPage.getByLabel('Nome completo').clear()

		// Tentar salvar
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Deve mostrar erro de campo obrigatório
		await expect(authenticatedPage.getByText(/nome é obrigatório|campo obrigatório/i)).toBeVisible()

		// Preencher campo obrigatório
		await authenticatedPage.getByLabel('Nome completo').fill('Usuário Válido')

		// Tentar salvar novamente
		await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

		// Deve salvar com sucesso
		await expect(authenticatedPage.getByText(/perfil atualizado|alterado com sucesso/i)).toBeVisible()
	})
})
