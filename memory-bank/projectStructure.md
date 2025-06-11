# Project Structure - Silo

## ÍNDICE TÉCNICO COMPLETO

### Estrutura de Diretórios Principais

```
src/
├── app/                     # Next.js 15 App Router
│   ├── (auth)/             # 🔐 Grupo de rotas de autenticação
│   │   ├── forget-password/ # Reset senha 4 etapas
│   │   ├── login/          # Login email/senha + verificação
│   │   ├── login-email/    # Login apenas email + OTP
│   │   ├── login-google/   # Redirect Google OAuth
│   │   ├── logout/         # Logout com cleanup
│   │   └── register/       # Registro + verificação email
│   ├── (site)/             # 🌐 Página pública
│   │   └── page.tsx        # Landing page
│   ├── admin/              # 🏢 Área administrativa protegida
│   │   ├── dashboard/      # Dashboard principal com gráficos
│   │   ├── products/       # Gestão de produtos
│   │   │   └── [slug]/     # Produto específico
│   │   │       ├── page.tsx         # Base conhecimento
│   │   │       ├── problems/        # Problemas & soluções
│   │   │       └── layout.tsx       # Tabs navegação
│   │   ├── profile/        # Perfil usuário
│   │   │   ├── page.tsx             # Dados pessoais
│   │   │   ├── preferences/         # Configurações
│   │   │   └── security/            # Email & senha
│   │   ├── settings/       # Configurações sistema
│   │   │   ├── groups/              # ⚠️ Sistema grupos (VAZIO)
│   │   │   ├── products/            # CRUD produtos
│   │   │   └── projects/            # ⚠️ Projetos (VAZIO)
│   │   └── welcome/        # Página inicial admin
│   └── api/                # 🔌 API Routes (Next.js)
│       ├── (user)/         # APIs de usuário
│       ├── auth/           # APIs de autenticação
│       └── products/       # APIs de produtos
├── components/             # 🧩 Componentes React
│   ├── admin/             # Componentes área administrativa
│   ├── auth/              # Componentes autenticação
│   └── ui/                # 🎨 Design System personalizado (25+)
├── context/                # ⚛️ React Contexts
│   ├── UserContext.tsx              # Contexto usuário
│   └── SidebarContext.tsx           # Contexto sidebar
└── lib/                    # 🛠️ Utilitários e configurações
    ├── auth/              # Sistema autenticação
    ├── db/                # Database Drizzle + PostgreSQL
    ├── *.ts               # Utilitários diversos
```

## APIs IMPLEMENTADAS (22 endpoints)

### 🔐 Autenticação

- `POST /api/auth/register` - Criar conta + envio OTP
- `POST /api/auth/login` - Login email/senha + verificação
- `POST /api/auth/login-email` - Login apenas email + OTP
- `POST /api/auth/verify-code` - Verificar código OTP
- `POST /api/auth/forget-password` - Solicitar reset senha
- `POST /api/auth/send-password` - Definir nova senha
- `GET /api/auth/callback/google` - Callback Google OAuth

### 👤 Usuário

- `GET/PUT /api/user-profile` - Perfil usuário
- `GET/PUT /api/user-preferences` - Preferências
- `PUT /api/user-email` - Alterar email
- `PUT /api/user-password` - Alterar senha
- `POST/DELETE /api/user-profile-image` - Foto perfil

### 📦 Produtos

- `GET/POST/PUT/DELETE /api/products` - CRUD produtos
- `GET/POST/PUT/DELETE /api/products/dependencies` - Dependências hierárquicas
- `GET /api/products/contacts` - Lista contatos
- `GET/POST/PUT /api/products/manual` - Manual estruturado
- `GET/POST/DELETE /api/products/images` - Upload imagens

### 🔧 Problemas & Soluções

- `GET/POST/PUT/DELETE /api/products/problems` - CRUD problemas
- `GET/POST/PUT/DELETE /api/products/solutions` - CRUD soluções

## DATABASE SCHEMA (PostgreSQL)

### 🔐 Autenticação & Usuários (7 tabelas)

```sql
auth_user (id, name, email, emailVerified, password, createdAt)
auth_session (id, userId, token, expiresAt, createdAt)
auth_code (id, userId, type, code, expiresAt, createdAt)
auth_provider (id, userId, providerId, providerType, createdAt)
rate_limit (id, identifier, route, count, expiresAt)
user_profile (userId, phone, sector, position, location, bio, updatedAt)
user_preferences (userId, emailNotifications, newsletters, updatedAt)
```

