# Active Context - Silo

## Foco Atual do Trabalho

### Estado Geral do Projeto

O projeto Silo está em um estado **funcional e estável** com as principais funcionalidades implementadas:

- ✅ **Sistema de Autenticação**: Completo com múltiplas opções (email/senha, apenas email, Google OAuth)
- ✅ **Dashboard Principal**: Interface administrativa com gráficos e estatísticas
- ✅ **CRUD de Produtos**: Gestão básica de produtos meteorológicos
- ✅ **Sistema de Problemas**: Criação, listagem e gestão de problemas
- ✅ **Sistema de Soluções**: Respostas threaded com upload de imagens
- ✅ **Base de Conhecimento**: Estrutura hierárquica para documentação **[RECÉM IMPLEMENTADO]**
- ✅ **Perfil de Usuário**: Gestão de dados pessoais e preferências

### Implementações Recentes - Base de Conhecimento

#### ✅ Estrutura de Banco de Dados

- **product_dependency**: Tabela self-referencing para dependências hierárquicas (equipamentos, dependências, elementos afetados)
- **product_contact**: Contatos responsáveis por cada produto
- **product_manual_section**: Seções do manual de cada produto
- **product_manual_chapter**: Capítulos do manual com conteúdo markdown
- **system_file**: Sistema de arquivos para rich text editor (preparado para implementação)

#### ✅ APIs Implementadas

- `/api/products/dependencies` - Busca dependências hierárquicas
- `/api/products/contacts` - Busca contatos do produto
- `/api/products/manual` - Busca seções e capítulos do manual

#### ✅ Interface da Base de Conhecimento

- TreeView dinâmica com dados reais do banco
- Lista de contatos com informações completas
- Accordion do manual com conteúdo markdown
- Loading states e tratamento de estados vazios

### Áreas que Precisam de Atenção

#### 🔄 **Sistema de Grupos** [PRIORIDADE ALTA]

- Páginas vazias (`/admin/settings/groups` e `/admin/settings/projects`)
- Necessário definir estrutura e funcionalidades

#### 🔄 **Rich Text Editor** [PRÓXIMA PRIORIDADE]

- Implementar editor customizado para capítulos do manual
- Sistema de upload de imagens integrado
- Gerenciamento de arquivos via `system_file`

#### 🔄 **Melhorias da Base de Conhecimento**

- Funcionalidades CRUD para dependências, contatos e manual
- Interface de administração para edição
- Sistema de versionamento do manual

#### 🔄 **Otimizações Pendentes**

- Busca unificada entre problemas e base de conhecimento
- Cache de dados da base de conhecimento
- Exportação do manual em PDF

### Estrutura Técnica Atual

#### Banco de Dados SQLite + Drizzle ORM

- Relacionamentos complexos implementados
- Self-referencing para hierarquias funcionando
- Seed robusto com dados realistas

#### APIs REST

- Padrão consistente de resposta
- Tratamento de erros adequado
- Queries otimizadas para relacionamentos

#### Frontend React/Next.js

- Componentes reutilizáveis bem estruturados
- Estados de loading e erro
- Interface responsiva e acessível

## Próximos Passos Imediatos

1. **Rich Text Editor**: Implementar editor markdown customizado
2. **Sistema de Arquivos**: Integrar upload de imagens
3. **CRUD da Base de Conhecimento**: Interfaces de administração
4. **Sistema de Grupos**: Definir e implementar funcionalidades
5. **Testes**: Cobertura das novas funcionalidades

## Padrões e Preferências Importantes

- **Componentes UI personalizados** (não ShadCN)
- **TypeScript rigoroso** com tipagem completa
- **APIs REST** com padrão de resposta consistente
- **Self-referencing tables** para estruturas hierárquicas
- **Markdown + Rich Text** para conteúdo editável
- **Loading states** em todas as operações assíncronas

## Aprendizados e Insights do Projeto

### Estruturas Hierárquicas

- Self-referencing com `parentId` funciona bem para árvores dinâmicas
- Funções recursivas para construir árvores no frontend
- Importante manter `order` para controle de ordenação

### Relacionamentos Complexos

- Promise.all para buscar dados relacionados em paralelo
- Estrutura de dados bem normalizada facilita manutenção
- APIs específicas por contexto mantêm performance

### Gestão de Estado

- useState + useEffect para dados dinâmicos
- Loading states melhoram UX significativamente
- Tratamento de estados vazios evita telas quebradas

### Performance

- Seed com verificação de existência evita duplicados
- Queries com order by garantem consistência
- Lazy loading de dependências melhora tempo inicial

## Mudanças Recentes

### Última Sessão (Inferido pelos arquivos)

- Sistema de problemas e soluções parece estar em desenvolvimento ativo
- Interface de produtos com base de conhecimento implementada
- Dashboard com gráficos e métricas funcionais
- Sistema de autenticação robusto implementado

### Funcionalidades Implementadas Recentemente

1. **Upload de Imagens**: Sistema completo para problemas e soluções
2. **Threads de Discussão**: Respostas aninhadas para soluções
3. **Base de Conhecimento**: Estrutura em árvore para documentação técnica
4. **Dashboard Interativo**: Gráficos com ApexCharts
5. **Gestão de Preferências**: Sistema de configurações de usuário

