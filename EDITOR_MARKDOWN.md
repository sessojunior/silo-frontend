# Editor de Markdown para Base de Conhecimento

## Mudanças Implementadas

### 1. Substituição do Textarea

O textarea simples para edição de capítulos da base de conhecimento foi substituído pelo **@uiw/react-md-editor**, um editor de markdown completo com as seguintes funcionalidades:

- **Editor WYSIWYG** com preview em tempo real
- **Barra de ferramentas** com botões para formatação
- **Sintaxe Markdown** completa
- **Modo escuro/claro** automático baseado no tema do sistema

### 2. Customizações Visuais

#### Botões da Barra de Ferramentas Aumentados

Os botões da toolbar foram aumentados significativamente para melhor usabilidade:

- **Altura:** 40px (h-10)
- **Largura:** 40px (w-10)
- **Ícones:** 20px (h-5 w-5)
- **Texto:** text-base

#### Tema Personalizado

O editor foi customizado para integrar com o design system do projeto:

- **Bordas:** Seguem o padrão zinc-200/zinc-700
- **Fundo:** Branco no modo claro, zinc-900 no modo escuro
- **Texto:** zinc-900 no modo claro, zinc-100 no modo escuro
- **Divisores:** zinc-200/zinc-700

### 3. Configuração Implementada

```tsx
<MDEditor value={formContent} onChange={(val) => setFormContent(val || '')} height={400} preview='edit' />
```

### 4. Estilos CSS Customizados

Os estilos foram adicionados no `globals.css`:

```css
/* MD Editor customizations */
.md-editor-custom .w-md-editor-toolbar ul li button,
.md-editor-custom .w-md-editor-toolbar ul li .w-md-editor-toolbar-item {
	@apply h-10 w-10 text-base;
}

.md-editor-custom .w-md-editor-toolbar ul li button svg {
	@apply h-5 w-5;
}
```

### 5. Detecção Automática de Tema

Implementei um sistema automático para detectar mudanças entre os modos dark/light:

```tsx
// Detecta tema dark/light
useEffect(() => {
	const checkTheme = () => {
		const isDark = document.documentElement.classList.contains('dark')
		setIsDarkMode(isDark)
	}

	// Verifica tema inicial
	checkTheme()

	// Observer para mudanças no tema
	const observer = new MutationObserver(checkTheme)
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class'],
	})

	return () => observer.disconnect()
}, [])
```

O editor aplica automaticamente o tema correto:

```tsx
<MDEditor
	data-color-mode={isDarkMode ? 'dark' : 'light'}
	// ... outras props
/>
```

### 6. Correções de UI/UX no Modo Dark

#### Problemas Corrigidos:

- ✅ **Texto dos contatos** agora tem contraste correto no modo dark
- ✅ **Separadores visuais** (•) com cores adequadas para cada tema
- ✅ **Links de email** com cores hover apropriadas
- ✅ **Estatísticas do manual** com textos visíveis no dark
- ✅ **Componente Tree** totalmente compatível com modo dark
- ✅ **Lista de problemas** com bordas e cores corretas
- ✅ **Badges e indicadores** com fundos apropriados

#### Melhorias Implementadas:

- **Bordas dinâmicas**: `border-zinc-200 dark:border-zinc-700`
- **Textos secundários**: `text-zinc-600 dark:text-zinc-400`
- **Separadores**: `text-zinc-300 dark:text-zinc-600`
- **Hover states**: Estados de hover específicos para cada tema
- **Ícones e badges**: Cores balanceadas para cada modo

### 7. Benefícios

- ✅ **Melhor experiência do usuário** com editor visual
- ✅ **Preview em tempo real** do markdown
- ✅ **Botões maiores** e mais fáceis de clicar
- ✅ **Integração perfeita** com o tema dark/light automático
- ✅ **Sintaxe markdown completa** suportada
- ✅ **Responsivo** e acessível
- ✅ **UI/UX consistente** em ambos os modos de tema
- ✅ **Ícones centralizados** com flexbox

### 8. Como Usar

1. Navegue para qualquer produto na base de conhecimento
2. Clique em "Adicionar seção" ou edite um capítulo existente
3. O novo editor de markdown estará disponível para capítulos
4. Use a barra de ferramentas para formatação rápida
5. Veja o preview em tempo real do conteúdo

### 9. Dependência Instalada

```bash
npm install @uiw/react-md-editor
```

Esta biblioteca fornece um editor de markdown robusto e bem mantido, usado em muitos projetos React.
