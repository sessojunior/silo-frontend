# Projeto Silo

Sistema avançado de gerenciamento de produtos meteorológicos para CPTEC/INPE desenvolvido com Next.js 15.3.2, React 19.0.0, TypeScript 5 e PostgreSQL.

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

## 🚀 Status Atual do Projeto

### ✅ Funcionalidades Implementadas (12 completas)

- **Sistema de Autenticação Completo**: Login/registro, OTP, Google OAuth, recuperação de senha **+ Validação @inpe.br + Ativação por administrador**
- **Dashboard Administrativo**: Interface moderna com gráficos ApexCharts e estatísticas
- **CRUD de Produtos**: Gestão completa de produtos meteorológicos com problemas e soluções
- **Sistema de Problemas e Soluções**: Threading colaborativo com upload de imagens via UploadThing
- **Base de Conhecimento**: Estrutura hierárquica com MenuBuilder drag & drop funcional
- **Sistema de Manual do Produto**: Editor markdown com hierarquia inteligente
- **Sistema de Contatos**: CRUD completo + associação produto-contato com upload de fotos via UploadThing
- **Sistema de Grupos**: CRUD completo com abas navegáveis e gestão hierárquica usuários
- **Sistema de Chat WhatsApp-like**: Interface profissional com presença e real-time completamente funcional
- **Sistema de Ajuda**: Documentação centralizada com interface dual e navegação hierárquica
- **✅ Sistema de Categorias de Problemas**: **COMPLETAMENTE FINALIZADO** com dashboard donut "Causas de problemas", CRUD categorias, 6 categorias padrão (Rede externa, Rede interna, Servidor indisponível, Falha humana, Erro no software, Outros), offcanvas settings integrado, APIs completas /api/admin/problem-categories e /api/admin/dashboard/problem-causes
- **✅ Sistema de Segurança Avançada**: **COMPLETAMENTE FINALIZADO** com validação de domínio @inpe.br obrigatória e sistema de ativação por administrador para todos usuários novos

### 🎯 Conquistas Recentes

**✅ SISTEMA DE UPLOAD COM UPLOADTHING V7 COMPLETAMENTE IMPLEMENTADO!**

**Implementações Finalizadas**:

1. **Integração UploadThing v7** com `UPLOADTHING_TOKEN` para autenticação na nuvem
2. **FileRouter configurado** com 3 endpoints para diferentes tipos de uploads:
   - `avatarUploader`: Avatar de usuário com resize automático (128x128 WebP)
   - `contactImageUploader`: Imagens de contatos (até 4MB)
   - `problemImageUploader`: Imagens de problemas/soluções (até 3 imagens, 4MB cada)
3. **Componentes 100% migrados** para usar UploadThing:
   - `PhotoUpload.tsx`: Avatar com UploadButton
   - `ContactFormOffcanvas.tsx`: Upload de fotos de contatos
   - `ProblemFormOffcanvas.tsx`: Upload de imagens de problemas
   - `SolutionFormModal.tsx`: Upload de imagens de soluções
4. **APIs completamente refatoradas** - apenas aceitam `imageUrl` do UploadThing
5. **DELETE via UploadThing**: Exclusão de arquivos na nuvem quando removidos do sistema
6. **Diretório public/uploads removido**: Todo upload agora é via UploadThing

**✅ SISTEMA DE ATIVAÇÃO POR ADMINISTRADOR COMPLETAMENTE IMPLEMENTADO!**

**Implementações Finalizadas**:

1. **Validação de domínio @inpe.br**: Apenas e-mails do domínio institucional são permitidos para cadastro
2. **Sistema de ativação obrigatória**: Novos usuários são criados inativos e precisam ser ativados por administrador
3. **Proteção em todas as APIs de autenticação**: Login com senha, apenas e-mail, Google OAuth e recuperação de senha
4. **Interface administrativa completa**: Botão toggle para ativar/desativar usuários diretamente na lista
5. **Mensagens informativas**: Usuários são informados sobre necessidade de ativação após cadastro
6. **Schema atualizado**: Campo `isActive` com default `false` para novos usuários

**Arquitetura de Segurança**:

- Usuários criados via cadastro com senha → inativos por padrão
- Usuários criados via login apenas e-mail → verificação de ativação antes do OTP
- Usuários criados via Google OAuth → inativos por padrão mesmo com e-mail verificado
- Interface admin com switch para ativação/desativação direta
- Filtros na lista de usuários para visualizar ativos/inativos
- Mensagens de erro específicas informando sobre necessidade de ativação

### 🏆 Conquista Anterior - Sistema de Categorias de Problemas

**✅ SISTEMA DE CATEGORIAS DE PROBLEMAS COMPLETAMENTE FINALIZADO!**

**Implementações Finalizadas**:

1. **Nova tabela product_problem_category** (id, name unique, color)
2. **Campo categoryId** adicionado a product_problem (obrigatório) e product_activity (opcional)
3. **Seed com 6 categorias padrão**: Rede externa, Rede interna, Servidor indisponível, Falha humana, Erro no software, Outros
4. **Dashboard donut "Causas de problemas"** agregando últimos 28 dias
5. **Offcanvas settings na página problems** para CRUD de categorias
6. **APIs completas**: /api/admin/problem-categories, /api/admin/dashboard/problem-causes
7. **Integração offcanvas turn** com seleção de categoria e status

**Arquitetura Final**:

- Reutilização total componentes UI existentes (Offcanvas, Select, Input, Dialog, etc)
- Sistema cores estático Tailwind para categorias
- CRUD completo com validação única de nomes
- Dashboard donut responsivo com dados reais dos últimos 28 dias

### 🧪 Próxima Fase: Testes Manuais Abrangentes (10 etapas)

1. **Testes Sistema de Autenticação** - Login/logout, OAuth, recuperação senha, limitação taxa
2. **Testes Dashboard e Gráficos** - ApexCharts, responsividade, modo dark/light, filtros
3. **Testes Sistema de Produtos** - CRUD, problemas, soluções, dependências, manual
4. **Testes Sistema de Projetos** - CRUD, Kanban, atividades, tarefas, estatísticas
5. **Testes Sistema de Chat** - Mensagens, presença, emoji picker, notificações real-time
6. **Testes Sistema de Contatos** - CRUD, upload fotos, filtros, associações produtos
7. **Testes Grupos e Usuários** - Many-to-many, permissões, abas navegação
8. **Testes Configurações** - Perfil, preferências, segurança, upload foto
9. **Testes Sistema de Ajuda** - Navegação hierárquica, busca, edição markdown
10. **Testes Integração** - Performance, mobile, navegadores, carregamento grandes volumes

### ⏳ Funcionalidades Pendentes para Sistema Production-Ready

1. **Sistema de Dados Reais de Produção**  
   • Migração dos dados de teste para dados reais de produção do CPTEC  
   • Cadastro manual inicial de produtos meteorológicos reais  
   • Importação de histórico existente de problemas e soluções  
   • Configuração de usuários reais da equipe

2. **Sistema de Obtenção Automática de Dados das Rodadas**  
   • Integração com sistemas CPTEC para coleta automática de dados de rodadas  
   • API de sincronização com servidores de produtos meteorológicos  
   • Monitoramento automático de status de execução de produtos  
   • Alertas automáticos para falhas e problemas detectados

3. **Sistema de Relatórios Avançados**  
   • Relatórios de disponibilidade por produto  
   • Relatórios de problemas mais frequentes  
   • Relatórios de performance da equipe  
   • Exportação de dados (PDF, Excel, CSV)

4. **Sistema de Notificações Avançadas**  
   • Notificações por email para problemas críticos  
   • Notificações push para mobile  
   • Escalação automática de problemas não resolvidos  
   • Configuração personalizada de alertas por usuário

### 📊 Progresso Total: **75%** (12 de 16 funcionalidades completas)

**✅ Sistemas Implementados**: 12 funcionalidades 100% operacionais  
**🧪 Fase Atual**: Testes manuais abrangentes (10 etapas de testes detalhados)  
**⏳ Sistemas Pendentes**: 4 funcionalidades críticas para production-ready no CPTEC  
**📈 Estimativa Conclusão**: Após testes completos e implementação de dados reais de produção

### 🏆 Conquistas Técnicas

