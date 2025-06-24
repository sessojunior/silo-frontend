# Projeto Silo

Sistema avançado de gerenciamento de produtos meteorológicos para CPTEC/INPE desenvolvido com Next.js 15, React 19, TypeScript e PostgreSQL.

## 📋 Documentação Central - CLAUDE.md

Este projeto usa o arquivo `/CLAUDE.md` na raiz como única fonte de verdade de documentação. Todo o andamento do projeto, contexto, briefing, padrões de sistema e contexto técnico estão consolidados neste arquivo único.

### 📂 Arquivo Essencial de Documentação

- **`CLAUDE.md`** - **Protocolo completo consolidado** com:
  - Status atual e próximas prioridades
  - Arquitetura técnica completa
  - Padrões de desenvolvimento estabelecidos
  - Funcionalidades implementadas
  - Contexto de negócio e produto
  - Credenciais e comandos de desenvolvimento

## 🚀 Status Atual do Projeto - Junho 2025

### ✅ Funcionalidades Completamente Implementadas (15/15)

- **Sistema de Autenticação Completo**: Login/registro, OTP, Google OAuth, recuperação de senha
- **Dashboard Administrativo**: Interface moderna com gráficos ApexCharts e estatísticas
- **CRUD de Produtos**: Gestão completa de produtos meteorológicos com problemas e soluções
- **Sistema de Problemas e Soluções**: Threading colaborativo com upload de imagens
- **Base de Conhecimento**: Estrutura hierárquica com MenuBuilder drag & drop funcional
- **Sistema de Manual do Produto**: Editor markdown com hierarquia inteligente
- **Sistema de Contatos**: CRUD completo + associação produto-contato com upload de fotos
- **Sistema de Grupos**: CRUD completo com abas navegáveis e gestão hierárquica usuários
- **Sistema de Chat WhatsApp-like**: Interface profissional com presença e real-time
- **Sistema de Ajuda**: Documentação centralizada com interface dual e navegação hierárquica
- **Sistema de Projetos**: Gestão completa com Kanban por atividade e CRUD de tarefas
- **CRUD Kanban Tarefas**: Sistema completo criar/editar/excluir tarefas com drag & drop
- **Padrão de Design Admin**: Template padronizado e consistente para todas as páginas
- **Build 100% Funcional**: Todos erros TypeScript/ESLint resolvidos
- **Sistema de Configurações**: Página unificada /admin/settings com perfil, preferências e segurança

### 🎯 Próximas Implementações - Em Desenvolvimento (1/1)

1. **🔄 Correção Sistema de Chat** - Simplificação arquitetural eliminando WebSockets e usando grupos existentes

### 📊 Progresso Total: **93.75%** (15 de 16 funcionalidades)

### 🏆 Conquistas Técnicas Recentes

- **CRUD Kanban Completo**: Sistema profissional de gestão de tarefas com formulários avançados
- **Performance Otimizada**: 95%+ redução em chamadas de API com queries SQL otimizadas
- **Refatoração Histórica**: Página de problemas reduzida de 1.506 → 629 linhas (58,2%)
- **Padrão de Design Estabelecido**: Interface consistente em todo projeto
- **Sistema de Projetos**: Kanban por atividade com drag & drop funcional

## 📁 Estrutura do Projeto

