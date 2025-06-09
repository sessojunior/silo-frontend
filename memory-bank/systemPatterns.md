# System Patterns - Silo

## Arquitetura Geral

### Estrutura Monolítica Full-Stack

- **Next.js App Router**: Frontend e backend unificados
- **Colocation Pattern**: Componentes, APIs e páginas organizados por feature
- **File-based Routing**: Estrutura de rotas baseada na organização de arquivos

### Organização de Diretórios

```
src/
├── app/                    # App Router (Next.js 15+)
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── (site)/            # Página pública
│   ├── admin/             # Área administrativa protegida
│   └── api/               # API routes
├── components/            # Componentes UI reutilizáveis
│   ├── admin/            # Componentes específicos da área admin
│   ├── auth/             # Componentes de autenticação
│   ├── site/             # Componentes da área pública
│   └── ui/               # Componentes base (Design System)
├── context/              # React Contexts
├── lib/                  # Utilitários e configurações
│   ├── auth/            # Sistema de autenticação
│   └── db/              # Configuração e schema do banco
└── types/               # Definições TypeScript
```

## Padrões de Autenticação

### Session-Based Authentication

- **Cookies HttpOnly**: Tokens seguros não acessíveis via JavaScript
- **Hash no Banco**: Tokens armazenados como SHA-256 hash
- **Expiração Automática**: Sessões renovadas automaticamente se ativas
- **Revogação Granular**: Possibilidade de invalidar sessões específicas

### Fluxo de Autenticação

1. **Login** → Gera token aleatório → Hash no banco → Cookie HttpOnly
2. **Middleware** → Valida token em cada request → Renova se necessário
3. **Logout** → Remove do banco → Limpa cookie

### Proteção CSRF/XSS

- **SameSite=Lax**: Previne CSRF attacks
- **HttpOnly**: Previne XSS via JavaScript
- **Secure flag**: Apenas HTTPS em produção

## Padrões de Componentes UI

### Estrutura Base dos Componentes

```typescript
// Padrão para componentes reutilizáveis
interface ComponentProps extends HTMLAttributes<HTMLElement> {
  // Props específicas
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  // Props padrão de HTML passadas via spread
}

export default function Component({
  variant = 'primary',
  className,
  ...props
}: ComponentProps) {
  return (
    <element
      className={clsx(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  )
}
```

### Sistema de Design Personalizado

- **Não usa ShadCN**: Componentes totalmente customizados
- **Tailwind-first**: Classes utilitárias como base
- **Variants Pattern**: Múltiplas aparências via props
- **Forwarded Refs**: Suporte completo a refs quando necessário

### Componentes Base Implementados

- **Button**: Múltiplos estilos (filled, bordered, unstyled)
- **Input**: Text, email, password com validação visual
- **Select**: Dropdown customizado com teclado navigation
- **Modal/Dialog/Offcanvas**: Overlays acessíveis
- **Toast**: Sistema de notificações global
- **Tree**: Navegação hierárquica
- **Accordion**: Conteúdo expansível

## Padrões de Estado

### Client State (React)

- **useState**: Estado local de componentes
- **useContext**: Estado compartilhado (User, Sidebar)
- **Custom Hooks**: Lógica reutilizável (useUser, useSidebar)

### Server State

- **Server Components**: Busca de dados no servidor (quando possível)
- **Client Components**: Para interatividade e estado local
- **API Routes**: Endpoints RESTful para operações CRUD

### Validação

- **Client-side**: Validação instantânea em formulários
- **Server-side**: Validação robusta em todas as APIs
- **Input Sanitization**: Prevenção de XSS e SQL injection

## Padrões de Database

### Schema Design (Drizzle ORM)

- **Type-safe**: Schema TypeScript-first
- **Relational**: Foreign keys com integridade referencial
- **Timestamps**: created_at/updated_at em entidades relevantes
- **Soft Deletes**: Quando histórico é importante

### Principais Entidades

