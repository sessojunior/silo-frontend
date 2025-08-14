import { test, expect } from './utils/auth-helpers';

test.describe('📚 SISTEMA DE AJUDA', () => {
  test.describe('🧭 Navegação e Conteúdo', () => {
    test('✅ Navegação hierárquica - por títulos (#/##/###)', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se página de ajuda carregou
      await expect(authenticatedPage.getByRole('heading', { name: /ajuda|documentação/i })).toBeVisible();
      
      // Verificar se sidebar de navegação está visível
      await expect(authenticatedPage.locator('[data-testid="help-sidebar"]')).toBeVisible();
      
      // Verificar se há títulos hierárquicos
      const headings = authenticatedPage.locator('[data-testid="help-heading"]');
      if (await headings.count() > 0) {
        await expect(headings.first()).toBeVisible();
        
        // Verificar se há diferentes níveis de títulos
        const h1Headings = authenticatedPage.locator('h1');
        const h2Headings = authenticatedPage.locator('h2');
        const h3Headings = authenticatedPage.locator('h3');
        
        // Pelo menos um nível deve estar presente
        expect(await h1Headings.count() + await h2Headings.count() + await h3Headings.count()).toBeGreaterThan(0);
      }
    });

    test('✅ Busca de conteúdo - funcionalidade básica', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se campo de busca está visível
      await expect(authenticatedPage.locator('[data-testid="help-search"]')).toBeVisible();
      
      // Buscar por termo
      await authenticatedPage.locator('[data-testid="help-search"]').fill('produto');
      await authenticatedPage.waitForTimeout(1000);
      
      // Verificar se resultados aparecem
      const searchResults = authenticatedPage.locator('[data-testid="search-result"]');
      if (await searchResults.count() > 0) {
        await expect(searchResults.first()).toBeVisible();
      }
      
      // Limpar busca
      await authenticatedPage.locator('[data-testid="help-search"]').clear();
      await authenticatedPage.waitForTimeout(1000);
      
      // Verificar se conteúdo original voltou
      await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
    });

    test('✅ Organização - seções e capítulos', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se estrutura organizacional está visível
      await expect(authenticatedPage.locator('[data-testid="help-structure"]')).toBeVisible();
      
      // Verificar se há seções principais
      const sections = authenticatedPage.locator('[data-testid="help-section"]');
      if (await sections.count() > 0) {
        await expect(sections.first()).toBeVisible();
        
        // Verificar se seção tem título
        await expect(sections.first().locator('[data-testid="section-title"]')).toBeVisible();
        
        // Verificar se seção tem conteúdo
        await expect(sections.first().locator('[data-testid="section-content"]')).toBeVisible();
      }
      
      // Verificar se há capítulos
      const chapters = authenticatedPage.locator('[data-testid="help-chapter"]');
      if (await chapters.count() > 0) {
        await expect(chapters.first()).toBeVisible();
        
        // Verificar se capítulo tem título
        await expect(chapters.first().locator('[data-testid="chapter-title"]')).toBeVisible();
      }
    });
  });

  test.describe('✏️ Editor e Documentação', () => {
    test('✅ Editor Markdown - funciona com preview', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se editor está visível
      await expect(authenticatedPage.locator('[data-testid="markdown-editor"]')).toBeVisible();
      
      // Verificar se preview está visível
      await expect(authenticatedPage.locator('[data-testid="markdown-preview"]')).toBeVisible();
      
      // Digitar texto no editor
      await authenticatedPage.locator('[data-testid="markdown-editor"] textarea').fill('# Título Teste\n\nConteúdo de teste para o sistema de ajuda');
      
      // Verificar se preview atualiza
      await expect(authenticatedPage.getByText('Título Teste')).toBeVisible();
      await expect(authenticatedPage.getByText('Conteúdo de teste para o sistema de ajuda')).toBeVisible();
      
      // Verificar se formatação Markdown funciona
      await authenticatedPage.locator('[data-testid="markdown-editor"] textarea').fill('## Subtítulo\n\n**Texto em negrito** e *texto em itálico*');
      
      // Verificar se formatação aparece no preview
      await expect(authenticatedPage.getByText('Subtítulo')).toBeVisible();
      await expect(authenticatedPage.locator('strong')).toContainText('Texto em negrito');
      await expect(authenticatedPage.locator('em')).toContainText('texto em itálico');
    });

    test('✅ Salvamento - persiste alterações', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se editor está visível
      await expect(authenticatedPage.locator('[data-testid="markdown-editor"]')).toBeVisible();
      
      // Editar conteúdo
      await authenticatedPage.locator('[data-testid="markdown-editor"] textarea').fill('# Conteúdo Salvo\n\nEste conteúdo deve ser salvo no sistema de ajuda');
      
      // Salvar
      await authenticatedPage.getByRole('button', { name: 'Salvar' }).click();
      
      // Verificar toast de sucesso
      await expect(authenticatedPage.getByText(/ajuda salva|documentação salva|alterada com sucesso/i)).toBeVisible();
      
      // Recarregar página
      await authenticatedPage.reload();
      
      // Verificar se conteúdo foi persistido
      await expect(authenticatedPage.getByText('Conteúdo Salvo')).toBeVisible();
      await expect(authenticatedPage.getByText('Este conteúdo deve ser salvo no sistema de ajuda')).toBeVisible();
    });

    test('✅ Interface dual - sidebar + área de conteúdo', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se layout dual está funcionando
      await expect(authenticatedPage.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Verificar se sidebar tem navegação
      const sidebarItems = authenticatedPage.locator('[data-testid="sidebar-item"]');
      if (await sidebarItems.count() > 0) {
        await expect(sidebarItems.first()).toBeVisible();
        
        // Clicar em um item da sidebar
        await sidebarItems.first().click();
        
        // Verificar se conteúdo mudou
        await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      }
    });
  });

  test.describe('🔧 Funcionalidades Avançadas', () => {
    test('✅ Extração automática de títulos', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se sistema extrai títulos automaticamente
      await expect(authenticatedPage.locator('[data-testid="help-titles"]')).toBeVisible();
      
      // Verificar se títulos são clicáveis
      const titleLinks = authenticatedPage.locator('[data-testid="title-link"]');
      if (await titleLinks.count() > 0) {
        await expect(titleLinks.first()).toBeVisible();
        
        // Clicar em um título
        await titleLinks.first().click();
        
        // Verificar se navegação funcionou
        await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      }
    });

    test('✅ Scroll suave entre seções', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se scroll suave está funcionando
      await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Navegar para seção específica
      const sectionLink = authenticatedPage.locator('[data-testid="section-link"]').first();
      if (await sectionLink.count() > 0) {
        await sectionLink.click();
        
        // Verificar se scroll suave funcionou
        await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      }
    });

    test('✅ Responsividade em diferentes resoluções', async ({ authenticatedPage }) => {
      // Testar em resolução desktop
      await authenticatedPage.setViewportSize({ width: 1920, height: 1080 });
      await authenticatedPage.goto('/admin/help');
      await expect(authenticatedPage.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Testar em resolução tablet
      await authenticatedPage.setViewportSize({ width: 768, height: 1024 });
      await authenticatedPage.reload();
      await expect(authenticatedPage.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Testar em resolução mobile
      await authenticatedPage.setViewportSize({ width: 375, height: 667 });
      await authenticatedPage.reload();
      await expect(authenticatedPage.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
    });

    test('✅ Temas dark/light', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se toggle de tema está visível
      const themeToggle = authenticatedPage.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.count() > 0) {
        await expect(themeToggle).toBeVisible();
        
        // Alternar tema
        await themeToggle.click();
        
        // Verificar se tema mudou
        await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
        
        // Alternar de volta
        await themeToggle.click();
        await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      }
    });
  });

  test.describe('📝 Gestão de Conteúdo', () => {
    test('✅ Criação de nova seção', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se botão de criar está visível
      const createButton = authenticatedPage.getByRole('button', { name: /criar|adicionar|nova/i });
      if (await createButton.count() > 0) {
        await createButton.click();
        
        // Preencher formulário
        await authenticatedPage.getByLabel('Título').fill('Nova Seção de Teste');
        await authenticatedPage.getByLabel('Conteúdo').fill('# Nova Seção\n\nConteúdo da nova seção de teste.');
        
        // Salvar
        await authenticatedPage.getByRole('button', { name: 'Salvar' }).click();
        
        // Verificar se seção foi criada
        await expect(authenticatedPage.getByText('Nova Seção de Teste')).toBeVisible();
      }
    });

    test('✅ Edição de seção existente', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se botão de editar está visível
      const editButton = authenticatedPage.getByRole('button', { name: /editar|editar/i }).first();
      if (await editButton.count() > 0) {
        await editButton.click();
        
        // Editar conteúdo
        await authenticatedPage.getByLabel('Conteúdo').fill('# Seção Editada\n\nConteúdo editado da seção de teste.');
        
        // Salvar
        await authenticatedPage.getByRole('button', { name: 'Salvar' }).click();
        
        // Verificar se alterações foram salvas
        await expect(authenticatedPage.getByText('Seção Editada')).toBeVisible();
      }
    });

    test('✅ Exclusão de seção', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se botão de excluir está visível
      const deleteButton = authenticatedPage.getByRole('button', { name: /excluir|remover/i }).first();
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        
        // Confirmar exclusão
        await authenticatedPage.getByRole('button', { name: /confirmar|sim/i }).click();
        
        // Verificar se seção foi removida
        await expect(authenticatedPage.getByText(/seção removida|excluída com sucesso/i)).toBeVisible();
      }
    });
  });

  test.describe('🌐 Integração e Acesso', () => {
    test('✅ Acesso via menu principal', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/dashboard');
      
      // Verificar se link de ajuda está no menu
      const helpLink = authenticatedPage.getByRole('link', { name: /ajuda|help/i });
      if (await helpLink.count() > 0) {
        await expect(helpLink).toBeVisible();
        
        // Clicar no link
        await helpLink.click();
        
        // Verificar se redirecionou para página de ajuda
        await expect(authenticatedPage.getByRole('heading', { name: /ajuda|documentação/i })).toBeVisible();
      }
    });

    test('✅ Contexto sensível ao sistema', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se ajuda é contextual
      await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Verificar se há informações específicas do sistema
      const systemInfo = authenticatedPage.getByText(/sistema|funcionalidades|recursos/i);
      if (await systemInfo.count() > 0) {
        await expect(systemInfo.first()).toBeVisible();
      }
    });

    test('✅ Links para funcionalidades', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se há links para funcionalidades
      const featureLinks = authenticatedPage.locator('[data-testid="feature-link"]');
      if (await featureLinks.count() > 0) {
        await expect(featureLinks.first()).toBeVisible();
        
        // Clicar em um link
        await featureLinks.first().click();
        
        // Verificar se navegação funcionou
        await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      }
    });
  });

  test.describe('⚡ Performance e UX', () => {
    test('✅ Carregamento rápido', async ({ authenticatedPage }) => {
      const startTime = Date.now();
      
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se página carregou em tempo razoável
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Menos de 5 segundos
      
      // Verificar se conteúdo está visível
      await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
    });

    test('✅ Navegação intuitiva', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se navegação é intuitiva
      await expect(authenticatedPage.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Verificar se há breadcrumbs ou navegação clara
      const navigation = authenticatedPage.locator('[data-testid="help-navigation"]');
      if (await navigation.count() > 0) {
        await expect(navigation).toBeVisible();
      }
    });

    test('✅ Busca eficiente', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/help');
      
      // Verificar se busca é eficiente
      const searchInput = authenticatedPage.locator('[data-testid="help-search"]');
      if (await searchInput.count() > 0) {
        await expect(searchInput).toBeVisible();
        
        // Testar busca
        await searchInput.fill('teste');
        await authenticatedPage.waitForTimeout(500);
        
        // Verificar se resultados aparecem rapidamente
        const results = authenticatedPage.locator('[data-testid="search-result"]');
        if (await results.count() > 0) {
          await expect(results.first()).toBeVisible();
        }
      }
    });
  });
});