```
silo/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (auth)/              # Rotas de autenticação
│   │   │   ├── login/           # Sistema de login
│   │   │   ├── register/        # Sistema de registro
│   │   │   └── forget-password/ # Recuperação de senha
│   │   ├── (site)/              # Página pública inicial
│   │   ├── admin/               # Dashboard administrativo protegido
│   │   │   ├── dashboard/       # Página principal admin
│   │   │   ├── products/        # Gestão produtos meteorológicos
│   │   │   │   └── [slug]/      # Página individual produto
│   │   │   │       ├── page.tsx # Detalhes e dependências
│   │   │   │       └── problems/# Gestão problemas e soluções
│   │   │   ├── projects/        # Sistema de projetos
│   │   │   │   ├── page.tsx     # Lista projetos com CRUD
│   │   │   │   ├── members/     # Gestão membros many-to-many
│   │   │   │   └── [projectId]/ # Projeto individual
│   │   │   │       └── activities/[activityId]/ # Kanban por atividade
│   │   │   ├── contacts/        # Sistema de contatos
│   │   │   ├── groups/          # Sistema de grupos e usuários
│   │   │   │   ├── page.tsx     # Gestão grupos
│   │   │   │   └── users/       # Gestão usuários
│   │   │   ├── chat/            # Sistema de chat WhatsApp-like
│   │   │   ├── help/            # Sistema de ajuda e documentação
│   │   │   └── settings/        # Configurações unificadas
│   │   │       ├── page.tsx     # Perfil, preferências, segurança
│   │   │       └── products/    # Configurações produtos
│   │   └── api/                 # API Routes
│   │       ├── (user)/          # APIs usuário autenticado
│   │       │   ├── user-profile/# Perfil do usuário
│   │       │   ├── user-preferences/ # Preferências
│   │       │   └── user-password/     # Alteração senha
│   │       ├── admin/           # 🔒 APIs PROTEGIDAS ADMINISTRATIVAS
│   │       │   ├── contacts/    # CRUD contatos (protegida)
│   │       │   ├── groups/      # CRUD grupos (protegida)
│   │       │   ├── users/       # CRUD usuários (protegida)
│   │       │   ├── projects/    # CRUD projetos (protegida)
│   │       │   └── help/        # Sistema ajuda (protegida)
│   │       ├── auth/            # Autenticação e OAuth
│   │       ├── products/        # APIs produtos públicas
│   │       ├── projects/        # APIs projetos e kanban
│   │       ├── chat/            # APIs sistema de chat
│   │       └── help/            # API ajuda (pública)
│   ├── components/              # Componentes reutilizáveis
│   │   ├── ui/                  # Design system customizado
│   │   │   ├── Button.tsx       # Componente botão
│   │   │   ├── Input.tsx        # Componente input
│   │   │   ├── Dialog.tsx       # Dialog modal
│   │   │   ├── Offcanvas.tsx    # Painel lateral
│   │   │   ├── MenuBuilder.tsx  # Drag & drop hierárquico
│   │   │   └── ...              # Outros componentes base
│   │   ├── auth/                # Componentes autenticação
│   │   └── admin/               # Componentes administrativos
│   │       ├── contacts/        # Sistema contatos
│   │       ├── groups/          # Sistema grupos
│   │       ├── products/        # Sistema produtos
│   │       ├── projects/        # Sistema projetos e kanban
│   │       ├── chat/            # Sistema chat
│   │       ├── sidebar/         # Sidebar navegação
│   │       └── topbar/          # Barra superior
│   ├── context/                 # Contextos React
│   │   ├── UserContext.tsx      # Contexto usuário
│   │   ├── SidebarContext.tsx   # Contexto sidebar
│   │   └── ChatContext.tsx      # Contexto chat
│   ├── lib/                     # Utilitários e configurações
│   │   ├── db/                  # Database e ORM
│   │   │   ├── schema.ts        # Schema Drizzle completo
│   │   │   ├── seed.ts          # Dados de teste
│   │   │   └── index.ts         # Conexão database
│   │   ├── auth/                # Sistema autenticação
│   │   │   ├── token.ts         # Gestão tokens e sessões
│   │   │   ├── oauth.ts         # Google OAuth
│   │   │   └── validate.ts      # Validações
│   │   ├── toast.ts             # Sistema notificações
│   │   ├── utils.ts             # Utilitários gerais
│   │   └── rateLimit.ts         # Limitação de taxa
│   └── types/                   # Definições TypeScript
│       └── projects.ts          # Tipos sistema projetos
├── CLAUDE.md                   # 📚 DOCUMENTAÇÃO CENTRAL CONSOLIDADA
├── public/                     # Arquivos estáticos
│   ├── images/                 # Imagens do sistema
│   └── uploads/                # Uploads organizados
│       ├── contacts/           # Fotos contatos
│       ├── products/           # Imagens produtos
│       └── profile/            # Fotos perfil
├── drizzle/                    # Migrations database
└── scripts/                    # Scripts utilitários
```

## 🛠️ Stack Tecnológico

### Core Framework

- **Next.js 15.3.2+** - Framework React full-stack com App Router
- **React 19.0.0** - Biblioteca de componentes com Server Components
- **TypeScript 5** - Tipagem estática strict mode

### Database & ORM

- **PostgreSQL** - Banco de dados principal robusto e escalável
- **Drizzle ORM 0.43.1+** - ORM TypeScript-first schema-based
- **Drizzle Kit** - Migrations, studio visual e ferramentas

### UI & Styling

- **Tailwind CSS 4** - Framework CSS utilitário
- **Iconify** - Sistema de ícones com plugin Tailwind
- **Design System Customizado** - Componentes padronizados (não usa ShadCN)

### Funcionalidades Avançadas

- **ApexCharts 4.7.0** - Biblioteca de gráficos avançados
- **@dnd-kit** - Drag and drop para Kanban e MenuBuilder
- **Markdown** - Editor e renderização com highlight

## 🔧 Comandos de Desenvolvimento

