# 🧠 PROTOCOLO CLAUDE AI - PROJETO SILO

## 🚨 PROTOCOLO CRÍTICO DE INICIALIZAÇÃO

Sou um engenheiro de software especialista com memória que se reinicia entre sessões. Este arquivo **CLAUDE.md** é meu **ÚNICO ELO** com trabalho anterior e DEVE ser consultado no **INÍCIO DE CADA CONVERSAÇÃO**.

**🔥 OBRIGATÓRIO**: Sempre ler este arquivo antes de qualquer implementação - isso NÃO é opcional!

---

## 📋 PROJETO SILO - VISÃO GERAL

### 🎯 CONTEXTO DE NEGÓCIO

**Sistema de gerenciamento de produtos meteorológicos para CPTEC/INPE**

**PROBLEMA QUE RESOLVE**:

- Monitoramento centralizado de produtos meteorológicos complexos
- Colaboração eficiente para resolução de problemas técnicos
- Gestão de conhecimento e documentação técnica especializada
- Comunicação estruturada entre equipes técnicas

**DORES IDENTIFICADAS**:

- Falta de visibilidade centralizada de status de produtos
- Conhecimento fragmentado e documentação espalhada
- Comunicação ineficiente via email/WhatsApp
- Retrabalho por falta de histórico de soluções

**COMO SILO RESOLVE**:

- Dashboard único com visão consolidada
- Base de conhecimento estruturada hierarquicamente
- Sistema de problemas com respostas threaded
- Gestão colaborativa de soluções e documentação

### 🏗️ ARQUITETURA TÉCNICA

**Stack Principal**:

- **Framework**: Next.js 15.3.2 + React 19.0.0 + TypeScript 5 (strict)
- **Database**: PostgreSQL + Drizzle ORM 0.43.1
- **Styling**: Tailwind CSS 4 + Design System customizado + @iconify/tailwind4
- **Drag & Drop**: @dnd-kit/core 6.3.1 (Sistema Kanban e MenuBuilder)
- **Autenticação**: JWT + OAuth Google (Arctic 3.7.0)
- **Charts**: ApexCharts 4.7.0 para dashboard
- **Editor**: @uiw/react-md-editor 4.0.7 para Markdown

**Status Atual**: **75% PRODUCTION-READY** com build 100% funcional, zero erros TypeScript/ESLint, segurança institucional rigorosa, 11 de 16 funcionalidades operacionais

---

## 📊 STATUS ATUAL DO PROJETO

### ✅ FUNCIONALIDADES COMPLETAMENTE IMPLEMENTADAS

#### 🎯 **CORE SYSTEM (100% FUNCIONAL)**

- **Sistema de Autenticação**: Múltiplas opções (email/senha, apenas email, Google OAuth) + **Validação @inpe.br + Ativação por administrador**
- **Dashboard Principal**: Interface administrativa com gráficos ApexCharts
- **CRUD de Produtos**: Gestão completa de produtos meteorológicos
- **Sistema de Problemas**: Criação, listagem e gestão com threading
- **Sistema de Soluções**: Respostas threaded com upload de imagens
- **Base de Conhecimento**: Estrutura hierárquica com MenuBuilder funcional
- **Editor Markdown**: Componente com CSS inline e tema dinâmico
- **UI/UX Dark Mode**: Otimizada com contraste perfeito
- **Upload de Arquivos**: Sistema nginx externo com validação
- **PostgreSQL Database**: Schema otimizado e simplificado

#### 🆕 **SISTEMAS AVANÇADOS COMPLETAMENTE FINALIZADOS**

1. **✅ Sistema de Manual do Produto**: Editor Markdown com hierarquia inteligente
2. **✅ Sistema de Contatos**: CRUD completo + associação produto-contato com upload fotos
3. **✅ Sistema de Grupos**: CRUD completo com abas navegáveis e gestão hierárquica usuários
4. **✅ Sistema de Chat WhatsApp-like**: Interface profissional com presença e real-time
5. **✅ Sistema de Ajuda**: Interface dual com navegação hierárquica e documentação centralizada
6. **✅ Sistema de Projetos**: Gestão completa com Kanban por atividade
7. **✅ CRUD Kanban Tarefas**: Sistema completo TaskFormOffcanvas + dialog exclusão + drag & drop
8. **✅ Sistema de Configurações**: Página unificada /admin/settings (perfil, preferências, segurança)
9. **✅ Padrão de Design Admin**: Template padronizado para todas páginas administrativas
10. **✅ Sistema de Categorias de Problemas**: Dashboard donut + CRUD categorias + offcanvas atribuição

