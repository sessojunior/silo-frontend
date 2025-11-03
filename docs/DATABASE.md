# 🗄️ Banco de Dados e Arquitetura

Documentação completa sobre o schema do banco de dados, relacionamentos e estrutura.

---

## 📋 **ÍNDICE**

1. [Visão Geral](#-visão-geral)
2. [Módulos e Tabelas](#-módulos-e-tabelas)
3. [Schema Completo](#-schema-completo)
4. [Relacionamentos](#-relacionamentos)
5. [Migrações](#-migrações)
6. [Boas Práticas](#-boas-práticas)
7. [Seed Data](#-seed-data)

---

## 🎯 **VISÃO GERAL**

O **Silo** utiliza **PostgreSQL** com **Drizzle ORM** para gerenciamento do banco de dados.

- **Database:** PostgreSQL
- **ORM:** Drizzle ORM 0.43.1
- **Schema:** `src/lib/db/schema.ts`
- **Total de Tabelas:** 25
- **Módulos:** 8 principais

---

## 📦 **MÓDULOS E TABELAS**

| Módulo | Tabelas | Descrição |
|--------|---------|-----------|
| **Autenticação** | 5 | Usuários, sessões, códigos OTP, provedores OAuth, rate limiting |
| **Perfis** | 2 | Perfis e preferências dos usuários |
| **Grupos** | 2 | Grupos e relacionamento many-to-many com usuários |
| **Produtos** | 11 | Produtos, problemas, soluções, dependências, contatos, manuais, atividades |
| **Chat** | 2 | Mensagens e presença de usuários |
| **Projetos** | 5 | Projetos, atividades, tarefas, usuários e histórico |
| **Ajuda** | 1 | Documentação do sistema |
| **Contatos** | 1 | Base de contatos globais |

---

## 📊 **SCHEMA COMPLETO**

### **Autenticação**

#### `auth_user`

```typescript
{
  id: text (PK),
  name: text,
  email: text (UK),
  emailVerified: boolean,
  password: text,
  image: text,
  isActive: boolean,
  lastLogin: timestamp,
  createdAt: timestamp
}
```

#### `auth_session`

```typescript
{
  id: text (PK),
  userId: text (FK → auth_user),
  token: text,
  expiresAt: timestamp
}
```

#### `auth_code`

```typescript
{
  id: text (PK),
  userId: text (FK → auth_user),
  code: text,
  email: text,
  expiresAt: timestamp
}
```

#### `auth_provider`

```typescript
{
  id: text (PK),
  userId: text (FK → auth_user),
  googleId: text
}
```

#### `rate_limit`

```typescript
{
  id: text (PK),
  route: text,
  email: text,
  ip: text,
  count: integer,
  lastRequest: timestamp
}
Constraint: unique(email, ip, route)
```

### **Perfis**

#### `user_profile`

```typescript
{
  id: text (PK),
  userId: text (FK → auth_user),
  genre: text,
  phone: text,
  role: text,
  team: text,
  company: text,
  location: text
}
```

#### `user_preferences`

```typescript
{
  id: text (PK),
  userId: text (FK → auth_user),
  chatEnabled: boolean
}
```

### **Grupos**

#### `group`

```typescript
{
  id: text (PK),
  name: text (UK),
  description: text,
  icon: text,
  color: text,
  role: text,
  active: boolean,
  isDefault: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `user_group`

```typescript
{
  id: uuid (PK),
  userId: text (FK → auth_user),
  groupId: text (FK → group),
  role: text,
  joinedAt: timestamp,
  createdAt: timestamp
}
Constraint: unique(userId, groupId)
```

### **Produtos**

#### `product`

```typescript
{
  id: text (PK),
  name: text,
  slug: text (UK),
  available: boolean,
  priority: text,
  turns: jsonb,
  description: text
}
```

#### `product_activity`

```typescript
{
  id: uuid (PK),
  productId: text (FK → product),
  userId: text (FK → auth_user),
  date: date,
  turn: integer,
  status: text,
  problemCategoryId: text (FK → product_problem_category),
  description: text,
  createdAt: timestamp,
  updatedAt: timestamp
}
Constraint: unique(productId, date, turn)
```

#### `product_activity_history`

```typescript
{
  id: uuid (PK),
  productActivityId: uuid (FK → product_activity),
  userId: text (FK → auth_user),
  status: text,
  description: text,
  createdAt: timestamp
}
```

#### `product_problem_category`

```typescript
{
  id: text (PK),
  name: text (UK),
  color: text,
  isSystem: boolean,
  sortOrder: integer,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `product_problem`

```typescript
{
  id: text (PK),
  productId: text (FK → product),
  userId: text (FK → auth_user),
  title: text,
  description: text,
  problemCategoryId: text (FK → product_problem_category),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `product_problem_image`

```typescript
{
  id: text (PK),
  productProblemId: text (FK → product_problem),
  image: text,
  description: text
}
```

#### `product_solution`

```typescript
{
  id: text (PK),
  userId: text (FK → auth_user),
  productProblemId: text (FK → product_problem),
  description: text,
  replyId: text (FK → product_solution),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `product_solution_checked`

```typescript
{
  id: text (PK),
  userId: text (FK → auth_user),
  productSolutionId: text (FK → product_solution)
}
```

#### `product_dependency`

```typescript
{
  id: text (PK),
  productId: text (FK → product),
  name: text,
  icon: text,
  description: text,
  parentId: text (FK → product_dependency),
  treePath: text,
  treeDepth: integer,
  sortKey: text,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `product_manual`

```typescript
{
  id: text (PK),
  productId: text (FK → product),
  description: text,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `product_contact`

```typescript
{
  id: text (PK),
  productId: text (FK → product),
  contactId: text (FK → contact),
  createdAt: timestamp
}
```

### **Contatos**

#### `contact`

```typescript
{
  id: text (PK),
  name: text,
  role: text,
  team: text,
  email: text (UK),
  phone: text,
  image: text,
  active: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Chat**

#### `chat_message`

```typescript
{
  id: uuid (PK),
  content: text,
  senderUserId: text (FK → auth_user),
  receiverGroupId: text (FK → group) (NULL ou válido),
  receiverUserId: text (FK → auth_user) (NULL ou válido),
  readAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: timestamp
}
Constraint: receiverGroupId OU receiverUserId (nunca ambos)
```

#### `chat_user_presence`

```typescript
{
  userId: text (PK-FK → auth_user),
  status: text,
  lastActivity: timestamp,
  updatedAt: timestamp
}
```

### **Projetos**

#### `project`

```typescript
{
  id: uuid (PK),
  name: text,
  shortDescription: text,
  description: text,
  startDate: date,
  endDate: date,
  priority: text,
  status: text,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `project_activity`

```typescript
{
  id: uuid (PK),
  projectId: uuid (FK → project),
  name: text,
  description: text,
  category: text,
  estimatedDays: integer,
  startDate: date,
  endDate: date,
  priority: text,
  status: text,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `project_task`

```typescript
{
  id: uuid (PK),
  projectId: uuid (FK → project),
  projectActivityId: uuid (FK → project_activity),
  name: text,
  description: text,
  category: text,
  estimatedDays: integer,
  startDate: date,
  endDate: date,
  priority: text,
  status: text,
  sort: integer,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `project_task_user`

```typescript
{
  id: uuid (PK),
  taskId: uuid (FK → project_task),
  userId: text (FK → auth_user),
  role: text,
  assignedAt: timestamp,
  createdAt: timestamp
}
Constraint: unique(taskId, userId)
```

#### `project_task_history`

```typescript
{
  id: uuid (PK),
  taskId: uuid (FK → project_task),
  userId: text (FK → auth_user),
  action: text,
  fromStatus: text,
  toStatus: text,
  fromSort: integer,
  toSort: integer,
  details: jsonb,
  createdAt: timestamp
}
```

### **Ajuda**

#### `help`

```typescript
{
  id: text (PK),
  description: text (Markdown),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🔗 **RELACIONAMENTOS**

### **Autenticação e Usuários**

```text
auth_user (1) → (N) user_profile
auth_user (1) → (N) user_preferences
auth_user (1) → (N) auth_session
auth_user (N) ↔ (N) group via user_group
```

### **Produtos**

```text
product (1) → (N) product_activity
product (1) → (N) product_problem
product (1) → (N) product_dependency
product (1) → (1) product_manual
product (N) ↔ (N) contact via product_contact

product_problem (1) → (N) product_solution
product_problem (1) → (N) product_problem_image
product_solution (1) → (N) product_solution_image
```

### **Projetos e Kanban**

```text
project (1) → (N) project_activity → (N) project_task
project_task (N) ↔ (N) auth_user via project_task_user
project_task (1) → (N) project_task_history
```

### **Chat**

```text
chat_message (N) → (1) auth_user (sender)
chat_message (N) → (1) group (grupo) OU auth_user (DM)
```

---

## 🔄 **MIGRAÇÕES**

### **Comandos Drizzle**

```bash
# Gerar migração a partir do schema
npm run db:generate

# Aplicar migrações no banco
npm run db:migrate

# Visualizar banco de dados (GUI)
npm run db:studio

# Push direto do schema (desenvolvimento)
npm run db:push
```

### **Arquivos de Migração**

Localizados em `/drizzle/` com versionamento automático:

```text
drizzle/
├── 0000_pale_red_skull.sql
├── 0001_low_kitty_pryde.sql
└── meta/
    ├── _journal.json
    ├── 0000_snapshot.json
    └── 0001_snapshot.json
```

---

## ✅ **BOAS PRÁTICAS**

### **1. Índices Otimizados**

Todas as FK têm índices para performance:

```typescript
export const sessions = pgTable('auth_session', {
  userId: text('user_id').notNull().references(() => users.id, {
    onDelete: 'cascade'
  }).index()
})
```

### **2. Constraints Únicos**

Previnem duplicações:

```typescript
// Email único
email: text('email').notNull().unique()

// Dupla constraint
constraint uniqueProductActivity = unique(
  productActivity.productId,
  productActivity.date,
  productActivity.turn
)
```

### **3. Soft Delete**

Campo `deletedAt` onde necessário:

```typescript
deletedAt: timestamp('deleted_at')

// Query ignorando deletados
.where(isNull(chatMessages.deletedAt))
```

### **4. Timestamps**

Criado e atualizado em todas as tabelas principais:

```typescript
createdAt: timestamp('created_at').defaultNow(),
updatedAt: timestamp('updated_at').defaultNow()
```

### **5. Cascade Delete**

Relacionamentos com `onDelete: 'cascade'`:

```typescript
userId: text('user_id')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' })
```

### **6. Tipagem TypeScript**

Types gerados automaticamente:

```typescript
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>
```

### **7. JSONB para Dados Flexíveis**

Campos complexos como JSONB:

```typescript
turns: jsonb('turns').$type<{
  morning: boolean
  afternoon: boolean
  night: boolean
}>()

details: jsonb('details').$type<Record<string, unknown>>()
```

### **8. UUID para Alta Concorrência**

IDs onde há muitas inserções concorrentes:

```typescript
id: uuid('id').defaultRandom().primaryKey()
```

---

## 🌱 **SEED DATA**

### **Grupos Padrão**

```typescript
const defaultGroups = [
  { id: 'admins', name: 'Administradores', icon: 'shield', color: 'red' },
  { id: 'meteorologists', name: 'Meteorologistas', icon: 'cloud', color: 'blue' },
  { id: 'analysts', name: 'Analistas', icon: 'users', color: 'green' },
  { id: 'developers', name: 'Desenvolvedores', icon: 'code', color: 'purple' },
  { id: 'support', name: 'Suporte', icon: 'headphones', color: 'orange' },
  { id: 'visitors', name: 'Visitantes', icon: 'eye', color: 'gray' }
]
```

### **Categorias de Problemas Padrão**

```typescript
const defaultCategories = [
  { id: 'network', name: 'Rede', color: 'red' },
  { id: 'hardware', name: 'Hardware', color: 'orange' },
  { id: 'software', name: 'Software', color: 'blue' },
  { id: 'data', name: 'Dados', color: 'green' }
]
```

### **Executar Seed**

```bash
npm run db:seed
```

---

## 📊 **Estrutura Híbrida de Dependências**

O campo `product_dependency` usa 3 técnicas combinadas:

1. **Adjacency List:** `parentId` - Hierarquia direta
2. **Path Enumeration:** `treePath` - Caminho completo
3. **Nested Sets:** `sortKey` - Ordenação eficiente

**Exemplo:**

```
product_dependency
├── Server (parentId: null, treePath: '1', sortKey: '001')
│   ├── Web Server (parentId: 'server', treePath: '1.1', sortKey: '001.001')
│   └── DB Server (parentId: 'server', treePath: '1.2', sortKey: '001.002')
└── Network (parentId: null, treePath: '2', sortKey: '002')
```

**Benefícios:**

- Query rápida com Path Enumeration
- Ordenação eficiente com Nested Sets
- Inserção simples com Adjacency List

---

**🎯 Schema completo em: `src/lib/db/schema.ts`**
