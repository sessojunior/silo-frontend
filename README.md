# Projeto Silo

Sistema de gerenciamento de produtos meteorológicos para CPTEC/INPE desenvolvido com Next.js 15, React 19, TypeScript e PostgreSQL.

## 📋 Memory Bank - Documentação Central

Este projeto usa o diretório `/memory-bank` como única fonte de verdade de documentação. Todo o andamento do projeto, contexto, briefing, padrões de sistema e contexto técnico estão em arquivos markdown nesse diretório.

### 📂 Arquivos Essenciais do Memory Bank

- **`memory-bank/README.md`** - Ponto de entrada obrigatório com navegação rápida
- **`memory-bank/currentStatus.md`** - Status atual e próximas prioridades
- **`memory-bank/projectStructure.md`** - Índice técnico completo da arquitetura
- **`memory-bank/technicalSpecs.md`** - Stack, padrões e configurações técnicas
- **`memory-bank/businessContext.md`** - Contexto de produto e objetivos de negócio

## 🚀 Status Atual do Projeto - Junho 2025

### ✅ Funcionalidades Completamente Implementadas

- **Sistema de Autenticação Completo**: Login/registro, OTP, Google OAuth, recuperação de senha
- **Dashboard Administrativo**: Interface moderna com gráficos ApexCharts e estatísticas
- **CRUD de Produtos**: Gestão completa de produtos meteorológicos
- **Sistema de Problemas e Soluções**: Threading colaborativo com upload de imagens
- **Base de Conhecimento**: Estrutura hierárquica com MenuBuilder drag & drop
- **Sistema de Manual do Produto**: Editor markdown com hierarquia inteligente
- **🆕 Sistema de Contatos**: CRUD completo + associação produto-contato
- **🆕 Padrão de Design Admin**: Template padronizado para todas as páginas admin

### 🎯 Próximas Implementações - Roadmap 8 Etapas

1. **Proteger APIs Admin** - Migrar `/api/*` para `/api/admin/*` com autenticação
2. **Resolver ESLint** - Corrigir todos warnings sem quebrar funcionalidades
3. **Implementar Grupos** - CRUD completo similar ao sistema de contatos
4. **Implementar Usuários** - Sistema de usuários/Auth Users CRUD
5. **Implementar Chat** - Sistema de chat estilo WhatsApp
6. **Implementar Ajuda** - Sistema de ajuda e documentação
7. **Implementar Configurações** - Configurações gerais do sistema
8. **Implementar Dashboard** - Dashboard/Visão geral melhorada

### 🏆 Conquistas Técnicas Recentes

- **Performance Otimizada**: 95%+ redução em chamadas de API com queries SQL otimizadas
- **Refatoração Histórica**: Página de problemas reduzida de 1.506 → 629 linhas (58,2%)
- **Duplo Scroll Eliminado**: UX melhorada com scroll natural único
- **Padrão de Design Estabelecido**: Template `min-h-screen w-full` obrigatório

## 📁 Estrutura do Projeto

```
silo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas de autenticação
│   │   ├── admin/             # Dashboard administrativo
│   │   │   ├── contacts/      # Sistema de contatos
│   │   │   ├── products/      # Gestão de produtos
│   │   │   └── settings/      # Configurações
│   │   └── api/               # API Routes
│   │       ├── auth/          # Endpoints autenticação
│   │       ├── contacts/      # CRUD contatos
│   │       └── products/      # APIs produtos
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/               # Design system base
│   │   └── admin/            # Componentes admin
│   ├── lib/                  # Utilitários e configurações
│   │   ├── db/              # Database e schema
│   │   └── auth/            # Sistema autenticação
│   └── types/               # Definições TypeScript
├── memory-bank/             # Documentação central
│   ├── README.md           # Ponto de entrada
│   ├── currentStatus.md    # Status atual
│   ├── projectStructure.md # Arquitetura técnica
│   ├── technicalSpecs.md   # Stack e padrões
│   └── businessContext.md  # Contexto de negócio
└── public/                 # Arquivos estáticos
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

### Visualização & Charts

- **ApexCharts 4.7.0** - Biblioteca de gráficos avançados
- **React-ApexCharts 1.7.0** - Wrapper React para charts

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

### Configuração do PostgreSQL

Para configurar o banco de dados, você precisa:

1. **Instalar PostgreSQL**: Baixe e instale o PostgreSQL em seu sistema
2. **Criar banco de dados**: Crie um banco específico para o projeto
3. **Configurar variáveis de ambiente**: Defina a `DATABASE_URL` no arquivo `.env`

### Variável de ambiente

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/silo_db"
```

