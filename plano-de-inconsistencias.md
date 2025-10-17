# Plano de Correção de Inconsistências do Projeto SILO

## Análise Completa Realizada

Foram identificadas **8 categorias de inconsistências** distribuídas em **50+ arquivos** do projeto.

---

## 1. CRÍTICO: Dependências Ausentes (BLOQUEADOR) 🔴

### Problema Identificado

- **Zod não instalado**: Arquivo `src/lib/validation.ts` importa e usa `zod` extensivamente, mas a biblioteca não está no `package.json`
- **@types/bcryptjs ausente**: Falta tipagem TypeScript para `bcryptjs`

### Arquivos Afetados

- `src/lib/validation.ts` (312 linhas usando Zod)
- Qualquer código que importa de `src/lib/validation.ts`

### Ações Necessárias

1. Adicionar `zod` às dependências em `package.json`
2. Adicionar `@types/bcryptjs` aos devDependencies em `package.json`
3. Executar `npm install` para instalar as dependências
4. Verificar se build compila sem erros

### Impacto

- **Severidade**: CRÍTICA
- **Build pode falhar** em produção
- **Validações não funcionarão** corretamente
- **Erros TypeScript** em modo strict

---

## 2. Referências Desatualizadas ao UploadThing (LIMPEZA) ⚠️

### Problema Identificado

O projeto migrou completamente para servidor local de arquivos, mas ainda existem **29 referências** ao UploadThing em:

- Comentários de código
- Documentação de testes
- README.md

### Arquivos Afetados

```
Comentários em código (8 arquivos):
- src/app/admin/products/[slug]/problems/page.tsx (linhas 48, 467)
- src/components/admin/products/ProblemFormOffcanvas.tsx (linha 32)
- src/app/api/admin/products/solutions/route.ts (linhas 81, 95, 129, 162)
- src/components/admin/contacts/ContactFormOffcanvas.tsx (linhas 76, 179)
- fileserver/dist/utils.js (linha 64)
- fileserver/src/utils.ts (linha 72)

Documentação (5 arquivos):
- README.md (linhas 671, 695, 919, 926, 988, 1024, 1046, 1266)
- tests/04b-contacts-upload.spec.ts (linhas 5, 99)
- tests/03b-products-problems.spec.ts (linha 31)
- tests/README.md (linha 192)
- tests/test-config.md (linhas 21-27, 71)
- tests/fixtures/README.md (linha 91)
```

### Ações Necessárias

1. Atualizar todos os comentários para mencionar "servidor local" ou "UploadButtonLocal"
2. Remover seção de UploadThing do `tests/test-config.md`
3. Limpar referências no README.md mantendo apenas menção histórica da migração
4. Atualizar descrição dos testes para refletir sistema atual

---

## 3. Variáveis de Ambiente Inconsistentes (PRODUÇÃO) ⚠️

### Problema Identificado

Arquivos `env.example` e `env.docker.example` têm estruturas diferentes:

**Faltam em env.docker.example:**

- `NODE_ENV`
- `GOOGLE_CALLBACK_URL`
- Variáveis SMTP (usa `EMAIL_*` mas código usa `SMTP_*`)
- `FILE_SERVER_URL`
- `NEXT_PUBLIC_FILE_SERVER_URL`
- `UPLOAD_PROXY_URL`

**Docker-compose.yml também está incompleto:**

- Faltam variáveis de FILE_SERVER
- Faltam variáveis SMTP completas

### Arquivos Afetados

- `env.docker.example` (16 linhas, faltam 10+ variáveis)
- `docker-compose.yml` (33 linhas, configuração incompleta)

### Ações Necessárias

1. Sincronizar `env.docker.example` com `env.example`
2. Atualizar `docker-compose.yml` com todas as variáveis necessárias
3. Adicionar variáveis do fileserver no docker-compose
4. Documentar diferenças entre dev e produção

---

## 4. Next.config.ts com Configuração Limitada (PRODUÇÃO) ⚠️

### Problema Identificado

Configuração de imagens apenas permite `localhost:4000`, sem suporte para produção.

**Arquivo:** `next.config.ts` (15 linhas)

### Ações Necessárias

1. Adicionar configuração para domínio de produção usando variável de ambiente
2. Suportar tanto HTTP quanto HTTPS
3. Permitir múltiplos domínios (dev, staging, produção)

**Exemplo de configuração sugerida:**

```typescript
images: {
  remotePatterns: [
    // Desenvolvimento
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '4000',
      pathname: '/files/**',
    },
    // Produção - usar variável de ambiente
    ...(process.env.FILE_SERVER_HOSTNAME ? [{
      protocol: process.env.FILE_SERVER_PROTOCOL || 'https',
      hostname: process.env.FILE_SERVER_HOSTNAME,
      pathname: '/files/**',
    }] : [])
  ],
}
```

