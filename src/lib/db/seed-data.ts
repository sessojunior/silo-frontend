import * as schema from '@/lib/db/schema'

// === TIPAGENS DO SCHEMA ===
export type ProductData = Pick<typeof schema.product.$inferInsert, 'name' | 'slug' | 'available' | 'priority' | 'turns'>
export type GroupData = Omit<typeof schema.group.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
export type ContactData = Omit<typeof schema.contact.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
export type TestUserData = Pick<typeof schema.authUser.$inferInsert, 'name' | 'email' | 'password' | 'emailVerified' | 'isActive'> & { groupName: string }
export type ProjectData = Omit<typeof schema.project.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
export type ManualData = { productSlug: string; description: string }

export type ProjectActivityData = Omit<typeof schema.projectActivity.$inferInsert, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>

export interface DependencyItem {
	name: string
	icon: string | null
	description?: string
	children?: DependencyItem[]
}

// === DADOS BÁSICOS ===
export const products: ProductData[] = [
	{ name: 'BAM', slug: 'bam', available: true, priority: 'normal', turns: ['0'] },
	{ name: 'SMEC', slug: 'smec', available: true, priority: 'high', turns: ['0', '12'] },
	{ name: 'BRAMS AMS 15KM', slug: 'brams-ams-15km', available: true, priority: 'urgent', turns: ['0', '6', '12', '18'] },
	{ name: 'WRF', slug: 'wrf', available: true, priority: 'low', turns: ['0', '6', '12', '18'] },
]

export const groups: GroupData[] = [
	{
		name: 'Administradores',
		description: 'Administradores do sistema com acesso completo',
		icon: 'icon-[lucide--shield-check]',
		color: '#DC2626',
		active: true,
		isDefault: false,
		maxUsers: 5,
	},
	{
		name: 'Meteorologistas',
		description: 'Profissionais especializados em meteorologia',
		icon: 'icon-[lucide--cloud-drizzle]',
		color: '#2563EB',
		active: true,
		isDefault: true,
		maxUsers: null,
	},
	{
		name: 'Pesquisadores',
		description: 'Pesquisadores e cientistas do INPE',
		icon: 'icon-[lucide--microscope]',
		color: '#7C3AED',
		active: true,
		isDefault: false,
		maxUsers: null,
	},
	{
		name: 'Operadores',
		description: 'Operadores responsáveis pelo funcionamento dos sistemas',
		icon: 'icon-[lucide--settings]',
		color: '#059669',
		active: true,
		isDefault: false,
		maxUsers: 10,
	},
	{
		name: 'Suporte',
		description: 'Equipe de suporte técnico e atendimento',
		icon: 'icon-[lucide--headphones]',
		color: '#EA580C',
		active: true,
		isDefault: false,
		maxUsers: 8,
	},
	{
		name: 'Visitantes',
		description: 'Usuários externos com acesso limitado',
		icon: 'icon-[lucide--user-check]',
		color: '#64748B',
		active: true,
		isDefault: false,
		maxUsers: 20,
	},
]

export const contacts: ContactData[] = [
	{
		name: 'Carlos Eduardo Silva',
		role: 'Coordenador de Meteorologia',
		team: 'CPTEC',
		email: 'carlos.silva@inpe.br',
		phone: '+55 12 3208-6000',
		image: null,
		active: true,
	},
	{
		name: 'Maria Fernanda Santos',
		role: 'Pesquisadora Sênior',
		team: 'Modelagem Numérica',
		email: 'maria.santos@inpe.br',
		phone: '+55 12 3208-6001',
		image: null,
		active: true,
	},
	{
		name: 'João Alberto Costa',
		role: 'Especialista em Sistemas',
		team: 'Infraestrutura',
		email: 'joao.costa@inpe.br',
		phone: '+55 12 3208-6002',
		image: null,
		active: true,
	},
	{
		name: 'Ana Paula Lima',
		role: 'Analista de Sistemas',
		team: 'Desenvolvimento',
		email: 'ana.lima@inpe.br',
		phone: '+55 12 3208-6003',
		image: null,
		active: true,
	},
	{
		name: 'Roberto Ferreira',
		role: 'Coordenador de Pesquisa',
		team: 'P&D',
		email: 'roberto.ferreira@inpe.br',
		phone: '+55 12 3208-6004',
		image: null,
		active: false,
	},
]

export const testUsers: TestUserData[] = [
	{
		name: 'Ana Silva',
		email: 'ana.silva@inpe.br',
		password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
		emailVerified: true,
		isActive: true,
		groupName: 'Meteorologistas',
	},
	{
		name: 'Carlos Santos',
		email: 'carlos.santos@inpe.br',
		password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
		emailVerified: true,
		isActive: true,
		groupName: 'Pesquisadores',
	},
	{
		name: 'Beatriz Lima',
		email: 'beatriz.lima@inpe.br',
		password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
		emailVerified: true,
		isActive: true,
		groupName: 'Operadores',
	},
	{
		name: 'Diego Ferreira',
		email: 'diego.ferreira@inpe.br',
		password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
		emailVerified: true,
		isActive: true,
		groupName: 'Suporte',
	},
	{
		name: 'Elena Costa',
		email: 'elena.costa@inpe.br',
		password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
		emailVerified: true,
		isActive: false,
		groupName: 'Visitantes',
	},
	{
		name: 'Fernando Rocha',
		email: 'fernando.rocha@inpe.br',
		password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
		emailVerified: true,
		isActive: true,
		groupName: 'Meteorologistas',
	},
]

export const problemTitles = ['Erro ao processar dados meteorológicos', 'Falha na importação de arquivos', 'Inconsistência nos resultados do modelo', 'Problema de performance em simulações longas', 'Dificuldade na configuração inicial', 'Erro de permissão ao acessar diretórios', 'Resultados divergentes entre execuções', 'Interface gráfica não carrega corretamente', 'Logs não estão sendo salvos', 'Parâmetros de entrada não reconhecidos', 'Erro ao exportar resultados', 'Timeout durante execução do modelo', 'Falha ao conectar com serviço externo', 'Dados de entrada corrompidos', 'Problema de compatibilidade com sistema operacional', 'Erro de memória insuficiente', 'Falha ao atualizar dependências', 'Problema ao gerar gráficos', 'Erro ao validar parâmetros', 'Dificuldade para acessar manual do usuário']

export const problemDescriptions = [
	['Ao tentar processar os dados meteorológicos, o sistema apresenta uma mensagem de erro indicando falha na leitura dos arquivos.', 'Além disso, arquivos muito grandes podem causar estouro de memória, especialmente em ambientes com recursos limitados.', 'Recomenda-se validar os arquivos antes de iniciar o processamento e garantir que estejam de acordo com o padrão exigido pelo sistema.', 'Caso o erro persista, consulte os logs detalhados para identificar a linha exata do problema e, se necessário, entre em contato com o suporte técnico.'],
	['Durante a importação de arquivos, o sistema pode não reconhecer determinados formatos ou encontrar permissões insuficientes para leitura.', 'É importante garantir que os arquivos estejam no diretório correto e que o usuário do sistema tenha acesso de leitura.', 'Falhas silenciosas podem ocorrer se o nome do arquivo contiver caracteres especiais ou espaços em branco no final.', 'Verifique também se não há arquivos duplicados, pois isso pode causar conflitos durante a importação.'],
	// ... adicionar mais conforme necessário
]

export const solutionDescriptions = ['Verifique se os dados meteorológicos estão no formato esperado.', 'Confirme se os arquivos possuem as permissões corretas.', 'Reinicie o sistema e tente novamente.', 'Otimize os parâmetros de simulação para melhorar a performance.', 'Siga o passo a passo do manual de configuração.', 'Ajuste as permissões dos diretórios de trabalho.', 'Compare os resultados com execuções anteriores para identificar padrões.', 'Limpe o cache do navegador e recarregue a página.', 'Verifique o caminho de destino dos logs no arquivo de configuração.', 'Consulte a documentação para os parâmetros aceitos.', 'Atualize o software para a versão mais recente.', 'Aumente o tempo limite de execução nas configurações.', 'Verifique a conexão com a internet e serviços externos.', 'Reimporte os dados de entrada após validação.', 'Instale as dependências compatíveis com seu sistema operacional.', 'Libere memória ou feche outros aplicativos antes de executar.', 'Execute o comando de atualização de dependências novamente.', 'Revise os dados utilizados para gerar os gráficos.', 'Corrija os parâmetros conforme as mensagens de erro.', 'Acesse o manual diretamente pelo site oficial.']

export const dependencyStructure: DependencyItem[] = [
	{
		name: 'Equipamentos',
		icon: null,
		children: [
			{
				name: 'Máquinas',
				icon: null,
				children: [
					{ name: 'Servidor Principal', icon: 'icon-[lucide--server]' },
					{ name: 'Workstation Linux', icon: 'icon-[lucide--computer]' },
					{ name: 'Cluster de Processamento', icon: 'icon-[lucide--cpu]' },
				],
			},
			{
				name: 'Redes internas',
				icon: null,
				children: [
					{ name: 'Rede CPTEC', icon: 'icon-[lucide--network]' },
					{ name: 'Rede Laboratório', icon: 'icon-[lucide--network]' },
				],
			},
			{
				name: 'Redes externas',
				icon: null,
				children: [
					{ name: 'Internet INPE', icon: 'icon-[lucide--globe]' },
					{ name: 'VPN Científica', icon: 'icon-[lucide--shield]' },
				],
			},
		],
	},
	{
		name: 'Dependências',
		icon: null,
		children: [
			{
				name: 'Sistema',
				icon: null,
				children: [
					{
						name: 'Hosts',
						icon: null,
						children: [
							{ name: 'met01.cptec.inpe.br', icon: 'icon-[lucide--computer]' },
							{ name: 'model02.cptec.inpe.br', icon: 'icon-[lucide--computer]' },
						],
					},
					{
						name: 'Softwares',
						icon: null,
						children: [
							{ name: 'Python 3.9+', icon: 'icon-[lucide--code]' },
							{ name: 'NetCDF4', icon: 'icon-[lucide--database]' },
							{ name: 'GrADS', icon: 'icon-[lucide--bar-chart]' },
						],
					},
				],
			},
			{
				name: 'Recursos humanos',
				icon: null,
				children: [
					{
						name: 'Responsáveis técnicos do INPE',
						icon: null,
						children: [
							{ name: 'João Silva', icon: 'icon-[lucide--user-round]' },
							{ name: 'Maria Santos', icon: 'icon-[lucide--user-round]' },
						],
					},
					{
						name: 'Suporte',
						icon: null,
						children: [
							{ name: 'Carlos Tech', icon: 'icon-[lucide--headphones]' },
							{ name: 'Ana Support', icon: 'icon-[lucide--headphones]' },
						],
					},
				],
			},
		],
	},
]

export const projectsData: ProjectData[] = [
	{
		name: 'Sistema de Monitoramento Meteorológico',
		shortDescription: 'Modernização do sistema de coleta e análise de dados meteorológicos',
		description: 'Projeto para implementar um novo sistema de monitoramento meteorológico com sensores IoT, análise em tempo real e interface web moderna. O sistema incluirá previsão baseada em machine learning e alertas automáticos.',
		startDate: '2024-01-15',
		endDate: '2024-12-15',
		priority: 'high',
		status: 'active',
	},
	{
		name: 'Migração para Nuvem INPE',
		shortDescription: 'Migração de aplicações críticas para infraestrutura em nuvem',
		description: 'Projeto estratégico para migrar as principais aplicações do CPTEC para uma infraestrutura híbrida na nuvem, garantindo escalabilidade, disponibilidade e redução de custos operacionais.',
		startDate: '2024-02-01',
		endDate: '2025-01-31',
		priority: 'urgent',
		status: 'active',
	},
	{
		name: 'Portal de Dados Abertos',
		shortDescription: 'Desenvolvimento de portal para disponibilização de dados científicos',
		description: 'Criação de uma plataforma web para disponibilizar dados meteorológicos e climáticos para a comunidade científica e sociedade civil, com APIs REST e interface intuitiva.',
		startDate: '2023-08-01',
		endDate: '2024-07-31',
		priority: 'medium',
		status: 'completed',
	},
	{
		name: 'Modernização da Rede de Observação',
		shortDescription: 'Atualização de equipamentos de observação meteorológica',
		description: 'Projeto para substituir equipamentos de observação meteorológica obsoletos por tecnologia moderna, incluindo estações automáticas e sensores de última geração.',
		startDate: '2024-03-01',
		endDate: null,
		priority: 'low',
		status: 'paused',
	},
	{
		name: 'Sistema de Backup Distribuído',
		shortDescription: 'Implementação de sistema de backup distribuído para dados críticos',
		description: 'Desenvolvimento de solução de backup distribuído para proteção de dados meteorológicos históricos e operacionais, com replicação geográfica e recuperação automática.',
		startDate: '2023-11-01',
		endDate: '2024-02-29',
		priority: 'medium',
		status: 'cancelled',
	},
]

