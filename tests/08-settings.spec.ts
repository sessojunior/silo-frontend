import { test, expect } from '@playwright/test'
import { fillFormField, clickButton } from './utils/auth-helpers'

test.describe('⚙️ SISTEMA DE CONFIGURAÇÕES', () => {
	test.beforeEach(async ({ page }) => {
		// Fazer login como administrador
		await page.goto('/auth/login')
		await page.getByLabel('Email').fill('admin@inpe.br')
		await page.getByLabel('Senha').fill('admin123')
		await page.getByRole('button', { name: 'Entrar' }).click()
		await page.waitForURL('/admin/dashboard')
	})

	test.describe('👤 Perfil do Usuário', () => {
		test('✅ Editar dados - nome, email, informações pessoais', async ({ page }) => {
			await page.goto('/admin/settings')

			// Verificar se página de configurações carregou
			await expect(page.getByRole('heading', { name: /configurações/i })).toBeVisible()

			// Ir para aba de perfil
			await page.getByRole('tab', { name: /perfil/i }).click()

			// Verificar se formulário está visível
			await expect(page.getByLabel('Nome completo')).toBeVisible()
			await expect(page.getByLabel('Email')).toBeVisible()

			// Modificar nome
			await page.getByLabel('Nome completo').clear()
			await fillFormField(page, 'Nome completo', 'Usuário Editado Playwright')

			// Modificar informações pessoais
			await page.getByLabel('Telefone').clear()
			await fillFormField(page, 'Telefone', '(11) 99999-9999')

			// Salvar alterações
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/perfil atualizado|alterado com sucesso/i)).toBeVisible()

			// Verificar se alterações foram salvas
			await expect(page.getByLabel('Nome completo')).toHaveValue('Usuário Editado Playwright')
			await expect(page.getByLabel('Telefone')).toHaveValue('(11) 99999-9999')
		})

		test('✅ Upload de avatar - via UploadThing, resize automático', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de perfil
			await page.getByRole('tab', { name: /perfil/i }).click()

			// Verificar se área de upload está visível
			await expect(page.locator('[data-testid="avatar-upload"]')).toBeVisible()

			// Verificar se avatar atual está visível
			await expect(page.locator('[data-testid="current-avatar"]')).toBeVisible()

			// Clicar em alterar avatar
			await clickButton(page, 'Alterar Avatar')

			// Verificar se seletor de arquivo está visível
			await expect(page.locator('input[type="file"]')).toBeVisible()

			// Upload de nova imagem
			const fileInput = page.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/avatar-image.jpg')

			// Verificar se preview da nova imagem aparece
			await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible()

			// Salvar alterações
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/avatar atualizado|alterado com sucesso/i)).toBeVisible()

			// Verificar se novo avatar está visível
			await expect(page.locator('[data-testid="current-avatar"]')).toBeVisible()
		})

		test('✅ Salvamento - persiste alterações', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de perfil
			await page.getByRole('tab', { name: /perfil/i }).click()

			// Modificar dados
			await page.getByLabel('Nome completo').clear()
			await fillFormField(page, 'Nome completo', 'Usuário Persistente')

			// Salvar
			await clickButton(page, 'Salvar')

			// Verificar sucesso
			await expect(page.getByText(/perfil atualizado|alterado com sucesso/i)).toBeVisible()

			// Recarregar página
			await page.reload()

			// Verificar se dados foram persistidos
			await expect(page.getByLabel('Nome completo')).toHaveValue('Usuário Persistente')
		})
	})

	test.describe('🎨 Preferências', () => {
		test('✅ Tema - Dark/light mode', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de preferências
			await page.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se seletor de tema está visível
			await expect(page.getByRole('combobox', { name: /tema/i })).toBeVisible()

			// Verificar tema atual
			const currentTheme = page.getByRole('combobox', { name: /tema/i })
			const currentValue = await currentTheme.evaluate((el) => (el as HTMLSelectElement).value)

			// Alternar para tema oposto
			const newTheme = currentValue === 'light' ? 'dark' : 'light'
			await currentTheme.selectOption(newTheme)

			// Aguardar transição
			await page.waitForTimeout(1000)

			// Verificar se tema mudou
			await expect(currentTheme).toHaveValue(newTheme)

			// Salvar preferências
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/preferências salvas|alteradas com sucesso/i)).toBeVisible()

			// Recarregar página para verificar persistência
			await page.reload()

			// Verificar se tema foi persistido
			await expect(currentTheme).toHaveValue(newTheme)
		})

		test('✅ Notificações - configurações de alertas', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de preferências
			await page.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se configurações de notificações estão visíveis
			await expect(page.getByText(/notificações|alertas/i)).toBeVisible()

			// Verificar checkboxes de notificações
			const notificationCheckboxes = page.locator('[data-testid="notification-checkbox"]')
			if ((await notificationCheckboxes.count()) > 0) {
				// Marcar/desmarcar algumas notificações
				await notificationCheckboxes.first().check()
				await notificationCheckboxes.nth(1).uncheck()

				// Salvar preferências
				await clickButton(page, 'Salvar')

				// Verificar toast de sucesso
				await expect(page.getByText(/preferências salvas|alteradas com sucesso/i)).toBeVisible()
			}
		})

		test('✅ Auto-save - quando aplicável', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de preferências
			await page.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se auto-save está configurado
			const autoSaveToggle = page.locator('[data-testid="auto-save-toggle"]')
			if ((await autoSaveToggle.count()) > 0) {
				// Ativar auto-save
				await autoSaveToggle.check()

				// Fazer alteração
				await page.getByRole('combobox', { name: /tema/i }).selectOption('dark')

				// Aguardar auto-save
				await page.waitForTimeout(3000)

				// Verificar se foi salvo automaticamente
				await expect(page.getByText(/salvo automaticamente|auto-save/i)).toBeVisible()
			}
		})
	})

	test.describe('🔒 Segurança', () => {
		test('✅ Troca de senha - validações e confirmação', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de segurança
			await page.getByRole('tab', { name: /segurança/i }).click()

			// Verificar se formulário de troca de senha está visível
			await expect(page.getByLabel('Senha atual')).toBeVisible()
			await expect(page.getByLabel('Nova senha')).toBeVisible()
			await expect(page.getByLabel('Confirmar nova senha')).toBeVisible()

			// Preencher senha atual
			await fillFormField(page, 'Senha atual', 'admin123')

			// Preencher nova senha
			await fillFormField(page, 'Nova senha', 'novaSenha123')

			// Preencher confirmação
			await fillFormField(page, 'Confirmar nova senha', 'novaSenha123')

			// Salvar alterações
			await clickButton(page, 'Alterar Senha')

			// Verificar toast de sucesso
			await expect(page.getByText(/senha alterada|alterada com sucesso/i)).toBeVisible()

			// Fazer logout para testar nova senha
			await page.getByRole('button', { name: /configurações|perfil/i }).click()
			await page.getByRole('menuitem', { name: 'Sair' }).click()

			// Tentar login com nova senha
			await page.getByLabel('Email').fill('admin@inpe.br')
			await page.getByLabel('Senha').fill('novaSenha123')
			await page.getByRole('button', { name: 'Entrar' }).click()

			// Verificar se login funcionou
			await page.waitForURL('/admin/dashboard')
			await expect(page.getByText('Dashboard')).toBeVisible()

			// Voltar para senha original
			await page.goto('/admin/settings')
			await page.getByRole('tab', { name: /segurança/i }).click()
			await fillFormField(page, 'Senha atual', 'novaSenha123')
			await fillFormField(page, 'Nova senha', 'admin123')
			await fillFormField(page, 'Confirmar nova senha', 'admin123')
			await clickButton(page, 'Alterar Senha')
			await expect(page.getByText(/senha alterada|alterada com sucesso/i)).toBeVisible()
		})

		test('✅ Validações de senha - requisitos mínimos', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de segurança
			await page.getByRole('tab', { name: /segurança/i }).click()

			// Tentar trocar para senha fraca
			await fillFormField(page, 'Senha atual', 'admin123')
			await fillFormField(page, 'Nova senha', '123') // Senha muito curta
			await fillFormField(page, 'Confirmar nova senha', '123')

			// Tentar salvar
			await clickButton(page, 'Alterar Senha')

			// Deve mostrar erro de senha fraca
			await expect(page.getByText(/senha muito curta|requisitos mínimos/i)).toBeVisible()

			// Tentar com senha sem caracteres especiais
			await page.getByLabel('Nova senha').clear()
			await fillFormField(page, 'Nova senha', 'senhafraca')
			await page.getByLabel('Confirmar nova senha').clear()
			await fillFormField(page, 'Confirmar nova senha', 'senhafraca')

			// Tentar salvar
			await clickButton(page, 'Alterar Senha')

			// Deve mostrar erro de requisitos
			await expect(page.getByText(/caracteres especiais|requisitos mínimos/i)).toBeVisible()
		})

		test('✅ Feedback - toast de sucesso/erro', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de segurança
			await page.getByRole('tab', { name: /segurança/i }).click()

			// Tentar trocar senha com dados válidos
			await fillFormField(page, 'Senha atual', 'admin123')
			await fillFormField(page, 'Nova senha', 'NovaSenha123!')
			await fillFormField(page, 'Confirmar nova senha', 'NovaSenha123!')

			// Salvar
			await clickButton(page, 'Alterar Senha')

			// Verificar toast de sucesso
			await expect(page.getByText(/senha alterada|alterada com sucesso/i)).toBeVisible()

			// Tentar com senha atual incorreta
			await page.getByLabel('Senha atual').clear()
			await fillFormField(page, 'Senha atual', 'senhaerrada')
			await page.getByLabel('Nova senha').clear()
			await fillFormField(page, 'Nova senha', 'OutraSenha123!')
			await page.getByLabel('Confirmar nova senha').clear()
			await fillFormField(page, 'Confirmar nova senha', 'OutraSenha123!')

			// Tentar salvar
			await clickButton(page, 'Alterar Senha')

			// Deve mostrar erro
			await expect(page.getByText(/senha atual incorreta|erro/i)).toBeVisible()
		})
	})

	test.describe('🔍 Funcionalidades Avançadas', () => {
		test('✅ Navegação entre abas', async ({ page }) => {
			await page.goto('/admin/settings')

			// Verificar se todas as abas estão visíveis
			await expect(page.getByRole('tab', { name: /perfil/i })).toBeVisible()
			await expect(page.getByRole('tab', { name: /preferências/i })).toBeVisible()
			await expect(page.getByRole('tab', { name: /segurança/i })).toBeVisible()

			// Verificar se aba de perfil está ativa por padrão
			await expect(page.getByRole('tab', { name: /perfil/i })).toHaveAttribute('aria-selected', 'true')

			// Clicar na aba de preferências
			await page.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se aba de preferências está ativa
			await expect(page.getByRole('tab', { name: /preferências/i })).toHaveAttribute('aria-selected', 'true')
			await expect(page.getByRole('tab', { name: /perfil/i })).not.toHaveAttribute('aria-selected', 'true')

			// Clicar na aba de segurança
			await page.getByRole('tab', { name: /segurança/i }).click()

			// Verificar se aba de segurança está ativa
			await expect(page.getByRole('tab', { name: /segurança/i })).toHaveAttribute('aria-selected', 'true')
			await expect(page.getByRole('tab', { name: /preferências/i })).not.toHaveAttribute('aria-selected', 'true')
		})

		test('✅ Responsividade em diferentes resoluções', async ({ page }) => {
			await page.goto('/admin/settings')

			// Testar resolução desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
			await expect(page.getByRole('heading', { name: /configurações/i })).toBeVisible()
			await expect(page.getByRole('tab', { name: /perfil/i })).toBeVisible()

			// Testar resolução tablet
			await page.setViewportSize({ width: 768, height: 1024 })
			await expect(page.getByRole('heading', { name: /configurações/i })).toBeVisible()
			await expect(page.getByRole('tab', { name: /perfil/i })).toBeVisible()

			// Testar resolução mobile
			await page.setViewportSize({ width: 375, height: 667 })
			await expect(page.getByRole('heading', { name: /configurações/i })).toBeVisible()
			await expect(page.getByRole('tab', { name: /perfil/i })).toBeVisible()

			// Voltar para desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
		})

		test('✅ Validação de campos obrigatórios', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de perfil
			await page.getByRole('tab', { name: /perfil/i }).click()

			// Limpar campo obrigatório
			await page.getByLabel('Nome completo').clear()

			// Tentar salvar
			await clickButton(page, 'Salvar')

			// Deve mostrar erro de campo obrigatório
			await expect(page.getByText(/nome é obrigatório|campo obrigatório/i)).toBeVisible()

			// Preencher campo obrigatório
			await fillFormField(page, 'Nome completo', 'Usuário Válido')

			// Tentar salvar novamente
			await clickButton(page, 'Salvar')

			// Deve salvar com sucesso
			await expect(page.getByText(/perfil atualizado|alterado com sucesso/i)).toBeVisible()
		})

		test('✅ Persistência de configurações', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de preferências
			await page.getByRole('tab', { name: /preferências/i }).click()

			// Alterar tema
			await page.getByRole('combobox', { name: /tema/i }).selectOption('dark')

			// Salvar
			await clickButton(page, 'Salvar')

			// Verificar sucesso
			await expect(page.getByText(/preferências salvas|alteradas com sucesso/i)).toBeVisible()

			// Navegar para outra página
			await page.goto('/admin/dashboard')

			// Voltar para configurações
			await page.goto('/admin/settings')
			await page.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se configuração foi persistida
			await expect(page.getByRole('combobox', { name: /tema/i })).toHaveValue('dark')
		})

		test('✅ Integração com sistema de autenticação', async ({ page }) => {
			await page.goto('/admin/settings')

			// Ir para aba de segurança
			await page.getByRole('tab', { name: /segurança/i }).click()

			// Verificar se informações de sessão estão visíveis
			await expect(page.getByText(/sessão ativa|último acesso/i)).toBeVisible()

			// Verificar se botão de logout está visível
			await expect(page.getByRole('button', { name: /sair|logout/i })).toBeVisible()

			// Clicar em sair
			await clickButton(page, 'Sair')

			// Verificar se foi redirecionado para login
			await page.waitForURL('/auth/login')
			await expect(page.getByText('Entrar')).toBeVisible()
		})
	})
})
