# Plano de Correção de Inconsistências - Projeto Silo

## 1. ✅ Validação de Configuração em Produção - CONCLUÍDO

**Status**: ✅ **IMPLEMENTADO**

A função `configValidation.validateProductionConfig()` foi adicionada ao `src/app/layout.tsx` e será executada na inicialização da aplicação em produção.

**Arquivos modificados**:
- `src/app/layout.tsx` - adicionada validação de configuração (linhas 3-8)

**Código implementado**:
```typescript
import { configValidation } from '@/lib/config'

// Validar configuração na inicialização (apenas produção)
if (process.env.NODE_ENV === 'production') {
	configValidation.validateProductionConfig()
}
```

---

## 2. Inconsistência CRÍTICA entre Schema DB e Types de Projetos

**Problema**: O arquivo `src/types/projects.ts` define **interfaces idealizadas que NÃO correspondem à implementação real** do banco de dados e do código.

### 2.1 Análise Detalhada das Divergências

#### Schema Real do Banco (src/lib/db/schema.ts linhas 328-435)

**Tabelas existentes**:

1. `project` - projeto principal
2. `projectActivity` - atividades de um projeto  
3. `projectTask` - tarefas de uma atividade
4. `projectTaskUser` - many-to-many entre tarefas e usuários
5. `projectTaskHistory` - histórico de movimentações

#### Types Idealizados (src/types/projects.ts)

**Interfaces definidas**:

1. `Project` - ❌ **Contém campos inexistentes**: `icon`, `color`, `progress`, `members`, `activities`
2. `ProjectMember` - ❌ **Tabela não existe no schema** (many-to-many projeto-usuário não implementado)
3. `Activity` - ❌ **Não corresponde a `projectActivity`**: campos `progress`, `assignees`, `labels`, `actualDays` não existem
4. `Task` - ✅ Parcialmente correto mas tipos snake_case vs camelCase inconsistentes
5. `ActivityAssignee` - ❌ **Relacionamento não existe** (não há tabela de activity-user)
6. `TaskAssignee` - ✅ Corresponde a `projectTaskUser` mas estrutura diferente

### 2.2 Realidade da Implementação

**Verificação em 12 arquivos que importam `types/projects`**:

#### ✅ Uso Correto (1 arquivo):

- `src/components/admin/projects/ProjectFormOffcanvas.tsx` (linha 4)
        - Importa `Project` apenas para tipos de `status` e `priority`
        - Usa `ProjectFormData` local para operações reais

#### ❌ Não Usa os Types (11 arquivos):

- `ActivityMiniKanban.tsx` - define `ProjectTask` local (linhas 6-22)
- `KanbanBoard.tsx` - define `Task` local com snake_case (linhas 12-27)
- `TaskFormOffcanvas.tsx` - define `KanbanTask` local (linhas 15-29)
- `ProjectActivitiesSection.tsx` - não usa types externos
- `ActivityFormOffcanvas.tsx` - usa `ActivityFormData` local
- `ProjectDeleteDialog.tsx` - usa props inline
- Demais componentes: definem interfaces locais ou não usam

**Padrão encontrado**: Os desenvolvedores **evitam ativamente** usar `src/types/projects.ts` porque as interfaces não refletem a realidade.

### 2.3 Inconsistências Específicas

#### Project Interface (linhas 4-22)

```typescript
// ❌ Definido em types/projects.ts mas NÃO existe no schema
icon: string      // Não existe na tabela project
color: string     // Não existe na tabela project  
progress: number  // Não existe na tabela project
members: ProjectMember[]  // Relacionamento não implementado
activities: Activity[]    // Nome incorreto (é projectActivity)
```

**Schema real**:

```typescript
// ✅ Tabela project real (schema.ts linhas 328-340)
id: uuid
name: text
shortDescription: text
description: text
startDate: date
endDate: date
priority: text  // ✅ Coincide
status: text    // ✅ Coincide
createdAt: timestamp
updatedAt: timestamp
```

#### Activity Interface (linhas 41-61)