export const helpDocumentation = `# 📚 Manual do Usuário - Sistema SILO

## 🎯 Visão Geral do Sistema

O Sistema SILO (Sistema Integrado de Logística Operacional) é uma plataforma web avançada desenvolvida especificamente para o Instituto Nacional de Pesquisas Espaciais (INPE) e seu Centro de Previsão de Tempo e Estudos Climáticos (CPTEC). Esta ferramenta foi projetada para centralizar e otimizar a gestão de produtos meteorológicos, facilitando a colaboração entre equipes técnicas e melhorando a eficiência operacional.

O sistema integra múltiplas funcionalidades em uma única interface, permitindo que meteorologistas, pesquisadores, operadores e administradores trabalhem de forma coordenada. A arquitetura modular permite que cada usuário acesse apenas as funcionalidades relevantes para seu papel, mantendo a segurança e organização dos dados.

A plataforma utiliza tecnologias modernas como React, Next.js e PostgreSQL, garantindo performance otimizada e experiência de usuário fluida. O sistema é totalmente responsivo, funcionando perfeitamente em desktops, tablets e dispositivos móveis, permitindo acesso remoto e trabalho em campo.

### 🏠 Acesso ao Sistema

**URL Principal**: https://silo.inpe.br  
**Protocolo**: HTTPS obrigatório para segurança dos dados  
**Navegadores Suportados**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+  
**Resolução Mínima**: 1024x768 pixels

**Processo de Login**:
1. Acesse a URL do sistema
2. Clique em "Entrar" no canto superior direito
3. Digite seu email institucional @inpe.br
4. Insira sua senha ou solicite código de acesso
5. Aguarde redirecionamento para o dashboard

**Primeiro Acesso**:
- Novos usuários são criados como inativos por padrão
- Um administrador deve ativar sua conta manualmente
- Você receberá notificação por email quando a conta for ativada
- Após ativação, você poderá fazer login normalmente

**Recuperação de Senha**:
- Clique em "Esqueci minha senha" na tela de login
- Digite seu email @inpe.br
- Verifique sua caixa de entrada para o link de redefinição
- Siga as instruções para criar uma nova senha

---

## 📊 Dashboard - Visão Geral e Monitoramento

### Página Principal do Dashboard

O dashboard é o centro de controle do sistema, fornecendo uma visão consolidada de todas as métricas importantes. Esta página é carregada automaticamente após o login e serve como ponto de partida para todas as operações do sistema.

A interface foi projetada para ser intuitiva e informativa, apresentando dados em tempo real através de widgets interativos. Cada seção do dashboard pode ser expandida ou minimizada conforme sua necessidade, permitindo personalização da experiência do usuário.

**Layout Responsivo**:
- **Desktop**: Grid de 4 colunas com widgets organizados
- **Tablet**: Grid de 2 colunas com reorganização automática
- **Mobile**: Layout vertical com widgets empilhados

### 📈 Estatísticas Principais

**Total de Produtos Cadastrados**:
Este widget exibe o número total de produtos meteorológicos registrados no sistema. O contador é atualizado em tempo real sempre que um novo produto é adicionado ou removido. A cor do indicador muda baseada no status: verde para produtos ativos, amarelo para produtos em manutenção, e vermelho para produtos inativos.

**Problemas em Aberto**:
Mostra a quantidade de problemas reportados que ainda não foram resolvidos. Este número é crucial para identificar a carga de trabalho atual da equipe de suporte. O widget inclui uma tendência comparando com o período anterior, indicando se o número de problemas está aumentando ou diminuindo.

**Soluções Fornecidas**:
Contador de soluções implementadas pela equipe. Este indicador ajuda a medir a produtividade e eficiência na resolução de problemas. O sistema calcula automaticamente a taxa de resolução dividindo soluções por problemas totais.

**Projetos Ativos**:
Exibe o número de projetos em andamento no momento. Inclui projetos em diferentes fases: planejamento, execução, revisão e finalização. Cada projeto é categorizado por prioridade e status, permitindo uma visão rápida da carga de trabalho.

### 📊 Gráficos Interativos

**Gráfico de Rosca - Distribuição de Problemas**:
Este gráfico circular mostra a distribuição de problemas por categoria, facilitando a identificação de áreas que requerem mais atenção. As categorias incluem: Rede Externa, Rede Interna, Servidor Indisponível, Falha Humana, Erro no Software e Outros.

O gráfico é totalmente interativo - clique em qualquer fatia para ver detalhes específicos da categoria. O sistema permite filtrar por período, produto ou usuário responsável, atualizando o gráfico em tempo real.

**Gráfico de Barras - Produtividade da Equipe**:
Apresenta a produtividade individual de cada membro da equipe, medida pelo número de problemas resolvidos e soluções fornecidas. O gráfico é ordenado por performance, destacando os membros mais ativos.

Cada barra representa um usuário, com cores diferentes indicando diferentes níveis de atividade. Hover sobre qualquer barra mostra estatísticas detalhadas, incluindo tempo médio de resolução e taxa de sucesso.

**Gráfico de Linha - Tendências Temporais**:
Mostra a evolução de métricas importantes ao longo do tempo. Por padrão, exibe os últimos 30 dias, mas pode ser ajustado para 7, 14, 30, 60 ou 90 dias. O gráfico inclui múltiplas linhas para diferentes métricas, permitindo comparação visual.

As linhas podem ser ativadas/desativadas clicando na legenda, facilitando a análise de tendências específicas. O sistema inclui marcadores para eventos importantes, como picos de problemas ou lançamentos de produtos.

**Gráfico de Área - Disponibilidade dos Produtos**:
Representa a disponibilidade de cada produto meteorológico ao longo do tempo. A área preenchida indica o tempo de funcionamento normal, enquanto as lacunas representam períodos de indisponibilidade.

Este gráfico é essencial para identificar padrões de falha e planejar manutenções preventivas. O sistema calcula automaticamente o uptime de cada produto e gera alertas quando a disponibilidade cai abaixo de thresholds configurados.

### 🔍 Sistema de Filtros Avançados

**Filtro por Período**:
- **Últimos 7 dias**: Visão de curto prazo para monitoramento diário
- **Últimos 30 dias**: Visão mensal padrão para análise de tendências
- **Últimos 90 dias**: Visão trimestral para planejamento estratégico
- **Período personalizado**: Selecione datas específicas para análise histórica

**Filtro por Produto**:
Permite focar a análise em um produto específico ou combinação de produtos. Inclui opção "Todos os produtos" para visão geral. O filtro mantém o estado entre diferentes visualizações, facilitando análises comparativas.

**Filtro por Categoria de Problema**:
Foca a análise em tipos específicos de problemas. Útil para identificar padrões em categorias particulares e direcionar esforços de melhoria. Inclui opção para múltipla seleção.

**Filtro por Usuário Responsável**:
Permite analisar a performance individual ou de equipes específicas. Inclui opções para filtrar por grupos de usuários ou usuários individuais. Útil para avaliações de desempenho e distribuição de carga de trabalho.

### Como Usar o Dashboard Efetivamente

**Navegação Intuitiva**:
1. **Visualização Rápida**: O dashboard carrega automaticamente com dados atualizados
2. **Exploração Interativa**: Clique em qualquer elemento para ver detalhes
3. **Filtros Dinâmicos**: Aplique filtros para focar em dados específicos
4. **Exportação de Dados**: Use o botão "Exportar" para gerar relatórios

**Personalização da Interface**:
- **Alternar Tema**: Clique no ícone sol/lua para mudar entre modo claro/escuro
- **Reorganizar Widgets**: Arraste e solte para personalizar o layout
- **Expandir/Contrair**: Clique nas setas para mostrar/ocultar seções
- **Configurar Alertas**: Defina notificações para métricas críticas

**Análise de Dados**:
- **Comparação Temporal**: Use filtros de período para comparar diferentes épocas
- **Identificação de Padrões**: Observe tendências nos gráficos de linha
- **Detecção de Anomalias**: Gráficos destacam automaticamente valores atípicos
- **Drill-down**: Clique em elementos para ver detalhes específicos

---

## 📦 Gestão de Produtos Meteorológicos

### Visão Geral do Módulo de Produtos

O módulo de Gestão de Produtos é o núcleo central do Sistema SILO, projetado para gerenciar todos os aspectos relacionados aos produtos meteorológicos do CPTEC/INPE. Este módulo permite o cadastro, monitoramento, manutenção e documentação completa de cada produto, desde modelos numéricos como BAM e BRAMS até sistemas de análise e ferramentas auxiliares.

A interface foi desenvolvida para ser intuitiva tanto para usuários técnicos quanto para gestores, oferecendo diferentes níveis de detalhamento conforme a necessidade. O sistema mantém um histórico completo de todas as modificações, permitindo auditoria e rastreabilidade de mudanças.

Cada produto é tratado como uma entidade completa, incluindo suas dependências, problemas conhecidos, soluções implementadas, documentação técnica e equipe responsável. Esta abordagem integrada facilita a manutenção e evolução dos produtos ao longo do tempo.

### Cadastro e Configuração de Produtos

**Acesse**: Menu lateral → Produtos → Novo Produto

**Informações Básicas Obrigatórias**:

**Nome do Produto**:
Deve ser único e descritivo, seguindo convenções estabelecidas pelo CPTEC. Exemplos: "BAM - Modelo Global", "SMEC - Sistema de Meteorologia", "BRAMS AMS 15KM". O sistema valida automaticamente a unicidade do nome e sugere alternativas em caso de conflito.

**Descrição Técnica Detalhada**:
Campo de texto rico que permite formatação Markdown. Deve incluir: propósito do produto, tecnologias utilizadas, requisitos de sistema, versões suportadas e informações de contato. Esta descrição é indexada para busca e serve como documentação inicial.

**Status Operacional**:
- **Ativo**: Produto em operação normal
- **Manutenção**: Produto temporariamente indisponível para manutenção
- **Descontinuado**: Produto não mais suportado
- **Desenvolvimento**: Produto em fase de desenvolvimento

**Categoria do Produto**:
- **Modelo Numérico**: Modelos de previsão meteorológica (BAM, BRAMS, WRF)
- **Sistema Operacional**: Sistemas de processamento e análise (SMEC, SISAM)
- **Ferramenta Auxiliar**: Utilitários e ferramentas de apoio
- **Interface Web**: Aplicações web e APIs
- **Base de Dados**: Sistemas de armazenamento de dados

**Informações Complementares Opcionais**:

**Versão Atual**:
Sistema de versionamento semântico (ex: 1.2.3). O sistema mantém histórico de versões e permite comparação entre diferentes releases. Inclui campos para data de lançamento, notas de versão e changelog.

**Responsável Técnico**:
Usuário principal responsável pelo produto. Recebe notificações automáticas sobre problemas críticos e mudanças importantes. Pode ser alterado a qualquer momento, mantendo histórico de responsabilidades.

**Tags e Palavras-chave**:
Sistema de tags flexível para categorização e busca. Tags sugeridas automaticamente baseadas no nome e descrição. Permite busca avançada e filtros personalizados.

**URLs e Recursos**:
- **Documentação Oficial**: Link para documentação externa
- **Repositório**: Link para código fonte ou repositório
- **Monitoramento**: URL de dashboards de monitoramento
- **API**: Endpoints de APIs relacionadas

### Sistema de Base de Conhecimento

**Filosofia da Base de Conhecimento**:
A base de conhecimento do SILO foi projetada para capturar e organizar o conhecimento tácito da equipe, transformando experiências individuais em recursos compartilhados. Cada problema reportado e solução implementada contribui para o acúmulo de conhecimento institucional.

O sistema utiliza uma abordagem colaborativa, onde qualquer usuário pode reportar problemas e contribuir com soluções. As soluções são validadas pela comunidade e podem ser marcadas como "oficiais" quando aprovadas pelos responsáveis técnicos.

**Fluxo de Reporte de Problemas**:

**1. Identificação e Reporte**:
- Acesse o produto específico → aba "Problemas"
- Clique em "Novo Problema" para abrir o formulário
- Preencha informações detalhadas sobre o problema
- Anexe evidências visuais (até 3 imagens)
- Defina prioridade e categoria

**2. Categorização Automática**:
O sistema analisa automaticamente o texto do problema e sugere categorias apropriadas. As categorias disponíveis são:

- **Rede Externa**: Problemas de conectividade com serviços externos, APIs de terceiros, dados meteorológicos externos
- **Rede Interna**: Problemas de infraestrutura de rede local, comunicação entre servidores internos
- **Servidor Indisponível**: Falhas de hardware, sobrecarga de sistema, problemas de recursos
- **Falha Humana**: Erros operacionais, configurações incorretas, procedimentos inadequados
- **Erro no Software**: Bugs de código, falhas de lógica, problemas de compatibilidade
- **Outros**: Categorias não especificadas ou problemas únicos

**3. Processo de Resolução**:
- Problemas são automaticamente notificados aos responsáveis
- Usuários podem contribuir com soluções parciais
- Soluções são avaliadas e validadas pela comunidade
- Problemas resolvidos são arquivados com histórico completo

**Sistema de Soluções Colaborativas**:

**Contribuição de Soluções**:
Qualquer usuário pode contribuir com soluções para problemas existentes. O sistema incentiva a colaboração através de:

- **Sistema de Reputação**: Usuários ganham pontos por soluções aceitas
- **Validação Comunitária**: Soluções são avaliadas por outros usuários
- **Histórico de Contribuições**: Acompanhamento de contribuições individuais
- **Notificações Inteligentes**: Alertas para problemas em sua área de expertise

**Tipos de Solução**:
- **Solução Imediata**: Workaround ou solução temporária
- **Solução Definitiva**: Correção permanente do problema
- **Solução Preventiva**: Medidas para evitar recorrência
- **Documentação**: Atualização de manuais ou procedimentos

### Gerenciamento de Dependências Tecnológicas

**Arquitetura de Dependências**:
O sistema de dependências permite mapear e visualizar as relações entre diferentes produtos e componentes. Esta funcionalidade é essencial para:

- **Análise de Impacto**: Entender como mudanças em um produto afetam outros
- **Planejamento de Manutenção**: Coordenar atualizações e manutenções
- **Gestão de Riscos**: Identificar pontos únicos de falha
- **Documentação Arquitetural**: Manter documentação atualizada da arquitetura

**Visualização Hierárquica**:
1. Acesse o produto desejado → aba "Dependências"
2. Visualize o mapa hierárquico interativo
3. Use zoom e pan para navegar em estruturas complexas
4. Clique em nós para ver detalhes de dependências

**Tipos de Dependência**:
- **Dependência Forte**: Produto não funciona sem a dependência
- **Dependência Fraca**: Funcionalidade limitada sem a dependência
- **Dependência Opcional**: Melhoria de funcionalidade
- **Dependência de Dados**: Dependência de dados específicos
- **Dependência de Serviço**: Dependência de serviços externos

**Gerenciamento de Dependências**:

**Adicionar Nova Dependência**:
1. Clique em "Nova Dependência"
2. Selecione o produto dependente
3. Defina o tipo e força da dependência
4. Adicione descrição e observações
5. Configure alertas para mudanças

**Reordenação e Organização**:
- Use drag & drop para reorganizar dependências
- Agrupe dependências por tipo ou criticidade
- Crie subgrupos para organizações complexas
- Exporte mapas de dependências para documentação

### Editor de Manuais Técnicos

**Editor Markdown Avançado**:
O sistema inclui um editor Markdown completo com recursos avançados para documentação técnica:

**Recursos de Formatação**:
- **Títulos Hierárquicos**: H1 a H6 com numeração automática
- **Texto Formatado**: Negrito, itálico, sublinhado, tachado
- **Listas**: Numeradas, com marcadores, de tarefas
- **Código**: Blocos de código com syntax highlighting
- **Tabelas**: Criação e edição de tabelas complexas
- **Links**: Links internos e externos com validação
- **Imagens**: Upload e inserção de imagens
- **Diagramas**: Suporte para Mermaid e PlantUML

**Funcionalidades Avançadas**:
- **Preview em Tempo Real**: Visualização instantânea das mudanças
- **Modo de Edição Dupla**: Editor e preview lado a lado
- **Histórico de Versões**: Controle de versão da documentação
- **Colaboração**: Múltiplos usuários podem editar simultaneamente
- **Busca e Substituição**: Ferramentas avançadas de busca
- **Exportação**: Geração de PDF, HTML e outros formatos

**Estrutura de Documentação**:
- **Introdução**: Visão geral e propósito do produto
- **Instalação**: Requisitos e procedimentos de instalação
- **Configuração**: Parâmetros e configurações disponíveis
- **Utilização**: Guias de uso e exemplos práticos
- **Manutenção**: Procedimentos de manutenção e troubleshooting
- **Referência**: Documentação técnica completa
- **Changelog**: Histórico de mudanças e atualizações

### Gestão de Contatos e Responsabilidades

**Sistema de Contatos Integrado**:
Cada produto pode ter múltiplos contatos associados, cada um com responsabilidades específicas. O sistema permite:

**Tipos de Responsabilidade**:
- **Responsável Técnico**: Especialista técnico principal
- **Responsável Operacional**: Responsável pela operação diária
- **Responsável por Suporte**: Primeira linha de atendimento
- **Responsável Gerencial**: Gestor do produto
- **Especialista em Domínio**: Especialista em área específica
- **Contato de Emergência**: Contato para situações críticas

**Funcionalidades de Contato**:
- **Notificações Automáticas**: Alertas para problemas críticos
- **Escalação Inteligente**: Notificação baseada em criticidade
- **Histórico de Comunicação**: Registro de interações
- **Disponibilidade**: Status de disponibilidade dos contatos
- **Preferências de Contato**: Método preferido de comunicação

**Associação de Contatos**:
1. Acesse o produto → aba "Contatos"
2. Clique em "Associar Contato"
3. Selecione contatos da base de dados
4. Defina tipo de responsabilidade
5. Configure níveis de notificação
6. Salve as associações

---

## 🚀 Sistema de Projetos e Gestão de Atividades

### Visão Geral do Módulo de Projetos

O Sistema de Projetos do SILO foi desenvolvido para gerenciar projetos científicos e técnicos do CPTEC/INPE, desde pesquisas meteorológicas até implementações de sistemas operacionais. O módulo integra metodologias ágeis com necessidades específicas da área científica, oferecendo ferramentas para planejamento, execução e monitoramento de projetos complexos.

A arquitetura do sistema permite diferentes níveis de granularidade: desde projetos de alto nível que abrangem múltiplos anos até atividades específicas com duração de dias. Cada projeto pode conter múltiplas atividades, e cada atividade pode ser dividida em tarefas menores, criando uma hierarquia organizacional clara.

O sistema utiliza metodologias visuais como Kanban para facilitar o acompanhamento do progresso, permitindo que equipes distribuídas trabalhem de forma coordenada. A integração com outros módulos do SILO permite que projetos sejam associados a produtos específicos, facilitando o rastreamento de dependências e impactos.

### Criação e Configuração de Projetos

**Acesse**: Menu lateral → Projetos → Novo Projeto

**Informações Básicas do Projeto**:

**Nome do Projeto**:
Deve ser descritivo e único, seguindo convenções estabelecidas. Exemplos: "Implementação BAM v2.0", "Pesquisa Climatológica Amazônica", "Modernização Infraestrutura CPTEC". O sistema valida unicidade e sugere alternativas.

**Descrição Detalhada**:
Campo de texto rico que deve incluir: objetivos do projeto, escopo, metodologia, recursos necessários, critérios de sucesso e stakeholders envolvidos. Esta descrição serve como documentação oficial e base para comunicações.

**Cronograma e Datas**:
- **Data de Início**: Data planejada para início do projeto
- **Data de Conclusão**: Data estimada para finalização
- **Data de Início Real**: Data efetiva de início (preenchida automaticamente)
- **Data de Conclusão Real**: Data efetiva de finalização
- **Marcos Importantes**: Datas-chave para acompanhamento

**Status e Prioridade**:

**Status do Projeto**:
- **Planejamento**: Projeto em fase de planejamento inicial
- **Em Andamento**: Projeto em execução ativa
- **Pausado**: Projeto temporariamente suspenso
- **Concluído**: Projeto finalizado com sucesso
- **Cancelado**: Projeto cancelado por motivos diversos
- **Em Revisão**: Projeto em fase de avaliação

**Níveis de Prioridade**:
- **Crítica**: Projetos essenciais para operação (ex: manutenção de sistemas críticos)
- **Alta**: Projetos importantes com prazo definido
- **Média**: Projetos importantes sem urgência específica
- **Baixa**: Projetos de melhoria ou pesquisa exploratória

**Informações Complementares**:

**Orçamento e Recursos**:
- **Orçamento Estimado**: Valor estimado em reais
- **Orçamento Real**: Valor efetivamente gasto
- **Recursos Humanos**: Equipe alocada no projeto
- **Recursos Técnicos**: Equipamentos e infraestrutura necessários

**Categorização**:
- **Pesquisa Científica**: Projetos de pesquisa e desenvolvimento
- **Operacional**: Projetos de manutenção e operação
- **Infraestrutura**: Projetos de infraestrutura e sistemas
- **Capacitação**: Projetos de treinamento e desenvolvimento
- **Inovação**: Projetos de inovação e experimentação

### Gestão Avançada de Atividades

**Filosofia de Atividades**:
As atividades representam unidades de trabalho específicas dentro de um projeto, cada uma com objetivos claros e entregáveis definidos. O sistema permite que atividades sejam organizadas de forma hierárquica, com atividades principais contendo sub-atividades.

Cada atividade é tratada como uma entidade independente, com seu próprio cronograma, responsáveis e métricas de progresso. Esta granularidade permite controle fino sobre o andamento do projeto e facilita a identificação de gargalos e atrasos.

**Criação de Atividades**:

**Processo de Criação**:
1. Acesse o projeto desejado → aba "Atividades"
2. Clique em "Nova Atividade" para abrir o formulário
3. Preencha informações detalhadas sobre a atividade
4. Defina dependências com outras atividades
5. Atribua responsáveis e recursos
6. Configure métricas de acompanhamento

**Informações Obrigatórias**:
- **Nome da Atividade**: Título descritivo e específico
- **Descrição Detalhada**: Objetivos, escopo e entregáveis
- **Categoria**: Tipo de trabalho (Desenvolvimento, Teste, Documentação, Pesquisa, etc.)
- **Estimativa de Esforço**: Tempo estimado em dias ou horas
- **Data de Início**: Data planejada para início
- **Data de Conclusão**: Data estimada para finalização
- **Prioridade**: Nível de prioridade dentro do projeto

**Categorias de Atividades**:
- **Desenvolvimento**: Criação de código, sistemas ou ferramentas
- **Teste**: Testes de funcionalidade, performance ou integração
- **Documentação**: Criação ou atualização de documentação
- **Pesquisa**: Atividades de pesquisa e análise
- **Análise**: Análise de requisitos, arquitetura ou dados
- **Implementação**: Implementação de soluções ou sistemas
- **Validação**: Validação de resultados ou soluções
- **Treinamento**: Capacitação de equipe ou usuários

**Sistema Kanban para Atividades**:

**Colunas do Kanban**:
- **Todo**: Atividades planejadas mas não iniciadas
- **In Progress**: Atividades em execução ativa
- **Blocked**: Atividades bloqueadas por dependências ou problemas
- **Review**: Atividades em fase de revisão ou validação
- **Done**: Atividades concluídas e validadas

**Funcionalidades do Kanban**:
- **Drag & Drop**: Movimentação intuitiva entre colunas
- **Validações**: Prevenção de movimentos inválidos
- **Cores Dinâmicas**: Cores baseadas em prioridade e prazo
- **Filtros**: Visualização por responsável, categoria ou prazo
- **Busca**: Localização rápida de atividades específicas

**Gerenciamento de Dependências**:
- **Dependências de Atividade**: Relacionamentos entre atividades
- **Gráfico de Gantt**: Visualização temporal das dependências
- **Alertas de Atraso**: Notificações quando dependências atrasam
- **Caminho Crítico**: Identificação automática do caminho crítico

### Sistema Detalhado de Tarefas

**Arquitetura de Tarefas**:
As tarefas representam o nível mais granular de trabalho no sistema, permitindo controle detalhado sobre atividades específicas. Cada tarefa é uma unidade de trabalho concreta com início, fim e resultado definidos.

O sistema de tarefas foi projetado para ser flexível, permitindo diferentes metodologias de trabalho. Pode ser usado para metodologias ágeis (sprints, stories) ou tradicionais (tarefas sequenciais), adaptando-se às necessidades específicas de cada projeto.

**Criação e Configuração de Tarefas**:

**Processo de Criação**:
1. Acesse a atividade desejada → aba "Tarefas"
2. Clique em "Nova Tarefa" para abrir o formulário
3. Preencha informações específicas da tarefa
4. Defina critérios de aceitação
5. Atribua responsável e estimativa
6. Configure lembretes e notificações

**Informações da Tarefa**:
- **Título**: Nome descritivo e específico da tarefa
- **Descrição**: Detalhes do que deve ser realizado
- **Critérios de Aceitação**: Condições para considerar a tarefa concluída
- **Responsável**: Usuário responsável pela execução
- **Estimativa**: Tempo estimado em horas ou dias
- **Prioridade**: Urgência da tarefa (Baixa, Média, Alta, Crítica)
- **Data de Vencimento**: Prazo para conclusão
- **Tags**: Palavras-chave para categorização e busca

**Tipos de Tarefas**:
- **Desenvolvimento**: Criação de código ou funcionalidades
- **Teste**: Execução de testes específicos
- **Documentação**: Criação ou atualização de documentos
- **Revisão**: Revisão de código, documentos ou resultados
- **Configuração**: Configuração de sistemas ou ambientes
- **Pesquisa**: Investigação de soluções ou tecnologias
- **Comunicação**: Reuniões, apresentações ou comunicações
- **Treinamento**: Capacitação ou aprendizado

**Sistema de Drag & Drop Avançado**:

**Funcionalidades de Movimentação**:
- **Entre Colunas**: Movimentação entre status do Kanban
- **Entre Atividades**: Transferência de tarefas entre atividades
- **Reordenação**: Reorganização de prioridades dentro da mesma coluna
- **Validações Inteligentes**: Verificação de dependências e regras

**Validações Automáticas**:
- **Dependências**: Verificação de tarefas dependentes
- **Recursos**: Validação de disponibilidade do responsável
- **Prazos**: Verificação de conflitos de cronograma
- **Permissões**: Validação de autorização para movimentação

**Sistema de Filtros e Busca**:

**Filtros Disponíveis**:
- **Por Responsável**: Visualizar tarefas de usuários específicos
- **Por Prioridade**: Filtrar por nível de urgência
- **Por Status**: Mostrar apenas tarefas em determinados estados
- **Por Prazo**: Tarefas próximas do vencimento ou atrasadas
- **Por Categoria**: Filtrar por tipo de tarefa
- **Por Projeto**: Visualizar tarefas de projetos específicos

**Busca Avançada**:
- **Texto Livre**: Busca em títulos, descrições e tags
- **Operadores**: Uso de AND, OR, NOT para buscas complexas
- **Filtros Combinados**: Combinação de múltiplos filtros
- **Salvamento**: Salvar filtros frequentes para reutilização
- **Exportação**: Exportar resultados de busca para análise

---

## 💬 Sistema de Chat e Comunicação

### Visão Geral do Sistema de Chat

O Sistema de Chat do SILO foi desenvolvido para facilitar a comunicação em tempo real entre membros da equipe do CPTEC/INPE. O sistema combina funcionalidades de chat de grupo com mensagens privadas, oferecendo uma plataforma completa para colaboração e comunicação institucional.

A arquitetura do chat foi projetada para ser robusta e escalável, suportando centenas de usuários simultâneos com baixa latência. O sistema utiliza tecnologias modernas de WebSocket para comunicação em tempo real, garantindo que as mensagens sejam entregues instantaneamente.

O chat integra-se perfeitamente com outros módulos do sistema, permitindo notificações contextuais sobre problemas de produtos, atualizações de projetos e alertas de sistema. Esta integração torna o chat uma ferramenta central para coordenação de equipes e resolução de problemas.

### Arquitetura de Grupos de Conversa

**Filosofia dos Grupos**:
Os grupos de chat são organizados por função e responsabilidade dentro da instituição, facilitando a comunicação direcionada e evitando spam desnecessário. Cada grupo tem características específicas e níveis de acesso diferenciados.

O sistema permite que usuários participem de múltiplos grupos simultaneamente, com notificações inteligentes que priorizam mensagens relevantes. A interface mostra claramente o status de cada grupo e permite alternância rápida entre conversas.

**Grupos Institucionais Disponíveis**:

**Administradores**:
Grupo restrito para administradores do sistema e gestores de alto nível. Discussões sobre políticas, estratégias e decisões importantes. Acesso limitado a usuários com permissões administrativas.

**Meteorologistas**:
Grupo principal para especialistas em previsão do tempo e análise meteorológica. Discussões técnicas sobre modelos, dados e previsões. Inclui meteorologistas operacionais e de pesquisa.

**Pesquisadores**:
Grupo para cientistas e pesquisadores do INPE. Discussões sobre projetos de pesquisa, publicações científicas e colaborações. Inclui doutorandos, pós-doutorandos e pesquisadores seniores.

**Operadores**:
Grupo para técnicos e operadores de sistemas críticos. Discussões sobre operação de equipamentos, manutenção e procedimentos operacionais. Comunicação rápida para resolução de problemas.

**Suporte**:
Grupo para equipe de suporte técnico e atendimento. Coordenação de chamados, escalação de problemas e comunicação com usuários. Inclui diferentes níveis de suporte.

**Visitantes**:
Grupo para usuários externos e colaboradores temporários. Acesso limitado com funcionalidades básicas de chat. Moderado por administradores.

### Participação em Grupos

**Processo de Participação**:
1. Acesse o chat através do menu lateral
2. Visualize a lista de grupos disponíveis
3. Clique no grupo desejado para abrir a conversa
4. Digite sua mensagem na caixa de texto
5. Pressione Enter ou clique no botão enviar

**Funcionalidades de Grupo**:
- **Histórico Completo**: Acesso a todas as mensagens anteriores
- **Notificações**: Alertas para mensagens não lidas
- **Mencionar Usuários**: Use @nome para mencionar usuários específicos
- **Reações**: Reaja a mensagens com emojis
- **Citações**: Responda a mensagens específicas
- **Anexos**: Compartilhe arquivos e imagens

**Moderação e Controles**:
- **Administradores de Grupo**: Usuários com permissões especiais
- **Moderação de Conteúdo**: Controle sobre mensagens inadequadas
- **Silenciar Notificações**: Desativar alertas temporariamente
- **Sair do Grupo**: Deixar grupo quando necessário

### Sistema de Conversas Privadas

**Funcionalidades de Mensagens Privadas**:
As conversas privadas permitem comunicação direta entre usuários individuais, ideal para discussões confidenciais, coordenação de tarefas específicas e comunicação pessoal.

O sistema mantém histórico completo das conversas privadas, permitindo referência a mensagens anteriores e manutenção do contexto das discussões. As mensagens são criptografadas em trânsito para garantir privacidade.

**Iniciando Conversas Privadas**:

**Processo de Início**:
1. Clique em "Nova Conversa" no painel do chat
2. Digite o nome do usuário desejado na busca
3. Selecione o usuário da lista de resultados
4. Digite sua mensagem inicial
5. Envie a mensagem para iniciar a conversa

**Funcionalidades Avançadas**:
- **Busca de Usuários**: Sistema de busca inteligente por nome ou email
- **Status de Leitura**: Indicação quando mensagem foi lida
- **Entrega Garantida**: Confirmação de entrega das mensagens
- **Histórico Persistente**: Manutenção de histórico indefinidamente
- **Arquivamento**: Organização de conversas antigas

**Gerenciamento de Conversas**:
- **Favoritar**: Marcar conversas importantes
- **Arquivar**: Ocultar conversas antigas
- **Bloquear**: Bloquear usuários indesejados
- **Silenciar**: Desativar notificações de conversas específicas

### Sistema de Status de Presença

**Estados de Presença Disponíveis**:

**🟢 Online - Disponível**:
Usuário ativo e disponível para conversar. Indica que o usuário está usando o sistema e pode responder rapidamente. Notificações são entregues imediatamente.

**🟡 Ausente - Temporariamente Indisponível**:
Usuário não está ativo no sistema mas pode retornar em breve. Notificações são entregues mas podem ter resposta mais lenta. Útil para pausas curtas.

**🔴 Ocupado - Não Disponível**:
Usuário está no sistema mas não disponível para conversas. Indica trabalho focado ou reuniões. Notificações são silenciadas ou entregues com baixa prioridade.

**⚫ Offline - Desconectado**:
Usuário não está conectado ao sistema. Mensagens são armazenadas e entregues quando o usuário retornar. Status automático baseado na conexão.

**Gerenciamento de Status**:

**Alteração Manual de Status**:
1. Clique no seu avatar no painel do chat
2. Selecione o status desejado no menu dropdown
3. O status é atualizado instantaneamente
4. Outros usuários veem a mudança em tempo real

**Alteração Automática**:
- **Detecção de Inatividade**: Status muda para "Ausente" após 15 minutos
- **Detecção de Foco**: Status muda para "Ocupado" durante reuniões
- **Detecção de Logout**: Status muda para "Offline" automaticamente
- **Retorno de Atividade**: Status volta para "Online" quando ativo

**Configurações de Status**:
- **Status Padrão**: Definir status inicial ao conectar
- **Notificações de Status**: Receber alertas sobre mudanças de status
- **Status Personalizado**: Criar mensagens de status personalizadas
- **Horários de Disponibilidade**: Definir horários de trabalho

### Funcionalidades Avançadas do Chat

**Sistema de Emoji Picker**:

**Categorias de Emojis**:
- **😀 Pessoas**: Emojis de rostos e expressões
- **🐾 Animais**: Emojis de animais e natureza
- **🍕 Comida**: Emojis de comida e bebida
- **⚽ Atividades**: Emojis de esportes e atividades
- **🚗 Viagem**: Emojis de transporte e lugares
- **💡 Objetos**: Emojis de objetos e símbolos

**Funcionalidades do Picker**:
- **Busca Inteligente**: Digite palavras-chave para encontrar emojis
- **Favoritos**: Marcar emojis mais usados
- **Histórico Recente**: Acesso rápido a emojis usados recentemente
- **Skin Tones**: Diferentes tons de pele para emojis de pessoas
- **Animações**: Emojis animados para maior expressividade

**Sistema de Histórico e Busca**:

**Histórico de Mensagens**:
- **Armazenamento Persistente**: Mensagens são salvas indefinidamente
- **Navegação Temporal**: Scroll infinito para mensagens antigas
- **Marcadores**: Marcar mensagens importantes
- **Exportação**: Exportar conversas para arquivo

**Busca Avançada**:
- **Busca por Texto**: Procurar por palavras específicas
- **Busca por Usuário**: Filtrar mensagens de usuários específicos
- **Busca por Data**: Filtrar por período específico
- **Busca por Tipo**: Filtrar por mensagens, anexos ou links
- **Busca em Grupos**: Buscar em grupos específicos

**Gerenciamento de Mensagens**:

**Edição e Exclusão**:
- **Edição**: Editar mensagens por até 5 minutos após envio
- **Exclusão**: Deletar mensagens por até 24 horas após envio
- **Reações**: Adicionar reações a mensagens existentes
- **Citações**: Responder a mensagens específicas

**Moderação e Controles**:
- **Reportar Mensagem**: Reportar conteúdo inadequado
- **Silenciar Usuário**: Ocultar mensagens de usuários específicos
- **Bloquear Usuário**: Bloquear comunicação com usuários
- **Administração**: Ferramentas de moderação para administradores

---

## 📊 Sistema de Relatórios Avançados

### Visão Geral do Módulo de Relatórios

O Sistema de Relatórios do SILO foi desenvolvido para fornecer análises detalhadas e insights sobre o desempenho operacional do CPTEC/INPE. O módulo combina dados de múltiplas fontes para criar visualizações abrangentes que suportam tomada de decisões baseada em dados.

O sistema utiliza tecnologias avançadas de visualização de dados, incluindo ApexCharts para gráficos interativos e responsivos. Os relatórios são gerados em tempo real, garantindo que as informações estejam sempre atualizadas e precisas.

A arquitetura modular permite a criação de relatórios personalizados para diferentes níveis organizacionais, desde relatórios operacionais para técnicos até dashboards executivos para gestão. Cada relatório pode ser configurado com filtros específicos e métricas relevantes.

### Relatórios de Disponibilidade e Performance

**Acesse**: Menu lateral → Relatórios → Disponibilidade

**Métricas de Disponibilidade**:

**Uptime por Produto**:
Medição contínua da disponibilidade de cada produto meteorológico, calculada como percentual de tempo operacional em relação ao tempo total. Inclui:

- **Uptime Atual**: Disponibilidade dos últimos 30 dias
- **Uptime Histórico**: Tendência de disponibilidade ao longo do tempo
- **Comparação de Produtos**: Ranking de disponibilidade entre produtos
- **Análise de Tendências**: Identificação de padrões de falha

**Tempo Médio de Resolução (MTTR)**:
Métrica crítica para avaliar a eficiência da equipe de suporte:

- **MTTR por Categoria**: Tempo médio de resolução por tipo de problema
- **MTTR por Produto**: Performance de resolução por produto específico
- **MTTR por Equipe**: Eficiência de diferentes grupos de trabalho
- **Evolução do MTTR**: Tendência de melhoria ou degradação

**Atividades Completadas**:
Contabilização de atividades e tarefas concluídas:

- **Volume de Atividades**: Número total de atividades por período
- **Taxa de Conclusão**: Percentual de atividades concluídas no prazo
- **Produtividade por Usuário**: Atividades completadas por membro da equipe
- **Distribuição por Categoria**: Tipos de atividades mais comuns

**Análise de Tendências Temporais**:
Identificação de padrões e sazonalidades:

- **Tendências Semanais**: Padrões de atividade ao longo da semana
- **Tendências Mensais**: Variações sazonais de demanda
- **Picos de Atividade**: Identificação de períodos de alta demanda
- **Previsão de Carga**: Projeções baseadas em dados históricos

**Sistema de Filtros Avançados**:

**Filtros Temporais**:
- **Período Personalizado**: Seleção de datas específicas
- **Comparação de Períodos**: Análise comparativa entre períodos
- **Marcos Temporais**: Filtros por eventos específicos
- **Tendências de Longo Prazo**: Análise de dados históricos

**Filtros por Produto**:
- **Produto Individual**: Análise focada em produto específico
- **Grupo de Produtos**: Análise de conjunto de produtos relacionados
- **Categoria de Produto**: Filtro por tipo de produto meteorológico
- **Status do Produto**: Filtro por produtos ativos/inativos

**Filtros por Equipe**:
- **Usuário Individual**: Performance de usuário específico
- **Grupo de Usuários**: Análise por equipe ou departamento
- **Nível de Experiência**: Filtro por senioridade dos usuários
- **Carga de Trabalho**: Análise de distribuição de trabalho

### Relatórios de Problemas e Soluções

**Acesse**: Menu lateral → Relatórios → Problemas

**Análises de Problemas**:

**Problemas Mais Frequentes**:
Identificação dos problemas mais comuns e suas causas raiz:

- **Ranking de Problemas**: Lista ordenada por frequência
- **Análise de Causas**: Identificação de causas raiz comuns
- **Impacto nos Produtos**: Relação entre problemas e produtos afetados
- **Tendências de Problemas**: Evolução da frequência ao longo do tempo

**Tempo Médio de Resolução por Categoria**:
Análise detalhada da eficiência de resolução:

- **Categoria de Rede**: Problemas de conectividade e infraestrutura
- **Categoria de Software**: Bugs e problemas de código
- **Categoria de Hardware**: Falhas de equipamentos e servidores
- **Categoria Humana**: Erros operacionais e procedimentais

**Distribuição por Categoria**:
Visualização da distribuição de problemas:

- **Gráfico de Pizza**: Distribuição percentual por categoria
- **Gráfico de Barras**: Comparação quantitativa entre categorias
- **Evolução Temporal**: Mudanças na distribuição ao longo do tempo
- **Análise de Sazonalidade**: Padrões sazonais de problemas

**Performance da Equipe**:
Avaliação do desempenho individual e coletivo:

- **Produtividade Individual**: Problemas resolvidos por usuário
- **Eficiência de Resolução**: Tempo médio de resolução por usuário
- **Qualidade das Soluções**: Avaliação das soluções fornecidas
- **Colaboração**: Nível de colaboração entre membros da equipe

### Relatórios Executivos e KPIs

**Acesse**: Menu lateral → Relatórios → Executivo

**Indicadores de Performance (KPIs)**:

**KPIs Operacionais**:
- **Disponibilidade Geral**: Uptime médio de todos os produtos
- **Eficiência de Resolução**: Tempo médio de resolução de problemas
- **Satisfação do Usuário**: Métricas de satisfação e feedback
- **Carga de Trabalho**: Distribuição e balanceamento de trabalho

**KPIs de Qualidade**:
- **Taxa de Resolução**: Percentual de problemas resolvidos
- **Reincidência**: Taxa de problemas que retornam
- **Tempo de Primeira Resposta**: Velocidade de resposta inicial
- **Qualidade das Soluções**: Avaliação da efetividade das soluções

**KPIs de Produtividade**:
- **Atividades por Usuário**: Volume de trabalho por pessoa
- **Eficiência de Projetos**: Taxa de conclusão de projetos
- **Utilização de Recursos**: Aproveitamento de recursos disponíveis
- **Inovação**: Novas soluções e melhorias implementadas

### Sistema de Exportação de Dados

**Formatos de Exportação Suportados**:

**PDF - Relatórios Formatados**:
- **Layout Profissional**: Formatação adequada para apresentações
- **Gráficos de Alta Qualidade**: Visualizações em resolução otimizada
- **Múltiplas Páginas**: Relatórios extensos com paginação
- **Marca Institucional**: Cabeçalhos e rodapés personalizados
- **Metadados**: Informações sobre data de geração e filtros aplicados

**Excel - Planilhas com Dados**:
- **Dados Brutos**: Acesso aos dados numéricos subjacentes
- **Múltiplas Abas**: Organização por categoria ou período
- **Fórmulas Calculadas**: Cálculos automáticos de métricas
- **Formatação Condicional**: Destaque de valores importantes
- **Gráficos Integrados**: Visualizações incorporadas nas planilhas

**CSV - Dados Estruturados**:
- **Formato Universal**: Compatível com qualquer sistema
- **Dados Limpos**: Estrutura padronizada para análise
- **Codificação UTF-8**: Suporte a caracteres especiais
- **Separadores Configuráveis**: Vírgula, ponto e vírgula ou tabulação
- **Headers Descritivos**: Cabeçalhos claros e informativos

**Processo de Exportação**:

**Configuração de Filtros**:
1. Acesse o relatório desejado
2. Configure os filtros temporais e de categoria
3. Selecione as métricas específicas a incluir
4. Defina o nível de detalhamento desejado
5. Configure opções de formatação

**Geração e Download**:
1. Clique no botão "Exportar" no canto superior direito
2. Selecione o formato desejado (PDF, Excel ou CSV)
3. Aguarde o processamento (geralmente 5-30 segundos)
4. Baixe o arquivo gerado automaticamente
5. Verifique a integridade dos dados exportados

**Agendamento de Relatórios**:
- **Relatórios Automáticos**: Configuração de envio periódico
- **Notificações por Email**: Alertas quando relatórios estão prontos
- **Personalização de Horários**: Definição de horários específicos
- **Múltiplos Destinatários**: Envio para diferentes usuários
- **Formato Personalizado**: Configuração específica para cada destinatário

---

## 👥 Gestão de Grupos e Usuários

### Visão Geral do Módulo de Gestão

O módulo de Gestão de Grupos e Usuários é responsável por administrar o acesso e as permissões de todos os usuários do Sistema SILO. Este módulo implementa um sistema hierárquico de grupos que reflete a estrutura organizacional do CPTEC/INPE, garantindo que cada usuário tenha acesso apropriado às funcionalidades do sistema.

O sistema utiliza uma arquitetura de grupos baseada em roles (RBAC - Role-Based Access Control), onde cada grupo possui permissões específicas e usuários podem pertencer a múltiplos grupos simultaneamente. Esta flexibilidade permite uma gestão granular de acesso, adaptando-se às necessidades organizacionais complexas.

A interface de administração foi projetada para ser intuitiva tanto para administradores experientes quanto para usuários com menos experiência técnica, oferecendo ferramentas visuais para gerenciamento de grupos e usuários.

### Administração Avançada de Grupos

**Acesse**: Menu lateral → Grupos

**Filosofia dos Grupos**:
Os grupos no Sistema SILO são organizados hierarquicamente, refletindo a estrutura organizacional do CPTEC/INPE. Cada grupo possui características específicas, permissões definidas e responsabilidades claras dentro do sistema.

O sistema suporta grupos aninhados, permitindo a criação de subgrupos e hierarquias complexas. Esta funcionalidade é especialmente útil para organizações grandes como o INPE, onde diferentes departamentos e divisões possuem necessidades específicas de acesso.

**Criação e Configuração de Grupos**:

**Processo de Criação**:
1. Acesse o módulo de grupos através do menu lateral
2. Clique em "Novo Grupo" para abrir o formulário de criação
3. Preencha as informações básicas do grupo
4. Configure permissões e responsabilidades
5. Defina hierarquia e relacionamentos
6. Salve e configure membros iniciais

**Informações Básicas do Grupo**:

**Nome do Grupo**:
Deve ser único e descritivo, seguindo convenções organizacionais. Exemplos: "Administradores SILO", "Meteorologistas Operacionais", "Pesquisadores Climatologia". O sistema valida unicidade e sugere alternativas.

**Descrição Detalhada**:
Campo de texto rico que deve incluir: propósito do grupo, responsabilidades, critérios de admissão e relacionamento com outros grupos. Esta descrição serve como documentação oficial e guia para administradores.

**Cor de Identificação**:
Sistema de cores para identificação visual rápida dos grupos. Cores são usadas em interfaces, relatórios e notificações para facilitar a identificação. Inclui paleta de cores institucionais do INPE.

**Categoria do Grupo**:
- **Administrativo**: Grupos com permissões de administração
- **Técnico**: Grupos de especialistas técnicos
- **Operacional**: Grupos de operação e manutenção
- **Pesquisa**: Grupos de pesquisa e desenvolvimento
- **Suporte**: Grupos de atendimento e suporte
- **Externo**: Grupos de usuários externos

**Configurações Avançadas**:

**Permissões e Acesso**:
- **Módulos Permitidos**: Definição de quais módulos o grupo pode acessar
- **Funcionalidades Específicas**: Permissões granulares por funcionalidade
- **Níveis de Acesso**: Diferentes níveis dentro do mesmo módulo
- **Restrições Temporais**: Limitações de horário de acesso
- **Restrições Geográficas**: Limitações baseadas em localização

**Hierarquia e Relacionamentos**:
- **Grupo Pai**: Definição de grupo superior na hierarquia
- **Grupos Subordinados**: Grupos que reportam a este grupo
- **Grupos Relacionados**: Grupos com relacionamento lateral
- **Herança de Permissões**: Herança automática de permissões do grupo pai

**Gerenciamento de Membros**:

**Adição de Membros**:
1. Acesse o grupo desejado → aba "Usuários"
2. Clique em "Adicionar Membro" para abrir a busca
3. Digite nome ou email do usuário desejado
4. Selecione o usuário da lista de resultados
5. Defina data de início e fim da participação
6. Configure permissões específicas do usuário no grupo
7. Salve a associação

**Remoção de Membros**:
- **Remoção Temporária**: Suspensão temporária da participação
- **Remoção Permanente**: Remoção definitiva do grupo
- **Transferência**: Movimentação para outro grupo
- **Arquivamento**: Manutenção de histórico sem acesso ativo

**Gestão de Permissões**:
- **Permissões Padrão**: Aplicação automática de permissões do grupo
- **Permissões Personalizadas**: Ajustes específicos por usuário
- **Permissões Temporárias**: Permissões com data de expiração
- **Delegação**: Transferência temporária de permissões

### Gestão Completa de Usuários

**Acesse**: Menu lateral → Grupos → aba "Usuários"

**Filosofia de Gestão de Usuários**:
O sistema de gestão de usuários foi projetado para ser centralizado e eficiente, permitindo que administradores gerenciem todos os aspectos da vida de um usuário no sistema. Cada usuário possui um perfil completo que inclui informações pessoais, profissionais e de acesso.

O sistema mantém histórico completo de todas as alterações em perfis de usuários, permitindo auditoria e rastreabilidade. Esta funcionalidade é essencial para ambientes institucionais como o CPTEC/INPE, onde a segurança e conformidade são críticas.

**Ações Disponíveis para Usuários**:

**Ativação e Desativação**:
- **Ativar Usuário**: Habilitar acesso completo ao sistema
- **Desativar Usuário**: Suspender acesso temporariamente
- **Suspender Acesso**: Bloqueio temporário por motivos específicos
- **Reativar Usuário**: Restaurar acesso após suspensão
- **Arquivar Usuário**: Remoção permanente do sistema

**Gestão de Perfil**:
- **Editar Dados Pessoais**: Nome, email, telefone, departamento
- **Atualizar Informações Profissionais**: Cargo, nível, especialização
- **Modificar Preferências**: Configurações pessoais e notificações
- **Gerenciar Foto**: Upload e atualização de foto de perfil
- **Configurar Assinatura**: Assinatura para emails e documentos

**Gestão de Acesso**:
- **Alterar Grupos**: Adicionar/remover usuário de grupos
- **Modificar Permissões**: Ajustar permissões específicas
- **Configurar Restrições**: Definir limitações de acesso
- **Gerenciar Sessões**: Controlar sessões ativas do usuário
- **Auditoria de Acesso**: Visualizar histórico de acessos

**Gestão de Segurança**:
- **Resetar Senha**: Gerar nova senha temporária
- **Forçar Alteração**: Obrigar usuário a alterar senha
- **Configurar 2FA**: Ativar autenticação de dois fatores
- **Bloquear Conta**: Bloqueio por motivos de segurança
- **Auditoria de Segurança**: Histórico de eventos de segurança

**Sistema de Filtros e Busca**:

**Filtros Disponíveis**:
- **Status do Usuário**: Ativo, Inativo, Suspenso, Arquivado
- **Grupo Específico**: Filtrar por grupo de pertencimento
- **Departamento**: Filtrar por departamento ou divisão
- **Nível de Acesso**: Filtrar por nível de permissões
- **Data de Criação**: Filtrar por período de cadastro
- **Último Acesso**: Filtrar por atividade recente

**Busca Avançada**:
- **Busca por Nome**: Busca por nome completo ou parcial
- **Busca por Email**: Busca por endereço de email
- **Busca por Cargo**: Busca por função ou cargo
- **Busca por Especialização**: Busca por área de expertise
- **Busca Combinada**: Combinação de múltiplos critérios
- **Busca Salvada**: Salvar filtros frequentes para reutilização

**Relatórios de Usuários**:
- **Lista Completa**: Relatório de todos os usuários
- **Usuários por Grupo**: Distribuição de usuários por grupo
- **Usuários Inativos**: Lista de usuários sem atividade recente
- **Novos Usuários**: Usuários cadastrados em período específico
- **Usuários com Problemas**: Usuários com problemas de acesso
- **Exportação**: Exportar dados de usuários para análise

### Sistema de Permissões e Controle de Acesso

**Arquitetura de Permissões**:
O sistema utiliza uma arquitetura de permissões baseada em roles (RBAC) com elementos de controle de acesso baseado em atributos (ABAC). Esta combinação permite flexibilidade máxima na definição de permissões, adaptando-se às necessidades complexas de uma instituição de pesquisa.

As permissões são organizadas hierarquicamente, com permissões básicas que podem ser combinadas para formar permissões mais complexas. O sistema suporta herança de permissões, onde grupos filhos herdam permissões dos grupos pais.

**Tipos de Permissões**:

**Permissões de Módulo**:
- **Acesso Total**: Acesso completo ao módulo
- **Acesso de Leitura**: Apenas visualização de dados
- **Acesso de Escrita**: Criação e edição de dados
- **Acesso de Administração**: Configuração e gestão do módulo
- **Acesso de Relatórios**: Geração e visualização de relatórios

**Permissões de Funcionalidade**:
- **Criar**: Criação de novos registros
- **Ler**: Visualização de dados existentes
- **Atualizar**: Modificação de registros existentes
- **Deletar**: Remoção de registros
- **Exportar**: Exportação de dados
- **Importar**: Importação de dados

**Permissões de Dados**:
- **Acesso a Dados Sensíveis**: Informações confidenciais
- **Acesso a Dados Públicos**: Informações não confidenciais
- **Acesso por Departamento**: Dados específicos do departamento
- **Acesso por Projeto**: Dados relacionados a projetos específicos
- **Acesso Temporal**: Limitações baseadas em tempo

**Sistema de Auditoria**:
- **Log de Acessos**: Registro de todos os acessos ao sistema
- **Log de Alterações**: Registro de modificações em dados
- **Log de Permissões**: Registro de mudanças em permissões
- **Log de Segurança**: Registro de eventos de segurança
- **Relatórios de Auditoria**: Geração de relatórios de auditoria

---

## ⚙️ Configurações do Sistema

### Visão Geral do Módulo de Configurações

O módulo de Configurações do Sistema SILO permite que usuários personalizem sua experiência no sistema, adaptando a interface e funcionalidades às suas necessidades específicas. O módulo está organizado em seções lógicas que cobrem desde configurações pessoais até preferências de segurança.

O sistema foi projetado para ser intuitivo e acessível, permitindo que usuários de diferentes níveis técnicos configurem o sistema conforme suas necessidades. Todas as configurações são salvas automaticamente e sincronizadas entre dispositivos, garantindo uma experiência consistente.

A interface de configurações utiliza um design responsivo que se adapta perfeitamente a diferentes tamanhos de tela, desde smartphones até monitores de alta resolução. Cada seção de configuração inclui explicações detalhadas e exemplos práticos para facilitar o entendimento.

### Gestão Completa de Perfil do Usuário

**Acesse**: Menu lateral → Configurações → Perfil

**Filosofia do Perfil**:
O perfil do usuário é o centro de sua identidade no Sistema SILO, contendo todas as informações necessárias para personalização e identificação. O sistema mantém um histórico completo de alterações no perfil, permitindo auditoria e rastreabilidade de mudanças.

O perfil integra-se com todos os módulos do sistema, fornecendo informações contextuais e personalizando a experiência do usuário. As informações do perfil são utilizadas para notificações, relatórios e funcionalidades colaborativas.

**Dados Pessoais Essenciais**:

**Informações Básicas**:
- **Nome Completo**: Nome oficial conforme documentos institucionais
- **Email Institucional**: Endereço @inpe.br (não editável após criação)
- **Telefone**: Número de contato principal
- **Telefone Alternativo**: Número de contato secundário
- **Data de Nascimento**: Para validação de identidade
- **CPF**: Documento de identificação (opcional)

**Informações Profissionais**:
- **Departamento**: Divisão ou departamento de lotação
- **Cargo/Função**: Posição ocupada na instituição
- **Nível Hierárquico**: Nível na estrutura organizacional
- **Especialização**: Área de expertise técnica
- **Anos de Experiência**: Tempo de atuação na área
- **Supervisor Imediato**: Responsável hierárquico direto

**Informações de Contato**:
- **Endereço Profissional**: Localização física no trabalho
- **Sala/Escritório**: Número da sala ou escritório
- **Ramal**: Número de ramal telefônico
- **Horário de Trabalho**: Horários de disponibilidade
- **Idiomas**: Idiomas falados e níveis de proficiência

**Sistema de Foto de Perfil**:

**Upload e Gerenciamento**:
1. Clique em "Alterar Foto" na seção de perfil
2. Selecione uma imagem do seu dispositivo
3. Use as ferramentas de recorte para ajustar a foto
4. Visualize o resultado em tempo real
5. Confirme a alteração para salvar

**Requisitos de Imagem**:
- **Formatos Suportados**: JPG, PNG, WebP
- **Tamanho Máximo**: 4MB por arquivo
- **Resolução Mínima**: 200x200 pixels
- **Resolução Recomendada**: 400x400 pixels
- **Proporção**: Quadrada (1:1) para melhor exibição

**Processamento Automático**:
- **Redimensionamento**: Ajuste automático para 128x128 pixels
- **Otimização**: Compressão para reduzir tamanho do arquivo
- **Conversão**: Conversão automática para WebP
- **Validação**: Verificação de integridade da imagem
- **Backup**: Manutenção de versão anterior da foto

### Sistema Avançado de Preferências

**Acesse**: Menu lateral → Configurações → Preferências

**Filosofia das Preferências**:
O sistema de preferências foi projetado para ser abrangente e flexível, permitindo que cada usuário configure o sistema conforme suas necessidades específicas. As preferências são organizadas em categorias lógicas para facilitar a navegação e configuração.

Todas as preferências são salvas automaticamente e aplicadas imediatamente, sem necessidade de recarregar a página. O sistema mantém backup das configurações anteriores, permitindo reversão em caso de problemas.

**Configurações de Interface**:

**Sistema de Temas**:
- **Tema Claro**: Interface com cores claras e alto contraste
- **Tema Escuro**: Interface com cores escuras para reduzir fadiga ocular
- **Tema Automático**: Alternância automática baseada no horário do sistema
- **Tema Personalizado**: Criação de temas customizados com cores específicas
- **Transições Suaves**: Animações suaves na mudança de temas

**Configurações de Layout**:
- **Densidade da Interface**: Compacta, Normal ou Espaçosa
- **Tamanho da Fonte**: Pequena, Média ou Grande
- **Largura do Menu**: Colapsado, Normal ou Expandido
- **Posição dos Elementos**: Personalização da disposição de componentes
- **Atalhos de Teclado**: Configuração de atalhos personalizados

**Configurações de Notificações**:

**Tipos de Notificação**:
- **Notificações de Email**: Alertas enviados por email
- **Notificações Push**: Alertas em tempo real no navegador
- **Notificações de Sistema**: Alertas internos do sistema
- **Notificações de Chat**: Alertas de mensagens e conversas
- **Notificações de Projetos**: Alertas relacionados a projetos

**Configurações por Categoria**:
- **Problemas Críticos**: Notificações imediatas para problemas críticos
- **Atualizações de Projetos**: Notificações sobre mudanças em projetos
- **Mensagens de Chat**: Alertas de novas mensagens
- **Relatórios Disponíveis**: Notificações de novos relatórios
- **Manutenção do Sistema**: Alertas de manutenção programada

**Configurações de Chat**:

**Controle de Chat**:
- **Ativar/Desativar Chat**: Controle principal do sistema de chat
- **Notificações de Mensagens**: Alertas para novas mensagens
- **Status de Presença**: Configuração do status padrão
- **Som de Notificação**: Ativar/desativar sons de alerta
- **Vibração**: Configuração de vibração em dispositivos móveis

**Preferências de Comunicação**:
- **Horários de Disponibilidade**: Definir horários de trabalho
- **Grupos Favoritos**: Grupos de chat mais utilizados
- **Usuários Favoritos**: Contatos mais importantes
- **Mensagens Automáticas**: Respostas automáticas quando ausente
- **Filtros de Mensagem**: Configuração de filtros de conteúdo

**Configurações de Idioma e Localização**:

**Idioma do Sistema**:
- **Português (Brasil)**: Idioma padrão do sistema
- **Inglês**: Idioma alternativo para usuários internacionais
- **Espanhol**: Suporte para colaboradores de países hispanohablantes
- **Francês**: Suporte para colaboradores francófonos

**Configurações Regionais**:
- **Fuso Horário**: Configuração do fuso horário local
- **Formato de Data**: DD/MM/AAAA, MM/DD/AAAA ou AAAA-MM-DD
- **Formato de Hora**: 12h ou 24h
- **Separador Decimal**: Vírgula ou ponto
- **Moeda**: Real brasileiro (padrão)

**Salvamento e Sincronização**:

**Salvamento Automático**:
- **Salvamento Instantâneo**: Configurações salvas imediatamente
- **Backup Automático**: Cópia de segurança das configurações
- **Histórico de Alterações**: Registro de todas as mudanças
- **Restauração**: Possibilidade de restaurar configurações anteriores
- **Validação**: Verificação de integridade das configurações

**Sincronização Entre Dispositivos**:
- **Sincronização em Tempo Real**: Configurações sincronizadas instantaneamente
- **Múltiplos Dispositivos**: Suporte para vários dispositivos simultâneos
- **Resolução de Conflitos**: Tratamento automático de conflitos
- **Offline**: Funcionamento offline com sincronização posterior
- **Segurança**: Criptografia das configurações em trânsito

### Sistema Avançado de Segurança

**Acesse**: Menu lateral → Configurações → Segurança

**Filosofia de Segurança**:
O sistema de segurança do SILO foi projetado seguindo as melhores práticas de segurança da informação, implementando múltiplas camadas de proteção para garantir a integridade e confidencialidade dos dados institucionais.

A segurança é tratada como uma responsabilidade compartilhada entre o sistema e o usuário, com ferramentas e orientações claras para que cada usuário possa contribuir para a segurança geral do sistema.

**Gestão de Senhas**:

**Alteração de Senha**:
1. Acesse a seção de Segurança nas configurações
2. Clique em "Alterar Senha" para abrir o formulário
3. Digite sua senha atual para verificação
4. Digite a nova senha seguindo os requisitos
5. Confirme a nova senha para validação
6. Clique em "Alterar" para aplicar a mudança

**Requisitos de Segurança de Senha**:
- **Comprimento Mínimo**: 8 caracteres obrigatórios
- **Comprimento Recomendado**: 12 caracteres ou mais
- **Letras Maiúsculas**: Pelo menos 1 letra maiúscula (A-Z)
- **Letras Minúsculas**: Pelo menos 1 letra minúscula (a-z)
- **Números**: Pelo menos 1 dígito numérico (0-9)
- **Caracteres Especiais**: Pelo menos 1 caractere especial (!@#$%^&*)
- **Proibição de Padrões**: Não pode conter sequências óbvias
- **Histórico**: Não pode reutilizar as últimas 5 senhas

**Validação de Força da Senha**:
- **Indicador Visual**: Barra de progresso mostrando força da senha
- **Verificação em Tempo Real**: Validação instantânea dos requisitos
- **Sugestões de Melhoria**: Dicas para fortalecer a senha
- **Teste de Vazamento**: Verificação contra senhas comprometidas
- **Geração Automática**: Opção de gerar senha segura automaticamente

**Autenticação de Dois Fatores (2FA)**:

**Configuração de 2FA**:
1. Acesse a seção de Segurança
2. Clique em "Configurar 2FA"
3. Escaneie o QR code com seu aplicativo autenticador
4. Digite o código de verificação gerado
5. Salve as configurações de backup
6. Ative a autenticação de dois fatores

**Aplicativos Suportados**:
- **Google Authenticator**: Aplicativo oficial do Google
- **Microsoft Authenticator**: Aplicativo da Microsoft
- **Authy**: Aplicativo multiplataforma
- **1Password**: Gerenciador de senhas com 2FA
- **LastPass**: Gerenciador de senhas com 2FA

**Códigos de Backup**:
- **Geração Automática**: 10 códigos de backup únicos
- **Uso Único**: Cada código pode ser usado apenas uma vez
- **Armazenamento Seguro**: Mantenha os códigos em local seguro
- **Regeneração**: Possibilidade de gerar novos códigos
- **Validação**: Verificação de códigos antes de ativar 2FA

**Sessões e Acessos**:

**Gerenciamento de Sessões**:
- **Sessões Ativas**: Visualização de todas as sessões ativas
- **Dispositivos Conectados**: Lista de dispositivos com acesso
- **Localização**: Informações de localização das sessões
- **Último Acesso**: Timestamp do último acesso
- **Encerrar Sessão**: Possibilidade de encerrar sessões remotamente

**Configurações de Sessão**:
- **Tempo de Expiração**: Configuração do tempo de sessão
- **Renovação Automática**: Renovação automática de sessões ativas
- **Logout Automático**: Encerramento automático por inatividade
- **Sessão Única**: Permitir apenas uma sessão por usuário
- **Notificações de Acesso**: Alertas para novos acessos

**Auditoria de Segurança**:

**Log de Eventos de Segurança**:
- **Tentativas de Login**: Registro de todas as tentativas de acesso
- **Alterações de Senha**: Histórico de mudanças de senha
- **Alterações de Perfil**: Registro de modificações no perfil
- **Acessos Suspeitos**: Detecção de atividades anômalas
- **Violações de Segurança**: Registro de tentativas de violação

**Relatórios de Segurança**:
- **Relatório de Acessos**: Histórico detalhado de acessos
- **Relatório de Alterações**: Mudanças em configurações de segurança
- **Relatório de Tentativas**: Tentativas de acesso falhadas
- **Relatório de Dispositivos**: Dispositivos utilizados para acesso
- **Exportação**: Exportação de relatórios para análise

**Configurações de Privacidade**:

**Controle de Dados Pessoais**:
- **Visibilidade do Perfil**: Quem pode ver suas informações
- **Compartilhamento de Dados**: Controle sobre compartilhamento
- **Cookies e Rastreamento**: Configuração de cookies
- **Análise de Uso**: Participação em análises de uso
- **Comunicações**: Preferências de comunicação

**Configurações de Backup**:
- **Backup Automático**: Backup automático de configurações
- **Frequência de Backup**: Configuração da frequência
- **Retenção de Dados**: Tempo de retenção dos backups
- **Criptografia**: Criptografia dos dados de backup
- **Restauração**: Processo de restauração de configurações

---

## 🔧 Sistema de Upload de Imagens

### Visão Geral do Sistema de Upload

O Sistema de Upload de Imagens do SILO foi desenvolvido para gerenciar de forma eficiente e segura todos os tipos de imagens utilizadas no sistema. O módulo integra-se com o UploadThing v7 para fornecer uma experiência de upload robusta e confiável.

O sistema foi projetado para ser intuitivo e acessível, permitindo que usuários de diferentes níveis técnicos façam upload de imagens sem dificuldades. Todas as imagens são processadas automaticamente para otimização e compatibilidade.

A arquitetura do sistema garante que as imagens sejam armazenadas de forma segura e acessíveis rapidamente, com suporte a diferentes formatos e tamanhos conforme a necessidade específica de cada tipo de upload.

### Tipos de Upload Suportados

**Avatar de Usuário**:
Sistema especializado para fotos de perfil de usuários, com processamento automático para garantir consistência visual:

- **Formatos Suportados**: JPG, PNG, WebP
- **Tamanho Máximo**: 4MB por arquivo
- **Resolução Mínima**: 200x200 pixels
- **Resolução Recomendada**: 400x400 pixels
- **Redimensionamento Automático**: 128x128 pixels
- **Conversão Automática**: Para WebP para otimização
- **Validação de Integridade**: Verificação automática da imagem
- **Backup Automático**: Manutenção da versão anterior

**Fotos de Contatos**:
Sistema para fotos de contatos associados a produtos, mantendo qualidade original:

- **Formatos Suportados**: JPG, PNG, WebP
- **Tamanho Máximo**: 4MB por arquivo
- **Resolução Mínima**: 100x100 pixels
- **Resolução Máxima**: 4096x4096 pixels
- **Sem Redimensionamento**: Mantém resolução original
- **Otimização Automática**: Compressão para reduzir tamanho
- **Validação de Formato**: Verificação de integridade
- **Metadados**: Preservação de informações EXIF

**Imagens de Problemas/Soluções**:
Sistema para evidências visuais de problemas e soluções, com suporte a múltiplas imagens:

- **Formatos Suportados**: JPG, PNG, WebP
- **Tamanho Máximo**: 4MB por imagem
- **Máximo de Imagens**: 3 imagens por problema/solução
- **Resolução Mínima**: 200x200 pixels
- **Resolução Máxima**: 4096x4096 pixels
- **Compressão Inteligente**: Balanceamento entre qualidade e tamanho
- **Validação de Conteúdo**: Verificação de conteúdo apropriado
- **Organização Automática**: Associação automática com problema/solução

### Processo de Upload

**Método 1 - Drag & Drop**:
Interface intuitiva que permite arrastar e soltar imagens diretamente na área de upload:

1. **Arraste a Imagem**: Selecione a imagem no seu dispositivo
2. **Solte na Área**: Arraste para a área de upload destacada
3. **Aguarde Processamento**: O sistema processa automaticamente
4. **Visualize Preview**: Confira o resultado antes de confirmar
5. **Confirme Upload**: Clique em "Confirmar" para finalizar

**Método 2 - Seleção de Arquivo**:
Método tradicional de seleção através de diálogo de arquivos:

1. **Clique em "Selecionar Arquivo"**: Abre o diálogo de seleção
2. **Escolha a Imagem**: Navegue até a imagem desejada
3. **Selecione e Abra**: Confirme a seleção
4. **Aguarde Processamento**: O sistema processa automaticamente
5. **Clique em "Upload"**: Finalize o processo

**Método 3 - Upload Múltiplo**:
Para upload de múltiplas imagens simultaneamente:

1. **Selecione Múltiplas Imagens**: Use Ctrl+Click para selecionar várias
2. **Arraste para a Área**: Ou use o diálogo de seleção múltipla
3. **Aguarde Processamento**: Cada imagem é processada individualmente
4. **Revise Resultados**: Confira todas as imagens processadas
5. **Confirme Upload**: Finalize o upload de todas as imagens

### Gerenciamento de Imagens

**Visualização de Imagens**:
- **Galeria de Imagens**: Visualização em formato de galeria
- **Visualização Individual**: Visualização em tela cheia
- **Zoom e Pan**: Ferramentas de zoom para detalhes
- **Slideshow**: Visualização sequencial de imagens
- **Thumbnails**: Miniaturas para navegação rápida

**Edição e Manipulação**:
- **Recorte**: Ferramenta de recorte para ajustar enquadramento
- **Redimensionamento**: Ajuste manual de dimensões
- **Rotação**: Rotação de imagens em 90 graus
- **Filtros**: Aplicação de filtros básicos
- **Ajustes**: Brilho, contraste e saturação

**Organização e Categorização**:
- **Tags**: Sistema de tags para categorização
- **Descrições**: Adição de descrições para imagens
- **Categorias**: Organização por tipo de imagem
- **Favoritos**: Marcação de imagens importantes
- **Busca**: Sistema de busca por conteúdo visual

**Exclusão e Substituição**:
- **Exclusão Individual**: Remoção de imagens específicas
- **Exclusão em Lote**: Remoção de múltiplas imagens
- **Substituição**: Substituição de imagens existentes
- **Histórico**: Manutenção de histórico de alterações
- **Recuperação**: Possibilidade de recuperar imagens excluídas

---

## 🔒 Segurança e Controle de Acesso

### Validação Institucional

**Sistema de Domínio Obrigatório**:
O sistema implementa validação rigorosa de domínio para garantir que apenas usuários institucionais tenham acesso:

- **Validação Automática**: Verificação automática de domínio @inpe.br
- **Bloqueio de Domínios Externos**: Impedimento de cadastro com domínios externos
- **Validação em Tempo Real**: Verificação instantânea durante cadastro
- **Lista de Domínios Permitidos**: Manutenção de lista atualizada de domínios válidos
- **Validação de Email**: Verificação de existência do endereço de email

**Processo de Ativação Obrigatória**:
Sistema de segurança em duas etapas para novos usuários:

- **Criação Inativa**: Novos usuários criados como inativos por padrão
- **Ativação Administrativa**: Administradores devem ativar manualmente
- **Notificação por Email**: Usuário recebe notificação quando ativado
- **Período de Validação**: Tempo limitado para ativação
- **Auditoria de Ativação**: Registro de todas as ativações realizadas

### Controle de Sessão Avançado

**Sistema de Login Seguro**:
Implementação de múltiplas camadas de segurança para autenticação:

- **Tokens JWT**: Utilização de tokens seguros para autenticação
- **Expiração Configurável**: Tempo de expiração personalizável
- **Renovação Automática**: Renovação automática de tokens ativos
- **Validação de Integridade**: Verificação de integridade dos tokens
- **Criptografia**: Criptografia de todos os tokens

**Gerenciamento de Sessões**:
- **Múltiplas Sessões**: Suporte a múltiplas sessões simultâneas
- **Controle de Dispositivos**: Gerenciamento de dispositivos autorizados
- **Localização**: Rastreamento de localização das sessões
- **Encerramento Remoto**: Possibilidade de encerrar sessões remotamente
- **Notificações de Acesso**: Alertas para novos acessos

**Sistema de Rate Limiting**:
Proteção contra ataques de força bruta e abuso:

- **Limite de Tentativas**: Máximo 3 tentativas de login por minuto
- **Bloqueio Temporário**: Bloqueio automático após exceder limite
- **Reset Automático**: Reset automático após 1 hora
- **Escalação**: Aumento progressivo do tempo de bloqueio
- **Whitelist**: Lista de IPs confiáveis com limites relaxados

---

## 🆘 Sistema de Ajuda e Documentação

### Navegação Intuitiva na Ajuda

**Acesse**: Menu lateral → Ajuda

**Filosofia da Ajuda**:
O sistema de ajuda foi projetado para ser abrangente e acessível, fornecendo suporte completo para todos os usuários do sistema. A documentação é organizada de forma hierárquica e lógica, facilitando a navegação e localização de informações específicas.

O sistema integra documentação estática com funcionalidades dinâmicas, permitindo que usuários encontrem respostas rapidamente e contribuam para a melhoria da documentação através de feedback e sugestões.

**Estrutura Hierárquica**:
- **Visão Geral**: Introdução completa ao sistema
- **Dashboard**: Guia detalhado para uso do dashboard
- **Produtos**: Gestão completa de produtos meteorológicos
- **Projetos**: Sistema de projetos e metodologias Kanban
- **Chat**: Comunicação e colaboração em tempo real
- **Relatórios**: Geração e análise de relatórios
- **Configurações**: Personalização e configurações do sistema
- **Segurança**: Políticas e práticas de segurança

### Sistema de Busca Avançada

**Funcionalidades de Busca**:
- **Busca em Tempo Real**: Resultados instantâneos conforme digitação
- **Busca por Palavras-chave**: Localização por termos específicos
- **Busca por Categoria**: Filtros por seção da documentação
- **Busca por Dificuldade**: Filtros por nível de complexidade
- **Busca por Tipo**: Filtros por tipo de conteúdo

**Como Utilizar a Busca**:
1. **Acesse a Barra de Busca**: Localizada no topo da página de ajuda
2. **Digite Palavras-chave**: Use termos específicos relacionados ao problema
3. **Visualize Resultados**: Veja resultados em tempo real
4. **Filtre Resultados**: Use filtros para refinar a busca
5. **Clique no Resultado**: Acesse a seção relevante da documentação

**Dicas para Busca Eficaz**:
- **Use Termos Específicos**: Evite termos genéricos
- **Experimente Sinônimos**: Tente diferentes palavras para o mesmo conceito
- **Use Frases Completas**: Busque por frases específicas
- **Combine Termos**: Use múltiplas palavras-chave
- **Use Aspas**: Para busca exata de frases

### Editor de Documentação Colaborativa

**Modo de Edição**:
O sistema inclui um editor Markdown completo para edição colaborativa da documentação:

1. **Acesse o Modo de Edição**: Clique em "Editar Documentação"
2. **Use o Editor Markdown**: Interface de edição com syntax highlighting
3. **Visualize Preview**: Preview em tempo real das alterações
4. **Salve as Alterações**: Confirmação automática das mudanças
5. **Publique Alterações**: Disponibilização imediata para outros usuários

**Recursos do Editor**:
- **Syntax Highlighting**: Destaque de sintaxe para Markdown
- **Preview em Tempo Real**: Visualização instantânea das mudanças
- **Atalhos de Teclado**: Atalhos para formatação rápida
- **Validação de Sintaxe**: Verificação automática de erros
- **Histórico de Versões**: Controle de versão da documentação

**Formatação Suportada**:
- **Títulos Hierárquicos**: H1 a H6 com numeração automática
- **Texto Formatado**: Negrito, itálico, sublinhado, tachado
- **Listas**: Numeradas, com marcadores, de tarefas
- **Código**: Blocos de código com syntax highlighting
- **Tabelas**: Criação e edição de tabelas complexas
- **Links**: Links internos e externos com validação
- **Imagens**: Inserção e gerenciamento de imagens
- **Diagramas**: Suporte para diagramas Mermaid e PlantUML

---

## 🔧 Solução de Problemas e Troubleshooting

### Problemas Comuns e Soluções

**Chat não carrega mensagens**:
Problema comum relacionado à sincronização de dados:

1. **Aguarde Sincronização**: Aguarde até 5 segundos para sincronização automática
2. **Limpe Cache**: Limpe o cache do navegador (Ctrl+Shift+R)
3. **Verifique Bloqueadores**: Verifique se há bloqueadores de anúncio interferindo
4. **Modo Anônimo**: Tente acessar em modo anônimo ou outro navegador
5. **Verifique Conexão**: Confirme se há conexão estável com a internet

**Erro de permissão ao acessar páginas**:
Problema relacionado a permissões de usuário:

1. **Confirme Login**: Confirme se está logado com usuário válido
2. **Verifique Token**: Verifique se o token de sessão não expirou
3. **Renove Sessão**: Faça logout e login novamente
4. **Verifique Grupos**: Confirme se pertence aos grupos necessários
5. **Contate Suporte**: Contate suporte se o problema persistir

**Upload de imagens falha**:
Problema relacionado ao sistema de upload:

1. **Verifique Formato**: Confirme se o formato é suportado (JPG, PNG, WebP)
2. **Verifique Tamanho**: Confirme se o tamanho está dentro do limite (máx 4MB)
3. **Teste Outra Imagem**: Teste com uma imagem diferente
4. **Verifique Conexão**: Confirme se há conexão estável com a internet
5. **Verifique Permissões**: Confirme se tem permissão para upload

**Kanban não atualiza corretamente**:
Problema relacionado à interface de projetos:

1. **Atualize Página**: Atualize a página (F5) para recarregar dados
2. **Verifique Atividades**: Confirme se há atividades cadastradas no projeto
3. **Verifique Datas**: Confirme se as datas estão no formato correto
4. **Teste Navegador**: Teste em navegador atualizado
5. **Verifique JavaScript**: Confirme se JavaScript está habilitado

### Sistema de Suporte Técnico

**Canais de Suporte**:
- **Email**: suporte.silo@inpe.br
- **Telefone**: +55 12 3208-6000
- **Horário**: Segunda a Sexta, 8h às 18h
- **Chat Interno**: Sistema de chat para suporte em tempo real
- **Portal de Suporte**: Portal web com base de conhecimento

**Informações para Suporte**:
Ao solicitar suporte, forneça as seguintes informações:

- **Descrição Detalhada**: Descrição completa do problema encontrado
- **Passos para Reproduzir**: Sequência de passos que levam ao problema
- **Navegador e Versão**: Navegador utilizado e versão
- **Sistema Operacional**: Sistema operacional do dispositivo
- **Screenshots**: Capturas de tela do problema
- **Logs de Erro**: Mensagens de erro exibidas pelo sistema
- **Usuário Afetado**: Informações do usuário que encontrou o problema

---

## 📱 Responsividade e Compatibilidade

### Dispositivos Suportados

**Desktop**:
- **Resolução Mínima**: 1024x768 pixels
- **Resolução Recomendada**: 1920x1080 pixels
- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Versões**: Últimas 2 versões principais de cada navegador
- **Recursos**: Suporte completo a todas as funcionalidades

**Tablet**:
- **Resolução**: 768px a 1024px de largura
- **Interface**: Adaptada para touch e gestos
- **Navegação**: Otimizada para navegação por toque
- **Funcionalidades**: Suporte a todas as funcionalidades principais
- **Performance**: Otimizada para dispositivos móveis

**Mobile**:
- **Resolução**: 320px a 768px de largura
- **Interface**: Menu lateral colapsável
- **Botões**: Otimizados para touch
- **Navegação**: Simplificada para telas pequenas
- **Funcionalidades**: Funcionalidades principais adaptadas

### Sistema de Temas

**Alternância Automática**:
- **Detecção de Sistema**: Detecta preferência do sistema operacional
- **Alternância Automática**: Muda automaticamente entre claro/escuro
- **Salvamento de Preferência**: Salva preferência do usuário
- **Sincronização**: Sincroniza preferência entre dispositivos
- **Notificações**: Notifica sobre mudanças de tema

**Alternância Manual**:
- **Botão de Alternância**: Clique no ícone sol/lua
- **Aplicação Imediata**: Tema aplicado instantaneamente
- **Salvamento Automático**: Preferência salva automaticamente
- **Persistência**: Preferência mantida entre sessões
- **Feedback Visual**: Confirmação visual da mudança

---

*Manual do Usuário - Sistema SILO v3.0.0 - INPE/CPTEC*`