### Vantagens do PostgreSQL

- **Escalabilidade**: Suporta milhões de registros e transações
- **Integridade de dados**: ACID compliance e constraints robustas
- **Extensibilidade**: Suporte para JSON, arrays e tipos customizados
- **Performance**: Índices avançados e otimizações de query
- **Backup e recovery**: Ferramentas nativas para backup automático
- **Segurança**: Controle granular de permissões e criptografia

### Estrutura do Schema

O banco está organizado em módulos funcionais:

- **Auth**: Usuários, sessões, códigos de verificação
- **Products**: Produtos meteorológicos e suas configurações
- **Knowledge Base**: Dependências, contatos e manuais
- **Problems & Solutions**: Sistema colaborativo de problemas
- **File Management**: Upload e gestão de arquivos
- **🆕 Contacts**: Sistema global de contatos com associações

O PostgreSQL permite que o sistema escale facilmente conforme o crescimento da demanda do CPTEC/INPE.

## 📁 Upload de Imagens

O sistema de upload de imagens está configurado para trabalhar com pasta externa gerenciada pelo nginx, oferecendo melhor performance e escalabilidade.

### Configuração nginx

As imagens são servidas diretamente pelo nginx através de uma pasta externa ao projeto, evitando sobrecarga no servidor Node.js e permitindo cache otimizado.

### Estrutura de arquivos

```
/var/uploads/silo/
├── profile/              # Fotos de perfil dos usuários
├── contacts/             # Fotos dos contatos
├── products/
│   ├── problems/         # Imagens anexas aos problemas
│   └── solutions/        # Imagens anexas às soluções
└── manual/               # Imagens dos manuais técnicos
```

### Configuração no nginx

```nginx
server {
    listen 80;
    server_name silo.inpe.br;

    # Servir uploads diretamente
    location /uploads/ {
        alias /var/uploads/silo/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para o Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Vantagens desta abordagem

- **Performance**: nginx serve arquivos estáticos muito mais eficientemente
- **Escalabilidade**: Reduz carga no servidor Node.js
- **Cache**: Controle otimizado de cache para imagens
- **Segurança**: Separação entre aplicação e arquivos estáticos
- **Backup**: Pasta de uploads pode ser facilmente replicada

## 🎯 Padrões de Desenvolvimento

### Regras Críticas Estabelecidas

- **Layout Admin**: SEMPRE usar `min-h-screen w-full` (NUNCA `h-screen overflow-hidden`)
- **Imports**: SEMPRE usar alias `@/` para módulos internos
- **Error Handling**: Padrão `{ success: boolean, error?: string }`
- **Logs**: Apenas ✅❌⚠️ℹ️ (4 emojis padronizados)
- **TypeScript**: Strict mode, sem `any`, tipos seguros

### Arquitetura Memory Bank

- **Modo de Cautela**: Sempre reutilizar componentes existentes
- **Reaproveitar**: Hooks, libs e funções já criadas
- **Centralizar**: Código na página, criar componentes específicos
- **Planejar**: SEMPRE planejar antes de implementar
- **Preservar**: NUNCA quebrar design ou funcionalidades existentes

## 📊 Status de Produção

- **Build**: ✅ Compilação limpa (apenas warnings ESLint menores)
- **Performance**: ✅ Otimizada com 95%+ redução em chamadas API
- **UX**: ✅ Design consistente e responsivo
- **Funcionalidades**: ✅ Todas principais implementadas e testadas
- **Segurança**: ✅ Validações e error handling em todas as camadas

---

**Para informações técnicas detalhadas, consulte sempre o diretório `/memory-bank` que contém a documentação completa e atualizada do projeto.**
