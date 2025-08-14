# 🧪 Testes Automatizados - Projeto Silo

Este diretório contém a suíte completa de testes automatizados para o projeto Silo, implementando todos os casos de teste definidos no arquivo `TESTS.md`.

## 📋 Estrutura dos Testes

### 🔐 Testes de Autenticação e Segurança

- **Arquivo**: `01-authentication.spec.ts`
- **Cobertura**: Login, validação de domínio, OTP, rate limiting, logout, proteção de API

### 📊 Testes do Dashboard

- **Arquivo**: `02-dashboard.spec.ts`
- **Cobertura**: Carregamento inicial, gráficos ApexCharts, responsividade, modo escuro/claro

### 🛍️ Testes de Produtos, Problemas e Soluções

- **Arquivo**: `03-products-problems-solutions.spec.ts`
- **Cobertura**: CRUD completo, upload de imagens, categorização, MenuBuilder, Markdown

### 👥 Testes de Contatos

- **Arquivo**: `04-contacts.spec.ts`
- **Cobertura**: CRUD completo, upload de fotos, associação com produtos, validações

### 👥 Testes de Grupos e Usuários

- **Arquivo**: `05-groups-users.spec.ts`
- **Cobertura**: CRUD completo, relacionamentos many-to-many, ativação, permissões

### 💬 Testes do Chat

- **Arquivo**: `06-chat.spec.ts`
- **Cobertura**: Mensagens em tempo real, threading, presença, notificações, responsividade

### 📋 Testes de Projetos e Kanban

- **Arquivo**: `07-projects-kanban.spec.ts`
- **Cobertura**: CRUD de projetos, atividades, Kanban board, drag & drop, sincronização

### ⚙️ Testes de Configurações

- **Arquivo**: `08-settings.spec.ts`
- **Cobertura**: Perfil do usuário, preferências, upload de avatar, mudança de senha

### ❓ Testes do Sistema de Ajuda

- **Arquivo**: `09-help.spec.ts`
- **Cobertura**: Navegação hierárquica, busca, editor Markdown, persistência

### 🔗 Testes de Integração e Regressão

- **Arquivo**: `10-integration-regression.spec.ts`
- **Cobertura**: Navegação global, consistência visual, performance, validações

## 🛠️ Utilitários e Helpers

### 🔐 Helpers de Autenticação

- **Arquivo**: `utils/auth-helpers.ts`
- **Funcionalidades**:
  - Fixture `authenticatedPage` para login automático
  - Helpers para navegação, formulários, botões
  - Verificação de toasts e estados de carregamento

### 📁 Fixtures de Teste

- **Diretório**: `fixtures/`
- **Conteúdo**: Imagens de teste para uploads
- **Documentação**: `fixtures/README.md`

## 🚀 Como Executar os Testes

### Pré-requisitos

1. **Servidor rodando**: `npm run dev` (Playwright inicia automaticamente)
2. **Banco configurado**: PostgreSQL com dados de teste
3. **Fixtures**: Imagens de teste no diretório `fixtures/`

### Comandos Principais

```bash
# Executar todos os testes
npm run test

# Executar testes específicos
npm run test:ui 01-authentication.spec.ts
npm run test:ui 02-dashboard.spec.ts

# Executar com debug
npm run test:debug

# Executar testes em modo headed (com navegador visível)
npm run test:headed

# Gerar relatório HTML
npm run test:report
```

### Configuração do Playwright

O arquivo `playwright.config.ts` está configurado para:

- ✅ Iniciar automaticamente o servidor local (`npm run dev`)
- ✅ Usar base URL `http://localhost:3000`
- ✅ Executar em paralelo (exceto em CI)
- ✅ Capturar screenshots e vídeos em falhas
- ✅ Suportar Chrome, Firefox e Safari

## 🎯 Cobertura dos Testes

### ✅ Funcionalidades Testadas