- **Sistema de Segurança Avançada**: Validação @inpe.br + ativação por administrador em todas APIs
- **CRUD Kanban Completo**: Sistema profissional de gestão de tarefas com formulários avançados
- **Performance Otimizada**: 95%+ redução em chamadas de API com queries SQL otimizadas
- **Refatoração Histórica**: Página de problemas reduzida de 1.506 → 629 linhas (58,2%)
- **Padrão de Design Estabelecido**: Interface consistente em todo projeto
- **Sistema de Projetos**: Kanban por atividade com drag & drop funcional
- **MenuBuilder Funcional**: Drag & drop hierárquico estilo WordPress
- **Chat WhatsApp-like Finalizado**: Sistema profissional com presença real-time 100% funcional
- **Dashboard com Categorias**: Donut chart causas de problemas + CRUD categorias completo

## 📁 Estrutura Real do Projeto

```
frontend/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/             # Rotas de autenticação
│   │   ├── (site)/             # Página pública inicial
│   │   ├── admin/              # Dashboard administrativo
│   │   │   ├── chat/           # Sistema chat WhatsApp-like
│   │   │   ├── contacts/       # Sistema contatos global
│   │   │   ├── dashboard/      # Dashboard principal
│   │   │   ├── groups/         # Sistema grupos + usuários
│   │   │   ├── help/           # Sistema ajuda
│   │   │   ├── products/       # Gestão produtos meteorológicos
│   │   │   │   └── [slug]/     # Página individual produto
│   │   │   │       └── problems/ # Gestão problemas + soluções
│   │   │   ├── projects/       # Sistema projetos
│   │   │   │   └── [projectId]/ # Projeto individual
│   │   │   │       └── activities/[activityId]/ # Kanban por atividade
│   │   │   ├── settings/       # Configurações unificadas
│   │   │   └── welcome/        # Página boas-vindas
│   │   ├── api/                # API Routes
│   │   │   ├── (user)/         # APIs usuário autenticado
│   │   │   ├── admin/          # 🔒 APIs protegidas administrativas
│   │   │   └── auth/           # APIs autenticação
│   │   └── tests/              # Páginas de teste
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Design system (24 componentes)
│   │   │   ├── Button.tsx      # Componente botão
│   │   │   ├── Input.tsx       # Componente input
│   │   │   ├── Dialog.tsx      # Dialog modal
│   │   │   ├── Offcanvas.tsx   # Painel lateral
│   │   │   ├── MenuBuilder.tsx # Drag & drop hierárquico
│   │   │   ├── Switch.tsx      # Toggle switch
│   │   │   ├── Select.tsx      # Dropdown select
│   │   │   ├── Markdown.tsx    # Editor/viewer markdown
│   │   │   └── ...             # Outros componentes base
│   │   ├── admin/              # Componentes administrativos
│   │   │   ├── chat/           # Componentes chat
│   │   │   ├── contacts/       # Componentes contatos
│   │   │   ├── dashboard/      # Componentes dashboard
│   │   │   ├── groups/         # Componentes grupos
│   │   │   ├── products/       # Componentes produtos
│   │   │   ├── projects/       # Componentes projetos + kanban
│   │   │   ├── sidebar/        # Navegação lateral
│   │   │   ├── topbar/         # Barra superior
│   │   │   └── users/          # Componentes usuários
│   │   └── auth/               # Componentes autenticação
│   ├── context/                # Contextos React (3 arquivos)
│   │   ├── ChatContext.tsx     # Contexto chat
│   │   ├── SidebarContext.tsx  # Contexto sidebar
│   │   └── UserContext.tsx     # Contexto usuário
│   ├── hooks/                  # Custom hooks (vazio)
│   ├── lib/                    # Utilitários e configurações
│   │   ├── db/                 # Database e ORM (4 arquivos)
│   │   │   ├── schema.ts       # Schema Drizzle completo
│   │   │   ├── seed.ts         # Dados de teste
│   │   │   ├── seed-data.ts    # Dados seed organizados
│   │   │   └── index.ts        # Conexão database
│   │   ├── auth/               # Sistema autenticação (6 arquivos)
│   │   │   ├── token.ts        # Gestão tokens e sessões
│   │   │   ├── oauth.ts        # Google OAuth
│   │   │   ├── session.ts      # Gestão sessões
│   │   │   ├── validate.ts     # Validações
│   │   │   ├── code.ts         # Códigos OTP
│   │   │   └── hash.ts         # Hash de senhas
│   │   ├── toast.ts            # Sistema notificações
│   │   ├── utils.ts            # Utilitários gerais
│   │   ├── rateLimit.ts        # Limitação de taxa
│   │   ├── theme.ts            # Gestão tema dark/light
│   │   ├── markdown.ts         # Utilitários markdown
│   │   ├── profileImage.ts     # Upload imagem perfil
│   │   └── sendEmail.ts        # Envio emails
│   ├── types/                  # Definições TypeScript (1 arquivo)
│   │   └── projects.ts         # Tipos sistema projetos
│   └── middleware.ts           # Middleware Next.js
├── CLAUDE.md                   # 📚 DOCUMENTAÇÃO CENTRAL CONSOLIDADA
├── public/                     # Arquivos estáticos
│   └── images/                 # Imagens do sistema
├── drizzle/                    # Migrations database
└── scripts/                    # Scripts utilitários
```

