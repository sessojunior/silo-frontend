import { test, expect } from './utils/auth-helpers'

test.describe('🏭 PRODUTOS, PROBLEMAS E SOLUÇÕES', () => {
	test.describe('📦 CRUD de Produtos', () => {
		test('✅ Criar produto - formulário completo e validações', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Clicar no botão de criar produto
			await authenticatedPage.getByRole('button', { name: 'Criar Produto' }).click()

			// Preencher formulário
			await authenticatedPage.getByLabel('Nome').fill('Produto Teste Playwright')
			await authenticatedPage.getByLabel('Descrição').fill('Descrição do produto de teste')
			await authenticatedPage.getByLabel('Prioridade').selectOption('Alta')

			// Selecionar ícone
			await authenticatedPage.getByRole('button', { name: /selecionar ícone/i }).click()
			await authenticatedPage.locator('[data-icon="server"]').click()

			// Selecionar cor
			await authenticatedPage.getByRole('button', { name: /selecionar cor/i }).click()
			await authenticatedPage.locator('[data-color="blue"]').click()

			// Salvar produto
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/produto criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se produto aparece na lista
			await expect(authenticatedPage.getByText('Produto Teste Playwright')).toBeVisible()
		})

		test('✅ Editar produto - modificação de dados e salvamento', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Clicar no botão editar do primeiro produto
			await authenticatedPage.locator('[data-testid="edit-product"]').first().click()

			// Modificar nome
			await authenticatedPage.getByLabel('Nome').clear()
			await authenticatedPage.getByLabel('Nome').fill('Produto Editado Playwright')

			// Modificar descrição
			await authenticatedPage.getByLabel('Descrição').clear()
			await authenticatedPage.getByLabel('Descrição').fill('Descrição editada')

			// Salvar alterações
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/produto atualizado|alterado com sucesso/i)).toBeVisible()

			// Verificar se alterações aparecem na lista
			await expect(authenticatedPage.getByText('Produto Editado Playwright')).toBeVisible()
		})

		test('✅ Excluir produto - confirmação e remoção completa', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Clicar no botão excluir do primeiro produto
			await authenticatedPage.locator('[data-testid="delete-product"]').first().click()

			// Verificar se dialog de confirmação aparece
			await expect(authenticatedPage.getByText(/confirmar exclusão|excluir produto/i)).toBeVisible()

			// Confirmar exclusão
			await authenticatedPage.getByRole('button', { name: 'Excluir' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/produto excluído|removido com sucesso/i)).toBeVisible()
		})

		test('✅ Listagem - filtros, busca e paginação', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Verificar se lista carregou
			await expect(authenticatedPage.locator('[data-testid="product-item"]')).toHaveCount.greaterThan(0)

			// Testar busca
			await authenticatedPage.getByPlaceholder(/buscar produtos/i).fill('teste')
			await authenticatedPage.waitForTimeout(1000)

			// Testar filtro por prioridade
			await authenticatedPage.getByRole('combobox', { name: /prioridade/i }).selectOption('Alta')

			// Verificar se filtros funcionam
			await expect(authenticatedPage.locator('[data-testid="product-item"]')).toBeVisible()
		})
	})

	test.describe('🚨 Sistema de Problemas', () => {
		test('✅ Criar problema - formulário e categorização obrigatória', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Clicar no primeiro produto para acessar problemas
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em criar problema
			await authenticatedPage.getByRole('button', { name: 'Criar Problema' }).click()

			// Preencher formulário
			await authenticatedPage.getByLabel('Título').fill('Problema Teste Playwright')
			await authenticatedPage.getByLabel('Descrição').fill('Descrição do problema de teste')

			// Selecionar categoria (obrigatória)
			await authenticatedPage.getByRole('combobox', { name: /categoria/i }).selectOption('Rede externa')

			// Salvar problema
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/problema criado|salvo com sucesso/i)).toBeVisible()

			// Verificar se problema aparece na lista
			await expect(authenticatedPage.getByText('Problema Teste Playwright')).toBeVisible()
		})

		test('✅ Upload de imagens via UploadThing - limite de 3 imagens', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em criar problema
			await authenticatedPage.getByRole('button', { name: 'Criar Problema' }).click()

			// Preencher campos obrigatórios
			await authenticatedPage.getByLabel('Título').fill('Problema com Imagens')
			await authenticatedPage.getByLabel('Descrição').fill('Problema para testar upload')
			await authenticatedPage.getByRole('combobox', { name: /categoria/i }).selectOption('Rede externa')

			// Testar upload de imagem
			const fileInput = authenticatedPage.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/test-image.jpg')

			// Verificar se imagem foi carregada
			await expect(authenticatedPage.locator('[data-testid="image-preview"]')).toBeVisible()

			// Salvar problema
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar sucesso
			await expect(authenticatedPage.getByText(/problema criado|salvo com sucesso/i)).toBeVisible()
		})

		test('✅ Threading - visualização hierárquica de problemas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*\/problems/)

			// Verificar se problemas estão organizados hierarquicamente
			await expect(authenticatedPage.locator('[data-testid="problem-thread"]')).toBeVisible()

			// Clicar em um problema para ver detalhes
			await authenticatedPage.locator('[data-testid="problem-item"]').first().click()

			// Verificar se detalhes do problema aparecem
			await expect(authenticatedPage.locator('[data-testid="problem-details"]')).toBeVisible()
		})
	})

	test.describe('💡 Sistema de Soluções', () => {
		test('✅ Responder problema - criação de solução', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em um problema
			await authenticatedPage.locator('[data-testid="problem-item"]').first().click()

			// Clicar em responder
			await authenticatedPage.getByRole('button', { name: 'Responder' }).click()

			// Preencher solução
			await authenticatedPage.getByLabel('Solução').fill('Solução de teste para o problema')

			// Salvar solução
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/solução criada|salva com sucesso/i)).toBeVisible()

			// Verificar se solução aparece
			await expect(authenticatedPage.getByText('Solução de teste para o problema')).toBeVisible()
		})

		test('✅ Upload de imagens em soluções via UploadThing', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em um problema
			await authenticatedPage.locator('[data-testid="problem-item"]').first().click()

			// Clicar em responder
			await authenticatedPage.getByRole('button', { name: 'Responder' }).click()

			// Preencher solução
			await authenticatedPage.getByLabel('Solução').fill('Solução com imagem')

			// Upload de imagem
			const fileInput = authenticatedPage.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/solution-image.jpg')

			// Verificar preview
			await expect(authenticatedPage.locator('[data-testid="image-preview"]')).toBeVisible()

			// Salvar
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar sucesso
			await expect(authenticatedPage.getByText(/solução criada|salva com sucesso/i)).toBeVisible()
		})

		test('✅ Marcar solução como correta', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar problemas do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar em um problema
			await authenticatedPage.locator('[data-testid="problem-item"]').first().click()

			// Verificar se há soluções
			const solutions = authenticatedPage.locator('[data-testid="solution-item"]')
			if ((await solutions.count()) > 0) {
				// Clicar no botão de marcar como correta
				await authenticatedPage.locator('[data-testid="mark-correct"]').first().click()

				// Verificar se foi marcada como correta
				await expect(authenticatedPage.locator('[data-testid="correct-badge"]')).toBeVisible()
			}
		})
	})

	test.describe('🏷️ Categorias de Problemas', () => {
		test('✅ CRUD de categorias - criar/editar/excluir no offcanvas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/problems')

			// Clicar no botão de configurações de categorias
			await authenticatedPage.getByRole('button', { name: 'Configurações' }).click()

			// Verificar se offcanvas abre
			await expect(authenticatedPage.locator('[data-testid="categories-offcanvas"]')).toBeVisible()

			// Criar nova categoria
			await authenticatedPage.getByRole('button', { name: 'Nova Categoria' }).click()
			await authenticatedPage.getByLabel('Nome').fill('Categoria Teste Playwright')
			await authenticatedPage.getByRole('combobox', { name: /cor/i }).selectOption('red')
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar sucesso
			await expect(authenticatedPage.getByText(/categoria criada|salva com sucesso/i)).toBeVisible()

			// Editar categoria
			await authenticatedPage.locator('[data-testid="edit-category"]').last().click()
			await authenticatedPage.getByLabel('Nome').clear()
			await authenticatedPage.getByLabel('Nome').fill('Categoria Editada')
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar sucesso
			await expect(authenticatedPage.getByText(/categoria atualizada|alterada com sucesso/i)).toBeVisible()

			// Excluir categoria
			await authenticatedPage.locator('[data-testid="delete-category"]').last().click()
			await authenticatedPage.getByRole('button', { name: 'Excluir' }).click()

			// Verificar sucesso
			await expect(authenticatedPage.getByText(/categoria excluída|removida com sucesso/i)).toBeVisible()
		})

		test('✅ Validação de nomes únicos - não permite duplicatas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/problems')

			// Abrir configurações de categorias
			await authenticatedPage.getByRole('button', { name: 'Configurações' }).click()

			// Tentar criar categoria com nome existente
			await authenticatedPage.getByRole('button', { name: 'Nova Categoria' }).click()
			await authenticatedPage.getByLabel('Nome').fill('Rede externa') // Nome já existe
			await authenticatedPage.getByRole('combobox', { name: /cor/i }).selectOption('red')
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Deve mostrar erro de nome duplicado
			await expect(authenticatedPage.getByText(/nome já existe|duplicado/i)).toBeVisible()
		})

		test('✅ 6 categorias padrão presentes', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/problems')

			// Abrir configurações de categorias
			await authenticatedPage.getByRole('button', { name: 'Configurações' }).click()

			// Verificar se todas as categorias padrão estão presentes
			await expect(authenticatedPage.getByText('Rede externa')).toBeVisible()
			await expect(authenticatedPage.getByText('Rede interna')).toBeVisible()
			await expect(authenticatedPage.getByText('Servidor indisponível')).toBeVisible()
			await expect(authenticatedPage.getByText('Falha humana')).toBeVisible()
			await expect(authenticatedPage.getByText('Erro no software')).toBeVisible()
			await expect(authenticatedPage.getByText('Outros')).toBeVisible()
		})
	})

	test.describe('🔗 Dependências Hierárquicas (MenuBuilder)', () => {
		test('✅ Drag & drop - funciona corretamente', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Clicar no primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de dependências
			await authenticatedPage.getByRole('tab', { name: /dependências/i }).click()

			// Verificar se MenuBuilder está visível
			await expect(authenticatedPage.locator('[data-testid="menu-builder"]')).toBeVisible()

			// Testar drag & drop (se houver itens)
			const items = authenticatedPage.locator('[data-testid="menu-item"]')
			if ((await items.count()) > 1) {
				const firstItem = items.first()
				const secondItem = items.nth(1)

				// Arrastar primeiro item para depois do segundo
				await firstItem.dragTo(secondItem)

				// Verificar se ordem mudou
				const firstItemText = await firstItem.textContent()
				if (firstItemText) {
					await expect(authenticatedPage.locator('[data-testid="menu-item"]').first()).not.toHaveText(firstItemText)
				}
			}
		})

		test('✅ Hierarquia - mantém estrutura pai-filho', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar dependências do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.getByRole('tab', { name: /dependências/i }).click()

			// Verificar se estrutura hierárquica está visível
			await expect(authenticatedPage.locator('[data-testid="menu-hierarchy"]')).toBeVisible()

			// Verificar se há itens aninhados
			const nestedItems = authenticatedPage.locator('[data-testid="nested-item"]')
			if ((await nestedItems.count()) > 0) {
				await expect(nestedItems.first()).toBeVisible()
			}
		})

		test('✅ Ícones Lucide - renderizam corretamente', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar dependências do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.getByRole('tab', { name: /dependências/i }).click()

			// Verificar se ícones estão visíveis
			const icons = authenticatedPage.locator('[data-testid="menu-icon"]')
			if ((await icons.count()) > 0) {
				await expect(icons.first()).toBeVisible()

				// Verificar se ícone tem classe Lucide
				const iconClass = await icons.first().getAttribute('class')
				expect(iconClass).toContain('lucide-')
			}
		})
	})

	test.describe('📚 Manual do Produto', () => {
		test('✅ Editor Markdown - funciona com preview', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar manual do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.getByRole('tab', { name: /manual/i }).click()

			// Verificar se editor está visível
			await expect(authenticatedPage.locator('[data-testid="markdown-editor"]')).toBeVisible()

			// Verificar se preview está visível
			await expect(authenticatedPage.locator('[data-testid="markdown-preview"]')).toBeVisible()

			// Digitar texto no editor
			await authenticatedPage.locator('[data-testid="markdown-editor"] textarea').fill('# Título Teste\n\nConteúdo de teste')

			// Verificar se preview atualiza
			await expect(authenticatedPage.getByText('Título Teste')).toBeVisible()
		})

		test('✅ Salvamento - persiste alterações', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar manual do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.getByRole('tab', { name: /manual/i }).click()

			// Editar conteúdo
			await authenticatedPage.locator('[data-testid="markdown-editor"] textarea').fill('# Conteúdo Salvo\n\nEste conteúdo deve ser salvo')

			// Salvar
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar toast de sucesso
			await expect(authenticatedPage.getByText(/manual salvo|alterado com sucesso/i)).toBeVisible()

			// Recarregar página
			await authenticatedPage.reload()

			// Verificar se conteúdo foi persistido
			await expect(authenticatedPage.getByText('Conteúdo Salvo')).toBeVisible()
		})

		test('✅ Nomes únicos - capítulos e seções não podem ter nomes duplicados', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar manual do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.getByRole('tab', { name: /manual/i }).click()

			// Tentar criar seção com nome duplicado
			await authenticatedPage.getByRole('button', { name: 'Nova Seção' }).click()
			await authenticatedPage.getByLabel('Nome').fill('Seção Existente') // Nome que já existe
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Deve mostrar erro de nome duplicado
			await expect(authenticatedPage.getByText(/nome já existe|duplicado/i)).toBeVisible()
		})
	})

	test.describe('👥 Associação Produto-Contato', () => {
		test('✅ Seleção múltipla - adicionar múltiplos contatos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de contatos
			await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

			// Clicar em adicionar contatos
			await authenticatedPage.getByRole('button', { name: 'Adicionar Contatos' }).click()

			// Verificar se seletor abre
			await expect(authenticatedPage.locator('[data-testid="contact-selector"]')).toBeVisible()

			// Selecionar múltiplos contatos
			await authenticatedPage.locator('[data-testid="contact-checkbox"]').nth(0).check()
			await authenticatedPage.locator('[data-testid="contact-checkbox"]').nth(1).check()

			// Confirmar seleção
			await authenticatedPage.getByRole('button', { name: 'Confirmar' }).click()

			// Verificar se contatos foram adicionados
			await expect(authenticatedPage.locator('[data-testid="contact-item"]')).toHaveCount(2)
		})

		test('✅ Remoção - desassociar contatos', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

			// Se houver contatos associados, remover um
			const contacts = authenticatedPage.locator('[data-testid="contact-item"]')
			if ((await contacts.count()) > 0) {
				// Clicar no botão remover do primeiro contato
				await authenticatedPage.locator('[data-testid="remove-contact"]').first().click()

				// Verificar se contato foi removido
				await expect(authenticatedPage.locator('[data-testid="contact-item"]')).toHaveCount((await contacts.count()) - 1)
			}
		})

		test('✅ Persistência - associações mantidas após edição', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Acessar primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

			// Contar contatos associados
			const initialCount = await authenticatedPage.locator('[data-testid="contact-item"]').count()

			// Editar produto (sem alterar contatos)
			await authenticatedPage.getByRole('tab', { name: /geral/i }).click()
			await authenticatedPage.getByRole('button', { name: 'Editar' }).click()
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Voltar para contatos
			await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

			// Verificar se contagem permanece igual
			await expect(authenticatedPage.locator('[data-testid="contact-item"]')).toHaveCount(initialCount)
		})
	})
})