```typescript
// Padrão de relacionamentos
export const product = sqliteTable('product', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	available: integer({ mode: 'boolean' }).notNull(),
})

export const productProblem = sqliteTable('product_problem', {
	id: text('id').primaryKey(),
	productId: text('product_id').references(() => product.id),
	userId: text('user_id').references(() => authUser.id),
	title: text('title').notNull(),
	description: text('description').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
```

### Query Patterns

- **Joins**: Relacionamentos carregados eficientemente
- **Pagination**: Offset/limit para listas grandes
- **Filtering**: WHERE clauses dinâmicas
- **Ordering**: Sempre especificado para consistência

## Padrões de API

### RESTful Endpoints

```typescript
// Padrão de API route
export async function GET(req: NextRequest) {
	try {
		// 1. Validar autenticação
		const user = await getAuthUser()
		if (!user) return unauthorizedResponse()

		// 2. Validar parâmetros
		const { searchParams } = new URL(req.url)
		const validatedParams = validateParams(searchParams)

		// 3. Executar operação
		const result = await performOperation(validatedParams)

		// 4. Retornar resposta
		return Response.json(result)
	} catch (error) {
		return errorResponse(error)
	}
}
```

### Padrões de Response

- **Consistência**: Sempre JSON com estrutura similar
- **Error Handling**: Códigos HTTP apropriados
- **Validation Errors**: Campo específico + mensagem
- **Rate Limiting**: Proteção contra abuso

## Padrões de Upload de Arquivos

### Estrutura de Uploads

```
public/uploads/
├── profile/              # Fotos de perfil
├── products/
│   ├── problems/         # Imagens de problemas
│   └── solutions/        # Imagens de soluções
```

### Processamento

- **Validação de tipo**: Apenas imagens permitidas
- **Limite de tamanho**: Proteção contra uploads grandes
- **Nomes únicos**: UUID para evitar conflitos
- **Cleanup**: Remoção de arquivos órfãos

## Padrões de Segurança

### Rate Limiting

- **Por IP + Email + Route**: Proteção granular
- **Sliding Window**: Janela deslizante de tempo
- **Cleanup Automático**: Limpeza de registros antigos

### Validação de Input

```typescript
// Padrão de validação
export function validateInput(data: unknown): ValidationResult {
	// 1. Type checking
	if (typeof data !== 'object') return { error: 'Invalid type' }

	// 2. Required fields
	if (!data.field) return { error: 'Field required', field: 'field' }

	// 3. Format validation
	if (!isValidFormat(data.field)) return { error: 'Invalid format' }

	// 4. Sanitization
	return { data: sanitize(data) }
}
```

## Padrões de UI/UX

### Loading States

- **Skeleton**: Para carregamento de listas
- **Spinners**: Para ações de botão
- **Progressive Enhancement**: Funcionalidade básica sempre disponível

### Responsive Design

- **Mobile-first**: Design começando pelo mobile
- **Breakpoints**: sm/md/lg/xl consistentes
- **Touch-friendly**: Botões e inputs adequados para touch

### Accessibility

- **Semantic HTML**: Estrutura correta
- **ARIA labels**: Quando necessário
- **Keyboard navigation**: Suporte completo
- **Focus management**: Estados visuais claros

## Decisões Técnicas Importantes

### Por que não ShadCN UI?

- **Controle total**: Personalização completa dos componentes
- **Simplicidade**: Sem dependências extras desnecessárias
- **Performance**: Componentes otimizados para nosso caso específico

### Por que SQLite em desenvolvimento?

- **Simplicidade**: Zero configuração
- **Performance**: Adequado para o volume esperado
- **Migração fácil**: Drizzle facilita mudança para PostgreSQL

### Por que Autenticação própria vs NextAuth?

- **Controle total**: Fluxos específicos para nossas necessidades
- **Simplicidade**: Menos abstração, mais transparência
- **Performance**: Sem overhead de bibliotecas complexas

### Por que App Router vs Pages Router?

- **Future-proof**: Direção oficial do Next.js
- **Performance**: Server Components por padrão
- **Developer Experience**: Colocation e organização melhorada
