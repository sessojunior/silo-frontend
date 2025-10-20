# SILO - Sistema de Gerenciamento de Produtos Meteorológicos

O Silo é um sistema robusto de gestão de produtos meteorológicos voltado para colaboração, monitoramento e documentação técnica. Permite controle centralizado de processos, acompanhamento de status e notificações de produtos, gestão integrada de problemas e soluções, chat interno, relatórios automáticos e exportação de dados.

O Silo oferece segurança institucional, performance otimizada e interface intuitiva. Suporta uploads otimizados, integração fácil com bancos de dados PostgreSQL e garante personalização total para equipes técnicas do CPTEC/INPE. Ideal para coordenação ágil e tomada de decisão em operações meteorológicas.

## Índice

- [Visão Geral do Projeto](#-visão-geral-do-projeto)
- [Início Rápido](#-início-rápido)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Schema do Banco de Dados](#️-schema-do-banco-de-dados)
- [Módulos e Funcionalidades](#-módulos-e-funcionalidades)
- [APIs e Rotas](#-apis-e-rotas)
- [Servidor de Arquivos Local](#️-servidor-de-arquivos-local)
- [Segurança](#-segurança)
- [Performance e Otimizações](#️-performance-e-otimizações)
- [Padrões de Desenvolvimento](#-padrões-de-desenvolvimento)
- [Docker e Containerização](#-docker-e-containerização)
- [Deploy e Produção](#-deploy-e-produção)
- [Troubleshooting](#-troubleshooting)
- [Guia de Contribuição](#-guia-de-contribuição)
- [Autor e Mantenedor](#-autor-e-mantenedor)

---

## 📋 VISÃO GERAL DO PROJETO

**SILO** é um sistema avançado de gerenciamento de produtos meteorológicos desenvolvido para o **CPTEC/INPE** (Centro de Previsão de Tempo e Estudos Climáticos do Instituto Nacional de Pesquisas Espaciais).

### 🎯 Problema que Resolve

- **Monitoramento centralizado** de produtos meteorológicos complexos
- **Colaboração eficiente** para resolução de problemas técnicos
- **Gestão de conhecimento** e documentação técnica especializada
- **Comunicação estruturada** entre equipes técnicas

### 🏗️ Stack Técnica

- **Framework**: Next.js 15.5.2 + React 19.0.0 + TypeScript 5 (strict)
- **Database**: PostgreSQL + Drizzle ORM 0.43.1
- **Styling**: Tailwind CSS 4 + Design System customizado + @iconify/tailwind4
- **Drag & Drop**: @dnd-kit/core 6.3.1 (Sistema Kanban e MenuBuilder)
- **Autenticação**: JWT + OAuth Google (Arctic 3.7.0)
- **Charts**: ApexCharts 4.7.0 para dashboard
- **Editor**: @uiw/react-md-editor 4.0.7 para Markdown
- **Upload**: Servidor de arquivos local Node.js com otimização automática
- **Email**: Templates HTML modernos e clean para comunicação institucional

---

## 🚀 Início Rápido

### Instalação e Execução

```bash
# 1. Instalar dependências do frontend
npm install

# 2. Instalar dependências do servidor de arquivos
cd fileserver && npm install && cd ..

# 3. Configurar variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# 4. Executar servidor de arquivos (Terminal 1)
cd fileserver
npm run dev

# 5. Executar frontend (Terminal 2)
npm run dev
```

### Acessar Sistema

- **Frontend**: `http://localhost:3000`
- **FileServer**: `http://localhost:4000`

---

## 🧱 Arquitetura do Sistema

### Camadas e Tecnologias

- **Frontend**: Next.js (App Router) + React 19 + TypeScript strict
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Upload**: FileServer Node.js (Express + Multer + Sharp) com otimização automática
- **Autenticação**: JWT + OAuth Google; validação de domínio @inpe.br; ativação obrigatória
- **UI**: Tailwind CSS 4, design system customizado, dark mode completo
- **Relatórios**: ApexCharts com APIs dedicadas

### Fluxo de Alto Nível

1. Usuário autentica → middleware protege rotas → área admin consome APIs
2. Uploads: via `/api/upload` (proxy Next) ou direto no FileServer com otimização WebP/thumbnail
3. Módulos consomem APIs tipadas via Drizzle com respostas `{ success, data, error? }`

---

## 📁 Estrutura de Diretórios

```
silo-frontend/
├── src/
│   ├── app/            # App Router (rotas e APIs)
│   ├── components/     # Componentes (admin, ui, etc.)
│   ├── context/        # Contextos (usuário, chat, sidebar)
│   ├── hooks/          # Hooks customizados
│   ├── lib/            # DB, auth, status, utils, config
│   └── types/          # Tipos globais
├── fileserver/         # Servidor Express + Multer + Sharp
│   ├── src/            # Código do servidor TypeScript
│   └── uploads/        # avatars, contacts, problems, solutions, general, temp
├── public/             # Arquivos estáticos
├── drizzle/            # Migrações do banco
├── docker-compose.yml  # Orquestração Docker
└── next.config.ts      # Configuração Next.js
```

---

## 🗄️ Schema do Banco de Dados

O SILO utiliza **PostgreSQL** com **Drizzle ORM** para gerenciamento do banco de dados. O schema está localizado em `src/lib/db/schema.ts`.

### Visão Geral das Tabelas

O sistema possui **25 tabelas** organizadas em **8 módulos principais**:

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

### 1. Módulo de Autenticação e Segurança

#### `auth_user`
Tabela principal de usuários do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK - ID único do usuário |
| `name` | text | Nome completo |
| `email` | text | Email único (validado @inpe.br) |
| `emailVerified` | boolean | Email verificado (default: false) |
| `password` | text | Senha hash (bcrypt) |
| `image` | text | URL da foto de perfil |
| `isActive` | boolean | **Usuário ativo (default: false)** - requer ativação por admin |
| `lastLogin` | timestamp | Último acesso |
| `createdAt` | timestamp | Data de criação |

**Segurança**: Novos usuários são criados **inativos** por padrão e precisam ser ativados por um administrador.

#### `auth_session`
Sessões ativas dos usuários (JWT).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK - ID da sessão |
| `userId` | text | FK → auth_user |
| `token` | text | Token JWT |
| `expiresAt` | timestamp | Data de expiração |

#### `auth_code`
Códigos OTP para login por email e recuperação de senha.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK - ID do código |
| `userId` | text | FK → auth_user |
| `code` | text | Código OTP (6 dígitos) |
| `email` | text | Email de destino |
| `expiresAt` | timestamp | Expiração (15 minutos) |

#### `auth_provider`
Provedores OAuth (Google).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK - ID do provider |
| `userId` | text | FK → auth_user |
| `googleId` | text | ID da conta Google |

#### `rate_limit`
Controle de taxa de requisições (rate limiting).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `route` | text | Rota da API |
| `email` | text | Email do usuário |
| `ip` | text | Endereço IP |
| `count` | integer | Número de tentativas |
| `lastRequest` | timestamp | Última requisição |

**Constraint**: `unique(email, ip, route)` - Limite de 3 tentativas por minuto.

### 2. Módulo de Perfis e Preferências

#### `user_profile`
Perfil profissional do usuário.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `userId` | text | FK → auth_user |
| `genre` | text | Gênero |
| `phone` | text | Telefone |
| `role` | text | Cargo/função |
| `team` | text | Equipe/setor |
| `company` | text | Empresa/instituição |
| `location` | text | Localização |

#### `user_preferences`
Preferências do usuário.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `userId` | text | FK → auth_user |
| `chatEnabled` | boolean | Chat ativado (default: true) |

### 3. Módulo de Grupos

#### `group`
Grupos de usuários (para chat e organização).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `name` | text | Nome único |
| `description` | text | Descrição |
| `icon` | text | Ícone Lucide (default: users) |
| `color` | text | Cor hex (default: #3B82F6) |
| `active` | boolean | Ativo (default: true) |
| `isDefault` | boolean | Grupo padrão (default: false) |
| `maxUsers` | integer | Limite de usuários (opcional) |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

**6 grupos padrão**: Administradores, Meteorologistas, Analistas, Desenvolvedores, Suporte, Visitantes.

#### `user_group`
Relacionamento many-to-many entre usuários e grupos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `userId` | text | FK → auth_user |
| `groupId` | text | FK → group |
| `role` | text | Papel: member, admin, owner |
| `joinedAt` | timestamp | Data de entrada |
| `createdAt` | timestamp | Data de criação |

**Constraint**: `unique(userId, groupId)` + índices otimizados.

### 4. Módulo de Produtos (11 Tabelas)

#### `product`
Produtos meteorológicos gerenciados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `name` | text | Nome do produto |
| `slug` | text | Slug único |
| `available` | boolean | Disponível (default: true) |
| `priority` | text | Prioridade: low, normal, high, urgent |
| `turns` | jsonb | Turnos: ["0", "6", "12", "18"] |
| `description` | text | Descrição |

#### `product_activity`
Atividades/rodadas de execução de produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `productId` | text | FK → product |
| `userId` | text | FK → auth_user |
| `date` | date | Data da atividade |
| `turn` | integer | Turno: 0, 6, 12, 18 |
| `status` | text | Status: completed, pending, in_progress, not_run, with_problems, etc. |
| `problemCategoryId` | text | FK → product_problem_category (opcional) |
| `description` | text | Descrição da atividade |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

**Constraint**: `unique(productId, date, turn)` - Um registro por produto/data/turno.  
**Índices**: Otimizados para consultas por produto, data e turno.

#### `product_activity_history`
Histórico de alterações nas atividades.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `productActivityId` | uuid | FK → product_activity |
| `userId` | text | FK → auth_user |
| `status` | text | Status anterior |
| `description` | text | Descrição da alteração |
| `createdAt` | timestamp | Data da alteração |

#### `product_problem_category`
Categorias de problemas dos produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `name` | text | Nome único |
| `color` | text | Cor da categoria (hex) |
| `isSystem` | boolean | Categoria do sistema (não pode ser excluída) |
| `sortOrder` | integer | Ordem de exibição |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

#### `product_problem`
Problemas reportados nos produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `productId` | text | FK → product |
| `userId` | text | FK → auth_user |
| `title` | text | Título do problema |
| `description` | text | Descrição detalhada |
| `problemCategoryId` | text | FK → product_problem_category |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

**Índices**: Otimizados para produto, usuário, categoria e data.

#### `product_problem_image`
Imagens anexadas aos problemas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `productProblemId` | text | FK → product_problem |
| `image` | text | URL da imagem (otimizada WebP) |
| `description` | text | Descrição da imagem |

#### `product_solution`
Soluções/respostas para problemas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `userId` | text | FK → auth_user |
| `productProblemId` | text | FK → product_problem |
| `description` | text | Descrição da solução |
| `replyId` | text | ID da resposta pai (threading) |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

#### `product_solution_checked`
Marca soluções como verificadas/resolvidas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `userId` | text | FK → auth_user |
| `productSolutionId` | text | FK → product_solution |

#### `product_solution_image`
Imagens anexadas às soluções.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `productSolutionId` | text | FK → product_solution |
| `image` | text | URL da imagem |
| `description` | text | Descrição |

#### `product_dependency`
Dependências hierárquicas dos produtos (self-referencing tree).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `productId` | text | FK → product |
| `name` | text | Nome da dependência |
| `icon` | text | Ícone Lucide |
| `description` | text | Descrição |
| `parentId` | text | FK → product_dependency (self-reference) |
| `treePath` | text | Caminho completo: "/1/2/3" |
| `treeDepth` | integer | Profundidade: 0, 1, 2... |
| `sortKey` | text | Chave de ordenação: "001.002.003" |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

**Estrutura híbrida otimizada**: Adjacency List + Path Enumeration + Nested Sets para consultas eficientes.

#### `product_manual`
Manual do produto (Markdown).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `productId` | text | FK → product |
| `description` | text | Conteúdo Markdown completo |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

#### `product_contact`
Associação many-to-many entre produtos e contatos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `productId` | text | FK → product |
| `contactId` | text | FK → contact |
| `createdAt` | timestamp | Data de criação |

### 5. Módulo de Contatos

#### `contact`
Base de contatos globais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `name` | text | Nome completo |
| `role` | text | Cargo/função |
| `team` | text | Equipe/setor |
| `email` | text | Email único |
| `phone` | text | Telefone (opcional) |
| `image` | text | Foto do contato (otimizada) |
| `active` | boolean | Ativo (default: true) |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

### 6. Módulo de Chat

#### `chat_message`
Mensagens unificadas (grupos e DMs).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `content` | text | Conteúdo da mensagem |
| `senderUserId` | text | FK → auth_user (remetente) |
| `receiverGroupId` | text | FK → group (mensagem de grupo) |
| `receiverUserId` | text | FK → auth_user (mensagem privada) |
| `readAt` | timestamp | Lida em (apenas DMs) |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |
| `deletedAt` | timestamp | Soft delete |

**Lógica**: `receiverGroupId` **OU** `receiverUserId` preenchido (nunca os dois).  
**Índices**: Otimizados para consultas por grupo, usuário e mensagens não lidas.

#### `chat_user_presence`
Status de presença dos usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `userId` | text | PK → auth_user |
| `status` | text | Status: visible, invisible |
| `lastActivity` | timestamp | Última atividade |
| `updatedAt` | timestamp | Data de atualização |

### 7. Módulo de Projetos

#### `project`
Projetos gerenciados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `name` | text | Nome do projeto |
| `shortDescription` | text | Descrição curta |
| `description` | text | Descrição completa |
| `startDate` | date | Data de início |
| `endDate` | date | Data de fim |
| `priority` | text | Prioridade: low, medium, high, urgent |
| `status` | text | Status: active, completed, paused, cancelled |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

#### `project_activity`
Atividades dos projetos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `projectId` | uuid | FK → project |
| `name` | text | Nome da atividade |
| `description` | text | Descrição |
| `category` | text | Categoria |
| `estimatedDays` | integer | Dias estimados |
| `startDate` | date | Data de início |
| `endDate` | date | Data de fim |
| `priority` | text | Prioridade |
| `status` | text | Status: todo, progress, done, blocked |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

#### `project_task`
Tarefas do Kanban (5 colunas).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `projectId` | uuid | FK → project |
| `projectActivityId` | uuid | FK → project_activity |
| `name` | text | Nome da tarefa |
| `description` | text | Descrição |
| `category` | text | Categoria |
| `estimatedDays` | integer | Dias estimados |
| `startDate` | date | Data de início |
| `endDate` | date | Data de fim |
| `priority` | text | Prioridade |
| `status` | text | Status: todo, in_progress, blocked, review, done |
| `sort` | integer | Ordem dentro da coluna (drag & drop) |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

#### `project_task_user`
Associação many-to-many entre tarefas e usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `taskId` | uuid | FK → project_task |
| `userId` | text | FK → auth_user |
| `role` | text | Papel: assignee, reviewer, watcher |
| `assignedAt` | timestamp | Data de atribuição |
| `createdAt` | timestamp | Data de criação |

**Constraint**: `unique(taskId, userId)` + índices otimizados.

#### `project_task_history`
Histórico de movimentação de tarefas no Kanban.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `taskId` | uuid | FK → project_task |
| `userId` | text | FK → auth_user |
| `action` | text | Ação: status_change, created, updated, deleted |
| `fromStatus` | text | Status anterior |
| `toStatus` | text | Status novo |
| `fromSort` | integer | Posição anterior |
| `toSort` | integer | Posição nova |
| `details` | jsonb | Dados extras (campos alterados) |
| `createdAt` | timestamp | Data da ação |

**Índices**: Otimizados para consultas por tarefa, usuário e data.

### 8. Módulo de Ajuda

#### `help`
Documentação do sistema (Markdown único).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | PK |
| `description` | text | Conteúdo Markdown completo |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

### Relacionamentos Principais

```
auth_user (1) ──→ (N) user_profile
auth_user (1) ──→ (N) user_preferences
auth_user (1) ──→ (N) auth_session
auth_user (N) ←──→ (N) group [via user_group]

product (1) ──→ (N) product_activity
product (1) ──→ (N) product_problem
product (1) ──→ (N) product_dependency (self-referencing)
product (1) ──→ (1) product_manual
product (N) ←──→ (N) contact [via product_contact]

product_problem (1) ──→ (N) product_solution
product_problem (1) ──→ (N) product_problem_image
product_solution (1) ──→ (N) product_solution_image

project (1) ──→ (N) project_activity
project_activity (1) ──→ (N) project_task
project_task (N) ←──→ (N) auth_user [via project_task_user]
project_task (1) ──→ (N) project_task_history

chat_message (N) ──→ (1) auth_user [sender]
chat_message (N) ──→ (1) group [group message]
chat_message (N) ──→ (1) auth_user [DM]
```

### Migrações

O sistema utiliza **Drizzle Kit** para gerenciamento de migrações:

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

**Arquivos de migração**: Localizados em `/drizzle/` com versionamento automático.

### Boas Práticas Implementadas

1. **Índices Otimizados**: Todas as FK têm índices para performance
2. **Constraints Únicos**: Previnem duplicações (ex: email, product_activity)
3. **Soft Delete**: Campo `deletedAt` onde necessário
4. **Timestamps**: `createdAt` e `updatedAt` em todas as tabelas principais
5. **Cascade Delete**: Relacionamentos com `onDelete: 'cascade'`
6. **Tipagem TypeScript**: Types gerados automaticamente via `$inferSelect`
7. **JSONB**: Usado para dados flexíveis (turns, details, etc.)
8. **UUID**: Para IDs onde há muitas inserções concorrentes

### Dados de Seed

O sistema possui seed inicial para:
- 6 grupos padrão
- Categorias de problemas do sistema
- Usuário administrador inicial (desenvolvimento)

```bash
npm run db:seed
```

---

## 🧩 Módulos e Funcionalidades

### Sistema de Autenticação e Segurança

- ✅ Login com email/senha (usuários válidos e inválidos)
- ✅ Login apenas com email (códigos OTP válidos e expirados)
- ✅ Google OAuth (fluxo completo e cenários de erro)
- ✅ Recuperação de senha (envio, validação e redefinição)
- ✅ Validação de domínio @inpe.br em todas as operações
- ✅ Sistema de ativação obrigatória por administrador
- ✅ Limitação de taxa (3 tentativas por minuto)
- ✅ Alteração segura de email com OTP
- ✅ Proteções contra auto-modificação

### Dashboard e Visualizações

- ✅ Carregamento de estatísticas principais com dados reais
- ✅ Gráficos ApexCharts (donut, coluna, linha, área)
- ✅ Responsividade em diferentes resoluções (mobile, tablet, desktop)
- ✅ Modo dark/light em todos os componentes
- ✅ Filtros de data e período nos gráficos
- ✅ Atualização automática de dados

### Sistema de Produtos

- ✅ CRUD completo de produtos (criar, listar, editar, excluir)
- ✅ Upload e gerenciamento de imagens de produtos
- ✅ Sistema de problemas (criação, edição, categorização)
- ✅ Sistema de soluções (respostas, edição, marcação como resolvida)
- ✅ Associação produto-contato (seleção múltipla, remoção)
- ✅ Sistema de dependências hierárquicas (drag & drop, reordenação)
- ✅ Editor de manual do produto (markdown, preview, salvamento)
- ✅ Calendário de turnos com cores de status
- ✅ Múltiplos turnos por dia (0h, 12h, etc.)

### Sistema de Projetos e Kanban

- ✅ CRUD de projetos (criar, editar, excluir com validações)
- ✅ Gestão de atividades por projeto (CRUD completo)
- ✅ Kanban por atividade (5 colunas: todo, in_progress, blocked, review, done)
- ✅ CRUD de tarefas (formulário completo, validações, exclusão)
- ✅ Drag & drop entre colunas de status
- ✅ Dark mode completo no Kanban
- ✅ Filtros e buscas em projetos e atividades
- ✅ Estatísticas e progresso de projetos

### Sistema de Chat

- ✅ Envio de mensagens em grupos e DMs
- ✅ Sistema de presença (4 estados: online, ausente, ocupado, offline)
- ✅ Emoji picker (6 categorias, busca, inserção)
- ✅ Notificações em tempo real
- ✅ Polling inteligente (sincronização apenas quando necessário)
- ✅ Histórico de mensagens e paginação
- ✅ Controle de ativação/desativação do chat
- ✅ Interface WhatsApp-like
- ✅ Botão fixo "Ir para o fim" com controle manual

### Sistema de Contatos e Grupos

- ✅ CRUD completo de contatos (criar, editar, excluir)
- ✅ Upload de fotos de contatos
- ✅ Filtros por status (ativo/inativo)
- ✅ Busca por nome, email e função
- ✅ Associação com produtos
- ✅ CRUD de grupos (6 grupos padrão + novos)
- ✅ CRUD de usuários (perfil completo, preferências)
- ✅ Relacionamento many-to-many usuários-grupos
- ✅ Navegação por abas (grupos/usuários)
- ✅ Hierarquia de permissões por grupo

### Sistema de Relatórios

- ✅ Relatórios de disponibilidade por produto
- ✅ Relatórios de problemas mais frequentes
- ✅ Métricas de disponibilidade e tempo médio de resolução
- ✅ Análise por categoria e distribuição por produto
- ✅ Gráficos ApexCharts (barra, linha, rosca, área) com dark/light
- ✅ Interface responsiva para desktop e mobile
- ✅ Filtros avançados (data, categoria, produto)

### Sistema de Upload de Arquivos

- ✅ Servidor de arquivos local Node.js (Express + Multer + Sharp)
- ✅ Otimização automática de imagens (conversão WebP, redimensionamento)
- ✅ Geração automática de thumbnails (avatars 128x128)
- ✅ Upload de avatars de usuários (até 2MB)
- ✅ Upload de fotos de contatos (até 4MB)
- ✅ Upload múltiplo de imagens de problemas (até 3 arquivos)
- ✅ Upload múltiplo de imagens de soluções (até 3 arquivos)
- ✅ Validação robusta de tipos de arquivo (magic numbers + MIME)
- ✅ Organização por categorias (avatars, contacts, problems, solutions)
- ✅ Proxy transparente via API Next.js
- ✅ Segurança institucional (armazenamento local controlado)

### Sistema de Configurações e Ajuda

- ✅ Edição de perfil do usuário (dados pessoais, upload foto)
- ✅ Alteração de preferências (notificações, tema, chat)
- ✅ Alteração de senha (validações, confirmação)
- ✅ Salvamento automático de configurações
- ✅ Navegação hierárquica na documentação
- ✅ Busca por conteúdo na ajuda
- ✅ Edição da documentação (markdown, preview)
- ✅ Organização por seções e capítulos

---

## 📡 APIs e Rotas

### Contrato de Resposta Padronizado

```typescript
type ApiResponse<T> = { success: boolean; data?: T; error?: string }
```

### Mapa de Endpoints

| Domínio | Método | Rota | Descrição |
| --- | --- | --- | --- |
| **Auth** | POST | /api/auth/register | Registro de usuários |
| **Auth** | POST | /api/auth/login | Login com senha |
| **Auth** | POST | /api/auth/login-email | Login apenas com email (OTP) |
| **Auth** | POST | /api/auth/forget-password | Recuperação de senha |
| **Auth** | GET/POST | /api/auth/callback/google | Google OAuth callback |
| **Auth** | POST | /api/auth/verify-code | Verificação de códigos OTP |
| **User** | GET/PUT | /api/(user)/user-profile | Perfil do usuário |
| **User** | GET/PUT | /api/(user)/user-preferences | Preferências do usuário |
| **User** | PUT | /api/(user)/user-password | Alteração de senha |
| **User** | POST/PUT | /api/(user)/user-email-change | Alteração de email (OTP) |
| **User** | POST | /api/(user)/user-profile-image | Upload de imagem de perfil |
| **Admin** | CRUD | /api/admin/users | Usuários |
| **Admin** | CRUD | /api/admin/groups | Grupos |
| **Admin** | CRUD | /api/admin/products | Produtos |
| **Admin** | CRUD | /api/admin/projects | Projetos |
| **Admin** | CRUD | /api/admin/contacts | Contatos |
| **Admin** | GET/POST | /api/admin/reports/availability | Relatório de disponibilidade |
| **Admin** | GET/POST | /api/admin/reports/problems | Relatório de problemas |
| **Admin** | GET/POST | /api/admin/dashboard/* | APIs de dashboard |
| **Admin** | GET/POST | /api/admin/chat/* | APIs de chat |
| **Upload** | POST | /api/upload | Proxy para FileServer |
| **FileServer** | POST | /api/upload | Upload genérico |
| **FileServer** | POST | /upload/avatar | Upload de avatar (thumbnail) |
| **FileServer** | POST | /upload/contact | Upload de contato |
| **FileServer** | POST | /upload/problem | Upload múltiplo de problemas |
| **FileServer** | POST | /upload/solution | Upload múltiplo de soluções |
| **FileServer** | GET/DELETE | /files/:type/:filename | Acesso/remoção de arquivos |
| **FileServer** | GET | /health | Health check |

---

## 🗂️ Servidor de Arquivos Local

### Status

✅ **COMPLETAMENTE IMPLEMENTADO E FUNCIONAL EM TYPESCRIPT**

O SILO utiliza um servidor de arquivos local Node.js que oferece controle total sobre os dados e conformidade com requisitos de segurança institucional do CPTEC/INPE.

### Estrutura do Servidor

```
fileserver/                    # Servidor de arquivos independente
├── src/
│   ├── server.ts              # Servidor principal Express + Multer + Sharp
│   ├── config.ts              # Configuração centralizada
│   ├── handlers.ts            # Handlers de rotas
│   ├── fileHandlers.ts        # Lógica de processamento de arquivos
│   ├── multerConfig.ts        # Configuração Multer
│   └── utils.ts               # Utilitários
├── uploads/                   # Arquivos organizados por tipo
│   ├── avatars/               # Avatars com thumbnails automáticos
│   ├── contacts/              # Fotos de contatos
│   ├── problems/              # Imagens de problemas
│   ├── solutions/             # Imagens de soluções
│   ├── general/               # Uploads genéricos
│   └── temp/                  # Arquivos temporários (limpeza automática)
├── package.json               # Dependências independentes
└── README.md                  # Documentação do servidor
```

### Comandos de Execução

#### Desenvolvimento e Produção

```bash
# Instalar dependências (primeira vez)
cd fileserver
npm install

# Executar servidor
npm run dev

# O servidor rodará em http://localhost:4000
# Use Ctrl+C para parar o servidor
```

### Endpoints Disponíveis

| Método | Endpoint | Descrição | Limites |
| --- | --- | --- | --- |
| POST | /api/upload | Upload genérico | 1 arquivo, 4MB |
| POST | /upload/avatar | Avatar com thumbnail | 1 arquivo, 2MB |
| POST | /upload/contact | Foto de contato | 1 arquivo, 4MB |
| POST | /upload/problem | Imagens de problemas | 3 arquivos, 4MB cada |
| POST | /upload/solution | Imagens de soluções | 3 arquivos, 4MB cada |
| GET | /files/:type/:filename | Acessar arquivo | - |
| DELETE | /files/:type/:filename | Deletar arquivo | - |
| GET | /health | Health check | - |

### Otimização Automática

- **Conversão WebP**: Todas as imagens convertidas para WebP (redução ~30-50% do tamanho)
- **Redimensionamento**: Imagens redimensionadas automaticamente (máx 1920x1080)
- **Thumbnails**: Avatars recebem thumbnails automáticos (128x128 WebP)
- **Rotação EXIF**: Rotação automática baseada em metadados EXIF
- **Substituição**: Imagens otimizadas substituem originais (não duplica arquivos)

### Segurança e Validação

- **Validação de Tipo**: Verificação robusta com magic numbers + MIME types
- **Limites de Tamanho**: Máximo 4MB por arquivo
- **Limites de Quantidade**: Máximo 3 arquivos por upload
- **Nomes Únicos**: Prevenção de conflitos com timestamps + UUID
- **CORS**: Configurado para domínio específico
- **Limpeza Automática**: Remoção de arquivos temporários a cada hora

### Configuração Centralizada

Arquivo `fileserver/src/config.ts`:

```typescript
export const config = {
  port: 4000,
  fileServerUrl: 'http://localhost:4000',
  nextPublicAppUrl: 'http://localhost:3000',
  upload: {
    maxFileSize: 4194304, // 4MB
    maxFilesCount: 3,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  optimization: {
    avatar: { thumbnailSize: 128, thumbnailQuality: 85 },
    profile: { size: 80, quality: 85 },
    general: { maxWidth: 1920, maxHeight: 1080, quality: 90 }
  }
}
```

### Benefícios

- ✅ **Segurança Institucional**: Controle total sobre dados e arquivos
- ✅ **Conformidade CPTEC/INPE**: Atende requisitos de segurança institucional
- ✅ **Performance**: Latência reduzida para usuários locais
- ✅ **Custo Zero**: Eliminação de dependências externas pagas
- ✅ **Personalização**: Configurações específicas para necessidades institucionais
- ✅ **Otimização**: Conversão automática para WebP com redução significativa de tamanho
- ✅ **Organização**: Estrutura de diretórios clara e escalável

---

## 🔐 Segurança

### Política Institucional CPTEC/INPE

#### Validação de Domínio @inpe.br

**Função Centralizada** (`src/lib/auth/validate.ts`):
```typescript
export function isValidDomain(email: string): boolean {
    const lowerEmail = email.toLowerCase().trim()
    return lowerEmail.endsWith('@inpe.br')
}
```

**Endpoints Protegidos**:
- ✅ Registro (`/api/auth/register`)
- ✅ Login por email (`/api/auth/login-email`)
- ✅ Recuperação de senha (`/api/auth/forget-password`)
- ✅ Login Google (`/api/auth/callback/google`)
- ✅ Alteração de email (`/api/user-email-change`)

#### Sistema de Ativação Obrigatória

- Novos usuários criados como **inativos** (`isActive: false`) por padrão
- Ativação exclusiva por administrador
- Verificação de ativação em **todos** os fluxos de autenticação
- Interface administrativa com toggle direto na lista de usuários
- Mensagens contextuais: "Sua conta ainda não foi ativada por um administrador"

#### Proteções de Auto-Modificação

**Proteção Frontend**:
- Botões de desativar/excluir desabilitados para usuário atual
- Campos nome/email desabilitados no próprio perfil via admin
- Switches de status desabilitados
- Usuário não pode se remover do grupo Administradores
- Toasts informativos para ações não permitidas

**Proteção Backend** (`/api/admin/users`):
- ❌ Alterar próprio nome
- ❌ Alterar próprio email
- ❌ Desativar própria conta
- ❌ Desmarcar próprio email como não verificado
- ❌ Remover-se do grupo Administradores

#### Alteração Segura de Email

**Fluxo de 2 Etapas**:
1. **Solicitação**: Usuário informa novo email → OTP enviado para novo email
2. **Confirmação**: Usuário informa código OTP → Email alterado e verificado

**Segurança**:
- Validação de formato e domínio @inpe.br
- Verificação de email não duplicado
- Código OTP com expiração
- Validação de IP e rate limiting
- UI padronizada com componente Pin

#### Sistema de Contexto de Usuário

**UserContext Implementado**:
- Estado global: `user`, `userProfile`, `userPreferences` centralizados
- Atualizações em tempo real sem reload da página
- Hooks especializados: `useUser()`, `useUserProfile()`, `useUserPreferences()`
- Integração com `useCurrentUser` otimizado

#### Outras Medidas de Segurança

- Rate limiting em endpoints críticos
- Logs padronizados em todas as operações
- Try/catch obrigatório em todas as APIs
- Validação de entrada em todas as camadas
- Secrets e variáveis de ambiente obrigatórias

---

## ⚙️ Performance e Otimizações

### Navegação Client-side

- Uso consistente de `Link` do Next.js para navegação fluida
- Preservação de estado e tema sem recarregar a página
- Redução de chamadas API redundantes

### Sistema de Cores Padronizado

**Problema Resolvido**:
- Inconsistências de tonalidades entre componentes
- Diferentes variantes causavam experiência visual não uniforme
- Status de produtos com cores e prioridades desorganizadas

**Sistema Centralizado** (`src/lib/productStatus.ts`):

```typescript
export const getStatusClasses = (
  color: StatusColor, 
  variant: 'timeline' | 'calendar' | 'stats' = 'timeline'
): string => {
  // Tonalidades baseadas na barra de 28 dias como referência
  switch (color) {
    case 'orange': return variant === 'timeline' ? 'bg-orange-500 text-white' : 'bg-orange-500'
    // ... todas as cores seguem o mesmo padrão
  }
}

// Prioridade de status (menor número = mais crítico)
export const STATUS_SEVERITY_ORDER: Record<ProductStatus, number> = {
  with_problems: 1,   // Red - mais crítico
  run_again: 2,       // Orange
  not_run: 3,         // Yellow
  under_support: 4,   // Violet
  suspended: 5,       // Blue
  in_progress: 6,     // Gray
  pending: 7,         // Transparent
  completed: 8,       // Green - só se todos concluídos
}
```

**Componentes Padronizados**:
- ProductTurn, ProductTimeline, ProductCalendar
- Product (legenda), Stats, Dashboard
- ReportCard, ReportChart, ReportFilters
- Button, Switch, Textarea, Modal

**Impacto**:
- Experiência visual consistente
- Hierarquia clara alinhada com criticidade
- Mudanças de cor centralizadas em um único arquivo

### Sistema de Rolagem no Chat

**Controle Manual Implementado**:
- ✅ Rolagem automática **removida** - usuário tem controle total
- ✅ Botão fixo "Ir para o fim" no canto inferior direito
- ✅ Aparece apenas quando não está no fim (≤5px)
- ✅ `scrollToBottom()` chamada apenas quando usuário clica no botão

**Funções Principais** (`src/components/admin/chat/MessagesList.tsx`):

```typescript
// Rola para o final da conversa
const scrollToBottom = (): void => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
}

// Verifica se está totalmente no fim (para controlar botão)
const isUserTotallyAtBottom = (): boolean => {
  if (!messagesContainerRef.current) return false
  const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  return distanceFromBottom <= 5
}
```

### Kanban com Dark Mode

**Implementação Completa**:
- KanbanBoard 100% adaptado para tema escuro
- Colunas tematizadas: stone-50→stone-900, blue-50→blue-950, red-50→red-950, amber-50→amber-950, emerald-50→emerald-950
- Cards: bg-white→dark:bg-zinc-800, border-gray-200→dark:border-zinc-700
- Texto: text-gray-900→dark:text-gray-100, text-gray-600→dark:text-gray-400
- Transições suaves entre light/dark sem quebrar funcionalidade

### Regras de Múltiplos Turnos

**Dashboard com Múltiplos Turnos por Dia**:

```typescript
const lastDaysStatus = lastDates.flatMap((date) => {
  const dayData = p.dates.filter((d) => d.date === date)
  if (dayData.length === 0) {
    return [{ date, turn: 0, user_id: '', status: DEFAULT_STATUS, description: null, category_id: null, alert: false }]
  }
  return dayData
})
```

**Boas Práticas**:
- Use `filter()` para coleções com múltiplas ocorrências
- Evite `find()` quando existir mais de um item por chave

### Otimização de Dados

- **Dados Reais**: Substituição de dados simulados por dados reais do banco
- **Relatórios**: Cálculo real baseado em atividades e métricas
- **Dashboard**: Estatísticas e gráficos com dados de produção
- **APIs Otimizadas**: Redução de chamadas redundantes

---

## 📝 Padrões de Desenvolvimento

### Imports e Estrutura

- **SEMPRE** usar alias `@/` para imports internos: `import { sendEmail } from '@/lib/sendEmail'`
- **NUNCA** usar caminhos relativos para módulos internos
- **SEMPRE** centralizar configurações em `src/lib/config.ts`
- **SEMPRE** centralizar schemas em `src/lib/db/schema.ts`

### Error Handling e Retornos

- **SEMPRE** usar `try/catch` com logs padronizados
- **SEMPRE** retornar `{ success: boolean, error?: string }` em APIs
- Tipos explícitos em todas as funções exportadas
- **NUNCA** usar `any` - TypeScript strict mode

### Qualidade e Tipagem

- TypeScript em modo **strict** em todo o projeto
- Sem variáveis/imports não utilizados
- Mantenha o lint limpo (zero warnings/errors)
- Nome de funções em **inglês**, comentários em **português brasileiro**

### Datas e Timezone

- **SEMPRE** usar timezone de São Paulo (America/Sao_Paulo)
- Configurar corretamente em cálculos e exibição

### URLs e Configuração

- **NUNCA** hardcode `localhost` em produção
- **SEMPRE** usar `src/lib/config.ts` para URLs
- Validar `FILE_SERVER_URL` e `NEXTAUTH_URL` em produção

### Padrão de Logs

**Emojis Padronizados**:

```typescript
// ❌ Erro (console.error)
console.error('❌ [CONTEXTO] Descrição do erro', { detalhes })

// ⚠️ Aviso (console.warn)  
console.warn('⚠️ [CONTEXTO] Descrição do aviso', { detalhes })

// ℹ️ Informativo (console.log)
console.log('ℹ️ [CONTEXTO] Descrição', { detalhes })
```

**Regras**:
- Contexto: entre `[]` em MAIÚSCULAS, sem acentos
- Exemplos: `[API_CHAT]`, `[HOOK_USERS]`, `[COMPONENT_KANBAN]`, `[PAGE_PROJECTS]`
- Detalhes: sempre usar objeto `{ detalhes }` para informações estruturadas

**O que Manter**:
- ❌ Logs de erro em catch blocks
- ❌ Logs de erros inesperados de API
- ℹ️ Confirmações de ações críticas
- ℹ️ Mudanças de estado críticas

**O que Remover**:
- Logs de debug desnecessários
- Logs de sucesso redundantes
- Logs "Carregando...", "Dados recebidos"
- `useEffect` apenas com logs de debug

---

## 🐳 Docker e Containerização

### Visão Geral

Docker é uma ferramenta que "empacota" aplicações em **containers** - ambientes isolados que funcionam da mesma forma em qualquer computador. Pense em containers como "caixas" que contêm tudo que a aplicação precisa para rodar.

**Vantagens**:
- ✅ Funciona igual em qualquer máquina (desenvolvimento, teste, produção)
- ✅ Não precisa instalar Node.js, PostgreSQL, etc. manualmente
- ✅ Fácil de iniciar e parar o sistema completo
- ✅ Isola a aplicação do resto do sistema

### Pré-requisitos

Antes de começar, você precisa ter instalado:

1. **Docker Desktop** (Windows/Mac) ou **Docker Engine** (Linux)
   - Download: https://www.docker.com/products/docker-desktop
   - Após instalar, verifique: `docker --version`

2. **Docker Compose** (geralmente já vem com o Docker Desktop)
   - Verifique: `docker-compose --version`

### Como Funciona o SILO com Docker

O SILO usa **2 containers**:

1. **`nextapp`** (porta 3000) - Aplicação frontend Next.js
2. **`fileserver`** (porta 4000) - Servidor de arquivos

Os containers se comunicam automaticamente e compartilham arquivos quando necessário.

### Opção 1: Desenvolvimento Local (SEM Docker)

**Recomendado para desenvolvimento ativo do código**

```bash
# 1. Instalar dependências
npm install
cd fileserver && npm install && cd ..

# 2. Configurar variáveis de ambiente
cp env.example .env
# Abra o arquivo .env e configure com seus dados

# 3. Executar servidores em terminais separados
# Terminal 1:
cd fileserver
npm run dev

# Terminal 2 (em outra janela):
npm run dev

# ✅ Pronto! Acesse:
# Frontend: http://localhost:3000
# FileServer: http://localhost:4000
```

**Para parar**: Pressione `Ctrl+C` em cada terminal.

### Opção 2: Usando Docker (Recomendado para Iniciantes)

**Recomendado para testar ou usar o sistema sem configurar o ambiente**

#### Passo 1: Preparar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.docker.example .env

# Abrir e editar o arquivo .env com suas configurações
# Use um editor de texto (VSCode, Notepad++, etc.)
```

**Configurações mínimas necessárias no .env**:
```bash
# Banco de Dados (use o seu banco PostgreSQL)
DATABASE_URL='postgresql://usuario:senha@host:5432/banco'

# Chaves de Autenticação (gere um secret aleatório)
NEXTAUTH_SECRET='sua-chave-secreta-aqui'
NEXTAUTH_URL='http://localhost:3000'

# Google OAuth (opcional, se não usar deixe em branco)
GOOGLE_CLIENT_ID=''
GOOGLE_CLIENT_SECRET=''

# Email SMTP (configure com seu servidor de email)
SMTP_HOST='smtp.seuservidor.com'
SMTP_PORT='587'
SMTP_USERNAME='seu-email@dominio.com'
SMTP_PASSWORD='sua-senha'
```

#### Passo 2: Construir e Executar

```bash
# Construir e iniciar todos os containers
docker-compose up --build

# Isso vai:
# 1. Baixar as imagens necessárias (primeira vez demora mais)
# 2. Construir os containers do SILO
# 3. Iniciar frontend (porta 3000) e fileserver (porta 4000)
# 4. Mostrar logs em tempo real

# ✅ Aguarde a mensagem: "ready - started server on..."
# ✅ Acesse: http://localhost:3000
```

**Executar em segundo plano** (sem ver os logs):
```bash
docker-compose up -d --build

# Ver logs depois:
docker-compose logs -f
```

#### Passo 3: Gerenciar os Containers

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um container específico
docker-compose logs -f nextapp
docker-compose logs -f fileserver

# Parar todos os containers
docker-compose down

# Parar e remover tudo (inclusive volumes)
docker-compose down -v

# Reiniciar containers
docker-compose restart

# Reconstruir apenas um container
docker-compose up --build fileserver
```

#### Passo 4: Acessar o Sistema

Após iniciar os containers:
- **Frontend**: http://localhost:3000
- **FileServer**: http://localhost:4000/health (para verificar se está funcionando)

### Solução de Problemas Docker

#### Erro: "port is already allocated"
```bash
# Outro programa está usando a porta 3000 ou 4000
# Opção 1: Parar o programa que está usando a porta
# Opção 2: Mudar a porta no docker-compose.yml

# Ver o que está usando a porta (Windows):
netstat -ano | findstr :3000

# Ver o que está usando a porta (Linux/Mac):
lsof -i :3000
```

#### Erro: "Cannot connect to the Docker daemon"
```bash
# Docker Desktop não está rodando
# Solução: Inicie o Docker Desktop e aguarde inicializar
```

#### Erro: "Network error" ou containers não se comunicam
```bash
# Reiniciar o Docker
docker-compose down
docker-compose up --build
```

#### Limpar tudo e recomeçar
```bash
# Parar e remover containers, volumes e redes
docker-compose down -v

# Remover imagens antigas (libera espaço)
docker system prune -a

# Reconstruir do zero
docker-compose up --build
```

### Arquitetura dos Containers

**Container Next.js (`nextapp`)**:
- **Porta**: 3000 (mapeada para localhost:3000)
- **Função**: Aplicação frontend e APIs
- **Aguarda**: `fileserver` estar pronto antes de iniciar
- **Restart**: Automático (`unless-stopped`)

**Container Fileserver (`fileserver`)**:
- **Porta**: 4000 (mapeada para localhost:4000)
- **Função**: Upload e gerenciamento de arquivos
- **Volume**: `./fileserver/uploads` (arquivos salvos no host)
- **Restart**: Automático (`unless-stopped`)

**Persistência de Dados**:
- ✅ Arquivos de upload são salvos em `./fileserver/uploads` (não perdem ao parar containers)
- ⚠️ Banco de dados precisa ser externo (PostgreSQL separado)

### Comandos Úteis para Debug

```bash
# Entrar dentro do container Next.js (para investigar)
docker-compose exec nextapp sh

# Entrar dentro do container Fileserver
docker-compose exec fileserver sh

# Ver configuração completa gerada
docker-compose config

# Ver recursos usados pelos containers
docker stats

# Verificar logs de erro específicos
docker-compose logs nextapp | grep ERROR
docker-compose logs fileserver | grep ERROR
```

### Quando Usar Cada Opção?

| Situação | Recomendação |
|----------|--------------|
| **Desenvolvendo código** | Desenvolvimento Local (npm run dev) |
| **Testando o sistema** | Docker |
| **Primeira vez usando** | Docker |
| **Deploy em servidor** | Docker |
| **Debugando problemas** | Desenvolvimento Local |
| **Demonstração rápida** | Docker |

### Variáveis de Ambiente

#### Principais Variáveis

**Ambiente**:
- `NODE_ENV` - development/production

**Banco de Dados**:
- `DATABASE_URL` - URL de conexão PostgreSQL

**Autenticação**:
- `NEXTAUTH_SECRET` - Secret para JWT
- `NEXTAUTH_URL` - URL da aplicação
- `GOOGLE_CLIENT_ID` - ID do cliente Google OAuth
- `GOOGLE_CLIENT_SECRET` - Secret do Google OAuth
- `GOOGLE_CALLBACK_URL` - URL de callback OAuth

**Email**:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USERNAME`, `SMTP_PASSWORD`

**FileServer**:
- `FILE_SERVER_URL` - URL interna do servidor
- `NEXT_PUBLIC_FILE_SERVER_URL` - URL pública do servidor
- `UPLOAD_PROXY_URL` - URL de proxy para uploads

#### Desenvolvimento vs Produção

**Desenvolvimento**:
```bash
NODE_ENV='development'
DATABASE_URL='postgresql://usuario:senha@localhost:5432/silo'
FILE_SERVER_URL=http://localhost:4000
NEXT_PUBLIC_FILE_SERVER_URL=http://localhost:4000
GOOGLE_CALLBACK_URL='http://localhost:3000/api/auth/callback/google'
```

**Produção**:
```bash
NODE_ENV='production'
DATABASE_URL='postgresql://usuario:senha@host:5432/silo_db'
FILE_SERVER_URL=https://files.cptec.inpe.br
NEXT_PUBLIC_FILE_SERVER_URL=https://files.cptec.inpe.br
GOOGLE_CALLBACK_URL='https://silo.cptec.inpe.br/api/auth/callback/google'
```

**⚠️ Importante para Produção**:
- URLs HTTPS obrigatórias
- Domínios reais institucionais
- Secrets complexos e únicos
- Servidor PostgreSQL dedicado

---

## 🚀 Deploy e Produção

### Visão Geral

O projeto SILO está configurado para deploy separado:
- **Frontend Next.js**: Deploy no Vercel (automatizado via Git) ou em servidor próprio (CPTEC/INPE)
- **FileServer**: Deploy em servidor próprio (CPTEC/INPE)

### Arquivos de Configuração

- `.gitignore` - Ignora arquivos desnecessários
- `.vercelignore` - Otimiza deploy no Vercel
- `.dockerignore` - Otimiza containers Docker
- `vercel.json` - Configuração específica do Vercel
- `next.config.ts` - Configuração Next.js otimizada

### Deploy do Frontend (Vercel)

```bash
# Deploy automático via Git
git add .
git commit -m "Deploy: configuração otimizada"
git push origin main
```

O Vercel fará deploy automaticamente apenas do frontend Next.js.

### Deploy do FileServer (Servidor Próprio)

```bash
# 1. Deploy do código fonte
cd fileserver
npm install

# 2. Configurar produção (editar src/config.ts)
# fileServerUrl: 'https://files.cptec.inpe.br'
# nextPublicAppUrl: 'https://silo.cptec.inpe.br'

# 3. Executar servidor
npm run dev

# Para produção, considere usar um process manager como PM2 ou systemd
# para garantir que o servidor reinicie automaticamente
```

### Configurações de Produção

1. **Frontend**: URLs configuradas automaticamente no Vercel
2. **FileServer**: Configurar URLs em `fileserver/src/config.ts`
3. **Banco de Dados**: Configurar PostgreSQL externo dedicado
4. **CORS**: FileServer deve permitir requests do domínio do frontend
5. **Firewall**: Configurar regras de segurança de rede
6. **Backup**: Implementar backup automático e replicação

### Migração de Infraestrutura (Pendente)

**🔴 REQUISITOS PARA PRODUÇÃO**

#### Migração de Banco de Dados

**Atual**: Banco Neon na nuvem (ambiente de teste)  
**Objetivo**: Servidor PostgreSQL local do CPTEC/INPE

**Ações Necessárias**:
- 🔴 Configurar servidor PostgreSQL dedicado
- 🔴 Migrar schema completo e dados de teste
- 🔴 Ajustar variáveis de ambiente (DATABASE_URL)
- 🔴 Testar conectividade e performance
- 🔴 Configurar backup automático e replicação
- 🔴 Implementar monitoramento de performance
- 🔴 Configurar firewall e segurança de rede

**Impacto**: Sistema não pode ser usado em produção até migração completa.

---

## 🔧 Troubleshooting

### Problemas Comuns

#### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs nextapp
docker-compose logs fileserver

# Verificar variáveis de ambiente
docker-compose config

# Verificar permissões dos volumes
docker-compose exec fileserver ls -la uploads/
```

#### Erro de Deploy no Vercel

```bash
# Verificar arquivos no .vercelignore
# Confirmar vercel.json na raiz do projeto
# Verificar erros de sintaxe em next.config.ts
```

#### FileServer não funciona em produção

```bash
# Configurar URLs corretas em fileserver/src/config.ts
# Verificar se servidor está rodando na porta correta
# Confirmar configuração de CORS
# Testar health check: curl http://localhost:4000/health
```

#### Problemas de Upload

```bash
# Verificar se FileServer está rodando
curl http://localhost:4000/health

# Testar upload direto
curl -X POST -F "file=@test.jpg" http://localhost:4000/api/upload

# Verificar arquivos salvos
ls fileserver/uploads/avatars/
ls fileserver/uploads/contacts/
```

### Comandos de Debug

```bash
# Entrar no container Next.js
docker-compose exec nextapp sh

# Entrar no container Fileserver
docker-compose exec fileserver sh

# Ver configuração completa
docker-compose config

# Verificar logs em tempo real
docker-compose logs -f nextapp
docker-compose logs -f fileserver
```

---

## 🤝 Guia de Contribuição

### Diretrizes

1. **PRs pequenos e focados**: Um objetivo por Pull Request
2. **Padrões obrigatórios**:
   - Imports com `@/`
   - Logs padronizados (❌, ⚠️, ℹ️)
   - TypeScript strict mode
   - Zero warnings/errors no lint
3. **Descrições objetivas**: Inclua trechos de código quando necessário
4. **Build limpo**: Garanta build e lint limpos antes de abrir PR
5. **Aprovação obrigatória**: Aguarde aprovação antes de desenvolver

### Fluxo de Trabalho

```bash
# 1. Criar branch para feature
git checkout -b feature/nome-da-feature

# 2. Fazer alterações e commitar
git add .
git commit -m "feat: descrição da feature"

# 3. Garantir qualidade
npm run lint
npm run build

# 4. Push e abrir PR
git push origin feature/nome-da-feature
```

### Convenções futuras

- **Commits**: Seguir conventional commits (feat, fix, docs, refactor, test, chore)
- **Código**: Manter legibilidade e simplicidade
- **Documentação**: Atualizar README.md quando necessário
- **Qualidade**: Garantir build e lint limpos antes de submeter PR

---

## 👨‍💻 Autor e Mantenedor

**Mario A. Sesso Junior**

- 🔗 GitHub: [@sessojunior](https://github.com/sessojunior)
- 💼 LinkedIn: [in/sessojunior](https://linkedin.com/in/sessojunior)
- 🏢 Instituição: CPTEC/INPE (Instituto Nacional de Pesquisas Espaciais)

**Projetos Relacionados**:
- [inpe-previsao-react](https://github.com/sessojunior/inpe-previsao-react) - Projeto de Previsão Numérica de Tempo (JavaScript)
- [inpe-ambiental-react](https://github.com/sessojunior/inpe-ambiental-react) - Projeto de Previsão Ambiental (JavaScript)

---

Desenvolvido para *CPTEC/INPE*. Versão: *1.0*. Última atualização: *2025*