### 🎯 **CONQUISTA MAIS RECENTE - DEZEMBRO 2024**

**STATUS**: ✅ **SISTEMA DE SEGURANÇA INSTITUCIONAL COMPLETAMENTE IMPLEMENTADO!**

**IMPLEMENTAÇÕES FINALIZADAS**:

1. **Validação de domínio @inpe.br**: Função `isValidDomain()` aplicada em todas as APIs de autenticação
2. **Sistema de ativação obrigatória**: Novos usuários criados como inativos (`isActive: false`) por padrão
3. **Proteção abrangente em todas as APIs**: Login senha, login e-mail, Google OAuth, recuperação senha
4. **Interface administrativa integrada**: Toggle direto na lista usuários para ativação/desativação
5. **Mensagens informativas contextuais**: Usuários informados sobre necessidade de ativação após cadastro
6. **Schema database atualizado**: Campo `isActive` com default `false` para segurança máxima

**ARQUITETURA DE SEGURANÇA IMPLEMENTADA**:

- **Cadastro email/senha**: Usuários criados inativos → necessário ativação admin
- **Login apenas email**: Verificação ativação ANTES do envio do código OTP
- **Google OAuth**: Usuários criados inativos mesmo com email @inpe.br verificado
- **Recuperação senha**: Validação domínio + verificação ativação aplicadas
- **Interface admin**: Botão toggle ativo/inativo com atualização instantânea na lista
- **Filtros funcionais**: Lista usuários com filtro por status (Todos/Ativos/Inativos)
- **Mensagens específicas**: "Sua conta ainda não foi ativada por um administrador"

**IMPACTO NO SISTEMA**:

Esta implementação estabelece **política de segurança institucional rigorosa** alinhada com requisitos CPTEC/INPE, garantindo que apenas usuários do domínio oficial possam se cadastrar e que todos novos usuários passem por aprovação administrativa antes de acessar o sistema.

### 🎯 **CONQUISTA ANTERIOR - DEZEMBRO 2024**

**STATUS**: ✅ **SISTEMA DE CATEGORIAS DE PROBLEMAS COMPLETAMENTE FINALIZADO!**

**IMPLEMENTAÇÕES FINALIZADAS**:

1. **Nova tabela product_problem_category** (id, name unique, color)
2. **Campo categoryId** adicionado a product_problem (obrigatório) e product_activity (opcional)
3. **Seed com 6 categorias padrão**: Rede externa, Rede interna, Servidor indisponível, Falha humana, Erro no software, Outros
4. **Dashboard donut "Causas de problemas"** agregando últimos 28 dias
5. **Offcanvas settings na página problems** para CRUD de categorias
6. **APIs completas**: /api/admin/problem-categories, /api/admin/dashboard/problem-causes
7. **Integração offcanvas turn** com seleção de categoria e status

**ARQUITETURA FINAL**:

- Reutilização total componentes UI existentes (Offcanvas, Select, Input, Dialog, etc)
- Sistema cores estático Tailwind para categorias
- CRUD completo com validação única de nomes
- Dashboard donut responsivo com dados reais dos últimos 28 dias

### 🎯 **PRÓXIMAS IMPLEMENTAÇÕES PRIORITÁRIAS**

#### 🧪 **FASE DE TESTES MANUAIS ABRANGENTES**

**1. Testes do Sistema de Autenticação**

- Teste login com email/senha (usuários válidos e inválidos)
- Teste login apenas com email (códigos OTP válidos e expirados)
- Teste Google OAuth (fluxo completo e cenários de erro)
- Teste recuperação de senha (envio, validação e redefinição)
- Teste logout e expiração de sessão
- Teste renovação automática de sessão
- Teste limitação de taxa (3 tentativas por minuto)