export const manualData: ManualData[] = [
	{
		productSlug: 'bam',
		description: `# Manual do Sistema BAM

## Introdução
O Sistema de Análise e Previsão Global (BAM) é o modelo numérico operacional do CPTEC para previsão meteorológica global.

## Instalação e Configuração
### Requisitos do Sistema
- Sistema Operacional: Linux (Ubuntu 18.04+ ou CentOS 7+)
- Memória RAM: Mínimo 32GB, recomendado 64GB
- Espaço em Disco: 500GB disponíveis
- Processador: Intel Xeon ou equivalente

### Dependências
- Python 3.8+
- NetCDF4 libraries
- FORTRAN compiler (gfortran)
- MPI libraries

## Utilização
### Execução Básica
\`\`\`bash
./run_bam.sh --config config/bam_operational.conf
\`\`\`

### Configurações Avançadas
O arquivo de configuração permite ajustar:
- Resolução da grade
- Período de integração
- Condições iniciais
- Parametrizações físicas`,
	},
	{
		productSlug: 'smec',
		description: `# Manual do Sistema SMEC

## Introdução
O Sistema de Meteorologia e Climatologia (SMEC) é responsável pelo processamento e análise de dados meteorológicos.

## Configuração
### Base de Dados
- PostgreSQL 12+
- Estrutura otimizada para séries temporais
- Índices específicos para consultas meteorológicas

### APIs Disponíveis
- REST API para consulta de dados
- Polling inteligente para atualizações
- GraphQL para consultas complexas`,
	},
	{
		productSlug: 'brams-ams-15km',
		description: `# Manual do BRAMS AMS 15KM

## Introdução
O Brazilian Regional Atmospheric Modeling System com resolução de 15km para a América do Sul.

## Características Técnicas
- Grade: 15km de resolução
- Domínio: América do Sul
- Níveis verticais: 42 níveis sigma
- Timestep: 60 segundos`,
	},
	{
		productSlug: 'wrf',
		description: `# Manual do Sistema WRF

## Introdução
Weather Research and Forecasting model implementado no CPTEC para simulações de alta resolução.

## Configuração
### Domínios Aninhados
- Domínio 1: 27km (América do Sul)
- Domínio 2: 9km (Brasil)
- Domínio 3: 3km (Região de interesse)`,
	},
]