### 📦 Produtos & Conhecimento (5 tabelas)

```sql
product (id, name, slug, available, createdAt, updatedAt)
product_dependency (id, productId, name, type, category, parentId, order, createdAt)
product_contact (id, productId, name, role, team, email, phone, createdAt)
product_manual_section (id, productId, title, description, order, createdAt)
product_manual_chapter (id, sectionId, title, content, order, createdAt)
```

### 🔧 Problemas & Soluções (5 tabelas)

```sql
product_problem (id, productId, userId, title, description, createdAt, updatedAt)
product_problem_image (id, problemId, image, description, createdAt)
product_solution (id, problemId, userId, replyId, description, createdAt, updatedAt)
product_solution_checked (id, solutionId, userId, createdAt)
product_solution_image (id, solutionId, image, description, createdAt)
```

### 🗄️ Sistema (1 tabela)

```sql
system_file (id, filename, path, type, size, createdAt)
```

## COMPONENTES UI PERSONALIZADOS (25+)

### 📝 Formulários

- **Input** - text/email com validação
- **InputPassword** - senha com toggle visibilidade
- **InputPasswordHints** - senha com dicas força
- **InputCheckbox** - checkbox customizado
- **Pin** - input código OTP (5 dígitos)
- **Select** - dropdown customizado com keyboard navigation
- **Switch** - toggle switch
- **Label** - label com estados válido/inválido

### 🧭 Navegação

- **Button** - 3 estilos (filled, bordered, unstyled)
- **Tree** - árvore hierárquica navegável
- **Accordion** - conteúdo expansível seções/capítulos
- **ProductTabs** - tabs específicas produtos

### 💬 Feedback

- **Toast** - sistema notificações global
- **Modal** - modal base com backdrop
- **Dialog** - modal confirmação
- **Lightbox** - visualizador imagem
- **Popover** - tooltip posicionado

### 🏗️ Layout

- **Offcanvas** - painel lateral
- **Sidebar** - sidebar admin com menu
- **Topbar** - barra superior
- **Content** - container conteúdo

### 📊 Visualização

- **ChartColumn/Donut/Line** - gráficos ApexCharts
- **CircleProgress** - progresso circular
- **ProgressBar** - barra progresso
- **Stats** - estatísticas dashboard
- **Radial** - gráfico radial

### 📤 Upload

- **PhotoUpload** - upload foto perfil com preview
- **File uploads** - upload imagens problemas/soluções

### Características

- **100% Personalizados**: Sem ShadCN ou bibliotecas UI
- **TypeScript Completo**: Totalmente tipados
- **Dark Mode Nativo**: Suporte completo ambos temas
- **Acessibilidade**: ARIA labels, keyboard navigation
- **Responsivo**: Mobile-first design

## STACK TECNOLÓGICO

### 🏗️ Core Framework

- **Next.js 15.3.2** - Framework full-stack
- **React 19** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário

### 💾 Database

- **PostgreSQL** - Database produção
- **Drizzle ORM 0.43.1** - ORM TypeScript-first
- **node-postgres (pg)** - Driver oficial PostgreSQL
- **Connection Pool** - Pool conexões otimizado

### 🔐 Autenticação

- **Arctic 3.7.0** - Google OAuth provider
- **bcryptjs** - Hash senhas bcrypt
- **Custom Auth System** - Implementação própria sessões
- **Rate Limiting** - Proteção anti-spam personalizada

### 🛠️ Utilitários

- **ApexCharts 4.7.0** - Gráficos dashboard
- **Nodemailer 7.0.3** - Envio emails
- **@uiw/react-md-editor** - Editor markdown com preview
- **Iconify** - Sistema ícones completo
- **clsx** - Conditional classnames
- **tailwind-merge** - Merge classes Tailwind

### 🎨 Estilização

- **@iconify/tailwind4** - Plugin ícones Tailwind
- **@tailwindcss/forms** - Estilização formulários
- **@tailwindcss/typography** - Tipografia markdown

## ARQUITETURA DE SEGURANÇA

### 🔒 Autenticação

- **Sessões HttpOnly**: Cookies seguros inacessíveis JS
- **Hash SHA-256**: Tokens hasheados no database
- **CSRF Protection**: SameSite=Lax cookies
- **Rate Limiting**: Proteção APIs sensíveis
- **Token Expiration**: Renovação automática sessões

