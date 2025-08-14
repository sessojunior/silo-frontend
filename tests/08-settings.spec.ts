import { test, expect } from './utils/auth-helpers'

test.describe('⚙️ SISTEMA DE CONFIGURAÇÕES', () => {
	test.describe('👤 Perfil do Usuário', () => {
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
	})

	test.describe('🎨 Preferências', () => {
		test('✅ Tema - Dark/light mode', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/settings')

			// Ir para aba de preferências
			await authenticatedPage.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se seletor de tema está visível
			await expect(authenticatedPage.getByRole('combobox', { name: /tema/i })).toBeVisible()

			// Verificar tema atual
			const currentTheme = authenticatedPage.getByRole('combobox', { name: /tema/i })
			const currentValue = await currentTheme.evaluate((el) => (el as HTMLSelectElement).value)

			// Alternar para tema oposto
			const newTheme = currentValue === 'light' ? 'dark' : 'light'
			await currentTheme.selectOption(newTheme)

			// Aguardar transição
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se tema mudou
			await expect(currentTheme).toHaveValue(newTheme)

			// Salvar preferências
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/preferências salvas|alteradas com sucesso/i)).toBeVisible()

			// Recarregar página para verificar persistência
			await authenticatedPage.reload()

			// Verificar se tema foi persistido
			await expect(currentTheme).toHaveValue(newTheme)
		})

		test('✅ Notificações - configurações de alertas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/settings')

			// Ir para aba de preferências
			await authenticatedPage.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se configurações de notificações estão visíveis
			await expect(authenticatedPage.getByText(/notificações|alertas/i)).toBeVisible()

			// Verificar checkboxes de notificações
			const notificationCheckboxes = authenticatedPage.locator('[data-testid="notification-checkbox"]')
			if ((await notificationCheckboxes.count()) > 0) {
				// Marcar/desmarcar algumas notificações
				await notificationCheckboxes.first().check()
				await notificationCheckboxes.nth(1).uncheck()

				// Salvar preferências
				await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

				// Verificar toast de sucesso
				await expect(authenticatedPage.getByText(/preferências salvas|alteradas com sucesso/i)).toBeVisible()
			}
		})

		test('✅ Auto-save - quando aplicável', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/settings')

			// Ir para aba de preferências
			await authenticatedPage.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se auto-save está configurado
			const autoSaveToggle = authenticatedPage.locator('[data-testid="auto-save-toggle"]')
			if ((await autoSaveToggle.count()) > 0) {
				// Ativar auto-save
				await autoSaveToggle.check()

				// Fazer alteração
				await authenticatedPage.getByRole('combobox', { name: /tema/i }).selectOption('dark')

				// Aguardar auto-save
				await authenticatedPage.waitForTimeout(3000)

				// Verificar se foi salvo automaticamente
				await expect(authenticatedPage.getByText(/salvo automaticamente|auto-save/i)).toBeVisible()
			}
		})
	})

	test.describe('🔒 Segurança', () => {
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
	})

	test.describe('🔍 Funcionalidades Avançadas', () => {
		test('✅ Navegação entre abas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/settings')

			// Verificar se todas as abas estão visíveis
			await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toBeVisible()
			await expect(authenticatedPage.getByRole('tab', { name: /preferências/i })).toBeVisible()
			await expect(authenticatedPage.getByRole('tab', { name: /segurança/i })).toBeVisible()

			// Verificar se aba de perfil está ativa por padrão
			await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toHaveAttribute('aria-selected', 'true')

			// Clicar na aba de preferências
			await authenticatedPage.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se aba de preferências está ativa
			await expect(authenticatedPage.getByRole('tab', { name: /preferências/i })).toHaveAttribute('aria-selected', 'true')
			await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).not.toHaveAttribute('aria-selected', 'true')

			// Clicar na aba de segurança
			await authenticatedPage.getByRole('tab', { name: /segurança/i }).click()

			// Verificar se aba de segurança está ativa
			await expect(authenticatedPage.getByRole('tab', { name: /segurança/i })).toHaveAttribute('aria-selected', 'true')
			await expect(authenticatedPage.getByRole('tab', { name: /preferências/i })).not.toHaveAttribute('aria-selected', 'true')
		})

		test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/settings')

			// Testar resolução desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
			await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()
			await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toBeVisible()

			// Testar resolução tablet
			await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
			await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()
			await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toBeVisible()

			// Testar resolução mobile
			await authenticatedPage.setViewportSize({ width: 375, height: 667 })
			await expect(authenticatedPage.getByRole('heading', { name: /configurações/i })).toBeVisible()
			await expect(authenticatedPage.getByRole('tab', { name: /perfil/i })).toBeVisible()

			// Voltar para desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
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

		test('✅ Persistência de configurações', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/settings')

			// Ir para aba de preferências
			await authenticatedPage.getByRole('tab', { name: /preferências/i }).click()

			// Alterar tema
			await authenticatedPage.getByRole('combobox', { name: /tema/i }).selectOption('dark')

			// Salvar
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar sucesso
			await expect(authenticatedPage.getByText(/preferências salvas|alteradas com sucesso/i)).toBeVisible()

			// Navegar para outra página
			await authenticatedPage.goto('/admin/dashboard')

			// Voltar para configurações
			await authenticatedPage.goto('/admin/settings')
			await authenticatedPage.getByRole('tab', { name: /preferências/i }).click()

			// Verificar se configuração foi persistida
			await expect(authenticatedPage.getByRole('combobox', { name: /tema/i })).toHaveValue('dark')
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
			await authenticatedPage.waitForURL('/auth/login')
			await expect(authenticatedPage.getByText('Entrar')).toBeVisible()
		})
	})
})
