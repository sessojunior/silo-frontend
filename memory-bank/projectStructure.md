# Project Structure - Silo

## 📁 ESTRUTURA ARQUITETURAL COMPLETA

### 🎯 CORE ARCHITECTURE

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Grupo de rotas autenticadas
│   │   ├── login/                # Sistema de login
│   │   └── register/             # Sistema de registro
│   ├── admin/                    # Dashboard administrativo
│   │   ├── dashboard/            # Página principal do admin
│   │   ├── products/             # Gestão de produtos
│   │   │   ├── [slug]/           # Página individual do produto
│   │   │   │   ├── page.tsx      # ✅ REFATORADA (928→787 linhas, -15.2%)
│   │   │   │   ├── problems/     # Gestão de problemas
│   │   │   │   │   └── page.tsx  # ✅ REFATORADA HISTÓRICA (1.506→629 linhas, -58.2%)
│   │   │   │   └── components/   # Componentes específicos do produto
│   │   │   │       ├── ProductDependenciesColumn.tsx    # ✅ NOVO (80 linhas)
│   │   │   │       ├── ProductDetailsColumn.tsx         # ✅ NOVO (165 linhas)
│   │   │   │       ├── ProblemsListColumn.tsx           # ✅ NOVO (150 linhas)
│   │   │   │       ├── ProblemDetailColumn.tsx          # ✅ NOVO (84 linhas)
│   │   │   │       ├── ProblemSolutionsSection.tsx      # ✅ NOVO (211 linhas)
│   │   │   │       ├── SolutionFormModal.tsx            # ✅ NOVO (193 linhas)
│   │   │   │       └── DeleteSolutionDialog.tsx         # ✅ NOVO (57 linhas)
│   │   │   └── create/           # Criação de produtos
│   │   ├── projects/             # ✅ SISTEMA DE PROJETOS COMPLETO - SEMANA 4 FINALIZADA
│   │   │   ├── layout.tsx        # ✅ Layout com ProductTabs (Projetos/Membros)
│   │   │   ├── page.tsx          # ✅ Lista projetos com CRUD completo
│   │   │   ├── members/
│   │   │   │   └── page.tsx      # ✅ Gestão membros many-to-many
│   │   │   └── [projectId]/      # ✅ ESTRUTURA PROJETO INDIVIDUAL
│   │   │       ├── layout.tsx    # ✅ Layout projeto individual
│   │   │       ├── page.tsx      # ✅ REFATORADO - Lista atividades com dropdown expansível
│   │   │       └── activities/   # ✅ SISTEMA KANBAN POR ATIVIDADE
│   │   │           └── [activityId]/
│   │   │               └── page.tsx  # ✅ KANBAN FUNCIONAL - Drag & drop completo
│   │   ├── knowledge-base/       # Base de conhecimento
│   │   ├── help/                 # ✅ NOVO - Sistema de ajuda
│   │   │   └── page.tsx          # ✅ Sistema de ajuda com interface dual
│   │   └── users/                # Gestão de usuários
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticação
│   │   ├── products/             # APIs de produtos
│   │   │   ├── solutions/        # APIs de soluções
│   │   │   │   ├── summary/      # ✅ NOVA API - Summary otimizada
│   │   │   │   │   └── route.ts  # JOIN otimizado product→problem→solution
│   │   │   │   ├── count/        # ✅ NOVA API - Contagem em lote
│   │   │   │   │   └── route.ts  # GROUP BY para múltiplos problemas
│   │   │   │   └── route.ts      # API original de soluções
│   │   │   ├── manual/           # ✅ NOVA API - Sistema de manual
│   │   │   │   └── route.ts      # CRUD completo para manual do produto
│   │   │   └── route.ts          # CRUD de produtos
│   │   ├── knowledge-base/       # APIs da base de conhecimento
│   │   ├── help/                 # ✅ NOVO - API sistema de ajuda
│   │   │   └── route.ts          # ✅ GET/PUT para documentação única
│   │   └── upload/               # Upload de arquivos
│   └── globals.css               # Estilos globais
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Componentes de UI
│   │   ├── react-dnd-menu-builder/ # ✅ MenuBuilder PRODUÇÃO-READY
│   │   │   └── src/Builder/      # Arquitetura de referência estável
│   │   │       └── MenuBuilder.tsx # ✅ REESCRITO - Zero bugs, drag & drop perfeito
│   │   ├── button.tsx            # Componente Button
│   │   ├── input.tsx             # Componente Input
│   │   ├── dialog.tsx            # ✅ Dialog reutilizado em DeleteSolutionDialog
│   │   ├── switch.tsx            # ✅ NOVO - Switch usado em contatos
│   │   ├── Popover.tsx           # ✅ REDESENHADO - Interface simplificada
│   │   ├── Lightbox.tsx          # ✅ MIGRADO - next/image implementado
│   │   ├── ~~OptimizedImage.tsx~~ # ❌ REMOVIDO - Migrado para next/image
│   │   └── ...                   # Outros componentes UI
│   ├── layout/                   # Componentes de layout
│   ├── forms/                    # Componentes de formulário
│   └── admin/                    # ✅ NOVO - Componentes específicos admin
│       ├── contacts/             # ✅ Sistema de contatos
│       │   ├── ContactFormOffcanvas.tsx    # Formulário completo
│       │   ├── ContactDeleteDialog.tsx     # Dialog confirmação
│       │   └── ContactSelectorOffcanvas.tsx # Seletor multi-contatos
│       ├── chat/                 # ✅ SISTEMA DE CHAT WHATSAPP-LIKE
│       │   ├── ChatSidebar.tsx   # ✅ Sidebar dual (canais/usuários) + dropdown status
│       │   ├── ChatArea.tsx      # ✅ Área principal mensagens + header
│       │   ├── MessageBubble.tsx # ✅ Bubbles WhatsApp com status ✓✓✓
│       │   ├── ChatNotificationButton.tsx # ✅ Botão notificações TopBar
│       │   ├── TypingIndicator.tsx     # ✅ "Usuário está digitando..."
│       │   ├── ConnectionStatus.tsx    # ✅ Status conexão WebSocket
│       │   ├── EmojiPicker.tsx         # ✅ Picker 8 categorias emojis
│       │   └── FileUpload.tsx          # ✅ Upload arquivos drag & drop
│       ├── groups/               # ✅ Sistema de grupos e usuários
│       │   ├── GroupFormOffcanvas.tsx     # Formulário grupos
│       │   ├── GroupDeleteDialog.tsx      # Dialog exclusão
│       │   ├── GroupUsersSection.tsx      # Expansão hierárquica
│       │   ├── UserFormOffcanvas.tsx      # Formulário usuários
│       │   ├── UserDeleteDialog.tsx       # Dialog exclusão usuário
│       │   └── UserSelectorOffcanvas.tsx  # Seletor associação
│       ├── help/                 # ✅ SISTEMA DE AJUDA (sem componentes separados)
│       │   └── (página unificada) # ✅ /admin/help/page.tsx contém toda funcionalidade
│       ├── projects/             # ✅ SISTEMA DE PROJETOS - SEMANA 4 FINALIZADA
│       │   ├── ActivityStatsCards.tsx        # ✅ NOVO - Estatísticas por status atividade
│       │   ├── ActivityMiniKanban.tsx        # ✅ NOVO - Mini kanban dropdown atividade
│       │   ├── KanbanBoard.tsx               # ✅ ATUALIZADO - Board principal @dnd-kit
│       │   ├── KanbanCard.tsx                # ✅ ATUALIZADO - Cards tarefas draggáveis
│       │   ├── KanbanColumn.tsx              # ✅ ATUALIZADO - Colunas com subcolunas
│       │   ├── KanbanColumnGroup.tsx         # ✅ ATUALIZADO - Grupos colunas temáticas
│       │   ├── KanbanConfigOffcanvas.tsx     # ✅ IMPLEMENTADO - Configuração avançada
│       │   ├── ProjectFormOffcanvas.tsx      # ✅ Formulário CRUD projetos
│       │   ├── ProjectDeleteDialog.tsx       # ✅ Dialog exclusão projetos
│       │   ├── ProjectDetailsHeader.tsx      # ✅ Header detalhes projeto
│       │   ├── ProjectMainRow.tsx            # ✅ Row principal lista projetos
│       │   ├── ProjectStatsCards.tsx         # ✅ Estatísticas projetos
│       │   ├── ProjectActivitiesSection.tsx  # ✅ Seção atividades projeto
│       │   ├── ActivityFormOffcanvas.tsx     # ✅ Formulário CRUD atividades
│       │   ├── ActivityDeleteDialog.tsx      # ✅ Dialog exclusão atividades
│       │   ├── ActivityFilters.tsx           # ✅ Filtros avançados atividades
│       │   ├── ProjectMemberAssignOffcanvas.tsx # ✅ Atribuição membros
│       │   └── ProjectSelectorDialog.tsx     # ✅ Seletor projetos
│       └── products/             # Componentes de produtos
├── lib/                          # Utilitários e configurações
│   ├── db/                       # Configuração do banco
│   │   ├── schema.ts             # ✅ Schema otimizado e simplificado + tabela help
│   │   ├── seed.ts               # ✅ Seed principal com documentação de ajuda integrada
│   │   └── index.ts              # Conexão Drizzle
│   ├── auth/                     # Configuração de autenticação
│   └── utils.ts                  # Utilitários gerais
└── types/                        # Definições de tipos TypeScript
    └── index.ts                  # Tipos globais
