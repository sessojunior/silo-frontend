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

export const helpDocumentation = `# 📚 Sistema de Gestão SILO - Documentação Completa

## 🎯 Visão Geral do Sistema

O Sistema SILO é uma plataforma integrada de gestão desenvolvida especificamente para o INPE/CPTEC, focada na administração de produtos meteorológicos, projetos científicos e colaboração entre equipes. Atualmente está em **95% de conclusão** e **100% testado** com 148 testes automatizados passando com sucesso.

### 🔧 Funcionalidades Principais Implementadas

- **✅ Gestão de Produtos**: Catálogo completo com problemas, soluções e dependências
- **✅ Base de Conhecimento**: Sistema colaborativo de problemas e soluções
- **✅ Sistema de Projetos**: Kanban, atividades e tarefas com interface moderna
- **✅ Chat Institucional**: Comunicação em tempo real com presença e emojis
- **✅ Administração Avançada**: Gestão de usuários, grupos e permissões
- **✅ Dashboard e Relatórios**: Gráficos ApexCharts com modo dark/light
- **✅ Sistema de Upload**: Integração UploadThing v7 para imagens
- **✅ Segurança Institucional**: Validação @inpe.br e ativação obrigatória

---

## 📦 Gestão de Produtos - 100% IMPLEMENTADO

### Cadastro e Manutenção
- **Produtos Meteorológicos**: BAM, SMEC, BRAMS, WRF com documentação técnica
- **Sistema de Problemas**: Registro colaborativo com categorias (Rede, Servidor, Software, etc.)
- **Sistema de Soluções**: Respostas da comunidade com validação e histórico
- **Dependências Tecnológicas**: Mapeamento visual hierárquico com drag & drop
- **Contatos Responsáveis**: Especialistas associados a cada produto
- **Manuais Técnicos**: Editor Markdown integrado para documentação

### Base de Conhecimento Ativa
- **Problemas Categorizados**: 6 categorias padrão implementadas
- **Soluções Validadas**: Sistema de marcação como resolvido
- **Histórico Completo**: Tracking de todas as interações
- **Busca Inteligente**: Filtros por produto, categoria e status
- **Upload de Imagens**: Até 3 imagens por problema/solução

---

## 🚀 Sistema de Projetos - 100% IMPLEMENTADO

### Gerenciamento Avançado
- **Visão Kanban**: 5 colunas com drag & drop (Todo, In Progress, Blocked, Review, Done)
- **Atividades por Projeto**: CRUD completo com estimativas e datas
- **Sistema de Tarefas**: Formulários avançados com validações
- **Membros e Papéis**: Atribuição de responsabilidades
- **Progresso Visual**: Indicadores de status e prioridade
- **Modo Dark 100%**: Interface completamente adaptada para tema escuro

### Configurações Kanban
- **Colunas Personalizáveis**: Cores específicas para cada status
- **Drag & Drop**: Movimentação intuitiva entre colunas
- **Validações**: Prevenção de estados inválidos
- **Responsividade**: Interface adaptada para mobile e desktop

---

## 💬 Sistema de Chat - 100% IMPLEMENTADO

### Conversas Organizadas
- **Grupos Institucionais**: 6 grupos padrão (Administradores, Meteorologistas, Pesquisadores, Operadores, Suporte, Visitantes)
- **Conversas Privadas**: Comunicação direta entre usuários
- **Status de Presença**: 4 estados (Online, Ausente, Ocupado, Offline)
- **Sincronização Inteligente**: Polling a cada 5 segundos

### Funcionalidades Avançadas
- **Emoji Picker**: 6 categorias com busca e inserção
- **Histórico Completo**: Mensagens persistentes com paginação
- **Notificações**: Contadores de mensagens não lidas
- **Exclusão Segura**: Usuários podem deletar mensagens em 24h
- **Interface Responsiva**: Adaptada para todos os dispositivos

---

## 📊 Dashboard e Relatórios - 100% IMPLEMENTADO

### Métricas em Tempo Real
- **Estatísticas Principais**: Produtos, problemas, soluções, projetos
- **Gráficos ApexCharts**: Donut, coluna, linha e área
- **Filtros Avançados**: Por período, produto e categoria
- **Modo Dark/Light**: Interface completamente adaptada
- **Responsividade**: Layout adaptativo para mobile/desktop

### Relatórios Especializados
- **Disponibilidade por Produto**: Métricas de uptime e atividades
- **Problemas Frequentes**: Análise por categoria e tempo de resolução
- **Performance da Equipe**: Produtividade por usuário
- **KPIs Executivos**: Visão consolidada para gestão
- **Exportação**: Interface para PDF, Excel e CSV

---

## 👥 Administração do Sistema - 100% IMPLEMENTADO

### Gestão de Usuários
- **Cadastro Seguro**: Validação obrigatória de domínio @inpe.br
- **Ativação Obrigatória**: Novos usuários criados como inativos
- **Perfis Completos**: Dados pessoais, preferências e foto
- **Sistema de Grupos**: Relacionamento many-to-many
- **Permissões Hierárquicas**: Controle de acesso por grupo

### Grupos Organizacionais
- **Administradores**: Acesso completo ao sistema
- **Meteorologistas**: Especialistas em previsão do tempo
- **Pesquisadores**: Cientistas e acadêmicos
- **Operadores**: Responsáveis por sistemas críticos
- **Suporte**: Equipe de atendimento técnico
- **Visitantes**: Usuários externos com acesso limitado

### Configurações Avançadas
- **Temas Automáticos**: Claro/Escuro com detecção automática
- **Upload de Fotos**: Sistema integrado com redimensionamento
- **Preferências Individuais**: Notificações e configurações personalizadas
- **Segurança**: Alteração de senha com validações

---

## 🔧 Sistema de Upload - 100% IMPLEMENTADO

### UploadThing v7 Integrado
- **Avatar de Usuário**: Redimensionamento automático para 128x128 WebP
- **Fotos de Contatos**: Até 4MB com validação de formato
- **Imagens de Problemas**: Até 3 imagens por problema/solução
- **Gerenciamento**: Upload, visualização e exclusão
- **Formato Otimizado**: Conversão automática para WebP

### ⚠️ Migração Pendente para Produção
- **OBJETIVO**: Substituir UploadThing por servidor local do CPTEC/INPE
- **MOTIVO**: Segurança institucional e controle total sobre dados
- **IMPACTO**: Necessário refatorar componentes e APIs

---

## 🔒 Segurança Institucional - 100% IMPLEMENTADO

### Validações de Segurança
- **Domínio @inpe.br**: Apenas usuários institucionais podem se cadastrar
- **Ativação Obrigatória**: Administradores devem ativar novos usuários
- **Sessões Seguras**: Tokens JWT com expiração configurável
- **Rate Limiting**: 3 tentativas de login por minuto
- **Validação em Camadas**: Frontend, API e banco de dados

### Políticas de Acesso
- **Usuários Inativos**: Não podem acessar o sistema até ativação
- **Verificação de Permissões**: Todas as rotas protegidas
- **Auditoria**: Log de todas as ações administrativas
- **Backup Automático**: Dados críticos protegidos

---

## 🧪 Sistema de Testes - 100% IMPLEMENTADO

### Cobertura Completa
- **Total de Testes**: 148 PASSED ✅ (100% de sucesso)
- **Tempo de Execução**: 25.4 minutos
- **Zero Falhas**: 0 FAILED ❌
- **Cobertura**: Todas as funcionalidades testadas

### Testes Validados
1. **Sistema de Autenticação**: Login, OAuth, recuperação senha
2. **Dashboard e Gráficos**: ApexCharts, responsividade, dark mode
3. **Sistema de Produtos**: CRUD, problemas, soluções, dependências
4. **Sistema de Projetos**: Kanban, atividades, tarefas
5. **Sistema de Chat**: Mensagens, presença, emojis
6. **Sistema de Contatos**: CRUD, upload fotos, associações
7. **Grupos e Usuários**: Relacionamentos, permissões
8. **Configurações**: Perfil, preferências, segurança
9. **Sistema de Ajuda**: Navegação, edição markdown
10. **Integração**: Performance, mobile, navegadores

---

## 🚀 Próximas Implementações Prioritárias

### 1. Migração de Infraestrutura para Produção CPTEC/INPE

**Banco de Dados**:
- **ATUAL**: Banco Neon na nuvem (teste)
- **OBJETIVO**: Migrar para servidor PostgreSQL do CPTEC/INPE
- **AÇÕES NECESSÁRIAS**:
  - Configurar conexão com servidor PostgreSQL do CPTEC
  - Migrar schema e dados de teste
  - Ajustar variáveis de ambiente
  - Testar conectividade e performance

**Sistema de Imagens**:
- **ATUAL**: UploadThing v7 (serviço externo)
- **OBJETIVO**: Migrar para servidor local do CPTEC/INPE
- **AÇÕES NECESSÁRIAS**:
  - Implementar servidor de upload local
  - Migrar componentes de upload
  - Atualizar APIs para aceitar uploads locais
  - Implementar sistema de armazenamento seguro

### 2. Implementação de Dados Reais de Produção

- **Produtos Meteorológicos**: Cadastro de produtos reais do CPTEC
- **Usuários da Equipe**: Migração de dados de teste para produção
- **Histórico Existente**: Importação de problemas e soluções históricas
- **Configuração de Grupos**: Definição de permissões por departamento
- **Contatos Reais**: Responsáveis por cada produto meteorológico

### 3. Sistemas Automáticos de Coleta de Dados

- **Integração CPTEC**: Conexão com sistemas de produtos meteorológicos
- **Monitoramento Automático**: Status de execução em tempo real
- **Alertas Inteligentes**: Notificações para falhas e problemas
- **Dashboard Tempo Real**: Atualização automática de métricas
- **Relatórios Automáticos**: Geração e envio programados

---

## 🔧 Troubleshooting

### Problemas Comuns

#### Chat não carrega mensagens
1. Aguarde até 5 segundos para sincronização automática
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Verifique se há bloqueadores de anúncio interferindo
4. Tente acessar em modo anônimo ou outro navegador

#### Erro de permissão ao acessar páginas admin
1. Confirme se está logado com usuário administrador
2. Verifique se o token de sessão não expirou
3. Faça logout e login novamente
4. Contate suporte se persistir

#### Mensagens de chat não sincronizam
1. Aguarde 5 segundos para sincronização automática
2. Verifique se o status de presença está correto
3. Confirme se há conexão com o servidor
4. Recarregue a página se o problema persistir

#### Gantt não exibe corretamente
1. Atualize a página (F5)
2. Verifique se há atividades cadastradas no projeto
3. Confirme se as datas estão no formato correto
4. Teste em navegador atualizado

### Performance
- **Otimização**: Sistema otimizado para até 200 usuários simultâneos
- **Polling Eficiente**: Atualizações a cada 5 segundos com timestamps
- **Queries Otimizadas**: Índices específicos para chat em PostgreSQL
- **Cache Inteligente**: Cache de mensagens recentes no frontend

---

## 📞 Suporte Técnico

### Contatos Principais
- **Email**: suporte.silo@inpe.br
- **Telefone**: +55 12 3208-6000
- **Horário**: Segunda a Sexta, 8h às 18h

### Documentação Adicional
- [Manual do Usuário Completo](https://docs.silo.inpe.br)
- [API Reference](https://api.silo.inpe.br/docs)
- [Changelog](https://github.com/inpe/silo/releases)
- [FAQ](https://docs.silo.inpe.br/faq)

---

## 🔄 Atualizações e Versioning

### Sistema de Versionamento
- **Major**: Mudanças significativas de arquitetura
- **Minor**: Novas funcionalidades sem breaking changes
- **Patch**: Correções de bugs e melhorias menores

### Status Atual
- **Versão**: 3.0.0 (Production Ready)
- **Progresso**: 95% implementado
- **Testes**: 148/148 passando (100%)
- **Próxima Fase**: Migração para produção CPTEC/INPE

---

## 📊 Métricas do Sistema

### Funcionalidades Implementadas
- **Sistemas Principais**: 13 de 16 (81.25%)
- **APIs**: 100% funcionais
- **Componentes UI**: 100% responsivos
- **Modo Dark**: 100% implementado
- **Testes**: 100% passando

### Próximas Prioridades
1. **Migração Infraestrutura**: Banco e upload para servidor CPTEC
2. **Dados de Produção**: Substituir dados de teste por dados reais
3. **Sistemas Automáticos**: Coleta automática de dados meteorológicos
4. **Notificações Avançadas**: Email e push notifications

---

*Documentação mantida pela equipe de desenvolvimento SILO - INPE/CPTEC*`

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
