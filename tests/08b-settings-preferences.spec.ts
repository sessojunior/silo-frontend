import { test, expect } from './utils/auth-helpers'

test.describe('⚙️ Configurações - Preferências', () => {
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
})