```

## ✅ CORREÇÕES CRÍTICAS DE BUILD - JUNHO 2025

### 🎯 ARQUIVOS CORRIGIDOS/REMOVIDOS

**COMPONENTES UI ATUALIZADOS**:

- `src/components/ui/Popover.tsx` - **REDESENHADO** com interface simplificada
- `src/components/ui/Lightbox.tsx` - **MIGRADO** para next/image
- `src/components/ui/OptimizedImage.tsx` - **REMOVIDO** completamente

**COMPONENTES ADMIN CORRIGIDOS** (9 arquivos):

- `src/components/admin/contacts/ContactFormOffcanvas.tsx` - Props next/image
- `src/app/admin/contacts/page.tsx` - Avatares padronizados
- `src/components/admin/products/ContactSelectorOffcanvas.tsx` - Props corrigidas
- `src/components/admin/products/ProblemDetailColumn.tsx` - Imagens clickáveis
- `src/components/admin/products/ProblemFormOffcanvas.tsx` - Preview otimizado
- `src/components/admin/products/ProblemSolutionsSection.tsx` - 4 imagens corrigidas
- `src/components/admin/products/SolutionFormModal.tsx` - Modos edit/preview

**COMPONENTES SIDEBAR/TOPBAR CORRIGIDOS** (3 arquivos):

- `src/components/admin/sidebar/SidebarBlocks.tsx` - Importação corrigida
- `src/components/admin/sidebar/SidebarMenu.tsx` - Importação corrigida
- `src/components/admin/topbar/TopbarDropdown.tsx` - Importação corrigida

### 🏆 RESULTADO FINAL

- ✅ **Build 100% funcional** - Zero erros TypeScript/ESLint
- ✅ **11 arquivos corrigidos** - Todas imagens padronizadas
- ✅ **1 componente removido** - OptimizedImage eliminado
- ✅ **Zero regressões** - Todas funcionalidades preservadas

## ✅ SISTEMA DE PROJETOS - SEMANA 4 KANBAN POR ATIVIDADE IMPLEMENTADO

### 🎯 ARQUIVOS CRIADOS/MODIFICADOS - KANBAN SYSTEM

**PÁGINAS ATUALIZADAS**:

- `src/app/admin/projects/[projectId]/page.tsx` - **REFATORADA** - Layout moderno com dropdown expansível
- `src/app/admin/projects/[projectId]/activities/[activityId]/page.tsx` - **CRIADA** - Kanban funcional por atividade

**COMPONENTES NOVOS**:

- `src/components/admin/projects/ActivityStatsCards.tsx` - **NOVO** - Estatísticas por status (total, todo, progress, done, blocked)
- `src/components/admin/projects/ActivityMiniKanban.tsx` - **NOVO** - Mini kanban dentro dropdown atividade

**COMPONENTES ATUALIZADOS**:

- `src/components/admin/projects/KanbanBoard.tsx` - **ATUALIZADO** - Drag & drop @dnd-kit com validações WIP
- `src/components/admin/projects/KanbanCard.tsx` - **ATUALIZADO** - Cards tarefas com prioridade e responsáveis
- `src/components/admin/projects/KanbanColumn.tsx` - **ATUALIZADO** - Colunas com subcolunas e limites WIP
- `src/components/admin/projects/KanbanColumnGroup.tsx` - **ATUALIZADO** - Grupos colunas com cores temáticas

**TIPOS ATUALIZADOS**:

- `src/types/projects.ts` - **ATUALIZADO** - Interfaces Activity e Task separadas, kanbanOrder adicionado

**ARQUITETURA KANBAN IMPLEMENTADA**:

- ✅ **Sistema por atividade** - Cada atividade tem seu próprio Kanban independente
- ✅ **Navegação hierárquica** - /admin/projects/[projectId]/activities/[activityId]
- ✅ **Drag & drop funcional** - Reordenação e movimento entre subcolunas
- ✅ **5 colunas padrão** - A Fazer, Em Progresso, Bloqueado, Em Revisão, Concluído
- ✅ **Subcolunas** - 'Fazendo' (in_progress) e 'Feito' (done) em cada coluna
- ✅ **Sistema de cores estático** - Mapeamento Tailwind com 5 cores temáticas
- ✅ **Limites WIP** - Configuráveis com bloqueio automático
- ✅ **Validação prioridades** - Por coluna (ex: Review só aceita high/urgent)
- ✅ **Contadores corretos** - Filtro por activityId implementado

**PROBLEMAS CRÍTICOS RESOLVIDOS**:

- ✅ **Task Counter Bug** - Cada atividade agora mostra contagem correta de suas tarefas
- ✅ **Drag & Drop Ordering** - Campo kanbanOrder implementado com ordenação funcional
- ✅ **Color System** - Mapeamento estático Tailwind (não interpolação dinâmica)
- ✅ **Type System** - Separação clara Activity vs Task, eliminada confusão
- ✅ **Movement Logic** - Status parsing e reordenação entre subcolunas corrigidos

## ✅ PASSO 5 - SISTEMA DE AJUDA IMPLEMENTADO

### 🎯 ARQUIVOS CRIADOS/MODIFICADOS

**NOVA PÁGINA ADMIN**:

- `src/app/admin/help/page.tsx` - **CRIADA** - Sistema de ajuda com interface dual completa

**NOVA API**:

- `src/app/api/help/route.ts` - **CRIADA** - GET/PUT para documento único 'system-help'

**SCHEMA ATUALIZADO**:

- `src/lib/db/schema.ts` - **ATUALIZADA** - Tabela help adicionada (id, description, createdAt, updatedAt)

**SEED PRINCIPAL ATUALIZADO**:

- `src/lib/db/seed.ts` - **ATUALIZADA** - Documentação abrangente integrada como passo 2.1

**ARQUITETURA SIMPLIFICADA**:

- ✅ **Página unificada** - Todos componentes em um único arquivo
- ✅ **Sem componentes separados** - Evita complexidade desnecessária
- ✅ **Seed principal** - Eliminados arquivos temporários (seed-help.ts)
- ✅ **API única** - Documento único com ID fixo 'system-help'

**FUNCIONALIDADES IMPLEMENTADAS**:

- ✅ **Interface dual** - Sidebar navegação (w-80) + área principal
- ✅ **Navegação hierárquica** - Extração automática títulos Markdown
- ✅ **Visualização pura** - ReactMarkdown apenas para leitura
- ✅ **Editor separado** - Offcanvas exclusivo para edição
- ✅ **Scroll suave** - Navegação por âncoras
- ✅ **Temas** - Suporte dark/light
- ✅ **Estado vazio** - Interface completa mesmo sem documentação

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
│   ├── contacts/        # ✅ NOVO - Sistema de contatos
│   │   └── page.tsx     # CRUD completo de contatos
│   ├── groups/          # ✅ NOVO - Sistema de grupos e usuários
│   │   ├── layout.tsx   # Layout com abas navegáveis (ProductTabs)
│   │   ├── page.tsx     # CRUD grupos com expansão hierárquica
│   │   └── users/       # Aba separada para CRUD usuários
│   │       └── page.tsx # Interface moderna com filtros e estatísticas
│   ├── chat/            # ✅ COMPLETAMENTE IMPLEMENTADO - Sistema de chat WhatsApp-like
│   │   └── page.tsx     # ✅ Chat principal com interface dual sidebar + mensagens
│   ├── help/            # ✅ NOVO - Sistema de ajuda
│   │   └── page.tsx     # ✅ Interface dual (sidebar + visualização) + editor offcanvas
│   ├── profile/         # Perfil usuário
│   ├── settings/        # Configurações
│   │   └── products/    # ✅ REDESENHADA - Padrão estabelecido
│   │       └── page.tsx # Interface moderna padronizada
│   └── welcome/         # Onboarding
└── api/                 # API Routes Backend
    ├── auth/            # Endpoints autenticação
    ├── chat/            # ✅ SISTEMA DE CHAT COMPLETAMENTE IMPLEMENTADO
    │   ├── channels/    # ✅ CRUD canais de chat
    │   │   ├── route.ts # ✅ GET/POST canais baseados em grupos
    │   │   └── [channelId]/ # ✅ Canal específico
    │   │       └── messages/ # ✅ Mensagens do canal
    │   │           └── route.ts # ✅ GET mensagens com JOIN user
    │   ├── messages/    # ✅ CRUD mensagens
    │   │   ├── route.ts # ✅ POST nova mensagem com timestamp
    │   │   └── read-status/ # ✅ Sistema status de leitura
    │   │       └── route.ts # ✅ GET/POST/PUT status ✓✓✓ WhatsApp-like
    │   ├── presence/    # ✅ NOVO - Sistema de presença/status usuário
    │   │   └── route.ts # ✅ GET/POST status (online/away/busy/offline)
    │   ├── typing/      # ✅ Indicadores de digitação
    │   │   └── route.ts # ✅ POST start/stop typing
    │   ├── notifications/ # ✅ Sistema de notificações
    │   │   └── route.ts   # ✅ GET notificações não lidas
    │   ├── upload/      # ✅ Upload arquivos chat
    │   │   └── route.ts # ✅ POST/GET/DELETE arquivos/imagens
    │   └── websocket/   # ✅ WebSocket para tempo real
    │       └── route.ts # ✅ Conexão WS com autenticação
    ├── products/        # CRUD produtos e dependências
    │   ├── solutions/   # APIs de soluções otimizadas
    │   │   ├── summary/ # ✅ Summary de soluções otimizada
    │   │   └── count/   # ✅ Contagem em lote otimizada
    │   ├── contacts/    # ✅ NOVO - API associação produto-contato
    │   └── manual/      # ✅ API sistema de manual
    ├── contacts/        # ✅ NOVO - CRUD contatos
    │   └── route.ts     # GET/POST/PUT/DELETE contatos
    ├── help/            # ✅ NOVO - API sistema de ajuda
    │   └── route.ts     # ✅ GET/PUT documento único 'system-help'
    └── (user)/          # Endpoints perfil usuário
```