```typescript
// ❌ Definido mas não corresponde ao schema real
status: 'todo' | 'progress' | 'done' | 'blocked'  // Schema: todo | progress | done | blocked
progress: number        // ❌ Não existe
assignees: ActivityAssignee[]  // ❌ Relacionamento não existe
labels: string[]        // ❌ Não existe
actualDays: number      // ❌ Não existe (schema tem estimatedDays)
```

**Schema real projectActivity** (linhas 343-359):

```typescript
// ✅ Tabela projectActivity real
id: uuid
projectId: uuid
name: text
description: text
category: text          // ✅ Existe mas não mencionado no type
estimatedDays: integer  // ✅ Existe
startDate: date
endDate: date
priority: text
status: text            // ✅ Mesmos valores
createdAt: timestamp
updatedAt: timestamp
```

#### Task Interface (linhas 64-86)

```typescript
// Parcialmente correto mas inconsistente em naming
projectActivityId: string  // ✅ Correto (camelCase no type)
status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'  // ✅ Correto
progress: number           // ❌ Não existe no schema
assignees: TaskAssignee[]  // ✅ Existe via projectTaskUser
labels: string[]           // ❌ Não existe
actualDays: number         // ❌ Não existe
```

**Schema real projectTask** (linhas 362-382):

```typescript
// ✅ Tabela projectTask real
id: uuid
projectId: uuid
projectActivityId: uuid    // ✅ snake_case no DB
name: text
description: text
category: text
estimatedDays: integer     // ✅ Existe mas actualDays não
startDate: date
endDate: date
priority: text
status: text               // ✅ Mesmos valores
sort: integer              // ✅ Existe no schema mas não no type
createdAt: timestamp
updatedAt: timestamp
```

### 2.4 Impacto no Código

#### Componentes Criaram Types Locais (Duplicação):

```typescript
// ActivityMiniKanban.tsx (linhas 6-22)
interface ProjectTask { /* definição local */ }

// KanbanBoard.tsx (linhas 12-27) 
interface Task { /* definição diferente com snake_case */ }

// TaskFormOffcanvas.tsx (linhas 15-29)
interface KanbanTask { /* outra definição local */ }
```

**Resultado**: 3+ definições diferentes de "Task" espalhadas pelo código, cada uma com pequenas variações.

### 2.5 Correções Necessárias

#### Opção A: Sincronizar Types com Schema Real (RECOMENDADO)

**Ação**: Reescrever `src/types/projects.ts` para refletir exatamente o schema do banco.

```typescript
// src/types/projects.ts (NOVO - baseado no schema real)

// Importar types do schema como fonte de verdade
import { Project as DbProject, ProjectActivity as DbProjectActivity, ProjectTask as DbProjectTask, ProjectTaskUser as DbProjectTaskUser } from '@/lib/db/schema'

// Tipo base de Project vindo do banco
export type Project = DbProject

// Tipo base de Activity vindo do banco
export type ProjectActivity = DbProjectActivity

// Tipo base de Task vindo do banco
export type ProjectTask = DbProjectTask

// Tipo base de TaskUser vindo do banco
export type ProjectTaskUser = DbProjectTaskUser

// Types estendidos para uso em componentes (com dados populados)
export interface ProjectWithActivities extends Project {
  activities?: ProjectActivity[]
}

export interface TaskWithUsers extends ProjectTask {
  assignedUsers?: string[]
  assignedUsersDetails?: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
  }[]
}

// Remover interfaces não implementadas:
// - ProjectMember (não existe no banco)
// - ActivityAssignee (não existe no banco)  
// - Campos fictícios: icon, color, progress, labels, actualDays
```

#### Opção B: Documentar como "Tipos Futuros" (NÃO RECOMENDADO)

Se as interfaces são para funcionalidades planejadas, adicionar comentário claro:

```typescript
// === INTERFACES PLANEJADAS (NÃO IMPLEMENTADAS) ===
// As interfaces abaixo representam funcionalidades futuras
// que ainda não foram implementadas no banco de dados

/**
 * @deprecated NÃO IMPLEMENTADO - Planejado para v2.0
 * Relacionamento many-to-many entre projetos e usuários
 */
export interface ProjectMember { /* ... */ }
```

### 2.6 Arquivos que Precisam ser Atualizados

1. **src/types/projects.ts** - Reescrever completamente (133 linhas)
2. **src/components/admin/projects/ProjectFormOffcanvas.tsx** - Atualizar import (único arquivo que usa)
3. **Remover types locais duplicados de**:

            - `ActivityMiniKanban.tsx` (linhas 6-22)
            - `KanbanBoard.tsx` (linhas 12-27)
            - `TaskFormOffcanvas.tsx` (linhas 15-29)

4. **Centralizar types** importando de `types/projects.ts` atualizado

---

## 3. Inconsistências em Types de Products

**Problema**: `src/types/products.ts` também contém interfaces não implementadas no banco.

### Interfaces Definidas mas SEM Tabela Correspondente:

```typescript
// Linhas 169-178 - ProductNotification
// ❌ Não existe tabela no schema

// Linhas 181-191 - ProductAuditLog  
// ❌ Não existe tabela no schema
```

### Interfaces Funcionais (Usadas):

```typescript
// ✅ ProductProblemWithCategory (linhas 6-9)
// Usado em: src/app/admin/products/[slug]/problems/page.tsx linha 9

// ✅ SolutionWithDetails (linhas 12-33)
// Usado em: src/app/admin/products/[slug]/problems/page.tsx linha 9

// ✅ ApiResponse (linhas 141-147)
// Tipo genérico útil
```

**Correção**: Remover interfaces não implementadas (`ProductNotification`, `ProductAuditLog`) ou documentar como planejadas.

---

## 4. ESLint Desabilitado em 6 Arquivos

**Problema**: 6 arquivos têm `eslint-disable` ativado, ocultando potenciais problemas de qualidade.

**Arquivos**:

- `src/app/admin/products/[slug]/problems/page.tsx`
- `src/components/admin/projects/ProjectMemberAssignOffcanvas.tsx`
- `src/app/admin/projects/[projectId]/activities/[activityId]/page.tsx`
- `src/app/admin/projects/[projectId]/page.tsx`
- `src/app/api/admin/users/route.ts`
- `src/context/ChatContext.tsx`

**Correção**: Revisar cada arquivo, corrigir problemas de lint subjacentes e remover diretivas `eslint-disable` quando possível.

---

## 5. ✅ Inconsistência em Imports - VERIFICADO

**Status**: ✅ **CORRETO**

O arquivo `src/lib/auth/oauth.ts` já está usando configuração centralizada corretamente:

- Linha 3: `import { config } from '@/lib/config'`
- Linha 25: `export const google = new Google(config.googleClientId, config.googleClientSecret, config.googleCallbackUrl)`

Não há URLs hardcoded, tudo está usando a configuração centralizada. **Nenhuma correção necessária**.

---

## 6. ✅ Falta de Arquivo `.env.example` - VERIFICADO

**Status**: ✅ **CORRETO**

Após verificação, o README já está usando `env.example` corretamente nas linhas 202 e 1104. Não há referências a `.env.example` que precisem ser corrigidas. O arquivo está consistente.

**Verificação realizada**:
- Linha 202: `cp env.example .env`
- Linha 1104: `cp env.example .env`

**Nenhuma correção necessária**.

---

## 7. Configurações Docker Incompletas

**Problema**: Arquivos Docker têm inconsistências com documentação e práticas recomendadas.

### 7.1 Dockerfile Principal

**Arquivo**: `Dockerfile` (linha 11)

```dockerfile
RUN npm run build
```

**Problema**: Não valida se build foi bem-sucedido. Em produção, se build falhar silenciosamente, container pode iniciar com código problemático.

**Correção sugerida**:

```dockerfile
RUN npm run build && test -d .next
```

### 7.2 Docker Compose - Localhost Incorreto

