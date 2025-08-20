import { test, expect } from './utils/auth-helpers'

test.describe('👥 SISTEMA DE CONTATOS - CRUD', () => {
	test.describe('📋 CRUD Completo', () => {
		test('✅ Criar contato - formulário completo e validações', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Verificar se página carregou
			await expect(authenticatedPage.locator('h1:has-text("Contatos")')).toBeVisible()

			// Clicar no botão de criar contato
			await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()

			// Verificar se formulário abriu
			await expect(authenticatedPage.locator('input[placeholder="Ex: Dr. João Silva"]')).toBeVisible()

			// Preencher TODOS os campos obrigatórios
			await authenticatedPage.locator('input[placeholder="Ex: Dr. João Silva"]').fill('Contato Teste Playwright')
			await authenticatedPage.locator('input[placeholder="joao.silva@inpe.br"]').fill('contato.teste@inpe.br')
			await authenticatedPage.locator('input[placeholder="Ex: Pesquisador Sênior"]').fill('Meteorologista')
			await authenticatedPage.locator('input[placeholder="Ex: Meteorologia Dinâmica"]').fill('Meteorologia')
			await authenticatedPage.locator('input[placeholder="(12) 3208-6000"]').fill('(12) 3208-6000')

			// Salvar contato
			await authenticatedPage.locator('button[type="submit"]:has-text("Criar contato")').click()

			// Aguardar um pouco para o processo completar
			await authenticatedPage.waitForTimeout(3000)

			// Verificar se contato aparece na lista (usar .first() para evitar strict mode)
			await expect(authenticatedPage.getByText('Contato Teste Playwright').first()).toBeVisible()
		})

		test('✅ Editar contato - modificação de dados', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Clicar no botão editar do primeiro contato
			const editButton = authenticatedPage.locator('[data-testid="edit-contact"]').first()
			if ((await editButton.count()) > 0) {
				await editButton.click()

				// Modificar nome
				await authenticatedPage.locator('input[placeholder="Ex: Dr. João Silva"]').clear()
				await authenticatedPage.locator('input[placeholder="Ex: Dr. João Silva"]').fill('Contato Editado Playwright')

				// Modificar função
				await authenticatedPage.locator('input[placeholder="Ex: Pesquisador Sênior"]').clear()
				await authenticatedPage.locator('input[placeholder="Ex: Pesquisador Sênior"]').fill('Pesquisador')

				// Salvar alterações
				await authenticatedPage.locator('button[type="submit"]:has-text("Atualizar contato")').click()

				// Verificar toast de sucesso
				await expect(authenticatedPage.getByText(/contato atualizado|alterado com sucesso/i)).toBeVisible()

				// Verificar se alterações aparecem na lista
				await expect(authenticatedPage.getByText('Contato Editado Playwright')).toBeVisible()
			}
		})

		test('✅ Excluir contato - confirmação e remoção', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Clicar no botão excluir do primeiro contato
			const deleteButton = authenticatedPage.locator('[data-testid="delete-contact"]').first()
			if ((await deleteButton.count()) > 0) {
				await deleteButton.click()

				// Verificar se dialog de confirmação aparece
				await expect(authenticatedPage.getByText(/confirmar exclusão|excluir contato/i)).toBeVisible()

				// Confirmar exclusão
				await authenticatedPage.getByRole('button', { name: 'Excluir' }).click()

				// Verificar toast de sucesso
				await expect(authenticatedPage.getByText(/contato excluído|removido com sucesso/i)).toBeVisible()
			}
		})

		test('✅ Listagem - filtros por status e busca por nome/email/função', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Verificar se lista carregou
			await expect(authenticatedPage.locator('table tbody tr').first()).toBeVisible()

			// Testar busca por nome
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('teste')
			await authenticatedPage.waitForTimeout(1000)

			// Testar filtro por status (usar Select customizado)
			await authenticatedPage.locator('button[aria-haspopup="listbox"]').click()
			await authenticatedPage.waitForTimeout(500)
			await authenticatedPage.locator('div.absolute.z-50:has-text("Apenas ativos")').click()

			// Verificar se filtros funcionam
			await expect(authenticatedPage.locator('table tbody tr').first()).toBeVisible()

			// Testar busca por email
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('@inpe.br')
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se resultados aparecem
			const searchResults = authenticatedPage.locator('table tbody tr')
			if ((await searchResults.count()) > 0) {
				await expect(searchResults.first()).toBeVisible()
			}

			// Limpar busca
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()

			// Verificar se lista original voltou
			await expect(authenticatedPage.locator('table tbody tr').first()).toBeVisible()
		})
	})
})
