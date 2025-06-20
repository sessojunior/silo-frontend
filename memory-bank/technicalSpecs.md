# Tech Context - Silo

## 🎯 STACK TECNOLÓGICO PRINCIPAL

- **Framework**: Next.js 15 (App Router) + React 19
- **Linguagem**: TypeScript (strict mode)
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS + Design System customizado
- **Drag & Drop**: @dnd-kit/core (Sistema Kanban)
- **Autenticação**: JWT + OAuth Google
- **Upload**: nginx externo para performance
- **Charts**: ApexCharts para dashboard

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
- **🆕 Design System Padronizado**: Padrão estabelecido para páginas admin

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

## 🏗️ ARQUITETURA SISTEMA DE PROJETOS - KANBAN

### 📊 Estrutura Hierárquica de Dados

```
PROJETO (project)
├── ATIVIDADES (project_activity)
│   ├── TAREFAS (project_task)
│   └── KANBAN (project_kanban) - UM POR ATIVIDADE
│       └── columns: JSON Array
│           ├── name, type, is_visible, color, icon
│           ├── limit_wip, block_wip_reached
│           └── tasks: [{ project_task_id, subcolumn, order }]
```

### 🎯 Navegação e Rotas

- **Lista Projetos**: `/admin/projects`
- **Projeto Individual**: `/admin/projects/[projectId]` (lista atividades)
- **Kanban por Atividade**: `/admin/projects/[projectId]/activities/[activityId]`

### 📋 Tabela project_kanban (Estrutura JSON)

```typescript
interface ProjectKanban {
	id: string
	project_id: string
	project_activity_id: string
	columns: Array<{
		name: string // 'A Fazer', 'Em Progresso', etc.
		type: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
		is_visible: boolean
		color: 'gray' | 'blue' | 'red' | 'amber' | 'emerald'
		icon: string // 'icon-[lucide--...]'
		limit_wip: number | null // Limite WIP
		block_wip_reached: boolean // Bloquear quando atingir limite
		tasks: Array<{
			project_task_id: string
			subcolumn: 'in_progress' | 'done' // Subcoluna dentro da coluna
			order: number // Ordem dentro da subcoluna
		}>
	}>
}
```

### 🔄 Sincronização de Status

**REGRA CRÍTICA**: `project_task.status` DEVE estar sincronizado com `project_kanban.columns.tasks.subcolumn`

- **project_kanban**: Fonte primária de verdade para posicionamento
- **project_task.status**: Fonte secundária sincronizada
- **Subcolunas**: 'Fazendo' (in_progress) e 'Feito' (done)

### 🎨 Sistema de Cores Kanban

```typescript
// Mapeamento estático Tailwind (não interpolação dinâmica)
const colorClasses = {
  gray: { border: 'border-stone-200', headerBg: 'bg-stone-200', ... },
  blue: { border: 'border-blue-200', headerBg: 'bg-blue-200', ... },
  red: { border: 'border-red-200', headerBg: 'bg-red-200', ... },
  amber: { border: 'border-amber-200', headerBg: 'bg-amber-200', ... },
  emerald: { border: 'border-emerald-200', headerBg: 'bg-emerald-200', ... }
}
```

### 🔧 Drag & Drop (@dnd-kit)

```typescript
// Configuração sensores
const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 3 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

// Ordenação por kanbanOrder
tasks.sort((a, b) => {
	const orderA = a.kanbanOrder || 0
	const orderB = b.kanbanOrder || 0
	return orderA - orderB
})
```

### 📝 Interfaces TypeScript

```typescript
interface Activity {
  id: string
  projectId: string
  name: string
  description: string
  // ... outros campos específicos de atividade
}

interface Task {
  id: string
  projectId: string
  activityId: string  // Referência para atividade
  name: string
  status: 'todo_doing' | 'todo_done' | 'in_progress_doing' | ...
  kanbanOrder?: number  // Ordem no Kanban
  // ... outros campos específicos de tarefa
}
```

### 🚀 CHAT SYSTEM - ESPECIFICAÇÕES TÉCNICAS PLANEJADAS

#### **Real-time Communication**

- **WebSocket**: Comunicação bidirecional instantânea

  - Conexão global ativa em toda aplicação via Context
  - Reconexão automática com backoff exponencial
  - Heartbeat para detecção de conexão perdida
  - Autenticação via token na conexão WS