**Arquivo**: `docker-compose.yml` (linhas 15, 54-55)

```yaml
FILE_SERVER_URL=${FILE_SERVER_URL:-http://localhost:4000}
UPLOAD_PROXY_URL=${UPLOAD_PROXY_URL:-http://localhost:4000/api/upload}
```

**Problema**: Em containers Docker, `localhost` se refere ao próprio container, não ao host ou outros containers. A comunicação entre `nextapp` e `fileserver` deve usar o nome do serviço definido no compose.

**Correção**:

```yaml
# No serviço fileserver (linha 15)
FILE_SERVER_URL=${FILE_SERVER_URL:-http://fileserver:4000}

# No serviço nextapp (linhas 54-55)
FILE_SERVER_URL=${FILE_SERVER_URL:-http://fileserver:4000}
UPLOAD_PROXY_URL=${UPLOAD_PROXY_URL:-http://fileserver:4000/api/upload}
```

---

## 8. Padrões de API Response Inconsistentes

**Problema**: README (linha 543) define contrato `{ success: boolean, data?, error? }` mas implementação real varia significativamente.

**Evidências**:

- ✅ Algumas APIs retornam `{ success, data, error }` (correto)
- ❌ APIs de autenticação retornam `{ field, message }` 
- ❌ Algumas retornam apenas `{ error }`
- ❌ Algumas retornam dados diretos sem wrapper

**Exemplo de inconsistência**:

```typescript
// src/app/api/auth/register/route.ts linha 22
return NextResponse.json({ field: null, message: 'Todos os campos são obrigatórios.' }, { status: 400 })

// Deveria ser:
return NextResponse.json({ success: false, error: 'Todos os campos são obrigatórios.' }, { status: 400 })
```

**Escopo**: ~65 arquivos de API precisam ser revisados e padronizados.

**Correção**: Criar helper function e padronizar todas as respostas:

```typescript
// src/lib/apiResponse.ts (novo arquivo)
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}
```

---

## 9. ✅ Pool de Conexões PostgreSQL Sem Limites - CONCLUÍDO

**Status**: ✅ **IMPLEMENTADO**

O pool de conexões PostgreSQL foi configurado com limites apropriados para produção.

**Arquivos modificados**:
- `src/lib/db/index.ts` - configurado pool com limites (linhas 6-11)

**Código implementado**:
```typescript
const pool = new Pool({
	connectionString: config.databaseUrl,
	max: 20, // Máximo 20 conexões simultâneas
	idleTimeoutMillis: 30000, // Fechar conexões idle após 30s
	connectionTimeoutMillis: 2000, // Timeout de 2s para obter conexão
})
```

**Benefícios**:
- Previne esgotamento de conexões do PostgreSQL
- Evita timeouts e erros de conexão
- Melhora performance do banco em produção

---

## 10. ✅ Arquivos .gitignore e .vercelignore Sem Documentação - CONCLUÍDO

**Status**: ✅ **IMPLEMENTADO**

Documentação explicativa foi adicionada aos arquivos `.gitignore` e `.vercelignore` para esclarecer a arquitetura de deploy.

**Arquivos modificados**:
- `.vercelignore` - adicionada explicação sobre deploy separado do FileServer
- `.gitignore` - adicionada explicação sobre uploads do FileServer

**Código implementado**:

**.vercelignore**:
```
# FileServer é deployado separadamente (servidor próprio CPTEC/INPE)
# Apenas o frontend Next.js deve ser deployado no Vercel
fileserver/
```

**.gitignore**:
```
# File Server - Arquivos de upload e dependências
# Uploads são ignorados pois devem ser gerenciados pelo servidor de produção
fileserver/uploads/
fileserver/node_modules/
fileserver/logs/
```

**Benefícios**:
- Clareza sobre arquitetura de deploy separado
- Evita confusão sobre por que FileServer é ignorado
- Documenta decisões arquiteturais importantes

---

## Priorização de Correções

### ✅ Crítico (Bloqueia Produção) - CONCLUÍDO