## 🛠️ Stack Tecnológico

### Core Framework

- **Next.js 15.3.2** - Framework React full-stack com App Router
- **React 19.0.0** - Biblioteca de componentes com Server Components
- **TypeScript 5** - Tipagem estática strict mode
- **UploadThing v7** - Gerenciamento de uploads de imagens na nuvem

### Database & ORM

- **PostgreSQL** - Banco de dados principal robusto e escalável
- **Drizzle ORM 0.43.1** - ORM TypeScript-first schema-based
- **Drizzle Kit 0.31.1** - Migrations, studio visual e ferramentas

### UI & Styling

- **Tailwind CSS 4** - Framework CSS utilitário
- **@iconify/tailwind4 1.0.6** - Sistema de ícones com plugin Tailwind
- **Design System Customizado** - 24 componentes padronizados (não usa ShadCN)

### Funcionalidades Avançadas

- **ApexCharts 4.7.0** - Biblioteca de gráficos avançados para dashboard
- **@dnd-kit/core 6.3.1** - Drag and drop para Kanban e MenuBuilder
- **@uiw/react-md-editor 4.0.7** - Editor markdown completo
- **Arctic 3.7.0** - OAuth Google simplificado
- **Nodemailer 7.0.3** - Envio de emails OTP
- **UploadThing v7** - Upload de imagens na nuvem com processamento automático

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
	return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}