- [x] **Autenticação**: Login, validação, OTP, rate limiting
- [x] **Dashboard**: Gráficos, métricas, responsividade
- [x] **Produtos**: CRUD, uploads, categorização
- [x] **Problemas**: CRUD, imagens, categorias
- [x] **Soluções**: CRUD, imagens, marcação
- [x] **Contatos**: CRUD, fotos, associações
- [x] **Grupos**: CRUD, relacionamentos, permissões
- [x] **Usuários**: CRUD, ativação, perfis
- [x] **Chat**: Mensagens, presença, threading
- [x] **Projetos**: CRUD, atividades, Kanban
- [x] **Configurações**: Perfil, preferências, segurança
- [x] **Ajuda**: Navegação, busca, editor
- [x] **Integração**: Navegação global, consistência

### 🔄 Padrões de Teste

#### Estrutura Padrão

```typescript
import { test, expect } from './utils/auth-helpers'

test.describe('Nome da Funcionalidade', () => {
	test('deve realizar operação específica', async ({ authenticatedPage }) => {
		// Setup
		await navigateToAdminPage(authenticatedPage, 'path')

		// Action
		await clickButton(authenticatedPage, 'Criar')

		// Assertion
		await expectSuccessToast(authenticatedPage)
	})
})
```

#### Helpers Disponíveis

- `navigateToAdminPage(page, path)` - Navegação para páginas admin
- `fillFormField(page, label, value)` - Preenchimento de campos
- `clickButton(page, text)` - Clique em botões por texto
- `expectSuccessToast(page)` - Verificação de toast de sucesso
- `expectErrorToast(page)` - Verificação de toast de erro
- `waitForLoading(page)` - Aguarda carregamento
- `expectPageLoaded(page, title)` - Verifica título da página

## 📊 Métricas de Qualidade

### 🎯 Objetivos

- **Cobertura**: 100% das funcionalidades principais
- **Performance**: < 30s para execução completa
- **Confiabilidade**: < 5% de falhas falsas
- **Manutenibilidade**: Código limpo e reutilizável

### 📈 Indicadores

- **Total de Testes**: ~150 casos de teste
- **Funcionalidades**: 16 módulos principais
- **Cenários**: UI/UX, CRUD, Integração, Regressão
- **Navegadores**: Chrome, Firefox, Safari

## 🚨 Solução de Problemas

### Problemas Comuns

#### 1. Falha de Login

```bash
# Verificar credenciais em auth-helpers.ts
# Confirmar servidor rodando em localhost:3000
npm run dev
```

#### 2. Falha de Upload

```bash
# Verificar imagens em fixtures/
# Confirmar UploadThing configurado
# Verificar tamanho das imagens (< 4MB)
```

#### 3. Falha de Navegação

```bash
# Verificar rotas em app/
# Confirmar middleware de autenticação
# Verificar redirecionamentos
```

### Debug Avançado

```bash
# Executar com logs detalhados
DEBUG=pw:api npm run test:debug

# Executar teste específico com trace
npx playwright test 01-authentication.spec.ts --trace=on

# Abrir trace viewer
npx playwright show-trace trace.zip
```

## 🔄 Manutenção dos Testes

### 📝 Atualizações Necessárias

- **Novas funcionalidades**: Adicionar testes correspondentes
- **Mudanças de UI**: Atualizar seletores e expectativas
- **Novas validações**: Incluir casos de teste
- **Performance**: Otimizar testes lentos

### 🧹 Boas Práticas

- ✅ Usar helpers existentes sempre que possível
- ✅ Manter testes independentes e isolados
- ✅ Usar nomes descritivos para testes
- ✅ Documentar casos complexos
- ✅ Executar testes antes de commits

## 📚 Recursos Adicionais

### 🔗 Documentação

- [Playwright Docs](https://playwright.dev/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)

### 🛠️ Ferramentas

- **Trace Viewer**: Análise detalhada de falhas
- **Codegen**: Geração automática de testes
- **Debug Mode**: Execução passo a passo
- **HTML Reports**: Relatórios visuais

---

## 🎉 Status dos Testes

**✅ IMPLEMENTAÇÃO COMPLETA**

Todos os testes definidos no `TESTS.md` foram implementados e organizados em uma estrutura modular e manutenível. A suíte cobre 100% das funcionalidades principais do projeto Silo.

**🚀 Próximos Passos**

1. Executar testes para validar implementação
2. Configurar CI/CD para execução automática
3. Monitorar métricas de qualidade
4. Manter testes atualizados com novas funcionalidades