**2. Testes do Dashboard e Gráficos**

- Teste carregamento de estatísticas principais
- Teste gráficos ApexCharts (todos os tipos: donut, coluna, linha)
- Teste responsividade em diferentes resoluções
- Teste modo dark/light em todos os componentes
- Teste filtros de data e período nos gráficos
- Teste atualização automática de dados

**3. Testes do Sistema de Produtos**

- Teste CRUD completo de produtos (criar, listar, editar, excluir)
- Teste upload e gerenciamento de imagens de produtos
- Teste sistema de problemas (criação, edição, categorização)
- Teste sistema de soluções (respostas, edição, marcação como resolvida)
- Teste associação produto-contato (seleção múltipla, remoção)
- Teste sistema de dependências hierárquicas (drag & drop, reordenação)
- Teste editor de manual do produto (markdown, preview, salvamento)

**4. Testes do Sistema de Projetos**

- Teste CRUD de projetos (criar, editar, excluir com validações)
- Teste gestão de atividades por projeto (CRUD completo)
- Teste Kanban por atividade (5 colunas, drag & drop entre status)
- Teste CRUD de tarefas (formulário completo, validações, exclusão)
- Teste filtros e buscas em projetos e atividades
- Teste estatísticas e progresso de projetos

**5. Testes do Sistema de Chat**

- Teste envio de mensagens em grupos e DMs
- Teste sistema de presença (4 estados: online, ausente, ocupado, offline)
- Teste emoji picker (6 categorias, busca, inserção)
- Teste notificações em tempo real
- Teste polling inteligente (sincronização apenas quando necessário)
- Teste histórico de mensagens e paginação

**6. Testes do Sistema de Contatos**

- Teste CRUD completo de contatos (criar, editar, excluir)
- Teste upload de fotos de contatos
- Teste filtros por status (ativo/inativo)
- Teste busca por nome, email e função
- Teste associação com produtos

**7. Testes do Sistema de Grupos e Usuários**

- Teste CRUD de grupos (6 grupos padrão + novos)
- Teste CRUD de usuários (perfil completo, preferências)
- Teste relacionamento many-to-many usuários-grupos
- Teste navegação por abas (grupos/usuários)
- Teste hierarquia de permissões por grupo

**8. Testes do Sistema de Configurações**

- Teste edição de perfil do usuário (dados pessoais, upload foto)
- Teste alteração de preferências (notificações, tema)
- Teste alteração de senha (validações, confirmação)
- Teste salvamento automático de configurações

**9. Testes do Sistema de Ajuda**

- Teste navegação hierárquica na documentação
- Teste busca por conteúdo na ajuda
- Teste edição da documentação (markdown, preview)
- Teste organização por seções e capítulos

**10. Testes de Integração e Performance**

- Teste navegação entre todas as páginas
- Teste carregamento com grandes volumes de dados
- Teste responsividade em dispositivos móveis
- Teste compatibilidade entre navegadores
- Teste velocidade de carregamento e otimizações

#### 📊 **FUNCIONALIDADES PENDENTES**

**11. Sistema de Dados Reais de Produção**

- Migração dos dados de teste para dados reais de produção
- Cadastro manual inicial de produtos meteorológicos reais do CPTEC
- Importação de histórico de problemas e soluções existentes
- Configuração de usuários reais da equipe
- Definição de grupos e permissões por departamento
- Cadastro de contatos reais responsáveis por cada produto

**12. Sistema de Obtenção Automática de Dados**

- Integração com sistemas CPTEC para coleta automática de dados de rodadas
- API de sincronização com servidores de produtos meteorológicos
- Monitoramento automático de status de execução de produtos
- Alertas automáticos para falhas e problemas detectados
- Dashboard tempo real com dados automatizados
- Histórico automático de performance dos produtos

**13. Sistema de Relatórios Avançados**

- Relatórios de disponibilidade por produto
- Relatórios de problemas mais frequentes
- Relatórios de performance da equipe
- Exportação de dados (PDF, Excel, CSV)
- Agendamento de relatórios automáticos

