# Plano de Correção de Inconsistências - Projeto Silo

## 1. Inconsistência CRÍTICA entre Schema DB e Types de Projetos

**Problema**: O arquivo `src/types/projects.ts` define **interfaces idealizadas que NÃO correspondem à implementação real** do banco de dados e do código.

### 1.1 Análise Detalhada das Divergências

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

### 1.2 Realidade da Implementação

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

### 1.3 Inconsistências Específicas

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

### 1.4 Impacto no Código

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

### 1.5 Correções Necessárias

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

### 1.6 Arquivos que Precisam ser Atualizados

1. **src/types/projects.ts** - Reescrever completamente (133 linhas)
2. **src/components/admin/projects/ProjectFormOffcanvas.tsx** - Atualizar import (único arquivo que usa)
3. **Remover types locais duplicados de**:

            - `ActivityMiniKanban.tsx` (linhas 6-22)
            - `KanbanBoard.tsx` (linhas 12-27)
            - `TaskFormOffcanvas.tsx` (linhas 15-29)

4. **Centralizar types** importando de `types/projects.ts` atualizado

---

## 2. Inconsistências em Types de Products

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

## 3. ESLint Desabilitado em 6 Arquivos

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

## 4. Padrões de API Response Inconsistentes

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
