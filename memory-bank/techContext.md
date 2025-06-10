# Tech Context - Silo

## Stack Tecnológico Principal

### Frontend Framework

- **Next.js 15.3.2+**: Framework React full-stack
  - App Router (nova arquitetura)
  - Server Components por padrão
  - Client Components para interatividade
  - File-based routing

### Runtime e Language

- **React 19.0.0**: Biblioteca de componentes
- **TypeScript 5**: Tipagem estática
- **Node.js**: Runtime para Next.js

### Estilização e UI

- **Tailwind CSS 4**: Framework CSS utilitário
- **Iconify**: Sistema de ícones
  - Plugin: `@iconify/tailwind4`
  - Icons: `@iconify/json`
- **Componentes Personalizados**: Não usa ShadCN ou bibliotecas UI

### Banco de Dados

- **PostgreSQL**: Banco de dados principal (produção e desenvolvimento)
- **Drizzle ORM 0.43.1+**: ORM TypeScript-first
- **Drizzle Kit**: Migrations e studio
- **node-postgres (pg)**: Driver oficial PostgreSQL

### Autenticação e Segurança

- **Arctic 3.7.0**: OAuth providers (Google)
- **bcryptjs 3.0.2**: Hash de senhas
- **Cookies HttpOnly**: Armazenamento seguro de sessões
- **Custom Auth System**: Implementação própria

### Comunicação

- **Nodemailer 7.0.3**: Envio de emails
- **Custom Rate Limiting**: Proteção contra spam

### Visualização de Dados

- **ApexCharts 4.7.0**: Biblioteca de gráficos
- **React-ApexCharts 1.7.0**: Wrapper React

### Desenvolvimento e Qualidade

- **ESLint 9**: Linting com regras Next.js
- **Prettier 3.5.3**: Formatação de código
- **Simple Import Sort**: Organização de imports

## Configuração de Desenvolvimento

### Scripts Disponíveis

```json
{
	"dev": "next dev --turbopack", // Desenvolvimento com Turbopack
	"build": "next build", // Build de produção
	"start": "next start", // Servidor de produção
	"lint": "next lint", // Verificação de código
	"db:studio": "drizzle-kit studio", // Interface visual do banco
	"db:push": "drizzle-kit push", // Sync schema com banco
	"db:generate": "drizzle-kit generate", // Gerar migrations
	"db:migrate": "drizzle-kit migrate", // Executar migrations
	"db:seed": "npx tsx src/lib/db/seed.ts" // Popular banco com dados teste
}
```

### Estrutura de Configuração

```
├── drizzle.config.ts        # Configuração Drizzle ORM
├── next.config.ts           # Configuração Next.js
├── tsconfig.json           # Configuração TypeScript
├── eslint.config.mjs       # Configuração ESLint
├── postcss.config.mjs      # Configuração PostCSS
├── .env                    # Variáveis de ambiente
└── .gitignore             # Arquivos ignorados pelo Git
```

## Dependências e Versões

### Core Dependencies

```json
{
	"apexcharts": "^4.7.0", // Charts library
	"arctic": "^3.7.0", // OAuth providers
	"bcryptjs": "^3.0.2", // Password hashing
	"clsx": "^2.1.1", // Conditional classnames
	"dotenv": "^16.5.0", // Environment variables
	"drizzle-orm": "^0.43.1", // ORM
	"next": "15.3.2", // Framework
	"nodemailer": "^7.0.3", // Email sending
	"pg": "^8.12.0", // PostgreSQL driver
	"react": "^19.0.0", // UI library
	"react-apexcharts": "^1.7.0", // Charts React wrapper
	"react-dom": "^19.0.0", // DOM bindings
	"react-markdown": "^10.1.0", // Markdown rendering
	"tailwind-merge": "^3.3.0" // Tailwind class merging
}
```

### Development Dependencies

```json
{
	"@iconify/json": "^2.2.336", // Icon sets
	"@iconify/tailwind4": "^1.0.6", // Iconify Tailwind plugin
	"@tailwindcss/forms": "^0.5.10", // Form styling
	"@tailwindcss/postcss": "^4", // PostCSS integration
	"@tailwindcss/typography": "^0.5.16", // Typography plugin
	"@types/node": "^20", // Node.js types
	"@types/nodemailer": "^6.4.17", // Nodemailer types
	"@types/pg": "^8.11.10", // PostgreSQL types
	"@types/react": "^19", // React types
	"@types/react-dom": "^19", // React DOM types
	"drizzle-kit": "^0.31.1", // Database toolkit
	"eslint": "^9", // Linting
	"eslint-config-next": "15.3.2", // Next.js ESLint config
	"eslint-plugin-simple-import-sort": "^12.1.1", // Import sorting
	"prettier": "^3.5.3", // Code formatting
	"prettier-plugin-tailwindcss": "^0.6.11", // Tailwind Prettier plugin
	"tailwindcss": "^4", // CSS framework
	"tsx": "^4.19.2", // TypeScript execution
	"typescript": "^5" // TypeScript compiler
}
```

## Configurações Específicas

### Drizzle ORM Setup

```typescript
// drizzle.config.ts
export default {
	schema: './src/lib/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
}
```

### Conexão PostgreSQL