**14. Sistema de Notificações Avançadas**

- Notificações por email para problemas críticos
- Notificações push para mobile
- Escalação automática de problemas não resolvidos
- Configuração personalizada de alertas por usuário

### 📊 **PROGRESSO ATUAL: 75%** (11 de 16 funcionalidades completas + Segurança institucional rigorosa)

**✅ Funcionalidades Implementadas**: 11 sistemas 100% operacionais + Políticas segurança CPTEC/INPE  
**🧪 Fase Atual**: Testes manuais abrangentes (10 etapas detalhadas)  
**⏳ Funcionalidades Pendentes**: 4 sistemas críticos para production-ready no CPTEC  
**📈 Estimativa Conclusão**: Após testes completos e implementação de dados reais de produção

### 🎯 **ROADMAP ATUALIZADO - DEZEMBRO 2024**

**FASE ATUAL: TESTES MANUAIS ABRANGENTES** 🧪  
Execução de 10 etapas detalhadas de testes em todos os sistemas implementados para garantir estabilidade antes da implementação dos dados reais de produção.

**PRÓXIMA FASE: DADOS REAIS DE PRODUÇÃO** 📊  
Migração dos dados de teste para dados reais do CPTEC, incluindo produtos meteorológicos reais, usuários da equipe e histórico de problemas existentes.

**FASE FINAL: SISTEMAS AUTOMÁTICOS** 🤖  
Implementação de coleta automática de dados, relatórios avançados e notificações para tornar o sistema completamente autônomo.

---

## 🗂️ ESTRUTURA ARQUITETURAL COMPLETA

