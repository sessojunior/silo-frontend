# ⚙️ Configuração para Testes Playwright

## 🔧 Variáveis de Ambiente Necessárias

Para executar os testes corretamente, certifique-se de que as seguintes variáveis estão configuradas:

### 🌐 Configurações Básicas

```bash
# URL base para testes
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configurações de banco de dados para testes
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/silo_test

# Configurações de autenticação para testes
NEXTAUTH_SECRET=test-secret-key-for-playwright
NEXTAUTH_URL=http://localhost:3000
```

### 📧 Configurações de Email

```bash
# Para testes de OTP e notificações
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test@example.com
SMTP_PASS=test-password
```

### 🧪 Configurações de Teste

```bash
# Modo de teste
NODE_ENV=test
PLAYWRIGHT_TEST_MODE=true
```

## 🚀 Como Configurar

### 1. Copiar .env para .env.test

```bash
cp .env .env.test
```

### 2. Editar .env.test

Ajustar as variáveis acima para o ambiente de teste

### 3. Executar testes

```bash
npm run test
```

## ⚠️ Importante

- **NUNCA** commitar arquivos .env com credenciais reais
- Use sempre credenciais de teste para execução dos testes
- Configure banco de dados separado para testes
- Use servidor local em modo de teste quando disponível
