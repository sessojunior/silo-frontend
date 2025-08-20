import { test, expect } from './utils/auth-helpers'

test.describe('👥 SISTEMA DE CONTATOS - ASSOCIAÇÕES', () => {
	test.describe('🔗 Associações com Produtos', () => {
		test('✅ Seleção múltipla - associar contatos a produtos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Clicar no primeiro produto
			const productItem = authenticatedPage.locator('[data-testid="product-item"]').first()
			if ((await productItem.count()) > 0) {
				await productItem.click()

				// Ir para aba de contatos
				await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

				// Verificar se seção de contatos está visível
				await expect(authenticatedPage.getByText(/contatos do produto|associar contatos/i)).toBeVisible()

				// Clicar em adicionar contatos
				await authenticatedPage.getByRole('button', { name: /adicionar|associar/i }).click()

				// Verificar se seletor de contatos abriu
				await expect(authenticatedPage.getByText(/selecionar contatos/i)).toBeVisible()

				// Selecionar contatos
				const contactCheckboxes = authenticatedPage.locator('[data-testid="contact-checkbox"]')
				if ((await contactCheckboxes.count()) > 0) {
					await contactCheckboxes.first().check()
					await contactCheckboxes.nth(1).check()

					// Confirmar seleção
					await authenticatedPage.getByRole('button', { name: 'Confirmar' }).click()

					// Verificar toast de sucesso
					await expect(authenticatedPage.getByText(/contatos associados|adicionados com sucesso/i)).toBeVisible()
				}
			}
		})

		test('✅ Reflexo na UI - associações aparecem nas páginas de produtos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Clicar no primeiro produto
			const productItem = authenticatedPage.locator('[data-testid="product-item"]').first()
			if ((await productItem.count()) > 0) {
				await productItem.click()

				// Ir para aba de contatos
				await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

				// Verificar se contatos associados aparecem
				const associatedContacts = authenticatedPage.locator('[data-testid="associated-contact"]')
				if ((await associatedContacts.count()) > 0) {
					await expect(associatedContacts.first()).toBeVisible()

					// Verificar se informações do contato estão corretas
					await expect(authenticatedPage.getByText(/nome|email|função/i)).toBeVisible()
				}
			}
		})

		test('✅ Remoção - desassociar contatos de produtos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Clicar no primeiro produto
			const productItem = authenticatedPage.locator('[data-testid="product-item"]').first()
			if ((await productItem.count()) > 0) {
				await productItem.click()

				// Ir para aba de contatos
				await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

				// Verificar se há contatos associados
				const associatedContacts = authenticatedPage.locator('[data-testid="associated-contact"]')
				if ((await associatedContacts.count()) > 0) {
					// Clicar no botão de remover do primeiro contato
					const removeButton = associatedContacts.first().locator('[data-testid="remove-contact"]')
					await removeButton.click()

					// Verificar se confirmação apareceu
					await expect(authenticatedPage.getByText(/confirmar remoção|desassociar contato/i)).toBeVisible()

					// Confirmar remoção
					await authenticatedPage.getByRole('button', { name: 'Confirmar' }).click()

					// Verificar toast de sucesso
					await expect(authenticatedPage.getByText(/contato removido|desassociado com sucesso/i)).toBeVisible()
				}
			}
		})

		test('✅ Persistência - associações mantidas após edição do produto', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Clicar no primeiro produto
			const productItem = authenticatedPage.locator('[data-testid="product-item"]').first()
			if ((await productItem.count()) > 0) {
				await productItem.click()

				// Ir para aba de contatos
				await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

				// Verificar contatos associados
				const associatedContacts = authenticatedPage.locator('[data-testid="associated-contact"]')
				const initialCount = await associatedContacts.count()

				// Ir para aba de detalhes
				await authenticatedPage.getByRole('tab', { name: /detalhes|geral/i }).click()

				// Editar nome do produto
				await authenticatedPage.getByLabel('Nome').clear()
				await authenticatedPage.getByLabel('Nome').fill('Produto Editado Teste')

				// Salvar alterações
				await authenticatedPage.locator('button[type="submit"]:has-text("Salvar")').click()

				// Verificar sucesso
				await expect(authenticatedPage.getByText(/produto atualizado|alterado com sucesso/i)).toBeVisible()

				// Voltar para aba de contatos
				await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

				// Verificar se contatos ainda estão associados
				const finalCount = await associatedContacts.count()
				expect(finalCount).toBe(initialCount)
			}
		})
	})
})