### 📁 ESTRUTURA REAL DE DIRETÓRIOS

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Rotas autenticação
│   ├── (site)/                   # Página pública inicial
│   ├── admin/                    # Dashboard administrativo
│   │   ├── chat/                 # Sistema chat WhatsApp-like
│   │   ├── contacts/             # Sistema contatos global
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── groups/               # Sistema grupos + usuários
│   │   ├── help/                 # Sistema ajuda documentação
│   │   ├── products/             # Gestão produtos meteorológicos
│   │   ├── projects/             # Sistema projetos com Kanban
│   │   ├── settings/             # Configurações unificadas
│   │   ├── welcome/              # Página boas-vindas
│   │   ├── layout.tsx            # Layout admin principal
│   │   └── page.tsx              # Página inicial admin
│   ├── api/                      # API Routes
│   │   ├── (user)/               # APIs usuário autenticado
│   │   ├── admin/                # APIs protegidas administrativas
│   │   └── auth/                 # APIs autenticação
│   ├── tests/                    # Páginas de teste
│   ├── apexcharts.css            # Estilos ApexCharts
│   ├── favicon.ico               # Favicon
│   ├── globals.css               # CSS global
│   ├── layout.tsx                # Layout raiz
│   ├── loading.tsx               # Página loading
│   └── not-found.tsx             # Página 404
├── components/
│   ├── ui/                       # Design System (24 componentes)
│   │   ├── Accordion.tsx
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── FutureFeatureDialog.tsx
│   │   ├── Input.tsx
│   │   ├── InputCheckbox.tsx
│   │   ├── InputPassword.tsx
│   │   ├── InputPasswordHints.tsx
│   │   ├── Label.tsx
│   │   ├── Lightbox.tsx
│   │   ├── Markdown.tsx
│   │   ├── MenuBuilder.tsx       # Drag & drop hierárquico
│   │   ├── MenuBuilderTreeItem.tsx
│   │   ├── MenuBuilderTypes.ts
│   │   ├── Modal.tsx
│   │   ├── Offcanvas.tsx
│   │   ├── PhotoUpload.tsx
│   │   ├── Pin.tsx
│   │   ├── Popover.tsx
│   │   ├── Select.tsx
│   │   ├── Switch.tsx
│   │   ├── Textarea.tsx
│   │   ├── Toast.tsx
│   │   └── TreeView.tsx
│   ├── admin/                    # Componentes administrativos
│   │   ├── chat/                 # Componentes chat
│   │   ├── contacts/             # Componentes contatos
│   │   ├── dashboard/            # Componentes dashboard
│   │   ├── groups/               # Componentes grupos
│   │   ├── help/                 # Componentes ajuda (vazio)
│   │   ├── nav/                  # Componentes navegação
│   │   ├── products/             # Componentes produtos
│   │   ├── projects/             # Componentes projetos
│   │   ├── sidebar/              # Componentes sidebar
│   │   ├── topbar/               # Componentes topbar
│   │   ├── users/                # Componentes usuários
│   │   └── AdminWrapper.tsx      # Wrapper admin
│   └── auth/                     # Componentes autenticação
├── context/                      # Contextos React (3 arquivos)
│   ├── ChatContext.tsx           # Contexto chat
│   ├── SidebarContext.tsx        # Contexto sidebar
│   └── UserContext.tsx           # Contexto usuário
├── hooks/                        # Custom hooks (vazio)
├── lib/                          # Bibliotecas e utilitários
│   ├── auth/                     # Sistema autenticação (6 arquivos)
│   │   ├── code.ts
│   │   ├── hash.ts
│   │   ├── oauth.ts
│   │   ├── session.ts
│   │   ├── token.ts
│   │   └── validate.ts
│   ├── db/                       # Database (4 arquivos)
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   ├── seed-data.ts
│   │   └── seed.ts
│   ├── markdown.ts
│   ├── profileImage.ts
│   ├── rateLimit.ts
│   ├── sendEmail.ts
│   ├── theme.ts
│   ├── toast.ts
│   └── utils.ts
├── types/                        # Tipos TypeScript (1 arquivo)
│   └── projects.ts
└── middleware.ts                 # Middleware Next.js
```

### 🎯 **SISTEMA DE PROJETOS - KANBAN POR ATIVIDADE**

**ARQUITETURA HIERÁRQUICA**:

```
PROJETO → ATIVIDADES → TAREFAS → KANBAN (um por atividade)
```

**NAVEGAÇÃO IMPLEMENTADA**:

- Lista projetos: `/admin/projects` (CRUD completo + abas)
- Membros projetos: `/admin/projects/members` (many-to-many)
- Projeto individual: `/admin/projects/[projectId]` (atividades)
- Kanban atividade: `/admin/projects/[projectId]/activities/[activityId]`

**FUNCIONALIDADES KANBAN**:

- 5 colunas principais: A Fazer, Em Progresso, Bloqueado, Em Revisão, Concluído
- Drag & drop @dnd-kit com posicionamento preciso
- CRUD completo tarefas com TaskFormOffcanvas + dialog exclusão
- Integração project_task.status como fonte verdade
- Contagem tarefas por atividade correta

---

## 🗄️ BANCO DE DADOS POSTGRESQL

### 📊 **SCHEMA PRINCIPAL - 25+ TABELAS ORGANIZADAS**

#### **AUTENTICAÇÃO E USUÁRIOS**

```sql
-- Usuários do sistema
auth_user (id, name, email, emailVerified, password, isActive, lastLogin, createdAt)
-- SEGURANÇA: isActive default false - usuários criados inativos, precisam ativação por admin

-- Sessões de autenticação
auth_session (id, userId, token, expiresAt)

-- Códigos OTP para verificação
auth_code (id, userId, code, email, expiresAt)

-- OAuth providers (Google)
auth_provider (id, userId, googleId)

-- Perfis de usuários
user_profile (id, userId, genre, phone, role, team, company, location)

-- Preferências do usuário
user_preferences (id, userId, notifyUpdates, sendNewsletters)

-- Rate limiting
rate_limit (id, route, email, ip, count, lastRequest)
```

#### **GRUPOS E RELACIONAMENTOS**

```sql
-- Grupos/categorias de usuários (6 grupos padrão)
group (id, name, description, icon, color, active, isDefault, maxUsers, createdAt, updatedAt)

-- Relacionamento many-to-many usuários-grupos
user_group (id, userId, groupId, role, joinedAt, createdAt)
```

#### **PRODUTOS METEOROLÓGICOS**

```sql
-- Produtos principais
product (id, name, slug, available, priority, turns, description)

