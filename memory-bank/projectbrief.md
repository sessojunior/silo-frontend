# Project Brief - Silo

## Visão Geral

Silo é um aplicativo de gerenciamento de produtos e tarefas desenvolvido especificamente para o CPTEC (Centro de Previsão de Tempo e Estudos Climáticos) do INPE (Instituto Nacional de Pesquisas Espaciais).

## Objetivos Principais

### 1. Gerenciamento de Produtos Científicos

- Sistema para cadastro e gestão de produtos meteorológicos e climáticos
- Base de conhecimento para documentação técnica de produtos
- Controle de disponibilidade e status de produtos

### 2. Sistema de Problemas e Soluções

- Plataforma colaborativa para reportar problemas em produtos
- Sistema de respostas e soluções entre equipes técnicas
- Histórico de problemas e suas respectivas soluções
- Upload de imagens para documentação de problemas

### 3. Dashboard de Monitoramento

- Visualização do status de produtos (rodando, finalizados, com problemas)
- Gráficos e estatísticas de incidentes e problemas
- Timeline de execução de produtos
- Métricas de produtividade

## Requisitos Funcionais

### Autenticação e Autorização

- Login com email/senha
- Login apenas com email (código OTP)
- Integração com Google OAuth
- Recuperação de senha com código verificado por email
- Sistema de verificação de email para novos usuários

### Gestão de Usuários

- Perfis de usuário com informações profissionais
- Upload de foto de perfil
- Configuração de preferências (notificações, newsletters)
- Alteração de email e senha

### Produtos

- CRUD completo de produtos com slug único
- Base de conhecimento hierárquica (equipamentos, dependências, elementos afetados)
- Manual do produto em formato accordion
- Lista de contatos responsáveis técnicos

### Problemas e Soluções

- Sistema de criação de problemas com descrição e imagens
- Respostas threaded (com possibilidade de responder respostas)
- Sistema de "check" para marcar soluções como verificadas
- Filtros e paginação de problemas

## Arquitetura Técnica

### Stack Principal

- **Frontend**: Next.js 15+ com App Router
- **Backend**: Next.js API Routes
- **Banco**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **ORM**: Drizzle ORM
- **Autenticação**: Sessões com cookies HttpOnly
- **Email**: Nodemailer
- **Estilização**: Tailwind CSS 4

### Características Únicas

- **Componentes UI Personalizados**: Não utiliza ShadCN UI
- **Autenticação Personalizada**: Sistema próprio de sessões
- **Rate Limiting**: Proteção contra spam de emails
- **PWA Ready**: Configuração para Progressive Web App

## Requisitos Não-Funcionais

### Segurança

- Cookies HttpOnly com proteção CSRF/XSS
- Hash seguro de senhas (bcryptjs)
- Rate limiting para APIs sensíveis
- Validação rigorosa de inputs

### Performance

- Suporte até 100k acessos/dia com SQLite
- Paginação para listagens grandes
- Otimização de imagens
- Lazy loading de componentes

### Usabilidade

- Interface responsiva e moderna
- Modo escuro/claro
- Toasts para feedback ao usuário
- Formulários com validação em tempo real

## Escopo Atual

O projeto está em desenvolvimento ativo com as seguintes funcionalidades implementadas:

- Sistema completo de autenticação
- Dashboard com gráficos estatísticos
- CRUD de produtos básico
- Sistema de problemas e soluções funcional
- Upload de imagens para problemas/soluções
- Interface administrativa completa

## Fora do Escopo (Por Agora)

- Sistema de grupos/permissões avançado
- Integração com sistemas externos do INPE
- API pública para terceiros
- Notificações push
- Sistema de aprovação de mudanças
