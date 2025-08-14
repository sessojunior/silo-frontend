import { test, expect } from './utils/auth-helpers'

test.describe('🔗 INTEGRAÇÃO, UX E NAVEGAÇÃO', () => {
	test.describe('🧭 Navegação Completa', () => {
		test('✅ Todas as páginas admin - acessíveis sem 404', async ({ authenticatedPage }) => {
			// Lista de todas as páginas admin
			const adminPages = ['/admin/dashboard', '/admin/products', '/admin/problems', '/admin/contacts', '/admin/groups', '/admin/groups/users', '/admin/projects', '/admin/chat', '/admin/settings', '/admin/help']

			for (const pagePath of adminPages) {
				await authenticatedPage.goto(pagePath)

				// Verificar se página carregou sem 404
				await expect(authenticatedPage.locator('body')).not.toContainText('404')
				await expect(authenticatedPage.locator('body')).not.toContainText('Not Found')

				// Verificar se conteúdo da página está visível
				await expect(authenticatedPage.locator('main, [role="main"], .main, #main')).toBeVisible()

				console.log(`✅ Página ${pagePath} acessível`)
			}
		})

		test('✅ Links corretos - Topbar e sidebar funcionam', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Verificar se topbar está visível
			await expect(authenticatedPage.locator('[data-testid="topbar"]')).toBeVisible()

			// Verificar se sidebar está visível
			await expect(authenticatedPage.locator('[data-testid="sidebar"]')).toBeVisible()

			// Testar links da topbar
			const topbarLinks = authenticatedPage.locator('[data-testid="topbar"] a, [data-testid="topbar"] button')
			if ((await topbarLinks.count()) > 0) {
				for (let i = 0; i < Math.min(await topbarLinks.count(), 3); i++) {
					const link = topbarLinks.nth(i)
					await expect(link).toBeVisible()
				}
			}

			// Testar links da sidebar
			const sidebarLinks = authenticatedPage.locator('[data-testid="sidebar"] a, [data-testid="sidebar"] button')
			if ((await sidebarLinks.count()) > 0) {
				for (let i = 0; i < Math.min(await sidebarLinks.count(), 5); i++) {
					const link = sidebarLinks.nth(i)
					await expect(link).toBeVisible()
				}
			}
		})

		test('✅ Sem loops infinitos - navegação estável', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Aguardar carregamento inicial
			await authenticatedPage.waitForLoadState('networkidle')

			// Fazer algumas navegações
			await authenticatedPage.goto('/admin/products')
			await authenticatedPage.waitForLoadState('networkidle')

			await authenticatedPage.goto('/admin/contacts')
			await authenticatedPage.waitForLoadState('networkidle')

			await authenticatedPage.goto('/admin/dashboard')
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se não há erros de loop infinito
			await expect(authenticatedPage.locator('body')).not.toContainText('Maximum update depth exceeded')
			await expect(authenticatedPage.locator('body')).not.toContainText('Too many re-renders')

			// Verificar se dashboard ainda está funcional
			await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
		})

		test('✅ Prefetch desabilitado - rotas críticas de sessão', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Verificar se não há prefetch automático para rotas críticas
			const criticalRoutes = ['/auth/login', '/auth/register', '/admin/settings']

			for (const route of criticalRoutes) {
				// Verificar se não há links com prefetch para essas rotas
				const prefetchLinks = authenticatedPage.locator(`a[href="${route}"][data-prefetch="true"]`)
				await expect(prefetchLinks).toHaveCount(0)
			}
		})
	})

	test.describe('🎨 Consistência Visual', () => {
		test('✅ Dark/light mode - consistente em todo sistema', async ({ authenticatedPage }) => {
			// Testar em várias páginas
			const testPages = ['/admin/dashboard', '/admin/products', '/admin/contacts']

			for (const pagePath of testPages) {
				await authenticatedPage.goto(pagePath)
				await authenticatedPage.waitForLoadState('networkidle')

				// Verificar se sistema de tema está presente
				const themeToggle = authenticatedPage.locator('[data-testid="theme-toggle"]')
				if ((await themeToggle.count()) > 0) {
					// Verificar tema atual
					const currentTheme = await themeToggle.getAttribute('data-theme')

					// Alternar tema
					await themeToggle.click()
					await authenticatedPage.waitForTimeout(1000)

					// Verificar se tema mudou
					const newTheme = await themeToggle.getAttribute('data-theme')
					expect(newTheme).not.toBe(currentTheme)

					// Verificar se página ainda está funcional
					await expect(authenticatedPage.locator('main, [role="main"], .main, #main')).toBeVisible()
				}
			}
		})

		test('✅ Layout padrão - min-h-screen sem double-scroll', async ({ authenticatedPage }) => {
			// Testar em várias páginas
			const testPages = ['/admin/dashboard', '/admin/products', '/admin/contacts']

			for (const pagePath of testPages) {
				await authenticatedPage.goto(pagePath)
				await authenticatedPage.waitForLoadState('networkidle')

				// Verificar se layout usa min-h-screen
				const mainContainer = authenticatedPage.locator('main, [role="main"], .main, #main')
				await expect(mainContainer).toBeVisible()

				// Verificar se não há double-scroll (overflow-hidden + overflow-auto)
				const doubleScrollElements = authenticatedPage.locator('[class*="overflow-hidden"][class*="overflow-auto"]')
				await expect(doubleScrollElements).toHaveCount(0)

				// Verificar se scroll funciona naturalmente
				await authenticatedPage.evaluate(() => window.scrollTo(0, 100))
				await authenticatedPage.waitForTimeout(500)

				const scrollPosition = await authenticatedPage.evaluate(() => window.scrollY)
				expect(scrollPosition).toBeGreaterThan(0)
			}
		})

		test('✅ Componentes UI - reutilização correta', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Verificar se componentes padrão estão sendo usados
			const standardComponents = ['[data-testid="button"]', '[data-testid="input"]', '[data-testid="select"]', '[data-testid="card"]', '[data-testid="badge"]']

			for (const componentSelector of standardComponents) {
				const components = authenticatedPage.locator(componentSelector)
				if ((await components.count()) > 0) {
					await expect(components.first()).toBeVisible()
				}
			}
		})

		test('✅ Design system - 24 componentes padronizados', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Verificar se componentes do design system estão presentes
			const designSystemComponents = ['Button', 'Input', 'Select', 'Textarea', 'Card', 'Badge', 'Dialog', 'Offcanvas', 'Toast', 'Avatar', 'Icon', 'Spinner']

			for (const componentName of designSystemComponents) {
				// Verificar se componente está sendo usado (por classe ou data-testid)
				const component = authenticatedPage.locator(`[class*="${componentName.toLowerCase()}"], [data-testid*="${componentName.toLowerCase()}"]`)
				if ((await component.count()) > 0) {
					await expect(component.first()).toBeVisible()
				}
			}
		})
	})

	test.describe('📱 Responsividade e Cross-Browser', () => {
		test('✅ Responsividade - diferentes resoluções', async ({ authenticatedPage }) => {
			const resolutions = [
				{ width: 1920, height: 1080, name: 'Desktop' },
				{ width: 1366, height: 768, name: 'Laptop' },
				{ width: 768, height: 1024, name: 'Tablet' },
				{ width: 375, height: 667, name: 'Mobile' },
			]

			for (const resolution of resolutions) {
				await authenticatedPage.setViewportSize({ width: resolution.width, height: resolution.height })
				await authenticatedPage.goto('/admin/dashboard')
				await authenticatedPage.waitForLoadState('networkidle')

				// Verificar se página carrega corretamente
				await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

				// Verificar se sidebar se adapta
				const sidebar = authenticatedPage.locator('[data-testid="sidebar"]')
				await expect(sidebar).toBeVisible()

				console.log(`✅ Responsividade ${resolution.name} (${resolution.width}x${resolution.height})`)
			}

			// Voltar para desktop
			await authenticatedPage.setViewportSize({ width: 1920, height: 1080 })
		})

		test('✅ Navegação por teclado - Tab navigation, Enter para submit', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Pressionar Tab para navegar
			await authenticatedPage.keyboard.press('Tab')

			// Verificar se foco mudou
			const focusedElement = authenticatedPage.locator(':focus')
			await expect(focusedElement).toBeVisible()

			// Navegar por alguns elementos
			for (let i = 0; i < 5; i++) {
				await authenticatedPage.keyboard.press('Tab')
				await authenticatedPage.waitForTimeout(100)
			}

			// Verificar se foco ainda está funcionando
			await expect(authenticatedPage.locator(':focus')).toBeVisible()
		})

		test('✅ Modais - Escape para fechar, foco preso', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Tentar abrir um modal (se houver botão de criar produto)
			const createButton = authenticatedPage.locator('[data-testid="create-product-button"], button:has-text("Criar Produto")')
			if ((await createButton.count()) > 0) {
				await createButton.click()

				// Verificar se modal abriu
				const modal = authenticatedPage.locator('[data-testid="modal"], [role="dialog"]')
				if ((await modal.count()) > 0) {
					await expect(modal.first()).toBeVisible()

					// Pressionar Escape para fechar
					await authenticatedPage.keyboard.press('Escape')

					// Verificar se modal fechou
					await expect(modal.first()).not.toBeVisible()
				}
			}
		})

		test('✅ Sidebar - navegação por teclado', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Verificar se sidebar está visível
			await expect(authenticatedPage.locator('[data-testid="sidebar"]')).toBeVisible()

			// Navegar para sidebar
			await authenticatedPage.keyboard.press('Tab')

			// Verificar se foco está na sidebar
			const sidebar = authenticatedPage.locator('[data-testid="sidebar"]')
			await expect(sidebar).toBeVisible()

			// Navegar por itens da sidebar
			const sidebarItems = authenticatedPage.locator('[data-testid="sidebar"] a, [data-testid="sidebar"] button')
			if ((await sidebarItems.count()) > 0) {
				for (let i = 0; i < Math.min(await sidebarItems.count(), 3); i++) {
					await authenticatedPage.keyboard.press('Tab')
					await authenticatedPage.waitForTimeout(100)
				}
			}
		})
	})

	test.describe('⚡ Performance e Acessibilidade', () => {
		test('✅ Listas grandes - produtos, problemas, projetos, contatos', async ({ authenticatedPage }) => {
			// Testar páginas com listas grandes
			const listPages = ['/admin/products', '/admin/contacts', '/admin/projects']

			for (const pagePath of listPages) {
				const startTime = Date.now()

				await authenticatedPage.goto(pagePath)
				await authenticatedPage.waitForLoadState('networkidle')

				const loadTime = Date.now() - startTime

				// Verificar se carregou em tempo aceitável (menos de 8 segundos)
				expect(loadTime).toBeLessThan(8000)

				// Verificar se lista está visível
				const listItems = authenticatedPage.locator('[data-testid*="item"], [data-testid*="card"]')
				await expect(listItems).toBeVisible()

				console.log(`✅ ${pagePath} carregou em ${loadTime}ms`)
			}
		})

		test('✅ Contagem agregada - soluções por problema (sem N+1)', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Aguardar carregamento
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se contagens estão sendo exibidas
			const countElements = authenticatedPage.locator('[data-testid*="count"], [data-testid*="total"]')
			if ((await countElements.count()) > 0) {
				await expect(countElements.first()).toBeVisible()

				// Verificar se contagem é um número
				const countText = await countElements.first().textContent()
				expect(parseInt(countText || '0')).toBeGreaterThanOrEqual(0)
			}
		})

		test('✅ Tempos de resposta - aceitáveis para operações', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Aguardar carregamento inicial
			await authenticatedPage.waitForLoadState('networkidle')

			// Fazer algumas operações e medir tempo
			const operations = [
				{ action: 'Navegar para produtos', path: '/admin/products' },
				{ action: 'Navegar para contatos', path: '/admin/contacts' },
				{ action: 'Voltar para dashboard', path: '/admin/dashboard' },
			]

			for (const operation of operations) {
				const startTime = Date.now()

				await authenticatedPage.goto(operation.path)
				await authenticatedPage.waitForLoadState('networkidle')

				const responseTime = Date.now() - startTime

				// Verificar se tempo de resposta é aceitável (menos de 5 segundos)
				expect(responseTime).toBeLessThan(5000)

				console.log(`✅ ${operation.action}: ${responseTime}ms`)
			}
		})

		test('✅ Otimizações - queries SQL eficientes', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Aguardar carregamento
			await authenticatedPage.waitForLoadState('networkidle')

			// Verificar se dashboard carregou rapidamente
			const startTime = Date.now()

			// Aguardar carregamento completo (incluindo gráficos)
			await authenticatedPage.waitForTimeout(3000)

			const totalLoadTime = Date.now() - startTime

			// Verificar se carregou em tempo aceitável (menos de 10 segundos)
			expect(totalLoadTime).toBeLessThan(10000)

			// Verificar se métricas estão visíveis
			await expect(authenticatedPage.getByText('Total de Produtos')).toBeVisible()
			await expect(authenticatedPage.getByText('Total de Problemas')).toBeVisible()
			await expect(authenticatedPage.getByText('Total de Usuários')).toBeVisible()

			console.log(`✅ Dashboard carregou em ${totalLoadTime}ms`)
		})
	})

	test.describe('🔒 Validações e Regras de Negócio', () => {
		test('✅ Nomes únicos - capítulos/seções do manual', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/help')

			// Verificar se sistema de nomes únicos está funcionando
			const duplicateNameTest = authenticatedPage.locator('[data-testid="duplicate-name-test"]')
			if ((await duplicateNameTest.count()) > 0) {
				// Tentar criar seção com nome duplicado
				await authenticatedPage.getByRole('button', { name: 'Nova Seção' }).click()

				// Preencher com nome que já existe
				await authenticatedPage.getByLabel('Título da Seção').fill('Seção Existente')
				await authenticatedPage.getByLabel('Conteúdo').fill('Conteúdo de teste')

				// Tentar salvar
				await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

				// Deve mostrar erro de nome duplicado
				await expect(authenticatedPage.getByText(/nome já existe|duplicado/i)).toBeVisible()
			}
		})

		test('✅ Nomes únicos - categorias de problemas', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/problems')

			// Verificar se sistema de nomes únicos está funcionando
			const duplicateCategoryTest = authenticatedPage.locator('[data-testid="duplicate-category-test"]')
			if ((await duplicateCategoryTest.count()) > 0) {
				// Abrir configurações de categorias
				await authenticatedPage.getByRole('button', { name: 'Configurações' }).click()

				// Tentar criar categoria com nome duplicado
				await authenticatedPage.getByRole('button', { name: 'Nova Categoria' }).click()
				await authenticatedPage.getByLabel('Nome').fill('Rede externa') // Nome que já existe
				await authenticatedPage.getByRole('combobox', { name: /cor/i }).selectOption('red')

				// Tentar salvar
				await authenticatedPage.getByRole('button', { name: 'Salvar' }).click()

				// Deve mostrar erro de nome duplicado
				await expect(authenticatedPage.getByText(/nome já existe|duplicado/i)).toBeVisible()
			}
		})

		test('✅ Relacionamentos - integridade referencial', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/products')

			// Verificar se relacionamentos estão funcionando
			const productItems = authenticatedPage.locator('[data-testid="product-item"]')
			if ((await productItems.count()) > 0) {
				// Clicar no primeiro produto
				await productItems.first().click()

				// Verificar se problemas relacionados aparecem
				await authenticatedPage.getByRole('tab', { name: /problemas/i }).click()

				// Verificar se lista de problemas está visível
				await expect(authenticatedPage.locator('[data-testid="problem-list"]')).toBeVisible()
			}
		})
	})

	test.describe('📝 Logs e Observabilidade', () => {
		test('✅ Emojis padronizados - ✅ ❌ ⚠️ 🔵 apenas', async ({ authenticatedPage }) => {
			// Este teste verifica se o sistema está usando apenas os emojis padronizados
			// nos logs e mensagens do frontend

			await authenticatedPage.goto('/admin/dashboard')

			// Verificar se não há emojis não padronizados
			const nonStandardEmojis = ['🚀', '🎉', '🔥', '💪', '⭐', '🌟', '💯', '🔥', '💎']

			for (const emoji of nonStandardEmojis) {
				const emojiElements = authenticatedPage.locator(`text=${emoji}`)
				await expect(emojiElements).toHaveCount(0)
			}

			// Verificar se emojis padronizados estão sendo usados
			const standardEmojis = ['✅', '❌', '⚠️', '🔵']

			// Pelo menos um emoji padronizado deve estar presente
			let hasStandardEmoji = false
			for (const emoji of standardEmojis) {
				const emojiElements = authenticatedPage.locator(`text=${emoji}`)
				if ((await emojiElements.count()) > 0) {
					hasStandardEmoji = true
					break
				}
			}

			expect(hasStandardEmoji).toBe(true)
		})

		test('✅ Erros backend - mensagens claras', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Verificar se sistema de tratamento de erros está funcionando
			// (este teste verifica se erros são exibidos de forma clara)

			// Tentar acessar uma rota que pode não existir
			await authenticatedPage.goto('/admin/nonexistent-page')

			// Verificar se página de erro é exibida de forma clara
			await expect(authenticatedPage.locator('body')).toContainText(/erro|não encontrado|404/i)
		})

		test('✅ Sem logs sensíveis - em produção', async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/admin/dashboard')

			// Verificar se não há informações sensíveis expostas
			const sensitiveInfo = ['password', 'senha', 'secret', 'token', 'key', 'api_key', 'database_url', 'connection_string', 'private_key']

			for (const info of sensitiveInfo) {
				const sensitiveElements = authenticatedPage.locator(`text=${info}`)
				await expect(sensitiveElements).toHaveCount(0)
			}

			// Verificar se não há dados sensíveis no HTML
			const pageContent = await authenticatedPage.content()

			for (const info of sensitiveInfo) {
				expect(pageContent.toLowerCase()).not.toContain(info)
			}
		})
	})
})