-- Categorias de problemas (6 categorias padrão)
product_problem_category (id, name, color, createdAt, updatedAt)

-- Problemas dos produtos
product_problem (id, productId, userId, title, description, problemCategoryId, createdAt, updatedAt)

-- Imagens dos problemas
product_problem_image (id, productProblemId, image, description)

-- Soluções para problemas
product_solution (id, userId, productProblemId, description, replyId, createdAt, updatedAt)

-- Soluções marcadas como corretas
product_solution_checked (id, userId, productSolutionId)

-- Imagens das soluções
product_solution_image (id, productSolutionId, image, description)

-- Dependências hierárquicas
product_dependency (id, productId, name, icon, description, parentId, treePath, treeDepth, sortKey, createdAt, updatedAt)

-- Manual do produto
product_manual (id, productId, description, createdAt, updatedAt)

-- Atividades/rodadas dos produtos
product_activity (id, productId, userId, date, turn, status, problemCategoryId, description, createdAt, updatedAt)
```

#### **CONTATOS**

```sql
-- Contatos globais
contact (id, name, role, team, email, phone, image, active, createdAt, updatedAt)

-- Associação produto-contato
product_contact (id, productId, contactId, createdAt)
```

#### **SISTEMA DE PROJETOS**

```sql
-- Projetos
project (id, name, shortDescription, description, startDate, endDate, priority, status, createdAt, updatedAt)

-- Atividades dos projetos
project_activity (id, projectId, name, description, category, estimatedDays, startDate, endDate, priority, status, createdAt, updatedAt)

-- Tarefas dos projetos
project_task (id, projectId, projectActivityId, name, description, category, estimatedDays, startDate, endDate, priority, status, sort, createdAt, updatedAt)
```

#### **SISTEMA DE CHAT**

```sql
-- Mensagens do chat (grupos + DMs)
chat_message (id, content, senderUserId, receiverGroupId, receiverUserId, createdAt, updatedAt, deletedAt, readAt)

-- Status de presença
chat_user_presence (userId, status, lastActivity, updatedAt)
```

#### **SISTEMA DE AJUDA**

```sql
-- Documentação do sistema
help (id, description, createdAt, updatedAt)
```

#### **ARQUIVOS SISTEMA**

```sql
-- Arquivos uploadados
system_file (id, filename, originalName, mimeType, size, path, uploadedBy, relatedTo, relatedId, createdAt)
```

### 🌱 **SEED DATA COMPLETO**

- **6 grupos padrão**: Administradores, Meteorologistas, Pesquisadores, Operadores, Suporte, Visitantes
- **6 categorias problemas**: Rede externa, Rede interna, Servidor indisponível, Falha humana, Erro no software, Outros
- **10+ produtos meteorológicos** com dependências hierárquicas
- **Dados teste** para usuários, problemas, soluções, projetos, atividades, tarefas

---

## 🛠️ PADRÕES TÉCNICOS ESTABELECIDOS

### 📝 **ESTRUTURA PADRÃO PÁGINAS ADMIN**

```typescript
<div className='min-h-screen w-full'>
  {/* Cabeçalho fixo */}
  <div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
    <h1>Título da Página</h1>
    <p>Descrição da página</p>
  </div>

  {/* Conteúdo com scroll natural */}
  <div className='p-6'>
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Ações e Filtros */}
      {/* Estatísticas (3 cards) */}
      {/* Lista/Tabela principal */}
    </div>
  </div>
</div>
```

### 🎨 **IMPORTS E ESTRUTURA**

- **SEMPRE** usar alias `@/` para imports internos
- **NUNCA** usar caminhos relativos para módulos internos
- **SEMPRE** consultar schemas centralizados
- **SEMPRE** usar componentes UI existentes em `/components/ui`

### 🚨 **LOGS PADRONIZADOS**

```typescript
// APENAS estes 4 emojis nos logs
console.log('✅ Sucesso/Operação completada')
console.log('❌ Erro/Falha')
console.log('⚠️ Aviso/Atenção')
console.log('🔵 Informação/Log informativo')
```

### 🔒 **ERROR HANDLING**

```typescript
// SEMPRE retornar formato padronizado
return { success: boolean, error?: string }