```bash
# Desenvolvimento
npm run dev                # Servidor desenvolvimento com Turbopack
npm run build             # Build de produção
npm run start             # Servidor de produção

# Banco de Dados
npm run db:studio         # Interface visual Drizzle Studio
npm run db:push           # Sincronizar schema com banco
npm run db:generate       # Gerar migrations
npm run db:migrate        # Executar migrations
npm run db:seed           # Popular com dados de teste

# Qualidade de Código
npm run lint              # Verificação ESLint
```

## 🔒 APIs Protegidas Administrativas

**IMPORTANTE**: Todas as APIs administrativas estão protegidas e devem ser acessadas através do prefixo `/api/admin/*` com autenticação obrigatória.

### 🛡️ Estrutura de Segurança

```typescript
// Todas as APIs /api/admin/* verificam autenticação
const user = await getAuthUser()
if (!user) {
	return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
}
```

### 📋 APIs Administrativas Protegidas

- **`/api/admin/contacts`** - CRUD contatos (GET, POST, PUT, DELETE)
- **`/api/admin/groups`** - CRUD grupos (GET, POST, PUT, DELETE)
- **`/api/admin/users`** - CRUD usuários (GET, POST, PUT, DELETE)
- **`/api/admin/projects`** - CRUD projetos (GET, POST, PUT, DELETE)
- **`/api/admin/help`** - Sistema ajuda (GET, PUT)
- **`/api/admin/products/*`** - Produtos meteorológicos
- **`/api/admin/projects/*/activities/*/tasks`** - Kanban de tarefas
- **`/api/admin/chat/*`** - Sistema de chat

### 🔓 APIs Públicas (sem autenticação)

- **`/api/auth/*`** - Sistema de autenticação
- **`/api/(user)/*`** - APIs do usuário logado

## 🔐 Autenticação

Este aplicativo utiliza um método de autenticação baseada em sessão com cookies HttpOnly. É segura e adequada para o sistema que está sendo desenvolvido. Possui segurança contra vazamento (hash no banco), boa proteção contra XSS e CSRF, capacidade de revogação, renovação automática de sessão e controle completo do ciclo de vida do login.

Este método possui as seguintes vantagens:

1. Token aleatório + hash (SHA-256):

- Gera um token aleatório (não previsível).
- Armazena apenas o hash no banco — isso impede vazamentos críticos.
- Funciona como "password hashing", mas para tokens de sessão.

2. Cookies com boas práticas:

- **HttpOnly**: não acessível via JavaScript → proteção contra _XSS_.
- **SameSite=Lax** ou **Strict**: proteção contra _CSRF_.
- **Secure**: só em HTTPS.
- **Expires** e **Path**: escopo controlado.

3. Expiração e renovação automática:

- Sessões expiram em 30 dias.
- Renovação automática se o usuário estiver ativo.

4. Revogação de sessão:

- Dá para invalidar uma sessão específica ou todas do usuário.
- Muito útil em casos de logout, troca de senha, etc.

5. Armazenamento no servidor:

- Sessões ficam no banco → você pode revogar, monitorar, auditar.

Por esses motivos, optei por utilizar autenticação baseada em sessões com cookies HttpOnly e tokens aleatórios armazenados como hash no banco de dados. Diferentemente do JWT, que é um token auto-contido, essa abordagem permite revogação fácil e segura de sessões, evita o risco de vazamento de credenciais sensíveis e protege contra ataques comuns como XSS e CSRF. Além disso, o uso de JWT exigiria lógica adicional para renovação de tokens e mecanismos complexos de blacklist para revogação, sendo mais indicado para APIs públicas ou aplicações sem estado (sem precisar usar o banco de dados), o que não se aplica ao contexto desta aplicação.

Observação:

_XSS (Cross-Site Scripting)_ é um tipo de ataque onde scripts maliciosos podem ser inseridos em sites para roubar dados. Por exemplo, um atacante pode inserir um `<script>` que rouba dados do navegador da vítima (como cookies, tokens ou informações de formulário). Isso normalmente acontece quando a aplicação exibe dados de entrada do usuário sem a devida sanitização. XSS é perigoso principalmente quando tokens de autenticação ficam acessíveis via JavaScript, como os armazenados em localStorage.

_CSRF (Cross-Site Request Forgery)_ é um ataque onde o invasor engana um usuário autenticado a executar ações indesejadas em um site onde ele está logado. Por exemplo, se um usuário estiver autenticado em um site e clicar em um link malicioso em outro, esse link pode fazer com que o navegador envie uma requisição ao site autenticado (como enviar ou alterar dados), usando automaticamente os cookies da sessão da vítima. Por isso, é essencial usar proteções como cookies com SameSite=Lax ou Strict e tokens CSRF em formulários sensíveis.

Este sistema possui proteção contra ambos ataques.

## 🔑 Login com o Google

Para usar o Google como um provedor social, você precisa obter suas credenciais do Google.