## Próximos Passos Prioritários

### 1. Sistema de Grupos e Permissões (Alta Prioridade)

**Objetivo**: Implementar controle de acesso baseado em grupos/equipes
**Arquivos-alvo**:

- `src/app/admin/settings/groups/page.tsx` (atualmente vazio)
- `src/app/admin/settings/projects/page.tsx` (atualmente vazio)
- Schema do banco: Adicionar tabelas de grupos e permissões

**Tarefas**:

- [ ] Criar schema de grupos e permissões no banco
- [ ] Implementar CRUD de grupos
- [ ] Implementar CRUD de projetos
- [ ] Associar usuários a grupos
- [ ] Middleware de autorização baseado em grupos

### 2. Melhorias na Interface de Produtos

**Objetivo**: Completar funcionalidades da base de conhecimento
**Funcionalidades pendentes**:

- [ ] Edição inline de seções do manual
- [ ] Sistema de versionamento de documentação
- [ ] Upload de documentos (além de imagens)
- [ ] Busca na base de conhecimento

### 3. Notificações e Alertas

**Objetivo**: Sistema de notificações para problemas críticos
**Funcionalidades**:

- [ ] Notificações em tempo real
- [ ] Emails automáticos para novos problemas
- [ ] Dashboard de alertas críticos
- [ ] Configuração de critérios de alerta

### 4. Analytics e Relatórios

**Objetivo**: Métricas detalhadas de uso e performance
**Funcionalidades**:

- [ ] Relatórios de tempo de resolução
- [ ] Análise de tendências de problemas
- [ ] Métricas de produtividade por usuário
- [ ] Exportação de dados

## Decisões e Considerações Ativas

### Arquitetura

- **Mantemos SQLite**: Performance adequada para o volume atual
- **Componentes Personalizados**: Decisão mantida, sem migrar para ShadCN
- **App Router**: Estrutura se mostrou eficiente
- **TypeScript Strict**: Mantemos para qualidade de código

### UX/UI

- **Design Consistente**: Padrão estabelecido funcionando bem
- **Responsividade**: Prioridade para mobile mantida
- **Modo Escuro**: Implementação completa mantida
- **Feedback Visual**: Sistema de toasts eficiente

### Performance

- **Paginação**: Implementada onde necessário
- **Lazy Loading**: A ser expandido para componentes pesados
- **Caching**: Estratégias a serem implementadas

## Padrões e Preferências Importantes

### Estrutura de Código

```typescript
// Padrão para páginas admin
export default function PageName() {
	// 1. Estados locais
	// 2. Efeitos e handlers
	// 3. Render JSX
}

// Padrão para API routes
export async function METHOD(req: NextRequest) {
	try {
		// 1. Autenticação
		// 2. Validação
		// 3. Operação
		// 4. Resposta
	} catch (error) {
		// Error handling
	}
}
```

### Estilo de Componentes

- **Funcional sempre**: Sem class components
- **Props tipadas**: Interface explícita para cada componente
- **Ref forwarding**: Quando necessário para integração
- **Compound components**: Para componentes complexos

### Gestão de Estado

- **Server State**: Preferir Server Components quando possível
- **Client State**: useState para estado local, Context para compartilhado
- **Async State**: Handlers com try/catch e loading states

## Aprendizados e Insights do Projeto

### Sucessos

1. **Autenticação Robusta**: Sistema próprio se mostrou eficiente
2. **DX Excelente**: TypeScript + Drizzle + Tailwind = produtividade alta
3. **Componentes Reutilizáveis**: Design system interno funcionando bem
4. **Performance**: SQLite adequado para MVP e crescimento inicial

### Desafios Superados

1. **App Router Learning Curve**: Migração do Pages Router compensou
2. **Componentes Personalizados**: Esforço inicial maior, mas controle total
3. **Rate Limiting**: Implementação própria mais flexível que bibliotecas
4. **Upload de Arquivos**: Solução simples e eficiente

### Lições Aprendidas

1. **Simplicidade First**: Soluções simples funcionam melhor
2. **TypeScript Everywhere**: Tipagem reduz bugs significativamente
3. **Progressive Enhancement**: Core functionality sempre disponível
4. **User Feedback**: Toasts e loading states melhoram UX drasticamente

## Contexto de Desenvolvimento Atual

### Environment Setup

- **Node.js**: Versão LTS
- **SQLite**: Banco local `database.db`
- **Hot Reload**: Turbopack para desenvolvimento rápido
- **VS Code**: IDE recomendada com extensões específicas

### Workflow Atual

1. **Feature Planning**: Definir escopo e arquivos envolvidos
2. **Schema Updates**: Modificar banco se necessário
3. **API Development**: Implementar endpoints
4. **UI Implementation**: Componentes e páginas
5. **Testing**: Testes manuais e validação
6. **Documentation**: Atualizar banco de memória

### Prioridades de Qualidade

1. **Type Safety**: Tudo tipado
2. **Error Handling**: Graceful degradation
3. **User Experience**: Feedback imediato
4. **Performance**: Loading states e otimizações
5. **Security**: Validação e sanitização rigorosa