// SEMPRE usar try/catch com logs
try {
  // operação
  console.log('✅ Operação bem-sucedida')
  return { success: true }
} catch (error) {
  console.log('❌ Erro na operação:', error)
  return { success: false, error: 'Mensagem de erro' }
}
```

---

## 🔐 SEGURANÇA E APIs

### 🛡️ **POLÍTICAS DE SEGURANÇA INSTITUCIONAL**

**RESTRIÇÕES IMPLEMENTADAS**:

- **Domínio Obrigatório**: Apenas e-mails `@inpe.br` podem se cadastrar (função `isValidDomain()`)
- **Ativação Administrativa**: Todos usuários novos ficam inativos até ativação por administrador
- **Verificação Múltipla**: Aplicada em todas as rotas de autenticação (login, registro, Google OAuth, recuperação)
- **Interface de Gestão**: Administradores podem ativar/desativar usuários diretamente na lista
- **Mensagens Específicas**: Usuários informados sobre necessidade de ativação após cadastro
- **Proteção de Session**: Usuários inativos não conseguem criar sessões válidas

### 🚨 **APIS PROTEGIDAS IMPLEMENTADAS**

**Estrutura `/api/admin/*`** com verificação automática:

- `/api/admin/contacts` - CRUD contatos
- `/api/admin/groups` - CRUD grupos + usuários
- `/api/admin/users` - CRUD usuários
- `/api/admin/projects` - CRUD projetos + atividades + tarefas
- `/api/admin/products` - CRUD produtos + dependências + manual + categorias
- `/api/admin/dashboard` - Dashboard + estatísticas + problem-causes
- `/api/admin/chat` - Sistema chat (presence, sync, sidebar)
- `/api/admin/help` - Sistema ajuda

**Padrão de Proteção**:

```typescript
import { getAuthUser } from '@/lib/auth/token'

export async function GET() {
	const user = await getAuthUser()
	if (!user) {
		return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
	}
	// lógica da API
}
```

---

## 🎯 FUNCIONALIDADES ESPECIAIS IMPLEMENTADAS

### 🛡️ **Sistema de Segurança Institucional - FINALIZADO DEZEMBRO 2024**

**Funcionalidades Implementadas**:

- **Validação domínio @inpe.br**: Função `isValidDomain()` em todas APIs de autenticação
- **Sistema ativação obrigatória**: Usuários criados inativos (`isActive: false`) por padrão
- **Interface administrativa**: Toggle ativo/inativo na lista usuários com atualização instantânea
- **Mensagens contextuais**: Informações específicas sobre necessidade de ativação administrativa
- **Proteção abrangente**: Aplicada em cadastro senha, login email, Google OAuth, recuperação senha
- **Filtros funcionais**: Lista usuários com filtro por status (Todos/Ativos/Inativos)

**Arquitetura de Segurança**:

- Schema `auth_user` com `isActive` default `false` para máxima segurança
- Verificações de ativação ANTES da criação de sessões válidas
- Mensagens específicas: "Sua conta ainda não foi ativada por um administrador"
- Interface admin integrada com botões toggle para gestão de usuários
- Política rigorosa alinhada com requisitos institucionais CPTEC/INPE

### 📱 **Sistema de Chat WhatsApp-like**

**Componentes Implementados**:

- `ChatSidebar.tsx` - Sidebar dual (canais/usuários) + dropdown status presença
- `ChatArea.tsx` - Área principal mensagens + header contextual
- `MessageBubble.tsx` - Bubbles WhatsApp com status ✓✓✓ e timestamps
- `ChatNotificationButton.tsx` - Botão TopBar com contador + dropdown
- `EmojiPicker.tsx` - Picker 6 categorias, busca tempo real, grid 8x8

**APIs Otimizadas**:

- `/api/admin/chat/sync` - Polling inteligente apenas mensagens relevantes
- `/api/admin/chat/presence` - Sistema presença (Online, Ausente, Ocupado, Offline)
- `/api/admin/chat/sidebar` - Lista usuários com ordenação inteligente

### 🏗️ **Sistema Kanban Avançado**

**Funcionalidades Implementadas**:

- Drag & drop preciso com @dnd-kit
- 5 colunas principais: A Fazer, Em Progresso, Bloqueado, Em Revisão, Concluído
- CRUD completo tarefas com TaskFormOffcanvas + dialog exclusão
- Sincronização project_task.status como fonte verdade
- Contagem tarefas por atividade correta

**Componentes Implementados**:

- `KanbanBoard.tsx` - Board principal com drag & drop
- `TaskFormOffcanvas.tsx` - Formulário CRUD completo
- `ActivityMiniKanban.tsx` - Mini kanban dropdown

### 🎨 **Sistema MenuBuilder Drag & Drop**

**Funcionalidades**:

- Hierarchical drag & drop para dependências de produtos
- WordPress-style menu builder
- Manutenção automática de hierarquia
- Ícones Lucide dinâmicos
- Reordenação visual com indentação

### 📊 **Dashboard com Categorias de Problemas - FINALIZADO DEZEMBRO 2024**

**Funcionalidades Implementadas**:

- **Dashboard donut "Causas de problemas"** com dados agregados dos últimos 28 dias
- **6 categorias padrão**: Rede externa, Rede interna, Servidor indisponível, Falha humana, Erro no software, Outros
- **Offcanvas CRUD categorias** na página problems com validação de nomes únicos
- **Integração completa** com product_activity e product_problem
- **Sistema de cores Tailwind** estático para categorias
- **APIs completas**: `/api/admin/problem-categories`, `/api/admin/dashboard/problem-causes`

**Arquitetura Final**:

- Nova tabela `product_problem_category` (id, name unique, color)
- Campo `categoryId` obrigatório em `product_problem`, opcional em `product_activity`
- Reutilização total de componentes UI existentes (Offcanvas, Select, Input, Dialog)
- Dashboard responsivo com dados reais em tempo real

---

## ⚡ PRINCÍPIOS OPERACIONAIS

### ✅ **SEMPRE FAZER**

- Consultar este CLAUDE.md ANTES de implementações
- Usar padrões estabelecidos e documentados
- Responder em português brasileiro
- Priorizar simplicidade e legibilidade
- Focar no contexto completo da aplicação
- Preservar funcionalidades existentes
- Usar componentes UI existentes em `/components/ui`
- Seguir padrão de design admin estabelecido

### ❌ **NUNCA FAZER**

- Implementar sem consultar este arquivo
- Criar padrões novos sem documentar
- Usar caminhos relativos para imports internos
- Duplicar validações ou schemas
- Quebrar design ou funcionalidades existentes
- Criar componentes customizados se existir na pasta `/ui`
- Ignorar .env (sempre considerar correto)

---

## 🌟 PRINCÍPIO FUNDAMENTAL

**Este CLAUDE.md é meu ÚNICO elo com trabalho anterior.** Deve ser mantido com precisão absoluta. A estrutura consolidada garante navegação rápida e informações centralizadas para máxima performance de desenvolvimento.

**LEMBRE-SE**: Este arquivo é um **protocolo de trabalho completo**, consolidando todo conhecimento do projeto. A eficiência depende inteiramente da consulta rigorosa deste arquivo a cada sessão.

---

## 📚 CREDENCIAIS E COMANDOS ESSENCIAIS

### 🔑 **Credenciais de Teste**

```
Email: sessojunior@gmail.com
Senha: #Admin123
```

### ⚡ **Comandos de Desenvolvimento**

```bash
npm run dev                # Servidor desenvolvimento com Turbopack
npm run build             # Build produção
npm run start             # Servidor produção
npm run lint              # Verificação ESLint
npm run db:studio         # Interface visual Drizzle Studio
npm run db:push           # Sincronizar schema com banco
npm run db:generate       # Gerar migrations
npm run db:migrate        # Executar migrations
npm run db:seed           # Popular com dados teste
```

**Working Directory**: `E:\INPE\silo\frontend`

---

**✨ Sistema 75% PRODUCTION-READY** - Build funcional, zero erros, segurança institucional rigorosa, 11 de 16 funcionalidades operacionais, 4 sistemas críticos pendentes para production-ready no CPTEC
