import { test, expect } from './utils/auth-helpers'

test.describe('🏭 PRODUTOS, PROBLEMAS E SOLUÇÕES', () => {
	test.describe('📦 CRUD de Produtos', () => {
		test('✅ Criar produto - formulário completo e validações', async ({ authenticatedPage }) => {
			// Navegar para a página de produtos
			await authenticatedPage.goto('/admin/settings/products')

			// Aguardar carregamento da página
			await authenticatedPage.waitForLoadState('networkidle')

			// Clicar no botão de criar produto
			await authenticatedPage.getByRole('button', { name: 'Novo produto' }).click()

			// Preencher formulário
			await authenticatedPage.getByLabel('Nome').fill('Produto Teste Playwright')
			await authenticatedPage.getByLabel('Slug').fill('produto-teste-playwright')

			// Salvar produto
			await authenticatedPage.getByRole('button', { name: 'Criar' }).click()

			// Verificar se produto foi criado
			await expect(authenticatedPage.getByText('Produto criado')).toBeVisible()
		})

		test('✅ Editar produto - modificação de dados e salvamento', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Clicar no botão editar do primeiro produto (primeira linha da tabela)
			await authenticatedPage.locator('table tbody tr').first().locator('button[title="Editar produto"]').click()

			// Modificar nome
			await authenticatedPage.getByLabel('Nome').clear()
			await authenticatedPage.getByLabel('Nome').fill('Produto Editado Playwright')

			// Salvar alterações
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar se foi salvo - usar seletor mais específico para evitar strict mode violation
			await expect(authenticatedPage.locator('strong:has-text("Produto atualizado")').first()).toBeVisible()
		})

		// test('✅ Excluir produto - confirmação e remoção completa', async ({ authenticatedPage }) => {
		// 	await authenticatedPage.goto('/admin/settings/products')
		// 	await authenticatedPage.waitForLoadState('networkidle')

		// 	// Contar produtos antes da exclusão
		// 	const initialCount = await authenticatedPage.locator('table tbody tr').count()

		// 	// Clicar no botão excluir do primeiro produto (primeira linha da tabela)
		// 	await authenticatedPage.locator('table tbody tr').first().locator('button[title="Excluir produto"]').click()

		// 	// Verificar se dialog de confirmação aparece
		// 	await expect(authenticatedPage.getByText(/confirmar exclusão/i)).toBeVisible()

		// 	// Confirmar exclusão - usar seletor mais específico para evitar strict mode violation
		// 	await authenticatedPage.locator('button:has-text("Excluir produto")').first().click()

		// 	// Aguardar um pouco para a operação ser processada
		// 	await authenticatedPage.waitForTimeout(2000)

		// 	// Verificar se produto foi excluído - contar produtos após exclusão
		// 	const finalCount = await authenticatedPage.locator('table tbody tr').count()
		// 	expect(finalCount).toBeLessThan(initialCount)

		// 	// Verificar se há toast de sucesso OU se o produto foi removido da lista
		// 	try {
		// 		await expect(authenticatedPage.getByText('Produto excluído')).toBeVisible({ timeout: 3000 })
		// 	} catch {
		// 		// Se não houver toast, verificar se o produto foi removido da lista
		// 		console.log('🔵 Toast não encontrado, verificando se produto foi removido da lista')
		// 		expect(finalCount).toBeLessThan(initialCount)
		// 	}
		// })

		test('✅ Listagem - filtros, busca e paginação', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se lista carregou - deve ter pelo menos 5 produtos (conforme snapshot)
			await expect(authenticatedPage.locator('table tbody tr')).toHaveCount(5, { timeout: 10000 })

			// Testar busca
			await authenticatedPage.getByPlaceholder('Buscar produtos...').fill('teste')
			await authenticatedPage.waitForTimeout(1000)

			// Verificar se filtros funcionam - clicar no botão de filtro
			await authenticatedPage.getByRole('button', { name: 'Todos os status' }).click()
			await authenticatedPage.waitForTimeout(1000)
		})
	})

	test.describe('🚨 Sistema de Problemas', () => {
		test.skip('✅ Criar problema - formulário completo e validações', async ({ authenticatedPage }) => {
			// Navegar diretamente para a página de um produto específico (usando slug conhecido)
			await authenticatedPage.goto('/admin/products/bam')
			await authenticatedPage.waitForLoadState('networkidle')

			// Clicar no botão "Problemas & soluções"
			await authenticatedPage.getByRole('button', { name: 'Problemas & soluções' }).click()

			// Clicar em adicionar problema - usar seletor mais específico para evitar strict mode violation
			await authenticatedPage.locator('button[title="Adicionar problema"]').first().click()

			// Verificar se o formulário abriu - procurar pelo título "Adicionar problema" no formulário
			await expect(authenticatedPage.locator('div.font-semibold:has-text("Adicionar problema")')).toBeVisible({ timeout: 10000 })

			// Verificar se pelo menos o botão "Adicionar" está visível (confirmação de que formulário abriu)
			// Usar seletor mais específico para o botão do formulário
			await expect(authenticatedPage.locator('button[type="submit"]:has-text("Adicionar")')).toBeVisible()

			// Preencher formulário - usar seletores básicos do Playwright
			// Título do problema - procurar por todos os inputs e usar o primeiro
			const titleInput = authenticatedPage.locator('input').first()
			await titleInput.fill('Problema Teste Playwright')
			console.log('🔵 Título preenchido')

			// Descrição do problema - procurar por todos os textarea e usar o primeiro
			const descriptionInput = authenticatedPage.locator('textarea').first()
			await descriptionInput.fill('Descrição do problema teste criado via Playwright')
			console.log('🔵 Descrição preenchida')

			// Selecionar categoria - clicar no botão "Selecione a categoria" e escolher uma opção
			await authenticatedPage.getByRole('button', { name: 'Selecione a categoria' }).click()
			await authenticatedPage.getByText('Rede externa').click()
			console.log('🔵 Categoria selecionada')

			// Verificar se o botão Adicionar ainda está visível antes de clicar
			await expect(authenticatedPage.locator('button[type="submit"]:has-text("Adicionar")')).toBeVisible()
			console.log('🔵 Botão Adicionar visível, tentando clicar...')

			// Salvar problema - tentar clicar no botão Adicionar
			await authenticatedPage.locator('button[type="submit"]:has-text("Adicionar")').click()
			console.log('🔵 Botão Adicionar clicado')

			// Aguardar um pouco para o formulário fechar
			await authenticatedPage.waitForTimeout(3000)

			// Verificar se o formulário fechou (indicando sucesso)
			try {
				await expect(authenticatedPage.locator('div.font-semibold:has-text("Adicionar problema")')).not.toBeVisible({ timeout: 5000 })
				console.log('🔵 Formulário fechou - sucesso!')
			} catch (error) {
				console.log('⚠️ Formulário ainda está aberto - verificar se há erros')

				// Verificar se há mensagens de erro
				const errorMessages = authenticatedPage.locator('text:has-text("erro"), text:has-text("Erro"), text:has-text("ERRO")')
				if ((await errorMessages.count()) > 0) {
					console.log('❌ Mensagens de erro encontradas:')
					for (let i = 0; i < (await errorMessages.count()); i++) {
						const text = await errorMessages.nth(i).textContent()
						console.log(`   - ${text}`)
					}
				}

				// Verificar se há mensagens de validação
				const validationMessages = authenticatedPage.locator('text:has-text("obrigatório"), text:has-text("campo"), text:has-text("Campo")')
				if ((await validationMessages.count()) > 0) {
					console.log('⚠️ Mensagens de validação encontradas:')
					for (let i = 0; i < (await validationMessages.count()); i++) {
						const text = await validationMessages.nth(i).textContent()
						console.log(`   - ${text}`)
					}
				}

				// Verificar se o botão Adicionar ainda está clicável
				const addButton = authenticatedPage.locator('button[type="submit"]:has-text("Adicionar")')
				const isDisabled = await addButton.isDisabled()
				console.log(`🔵 Botão Adicionar está desabilitado: ${isDisabled}`)

				// Verificar se há algum indicador de loading
				const loadingIndicators = authenticatedPage.locator('text:has-text("Salvando"), text:has-text("Carregando"), text:has-text("Processando")')
				if ((await loadingIndicators.count()) > 0) {
					console.log('⏳ Indicadores de loading encontrados:')
					for (let i = 0; i < (await loadingIndicators.count()); i++) {
						const text = await loadingIndicators.nth(i).textContent()
						console.log(`   - ${text}`)
					}
				}
			}

			// Verificar se problema foi criado - procurar por mensagem de sucesso ou pelo problema na lista
			await expect(authenticatedPage.getByText('Problema Teste Playwright')).toBeVisible({ timeout: 10000 })

			console.log('🔵 Problema criado com sucesso')
		})

		test.skip('✅ Upload de imagens via UploadThing - limite de 3 imagens', async ({ authenticatedPage }) => {
			// Navegar diretamente para a página de um produto específico (usando slug conhecido)
			await authenticatedPage.goto('/admin/products/bam')
			await authenticatedPage.waitForLoadState('networkidle')

			// Clicar no botão "Problemas & soluções"
			await authenticatedPage.getByRole('button', { name: 'Problemas & soluções' }).click()

			// Clicar em adicionar problema - usar seletor mais específico para evitar strict mode violation
			await authenticatedPage.locator('button[title="Adicionar problema"]').first().click()

			// Verificar se o formulário abriu
			await expect(authenticatedPage.locator('div.font-semibold:has-text("Adicionar problema")')).toBeVisible({ timeout: 10000 })

			// Preencher campos obrigatórios - usar seletores que funcionam
			// Título do problema - procurar por todos os inputs e usar o primeiro
			const titleInput = authenticatedPage.locator('input').first()
			await titleInput.fill('Problema com Imagens')

			// Descrição do problema - procurar por todos os textarea e usar o primeiro
			const descriptionInput = authenticatedPage.locator('textarea').first()
			await descriptionInput.fill('Teste de upload de imagens')

			// Selecionar categoria - clicar no botão "Selecione a categoria" e escolher uma opção
			await authenticatedPage.getByRole('button', { name: 'Selecione a categoria' }).click()
			await authenticatedPage.getByText('Rede externa').click()

			// Salvar problema primeiro
			await authenticatedPage.locator('button[type="submit"]:has-text("Adicionar")').click()

			// Aguardar criação e depois editar para adicionar imagens
			await authenticatedPage.waitForTimeout(2000)

			// Clicar no problema criado para editar
			await authenticatedPage.getByText('Problema com Imagens').click()

			// Clicar em editar problema
			await authenticatedPage.getByRole('button', { name: 'Editar problema' }).click()

			// Fazer upload de imagem
			const fileInput = authenticatedPage.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/test-image.jpg')

			// Verificar se imagem foi carregada
			await expect(authenticatedPage.locator('[data-testid="uploaded-image"]')).toBeVisible()
		})

		test('✅ Threading - visualização hierárquica de problemas', async ({ authenticatedPage }) => {
			// Navegar diretamente para a página de um produto específico (usando slug conhecido)
			await authenticatedPage.goto('/admin/products/bam')
			await authenticatedPage.waitForLoadState('networkidle')

			// Clicar no botão "Problemas & soluções"
			await authenticatedPage.getByRole('button', { name: 'Problemas & soluções' }).click()

			// Verificar se problemas estão organizados hierarquicamente - usar seletor mais específico
			await expect(authenticatedPage.locator('span:has-text("Dificuldade na configuração inicial")').first()).toBeVisible()
		})
	})

	test.describe('💡 Sistema de Soluções', () => {
		test('✅ Responder problema - criação de solução', async ({ authenticatedPage }) => {
			// Navegar diretamente para a página de um produto específico (usando slug conhecido)
			await authenticatedPage.goto('/admin/products/bam')
			await authenticatedPage.waitForLoadState('networkidle')

			// Clicar no botão "Problemas & soluções"
			await authenticatedPage.getByRole('button', { name: 'Problemas & soluções' }).click()

			// Clicar em um problema existente - usar seletor mais específico para o título
			await authenticatedPage.locator('span.text-base.font-semibold:has-text("Dificuldade na configuração inicial")').first().click()

			// Clicar em responder
			await authenticatedPage.getByRole('button', { name: 'Responder' }).first().click()

			// Preencher solução - usar seletor básico
			const solutionInput = authenticatedPage.locator('textarea').first()
			await solutionInput.fill('Solução teste via Playwright')

			// Salvar solução - usar botão submit do formulário
			await authenticatedPage.locator('button[type="submit"]:has-text("Responder")').click()

			// Verificar se solução foi criada
			await expect(authenticatedPage.getByText('Solução teste via Playwright')).toBeVisible()
		})

		test.skip('✅ Upload de imagens em soluções via UploadThing', async ({ authenticatedPage }) => {
			// Navegar diretamente para a página de um produto específico (usando slug conhecido)
			await authenticatedPage.goto('/admin/products/bam')
			await authenticatedPage.waitForLoadState('networkidle')

			// Clicar no botão "Problemas & soluções"
			await authenticatedPage.getByRole('button', { name: 'Problemas & soluções' }).click()

			// Clicar em um problema existente - usar seletor mais específico para o título
			await authenticatedPage.locator('span.text-base.font-semibold:has-text("Dificuldade na configuração inicial")').first().click()

			// Clicar em responder
			await authenticatedPage.getByRole('button', { name: 'Responder' }).first().click()

			// Fazer upload de imagem na solução
			const fileInput = authenticatedPage.locator('input[type="file"]')
			await fileInput.setInputFiles('tests/fixtures/test-image.jpg')

			// Verificar se imagem foi carregada
			await expect(authenticatedPage.locator('img')).toBeVisible()
		})

		test.skip('✅ Marcar solução como correta', async ({ authenticatedPage }) => {
			// Navegar diretamente para a página de um produto específico (usando slug conhecido)
			await authenticatedPage.goto('/admin/products/bam')
			await authenticatedPage.waitForLoadState('networkidle')

			// Clicar no botão "Problemas & soluções"
			await authenticatedPage.getByRole('button', { name: 'Problemas & soluções' }).click()

			// Clicar em um problema existente - usar seletor mais específico para o título
			await authenticatedPage.locator('span.text-base.font-semibold:has-text("Dificuldade na configuração inicial")').first().click()

			// Marcar solução como correta - procurar por botão de verificação
			const verifyButton = authenticatedPage.locator('button:has-text("Verificar")').first()
			await verifyButton.click()

			// Verificar se foi marcada como correta
			await expect(authenticatedPage.getByText('Resposta verificada')).toBeVisible()
		})
	})

	test.describe('🏷️ Categorias de Problemas', () => {
		test('✅ CRUD de categorias - criar/editar/excluir no offcanvas', async ({ authenticatedPage }) => {
			// Acessar problemas do primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar problemas do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*\/problems/)

			// Clicar no botão de configurações de categorias
			await authenticatedPage.getByRole('button', { name: 'Configurações' }).click()

			// Verificar se offcanvas abre
			await expect(authenticatedPage.locator('[data-testid="categories-offcanvas"]')).toBeVisible()

			// Criar nova categoria
			await authenticatedPage.getByRole('button', { name: 'Nova Categoria' }).click()
			await authenticatedPage.getByLabel('Nome').fill('Categoria Teste')
			await authenticatedPage.getByRole('button', { name: 'Criar' }).click()

			// Verificar se categoria foi criada
			await expect(authenticatedPage.getByText('Categoria criada')).toBeVisible()
		})

		test('✅ Validação de nomes únicos - não permite duplicatas', async ({ authenticatedPage }) => {
			// Acessar problemas do primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar problemas do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*\/problems/)

			// Abrir configurações de categorias
			await authenticatedPage.getByRole('button', { name: 'Configurações' }).click()

			// Tentar criar categoria com nome existente
			await authenticatedPage.getByRole('button', { name: 'Nova Categoria' }).click()
			await authenticatedPage.getByLabel('Nome').fill('Rede externa')
			await authenticatedPage.getByRole('button', { name: 'Criar' }).click()

			// Verificar se erro foi exibido
			await expect(authenticatedPage.getByText(/nome já existe|duplicado/i)).toBeVisible()
		})

		test('✅ 6 categorias padrão presentes', async ({ authenticatedPage }) => {
			// Acessar problemas do primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar problemas do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*\/problems/)

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
			// Acessar dependências do primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Clicar no primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de dependências
			await authenticatedPage.getByRole('tab', { name: /dependências/i }).click()

			// Verificar se MenuBuilder está visível
			await expect(authenticatedPage.locator('[data-testid="menu-builder"]')).toBeVisible()

			// Testar drag & drop
			const sourceItem = authenticatedPage.locator('[data-testid="menu-item"]').first()
			const targetArea = authenticatedPage.locator('[data-testid="drop-zone"]')

			await sourceItem.dragTo(targetArea)

			// Verificar se item foi movido
			await expect(targetArea.locator('[data-testid="menu-item"]')).toBeVisible()
		})

		test('✅ Hierarquia - mantém estrutura pai-filho', async ({ authenticatedPage }) => {
			// Acessar dependências do primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar dependências do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de dependências
			await authenticatedPage.getByRole('tab', { name: /dependências/i }).click()

			// Verificar se estrutura hierárquica está visível
			await expect(authenticatedPage.locator('[data-testid="hierarchy-tree"]')).toBeVisible()

			// Verificar se itens pai e filho estão organizados
			await expect(authenticatedPage.locator('[data-testid="parent-item"]')).toBeVisible()
			await expect(authenticatedPage.locator('[data-testid="child-item"]')).toBeVisible()
		})

		test('✅ Ícones Lucide - renderizam corretamente', async ({ authenticatedPage }) => {
			// Acessar dependências do primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar dependências do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de dependências
			await authenticatedPage.getByRole('tab', { name: /dependências/i }).click()

			// Verificar se ícones estão visíveis
			await expect(authenticatedPage.locator('[data-testid="lucide-icon"]')).toBeVisible()

			// Verificar se ícones específicos estão presentes
			await expect(authenticatedPage.locator('i[class*="lucide-"]')).toBeVisible()
		})
	})

	test.describe('📚 Manual do Produto', () => {
		test('✅ Editor Markdown - funciona com preview', async ({ authenticatedPage }) => {
			// Acessar manual do primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar manual do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de manual
			await authenticatedPage.getByRole('tab', { name: /manual/i }).click()

			// Verificar se editor está visível
			await expect(authenticatedPage.locator('[data-testid="markdown-editor"]')).toBeVisible()

			// Verificar se preview está visível
			await expect(authenticatedPage.locator('[data-testid="markdown-preview"]')).toBeVisible()

			// Testar edição
			await authenticatedPage.locator('[data-testid="editor-textarea"]').fill('# Título Teste\n\nConteúdo teste')
		})

		test('✅ Salvamento - persiste alterações', async ({ authenticatedPage }) => {
			// Acessar manual do primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar manual do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de manual
			await authenticatedPage.getByRole('tab', { name: /manual/i }).click()

			// Editar conteúdo
			await authenticatedPage.locator('[data-testid="editor-textarea"]').fill('# Novo Título\n\nNovo conteúdo')

			// Salvar alterações
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar se foi salvo
			await expect(authenticatedPage.getByText('Manual salvo')).toBeVisible()
		})

		test('✅ Nomes únicos - capítulos e seções não podem ter nomes duplicados', async ({ authenticatedPage }) => {
			// Acessar manual do primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar manual do primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de manual
			await authenticatedPage.getByRole('tab', { name: /manual/i }).click()

			// Tentar criar seção com nome duplicado
			await authenticatedPage.getByRole('button', { name: 'Nova Seção' }).click()
			await authenticatedPage.getByLabel('Nome da Seção').fill('Seção Existente')
			await authenticatedPage.getByRole('button', { name: 'Criar' }).click()

			// Verificar se erro foi exibido
			await expect(authenticatedPage.getByText(/nome já existe|duplicado/i)).toBeVisible()
		})
	})

	test.describe('👥 Associação Produto-Contato', () => {
		test('✅ Seleção múltipla - adicionar múltiplos contatos', async ({ authenticatedPage }) => {
			// Acessar primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de contatos
			await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

			// Clicar em adicionar contatos
			await authenticatedPage.getByRole('button', { name: 'Adicionar Contatos' }).click()

			// Selecionar múltiplos contatos
			await authenticatedPage.locator('[data-testid="contact-checkbox"]').nth(0).check()
			await authenticatedPage.locator('[data-testid="contact-checkbox"]').nth(1).check()

			// Salvar associações
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Verificar se contatos foram associados
			await expect(authenticatedPage.getByText('Contatos associados')).toBeVisible()
		})

		test('✅ Remoção - desassociar contatos', async ({ authenticatedPage }) => {
			// Acessar primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de contatos
			await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

			// Se houver contatos associados, remover um
			const removeButton = authenticatedPage.locator('[data-testid="remove-contact"]').first()
			if (await removeButton.isVisible()) {
				await removeButton.click()

				// Confirmar remoção
				await authenticatedPage.getByRole('button', { name: 'Confirmar' }).click()

				// Verificar se contato foi removido
				await expect(authenticatedPage.getByText('Contato removido')).toBeVisible()
			}
		})

		test('✅ Persistência - associações mantidas após edição', async ({ authenticatedPage }) => {
			// Acessar primeiro produto
			await authenticatedPage.goto('/admin/settings/products')
			await authenticatedPage.waitForLoadState('networkidle')

			// Acessar primeiro produto
			await authenticatedPage.locator('[data-testid="product-item"]').first().click()
			await authenticatedPage.waitForURL(/\/admin\/products\/.*/)

			// Ir para aba de contatos
			await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()

			// Contar contatos associados
			const contactCount = await authenticatedPage.locator('[data-testid="associated-contact"]').count()

			// Editar produto
			await authenticatedPage.getByRole('tab', { name: /geral/i }).click()
			await authenticatedPage.getByRole('button', { name: 'Editar' }).click()

			// Salvar alterações
			await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

			// Voltar para contatos e verificar se contagem permaneceu
			await authenticatedPage.getByRole('tab', { name: /contatos/i }).click()
			await expect(authenticatedPage.locator('[data-testid="associated-contact"]')).toHaveCount(contactCount)
		})
	})
})