### 📁 Upload de Arquivos

- **nginx Proxy**: Serve arquivos fora do Node.js
- **Validação Tipo**: Apenas imagens permitidas
- **Path Sanitization**: Previne directory traversal
- **Size Limits**: Controle tamanho máximo
- **Security Headers**: X-Content-Type-Options, etc.

### 🛡️ Validação & Sanitização

- **Client + Server**: Dupla validação formulários
- **Input Sanitization**: Proteção XSS
- **SQL Injection**: Drizzle ORM proteção automática
- **Type Safety**: TypeScript strict mode
- **Error Boundaries**: Tratamento erros graceful

## CONFIGURAÇÕES CRÍTICAS

### 🔧 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/silo

# Authentication
AUTH_SECRET=32-char-secret-key
GOOGLE_CLIENT_ID=oauth-client-id
GOOGLE_CLIENT_SECRET=oauth-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email@gmail.com
EMAIL_PASS=app-password
EMAIL_FROM="SILO <email@gmail.com>"

# Upload
UPLOAD_DIR=/var/uploads/silo
NGINX_UPLOAD_URL=https://uploads.silo.inpe.br
```

### 📦 Scripts Package.json

```json
{
	"dev": "next dev --turbopack",
	"build": "next build",
	"start": "next start",
	"lint": "next lint",
	"db:studio": "drizzle-kit studio",
	"db:push": "drizzle-kit push",
	"db:generate": "drizzle-kit generate",
	"db:migrate": "drizzle-kit migrate",
	"db:seed": "npx tsx src/lib/db/seed.ts"
}
```

### ⚙️ Drizzle Configuration

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

### 🔗 Next.js Configuration

```typescript
// next.config.ts
const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com', // Google avatars
			},
		],
	},
}
```

## PADRÕES ESTABELECIDOS

### 📥 Imports

```typescript
// ✅ SEMPRE usar alias @/ para imports internos
import { Button } from '@/components/ui/Button'
import { getAuthUser } from '@/lib/auth/token'

// ❌ NUNCA usar caminhos relativos para módulos internos
// import { Button } from '../../../components/ui/Button'
```

### 🚨 Error Handling

```typescript
// ✅ Padrão response APIs
return Response.json({
	success: false,
	error: 'mensagem erro',
	field: 'campo-especifico', // opcional
})

// ✅ Logs padronizados (APENAS estes 4 emojis)
console.log('✅ Operação realizada com sucesso')
console.error('❌ Erro crítico ocorrido')
console.warn('⚠️ Aviso importante')
console.info('ℹ️ Informação relevante')
```

### 🧩 Componentes UI

```typescript
// ✅ Padrão props componentes
interface ComponentProps extends HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary'
  isInvalid?: boolean
  className?: string
}

// ✅ Forwarded refs quando necessário
const Component = forwardRef<HTMLElement, ComponentProps>(...)
```

### 🎨 CSS Classes

```typescript
// ✅ Esquema cores zinc padronizado
'text-zinc-700 dark:text-zinc-200' // textos
'bg-zinc-100 dark:bg-zinc-800' // backgrounds
'border-zinc-200 dark:border-zinc-700' // bordas
'hover:bg-zinc-50 dark:hover:bg-zinc-700' // hover states
```

## PERFORMANCE OPTIMIZATIONS

### 💾 Database

- **Connection Pool**: Reutilização conexões PostgreSQL
- **Indexes Automáticos**: FK e unique constraints
- **Pagination Eficiente**: LIMIT/OFFSET queries
- **Joins Otimizados**: Relacionamentos carregados efficiently
- **Query Planning**: PostgreSQL query optimizer

### 🌐 Frontend

- **Server Components**: Padrão Next.js 15
- **Client Components**: Apenas onde necessária interatividade
- **Bundle Splitting**: Code splitting automático
- **Image Optimization**: Next.js Image component
- **Static Generation**: Pages estáticas quando possível

### 📁 Static Assets

- **nginx Serving**: Arquivos servidos diretamente pelo nginx
- **Cache Headers**: expires 30d para uploads
- **Compression**: gzip automático
- **CDN Ready**: Headers otimizados para CDN
- **Bandwidth Reduction**: Reduz carga Node.js

## DEPLOYMENT REQUIREMENTS

### 🖥️ Production Environment

- **PostgreSQL 12+**: Database servidor
- **Node.js 18+**: Runtime aplicação
- **nginx**: Proxy reverso + static files
- **SSL Certificate**: HTTPS obrigatório
- **Disk Space**: Mínimo 10GB para uploads

### 🔧 Environment Setup

```bash
# Database setup
createdb silo
createuser silo_user
psql -c "GRANT ALL PRIVILEGES ON DATABASE silo TO silo_user;"