- **Server-Sent Events (SSE)**: Fallback para notificações

  - Unidirecional para notificações críticas
  - Funciona através de proxies/firewalls corporativos
  - Auto-reconexão nativa do browser

- **Hybrid Approach**: WebSocket + SSE para máxima confiabilidade
  - WebSocket para chat ativo (baixa latência)
  - SSE para notificações globais (alta compatibilidade)

#### **Context Global Pattern**

```typescript
// Arquitetura ChatProvider
export const ChatProvider: React.FC = ({ children }) => {
	const [notifications, setNotifications] = useState<ChatNotification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [isConnected, setIsConnected] = useState(false)
	const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

	const wsRef = useRef<WebSocket | null>(null)

	// Conectar WebSocket global na montagem
	useEffect(() => {
		connectChat()
		return () => disconnectChat()
	}, [])

	// Handlers de tempo real
	const handleGlobalChatUpdate = (data: RealTimeUpdate) => {
		switch (data.type) {
			case 'new_message':
				handleNewMessageNotification(data.payload)
			case 'mention':
				handleMentionNotification(data.payload)
			case 'user_online':
				handleUserOnlineUpdate(data.payload)
		}
	}
}

// Hook de consumo
export const useChat = () => {
	const context = useContext(ChatContext)
	if (!context) {
		throw new Error('useChat deve ser usado dentro de ChatProvider')
	}
	return context
}
```

#### **TopBar Integration Pattern**

```typescript
// Integração na TopBar existente
export default function TopBarWithNotifications() {
  const { notifications, unreadCount, markAsRead } = useChat()

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b">
      <div className="flex items-center justify-between px-6">
        {/* Conteúdo existente preservado */}

        {/* Botão notificações do chat */}
        <div className="relative">
          <Button className="relative w-10 h-10 p-0">
            <ActivityIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Dropdown notificações */}
          <ChatNotificationDropdown
            notifications={notifications}
            onMarkAsRead={markAsRead}
          />
        </div>
      </div>
    </header>
  )
}
```

#### **WhatsApp-like UI Patterns**

**Layout Hierárquico**:

```typescript
// Preservação sidebar projeto + sidebar chat
<div className="flex h-screen">
  <ProjectSidebar className="w-64" />  {/* Sidebar existente */}
  <div className="flex-1 flex">
    <ChatSidebar className="w-80" />   {/* Sidebar chat */}
    <ChatContent className="flex-1" /> {/* Área mensagens */}
  </div>
</div>
```

**Message Bubble Design**:

```typescript
// Bubbles estilo WhatsApp
<div className={`
  max-w-lg px-3 py-2 rounded-lg shadow-sm
  ${isOwnMessage
    ? 'bg-green-500 text-white ml-auto'
    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
  }
`}>
  <p className="whitespace-pre-wrap">{message.content}</p>

  {/* Status indicators */}
  <div className="flex items-center gap-1 mt-1 text-xs">
    <span>{formatTime(message.createdAt)}</span>
    {isOwnMessage && (
      <span className={getMessageStatusIcon(message.status)} />
    )}
  </div>
</div>
```

**Emoji Picker Pattern**:

```typescript
// Grid 8x8 emojis com busca
<div className="w-64 bg-white border rounded-lg shadow-lg p-3">
  <Input placeholder="Buscar emoji..." className="mb-3" />
  <div className="grid grid-cols-8 gap-1">
    {emojis.map((emoji) => (
      <button
        key={emoji}
        onClick={() => addEmoji(emoji)}
        className="w-8 h-8 text-lg hover:bg-zinc-100 rounded"
      >
        {emoji}
      </button>
    ))}
  </div>
</div>
```

#### **Database Optimization for Chat**

**Indices Estratégicos**:

```sql
-- Performance otimizada para chat
CREATE INDEX idx_chat_message_channel_created ON chat_message(channelId, createdAt DESC);
CREATE INDEX idx_chat_participant_user_channel ON chat_participant(userId, channelId);
CREATE INDEX idx_chat_channel_type_active ON chat_channel(type, isActive);
CREATE INDEX idx_chat_user_status_online ON chat_user_status(status, lastSeen);
```

**Query Patterns**:

```typescript
// Mensagens com paginação otimizada
const messages = await db
	.select()
	.from(chatMessage)
	.where(eq(chatMessage.channelId, channelId))
	.orderBy(desc(chatMessage.createdAt))
	.limit(50)
	.offset(page * 50)

// Contagem não lidas eficiente
const unreadCount = await db
	.select({ count: count() })
	.from(chatMessage)
	.innerJoin(chatParticipant, eq(chatMessage.channelId, chatParticipant.channelId))
	.where(and(eq(chatParticipant.userId, currentUserId), gt(chatMessage.createdAt, chatParticipant.lastReadAt)))
```

#### **Security & Authentication**

**WebSocket Authentication**:

```typescript
// Verificação token na conexão
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const token = searchParams.get('token')

	const user = await verifyAuthToken(token)
	if (!user) {
		return new Response('Unauthorized', { status: 401 })
	}

	// Upgrade para WebSocket apenas se autenticado
	const { socket, response } = Deno.upgradeWebSocket(request)

	socket.onopen = () => {
		globalConnections.set(user.id, socket)
		sendInitialState(socket, user.id)
	}

	return response
}
```

**Permission-based Messaging**:

```typescript
// Validação permissões por canal
async function canUserSendMessage(userId: string, channelId: string) {
	const participant = await db
		.select()
		.from(chatParticipant)
		.where(and(eq(chatParticipant.userId, userId), eq(chatParticipant.channelId, channelId), eq(chatParticipant.canWrite, true)))
		.limit(1)

	return participant.length > 0
}
```

### Desenvolvimento e Qualidade

- **ESLint 9**: Linting com regras Next.js
- **Prettier 3.5.3**: Formatação de código
- **Simple Import Sort**: Organização de imports
- **🆕 Build 100% Funcional**: Zero erros TypeScript/ESLint
- **🆕 next/image**: Migração completa do OptimizedImage

## ✅ CORREÇÕES CRÍTICAS DE BUILD - JUNHO 2025

### 🎯 MIGRAÇÃO OPTIMIZEDIMAGE → NEXT/IMAGE

**PROBLEMA RESOLVIDO**: OptimizedImage causando conflitos de tipos e warnings

**SOLUÇÃO IMPLEMENTADA**:

```typescript
// ❌ ANTES (OptimizedImage)
<OptimizedImage
  src={imageSrc}
  alt="Descrição"
  objectFit="cover"
  fallback="/placeholder.png"
/>

// ✅ DEPOIS (next/image)
<Image
  src={imageSrc}
  alt="Descrição"
  width={200}
  height={128}
  style={{ objectFit: 'cover' }}
  unoptimized={imageSrc.startsWith('blob:')}
/>
```

**PADRÕES OBRIGATÓRIOS**:

- ✅ **Props obrigatórias**: width, height sempre especificadas
- ✅ **objectFit via style**: `style={{ objectFit: 'cover' }}`
- ✅ **Blob URLs**: `unoptimized={true}` para URLs temporárias
- ✅ **Sem fallback**: Propriedade removida (não suportada)

### 🔧 CORREÇÃO POPOVER - CONFLITO REACTPORTAL

**PROBLEMA RESOLVIDO**: Erro "ReactPortal & string" incompatível

**SOLUÇÃO IMPLEMENTADA**:

```typescript
// ✅ Interface simplificada
interface PopoverProps {
	children: React.ReactNode
	content: React.ReactNode
	position?: Position
	className?: string
	onClick?: () => void
}

// ✅ Sem HTMLAttributes problemáticos
// ✅ React.ReactNode explícito
// ✅ Props customizadas apenas
```

### 📦 CORREÇÃO IMPORTAÇÕES DE TIPOS

**PROBLEMA RESOLVIDO**: Tipos importados de arquivos incorretos

**CORREÇÕES APLICADAS**:

```typescript
// ❌ ANTES
import { SidebarBlockProps } from '@/app/admin/layout'
import { SidebarMenuProps } from '@/app/admin/layout'
import { AccountProps } from '@/app/admin/layout'

// ✅ DEPOIS
import { SidebarBlockProps, SidebarMenuProps } from '@/components/admin/sidebar/Sidebar'
import { AccountProps } from '@/components/admin/topbar/Topbar'
```

## 🚀 PADRÕES TÉCNICOS OBRIGATÓRIOS