Você pode obtê-las criando um novo projeto no [Google Cloud Console](https://console.cloud.google.com/apis/dashboard).

Estamos utilizando a biblioteca [Arctic](https://arcticjs.dev/providers/google) para simplificar o processo.

Para isso siga as seguintes etapas:

1. Dentro do [Google Cloud Console](https://console.cloud.google.com/apis/dashboard), clique no botão `Criar credenciais` e em seguida selecione `ID do cliente OAuth`.

2. Na tela a seguir, com o título `Criar ID do cliente do OAuth`, você deve selecionar o tipo de aplicativo. Selecione `Aplicativo da Web`. Depois dissom digite o nome como `Silo Auth` (mas pode ser o nome que quiser, utilize um que identifique melhor o seu aplicativo).

3. Em URIs de redirecionamento autorizados, adicione a seguinte URL: `http://localhost:3000/api/auth/callback/google` (se estiver em ambiente de desenvolvimento).

4. Irá exibir um modal, com o título `Cliente OAuth criado`. Irá exibir o `ID do cliente` e a `Chave secreta do cliente`. Você irá precisar copiar ambos.

5. Retornando ao Visual Studio Code, no arquivo `.env`, você deverá colar o conteúdo do `ID do cliente` em `GOOGLE_CLIENT_ID`. E o conteúdo da `Chave secreta do cliente` em `GOOGLE_CLIENT_SECRET`.

6. Ao fechar o modal, você verá a credencial criada em `IDs do cliente OAuth 2.0`. Se quiser ver novamente o conteúdo do `ID do cliente` e da `Chave secreta do cliente`, clique no botão com o ícone `Editar cliente OAuth`.

7. Agora já pode utilizar no projeto.

## 📧 Limitação de taxas de envio de e-mails

Para proteger o envio de e-mails com códigos OTP e outros fluxos sensíveis contra abuso, é essencial aplicar rate limiting por e-mail e IP.

O aplicativo possui limite de envio de 3 e-mails por minuto por IP, e-mail e tipo de requisição (login, recuperação de senha e verificação de código). Após 3 tentativas, exibe erro de limitação de taxa.

Registro é refeito após o tempo da janela. É feito um limpeza automática dos registros antigos (com tempo maior que 60 minutos).

## 🗄️ Banco de dados

O projeto utiliza **PostgreSQL** como banco de dados principal, oferecendo robustez, escalabilidade e suporte completo para aplicações de produção.

### 📊 Schema Principal

O sistema possui 25+ tabelas organizadas em módulos:

- **Autenticação**: `auth_user`, `auth_session`, `auth_code`, `auth_provider`
- **Usuários**: `user_profile`, `user_preferences`, `user_group`
- **Produtos**: `product`, `product_problem`, `product_solution`, `product_dependency`
- **Contatos**: `contact`, `product_contact`
- **Grupos**: `group` (6 grupos padrão)
- **Chat**: `chat_message`, `chat_user_status`, `chat_message_status`
- **Projetos**: `project`, `project_activity`, `project_task`
- **Sistema**: `help`, `rate_limit`, `system_file`

### 🔄 Migrations e Seed

```bash
# Executar migrations
npm run db:migrate

# Popular com dados de teste
npm run db:seed

# Interface visual
npm run db:studio
```

## 📈 Métricas do Projeto

- **Linhas de Código**: ~25.000 linhas TypeScript/React
- **Componentes**: 80+ componentes reutilizáveis
- **APIs**: 30+ endpoints organizados
- **Páginas**: 15+ páginas administrativas
- **Tabelas DB**: 25+ tabelas relacionais
- **Funcionalidades**: 15 sistemas completos
- **Progresso**: 93.75% concluído

## 🎯 Próximas Implementações

### 🔄 Correção Sistema de Chat (Em Andamento)

**Objetivo**: Simplificar arquitetura eliminando WebSockets e usando grupos existentes como salas de chat.

**Plano**:

1. Eliminar tabela `chat_channel` e usar `group` diretamente
2. Alterar `chat_message.channelId` → `chat_message.groupId`
3. Implementar polling simples (5 segundos) ao invés de WebSocket
4. Simplificar APIs e interface focando no essencial

## 🏆 Conquistas do Projeto

- ✅ **Sistema Produção-Ready**: Build funcional, zero erros críticos
- ✅ **Arquitetura Sólida**: Padrões estabelecidos e documentados
- ✅ **UX Profissional**: Interface consistente e intuitiva
- ✅ **Performance Otimizada**: Queries eficientes e carregamento rápido
- ✅ **Segurança Robusta**: APIs protegidas e autenticação segura
- ✅ **Documentação Completa**: Memory Bank como fonte única de verdade