```typescript
// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
})

export const db = drizzle(pool, { schema })
```

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
		],
	},
}
```

### TypeScript Configuration

- **Strict mode**: Ativado
- **Path mapping**: `@/*` aponta para `src/*`
- **JSX**: Preserve para Next.js
- **Target**: ES2017

### ESLint Configuration

- **Next.js rules**: Configuração padrão
- **Import sorting**: Automático
- **TypeScript support**: Completo

## Variáveis de Ambiente

### Ambiente Desenvolvimento

```env
# Database PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/silo_dev"

# Authentication
AUTH_SECRET="your-auth-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"

# Email Service
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="SILO <your-email@gmail.com>"

# Upload Configuration
UPLOAD_DIR="/var/uploads/silo"
NGINX_UPLOAD_URL="https://uploads.silo.inpe.br"
```

### Ambiente Produção

```env
# Database PostgreSQL
DATABASE_URL="postgresql://silo_user:strong_password@postgres-server:5432/silo_prod"

# Security
AUTH_SECRET="production-secret-with-32-chars"
NODE_ENV="production"

# SSL Configuration
DATABASE_SSL="true"

# Upload nginx
UPLOAD_DIR="/var/uploads/silo"
NGINX_UPLOAD_URL="https://uploads.silo.inpe.br"
```

## Configuração PostgreSQL

### Instalação e Setup

```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Criar usuário e banco
sudo -u postgres psql
CREATE USER silo_user WITH PASSWORD 'strong_password';
CREATE DATABASE silo_dev OWNER silo_user;
CREATE DATABASE silo_prod OWNER silo_user;
GRANT ALL PRIVILEGES ON DATABASE silo_dev TO silo_user;
GRANT ALL PRIVILEGES ON DATABASE silo_prod TO silo_user;
```

### Comandos de Desenvolvimento

```bash
# Aplicar schema ao banco
npm run db:push

# Gerar migrations
npm run db:generate

# Executar migrations
npm run db:migrate

# Abrir Drizzle Studio
npm run db:studio

# Popular banco com dados
npm run db:seed
```

### Vantagens do PostgreSQL

- **Performance**: 10x mais rápido para queries complexas
- **Escalabilidade**: Suporte a milhões de registros
- **Integridade**: ACID compliant com foreign keys rígidas
- **Funcionalidades**: JSON, full-text search, índices avançados
- **Produção**: Backup incremental, replicação, monitoring

## Configuração Upload com nginx

### Estrutura de Uploads Externa

```
/var/uploads/silo/
├── profile/              # Fotos de perfil de usuários
├── products/             # Arquivos relacionados a produtos
│   ├── problems/         # Imagens de problemas reportados
│   ├── solutions/        # Imagens de soluções
│   └── manual/           # Documentos do manual (futuro)
└── system/               # Arquivos do sistema (logos, etc)
```

### Configuração nginx

```nginx
# /etc/nginx/sites-available/silo-uploads
server {
    listen 80;
    server_name uploads.silo.inpe.br;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # Upload location
    location / {
        root /var/uploads/silo;

        # Security restrictions
        location ~* \.(php|asp|jsp|cgi)$ {
            deny all;
        }

        # Only allow specific file types
        location ~* \.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
            try_files $uri =404;
        }

        # Block access to hidden files
        location ~ /\. {
            deny all;
        }
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Vantagens do Upload via nginx

- **Performance**: nginx serve arquivos 10x mais rápido que Node.js
- **Escalabilidade**: Milhares de downloads simultâneos
- **Cache**: Headers otimizados para CDN
- **Segurança**: Restrições de tipo de arquivo no proxy
- **Monitoring**: Logs separados do aplicação
- **Bandwidth**: Reduz carga na aplicação Node.js

## Schema PostgreSQL

### Principais Diferenças do SQLite

```typescript
// Antes (SQLite)
integer('created_at', { mode: 'timestamp' })
integer('email_verified', { mode: 'boolean' })
integer({ mode: 'boolean' }).default(false)

// Depois (PostgreSQL)
timestamp('created_at').defaultNow()
boolean('email_verified').default(false)
boolean().default(false)
```

### Relacionamentos Otimizados

- Foreign keys com ON DELETE CASCADE onde apropriado
- Índices automáticos em todas as chaves estrangeiras
- Self-references simplificadas para evitar ciclos
- Constraints de unicidade para slugs e emails

A migração para PostgreSQL garante que o sistema seja robusto e escalável para atender às demandas do CPTEC/INPE.

## Editor Markdown

### @uiw/react-md-editor

**Versão**: Latest
**Purpose**: Editor WYSIWYG markdown com preview em tempo real

**Configuração Customizada**:

- **Tema dinâmico**: Suporte completo dark/light mode
- **Toolbar expandida**: Botões 40px (250% maiores) com ícones 20px
- **Preview otimizado**: Títulos sem bordas, consistente com base de conhecimento
- **CSS customizado**: Especificidade correta para sobrescrever biblioteca

```tsx
// Configuração no componente
<MDEditor value={value} onChange={setValue} preview='edit' className='md-editor-custom' data-color-mode={theme} />
```

**CSS Patterns para Customização**:

```css
/* Overrides com especificidade correta */
.md-editor-custom .w-md-editor-preview .wmde-markdown h1 {
	@apply text-lg font-bold text-zinc-700 dark:text-zinc-200;
	border-bottom: none; /* CSS puro para override */
	padding-bottom: 0;
}

/* Background e color separados para evitar conflitos */
.md-editor-custom .w-md-editor-text-input {
	background-color: transparent;
}
```

**Características**:

- Preview limpo sem bordas em títulos
- Background transparente em textareas
- Cores zinc padronizadas
- Dividers centralizados verticalmente

### Markdown Rendering