### 🎨 PADRÃO DE DESIGN ADMIN - OBRIGATÓRIO

**REGRA CRÍTICA**: Todas as páginas admin DEVEM seguir este padrão exato:

```typescript
<div className='w-full'>
  {/* Cabeçalho fixo */}
  <div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
    <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
      Título da Página
    </h1>
    <p className='text-zinc-600 dark:text-zinc-400'>
      Descrição da página
    </p>
  </div>

  {/* Conteúdo com scroll natural */}
  <div className='p-6'>
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Seção Ações e Filtros */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Input>
            <Search className='w-4 h-4' />
          </Input>
          <Select>
            {/* Filtros */}
          </Select>
        </div>
        <Button onClick={handleAction}>
          {/* Ação Principal */}
        </Button>
      </div>

      {/* Seção Estatísticas (3 cards) */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Cards de estatísticas */}
      </div>

      {/* Seção Lista/Tabela principal */}
      <div className='bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700'>
        {/* Conteúdo principal */}
      </div>
    </div>
  </div>
</div>
```

**🚨 REGRAS CRÍTICAS**:

- ✅ **SEMPRE usar**: `w-full` para container principal
- ❌ **NUNCA usar**: `h-screen overflow-hidden` com `flex-1 overflow-auto`
- ✅ **Scroll natural**: Deixar o browser gerenciar o scroll
- ✅ **Responsividade**: Mobile-first com breakpoints consistentes

### 📱 COMPONENTES PADRÃO OBRIGATÓRIOS

**Busca em Tempo Real**:

```typescript
<Input
  placeholder="Buscar..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="min-w-[300px]"
>
  <Search className="w-4 h-4" />
</Input>
```

**Cards de Estatísticas**:

```typescript
<div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Título</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{valor}</p>
    </div>
    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
      <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    </div>
  </div>
</div>
```

**Botões de Ação Padronizados**:

```typescript
// Botão Editar (azul)
<Button size="sm" className="bg-blue-600 hover:bg-blue-700">
  <Edit className="w-4 h-4" />
</Button>

// Botão Excluir (vermelho)
<Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
  <Trash className="w-4 h-4" />
</Button>
```

### 📊 Otimização de APIs - Padrões Obrigatórios

**PRINCÍPIO FUNDAMENTAL**: Sempre consolidar múltiplas chamadas relacionadas em APIs únicas otimizadas.

#### 🎯 Padrões de Query SQL Otimizada

**1. APIs de Summary/Agregação**:

```typescript
// ✅ PADRÃO: JOIN otimizado para dados relacionados
const result = await db
	.select({
		totalSolutions: count(productSolution.id),
		lastUpdated: max(productSolution.updatedAt),
	})
	.from(product)
	.leftJoin(productProblem, eq(product.id, productProblem.productId))
	.leftJoin(productSolution, eq(productProblem.id, productSolution.problemId))
	.where(eq(product.slug, productSlug))
	.groupBy(product.id)
```

**2. APIs de Contagem em Lote**:

```typescript
// ✅ PADRÃO: GROUP BY para múltiplos IDs
const result = await db
	.select({
		problemId: productSolution.problemId,
		count: count(productSolution.id),
	})
	.from(productSolution)
	.where(inArray(productSolution.problemId, problemIds))
	.groupBy(productSolution.problemId)
```

#### 🛡️ Padrões de Segurança e Qualidade

**OBRIGATÓRIO antes de qualquer otimização**:

1. **Backup**: Criar backup da página/API original
2. **Build Test**: Validar compilação após mudanças
3. **Funcionalidade**: Confirmar zero regressões
4. **Performance**: Medir impacto real das otimizações

#### 📈 Métricas de Sucesso

**Indicadores de otimização bem-sucedida**:

- **Redução de Chamadas**: 90%+ menos requisições
- **Latência**: Redução significativa no tempo de resposta
- **Escalabilidade**: Queries preparadas para produção
- **Manutenibilidade**: Código limpo e documentado

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
DATABASE_URL="postgresql://user:password@localhost:5432/silo"

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
DATABASE_URL="postgresql://silo_user:strong_password@postgres-server:5432/silo"

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
<Markdown value={value} onChange={setValue} preview='edit' data-color-mode={theme} />
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
