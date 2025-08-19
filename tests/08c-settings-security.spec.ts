import { test, expect } from './utils/auth-helpers'

test.describe('⚙️ Configurações - Segurança', () => {
	test('✅ Troca de senha - validações e confirmação', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Ir para aba de segurança
		await authenticatedPage.getByRole('tab', { name: /segurança/i }).click()

		// Verificar se formulário de troca de senha está visível
		await expect(authenticatedPage.getByLabel('Senha atual')).toBeVisible()
		await expect(authenticatedPage.getByLabel('Nova senha')).toBeVisible()
		await expect(authenticatedPage.getByLabel('Confirmar nova senha')).toBeVisible()

		// Preencher senha atual
		await authenticatedPage.getByLabel('Senha atual').fill('#Admin123')

		// Preencher nova senha
		await authenticatedPage.getByLabel('Nova senha').fill('novaSenha123')

		// Preencher confirmação
		await authenticatedPage.getByLabel('Confirmar nova senha').fill('novaSenha123')

		// Salvar alterações
		await authenticatedPage.getByRole('button', { name: 'Alterar Senha' }).click()

		// Verificar toast de sucesso
		await expect(authenticatedPage.getByText(/senha alterada|alterada com sucesso/i)).toBeVisible()

		// Fazer logout para testar nova senha
		await authenticatedPage.getByRole('button', { name: /configurações|perfil/i }).click()
		await authenticatedPage.getByRole('menuitem', { name: 'Sair' }).click()

		// Tentar login com nova senha
		await authenticatedPage.getByLabel('Email').fill('mario.junior@inpe.br')
		await authenticatedPage.getByLabel('Senha').fill('novaSenha123')
		await authenticatedPage.getByRole('button', { name: 'Entrar' }).click()

		// Verificar se login funcionou
		await authenticatedPage.waitForURL('/admin/dashboard')
		await expect(authenticatedPage.getByText('Dashboard')).toBeVisible()

		// Voltar para senha original
		await authenticatedPage.goto('/admin/settings')
		await authenticatedPage.getByRole('tab', { name: /segurança/i }).click()
		await authenticatedPage.getByLabel('Senha atual').fill('novaSenha123')
		await authenticatedPage.getByLabel('Nova senha').fill('#Admin123')
		await authenticatedPage.getByLabel('Confirmar nova senha').fill('#Admin123')
		await authenticatedPage.getByRole('button', { name: 'Alterar Senha' }).click()
		await expect(authenticatedPage.getByText(/senha alterada|alterada com sucesso/i)).toBeVisible()
	})

	test('✅ Validações de senha - requisitos mínimos', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Ir para aba de segurança
		await authenticatedPage.getByRole('tab', { name: /segurança/i }).click()

		// Tentar trocar para senha fraca
		await authenticatedPage.getByLabel('Senha atual').fill('#Admin123')
		await authenticatedPage.getByLabel('Nova senha').fill('123') // Senha muito curta
		await authenticatedPage.getByLabel('Confirmar nova senha').fill('123')

		// Tentar salvar
		await authenticatedPage.getByRole('button', { name: 'Alterar Senha' }).click()

		// Deve mostrar erro de senha fraca
		await expect(authenticatedPage.getByText(/senha muito curta|requisitos mínimos/i)).toBeVisible()

		// Tentar com senha sem caracteres especiais
		await authenticatedPage.getByLabel('Nova senha').clear()
		await authenticatedPage.getByLabel('Nova senha').fill('senhafraca')
		await authenticatedPage.getByLabel('Confirmar nova senha').clear()
		await authenticatedPage.getByLabel('Confirmar nova senha').fill('senhafraca')

		// Tentar salvar
		await authenticatedPage.getByRole('button', { name: 'Alterar Senha' }).click()

		// Deve mostrar erro de requisitos
		await expect(authenticatedPage.getByText(/caracteres especiais|requisitos mínimos/i)).toBeVisible()
	})

	test('✅ Feedback - toast de sucesso/erro', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Ir para aba de segurança
		await authenticatedPage.getByRole('tab', { name: /segurança/i }).click()

		// Tentar trocar senha com dados válidos
		await authenticatedPage.getByLabel('Senha atual').fill('#Admin123')
		await authenticatedPage.getByLabel('Nova senha').fill('NovaSenha123!')
		await authenticatedPage.getByLabel('Confirmar nova senha').fill('NovaSenha123!')

		// Salvar
		await authenticatedPage.getByRole('button', { name: 'Alterar Senha' }).click()

		// Verificar toast de sucesso
		await expect(authenticatedPage.getByText(/senha alterada|alterada com sucesso/i)).toBeVisible()

		// Tentar com senha atual incorreta
		await authenticatedPage.getByLabel('Senha atual').clear()
		await authenticatedPage.getByLabel('Senha atual').fill('senhaerrada')
		await authenticatedPage.getByLabel('Nova senha').clear()
		await authenticatedPage.getByLabel('Nova senha').fill('OutraSenha123!')
		await authenticatedPage.getByLabel('Confirmar nova senha').clear()
		await authenticatedPage.getByLabel('Confirmar nova senha').fill('OutraSenha123!')

		// Tentar salvar
		await authenticatedPage.getByRole('button', { name: 'Alterar Senha' }).click()

		// Deve mostrar erro
		await expect(authenticatedPage.getByText(/senha atual incorreta|erro/i)).toBeVisible()
	})

	test('✅ Integração com sistema de autenticação', async ({ authenticatedPage }) => {
		await authenticatedPage.goto('/admin/settings')

		// Ir para aba de segurança
		await authenticatedPage.getByRole('tab', { name: /segurança/i }).click()

		// Verificar se informações de sessão estão visíveis
		await expect(authenticatedPage.getByText(/sessão ativa|último acesso/i)).toBeVisible()

		// Verificar se botão de logout está visível
		await expect(authenticatedPage.getByRole('button', { name: /sair|logout/i })).toBeVisible()

		// Clicar em sair
		await authenticatedPage.getByRole('button', { name: 'Sair' }).click()

		// Verificar se foi redirecionado para login
		await authenticatedPage.waitForURL('/login')
		await expect(authenticatedPage.getByText('Entrar')).toBeVisible()
	})
})
