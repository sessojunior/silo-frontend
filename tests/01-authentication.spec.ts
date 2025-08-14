import { test, expect } from '@playwright/test'
import { navigateToAdminPage, fillFormField, clickButton } from './utils/auth-helpers'

test.describe('🔐 AUTENTICAÇÃO E SEGURANÇA', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('✅ Validação de domínio institucional - bloqueia domínios externos', async ({ page }) => {
		await page.goto('/auth/register')

		// Tentar cadastro com domínio externo
		await fillFormField(page, 'Nome completo', 'Usuário Teste')
		await fillFormField(page, 'Email', 'usuario@exemplo.com')
		await fillFormField(page, 'Senha', 'senha123')
		await fillFormField(page, 'Confirmar senha', 'senha123')

		await clickButton(page, 'Criar conta')

		// Deve mostrar erro de domínio inválido
		await expect(page.getByText('Apenas emails @inpe.br são permitidos')).toBeVisible()
	})

	test('✅ Validação de domínio institucional - permite @inpe.br', async ({ page }) => {
		await page.goto('/auth/register')

		// Cadastro com domínio válido
		await fillFormField(page, 'Nome completo', 'Usuário Teste INPE')
		await fillFormField(page, 'Email', 'usuario.teste@inpe.br')
		await fillFormField(page, 'Senha', 'senha123')
		await fillFormField(page, 'Confirmar senha', 'senha123')

		await clickButton(page, 'Criar conta')

		// Deve mostrar mensagem de sucesso ou redirecionar
		await expect(page.getByText(/conta criada|verifique seu email|verificação/i)).toBeVisible()
	})

	test('✅ Login com credenciais válidas', async ({ page }) => {
		await page.goto('/auth/login')

		await fillFormField(page, 'Email', 'admin@inpe.br')
		await fillFormField(page, 'Senha', 'admin123')

		await clickButton(page, 'Entrar')

		// Deve redirecionar para dashboard
		await page.waitForURL('/admin/dashboard')
		await expect(page.getByText('Dashboard')).toBeVisible()
	})

	test('✅ Login com credenciais inválidas', async ({ page }) => {
		await page.goto('/auth/login')

		await fillFormField(page, 'Email', 'admin@inpe.br')
		await fillFormField(page, 'Senha', 'senhaerrada')

		await clickButton(page, 'Entrar')

		// Deve mostrar erro de credenciais inválidas
		await expect(page.getByText(/credenciais inválidas|email ou senha incorretos/i)).toBeVisible()
	})

	test('✅ Login apenas com email (OTP)', async ({ page }) => {
		await page.goto('/auth/login')

		// Clicar na aba de login apenas com email
		await page.getByRole('tab', { name: 'Apenas Email' }).click()

		await fillFormField(page, 'Email', 'admin@inpe.br')
		await clickButton(page, 'Enviar código')

		// Deve mostrar mensagem de código enviado
		await expect(page.getByText(/código enviado|verifique seu email/i)).toBeVisible()
	})

	test('✅ Rate limiting para OTP', async ({ page }) => {
		await page.goto('/auth/login')
		await page.getByRole('tab', { name: 'Apenas Email' }).click()

		// Tentar enviar código 4 vezes (deve bloquear na 4ª)
		for (let i = 0; i < 4; i++) {
			await fillFormField(page, 'Email', 'admin@inpe.br')
			await clickButton(page, 'Enviar código')
			await page.waitForTimeout(1000) // Aguardar 1 segundo entre tentativas
		}

		// Deve mostrar mensagem de rate limit
		await expect(page.getByText(/muitas tentativas|aguarde|rate limit/i)).toBeVisible()
	})

	test('✅ Logout funcional', async ({ page }) => {
		// Fazer login primeiro
		await page.goto('/auth/login')
		await fillFormField(page, 'Email', 'admin@inpe.br')
		await fillFormField(page, 'Senha', 'admin123')
		await clickButton(page, 'Entrar')

		await page.waitForURL('/admin/dashboard')

		// Fazer logout
		await page.getByRole('button', { name: /configurações|perfil/i }).click()
		await page.getByRole('menuitem', { name: 'Sair' }).click()

		// Deve redirecionar para página de login
		await page.waitForURL('/auth/login')
		await expect(page.getByText('Entrar')).toBeVisible()
	})

	test('✅ Proteção de APIs admin sem sessão', async ({ page }) => {
		// Tentar acessar API admin sem estar logado
		const response = await page.request.get('/api/admin/users')

		// Deve retornar 401 Unauthorized
		expect(response.status()).toBe(401)
	})

	test('✅ Página de erro personalizada para usuário inativo', async ({ page }) => {
		// Tentar login com usuário inativo (se existir)
		await page.goto('/auth/login')
		await fillFormField(page, 'Email', 'inativo@inpe.br')
		await fillFormField(page, 'Senha', 'senha123')

		await clickButton(page, 'Entrar')

		// Deve redirecionar para página de erro personalizada
		await expect(page.getByText(/conta inativa|não autorizado|bloqueado/i)).toBeVisible()

		// Verificar se tem botão para voltar
		await expect(page.getByRole('button', { name: /voltar|início/i })).toBeVisible()
	})

	test('✅ Redirecionamento para página de erro em rotas protegidas', async ({ page }) => {
		// Tentar acessar página admin sem estar logado
		await page.goto('/admin/dashboard')

		// Deve redirecionar para página de erro ou login
		await expect(page.getByText(/não autorizado|acesso negado|faça login/i)).toBeVisible()
	})
})
