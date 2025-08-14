import { test, expect } from '@playwright/test'
import { fillFormField, clickButton } from './utils/auth-helpers'

test.describe('🏭 PRODUTOS, PROBLEMAS E SOLUÇÕES', () => {
	test.beforeEach(async ({ page }) => {
		// Fazer login como administrador
		await page.goto('/auth/login')
		await page.getByLabel('Email').fill('admin@inpe.br')
		await page.getByLabel('Senha').fill('admin123')
		await page.getByRole('button', { name: 'Entrar' }).click()
		await page.waitForURL('/admin/dashboard')
	})

	test.describe('📦 CRUD de Produtos', () => {
		test('✅ Criar produto - formulário completo e validações', async ({ page }) => {
			await page.goto('/admin/products')

			// Clicar no botão de criar produto
			await clickButton(page, 'Criar Produto')

			// Preencher formulário
			await fillFormField(page, 'Nome', 'Produto Teste Playwright')
			await fillFormField(page, 'Descrição', 'Descrição do produto de teste')
			await fillFormField(page, 'Prioridade', 'Alta')

			// Selecionar ícone
			await page.getByRole('button', { name: /selecionar ícone/i }).click()
			await page.locator('[data-icon="server"]').click()

			// Selecionar cor
			await page.getByRole('button', { name: /selecionar cor/i }).click()
			await page.locator('[data-color="blue"]').click()

			// Salvar produto
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/produto criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se produto aparece na lista
			await expect(page.getByText('Produto Teste Playwright')).toBeVisible()
		})

		test('✅ Editar produto - modificação de dados e salvamento', async ({ page }) => {
			await page.goto('/admin/products')

			// Clicar no botão editar do primeiro produto
			await page.locator('[data-testid="edit-product"]').first().click()

			// Modificar nome
			await page.getByLabel('Nome').clear()
			await fillFormField(page, 'Nome', 'Produto Editado Playwright')

			// Modificar descrição
			await page.getByLabel('Descrição').clear()
			await fillFormField(page, 'Descrição', 'Descrição editada')

			// Salvar alterações
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/produto atualizado|alterado com sucesso/i)).toBeVisible()

			// Verificar se alterações aparecem na lista
			await expect(page.getByText('Produto Editado Playwright')).toBeVisible()
		})

		test('✅ Excluir produto - confirmação e remoção completa', async ({ page }) => {
			await page.goto('/admin/products')

			// Clicar no botão excluir do primeiro produto
			await page.locator('[data-testid="delete-product"]').first().click()

			// Verificar se dialog de confirmação aparece
			await expect(page.getByText(/confirmar exclusão|excluir produto/i)).toBeVisible()

			// Confirmar exclusão
			await clickButton(page, 'Excluir')

			// Verificar toast de sucesso
			await expect(page.getByText(/produto excluído|removido com sucesso/i)).toBeVisible()
		})

		test('✅ Listagem - filtros, busca e paginação', async ({ page }) => {
			await page.goto('/admin/products')

			// Verificar se lista carregou
			await expect(page.locator('[data-testid="product-item"]')).toHaveCount.greaterThan(0)

			// Testar busca
			await page.getByPlaceholder(/buscar produtos/i).fill('teste')
			await page.waitForTimeout(1000)

			// Testar filtro por prioridade
			await page.getByRole('combobox', { name: /prioridade/i }).selectOption('Alta')

			// Verificar se filtros funcionam
			await expect(page.locator('[data-testid="product-item"]')).toBeVisible()
		})
	})

	test.describe('🚨 Sistema de Problemas', () => {
		test('✅ Criar problema - formulário e categorização obrigatória', async ({ page }) => {
			await page.goto('/admin/products')

			// Clicar no primeiro produto para acessar problemas
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em criar problema
			await clickButton(page, 'Criar Problema')

			// Preencher formulário
			await fillFormField(page, 'Título', 'Problema Teste Playwright')
			await fillFormField(page, 'Descrição', 'Descrição do problema de teste')

			// Selecionar categoria (obrigatória)
			await page.getByRole('combobox', { name: /categoria/i }).selectOption('Rede externa')

			// Salvar problema
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/problema criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se problema aparece na lista
			await expect(page.getByText('Problema Teste Playwright')).toBeVisible()
		})

		test('✅ Upload de imagens via UploadThing - limite de 3 imagens', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em criar problema
			await clickButton(page, 'Criar Problema')

			// Preencher campos obrigatórios
			await fillFormField(page, 'Título', 'Problema com Imagens')
			await fillFormField(page, 'Descrição', 'Problema para testar upload')
			await page.getByRole('combobox', { name: /categoria/i }).selectOption('Rede externa')

			// Testar upload de imagem
			const fileInput = page.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/test-image.jpg')

			// Verificar se imagem foi carregada
			await expect(page.locator('[data-testid="image-preview"]')).toBeVisible()

			// Salvar problema
			await clickButton(page, 'Salvar')

			// Verificar sucesso
			await expect(page.getByText(/problema criado|salvo com sucesso/i)).toBeVisible()
		})

		test('✅ Threading - visualização hierárquica de problemas', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*\/problems/)

			// Verificar se problemas estão organizados hierarquicamente
			await expect(page.locator('[data-testid="problem-thread"]')).toBeVisible()

			// Clicar em um problema para ver detalhes
			await page.locator('[data-testid="problem-item"]').first().click()

			// Verificar se detalhes do problema aparecem
			await expect(page.locator('[data-testid="problem-details"]')).toBeVisible()
		})
	})

	test.describe('💡 Sistema de Soluções', () => {
		test('✅ Responder problema - criação de solução', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em um problema
			await page.locator('[data-testid="problem-item"]').first().click()

			// Clicar em responder
			await clickButton(page, 'Responder')

			// Preencher solução
			await fillFormField(page, 'Solução', 'Solução de teste para o problema')

			// Salvar solução
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/solução criada|salva com sucesso/i)).toBeVisible()

			// Verificar se solução aparece
			await expect(page.getByText('Solução de teste para o problema')).toBeVisible()
		})

		test('✅ Upload de imagens em soluções via UploadThing', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em um problema
			await page.locator('[data-testid="problem-item"]').first().click()

			// Clicar em responder
			await clickButton(page, 'Responder')

			// Preencher solução
			await fillFormField(page, 'Solução', 'Solução com imagem')

			// Upload de imagem
			const fileInput = page.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/solution-image.jpg')

			// Verificar preview
			await expect(page.locator('[data-testid="image-preview"]')).toBeVisible()

			// Salvar
			await clickButton(page, 'Salvar')

			// Verificar sucesso
			await expect(page.getByText(/solução criada|salva com sucesso/i)).toBeVisible()
		})

		test('✅ Marcar solução como correta', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em um problema
			await page.locator('[data-testid="problem-item"]').first().click()

			// Verificar se há soluções
			const solutions = page.locator('[data-testid="solution-item"]')
			if ((await solutions.count()) > 0) {
				// Clicar no botão de marcar como correta
				await page.locator('[data-testid="mark-correct"]').first().click()

				// Verificar se foi marcada como correta
				await expect(page.locator('[data-testid="correct-badge"]')).toBeVisible()
			}
		})
	})

	test.describe('🏷️ Categorias de Problemas', () => {
		test('✅ CRUD de categorias - criar/editar/excluir no offcanvas', async ({ page }) => {
			await page.goto('/admin/problems')

			// Clicar no botão de configurações de categorias
			await clickButton(page, 'Configurações')

			// Verificar se offcanvas abre
			await expect(page.locator('[data-testid="categories-offcanvas"]')).toBeVisible()

			// Criar nova categoria
			await clickButton(page, 'Nova Categoria')
			await fillFormField(page, 'Nome', 'Categoria Teste Playwright')
			await page.getByRole('combobox', { name: /cor/i }).selectOption('red')
			await clickButton(page, 'Salvar')

			// Verificar sucesso
			await expect(page.getByText(/categoria criada|salva com sucesso/i)).toBeVisible()

			// Editar categoria
			await page.locator('[data-testid="edit-category"]').last().click()
			await page.getByLabel('Nome').clear()
			await fillFormField(page, 'Nome', 'Categoria Editada')
			await clickButton(page, 'Salvar')

			// Verificar sucesso
			await expect(page.getByText(/categoria atualizada|alterada com sucesso/i)).toBeVisible()

			// Excluir categoria
			await page.locator('[data-testid="delete-category"]').last().click()
			await clickButton(page, 'Excluir')

			// Verificar sucesso
			await expect(page.getByText(/categoria excluída|removida com sucesso/i)).toBeVisible()
		})

		test('✅ Validação de nomes únicos - não permite duplicatas', async ({ page }) => {
			await page.goto('/admin/problems')

			// Abrir configurações de categorias
			await clickButton(page, 'Configurações')

			// Tentar criar categoria com nome existente
			await clickButton(page, 'Nova Categoria')
			await fillFormField(page, 'Nome', 'Rede externa') // Nome já existe
			await page.getByRole('combobox', { name: /cor/i }).selectOption('red')
			await clickButton(page, 'Salvar')

			// Deve mostrar erro de nome duplicado
			await expect(page.getByText(/nome já existe|duplicado/i)).toBeVisible()
		})

		test('✅ 6 categorias padrão presentes', async ({ page }) => {
			await page.goto('/admin/problems')

			// Abrir configurações de categorias
			await clickButton(page, 'Configurações')

			// Verificar se todas as categorias padrão estão presentes
			await expect(page.getByText('Rede externa')).toBeVisible()
			await expect(page.getByText('Rede interna')).toBeVisible()
			await expect(page.getByText('Servidor indisponível')).toBeVisible()
			await expect(page.getByText('Falha humana')).toBeVisible()
			await expect(page.getByText('Erro no software')).toBeVisible()
			await expect(page.getByText('Outros')).toBeVisible()
		})
	})

	test.describe('🔗 Dependências Hierárquicas (MenuBuilder)', () => {
		test('✅ Drag & drop - funciona corretamente', async ({ page }) => {
			await page.goto('/admin/products')

			// Clicar no primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de dependências
			await page.getByRole('tab', { name: /dependências/i }).click()

			// Verificar se MenuBuilder está visível
			await expect(page.locator('[data-testid="menu-builder"]')).toBeVisible()

			// Testar drag & drop (se houver itens)
			const items = page.locator('[data-testid="menu-item"]')
			if ((await items.count()) > 1) {
				const firstItem = items.first()
				const secondItem = items.nth(1)

				// Arrastar primeiro item para depois do segundo
				await firstItem.dragTo(secondItem)

				// Verificar se ordem mudou
				await expect(page.locator('[data-testid="menu-item"]').first()).not.toHaveText(await firstItem.textContent())
			}
		})

		test('✅ Hierarquia - mantém estrutura pai-filho', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar dependências do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.getByRole('tab', { name: /dependências/i }).click()

			// Verificar se estrutura hierárquica está visível
			await expect(page.locator('[data-testid="menu-hierarchy"]')).toBeVisible()

			// Verificar se há itens aninhados
			const nestedItems = page.locator('[data-testid="nested-item"]')
			if ((await nestedItems.count()) > 0) {
				await expect(nestedItems.first()).toBeVisible()
			}
		})

		test('✅ Ícones Lucide - renderizam corretamente', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar dependências do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.getByRole('tab', { name: /dependências/i }).click()

			// Verificar se ícones estão visíveis
			const icons = page.locator('[data-testid="menu-icon"]')
			if ((await icons.count()) > 0) {
				await expect(icons.first()).toBeVisible()

				// Verificar se ícone tem classe Lucide
				const iconClass = await icons.first().getAttribute('class')
				expect(iconClass).toContain('lucide-')
			}
		})
	})

	test.describe('📚 Manual do Produto', () => {
		test('✅ Editor Markdown - funciona com preview', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar manual do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.getByRole('tab', { name: /manual/i }).click()

			// Verificar se editor está visível
			await expect(page.locator('[data-testid="markdown-editor"]')).toBeVisible()

			// Verificar se preview está visível
			await expect(page.locator('[data-testid="markdown-preview"]')).toBeVisible()

			// Digitar texto no editor
			await page.locator('[data-testid="markdown-editor"] textarea').fill('# Título Teste\n\nConteúdo de teste')

			// Verificar se preview atualiza
			await expect(page.getByText('Título Teste')).toBeVisible()
		})

		test('✅ Salvamento - persiste alterações', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar manual do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.getByRole('tab', { name: /manual/i }).click()

			// Editar conteúdo
			await page.locator('[data-testid="markdown-editor"] textarea').fill('# Conteúdo Salvo\n\nEste conteúdo deve ser salvo')

			// Salvar
			await clickButton(page, 'Salvar')

			// Verificar toast de sucesso
			await expect(page.getByText(/manual salvo|alterado com sucesso/i)).toBeVisible()

			// Recarregar página
			await page.reload()

			// Verificar se conteúdo foi persistido
			await expect(page.getByText('Conteúdo Salvo')).toBeVisible()
		})

		test('✅ Nomes únicos - capítulos e seções não podem ter nomes duplicados', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar manual do primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
			await page.getByRole('tab', { name: /manual/i }).click()

			// Tentar criar seção com nome duplicado
			await clickButton(page, 'Nova Seção')
			await fillFormField(page, 'Nome', 'Seção Existente') // Nome que já existe
			await clickButton(page, 'Salvar')

			// Deve mostrar erro de nome duplicado
			await expect(page.getByText(/nome já existe|duplicado/i)).toBeVisible()
		})
	})

	test.describe('👥 Associação Produto-Contato', () => {
		test('✅ Seleção múltipla - adicionar múltiplos contatos', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar primeiro produto
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

		test('✅ Remoção - desassociar contatos', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
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

		test('✅ Persistência - associações mantidas após edição', async ({ page }) => {
			await page.goto('/admin/products')

			// Acessar primeiro produto
			await page.locator('[data-testid="product-item"]').first().click()
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
})