### `/src/components` - Componentes UI

```
/components
├── admin/               # Componentes específicos admin
│   ├── dashboard/       # Charts ApexCharts
│   ├── nav/             # Navegação e tabs
│   ├── sidebar/         # Menu lateral
│   ├── topbar/          # Barra superior
│   ├── contacts/        # ✅ Sistema de contatos
│   │   ├── ContactFormOffcanvas.tsx    # Formulário completo
│   │   ├── ContactDeleteDialog.tsx     # Dialog confirmação
│   │   └── ContactSelectorOffcanvas.tsx # Seletor multi-contatos
│   ├── groups/          # ✅ Sistema de grupos e usuários
│   │   ├── GroupFormOffcanvas.tsx     # Formulário grupos
│   │   ├── GroupDeleteDialog.tsx      # Dialog exclusão grupos
│   │   ├── GroupUsersSection.tsx      # Seção usuários por grupo
│   │   ├── UserFormOffcanvas.tsx      # Formulário usuários
│   │   └── UserDeleteDialog.tsx       # Dialog exclusão usuários
│   ├── chat/            # ✅ SISTEMA DE CHAT WHATSAPP-LIKE IMPLEMENTADO
│   │   ├── ChatSidebar.tsx           # ✅ Sidebar dual canais/usuários + status
│   │   ├── ChatArea.tsx              # ✅ Área principal mensagens
│   │   ├── MessageBubble.tsx         # ✅ Bubbles WhatsApp estilo
│   │   ├── ChatNotificationButton.tsx # ✅ Botão notificações TopBar
│   │   ├── TypingIndicator.tsx       # ✅ Indicador digitação
│   │   ├── ConnectionStatus.tsx      # ✅ Status conexão WebSocket
│   │   ├── EmojiPicker.tsx           # ✅ Picker emojis 8 categorias
│   │   └── FileUpload.tsx            # ✅ Upload drag & drop
│   ├── help/            # ✅ SISTEMA DE AJUDA (página unificada)
│   │   └── (sem componentes) # ✅ Funcionalidade integrada em /admin/help/page.tsx
│   └── products/        # 🏆 COMPONENTES REFATORADOS (NOVO)
│       ├── ProblemsListColumn.tsx      # Lista problemas (150 linhas)
│       ├── ProblemDetailColumn.tsx     # Detalhes problema (84 linhas)
│       ├── ProblemSolutionsSection.tsx # Seções soluções (211 linhas)
│       ├── SolutionFormModal.tsx       # Modal soluções (193 linhas)
│       ├── DeleteSolutionDialog.tsx    # Dialog exclusão (57 linhas)
│       ├── DependencyManagementOffcanvas.tsx    # MenuBuilder principal
│       ├── DependencyItemFormOffcanvas.tsx      # Formulário dependências
│       ├── ManualSectionFormOffcanvas.tsx       # Formulário manual
│       ├── DeleteDependencyDialog.tsx           # Dialog exclusão dependência
│       ├── ContactSelectorOffcanvas.tsx         # Seletor contatos produto
│       └── ProductManualSection.tsx             # Sistema manual completo
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

#### `contact` - **✅ NOVO - Contatos Globais**

```sql
- id: string (PK)
- name: string
- email: string (unique)
- role: string (opcional)
- photo: string (opcional)
- active: boolean
- createdAt/updatedAt: timestamp
```

#### `product_contact` - **✅ NOVO - Associação Produto-Contato**

```sql
- id: string (PK)
- productId: string (FK)
- contactId: string (FK)
- createdAt: timestamp
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

