import { test as base, Page, expect } from '@playwright/test'

// Extensão do test para incluir usuário autenticado
export const test = base.extend<{ authenticatedPage: Page }>({
	authenticatedPage: async ({ page }, use) => {
		// Fazer login como usuário administrador
		await page.goto('/auth/login')

		// Preencher formulário de login
		await page.getByLabel('Email').fill('mario.junior@inpe.br')
		await page.getByLabel('Senha').fill('#Admin123')

		// Clicar no botão de login
		await page.getByRole('button', { name: 'Entrar' }).click()

		// Aguardar redirecionamento para dashboard
		await page.waitForURL('/admin/dashboard')

		// Verificar se está logado
		await expect(page.getByText('Dashboard')).toBeVisible()

		await use(page)
	},
})

export { expect } from '@playwright/test'

// Helper para navegar para páginas admin
export async function navigateToAdminPage(page: Page, path: string) {
	await page.goto(`/admin/${path}`)
	await page.waitForLoadState('networkidle')
}

// Helper para verificar se elemento está visível
export async function expectElementVisible(page: Page, selector: string, timeout = 5000) {
	await expect(page.locator(selector)).toBeVisible({ timeout })
}

// Helper para preencher formulário
export async function fillFormField(page: Page, label: string, value: string) {
	await page.getByLabel(label).fill(value)
}

// Helper para clicar em botão por texto
export async function clickButton(page: Page, text: string) {
	await page.getByRole('button', { name: text }).click()
}

// Helper para verificar toast de sucesso
export async function expectSuccessToast(page: Page) {
	await expect(page.locator('[data-testid="toast-success"]')).toBeVisible()
}

// Helper para verificar toast de erro
export async function expectErrorToast(page: Page) {
	await expect(page.locator('[data-testid="toast-error"]')).toBeVisible()
}

// Helper para aguardar carregamento
export async function waitForLoading(page: Page) {
	await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' })
}

// Helper para verificar se página carregou
export async function expectPageLoaded(page: Page, title: string) {
	await expect(page.getByRole('heading', { name: title })).toBeVisible()
}
