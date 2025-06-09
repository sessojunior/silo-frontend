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

- **SQLite 3**: Desenvolvimento (com `sqlite3` driver)
- **PostgreSQL**: Produção (futuro)
- **Drizzle ORM 0.43.1+**: ORM TypeScript-first
- **Drizzle Kit**: Migrations e studio

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
	"@libsql/client": "^0.15.6", // SQLite client
	"apexcharts": "^4.7.0", // Charts library
	"arctic": "^3.7.0", // OAuth providers
	"bcryptjs": "^3.0.2", // Password hashing
	"clsx": "^2.1.1", // Conditional classnames
	"dotenv": "^16.5.0", // Environment variables
	"drizzle-orm": "^0.43.1", // ORM
	"next": "15.3.2", // Framework
	"nodemailer": "^7.0.3", // Email sending
	"react": "^19.0.0", // UI library
	"react-apexcharts": "^1.7.0", // Charts React wrapper
	"react-dom": "^19.0.0", // DOM bindings
	"react-markdown": "^10.1.0", // Markdown rendering
	"sqlite3": "^5.1.7", // SQLite driver
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
	"@types/react": "^19", // React types
	"@types/react-dom": "^19", // React DOM types
	"drizzle-kit": "^0.31.1", // Database toolkit
	"eslint": "^9", // Linting
	"eslint-config-next": "15.3.2", // Next.js ESLint config
	"eslint-plugin-simple-import-sort": "^12.1.1", // Import sorting
	"prettier": "^3.5.3", // Code formatting
	"prettier-plugin-tailwindcss": "^0.6.11", // Tailwind Prettier plugin
	"tailwindcss": "^4", // CSS framework
	"typescript": "^5" // TypeScript compiler
}
```

## Configurações Específicas

### Drizzle ORM Setup

```typescript
// drizzle.config.ts
export default {
	schema: './src/lib/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: './database.db',
	},
}
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
# Database
DATABASE_URL="file:./database.db"

# Authentication
NEXTAUTH_SECRET="development-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Development)
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="noreply@silo.local"
```

### Ambiente Produção

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="production-secure-secret"
NEXTAUTH_URL="https://silo.inpe.br"

# Google OAuth
GOOGLE_CLIENT_ID="production-google-client-id"
GOOGLE_CLIENT_SECRET="production-google-client-secret"

# Email (Production SMTP)
EMAIL_SERVER_HOST="smtp.inpe.br"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="silo@inpe.br"
EMAIL_SERVER_PASSWORD="secure-password"
EMAIL_FROM="silo@inpe.br"
```

## Restrições e Limitações

### Performance

- **SQLite Limitation**: ~100k requests/day (migração para PostgreSQL quando necessário)
- **File Upload**: Limite de 5MB por imagem
- **Rate Limiting**: 3 requests/minute para operações sensíveis

### Browser Support

- **Modern browsers only**: ES2017+ features
- **Mobile responsive**: Touch-first design
- **Progressive Enhancement**: Funcionalidade básica sem JavaScript

### Security Constraints

- **HTTPS only**: Em produção
- **HttpOnly cookies**: Tokens não acessíveis via JS
- **Content Security Policy**: Headers restritivos
- **CORS**: Configuração específica para domínio

## Padrões de Deployment

### Development

```bash
npm run dev          # Servidor local com hot reload
npm run db:studio    # Interface visual do banco
npm run db:seed      # Popular com dados de teste
```

### Production Build

```bash
npm run build        # Build otimizado
npm run start        # Servidor de produção
npm run db:migrate   # Aplicar migrations
```

### Database Management

```bash
npm run db:generate  # Criar nova migration
npm run db:push      # Sync schema (development only)
npm run db:studio    # Visual database browser
```

## Ferramentas de Desenvolvimento

### IDE Recommended Extensions

- **TypeScript**: Suporte nativo
- **Tailwind CSS IntelliSense**: Autocomplete de classes
- **ES7+ React/Redux Snippets**: Snippets úteis
- **Prettier**: Formatação automática
- **ESLint**: Linting em tempo real

### Debugging

- **React DevTools**: Debug de componentes
- **Network Tab**: Monitoring de APIs
- **Drizzle Studio**: Visualização do banco
- **Console.log**: Debug tradicional (removido em produção)

### Performance Monitoring

- **Next.js Analytics**: Métricas de build
- **Web Vitals**: Core performance metrics
- **Bundle Analyzer**: Análise de tamanho do bundle
