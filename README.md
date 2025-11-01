# Silo

Sistema de **gestão de produtos meteorológicos** para colaboração, monitoramento e documentação técnica no CPTEC/INPE.

---

## 📋 **Visão Geral**

O **Silo** centraliza e estrutura operações críticas em uma única plataforma:

- ✅ **Dashboard unificado** com visão consolidada de status e métricas
- ✅ **Base de conhecimento** hierarquicamente organizada por produto
- ✅ **Sistema integrado** de problemas e soluções colaborativas
- ✅ **Gestão completa** de projetos e atividades com Kanban
- ✅ **Chat institucional** para comunicação estruturada
- ✅ **Relatórios automáticos** com análises em tempo real

### 💡 **Funcionalidades Principais**

#### 🔐 Autenticação

- Login com email/senha, OTP ou Google OAuth
- Validação de domínio @inpe.br
- Ativação obrigatória por administrador

#### 📦 Produtos

- Estrutura completa de dependências
- Sistema de problemas e soluções
- Editor Markdown para manuais
- Calendário de turnos

#### 📋 Projetos & Kanban

- Gestão de projetos com estrutura hierárquica
- Kanban com 5 estados (todo, in_progress, blocked, review, done)
- Drag & drop, histórico completo

#### 💬 Chat

- Comunicação em grupos e DMs
- Sistema de presença com 4 estados
- Notificações em tempo real

#### 👥 Gestão

- Grupos e usuários
- Contatos vinculados a produtos
- Configurações personalizadas

---

## 🚀 **Início Rápido**

### **Opção 1: Docker (Recomendado)**

```bash
# 1. Configurar variáveis de ambiente
cp env.docker.example .env
# Edite o arquivo .env com suas configurações

# 2. Executar containers
docker-compose up -d

# ✅ Acesse: http://localhost:3000
```

### **Opção 2: Desenvolvimento Local**

```bash
# 1. Instalar dependências
npm install
cd fileserver && npm install && cd ..

# 2. Configurar .env
cp env.example .env

# 3. Executar servidores (dois terminais)
# Terminal 1:
cd fileserver
npm run dev

# Terminal 2:
npm run dev

# ✅ Frontend: http://localhost:3000
# ✅ FileServer: http://localhost:4000
```

---

## 📚 **Documentação Completa**

📘 **Documentação técnica detalhada disponível em:**

- 📡 [**APIs e Endpoints**](./docs/API.md) - Todas as APIs do sistema
- 🔐 [**Autenticação**](./docs/AUTH.md) - Login, OAuth, segurança
- 🗄️ [**Banco de Dados**](./docs/DATABASE.md) - Schema, relacionamentos, migrações
- 🐳 [**Docker e Deploy**](./docs/DOCKER.md) - Containerização, produção
- 📧 [**Configuração SMTP**](./docs/SMTP.md) - Servidor de email
- 📋 [**Sistema de Logs**](./docs/LOGS.md) - Padrões de logging
- 📐 [**Padrões de Código**](./docs/PATTERNS.md) - Convenções e boas práticas
- 🗂️ [**FileServer**](./fileserver/README.md) - Servidor de arquivos

---

## 🏗️ **Arquitetura**

### **Stack Técnica**

- **Framework:** Next.js 15.5.2 + React 19 + TypeScript (strict)
- **Database:** PostgreSQL + Drizzle ORM 0.43.1
- **Upload:** FileServer Node.js (Express + Multer + Sharp)
- **UI:** Tailwind CSS 4 + Design System customizado
- **Auth:** JWT + OAuth Google (Arctic 3.7.0)
- **Charts:** ApexCharts 4.7.0

### **Estrutura**

```text
silo-frontend/
├── src/
│   ├── app/            # App Router (rotas e APIs)
│   ├── components/    # Componentes React
│   ├── context/       # Contextos globais
│   ├── hooks/         # Hooks customizados
│   ├── lib/           # DB, auth, utils, config
│   └── types/          # Tipos TypeScript
├── fileserver/        # Servidor de arquivos
├── public/            # Arquivos estáticos
├── drizzle/           # Migrações do banco
└── docs/              # Documentação completa
```

---

## 📦 **Módulos e Funcionalidades**

| Módulo | Funcionalidades |
|--------|----------------|
| **Autenticação** | Login, registro, OAuth, recuperação de senha |
| **Dashboard** | Estatísticas, gráficos, resumo executivo |
| **Produtos** | CRUD, dependências, problemas, soluções, manuais |
| **Projetos** | Kanban, atividades, tarefas, histórico |
| **Chat** | Grupos, DMs, presença, notificações |
| **Usuários** | Grupos, contatos, configurações |
| **Relatórios** | Disponibilidade, problemas, performance |
| **Upload** | Avatares, contatos, problemas, soluções |

---

## 🗂️ **Servidor de Arquivos**

Sistema independente de upload e otimização de imagens.

📘 **Documentação completa:**

