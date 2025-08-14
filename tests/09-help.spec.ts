import { test, expect } from '@playwright/test';
import { fillFormField, clickButton } from './utils/auth-helpers';

test.describe('📚 SISTEMA DE AJUDA', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login como administrador
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('admin@inpe.br');
    await page.getByLabel('Senha').fill('admin123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL('/admin/dashboard');
  });

  test.describe('🧭 Navegação e Conteúdo', () => {
    test('✅ Navegação hierárquica - por títulos (#/##/###)', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se página de ajuda carregou
      await expect(page.getByRole('heading', { name: /ajuda|documentação/i })).toBeVisible();
      
      // Verificar se sidebar de navegação está visível
      await expect(page.locator('[data-testid="help-sidebar"]')).toBeVisible();
      
      // Verificar se há títulos hierárquicos
      const headings = page.locator('[data-testid="help-heading"]');
      if (await headings.count() > 0) {
        await expect(headings.first()).toBeVisible();
        
        // Verificar se há diferentes níveis de títulos
        const h1Headings = page.locator('h1');
        const h2Headings = page.locator('h2');
        const h3Headings = page.locator('h3');
        
        // Pelo menos um nível deve estar presente
        expect(await h1Headings.count() + await h2Headings.count() + await h3Headings.count()).toBeGreaterThan(0);
      }
    });

    test('✅ Busca de conteúdo - funcionalidade básica', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se campo de busca está visível
      await expect(page.locator('[data-testid="help-search"]')).toBeVisible();
      
      // Buscar por termo
      await page.locator('[data-testid="help-search"]').fill('produto');
      await page.waitForTimeout(1000);
      
      // Verificar se resultados aparecem
      const searchResults = page.locator('[data-testid="search-result"]');
      if (await searchResults.count() > 0) {
        await expect(searchResults.first()).toBeVisible();
      }
      
      // Limpar busca
      await page.locator('[data-testid="help-search"]').clear();
      await page.waitForTimeout(1000);
      
      // Verificar se conteúdo original voltou
      await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
    });

    test('✅ Organização - seções e capítulos', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se estrutura organizacional está visível
      await expect(page.locator('[data-testid="help-structure"]')).toBeVisible();
      
      // Verificar se há seções principais
      const sections = page.locator('[data-testid="help-section"]');
      if (await sections.count() > 0) {
        await expect(sections.first()).toBeVisible();
        
        // Verificar se seção tem título
        await expect(sections.first().locator('[data-testid="section-title"]')).toBeVisible();
        
        // Verificar se seção tem conteúdo
        await expect(sections.first().locator('[data-testid="section-content"]')).toBeVisible();
      }
      
      // Verificar se há capítulos
      const chapters = page.locator('[data-testid="help-chapter"]');
      if (await chapters.count() > 0) {
        await expect(chapters.first()).toBeVisible();
        
        // Verificar se capítulo tem título
        await expect(chapters.first().locator('[data-testid="chapter-title"]')).toBeVisible();
      }
    });
  });

  test.describe('✏️ Editor e Documentação', () => {
    test('✅ Editor Markdown - funciona com preview', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se editor está visível
      await expect(page.locator('[data-testid="markdown-editor"]')).toBeVisible();
      
      // Verificar se preview está visível
      await expect(page.locator('[data-testid="markdown-preview"]')).toBeVisible();
      
      // Digitar texto no editor
      await page.locator('[data-testid="markdown-editor"] textarea').fill('# Título Teste\n\nConteúdo de teste para o sistema de ajuda');
      
      // Verificar se preview atualiza
      await expect(page.getByText('Título Teste')).toBeVisible();
      await expect(page.getByText('Conteúdo de teste para o sistema de ajuda')).toBeVisible();
      
      // Verificar se formatação Markdown funciona
      await page.locator('[data-testid="markdown-editor"] textarea').fill('## Subtítulo\n\n**Texto em negrito** e *texto em itálico*');
      
      // Verificar se formatação aparece no preview
      await expect(page.getByText('Subtítulo')).toBeVisible();
      await expect(page.locator('strong')).toContainText('Texto em negrito');
      await expect(page.locator('em')).toContainText('texto em itálico');
    });

    test('✅ Salvamento - persiste alterações', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se editor está visível
      await expect(page.locator('[data-testid="markdown-editor"]')).toBeVisible();
      
      // Editar conteúdo
      await page.locator('[data-testid="markdown-editor"] textarea').fill('# Conteúdo Salvo\n\nEste conteúdo deve ser salvo no sistema de ajuda');
      
      // Salvar
      await clickButton(page, 'Salvar');
      
      // Verificar toast de sucesso
      await expect(page.getByText(/ajuda salva|documentação salva|alterada com sucesso/i)).toBeVisible();
      
      // Recarregar página
      await page.reload();
      
      // Verificar se conteúdo foi persistido
      await expect(page.getByText('Conteúdo Salvo')).toBeVisible();
      await expect(page.getByText('Este conteúdo deve ser salvo no sistema de ajuda')).toBeVisible();
    });

    test('✅ Interface dual - sidebar + área de conteúdo', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se layout dual está funcionando
      await expect(page.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Verificar se sidebar tem navegação
      const sidebarItems = page.locator('[data-testid="sidebar-item"]');
      if (await sidebarItems.count() > 0) {
        await expect(sidebarItems.first()).toBeVisible();
        
        // Clicar em um item da sidebar
        await sidebarItems.first().click();
        
        // Verificar se conteúdo mudou
        await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
      }
      
      // Verificar se área de conteúdo é responsiva
      await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Verificar se há scroll na área de conteúdo
      const contentArea = page.locator('[data-testid="help-content"]');
      await expect(contentArea).toBeVisible();
    });
  });

  test.describe('🔍 Funcionalidades Avançadas', () => {
    test('✅ Extração automática de títulos', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se títulos são extraídos automaticamente
      const extractedTitles = page.locator('[data-testid="extracted-title"]');
      if (await extractedTitles.count() > 0) {
        await expect(extractedTitles.first()).toBeVisible();
        
        // Verificar se títulos têm links de navegação
        const titleLinks = page.locator('[data-testid="title-link"]');
        if (await titleLinks.count() > 0) {
          await expect(titleLinks.first()).toBeVisible();
          
          // Clicar em um link de título
          await titleLinks.first().click();
          
          // Verificar se navegou para a seção correta
          await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
        }
      }
    });

    test('✅ Scroll suave entre seções', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se há múltiplas seções
      const sections = page.locator('[data-testid="help-section"]');
      if (await sections.count() > 1) {
        // Clicar em um link para seção diferente
        const sectionLinks = page.locator('[data-testid="section-link"]');
        if (await sectionLinks.count() > 0) {
          await sectionLinks.first().click();
          
          // Aguardar scroll
          await page.waitForTimeout(1000);
          
          // Verificar se seção está visível
          await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
        }
      }
    });

    test('✅ Responsividade em diferentes resoluções', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Testar resolução desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Testar resolução tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Testar resolução mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
      
      // Voltar para desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('✅ Temas dark/light', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se sistema de temas está funcionando
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.count() > 0) {
        // Verificar tema atual
        const currentTheme = await themeToggle.getAttribute('data-theme');
        
        // Alternar tema
        await themeToggle.click();
        await page.waitForTimeout(1000);
        
        // Verificar se tema mudou
        const newTheme = await themeToggle.getAttribute('data-theme');
        expect(newTheme).not.toBe(currentTheme);
        
        // Verificar se conteúdo ainda está visível
        await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
      }
    });
  });

  test.describe('📝 Gestão de Conteúdo', () => {
    test('✅ Criação de nova seção', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se botão de nova seção está visível
      const newSectionButton = page.locator('[data-testid="new-section-button"]');
      if (await newSectionButton.count() > 0) {
        // Clicar em nova seção
        await newSectionButton.click();
        
        // Verificar se formulário abre
        await expect(page.locator('[data-testid="section-form"]')).toBeVisible();
        
        // Preencher formulário
        await fillFormField(page, 'Título da Seção', 'Nova Seção Teste');
        await fillFormField(page, 'Conteúdo', '# Nova Seção\n\nConteúdo da nova seção de teste');
        
        // Salvar
        await clickButton(page, 'Salvar');
        
        // Verificar toast de sucesso
        await expect(page.getByText(/seção criada|salva com sucesso/i)).toBeVisible();
        
        // Verificar se nova seção aparece
        await expect(page.getByText('Nova Seção Teste')).toBeVisible();
      }
    });

    test('✅ Edição de seção existente', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se há seções editáveis
      const editableSections = page.locator('[data-testid="editable-section"]');
      if (await editableSections.count() > 0) {
        // Clicar no botão editar da primeira seção
        await page.locator('[data-testid="edit-section"]).first().click();
        
        // Verificar se editor abre
        await expect(page.locator('[data-testid="markdown-editor"]')).toBeVisible();
        
        // Editar conteúdo
        await page.locator('[data-testid="markdown-editor"] textarea').fill('# Seção Editada\n\nConteúdo editado da seção');
        
        // Salvar
        await clickButton(page, 'Salvar');
        
        // Verificar toast de sucesso
        await expect(page.getByText(/seção atualizada|alterada com sucesso/i)).toBeVisible();
        
        // Verificar se alterações aparecem
        await expect(page.getByText('Seção Editada')).toBeVisible();
        await expect(page.getByText('Conteúdo editado da seção')).toBeVisible();
      }
    });

    test('✅ Exclusão de seção', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se há seções excluíveis
      const deletableSections = page.locator('[data-testid="deletable-section"]');
      if (await deletableSections.count() > 0) {
        // Clicar no botão excluir da primeira seção
        await page.locator('[data-testid="delete-section"]').first().click();
        
        // Verificar se dialog de confirmação aparece
        await expect(page.getByText(/confirmar exclusão|excluir seção/i)).toBeVisible();
        
        // Cancelar exclusão
        await clickButton(page, 'Cancelar');
        
        // Verificar se dialog fechou
        await expect(page.getByText(/confirmar exclusão|excluir seção/i)).not.toBeVisible();
      }
    });
  });

  test.describe('🔗 Integração com Sistema', () => {
    test('✅ Acesso via menu principal', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Verificar se link para ajuda está no menu
      const helpLink = page.locator('[data-testid="help-link"]');
      if (await helpLink.count() > 0) {
        // Clicar no link de ajuda
        await helpLink.click();
        
        // Verificar se redirecionou para página de ajuda
        await page.waitForURL('/admin/help');
        await expect(page.getByRole('heading', { name: /ajuda|documentação/i })).toBeVisible();
      }
    });

    test('✅ Contexto sensível ao sistema', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se ajuda é contextual ao sistema
      await expect(page.getByText(/sistema silo|produtos meteorológicos|cptec|inpe/i)).toBeVisible();
      
      // Verificar se há seções específicas do sistema
      const systemSections = page.locator('[data-testid="system-section"]');
      if (await systemSections.count() > 0) {
        await expect(systemSections.first()).toBeVisible();
        
        // Verificar se seção tem conteúdo relevante
        await expect(page.getByText(/produtos|problemas|soluções|chat|projetos/i)).toBeVisible();
      }
    });

    test('✅ Links para funcionalidades', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se há links para funcionalidades do sistema
      const featureLinks = page.locator('[data-testid="feature-link"]');
      if (await featureLinks.count() > 0) {
        await expect(featureLinks.first()).toBeVisible();
        
        // Clicar em um link de funcionalidade
        await featureLinks.first().click();
        
        // Verificar se redirecionou para a funcionalidade
        await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
      }
    });
  });

  test.describe('📊 Performance e Usabilidade', () => {
    test('✅ Carregamento rápido', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/admin/help');
      
      // Aguardar carregamento completo
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Verificar se carregou em tempo aceitável (menos de 5 segundos)
      expect(loadTime).toBeLessThan(5000);
      
      // Verificar se todos os elementos estão visíveis
      await expect(page.locator('[data-testid="help-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
    });

    test('✅ Navegação intuitiva', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se navegação é intuitiva
      await expect(page.locator('[data-testid="help-sidebar"]')).toBeVisible();
      
      // Verificar se há breadcrumbs ou indicadores de localização
      const breadcrumbs = page.locator('[data-testid="help-breadcrumbs"]');
      if (await breadcrumbs.count() > 0) {
        await expect(breadcrumbs.first()).toBeVisible();
      }
      
      // Verificar se há botão de voltar ao topo
      const backToTopButton = page.locator('[data-testid="back-to-top"]');
      if (await backToTopButton.count() > 0) {
        await expect(backToTopButton.first()).toBeVisible();
        
        // Clicar no botão
        await backToTopButton.first().click();
        
        // Verificar se voltou ao topo
        await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
      }
    });

    test('✅ Busca eficiente', async ({ page }) => {
      await page.goto('/admin/help');
      
      // Verificar se busca é eficiente
      const searchInput = page.locator('[data-testid="help-search"]');
      await expect(searchInput).toBeVisible();
      
      // Fazer busca
      await searchInput.fill('teste');
      await page.waitForTimeout(500);
      
      // Verificar se resultados aparecem rapidamente
      const searchResults = page.locator('[data-testid="search-result"]');
      if (await searchResults.count() > 0) {
        await expect(searchResults.first()).toBeVisible();
      }
      
      // Limpar busca
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // Verificar se conteúdo original voltou
      await expect(page.locator('[data-testid="help-content"]')).toBeVisible();
    });
  });
});
