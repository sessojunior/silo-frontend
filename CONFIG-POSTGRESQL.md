# Configuração PostgreSQL Local - Etapa 1

## 1. Instalar PostgreSQL

### Windows

```bash
# Baixar do site oficial
https://www.postgresql.org/download/windows/

# Ou via chocolatey
choco install postgresql
```

### macOS

```bash
# Via Homebrew
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. Criar Banco de Dados "silo"

```bash
# Conectar ao PostgreSQL como superuser
psql -U postgres

# Dentro do psql:
CREATE DATABASE silo;
CREATE USER silo_user WITH PASSWORD 'silo123';
GRANT ALL PRIVILEGES ON DATABASE silo TO silo_user;
\q
```

## 3. Configurar arquivo .env

Crie um arquivo `.env` na raiz do projeto com:

```env
# Database PostgreSQL Local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/silo"
# OU com usuário específico:
# DATABASE_URL="postgresql://silo_user:silo123@localhost:5432/silo"

# Authentication
AUTH_SECRET="development-secret-key-32-characters"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"

# Email Service (desenvolvimento)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="SILO <your-email@gmail.com>"

# Upload Configuration
UPLOAD_DIR="./public/uploads"
NGINX_UPLOAD_URL="http://localhost:3000/uploads"

# Development
NODE_ENV="development"
```

## 4. Testar Conexão

```bash
# Aplicar schema ao banco
npm run db:push

# Se der erro, verificar:
# 1. PostgreSQL está rodando
# 2. Banco "silo" existe
# 3. Usuário/senha corretos
# 4. Porta 5432 aberta
```

## 5. Executar Seed

```bash
# Após conexão funcionando
npm run db:seed
```

## Soluções para Problemas Comuns

### Erro SASL Authentication

- Verificar se PostgreSQL está rodando
- Confirmar usuário e senha no .env
- Testar conexão manual: `psql -U postgres -d silo`

### Banco não existe

```bash
createdb silo
# ou
psql -U postgres -c "CREATE DATABASE silo;"
```

### Porta ocupada

- Verificar se PostgreSQL usa porta padrão 5432
- Ajustar DATABASE_URL se necessário

### Permissions

```bash
# Dar permissões ao usuário
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE silo TO postgres;"
```
