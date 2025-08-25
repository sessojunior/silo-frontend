# 🧪 MATRIZ DE TESTES MANUAIS PARA PRODUÇÃO - PROJETO SILO

## 📋 **PRÉ-REQUISITOS DE AMBIENTE**

### **Configuração de Produção**

- [x] **Variáveis de ambiente**: `DATABASE_URL`, `UPLOADTHING_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, SMTP, `GOOGLE_CALLBACK_URL`
- [ ] **Build de produção**: `npm run build` sem erros
- [ ] **Execução**: `npm run start` sem erros
- [x] **HTTPS/SSL**: Certificado válido em produção
- [ ] **Cookies**: HttpOnly ativos, SameSite configurado
- [x] **Banco de dados**: PostgreSQL acessível, migrations executadas
- [ ] **Seed inicial**: Dados de teste carregados (6 grupos, 6 categorias, produtos, projetos)

---

## 🔐 **1. AUTENTICAÇÃO E SEGURANÇA**

### **Validação de Domínio Institucional**

- [x] **Cadastro com domínio externo**: Bloqueia e-mails que não sejam `@inpe.br`
- [x] **Cadastro com @inpe.br**: Permite criação de conta
- [x] **Login Google OAuth**: Valida domínio antes de criar usuário

### **Sistema de Ativação por Administrador**

- [ ] **Usuário novo**: Criado como inativo por padrão
- [x] **Tentativa de login inativo**: Bloqueia acesso e redireciona para página de erro personalizada
- [x] **Página de erro personalizada**: Layout idêntico ao not-found.tsx com mensagens específicas
- [ ] **Ativação por admin**: Toggle na interface administrativa funciona
- [ ] **Acesso após ativação**: Usuário consegue fazer login normalmente

### **Segurança de Senhas**

- [x] **Campo senha removido**: Formulário de edição de usuário não permite alterar senhas
- [x] **Validação ajustada**: Não exige senha na edição, apenas na criação
- [x] **Interface limpa**: Campo de senha removido da interface de edição

### **Grupo Padrão Automático**

- [x] **Função helper criada**: addUserToDefaultGroup() para associar usuários ao grupo padrão
- [x] **Registro via email/senha**: Usuários criados por registro são adicionados ao grupo "Meteorologistas"
- [x] **Registro via Google OAuth**: Usuários criados via Google são adicionados ao grupo padrão
- [x] **Grupo padrão configurado**: Grupo "Meteorologistas" marcado como isDefault: true

### **Último Acesso dos Usuários**

- [x] **Função helper criada**: updateUserLastLogin() para atualizar timestamp de último acesso
- [x] **Login com senha**: Último acesso atualizado ao fazer login com email/senha
- [x] **Login com código OTP**: Último acesso atualizado ao verificar código de verificação
- [x] **Login Google OAuth**: Último acesso atualizado ao fazer login via Google
- [x] **Campo lastLogin**: Exibido corretamente na lista de usuários (/admin/groups/users)

### **Fluxos de Autenticação**

- [ ] **Login com senha**: Credenciais válidas e inválidas
- [ ] **Login apenas e-mail (OTP)**: Envio de código, validação, rate limit (3/min)
- [ ] **Google OAuth**: Fluxo completo, callback, criação de sessão
- [ ] **Recuperação de senha**: Envio, validação OTP, redefinição
- [ ] **Logout**: Limpeza de sessão, redirecionamento

### **Proteção de APIs**

- [ ] **APIs /api/admin/\* sem sessão**: Retornam 401
- [ ] **APIs /api/admin/\* com sessão válida**: Funcionam normalmente
- [ ] **Rate limiting**: Bloqueia após 3 tentativas por minuto

### **Página de Erro Personalizada**

- [x] **Layout consistente**: Design idêntico ao not-found.tsx
- [x] **Mensagens específicas**: Diferentes para cada tipo de erro (6 tipos implementados)
- [x] **Ícones contextuais**: Diferentes ícones para cada tipo de erro
- [x] **Redirecionamento correto**: Botões levam para páginas apropriadas
- [x] **Responsividade**: Funciona em diferentes resoluções
- [x] **Cobertura completa**: Todos os erros de autenticação redirecionam para página personalizada

---

## 📊 **2. DASHBOARD PRINCIPAL**

### **Carregamento e Funcionalidade**

- [ ] **Métricas iniciais**: Carregam sem erro
- [ ] **Gráficos ApexCharts**: Todos os tipos funcionam (donut, coluna, linha)
- [ ] **Donut "Causas de problemas"**: Dados dos últimos 28 dias
- [ ] **Responsividade**: Funciona em lg/md/sm
- [ ] **Modo dark/light**: Gráficos adaptam ao tema

---

## 🏭 **3. PRODUTOS, PROBLEMAS E SOLUÇÕES**

### **CRUD de Produtos**

- [ ] **Criar produto**: Formulário completo, validações
- [ ] **Editar produto**: Modificação de dados, salvamento
- [ ] **Excluir produto**: Confirmação, remoção completa
- [ ] **Listagem**: Filtros, busca, paginação

### **Sistema de Problemas**

- [ ] **Criar problema**: Formulário, categorização obrigatória
- [ ] **Editar problema**: Modificação, mudança de categoria
- [ ] **Upload de imagens**: Via UploadThing, limite de 3 imagens
- [ ] **Threading**: Visualização hierárquica de problemas

### **Sistema de Soluções**

- [ ] **Responder problema**: Criação de solução
- [ ] **Editar solução**: Modificação de resposta
- [ ] **Upload de imagens**: Via UploadThing
- [ ] **Marcar como correta**: Funcionalidade de verificação

### **Categorias de Problemas**

- [ ] **CRUD de categorias**: Criar/editar/excluir no offcanvas
- [ ] **Validação de nomes únicos**: Não permite duplicatas
- [ ] **Integração com dashboard**: Donut atualiza com dados reais
- [ ] **6 categorias padrão**: Rede externa, interna, servidor, falha humana, erro software, outros

### **Dependências Hierárquicas (MenuBuilder)**

- [ ] **Drag & drop**: Funciona corretamente
- [ ] **Hierarquia**: Mantém estrutura pai-filho
- [ ] **Ícones Lucide**: Renderizam corretamente
- [ ] **Reordenação**: Preserva relacionamentos

### **Manual do Produto**

- [ ] **Editor Markdown**: Funciona com preview
- [ ] **Salvamento**: Persiste alterações
- [ ] **Nomes únicos**: Capítulos e seções não podem ter nomes duplicados
- [ ] **Hierarquia**: Organização por níveis

### **Associação Produto-Contato**

- [ ] **Seleção múltipla**: Adicionar múltiplos contatos
- [ ] **Remoção**: Desassociar contatos
- [ ] **Persistência**: Associações mantidas após edição

---

## 👥 **4. SISTEMA DE CONTATOS**

### **CRUD Completo**

- [ ] **Criar contato**: Formulário completo, validações
- [ ] **Editar contato**: Modificação de dados
- [ ] **Excluir contato**: Confirmação, remoção
- [ ] **Listagem**: Filtros por status, busca por nome/email/função

### **Upload de Fotos**

- [ ] **Upload via UploadThing**: Funciona corretamente
- [ ] **Limite de tamanho**: 4MB respeitado
- [ ] **Preview**: Imagem exibida após upload
- [ ] **Exclusão**: Remove da UploadThing quando deletado

### **Associação com Produtos**

- [ ] **Seleção múltipla**: Associar contatos a produtos
- [ ] **Reflexo na UI**: Associações aparecem nas páginas de produtos
- [ ] **Remoção**: Desassociar contatos de produtos

---

## 👥 **5. SISTEMA DE GRUPOS E USUÁRIOS**

### **Gestão de Grupos**

- [ ] **CRUD de grupos**: Criar/editar/excluir
- [ ] **6 grupos padrão**: Administradores, Meteorologistas, Pesquisadores, Operadores, Suporte, Visitantes
- [ ] **Ícones e cores**: Personalização visual

### **Gestão de Usuários**

- [ ] **CRUD de usuários**: Criar/editar/excluir
- [ ] **Filtro ativos/inativos**: Funciona corretamente
- [ ] **Toggle de ativação**: Reflete no acesso do usuário
- [ ] **Perfil completo**: Dados pessoais, preferências

### **Relação Many-to-Many**

- [ ] **Associar usuários a grupos**: Funciona corretamente
- [ ] **Remover usuários de grupos**: Desassociação
- [ ] **Reflexo na UI**: Ambos lados mostram relacionamentos
- [ ] **Navegação por abas**: Entre grupos e usuários

---

## 💬 **6. SISTEMA DE CHAT WHATSAPP-LIKE**

### **Funcionalidades Básicas**

- [ ] **Enviar mensagens**: Em grupos e DMs
- [ ] **Receber mensagens**: Atualização em tempo real
- [ ] **Histórico**: Carregamento inicial e paginação
- [ ] **Threading**: Conversas organizadas

### **Sistema de Presença**

- [ ] **Estados de presença**: Online, Ausente, Ocupado, Offline
- [ ] **Alteração de status**: Funciona corretamente
- [ ] **Reflexo na UI**: Status visível para outros usuários

### **Notificações e Sincronização**

- [ ] **Polling inteligente**: Sincroniza apenas quando necessário
- [ ] **Notificações TopBar**: Botão com contador
- [ ] **Sem duplicação**: Mensagens não aparecem duplicadas

---

## 📋 **7. SISTEMA DE PROJETOS E KANBAN**

### **Gestão de Projetos**

- [ ] **CRUD de projetos**: Criar/editar/excluir
- [ ] **Filtros e busca**: Funcionam corretamente
- [ ] **Estatísticas**: Progresso e métricas

### **Gestão de Atividades**

- [ ] **CRUD por projeto**: Criar/editar/excluir atividades
- [ ] **Associação projeto-atividade**: Relacionamento correto

### **Sistema Kanban**

- [ ] **5 colunas**: A Fazer, Em Progresso, Bloqueado, Em Revisão, Concluído
- [ ] **Drag & drop**: Mover entre colunas funciona
- [ ] **Reordenação**: Dentro da mesma coluna
- [ ] **Sincronização**: Status sincroniza com project_task
- [ ] **Contagem por atividade**: Número correto de tarefas

### **Gestão de Tarefas**

- [ ] **Formulário completo**: Criar/editar tarefas
- [ ] **Validações**: Campos obrigatórios
- [ ] **Exclusão**: Diálogo de confirmação
- [ ] **Integração**: Tarefas aparecem no Kanban

---

## ⚙️ **8. SISTEMA DE CONFIGURAÇÕES**

### **Perfil do Usuário**

- [ ] **Editar dados**: Nome, email, informações pessoais
- [ ] **Upload de avatar**: Via UploadThing, resize automático
- [ ] **Salvamento**: Persiste alterações

### **Preferências**

- [ ] **Tema**: Dark/light mode
- [ ] **Notificações**: Configurações de alertas
- [ ] **Auto-save**: Quando aplicável

### **Segurança**

- [ ] **Troca de senha**: Validações, confirmação
- [ ] **Feedback**: Toast de sucesso/erro

---

## 📚 **9. SISTEMA DE AJUDA**

### **Navegação e Conteúdo**

- [ ] **Navegação hierárquica**: Por títulos (#/##/###)
- [ ] **Busca de conteúdo**: Funcionalidade básica
- [ ] **Organização**: Seções e capítulos

### **Editor e Documentação**

- [ ] **Editor Markdown**: Funciona com preview
- [ ] **Salvamento**: Persiste alterações
- [ ] **Interface dual**: Sidebar + área de conteúdo

---

## 🔗 **10. INTEGRAÇÃO, UX E NAVEGAÇÃO**

### **Navegação Completa**

- [ ] **Todas as páginas admin**: Acessíveis sem 404
- [ ] **Links corretos**: Topbar e sidebar funcionam
- [ ] **Sem loops infinitos**: Navegação estável
- [ ] **Prefetch desabilitado**: Rotas críticas de sessão

### **Consistência Visual**

- [ ] **Dark/light mode**: Consistente em todo sistema
- [ ] **Layout padrão**: min-h-screen sem double-scroll
- [ ] **Componentes UI**: Reutilização correta
- [ ] **Design system**: 24 componentes padronizados

---

## ☁️ **SISTEMA DE UPLOADTHING V7**

### **Funcionalidades de Upload**

- [ ] **Avatar de usuário**: Upload, resize automático (128x128 WebP)
- [ ] **Fotos de contatos**: Até 4MB
- [ ] **Imagens de problemas/soluções**: Até 3 imagens, 4MB cada
- [ ] **Limites respeitados**: Tamanho e quantidade

### **Integração e Fallback**

- [ ] **UploadThing ativo**: Funciona com token válido
- [ ] **Exclusão**: Remove arquivos da nuvem
- [ ] **Sem diretório local**: public/uploads não existe
- [ ] **Tratamento de erro**: Falhas mostram toast

---

## ⚡ **11. PERFORMANCE E ACESSIBILIDADE**

### **Performance e Dados**

- [ ] **Listas grandes**: Produtos, problemas, projetos, contatos
- [ ] **Contagem agregada**: Soluções por problema (sem N+1)
- [ ] **Tempos de resposta**: Aceitáveis para operações
- [ ] **Otimizações**: Queries SQL eficientes

### **Acessibilidade e Cross-Browser**

- [ ] **Navegação por teclado**: Tab navigation, Enter para submit
- [ ] **Modais**: Escape para fechar, foco preso
- [ ] **Sidebar**: Navegação por teclado
- [ ] **Compatibilidade**: Chrome/Edge, Firefox, mobile, desktop

---

## ✅ **VALIDAÇÕES E REGRAS DE NEGÓCIO**

### **Unicidade e Integridade**

- [ ] **Nomes únicos**: Capítulos/seções do manual
- [ ] **Nomes únicos**: Categorias de problemas
- [ ] **Relacionamentos**: Integridade referencial

### **Confirmações e Segurança**

- [ ] **Ações destrutivas**: Diálogos de confirmação
- [ ] **Respostas API**: Padrão `{ success: boolean, error?: string }`
- [ ] **Validações**: Campos obrigatórios, formatos

---

## 📝 **LOGS E OBSERVABILIDADE**

### **Padrão de Logs**

- [ ] **Emojis padronizados**: ✅ ❌ ⚠️ 🔵 apenas
- [ ] **Erros backend**: Mensagens claras
- [ ] **Sem logs sensíveis**: Em produção

---

## 🚀 **12. TESTE FINAL DE REGRESSÃO**

### **Smoke Test Completo**

- [ ] **Login**: Autenticação funcional
- [ ] **Dashboard**: Carrega métricas e gráficos
- [ ] **Produtos**: Criar problema + solução com imagens
- [ ] **Chat**: Enviar mensagem
- [ ] **Projetos**: Mover tarefa no Kanban
- [ ] **Contatos**: Criar com foto
- [ ] **Settings**: Trocar senha
- [ ] **Ajuda**: Editar documentação

---

## 🎯 **CRITÉRIOS GO/NO-GO PARA PRODUÇÃO**

### **Critérios OBRIGATÓRIOS**

- [ ] **Zero P0 abertos**: Todos os testes críticos passaram
- [ ] **Build de produção**: `npm run build` sem erros
- [ ] **Execução**: `npm run start` sem erros
- [ ] **Autenticação**: Sistema de segurança institucional funcional
- [ ] **UploadThing**: Sistema de upload funcionando
- [ ] **Banco de dados**: Conexão estável, migrations aplicadas

### **Critérios DESEJÁVEIS**

- [ ] **P1 com workaround**: Documentado e aceitável
- [ ] **Performance**: Tempos de resposta aceitáveis
- [ ] **Acessibilidade**: Navegação por teclado funcional

---

## 📅 **ORDEM SUGERIDA DE EXECUÇÃO**

1. **Autenticação e Segurança**
2. **Dashboard**
3. **Produtos, Problemas e Soluções**
4. **Contatos**
5. **Grupos e Usuários**
6. **Chat**
7. **Projetos e Kanban**
8. **Configurações**
9. **Ajuda**
10. **Integração e UX**
11. **Performance e Acessibilidade**
12. **Teste Final de Regressão**

---

## 📊 **RESUMO EXECUTIVO**

**Status Atual**: 80% Production-Ready (13 de 16 funcionalidades completas)
**Foco dos Testes**: Validar sistemas implementados + segurança institucional + UploadThing v7
**Tempo Estimado**: 2-3 dias de testes manuais abrangentes
**Próximo Passo**: Após testes, implementar dados reais de produção do CPTEC

---

## 📝 **NOTAS DE TESTE**

### **Data de Execução**: **\*\***\_\_\_**\*\***

### **Responsável**: **\*\***\_\_\_**\*\***

### **Ambiente Testado**: **\*\***\_\_\_**\*\***

### **Observações**: **\*\***\_\_\_**\*\***

---

**Este checklist cobre todos os sistemas implementados e garante que o projeto esteja pronto para produção com segurança institucional rigorosa e funcionalidades críticas validadas.**
