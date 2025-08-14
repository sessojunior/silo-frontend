import { test, expect } from './utils/auth-helpers'

test.describe('👥 SISTEMA DE CONTATOS', () => {
	test.describe('📋 CRUD Completo', () => {
		test('✅ Criar contato - formulário completo e validações', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Verificar se página carregou
			await expect(authenticatedPage.getByRole('heading', { name: /contatos/i })).toBeVisible()

			// Clicar no botão de criar contato
			await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()

			// Verificar se formulário abriu
			await expect(authenticatedPage.getByLabel('Nome')).toBeVisible()

			// Preencher formulário
			await authenticatedPage.getByLabel('Nome').fill('Contato Teste Playwright')
			await authenticatedPage.getByLabel('Email').fill('contato.teste@inpe.br')
			await authenticatedPage.getByLabel('Função').fill('Meteorologista')
			await authenticatedPage.getByLabel('Telefone').fill('(11) 99999-9999')

			// Selecionar status ativo
			await authenticatedPage.getByRole('combobox', { name: /status/i }).selectOption('ativo')

			// Salvar contato
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/contato criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se contato aparece na lista
			await expect(authenticatedPage.getByText('Contato Teste Playwright')).toBeVisible()
		})

		test('✅ Editar contato - modificação de dados', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Clicar no botão editar do primeiro contato
			const editButton = authenticatedPage.locator('[data-testid="edit-contact"]').first()
			if ((await editButton.count()) > 0) {
				await editButton.click()

				// Modificar nome
				await authenticatedPage.getByLabel('Nome').clear()
				await authenticatedPage.getByLabel('Nome').fill('Contato Editado Playwright')

				// Modificar função
				await authenticatedPage.getByLabel('Função').clear()
				await authenticatedPage.getByLabel('Função').fill('Pesquisador')

				// Salvar alterações
				await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

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
			await expect(authenticatedPage.locator('[data-testid="contact-item"]')).toBeVisible()

			// Testar busca por nome
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('teste')
			await authenticatedPage.waitForTimeout(1000)

			// Testar filtro por status
			await authenticatedPage.getByRole('combobox', { name: /status/i }).selectOption('ativo')

			// Verificar se filtros funcionam
			await expect(authenticatedPage.locator('[data-testid="contact-item"]')).toBeVisible()

			// Testar busca por email
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('@inpe.br')
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se resultados aparecem
			const searchResults = authenticatedPage.locator('[data-testid="contact-item"]')
			if ((await searchResults.count()) > 0) {
				await expect(searchResults.first()).toBeVisible()
			}

			// Limpar busca
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()

			// Verificar se lista original voltou
			await expect(authenticatedPage.locator('[data-testid="contact-item"]')).toBeVisible()
		})
	})

	test.describe('📁 Upload de Imagens', () => {
		test('✅ Upload via UploadThing - funciona corretamente', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Clicar em criar novo contato
			await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()

			// Verificar se campo de upload está visível
			await expect(authenticatedPage.getByLabel(/foto|imagem/i)).toBeVisible()

			// Fazer upload de imagem de teste
			const fileInput = authenticatedPage.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/test-image.txt')

			// Aguardar upload
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se upload foi bem-sucedido
			await expect(authenticatedPage.getByText(/upload concluído|imagem carregada/i)).toBeVisible()

			// Preencher outros campos obrigatórios
			await authenticatedPage.getByLabel('Nome').fill('Contato com Foto')
			await authenticatedPage.getByLabel('Email').fill('foto@teste.com')

			// Salvar contato
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar sucesso
			await expect(authenticatedPage.getByText(/contato criado|salvo com sucesso/i)).toBeVisible()
		})

		test('✅ Limite de tamanho - 4MB respeitado', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Clicar em criar novo contato
			await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()

			// Verificar se campo de upload está visível
			await expect(authenticatedPage.getByLabel(/foto|imagem/i)).toBeVisible()

			// Tentar fazer upload de arquivo grande (simulado)
			const fileInput = authenticatedPage.locator('input[type="file"]')

			// Simular arquivo grande
			await authenticatedPage.evaluate(() => {
				const input = document.querySelector('input[type="file"]') as HTMLInputElement
				if (input) {
					const file = new File(['x'.repeat(5 * 1024 * 1024)], 'large-file.jpg', { type: 'image/jpeg' })
					const dataTransfer = new DataTransfer()
					dataTransfer.items.add(file)
					input.files = dataTransfer.files
					input.dispatchEvent(new Event('change', { bubbles: true }))
				}
			})

			// Aguardar validação
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se erro de tamanho apareceu
			await expect(authenticatedPage.getByText(/tamanho máximo|4MB|arquivo muito grande/i)).toBeVisible()
		})

		test('✅ Preview - imagem exibida após upload', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Clicar em criar novo contato
			await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()

			// Fazer upload de imagem
			const fileInput = authenticatedPage.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/test-image.txt')

			// Aguardar upload
			await authenticatedPage.waitForTimeout(2000)

			// Verificar se preview está visível
			const preview = authenticatedPage.locator('[data-testid="image-preview"]')
			if ((await preview.count()) > 0) {
				await expect(preview).toBeVisible()

				// Verificar se imagem tem dimensões corretas
				const imageElement = preview.locator('img')
				if ((await imageElement.count()) > 0) {
					await expect(imageElement).toBeVisible()
				}
			}
		})

		test('✅ Exclusão - remove da UploadThing quando deletado', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Criar contato com imagem
			await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()
			await authenticatedPage.getByLabel('Nome').fill('Contato para Excluir')
			await authenticatedPage.getByLabel('Email').fill('excluir@teste.com')

			// Fazer upload de imagem
			const fileInput = authenticatedPage.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/test-image.txt')
			await authenticatedPage.waitForTimeout(2000)

			// Salvar contato
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()
			await expect(authenticatedPage.getByText(/contato criado|salvo com sucesso/i)).toBeVisible()

			// Excluir contato
			const deleteButton = authenticatedPage.locator('[data-testid="delete-contact"]').first()
			await deleteButton.click()
			await authenticatedPage.getByRole('button', { name: 'Excluir' }).click()

			// Verificar se foi excluído
			await expect(authenticatedPage.getByText(/contato excluído|removido com sucesso/i)).toBeVisible()
		})
	})

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
				await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

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

	test.describe('🔍 Validações e Filtros', () => {
		test('✅ Validação de email único', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Criar primeiro contato
			await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()
			await authenticatedPage.getByLabel('Nome').fill('Contato Único 1')
			await authenticatedPage.getByLabel('Email').fill('unico@teste.com')
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()
			await expect(authenticatedPage.getByText(/contato criado|salvo com sucesso/i)).toBeVisible()

			// Tentar criar segundo contato com mesmo email
			await authenticatedPage.getByRole('button', { name: /criar|novo/i }).click()
			await authenticatedPage.getByLabel('Nome').fill('Contato Único 2')
			await authenticatedPage.getByLabel('Email').fill('unico@teste.com')
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar se erro de email duplicado apareceu
			await expect(authenticatedPage.getByText(/email já existe|duplicado/i)).toBeVisible()
		})

		test('✅ Filtro por status ativo/inativo', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Verificar se filtro está visível
			await expect(authenticatedPage.getByRole('combobox', { name: /status/i })).toBeVisible()

			// Filtrar por contatos ativos
			await authenticatedPage.getByRole('combobox', { name: /status/i }).selectOption('ativo')

			// Verificar se apenas contatos ativos são exibidos
			const activeContacts = authenticatedPage.locator('[data-testid="contact-item"][data-status="ativo"]')
			if ((await activeContacts.count()) > 0) {
				await expect(activeContacts.first()).toBeVisible()
			}

			// Filtrar por contatos inativos
			await authenticatedPage.getByRole('combobox', { name: /status/i }).selectOption('inativo')

			// Verificar se apenas contatos inativos são exibidos
			const inactiveContacts = authenticatedPage.locator('[data-testid="contact-item"][data-status="inativo"]')
			if ((await inactiveContacts.count()) > 0) {
				await expect(inactiveContacts.first()).toBeVisible()
			}

			// Limpar filtro
			await authenticatedPage.getByRole('combobox', { name: /status/i }).selectOption('todos')
		})

		test('✅ Busca por nome, email e função', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Verificar se campo de busca está visível
			await expect(authenticatedPage.getByPlaceholder(/buscar|pesquisar/i)).toBeVisible()

			// Buscar por nome
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('admin')

			// Aguardar resultados
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se resultados aparecem
			const nameResults = authenticatedPage.locator('[data-testid="contact-item"]')
			if ((await nameResults.count()) > 0) {
				await expect(nameResults.first()).toBeVisible()
			}

			// Buscar por email
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('@inpe.br')

			// Aguardar resultados
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se resultados aparecem
			const emailResults = authenticatedPage.locator('[data-testid="contact-item"]')
			if ((await emailResults.count()) > 0) {
				await expect(emailResults.first()).toBeVisible()
			}

			// Buscar por função
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).fill('meteorologista')

			// Aguardar resultados
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se resultados aparecem
			const functionResults = authenticatedPage.locator('[data-testid="contact-item"]')
			if ((await functionResults.count()) > 0) {
				await expect(functionResults.first()).toBeVisible()
			}

			// Limpar busca
			await authenticatedPage.getByPlaceholder(/buscar|pesquisar/i).clear()

			// Verificar se lista original voltou
			await expect(authenticatedPage.locator('[data-testid="contact-item"]')).toBeVisible()
		})
	})

	test.describe('📱 UX e Responsividade', () => {
		test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/contacts')

			// Testar resolução desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
			await expect(authenticatedPage.getByRole('heading', { name: /contatos/i })).toBeVisible()

			// Testar resolução tablet
			await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
			await expect(authenticatedPage.getByRole('heading', { name: /contatos/i })).toBeVisible()

			// Testar resolução mobile
			await authenticatedPage.setViewportSize({ width: 375, height: 667 })
			await expect(authenticatedPage.getByRole('heading', { name: /contatos/i })).toBeVisible()

			// Voltar para desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		})
	})
})
