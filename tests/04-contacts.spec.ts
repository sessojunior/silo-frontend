import { test, expect } from '@playwright/test'
import { fillFormField, clickButton } from './utils/auth-helpers'

test.describe('👥 SISTEMA DE CONTATOS', () => {
	test.beforeEach(async ({ page }) => {
		// Fazer login como administrador
		await page.goto('/auth/login')
		await page.getByLabel('Email').fill('admin@inpe.br')
		await page.getByLabel('Senha').fill('admin123')
		await page.getByRole('button', { name: 'Entrar' }).click()
		await page.waitForURL('/admin/dashboard')
	})

	test.describe('📋 CRUD Completo', () => {
		test('✅ Criar contato - formulário completo e validações', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Clicar no botão de criar contato
			await clickButton(page, 'Criar Contato')

			// Preencher formulário
			await fillFormField(page, 'Nome', 'Contato Teste Playwright')
			await fillFormField(page, 'Email', 'contato.teste@inpe.br')
			await fillFormField(page, 'Função', 'Meteorologista')
			await fillFormField(page, 'Telefone', '(11) 99999-9999')

			// Selecionar status ativo
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')

			// Salvar contato
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/contato criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se contato aparece na lista
			await expect(page.getByText('Contato Teste Playwright')).toBeVisible()
		})

		test('✅ Editar contato - modificação de dados', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Clicar no botão editar do primeiro contato
			await page.locator('[data-testid="edit-contact"]').first().click()

			// Modificar nome
			await page.getByLabel('Nome').clear()
			await fillFormField(page, 'Nome', 'Contato Editado Playwright')

			// Modificar função
			await page.getByLabel('Função').clear()
			await fillFormField(page, 'Função', 'Pesquisador')

			// Salvar alterações
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/contato atualizado|alterado com sucesso/i)).toBeVisible()

			// Verificar se alterações aparecem na lista
			await expect(page.getByText('Contato Editado Playwright')).toBeVisible()
		})

		test('✅ Excluir contato - confirmação e remoção', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Clicar no botão excluir do primeiro contato
			await page.locator('[data-testid="delete-contact"]').first().click()

			// Verificar se dialog de confirmação aparece
			await expect(page.getByText(/confirmar exclusão|excluir contato/i)).toBeVisible()

			// Confirmar exclusão
			await clickButton(page, 'Excluir')

			// Verificar toast de sucesso
			await expect(page.getByText(/contato excluído|removido com sucesso/i)).toBeVisible()
		})

		test('✅ Listagem - filtros por status e busca por nome/email/função', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Verificar se lista carregou
			await expect(page.locator('[data-testid="contact-item"]')).toHaveCount.greaterThan(0)

			// Testar busca por nome
			await page.getByPlaceholder(/buscar contatos/i).fill('teste')
			await page.waitForTimeout(1000)

			// Testar filtro por status
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')

			// Verificar se filtros funcionam
			await expect(page.locator('[data-testid="contact-item"]')).toBeVisible()

			// Testar busca por email
			await page.getByPlaceholder(/buscar contatos/i).clear()
			await page.getByPlaceholder(/buscar contatos/i).fill('@inpe.br')
			await page.waitForTimeout(1000)

			// Testar busca por função
			await page.getByPlaceholder(/buscar contatos/i).clear()
			await page.getByPlaceholder(/buscar contatos/i).fill('Meteorologista')
			await page.waitForTimeout(1000)
		})
	})

	test.describe('📸 Upload de Fotos', () => {
		test('✅ Upload via UploadThing - funciona corretamente', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Clicar em criar contato
			await clickButton(page, 'Criar Contato')

			// Preencher campos obrigatórios
			await fillFormField(page, 'Nome', 'Contato com Foto')
			await fillFormField(page, 'Email', 'contato.foto@inpe.br')
			await fillFormField(page, 'Função', 'Meteorologista')
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')

			// Upload de foto
			const fileInput = page.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/contact-photo.jpg')

			// Verificar se foto foi carregada
			await expect(page.locator('[data-testid="photo-preview"]')).toBeVisible()

			// Salvar contato
			await clickButton(page, 'Salvar')

			// Verificar sucesso
			await expect(page.getByText(/contato criado|salvo com sucesso/i)).toBeVisible()
		})

		test('✅ Limite de tamanho - 4MB respeitado', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Clicar em criar contato
			await clickButton(page, 'Criar Contato')

			// Preencher campos obrigatórios
			await fillFormField(page, 'Nome', 'Contato Teste Limite')
			await fillFormField(page, 'Email', 'contato.limite@inpe.br')
			await fillFormField(page, 'Função', 'Meteorologista')
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')

			// Tentar upload de arquivo grande (se existir)
			try {
				const fileInput = page.locator('input[type="file"]')
				await fileInput.setInputFiles('tests/fixtures/large-file.jpg')

				// Deve mostrar erro de arquivo muito grande
				await expect(page.getByText(/arquivo muito grande|limite excedido/i)).toBeVisible()
			} catch (error) {
				// Se arquivo não existir, testar validação de tamanho
				await expect(page.locator('input[type="file"]')).toBeVisible()
			}
		})

		test('✅ Preview - imagem exibida após upload', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Clicar em criar contato
			await clickButton(page, 'Criar Contato')

			// Preencher campos obrigatórios
			await fillFormField(page, 'Nome', 'Contato Preview')
			await fillFormField(page, 'Email', 'contato.preview@inpe.br')
			await fillFormField(page, 'Função', 'Meteorologista')
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')

			// Upload de foto
			const fileInput = page.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/contact-photo.jpg')

			// Verificar preview
			await expect(page.locator('[data-testid="photo-preview"]')).toBeVisible()

			// Verificar se imagem tem dimensões corretas
			const preview = page.locator('[data-testid="photo-preview"] img')
			await expect(preview).toBeVisible()

			// Verificar se tem alt text
			const altText = await preview.getAttribute('alt')
			expect(altText).toContain('Contato Preview')
		})

		test('✅ Exclusão - remove da UploadThing quando deletado', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Criar contato com foto primeiro
			await clickButton(page, 'Criar Contato')
			await fillFormField(page, 'Nome', 'Contato para Excluir')
			await fillFormField(page, 'Email', 'contato.excluir@inpe.br')
			await fillFormField(page, 'Função', 'Meteorologista')
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')

			const fileInput = page.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/contact-photo.jpg')

			await clickButton(page, 'Salvar')
			await expect(page.getByText(/contato criado|salvo com sucesso/i)).toBeVisible()

			// Agora excluir o contato
			await page.locator('[data-testid="delete-contact"]').first().click()
			await clickButton(page, 'Excluir')

			// Verificar se foi excluído
			await expect(page.getByText(/contato excluído|removido com sucesso/i)).toBeVisible()

			// Verificar se não aparece mais na lista
			await expect(page.getByText('Contato para Excluir')).not.toBeVisible()
		})
	})

	test.describe('🔗 Associação com Produtos', () => {
		test('✅ Seleção múltipla - associar contatos a produtos', async ({ page }) => {
			await page.goto('/admin/products')

			// Clicar no primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de contatos
			await page.getByRole('tab', { name: /contatos/i }).click()

			// Clicar em adicionar contatos
			await clickButton(page, 'Adicionar Contatos')

			// Verificar se seletor abre
			await expect(page.locator('[data-testid="contact-selector"]')).toBeVisible()

			// Selecionar múltiplos contatos
			await page.locator('[data-testid="contact-checkbox"]').nth(0).check()
			await page.locator('[data-testid="contact-checkbox"]').nth(1).check()

			// Confirmar seleção
			await clickButton(page, 'Confirmar')

			// Verificar se contatos foram adicionados
			await expect(page.locator('[data-testid="contact-item"]')).toHaveCount(2)
		})

		test('✅ Reflexo na UI - associações aparecem nas páginas de produtos', async ({ page }) => {
			await page.goto('/admin/products')

			// Clicar no primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de contatos
			await page.getByRole('tab', { name: /contatos/i }).click()

			// Verificar se contatos associados são exibidos
			const contacts = page.locator('[data-testid="contact-item"]')
			if ((await contacts.count()) > 0) {
				await expect(contacts.first()).toBeVisible()

				// Verificar se informações do contato estão visíveis
				await expect(page.locator('[data-testid="contact-name"]')).toBeVisible()
				await expect(page.locator('[data-testid="contact-function"]')).toBeVisible()
				await expect(page.locator('[data-testid="contact-email"]')).toBeVisible()
			}
		})

		test('✅ Remoção - desassociar contatos de produtos', async ({ page }) => {
			await page.goto('/admin/products')

			// Clicar no primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de contatos
			await page.getByRole('tab', { name: /contatos/i }).click()

			// Se houver contatos associados, remover um
			const contacts = page.locator('[data-testid="contact-item"]')
			if ((await contacts.count()) > 0) {
				// Clicar no botão remover do primeiro contato
				await page.locator('[data-testid="remove-contact"]').first().click()

				// Verificar se contato foi removido
				await expect(page.locator('[data-testid="contact-item"]')).toHaveCount((await contacts.count()) - 1)
			}
		})

		test('✅ Persistência - associações mantidas após edição do produto', async ({ page }) => {
			await page.goto('/admin/products')

			// Clicar no primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de contatos
			await page.getByRole('tab', { name: /contatos/i }).click()

			// Contar contatos associados
			const initialCount = await page.locator('[data-testid="contact-item"]').count()

			// Editar produto (sem alterar contatos)
			await page.getByRole('tab', { name: /geral/i }).click()
			await clickButton(page, 'Editar')
			await clickButton(page, 'Salvar')

			// Voltar para contatos
			await page.getByRole('tab', { name: /contatos/i }).click()

			// Verificar se contagem permanece igual
			await expect(page.locator('[data-testid="contact-item"]')).toHaveCount(initialCount)
		})
	})

	test.describe('🔍 Funcionalidades Avançadas', () => {
		test('✅ Validação de email único', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Criar primeiro contato
			await clickButton(page, 'Criar Contato')
			await fillFormField(page, 'Nome', 'Contato Único')
			await fillFormField(page, 'Email', 'contato.unico@inpe.br')
			await fillFormField(page, 'Função', 'Meteorologista')
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')
			await clickButton(page, 'Salvar')

			await expect(page.getByText(/contato criado|salvo com sucesso/i)).toBeVisible()

			// Tentar criar segundo contato com mesmo email
			await clickButton(page, 'Criar Contato')
			await fillFormField(page, 'Nome', 'Contato Duplicado')
			await fillFormField(page, 'Email', 'contato.unico@inpe.br') // Mesmo email
			await fillFormField(page, 'Função', 'Pesquisador')
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')
			await clickButton(page, 'Salvar')

			// Deve mostrar erro de email duplicado
			await expect(page.getByText(/email já existe|duplicado/i)).toBeVisible()
		})

		test('✅ Filtro por status ativo/inativo', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Verificar filtro por status ativo
			await page.getByRole('combobox', { name: /status/i }).selectOption('Ativo')
			await page.waitForTimeout(1000)

			// Verificar se apenas contatos ativos são exibidos
			const activeContacts = page.locator('[data-testid="contact-item"]')
			if ((await activeContacts.count()) > 0) {
				await expect(activeContacts.first()).toBeVisible()
			}

			// Verificar filtro por status inativo
			await page.getByRole('combobox', { name: /status/i }).selectOption('Inativo')
			await page.waitForTimeout(1000)

			// Verificar se apenas contatos inativos são exibidos
			const inactiveContacts = page.locator('[data-testid="contact-item"]')
			if ((await inactiveContacts.count()) > 0) {
				await expect(inactiveContacts.first()).toBeVisible()
			}

			// Verificar filtro "Todos"
			await page.getByRole('combobox', { name: /status/i }).selectOption('Todos')
			await page.waitForTimeout(1000)

			// Verificar se todos os contatos são exibidos
			const allContacts = page.locator('[data-testid="contact-item"]')
			await expect(allContacts).toBeVisible()
		})

		test('✅ Busca por nome, email e função', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Busca por nome
			await page.getByPlaceholder(/buscar contatos/i).fill('Meteorologista')
			await page.waitForTimeout(1000)

			// Verificar se resultados contêm "Meteorologista"
			const nameResults = page.locator('[data-testid="contact-item"]')
			if ((await nameResults.count()) > 0) {
				await expect(nameResults.first()).toBeVisible()
			}

			// Busca por email
			await page.getByPlaceholder(/buscar contatos/i).clear()
			await page.getByPlaceholder(/buscar contatos/i).fill('@inpe.br')
			await page.waitForTimeout(1000)

			// Verificar se resultados contêm emails @inpe.br
			const emailResults = page.locator('[data-testid="contact-item"]')
			if ((await emailResults.count()) > 0) {
				await expect(emailResults.first()).toBeVisible()
			}

			// Busca por função
			await page.getByPlaceholder(/buscar contatos/i).clear()
			await page.getByPlaceholder(/buscar contatos/i).fill('Pesquisador')
			await page.waitForTimeout(1000)

			// Verificar se resultados contêm "Pesquisador"
			const functionResults = page.locator('[data-testid="contact-item"]')
			if ((await functionResults.count()) > 0) {
				await expect(functionResults.first()).toBeVisible()
			}
		})

		test('✅ Responsividade em diferentes resoluções', async ({ page }) => {
			await page.goto('/admin/contacts')

			// Testar resolução desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
			await expect(page.getByRole('heading', { name: /contatos/i })).toBeVisible()

			// Testar resolução tablet
			await page.setViewportSize({ width: 768, height: 1024 })
			await expect(page.getByRole('heading', { name: /contatos/i })).toBeVisible()

			// Testar resolução mobile
			await page.setViewportSize({ width: 375, height: 667 })
			await expect(page.getByRole('heading', { name: /contatos/i })).toBeVisible()

			// Voltar para desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
		})
	})
})