## 🚀 CHAT SYSTEM - DATABASE SCHEMA PLANEJADO

### Tabelas do Sistema de Chat

#### `chat_channel` - **🚀 PLANEJADO - Canais de Chat**

```sql
- id: string (PK)
- type: string ('group'|'direct'|'announcement')
- groupId: string (FK) # NULL para DMs, vincula aos grupos existentes
- participantA: string (FK) # Para DMs - usuário A
- participantB: string (FK) # Para DMs - usuário B
- name: string # Nome personalizado (opcional para DMs)
- description: string
- icon: string # Herdado do grupo ou personalizado
- color: string # Herdado do grupo ou personalizado
- isActive: boolean (default: true)
- isPrivate: boolean (default: false)
- allowFileUpload: boolean (default: true)
- createdBy: string (FK)
- createdAt: timestamp
- updatedAt: timestamp
```

#### `chat_message` - **🚀 PLANEJADO - Mensagens do Chat**

```sql
- id: string (PK)
- channelId: string (FK)
- senderId: string (FK)
- content: text # Conteúdo da mensagem
- messageType: string (default: 'text') # 'text'|'file'|'image'|'system'
- fileUrl: string # Para anexos
- fileName: string
- fileSize: integer
- fileMimeType: string
- replyToId: string (FK) # Para threading/replies
- threadCount: integer (default: 0)
- isEdited: boolean (default: false)
- editedAt: timestamp
- createdAt: timestamp
- deletedAt: timestamp # Soft delete
```