# Upload directory
mkdir -p /var/uploads/silo
chown www-data:www-data /var/uploads/silo
chmod 755 /var/uploads/silo

# nginx configuration
ln -s /etc/nginx/sites-available/silo-uploads /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 🚀 Deploy Commands

```bash
# Application
git pull origin main
npm ci --production
npm run build
pm2 restart silo

# Database
npm run db:push  # Aplicar schema changes
npm run db:seed  # Popular dados iniciais (dev only)
```

## MONITORING & OBSERVABILITY

### 🏥 Health Checks

- **Database**: `npm run db:test-connection`
- **Upload nginx**: `curl uploads.silo.inpe.br/health`
- **Application**: `/api/health` (se implementado)

### 📊 Logs Structure

```typescript
// ✅ Structured logging
console.log('✅ User logged in', { userId, email, ip })
console.error('❌ Database connection failed', { error: error.message })
console.warn('⚠️ Rate limit exceeded', { email, route, count })
console.info('ℹ️ File uploaded', { filename, size, userId })
```

### 📈 Metrics Tracking

- **Database**: Connection pool usage, query times
- **Upload**: Disk space, file counts
- **Application**: Response times, error rates
- **Security**: Failed auth attempts, rate limits hit
- **User Activity**: Session counts, feature usage

## MIGRATION HISTORY

### 🔄 SQLite → PostgreSQL (Completa)

- **Schema Types**: Migrados para tipos nativos PostgreSQL
- **Relationships**: Self-references otimizadas
- **Connection**: Pool substituindo single connection
- **Performance**: 10x melhoria queries complexas
- **Scalability**: Suporte milhões registros

### 📁 Upload interno → nginx (Completa)

- **External Storage**: Movido para `/var/uploads/silo/`
- **Performance**: 10x melhoria serving arquivos
- **Security**: Validação nginx + bloqueio executáveis
- **Cache**: Headers otimizados CDN

## PRÓXIMAS IMPLEMENTAÇÕES

### 🚧 Sistema de Grupos (Prioridade ALTA)

```typescript
// Schema pendente
group(id, name, description, permissions, createdAt)
user_group(userId, groupId, role, createdAt)
product_group_access(productId, groupId, accessLevel)
```

### 🔔 Notificações Tempo Real (Prioridade MÉDIA)

```typescript
// WebSockets ou SSE
notification(id, userId, type, title, content, read, createdAt)
notification_settings(userId, emailEnabled, pushEnabled, types)
```

### 📊 Analytics Avançados (Prioridade MÉDIA)

```typescript
// Tracking events
user_activity(id, userId, action, metadata, createdAt)
problem_resolution_time(problemId, resolvedAt, timeToResolve)
```

## TROUBLESHOOTING GUIDE

### 🚨 Erros Comuns

#### Database Connection Error

```bash
# Verificar PostgreSQL running
sudo systemctl status postgresql

# Testar conexão manualmente
npm run db:test-connection

# Recriar schema força
npm run db:push --force
```

#### Upload Files Error

```bash
# Verificar diretório exists
ls -la /var/uploads/silo/

# Verificar permissões
sudo chown -R www-data:www-data /var/uploads/silo/

# Testar nginx uploads endpoint
curl -I uploads.silo.inpe.br/health
```

#### Build/Deploy Error

```bash
# Verificar TypeScript
npm run lint

# Limpar build cache
rm -rf .next node_modules
npm install
npm run build

# Verificar env variables
echo $DATABASE_URL | grep -o '^[^:]*'
```

#### Authentication Error

```bash
# Verificar sessões database
psql -c "SELECT COUNT(*) FROM auth_session;"

# Limpar sessões expired
psql -c "DELETE FROM auth_session WHERE expires_at < NOW();"

# Verificar cookies browser
# DevTools > Application > Cookies > session_token
```

Este é o índice técnico completo do projeto Silo, mantido atualizado com todas as implementações e decisões arquiteturais.
