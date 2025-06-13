# Project Structure - Silo

## ARQUITETURA GERAL

### Stack Tecnológico

- **Frontend**: Next.js 15 + React 19 + TypeScript (strict mode)
- **Backend**: Next.js API Routes + Drizzle ORM
- **Database**: PostgreSQL com connection pooling
- **Upload**: nginx externo para performance
- **UI**: Tailwind CSS + Design System customizado
- **Auth**: Sistema próprio (email/senha, OTP, Google OAuth)

### Padrões Arquiteturais

- **App Router**: Next.js 15 Server Components
- **Monorepo**: Frontend + Backend unificado
- **Type Safety**: TypeScript strict em todo código
- **API-First**: RESTful endpoints bem definidos

## ESTRUTURA DE ARQUIVOS

### `/src/app` - Next.js App Router

```
/app
├── (auth)/              # Grupo de rotas autenticação
│   ├── layout.tsx       # Layout específico auth
│   ├── login/           # Login email/senha
│   ├── login-email/     # Login apenas email + OTP
│   ├── register/        # Registro usuários
│   ├── forget-password/ # Reset senha 4 etapas
│   └── login-google/    # OAuth Google callback
├── (site)/              # Grupo de rotas público
│   └── page.tsx         # Homepage pública
├── admin/               # Área administrativa
│   ├── layout.tsx       # Layout admin + auth guard
│   ├── dashboard/       # Dashboard principal
│   ├── products/[slug]/ # Produto específico
│   ├── profile/         # Perfil usuário
│   ├── settings/        # Configurações
│   └── welcome/         # Onboarding
└── api/                 # API Routes Backend
    ├── auth/            # Endpoints autenticação
    ├── products/        # CRUD produtos e dependências
    └── (user)/          # Endpoints perfil usuário
```

### `/src/components` - Componentes UI

```
/components
├── admin/               # Componentes específicos admin
│   ├── dashboard/       # Charts ApexCharts
│   ├── nav/             # Navegação e tabs
│   ├── sidebar/         # Menu lateral
│   └── topbar/          # Barra superior
├── auth/                # Componentes autenticação
└── ui/                  # Design System base
    ├── Button.tsx       # Botão universal
    ├── Input.tsx        # Input com validação
    ├── Dialog.tsx       # Modal dialogs
    ├── Offcanvas.tsx    # Painel lateral
    ├── Tree.tsx         # Componente árvore hierárquica
    ├── Accordion.tsx    # Accordion manual
    └── [25+ componentes]
```

### `/src/lib` - Bibliotecas Utilitárias

```
/lib
├── auth/                # Sistema autenticação
│   ├── session.ts       # Gestão sessões
│   ├── token.ts         # Validação tokens
│   ├── hash.ts          # Hashing senhas
│   ├── oauth.ts         # Google OAuth
│   └── validate.ts      # Validações input
├── db/                  # Database e schema
│   ├── index.ts         # Conexão PostgreSQL
│   ├── schema.ts        # Schema Drizzle ORM
│   ├── seed.ts          # Dados teste
│   └── clear-db.ts      # Limpar banco
└── [utilitários diversos]
```

## SCHEMA DATABASE

### Tabelas Principais

#### `auth_user` - Usuários

```sql
- id: string (PK)
- name: string
- email: string (unique)
- emailVerified: boolean
- password: string (hashed)
- createdAt: timestamp
```

#### `product` - Produtos Meteorológicos

```sql
- id: string (PK)
- name: string
- slug: string
- available: boolean
```

#### `product_dependency` - **DEPENDÊNCIAS SIMPLIFICADAS**

```sql
-- CAMPOS ESSENCIAIS
- id: string (PK)
- productId: string (FK)
- name: string              -- Nome/descrição (campo principal)
- icon: string              -- Ícone Lucide (opcional)
- description: string       -- Descrição detalhada (opcional)
- parentId: string          -- **CRÍTICO para hierarquia**

-- CAMPOS HÍBRIDOS (otimização)
- treePath: string          -- "/1/2/3" caminho completo
- treeDepth: integer        -- 0, 1, 2... profundidade
- sortKey: string           -- "001.002.003" ordenação
- createdAt/updatedAt: timestamp
```

**CAMPOS REMOVIDOS** (simplificação):