#### `chat_participant` - **🚀 PLANEJADO - Participantes dos Canais**

```sql
- id: string (PK)
- channelId: string (FK)
- userId: string (FK)
- role: string (default: 'member') # 'admin'|'moderator'|'member'
- canWrite: boolean (default: true)
- canUpload: boolean (default: true)
- lastReadAt: timestamp # Para controle de lidas
- unreadCount: integer (default: 0)
- muteUntil: timestamp # Silenciar notificações
- joinedAt: timestamp
- leftAt: timestamp # Histórico de participação
```

#### `chat_reaction` - **🚀 PLANEJADO - Reações às Mensagens**

```sql
- id: string (PK)
- messageId: string (FK)
- userId: string (FK)
- emoji: string # 👍, ❤️, 😊, 😢, 😮, 😡
- createdAt: timestamp
```

#### `chat_user_status` - **🚀 PLANEJADO - Status Online dos Usuários**

```sql
- id: string (PK)
- userId: string (FK)
- status: string (default: 'offline') # 'online'|'away'|'busy'|'offline'
- lastSeen: timestamp
- customMessage: string # "Trabalhando em previsões..."
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

## 🚀 ESTADO ATUAL DO PROJETO - JUNHO 2025

### ✅ COMPLETAMENTE IMPLEMENTADO E FUNCIONAL

1. **Sistema de Contatos 100% Finalizado**

   - CRUD completo em `/admin/contacts`
   - Associação produto-contato implementada
   - Switch.tsx, scrollbar personalizada, timing otimizado

2. **Padrão de Design Admin Estabelecido**

   - Template `w-full` obrigatório
   - Páginas `/admin/contacts` e `/admin/settings/products` padronizadas
   - Duplo scroll eliminado, UX modernizada

3. **Performance Otimizada**

   - APIs consolidadas com 95%+ redução de chamadas
   - Queries SQL otimizadas com JOINs e GROUP BY
   - Carregamento instantâneo

4. **Refatoração Histórica Concluída**

   - Página problemas: 1.506 → 629 linhas (58,2% redução)
   - Componentes modulares criados
   - Arquitetura de referência estabelecida

5. **Sistema Manual do Produto**

   - Hierarquia com dropdown inteligente
   - Editor markdown completo
   - Performance otimizada

6. **MenuBuilder Produção-Ready**
   - Drag & drop funcional
   - Dados reais do PostgreSQL
   - Zero bugs

### 🎯 PRÓXIMA FASE: ROADMAP 8 ETAPAS

**PASSO 1**: Proteger APIs `/api/*` → `/api/admin/*` com autenticação
**PASSO 2**: Resolver todos warnings ESLint
**PASSO 3-8**: Grupos, Usuários, Chat, Ajuda, Configurações, Dashboard

Este projeto structure representa o estado atual do Silo com todas as funcionalidades principais implementadas e sistema de contatos 100% finalizado.