// Funções auxiliares para gerar dados dinâmicos
export function generateProblems() {
	return problemTitles.slice(0, 5).map((title, index) => ({
		title,
		description: problemDescriptions[index] ? problemDescriptions[index].join('\n\n') : `Descrição detalhada do problema: ${title}`,
	}))
}

export function generateSolutions() {
	return solutionDescriptions.slice(0, 10).map((description) => ({
		description,
	}))
}

// === DADOS DO CHAT ULTRA SIMPLIFICADO ===
// Mensagens de exemplo são criadas dinamicamente no seed.ts
// Não há necessidade de dados estáticos para o novo sistema

// Atividades de exemplo para projetos - organizadas por projeto
export const projectActivitiesData = {
	// PROJETO 1: Sistema de Monitoramento Meteorológico - 6 atividades
	meteorologia: [
		{
			name: 'Análise de Requisitos do Sistema',
			description: 'Levantamento detalhado dos requisitos funcionais e não funcionais para monitoramento meteorológico em tempo real',
			category: 'Análise',
			estimatedDays: 5,
			startDate: '2024-01-15',
			endDate: '2024-01-20',
			priority: 'high',
			status: 'done',
		},
		{
			name: 'Design da Interface de Dashboards',
			description: 'Criação de mockups e protótipos para dashboards de visualização de dados meteorológicos',
			category: 'Design',
			estimatedDays: 8,
			startDate: '2024-01-21',
			endDate: '2024-01-29',
			priority: 'high',
			status: 'done',
		},
		{
			name: 'Implementação da API de Dados Meteorológicos',
			description: 'Desenvolvimento das APIs REST para coleta, processamento e disponibilização de dados meteorológicos',
			category: 'Desenvolvimento',
			estimatedDays: 15,
			startDate: '2024-01-30',
			endDate: '2024-02-14',
			priority: 'urgent',
			status: 'progress',
		},
		{
			name: 'Desenvolvimento da Interface de Visualização',
			description: 'Implementação dos componentes React para visualização de mapas, gráficos e alertas meteorológicos',
			category: 'Desenvolvimento',
			estimatedDays: 12,
			startDate: '2024-02-05',
			endDate: '2024-02-17',
			priority: 'urgent',
			status: 'progress',
		},
		{
			name: 'Sistema de Alertas Automatizados',
			description: 'Implementação do sistema de alertas automáticos baseado em thresholds meteorológicos',
			category: 'Desenvolvimento',
			estimatedDays: 10,
			startDate: '2024-02-15',
			endDate: '2024-02-25',
			priority: 'high',
			status: 'todo',
		},
		{
			name: 'Testes de Performance e Carga',
			description: 'Validação da performance do sistema com grandes volumes de dados meteorológicos',
			category: 'Testes',
			estimatedDays: 6,
			startDate: '2024-02-26',
			endDate: '2024-03-04',
			priority: 'medium',
			status: 'todo',
		},
	],

	// PROJETO 2: Migração para Nuvem INPE - 5 atividades
	clima: [
		{
			name: 'Análise de Arquitetura de Nuvem',
			description: 'Estudo da arquitetura atual e definição da estratégia de migração para infraestrutura híbrida em nuvem',
			category: 'Arquitetura',
			estimatedDays: 8,
			startDate: '2024-02-01',
			endDate: '2024-02-09',
			priority: 'urgent',
			status: 'done',
		},
		{
			name: 'Configuração de Ambiente de Nuvem',
			description: 'Setup inicial da infraestrutura em nuvem com containers, orquestração e políticas de segurança',
			category: 'Infraestrutura',
			estimatedDays: 12,
			startDate: '2024-02-10',
			endDate: '2024-02-22',
			priority: 'urgent',
			status: 'done',
		},
		{
			name: 'Migração de Aplicações Críticas',
			description: 'Migração dos sistemas críticos do CPTEC para ambiente de nuvem com zero downtime',
			category: 'Migração',
			estimatedDays: 25,
			startDate: '2024-02-15',
			endDate: '2024-03-12',
			priority: 'urgent',
			status: 'progress',
		},
		{
			name: 'Implementação de Monitoramento e Alertas',
			description: 'Sistema de monitoramento 24/7 com alertas automáticos para infraestrutura de nuvem',
			category: 'Monitoramento',
			estimatedDays: 10,
			startDate: '2024-03-01',
			endDate: '2024-03-11',
			priority: 'high',
			status: 'progress',
		},
		{
			name: 'Otimização de Custos e Performance',
			description: 'Análise e otimização dos recursos de nuvem para redução de custos e melhoria de performance',
			category: 'Otimização',
			estimatedDays: 15,
			startDate: '2024-03-13',
			endDate: '2024-03-28',
			priority: 'medium',
			status: 'todo',
		},
	],

	// PROJETO 3: Modernização da Rede de Observação - 4 atividades
	previsao: [
		{
			name: 'Avaliação de Equipamentos Obsoletos',
			description: 'Diagnóstico completo da rede atual de observação meteorológica e identificação de equipamentos a serem substituídos',
			category: 'Diagnóstico',
			estimatedDays: 10,
			startDate: '2024-03-01',
			endDate: '2024-03-11',
			priority: 'high',
			status: 'done',
		},
		{
			name: 'Especificação de Novos Sensores',
			description: 'Definição técnica e especificação de estações automáticas e sensores de última geração',
			category: 'Especificação',
			estimatedDays: 12,
			startDate: '2024-03-12',
			endDate: '2024-03-24',
			priority: 'high',
			status: 'progress',
		},
		{
			name: 'Instalação de Estações Automáticas',
			description: 'Instalação física e configuração de novas estações meteorológicas automáticas',
			category: 'Instalação',
			estimatedDays: 20,
			startDate: '2024-03-25',
			endDate: '2024-04-14',
			priority: 'medium',
			status: 'todo',
		},
		{
			name: 'Calibração e Testes de Validação',
			description: 'Calibração dos novos equipamentos e validação dos dados coletados com padrões internacionais',
			category: 'Validação',
			estimatedDays: 8,
			startDate: '2024-04-15',
			endDate: '2024-04-23',
			priority: 'high',
			status: 'todo',
		},
	],

	// PROJETO 4: Portal de Dados Abertos - 6 atividades
	portal: [
		{
			name: 'Levantamento de Requisitos Legais',
			description: 'Análise dos requisitos da Lei de Acesso à Informação e LGPD para portal de dados abertos',
			category: 'Análise',
			estimatedDays: 4,
			startDate: '2024-01-12',
			endDate: '2024-01-16',
			priority: 'high',
			status: 'done',
		},
		{
			name: 'Design UX/UI do Portal',
			description: 'Criação da experiência do usuário e interface visual focada em acessibilidade e usabilidade',
			category: 'Design',
			estimatedDays: 9,
			startDate: '2024-01-17',
			endDate: '2024-01-26',
			priority: 'high',
			status: 'done',
		},
		{
			name: 'API de Catálogo de Dados',
			description: 'Desenvolvimento da API RESTful para catalogação e busca de datasets meteorológicos',
			category: 'Desenvolvimento',
			estimatedDays: 12,
			startDate: '2024-01-27',
			endDate: '2024-02-08',
			priority: 'urgent',
			status: 'progress',
		},
		{
			name: 'Sistema de Download e Streaming',
			description: 'Implementação de sistema otimizado para download de grandes arquivos e streaming de dados',
			category: 'Desenvolvimento',
			estimatedDays: 14,
			startDate: '2024-02-05',
			endDate: '2024-02-19',
			priority: 'high',
			status: 'progress',
		},
		{
			name: 'Documentação Interativa da API',
			description: 'Criação de documentação interativa com exemplos práticos e playground para desenvolvedores',
			category: 'Documentação',
			estimatedDays: 5,
			startDate: '2024-02-20',
			endDate: '2024-02-25',
			priority: 'medium',
			status: 'todo',
		},
		{
			name: 'Testes de Segurança e Compliance',
			description: 'Auditoria de segurança e validação de compliance com regulamentações de dados governamentais',
			category: 'Segurança',
			estimatedDays: 7,
			startDate: '2024-02-26',
			endDate: '2024-03-05',
			priority: 'high',
			status: 'todo',
		},
	],

	// PROJETO 5: Sistema de Backup Distribuído - ESTE FICARÁ SEM ATIVIDADES (projeto cancelado)
	infraestrutura: [],
}