---

## 5. URLs Hardcoded com Localhost (PRODUÇÃO) ⚠️

### Problema Identificado

17 ocorrências de URLs hardcoded com `localhost:3000` ou `localhost:4000` em código de produção.

### Arquivos Afetados

```
APIs de Upload (8 arquivos):
- src/app/api/admin/products/images/route.ts:78
- src/app/api/admin/products/solutions/images/route.ts:78
- src/app/api/upload/solution/route.ts:9
- src/app/api/upload/problem/route.ts:9
- src/app/api/upload/contact/route.ts:9
- src/app/api/upload/avatar/route.ts:9
- src/app/api/upload/route.ts:9
- src/app/api/(user)/user-profile-image/route.ts:52

APIs com lógica de host (2 arquivos):
- src/app/api/admin/contacts/route.ts:186,191,192
- src/app/api/auth/callback/google/route.ts:31,39,52,72,91,100

Documentação (1 arquivo):
- src/lib/auth/oauth.ts:17
```

### Padrão Atual (Problemático)

```typescript
const fileServerUrl = process.env.FILE_SERVER_URL || 'http://localhost:4000'
```

### Ações Necessárias

1. Criar validação rigorosa de variáveis de ambiente em produção
2. Falhar explicitamente se variável não estiver configurada em produção
3. Adicionar validação no início da aplicação (middleware ou config)

**Sugestão de implementação:**

```typescript
// src/lib/config.ts (NOVO ARQUIVO)
export const getFileServerUrl = (): string => {
  const url = process.env.FILE_SERVER_URL
  if (!url && process.env.NODE_ENV === 'production') {
    throw new Error('FILE_SERVER_URL must be set in production')
  }
  return url || 'http://localhost:4000'
}
```

---

## 6. README.md com Seções Redundantes (DOCUMENTAÇÃO) ℹ️

### Problema Identificado

README.md (1871 linhas) contém:

- **Informações duplicadas** sobre migração de infraestrutura (linhas 665-706)
- **Referências inconsistentes** a "Nginx" quando usa Express (linha 919)
- **Múltiplas seções** repetindo mesma informação

### Ações Necessárias

1. Consolidar seções sobre migração de infraestrutura
2. Corrigir referências técnicas incorretas (Nginx → Express)
3. Remover redundâncias mantendo informação completa
4. Reorganizar estrutura para melhor navegação

---

## 7. Logs de Debug em Produção (PERFORMANCE) ℹ️

### Problema Identificado

Múltiplos arquivos ainda contêm logs de debug que não seguem o padrão documentado ou são desnecessários.

### Arquivos Principais

```
Logs informativos de debug:
- src/components/admin/dashboard/ProductStatusHistory.tsx:57
- src/components/admin/sidebar/Sidebar.tsx:41,45,48,62

Logs em fileserver (aceitáveis):
- fileserver/src/config.ts:64,69-78 (logs de inicialização)
```

### Ações Necessárias

1. Revisar logs informativos em componentes
2. Remover logs "Dados recebidos" conforme padrão documentado
3. Manter apenas logs de erro e ações críticas
4. Considerar adicionar flag `DEBUG` para logs de desenvolvimento

---

## 8. Comentários com TODO/FIXME (MANUTENÇÃO) ℹ️

### Problema Identificado

Verificação grep retornou 168 ocorrências, mas a maioria são falsos positivos (palavras "todo" em variáveis/comentários normais, não TODOs pendentes).

**Não foram encontrados TODOs críticos** que indiquem trabalho inacabado.

### Ações Necessárias

Nenhuma ação necessária - não há TODOs pendentes reais.

---

## Resumo de Prioridades

### 🔴 CRÍTICO (Executar Primeiro)

1. **Adicionar dependências Zod e @types/bcryptjs** - Bloqueador de build

   - Tempo estimado: 5 minutos
   - Risco: ALTO

### ⚠️ IMPORTANTE (Produção)

2. **Sincronizar variáveis de ambiente** - Necessário para Docker

   - Tempo estimado: 15 minutos
   - Risco: MÉDIO

3. **Atualizar next.config.ts** - Suporte para produção

   - Tempo estimado: 10 minutos
   - Risco: MÉDIO

### ℹ️ MANUTENÇÃO (Limpeza)

6. **Remover referências a UploadThing** - Limpeza de código

   - Tempo estimado: 25 minutos
   - Risco: BAIXO

7. **Limpar logs de debug** - Performance

   - Tempo estimado: 10 minutos
   - Risco: BAIXO

8. **Consolidar README.md** - Documentação

   - Tempo estimado: 20 minutos
   - Risco: BAIXO

---

**Tempo Total Estimado:** 2h 15min

**Arquivos a Modificar:** ~35 arquivos

**Linhas Estimadas:** ~200 linhas modificadas