- ~~type~~ - Eliminado, `name` é suficiente
- ~~category~~ - Eliminado, hierarquia via `parentId`
- ~~url~~ - Eliminado, não necessário

#### `product_problem` - Problemas Reportados

```sql
- id: string (PK)
- productId: string (FK)
- userId: string (FK)
- title: string
- description: text
- createdAt/updatedAt: timestamp
```

#### `product_solution` - Soluções Threading

```sql
- id: string (PK)
- userId: string (FK)
- productProblemId: string (FK)
- description: text
- replyId: string (opcional, para threading)
- createdAt/updatedAt: timestamp
```

#### `product_manual_section` - Manual Seções

```sql
- id: string (PK)
- productId: string (FK)
- title: string
- description: string (opcional)
- order: integer
```

#### `product_manual_chapter` - Manual Capítulos

```sql
- id: string (PK)
- sectionId: string (FK)
- title: string
- content: text (markdown)
- order: integer
```

#### `product_contact` - Contatos Responsáveis

```sql
- id: string (PK)
- productId: string (FK)
- name: string
- role: string
- team: string
- email: string
- phone: string (opcional)
- image: string (foto perfil)
- order: integer
```

### Relacionamentos

- **1:N** - product → dependencies/problems/contacts/sections
- **Self-Referencing** - dependencies → parentId (árvore hierárquica)
- **Threading** - solutions → replyId (conversas aninhadas)
- **Auth** - user → problems/solutions (rastreabilidade)

## API ENDPOINTS

### Autenticação

- `POST /api/auth/login` - Login email/senha
- `POST /api/auth/login-email` - Login apenas email
- `POST /api/auth/register` - Registro
- `POST /api/auth/forget-password` - Reset senha
- `GET /api/auth/login-google` - OAuth Google

### Produtos

- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products` - Atualizar produto
- `DELETE /api/products` - Excluir produto

### Dependências - **API SIMPLIFICADA**

- `GET /api/products/dependencies?productId=X` - Árvore hierárquica
- `POST /api/products/dependencies` - Criar dependência
  - **Campos obrigatórios**: `productId`, `name`
  - **Campos opcionais**: `icon`, `description`, `parentId`
- `PUT /api/products/dependencies` - Atualizar (incluindo reordenação)
- `DELETE /api/products/dependencies?id=X` - Excluir (valida filhos)

### Base de Conhecimento

- `GET /api/products/manual?productId=X` - Manual estruturado
- `POST /api/products/manual` - Criar seção
- `PUT /api/products/manual` - Atualizar capítulo
- `GET /api/products/contacts?productId=X` - Lista contatos

### Problemas/Soluções

- `GET /api/products/problems?slug=X` - Problemas produto
- `POST /api/products/problems` - Criar problema
- `GET /api/products/solutions?problemId=X` - Soluções threading
- `POST /api/products/solutions` - Criar solução/resposta

## COMPONENTES HIERÁRQUICOS

### MenuBuilder - **IMPLEMENTADO COM DADOS REAIS**

```typescript
interface MenuBuilderProps {
  dependencies: ProductDependency[]
  onEdit: (item: ProductDependency) => void
  onDelete: (item: ProductDependency) => void
}

// Renderização recursiva com indentação visual
const renderItem = (item: ProductDependency, level: number = 0) => {
  const marginLeft = level * 32 // 32px por nível
  return (
    <div style={{ marginLeft: `${marginLeft}px` }}>
      {/* Item visual WordPress-style */}
      <div className="flex items-center gap-2 p-3 border rounded-lg">
        <GripVertical /> {/* Handle drag & drop */}
        <Icon name={item.icon} />
        <span>{item.name}</span>
        <Badge>L{level + 1}</Badge>
        <EditButton onClick={() => onEdit(item)} />
        <DeleteButton onClick={() => onDelete(item)} />
      </div>

      {/* Filhos recursivamente */}
      {item.children?.map(child => renderItem(child, level + 1))}
    </div>
  )
}
```

**STATUS ATUAL**: ✅ Exibindo dados reais, visual perfeito
**PRÓXIMO**: Implementar drag & drop HTML5 nativo

### Tree Component - Navegação Lateral

```typescript
export type TreeItemProps = {
  label: string
  url?: string
  icon?: string
  children?: TreeItemProps[]
  onClick?: () => void
}

