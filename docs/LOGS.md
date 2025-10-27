# 📋 Sistema de Logs

Documentação sobre padrões e boas práticas para uso de logs no projeto SILO.

---

## 📋 **ÍNDICE**

1. [Visão Geral](#-visão-geral)
2. [Emojis Padronizados](#-emojis-padronizados)
3. [Regras e Convenções](#-regras-e-convenções)
4. [Exemplos](#-exemplos)
5. [O que Manter](#-o-que-manter)
6. [O que Remover](#-o-que-remover)

---

## 🎯 **VISÃO GERAL**

O sistema usa logs padronizados para facilitar debug, monitoramento e manutenção.

**Vantagens:**

- ✅ Identificação rápida de problemas
- ✅ Rastreabilidade de operações
- ✅ Monitoramento em tempo real
- ✅ Histórico de ações críticas

---

## 🎨 **EMOJIS PADRONIZADOS**

### **❌ Erro**

```typescript
console.error('❌ [CONTEXTO] Descrição do erro', { detalhes })
```

**Uso:**

- Erros em catch blocks
- Operações que falharam
- Validações que falharam

### **⚠️ Aviso**

```typescript
console.warn('⚠️ [CONTEXTO] Descrição do aviso', { detalhes })
```

**Uso:**

- Operações que podem causar problemas
- Validações que passaram com ressalvas
- Estados inesperados mas tratados

### **ℹ️ Informativo**

```typescript
console.log('ℹ️ [CONTEXTO] Descrição', { detalhes })
```

**Uso:**

- Confirmações de ações críticas
- Mudanças de estado importantes
- Informações relevantes para debug

---

## 📐 **REGRAS E CONVENÇÕES**

### **Contexto**

Contexto entre `[]` em MAIÚSCULAS, sem acentos:

```typescript
// ✅ Correto
console.log('ℹ️ [API_CHAT] Mensagem enviada', { userId, groupId })
console.error('❌ [HOOK_USERS] Erro ao carregar usuários', { error })
console.warn('⚠️ [COMPONENT_KANBAN] Estado inválido', { state })

// ❌ Incorreto
console.log('ℹ️ [api-chat] Mensagem enviada')  // minúsculas
console.log('ℹ️ [API Chat] Mensagem enviada')  // com espaço
console.log('ℹ️ [API_CHAT] Mensagem enviada')  // sem acentos
```

### **Detalhes**

Sempre usar objeto `{ detalhes }` para informações estruturadas:

```typescript
// ✅ Correto
console.error('❌ [API_AUTH] Erro no login', {
  email: 'usuario@inpe.br',
  error: error.message,
  statusCode: 500
})

// ❌ Incorreto
console.error('❌ [API_AUTH] Erro no login', 'usuario@inpe.br')
```

### **Contextos Comuns**

- `[API_CHAT]` - APIs de chat
- `[API_AUTH]` - Autenticação
- `[API_ADMIN]` - Administração
- `[HOOK_USERS]` - Hooks de usuário
- `[COMPONENT_KANBAN]` - Kanban
- `[PAGE_PROJECTS]` - Página de projetos
- `[DB_QUERY]` - Queries de banco
- `[FILE_UPLOAD]` - Upload de arquivos

---

## 📝 **EXEMPLOS**

### **Sucesso**

```typescript
// Ação completada com sucesso
console.log('ℹ️ [API_CHAT] Mensagem criada', {
  messageId: msg.id,
  senderId: msg.senderUserId,
  groupId: msg.receiverGroupId
})
```

### **Erro Capturado**

```typescript
try {
  await db.insert(users).values(newUser)
} catch (error) {
  console.error('❌ [DB_QUERY] Erro ao criar usuário', {
    email: newUser.email,
    error: error.message
  })
  throw error
}
```

### **Aviso**

```typescript
if (!isValidDomain(email)) {
  console.warn('⚠️ [API_AUTH] Domínio inválido', {
    email,
    expectedDomain: '@inpe.br'
  })
  return NextResponse.json({ error: 'Domínio inválido' }, { status: 400 })
}
```

### **Estado Inesperado**

```typescript
if (task.status === 'blocked' && !task.blockReason) {
  console.warn('⚠️ [COMPONENT_KANBAN] Tarefa bloqueada sem motivo', {
    taskId: task.id,
    status: task.status
  })
}
```

---

## ✅ **O QUE MANTER**

### **Erros em catch blocks**

```typescript
try {
  await sendEmail(email, subject, html)
} catch (error) {
  console.error('❌ [SEND_EMAIL] Erro ao enviar email', {
    to: email,
    error: error.message
  })
}
```

### **Erros inesperados de API**

```typescript
const response = await fetch('/api/users')
if (!response.ok) {
  console.error('❌ [API_CALL] Erro na requisição', {
    url: '/api/users',
    status: response.status
  })
}
```

### **Confirmações de ações críticas**

```typescript
await db.update(users)
  .set({ isActive: true })
  .where(eq(users.id, userId))

console.log('ℹ️ [USER_ADMIN] Usuário ativado', { userId })
```

### **Mudanças de estado críticas**

```typescript
await db.update(tasks)
  .set({ status: 'completed' })
  .where(eq(tasks.id, taskId))

console.log('ℹ️ [TASK_UPDATE] Tarefa concluída', { taskId, newStatus: 'completed' })
```

---

## ❌ **O QUE REMOVER**

### **Logs de debug desnecessários**

```typescript
// ❌ Remover
console.log('ℹ️ [COMPONENT] Carregando dados...')
console.log('ℹ️ [API] Chamando API...')

// ✅ Mantenha apenas o resultado
console.log('ℹ️ [API] Dados carregados com sucesso', { count: data.length })
```

### **Logs de sucesso redundantes**

```typescript
// ❌ Remover
console.log('ℹ️ [API] Request recebido')
console.log('ℹ️ [API] Validando dados')
console.log('ℹ️ [API] Salvando no banco')
console.log('ℹ️ [API] Respondendo ao cliente')

// ✅ Mantenha apenas o essencial
console.log('ℹ️ [API] Operação concluída', { result })
```

### **useEffect apenas com logs de debug**

```typescript
// ❌ Remover
useEffect(() => {
  console.log('ℹ️ [COMPONENT] Componente montado')
  return () => console.log('ℹ️ [COMPONENT] Componente desmontado')
}, [])

// ❌ Remover todo o useEffect se só tinha logs
```

---

## 🎯 **BEST PRACTICES**

### **1. Sempre incluir detalhes relevantes**

```typescript
console.error('❌ [API_AUTH] Erro no login', {
  email,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
})
```

### **2. Usar contexto descritivo**

```typescript
// ✅ Correto
console.log('ℹ️ [TASK_UPDATE] Status alterado', { taskId, from: 'todo', to: 'in_progress' })

// ❌ Incorreto
console.log('ℹ️ Mudou', { taskId })
```

### **3. Logar antes de lançar erro**

```typescript
try {
  await riskyOperation()
} catch (error) {
  console.error('❌ [CONTEXT] Erro na operação', {
    operation: 'riskyOperation',
    error: error.message
  })
  throw error  // Re-throw após logar
}
```

### **4. Agrupar logs relacionados**

```typescript
console.log('ℹ️ [USER_IMPORT] Importação iniciada', { count: users.length })

users.forEach(user => {
  // Processar usuário
  console.log('ℹ️ [USER_IMPORT] Usuário processado', { userId: user.id })
})

console.log('ℹ️ [USER_IMPORT] Importação concluída', { imported: users.length })
```

---

**🎯 Padrão estabelecido em todo o projeto - manter consistência!**