- [`fileserver/README.md`](./fileserver/README.md) - Visão geral
- [`fileserver/docs/FILESERVER.md`](./fileserver/docs/FILESERVER.md) - Documentação técnica
- [`fileserver/docs/THUMBNAILS.md`](./fileserver/docs/THUMBNAILS.md) - Sistema de thumbnails

### **Execução Rápida**

```bash
cd fileserver
docker-compose up -d
```

**Características:**

- ✅ Otimização automática (WebP, redimensionamento, rotação EXIF)
- ✅ Thumbnails automáticos (128x128)
- ✅ Validação robusta (tipos, tamanhos, magic numbers)
- ✅ Limpeza automática

---

## 🎯 **Quick Commands**

```bash
# Instalar dependências
npm install && cd fileserver && npm install && cd ..

# Executar desenvolvimento local
npm run dev              # Frontend
cd fileserver && npm run dev  # FileServer

# Executar com Docker
docker-compose up -d

# Banco de dados
npm run db:generate      # Gerar migração
npm run db:migrate       # Aplicar migração
npm run db:studio        # GUI do banco

# Build
npm run build

# Lint
npm run lint
```

---

## ⚙️ **Configuração Mínima**

### **Variáveis de Ambiente Essenciais**

```bash
# .env

# Banco de Dados
DATABASE_URL='postgresql://user:pass@host:5432/db'

# URLs do sistema
APP_URL='http://localhost:3000'
FILESERVER_URL='http://localhost:4000'

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=''
GOOGLE_CLIENT_SECRET=''

# Email (SMTP)
SMTP_HOST='smtp.exemplo.com'
SMTP_PORT='587'
SMTP_SECURE=false # Defina como true se usar SSL (porta 465)
SMTP_USERNAME='usuario@exemplo.com'
SMTP_PASSWORD='senha'

```

---

## 🔗 **Documentação por Tópico**

- **APIs:** Todos os endpoints e contratos de resposta → [`docs/API.md`](./docs/API.md)
- **Autenticação:** Login, OAuth, segurança → [`docs/AUTH.md`](./docs/AUTH.md)
- **Database:** Schema, relacionamentos, migrações → [`docs/DATABASE.md`](./docs/DATABASE.md)
- **Docker:** Containerização e deploy → [`docs/DOCKER.md`](./docs/DOCKER.md)
- **SMTP:** Configuração de email → [`docs/SMTP.md`](./docs/SMTP.md)
- **Logs:** Padrões de logging → [`docs/LOGS.md`](./docs/LOGS.md)
- **Padrões:** Convenções e boas práticas → [`docs/PATTERNS.md`](./docs/PATTERNS.md)
- **FileServer:** Servidor de arquivos → [`fileserver/README.md`](./fileserver/README.md)

---

## 🛡️ **Segurança**

- ✅ Validação de domínio @inpe.br
- ✅ Ativação obrigatória de usuários
- ✅ Rate limiting (3 tentativas/min)
- ✅ JWT com expiração
- ✅ Proteções contra auto-modificação
- ✅ CORS configurado

### 🚨 **ALERTA CRÍTICO: Prefetch em Links de Logout**

**⚠️ NUNCA use `Link` do Next.js sem `prefetch={false}` em rotas de API destrutivas!**

O Next.js prefetcha automaticamente links visíveis na tela. Se um link apontar para `/api/logout`, o Next.js pode fazer logout automático do usuário sem que ele clique, causando bugs graves que levam horas para debugar.

**Solução:**

```typescript
// ✅ CORRETO - Desabilita prefetch para APIs
<Link href='/api/logout' prefetch={false}>Sair</Link>

// ✅ CORRETO - Usar button ao invés de Link
<button onClick={() => router.push('/api/logout')}>Sair</button>

// ❌ ERRADO - Pode causar logout automático!
<Link href='/api/logout'>Sair</Link>
```

**Onde aplicar:**

- Todos os componentes com links de logout (`SidebarFooter`, `TopbarDropdown`)
- Componentes genéricos que podem renderizar links para APIs (`Button`, `NavButton`, `TopbarButton`, `AuthLink`, `SidebarMenu`)

**Regra:** Se o `href` começar com `/api/`, SEMPRE usar `prefetch={false}` ou usar `button` + `router.push()`.

**Histórico:** Bug identificado após horas de debug. Usuários eram deslogados automaticamente após login devido ao prefetch automático do Next.js.

---

## 📊 **Características Técnicas**

- **Total de Tabelas:** 25
- **Módulos:** 8 principais
- **APIs:** 40+ endpoints
- **TypeScript:** Strict mode
- **Performance:** Otimizado com SWR, lazy loading
- **Responsivo:** Mobile, tablet, desktop
- **Dark Mode:** Completo em todos os componentes

---

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Padrões:**

- TypeScript strict
- Zero warnings de lint
- Commits semânticos
- PRs pequenos e focados

---

## 📞 **Contato**

- **Projeto:** Sistema SILO
- **Instituição:** CPTEC/INPE
- **Autor:** Mario A. Sesso Junior
- **GitHub:** [@sessojunior](https://github.com/sessojunior)

---

**Desenvolvido para *CPTEC/INPE***

Version: 1.0 | Última atualização: 2025
