import { test, expect } from '@playwright/test'

test.describe('🔐 AUTENTICAÇÃO', () => {
	test.describe('📝 Registro de Usuário', () => {
		test('✅ Registro com dados válidos', async ({ page }) => {
			await page.goto('/register')

			// Verificar se está na página correta
			await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()

			// Aguardar campos carregarem
			await page.waitForSelector('#name', { state: 'visible' })
			await page.waitForSelector('#email', { state: 'visible' })
			await page.waitForSelector('#password', { state: 'visible' })

			// Gerar email único baseado no timestamp
			const timestamp = Date.now()
			const uniqueEmail = `teste.playwright.${timestamp}@inpe.br`

			// Preencher formulário de registro usando type() para disparar eventos React
			await page.locator('#name').type('Usuário Teste Playwright')
			await page.locator('#email').type(uniqueEmail)
			await page.locator('#password').type('Teste123!')

			// Verificar se os campos foram preenchidos
			await expect(page.locator('#name')).toHaveValue('Usuário Teste Playwright')
			await expect(page.locator('#email')).toHaveValue(uniqueEmail)
			await expect(page.locator('#password')).toHaveValue('Teste123!')

			// Verificar se o botão está habilitado
			await page.waitForSelector('form button[type="submit"]:not([disabled])', { state: 'visible' })

			// Submeter formulário
			await page.getByRole('button', { name: 'Criar conta' }).click()

			// Aguardar um pouco para a requisição ser processada
			await page.waitForTimeout(3000)

			// Verificar se há algum erro ou mensagem
			const pageContent = await page.content()
			console.log('🔵 [TESTE] Conteúdo da página após registro:', pageContent)

			// Verificar redirecionamento para etapa 2 (verificação de email)
			await expect(page.getByText(/verifique seu e-mail|código de verificação/i)).toBeVisible({ timeout: 30000 })
		})
	})

	test.describe('🔑 Login de Usuário', () => {
		test('✅ Login com credenciais válidas', async ({ page }) => {
			await page.goto('/login')

			// Verificar se está na página correta
			await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()

			// Aguardar campos carregarem
			await page.waitForSelector('#email', { state: 'visible' })
			await page.waitForSelector('#password', { state: 'visible' })

			// Preencher credenciais usando type() para disparar eventos React
			await page.locator('#email').type('sessojunior@gmail.com')
			await page.locator('#password').type('#Admin123')

			// Verificar se os campos foram preenchidos
			await expect(page.locator('#email')).toHaveValue('sessojunior@gmail.com')
			await expect(page.locator('#password')).toHaveValue('#Admin123')

			// Aguardar botão estar habilitado
			await page.waitForSelector('form button[type="submit"]:not([disabled])', { state: 'visible' })

			// Fazer login usando seletor específico para o botão de submit
			await page.locator('form button[type="submit"]').click()

			// Aguardar um pouco para a requisição ser processada
			await page.waitForTimeout(2000)

			// Verificar redirecionamento para welcome - usar timeout maior para WebKit
			await page.waitForURL('/admin/welcome', { timeout: 45000 })

			// Aguardar um pouco para garantir que o conteúdo esteja renderizado
			await page.waitForTimeout(3000)

			// Verificar se está logado - usar timeout maior
			await expect(page.getByText('Bem-vindo')).toBeVisible({ timeout: 30000 })
		})
	})

	test.describe('🚪 Logout e Sessão', () => {
		test('✅ Proteção de rotas autenticadas', async ({ page }) => {
			// Tentar acessar página protegida sem estar logado
			await page.goto('/admin/welcome')

			// Deve ser redirecionado para login
			await page.waitForURL('/login')
			await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible({ timeout: 15000 })
		})
	})
})
