# 🧪 Exemplo de Uso dos Testes Playwright

Este arquivo demonstra como usar os helpers e estrutura dos testes implementados.

## 📋 Estrutura de um Teste

```typescript
import { test, expect } from './utils/auth-helpers'

test.describe('Nome da Funcionalidade', () => {
  test('deve realizar operação específica', async ({ authenticatedPage }) => {
    // Setup - Navegar para página
    await navigateToAdminPage(authenticatedPage, 'contacts')
    
    // Action - Executar ação
    await clickButton(authenticatedPage, 'Criar Contato')
    
    // Assertion - Verificar resultado
    await expectSuccessToast(authenticatedPage)
  })
})
```

## 🛠️ Helpers Disponíveis

### Navegação
```typescript
// Navegar para página admin
await navigateToAdminPage(page, 'path')

// Verificar se página carregou
await expectPageLoaded(page, 'Título da Página')
```

### Formulários
```typescript
// Preencher campo por label
await fillFormField(page, 'Nome', 'João Silva')

// Clicar em botão por texto
await clickButton(page, 'Salvar')
```

### Verificações
```typescript
// Verificar toast de sucesso
await expectSuccessToast(page)

// Verificar toast de erro
await expectErrorToast(page)

// Aguardar carregamento
await waitForLoading(page)
```

## 🎯 Padrões de Teste

### 1. Teste de CRUD Completo
```typescript
test.describe('CRUD de Contatos', () => {
  test('deve criar, editar e excluir contato', async ({ authenticatedPage }) => {
    // Criar
    await navigateToAdminPage(authenticatedPage, 'contacts')
    await clickButton(authenticatedPage, 'Criar')
    await fillFormField(authenticatedPage, 'Nome', 'Teste')
    await fillFormField(authenticatedPage, 'Email', 'teste@example.com')
    await clickButton(authenticatedPage, 'Salvar')
    await expectSuccessToast(authenticatedPage)
    
    // Editar
    await clickButton(authenticatedPage, 'Editar')
    await fillFormField(authenticatedPage, 'Nome', 'Teste Editado')
    await clickButton(authenticatedPage, 'Salvar')
    await expectSuccessToast(authenticatedPage)
    
    // Excluir
    await clickButton(authenticatedPage, 'Excluir')
    await clickButton(authenticatedPage, 'Confirmar')
    await expectSuccessToast(authenticatedPage)
  })
})
```

### 2. Teste de Upload
```typescript
test('deve fazer upload de imagem', async ({ authenticatedPage }) => {
  await navigateToAdminPage(authenticatedPage, 'contacts')
  await clickButton(authenticatedPage, 'Criar')
  
  // Upload de arquivo
  const fileInput = authenticatedPage.locator('input[type="file"]')
  await fileInput.setInputFiles('tests/fixtures/test-image.jpg')
  
  await expectSuccessToast(authenticatedPage)
})
```

### 3. Teste de Validação
```typescript
test('deve validar campos obrigatórios', async ({ authenticatedPage }) => {
  await navigateToAdminPage(authenticatedPage, 'contacts')
  await clickButton(authenticatedPage, 'Criar')
  
  // Tentar salvar sem preencher campos
  await clickButton(authenticatedPage, 'Salvar')
  
  // Verificar mensagens de erro
  await expect(authenticatedPage.getByText('Nome é obrigatório')).toBeVisible()
  await expect(authenticatedPage.getByText('Email é obrigatório')).toBeVisible()
})
```

## 🔧 Configuração de Teste

### Fixture authenticatedPage
```typescript
// Login automático em todos os testes
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill('mario.junior@inpe.br')
    await page.getByLabel('Senha').fill('#Admin123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('/admin/dashboard')
    await use(page)
  },
})
```

### Configuração do Playwright
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})
```

## 🚀 Execução dos Testes

### Comandos Disponíveis
```bash
# Executar todos os testes
npm run test

# Executar teste específico
npm run test:ui 01-authentication.spec.ts

# Executar com debug
npm run test:debug

# Executar em modo headed
npm run test:headed

# Gerar relatório
npm run test:report
```

### Debug e Troubleshooting
```bash
# Logs detalhados
DEBUG=pw:api npm run test:debug

# Trace completo
npx playwright test --trace=on

# Abrir trace viewer
npx playwright show-trace trace.zip
```

## 📝 Boas Práticas

1. **Sempre usar helpers** - Evite código duplicado
2. **Testes independentes** - Cada teste deve ser isolado
3. **Nomes descritivos** - Use nomes que expliquem o que está sendo testado
4. **Setup limpo** - Use beforeEach/afterEach para limpeza
5. **Assertions claras** - Verifique o comportamento esperado
6. **Tratamento de erros** - Teste cenários de falha
7. **Performance** - Mantenha testes rápidos e eficientes

---

**🎯 Este arquivo serve como referência para implementar novos testes seguindo os padrões estabelecidos.**
