import { test, expect } from './utils/auth-helpers'

test.describe('🔗 Integração - Logs e Observabilidade', () => {
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