// Usado na sidebar para navegação base conhecimento
<Tree item={treeItem} defaultOpen={false} activeUrl={currentUrl} />
```

### Accordion - Manual Produto

```typescript
export type Section = {
  id: string
  title: string
  description?: string
  chapters: Chapter[]
}

// Manual estruturado em seções/capítulos
<Accordion sections={manualSections} />
```

## FLUXOS DE DADOS

### Base de Conhecimento - Dependências

1. **GET** `/api/products/dependencies?productId=X`
2. **API** consulta PostgreSQL ordenado por `sortKey`
3. **buildTree()** constrói hierarquia usando `parentId`
4. **MenuBuilder** renderiza recursivamente com indentação
5. **Ações CRUD** via onEdit/onDelete callbacks

### Problemas/Soluções Threading

1. **GET** problemas produto específico
2. **Para cada problema**: buscar soluções threaded
3. **Renderizar** conversas aninhadas via `replyId`
4. **Upload imagens** para evidências
5. **Sistema verificação** (check/uncheck soluções)

### Manual Estruturado

1. **GET** seções produto via API
2. **Para cada seção**: buscar capítulos ordenados
3. **Accordion** expansível/colapsável
4. **Markdown** para edição capítulos
5. **Markdown preview** estilizado

## OTIMIZAÇÕES

### Performance Database

- **Indices**: sortKey, parentId, productId otimizados
- **Campos Híbridos**: treePath/treeDepth para consultas rápidas
- **Connection Pooling**: PostgreSQL pool connections
- **Query Optimization**: JOIN eliminados, queries O(log n)

### Frontend Performance

- **Server Components**: Next.js 15 renderização server
- **Code Splitting**: Dynamic imports componentes pesados
- **Image Optimization**: Next.js Image component
- **Caching**: Static files via nginx

### UX Otimizada

- **Loading States**: Skeleton loaders consistentes
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: Feedback imediato ações
- **Dark Mode**: Theme switching perfeito

## PADRÕES ESTABELECIDOS

### TypeScript Interfaces

```typescript
// Sempre interfaces exportadas
export interface ProductDependency {
	id: string
	name: string
	icon?: string
	description?: string
	parentId?: string | null
	treeDepth: number
	children?: ProductDependency[]
}
```

### Import Aliases

```typescript
// SEMPRE usar @ para imports internos
import { db } from '@/lib/db'
import Button from '@/components/ui/Button'
// NUNCA caminhos relativos para módulos internos
```

### Error Handling API

```typescript
// Padrão consistente todas APIs
return NextResponse.json({
  success: boolean,
  error?: string
}, { status: number })
```

### Logs Padronizados

```typescript
// APENAS estes 4 emojis permitidos
console.log('✅ Sucesso operação')
console.log('❌ Erro crítico')
console.log('⚠️ Aviso importante')
console.log('🔵 Informação debug')
```

## PRÓXIMAS IMPLEMENTAÇÕES

### 1. Drag & Drop Dependências (Prioridade ALTA)

- **HTML5 Drag & Drop**: Nativo browser (não @dnd-kit)
- **Reordenação**: Atualizar sortKey/treePath automaticamente
- **Visual Feedback**: Drag handles e drop zones
- **Mobile**: Touch gestures para dispositivos móveis

### 2. Sistema Grupos (Prioridade ALTA)

- **Schema**: Tabelas groups, user_groups, permissions
- **CRUD**: Interface gestão grupos organizacionais
- **Middleware**: Autorização baseada em grupos
- **UI**: Componentes seleção/gestão grupos

### 3. Notificações Real-time (Prioridade BAIXA)

- **WebSockets**: Server-Sent Events para push
- **Email**: SMTP para notificações críticas
- **Browser**: Push notifications API

## TESTING STRATEGY

### Dados de Teste

- **Usuário**: `sessojunior@gmail.com` / `#Admin123`
- **Produtos**: BAM, SMEC, BRAMS, WRF populados
- **Problemas**: 20 problemas por produto
- **Soluções**: 2-10 soluções por problema
- **Dependências**: Estrutura hierárquica 3-4 níveis

### Comandos Úteis

```bash
npm run db:studio    # Visualizar dados
npm run db:seed      # Repopular dados teste
npm run dev          # Servidor desenvolvimento
```

Este projeto structure representa o estado atual do Silo com schema simplificado e MenuBuilder funcional com dados reais.