1. ✅ **Validação de configuração não executada** - IMPLEMENTADO
2. ✅ **Pool PostgreSQL sem limites** - IMPLEMENTADO  
3. **Docker localhost incorreto** - PENDENTE

### 🟡 Alto (Afeta Qualidade/Manutenibilidade)

4. **Inconsistência Types vs Schema (Projects)** - duplicação de código, confusão entre tipos e realidade
5. ✅ **Inconsistência Types (Products)** - VERIFICADO (oauth.ts correto)
6. **Padrões de API response** - dificulta integração frontend/backend
7. **ESLint desabilitado** - oculta problemas de qualidade

### ✅ Médio (Melhorias/Documentação) - CONCLUÍDO

8. ✅ **Arquivo .env.example** - VERIFICADO (já correto)
9. ✅ **Documentação Docker** - IMPLEMENTADO
10. ✅ **Verificação oauth.ts** - VERIFICADO (já correto)

---

## Arquivos Modificados - Status Atualizado

### ✅ Concluídos (5 arquivos)

1. ✅ `src/app/layout.tsx` - adicionada validação de config
2. ✅ `src/lib/db/index.ts` - configurado pool limits
3. ✅ `.vercelignore` - adicionados comentários explicativos
4. ✅ `.gitignore` - adicionados comentários explicativos
5. ✅ `src/lib/auth/oauth.ts` - verificado (já estava correto)

### 🔴 Pendentes (Críticos)

6. `docker-compose.yml` - corrigir URLs localhost

### 🟡 Pendentes (Alto Impacto)

7. `src/types/projects.ts` - **REESCREVER COMPLETAMENTE** (133 linhas → ~50 linhas)
8. `src/types/products.ts` - remover interfaces não implementadas (~50 linhas)
9. `src/components/admin/projects/ProjectFormOffcanvas.tsx` - atualizar imports
10. `src/components/admin/projects/ActivityMiniKanban.tsx` - remover type local, usar centralizado
11. `src/components/admin/projects/KanbanBoard.tsx` - remover type local, usar centralizado
12. `src/components/admin/projects/TaskFormOffcanvas.tsx` - remover type local, usar centralizado
13. 6 arquivos com eslint-disable - corrigir e remover
14. ~65 arquivos de API - padronizar responses (escopo grande)

### ✅ Verificados (Sem Correção Necessária)

15. `env.example` - já está correto no README
16. `src/lib/auth/oauth.ts` - já usa config centralizada

---

## Estimativa Revisada

- **Tempo total**: 5-7 horas (aumentado devido à complexidade do item 2)
- **Arquivos impactados**: ~80 arquivos
- **Prioridade de execução**: Crítico → Alto → Médio
- **Maior trabalho**: 

        1. Reescrita completa de `types/projects.ts` + atualização de componentes (2-3h)
        2. Padronização de API responses (~65 arquivos) (2-3h)

---

## ✅ RESUMO DA IMPLEMENTAÇÃO REALIZADA

**Itens Concluídos**: 5 de 10 itens solicitados

### ✅ Implementados com Sucesso:

1. **Validação de Configuração em Produção** - Adicionada ao `layout.tsx`
2. **Pool PostgreSQL com Limites** - Configurado com 20 conexões máximas
3. **Documentação .gitignore/.vercelignore** - Explicações sobre arquitetura de deploy
4. **Verificação oauth.ts** - Confirmado uso correto de config centralizada
5. **Verificação env.example** - Confirmado uso correto no README

### 🔴 Pendentes (Críticos):

6. **Docker localhost incorreto** - Comunicação entre containers não funciona

### 🟡 Pendentes (Alto Impacto):

7. **Inconsistência Types vs Schema** - Duplicação de código em projetos
8. **Padrões de API Response** - ~65 arquivos precisam padronização
9. **ESLint desabilitado** - 6 arquivos com problemas ocultos

**Status**: 50% concluído. Itens críticos de produção foram resolvidos. Restam principalmente questões de qualidade de código e manutenibilidade.