```

### 🔐 Políticas de Segurança Institucional

**RESTRIÇÕES IMPLEMENTADAS**:

- **Domínio Obrigatório**: Apenas e-mails `@inpe.br` podem se cadastrar
- **Ativação Administrativa**: Usuários novos ficam inativos até ativação por administrador
- **Verificação Múltipla**: Aplicada em todas as rotas de autenticação (login, registro, Google OAuth, recuperação)
- **Interface de Gestão**: Administradores podem ativar/desativar usuários diretamente na lista

### 📋 APIs Administrativas Protegidas

- **`/api/admin/contacts`** - CRUD contatos (GET, POST, PUT, DELETE)
- **`/api/admin/groups`** - CRUD grupos (GET, POST, PUT, DELETE)
- **`/api/admin/users`** - CRUD usuários (GET, POST, PUT, DELETE)
- **`/api/admin/projects`** - CRUD projetos (GET, POST, PUT, DELETE)
- **`/api/admin/help`** - Sistema ajuda (GET, PUT)
- **`/api/admin/products/*`** - Produtos meteorológicos completo
- **`/api/admin/dashboard/*`** - Dashboard + estatísticas + problem-causes
- **`/api/admin/chat/*`** - Sistema de chat completo

### 🔓 APIs Públicas (sem autenticação)

- **`/api/auth/*`** - Sistema de autenticação
- **`/api/(user)/*`** - APIs do usuário logado

## 🔐 Autenticação

Este aplicativo utiliza um método de autenticação baseada em sessão com cookies HttpOnly. É segura e adequada para o sistema que está sendo desenvolvido. Possui segurança contra vazamento (hash no banco), boa proteção contra XSS e CSRF, capacidade de revogação, renovação automática de sessão e controle completo do ciclo de vida do login.

### 🔒 Política de Segurança Institucional

**IMPORTANTE**: O sistema implementa políticas de segurança específicas para o CPTEC/INPE:

1. **Restrição de Domínio**: Apenas e-mails do domínio `@inpe.br` são permitidos para cadastro
2. **Ativação por Administrador**: Todos os usuários novos são criados inativos e precisam ser ativados por um administrador antes de conseguir fazer login
3. **Verificação Múltipla**: Aplicado em todos os métodos de autenticação (senha, e-mail, Google OAuth)

### 🛡️ Fluxo de Segurança

```
1. Cadastro → E-mail deve ser @inpe.br
2. Verificação → E-mail verificado via OTP
3. Status → Usuário fica INATIVO esperando ativação
4. Ativação → Administrador ativa na interface admin
5. Login → Usuário pode acessar o sistema normalmente
```

### 🔧 Vantagens do Sistema

Este método possui as seguintes vantagens:

1. **Token aleatório + hash (SHA-256)**:

   - Gera um token aleatório (não previsível)
   - Armazena apenas o hash no banco — isso impede vazamentos críticos
   - Funciona como "password hashing", mas para tokens de sessão

2. **Cookies com boas práticas**:

   - **HttpOnly**: não acessível via JavaScript → proteção contra _XSS_
   - **SameSite=Lax** ou **Strict**: proteção contra _CSRF_
   - **Secure**: só em HTTPS
   - **Expires** e **Path**: escopo controlado

3. **Expiração e renovação automática**:

   - Sessões expiram em 30 dias
   - Renovação automática se o usuário estiver ativo

4. **Revogação de sessão**:

   - Dá para invalidar uma sessão específica ou todas do usuário
   - Muito útil em casos de logout, troca de senha, etc.

5. **Armazenamento no servidor**:
   - Sessões ficam no banco → você pode revogar, monitorar, auditar

## 🔑 Login com o Google

> ⚠️ **Importante – Prefetch e Cookies**
>
> Detectado bug crítico: links ou botões apontando para rotas de autenticação (`/login-google`) ou logout (`/logout`) com _prefetch_ padrão do Next.js faziam chamadas antecipadas, limpando o cookie `session_token` e causando 401 nas APIs.
>
> • **Correção**: botões de login Google agora usam `onClick` com `window.location.href` (sem Link) e link de logout usa `prefetch={false}`.
> • **Regra obrigatória**: **NUNCA** habilitar prefetch em rotas críticas de sessão. Defina explicitamente `prefetch={false}` ou use navegação full-page.
>
> Registrar esta lição evita horas de debug e garante persistência da sessão em produção (Vercel).

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
- **Grupos**: `group` (6 grupos padrão)
- **Produtos**: `product`, `product_problem`, `product_solution`, `product_dependency`, `product_manual`, `product_activity`
- **Categorias**: `product_problem_category` (6 categorias padrão)
- **Contatos**: `contact`, `product_contact`
- **Chat**: `chat_message`, `chat_user_presence`
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

- **Linhas de Código**: ~30.000 linhas TypeScript/React
- **Componentes**: 100+ componentes reutilizáveis
- **APIs**: 40+ endpoints organizados e protegidos
- **Páginas**: 20+ páginas administrativas
- **Tabelas DB**: 25+ tabelas relacionais
- **Funcionalidades**: 16 sistemas (12 completos, 4 pendentes)
- **Progresso**: 75% concluído - 12 de 16 funcionalidades operacionais

## 🏆 Conquistas do Projeto

- ✅ **Sistema 75% Production-Ready**: Build funcional, zero erros críticos, 12 funcionalidades operacionais
- ✅ **Segurança Institucional**: Restrição @inpe.br + ativação por administrador implementada
- ✅ **Arquitetura Sólida**: Padrões estabelecidos e documentados
- ✅ **UX Profissional**: Interface consistente e intuitiva
- ✅ **Performance Otimizada**: Queries eficientes e carregamento rápido
- ✅ **Segurança Robusta**: APIs protegidas e autenticação segura com políticas institucionais
- ✅ **Documentação Completa**: CLAUDE.md como fonte única de verdade
- ✅ **MenuBuilder Funcional**: Drag & drop hierárquico estilo WordPress
- ✅ **Chat WhatsApp-like Finalizado**: Sistema profissional com presença real-time 100% funcional
- ✅ **Kanban Avançado**: Drag & drop por atividade com CRUD completo
- ✅ **Dashboard Inteligente**: Categorias problemas + gráficos ApexCharts + donut causas
- ✅ **Controle de Acesso Institucional**: Validação @inpe.br + ativação administrativa obrigatória
- ✅ **Sistema de Upload na Nuvem**: UploadThing v7 para todos os uploads de imagens do sistema
