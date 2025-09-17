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
		description: 'Infraestrutura física e de rede necessária para o funcionamento dos produtos meteorológicos. Inclui servidores, workstations, clusters de processamento e toda a conectividade de rede interna e externa.',
		children: [
			{
				name: 'Máquinas',
				icon: null,
				description: 'Hardware de computação utilizado para processamento, armazenamento e execução dos modelos meteorológicos.',
				children: [
					{
						name: 'Servidor Principal',
						icon: 'icon-[lucide--server]',
						description: 'Servidor central responsável pela coordenação dos processos, gerenciamento de dados e execução dos modelos meteorológicos. Especificações: 64GB RAM, 16 cores, 10TB armazenamento.',
					},
					{
						name: 'Workstation Linux',
						icon: 'icon-[lucide--computer]',
						description: 'Estação de trabalho Linux para desenvolvimento, testes e análise de dados meteorológicos. Configurada com ferramentas de visualização e análise científica.',
					},
					{
						name: 'Cluster de Processamento',
						icon: 'icon-[lucide--cpu]',
						description: 'Cluster de alta performance para processamento paralelo de modelos meteorológicos. Composto por múltiplos nós de computação com processadores de alta frequência.',
					},
				],
			},
			{
				name: 'Redes internas',
				icon: null,
				description: 'Infraestrutura de rede interna do INPE/CPTEC para comunicação entre equipamentos e sistemas.',
				children: [
					{
						name: 'Rede CPTEC',
						icon: 'icon-[lucide--network]',
						description: 'Rede principal do CPTEC com alta disponibilidade e redundância. Fornece conectividade entre todos os sistemas meteorológicos e bancos de dados.',
					},
					{
						name: 'Rede Laboratório',
						icon: 'icon-[lucide--network]',
						description: 'Rede dedicada para laboratórios de pesquisa e desenvolvimento. Isolada da rede principal para testes e experimentos.',
					},
				],
			},
			{
				name: 'Redes externas',
				icon: null,
				description: 'Conectividade externa necessária para recebimento de dados meteorológicos, comunicação com outros centros e acesso à internet.',
				children: [
					{
						name: 'Internet INPE',
						icon: 'icon-[lucide--globe]',
						description: 'Conexão principal de internet do INPE com alta velocidade e redundância. Utilizada para download de dados meteorológicos globais e comunicação com centros internacionais.',
					},
					{
						name: 'VPN Científica',
						icon: 'icon-[lucide--shield]',
						description: 'Rede privada virtual para comunicação segura com outros centros de pesquisa meteorológica e acesso a dados restritos.',
					},
				],
			},
		],
	},
	{
		name: 'Dependências',
		icon: null,
		description: 'Dependências de software, sistemas e recursos humanos necessários para o funcionamento e manutenção dos produtos meteorológicos.',
		children: [
			{
				name: 'Sistema',
				icon: null,
				description: 'Dependências de software e sistemas operacionais necessários para execução dos modelos e processamento de dados.',
				children: [
					{
						name: 'Hosts',
						icon: null,
						description: 'Máquinas específicas que hospedam os sistemas e executam os modelos meteorológicos.',
						children: [
							{
								name: 'met01.cptec.inpe.br',
								icon: 'icon-[lucide--computer]',
								description: 'Servidor principal de meteorologia do CPTEC. Responsável pela execução dos modelos de previsão numérica do tempo e processamento de dados observacionais.',
							},
							{
								name: 'model02.cptec.inpe.br',
								icon: 'icon-[lucide--computer]',
								description: 'Servidor secundário para backup e processamento paralelo. Utilizado para execução de modelos de alta resolução e simulações experimentais.',
							},
						],
					},
					{
						name: 'Softwares',
						icon: null,
						description: 'Aplicações e bibliotecas de software necessárias para processamento, análise e visualização de dados meteorológicos.',
						children: [
							{
								name: 'Python 3.9+',
								icon: 'icon-[lucide--code]',
								description: 'Linguagem de programação principal para scripts de processamento, análise de dados e automação de tarefas meteorológicas. Versão mínima 3.9 para compatibilidade com bibliotecas científicas.',
							},
							{
								name: 'NetCDF4',
								icon: 'icon-[lucide--database]',
								description: 'Biblioteca para leitura e escrita de arquivos NetCDF, formato padrão para dados meteorológicos e climáticos. Essencial para manipulação de dados de modelos numéricos.',
							},
							{
								name: 'GrADS',
								icon: 'icon-[lucide--bar-chart]',
								description: 'Sistema de análise e visualização de dados geofísicos. Utilizado para criação de mapas meteorológicos, gráficos e análises estatísticas de dados atmosféricos.',
							},
						],
					},
				],
			},
			{
				name: 'Recursos humanos',
				icon: null,
				description: 'Pessoas responsáveis pelo desenvolvimento, manutenção e suporte dos sistemas meteorológicos.',
				children: [
					{
						name: 'Responsáveis técnicos do INPE',
						icon: null,
						description: 'Especialistas técnicos do INPE responsáveis pelo desenvolvimento e manutenção dos sistemas meteorológicos.',
						children: [
							{
								name: 'João Silva',
								icon: 'icon-[lucide--user-round]',
								description: 'Engenheiro de Sistemas especializado em meteorologia computacional. Responsável pela manutenção dos modelos numéricos e otimização de performance.',
							},
							{
								name: 'Maria Santos',
								icon: 'icon-[lucide--user-round]',
								description: 'Cientista da Computação com doutorado em Meteorologia. Especialista em processamento de dados atmosféricos e desenvolvimento de algoritmos de previsão.',
							},
						],
					},
					{
						name: 'Suporte',
						icon: null,
						description: 'Equipe de suporte técnico responsável pela operação e resolução de problemas dos sistemas meteorológicos.',
						children: [
							{
								name: 'Carlos Tech',
								icon: 'icon-[lucide--headphones]',
								description: 'Técnico de suporte especializado em sistemas Linux e redes. Responsável pela manutenção preventiva e resolução de problemas de infraestrutura.',
							},
							{
								name: 'Ana Support',
								icon: 'icon-[lucide--headphones]',
								description: 'Analista de sistemas com experiência em meteorologia operacional. Responsável pelo monitoramento 24/7 e suporte aos usuários dos sistemas.',
							},
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

## 🎯 Visão Geral
O Sistema SILO é uma plataforma web avançada desenvolvida especificamente para o gerenciamento de produtos meteorológicos do INPE/CPTEC. O sistema centraliza o monitoramento, controle e colaboração em torno dos principais modelos meteorológicos operacionais: BAM (Modelo Global), SMEC (Sistema de Meteorologia), BRAMS AMS 15KM (Modelo Regional) e WRF (Weather Research and Forecasting).

A plataforma oferece uma interface unificada que permite aos meteorologistas, pesquisadores e operadores acompanhar em tempo real o status de execução dos modelos, identificar problemas rapidamente e colaborar na resolução de questões técnicas. O sistema integra funcionalidades de dashboard, gestão de projetos, comunicação em tempo real e base de conhecimento, proporcionando um ambiente completo para operação meteorológica.

O SILO foi desenvolvido com foco na segurança institucional, utilizando autenticação baseada em domínio @inpe.br e sistema de ativação obrigatória por administradores. A arquitetura modular permite escalabilidade e adaptação às necessidades específicas do CPTEC/INPE, garantindo conformidade com os requisitos de segurança e operação institucional.

## 🏠 Acesso
O acesso ao sistema SILO é restrito exclusivamente a usuários com email institucional @inpe.br, garantindo a segurança e conformidade com as políticas do CPTEC/INPE. A URL oficial do sistema é https://silo.inpe.br, onde os usuários podem realizar login utilizando suas credenciais institucionais.

O sistema oferece múltiplas opções de autenticação para maior flexibilidade: login tradicional com email e senha, login simplificado apenas com email (recebendo código OTP por email), e integração com Google OAuth para usuários que preferem autenticação social. Todas as opções mantêm a validação rigorosa do domínio @inpe.br.

Após o cadastro inicial, todos os novos usuários são criados com status inativo por padrão, sendo necessária a ativação manual por um administrador do sistema. Esta política de segurança garante que apenas usuários autorizados tenham acesso ao sistema, alinhando-se com os requisitos de segurança institucional do CPTEC/INPE.

## 📊 Dashboard
O Dashboard é o centro de controle do sistema SILO, oferecendo uma visão consolidada e em tempo real de todos os produtos meteorológicos operacionais. A interface principal apresenta uma timeline de 28 dias que permite acompanhar o histórico de execução de cada modelo, identificando padrões, problemas recorrentes e tendências de performance.

Os gráficos interativos utilizam a biblioteca ApexCharts para apresentar métricas de disponibilidade, distribuição de problemas por categoria, performance da equipe e estatísticas de resolução. Cada gráfico é responsivo e adapta-se automaticamente ao tema dark/light selecionado pelo usuário, proporcionando uma experiência visual consistente.

O sistema de cores padronizado utiliza uma hierarquia visual clara: vermelho para problemas críticos, laranja para execuções que precisam ser refeitas, amarelo para falhas de execução, violeta para situações sob intervenção técnica, azul para execuções suspensas, cinza para processamento em andamento, transparente para aguardando execução, e verde para execuções bem-sucedidas.

A atualização automática dos dados garante que as informações apresentadas estejam sempre atualizadas, enquanto os filtros de data e período permitem análises históricas detalhadas. O dashboard também inclui alertas visuais para situações críticas que requerem atenção imediata da equipe técnica.

## 📦 Produtos
O módulo de Produtos é o núcleo operacional do sistema SILO, gerenciando os quatro principais modelos meteorológicos do CPTEC/INPE. Cada produto possui características específicas de execução, incluindo turnos de processamento, prioridades operacionais e dependências técnicas que influenciam o planejamento e monitoramento.

O **BAM (Brazilian Atmospheric Model)** é o modelo global operacional executado no turno 0 (meia-noite), sendo fundamental para previsões de longo prazo e análises climáticas. O **SMEC (Sistema de Meteorologia e Climatologia)** opera nos turnos 0 e 12, fornecendo dados essenciais para operação meteorológica diária. O **BRAMS AMS 15KM** é o modelo regional de alta resolução executado nos turnos 0, 6, 12 e 18, oferecendo previsões detalhadas para a América do Sul. O **WRF (Weather Research and Forecasting)** complementa os outros modelos com simulações de alta resolução nos mesmos turnos do BRAMS.

Cada produto possui um sistema de status detalhado que reflete o estado atual da execução: **Concluído** indica execução bem-sucedida, **Pendente** significa aguardando execução, **Em execução** mostra processamento em andamento, **Sob intervenção** indica suporte técnico ativo, **Suspenso** representa execução pausada, **Não rodou** indica falha na execução, e **Com problemas** sinaliza execução com inconsistências que requerem investigação.

O sistema permite associação de contatos técnicos específicos para cada produto, facilitando a comunicação direta com responsáveis especializados. Além disso, cada produto possui um manual técnico editável em Markdown, documentação de dependências hierárquicas e histórico completo de problemas e soluções implementadas.

## 🚀 Projetos
O módulo de Projetos oferece uma plataforma completa para gestão de iniciativas científicas e técnicas do CPTEC/INPE. O sistema utiliza metodologia Kanban para organizar atividades em colunas de status (A Fazer, Em Progresso, Bloqueado, Em Revisão, Concluído), proporcionando visibilidade clara do progresso e facilitando a colaboração entre equipes.

Cada projeto pode conter múltiplas atividades, que por sua vez são divididas em tarefas específicas. O sistema de drag-and-drop permite reorganização intuitiva das tarefas entre diferentes status, enquanto estimativas de tempo e datas de início/fim ajudam no planejamento e controle de prazos. As atividades são categorizadas por tipo (Análise, Desenvolvimento, Testes, etc.) e priorizadas conforme a criticidade.

O sistema gera estatísticas automáticas de progresso, incluindo percentual de conclusão, tempo estimado vs. real, distribuição de tarefas por status e performance da equipe. Os gráficos de acompanhamento permitem identificar gargalos, atrasos e oportunidades de otimização do fluxo de trabalho.

A integração com o sistema de chat permite comunicação contextual dentro de cada projeto, enquanto a associação com produtos meteorológicos facilita o rastreamento de iniciativas relacionadas a melhorias operacionais específicas.

## 👥 Grupos
O sistema de Grupos implementa uma arquitetura de permissões hierárquica que organiza os usuários conforme suas funções e responsabilidades no CPTEC/INPE. Cada grupo possui características específicas de acesso, limites de usuários e funcionalidades disponíveis, garantindo segurança e organização adequada.

O grupo **Administradores** possui acesso completo ao sistema, incluindo gestão de usuários, configurações avançadas e relatórios administrativos. Os **Meteorologistas** têm acesso privilegiado à gestão de produtos, podendo criar, editar e monitorar execuções dos modelos meteorológicos. Os **Pesquisadores** possuem acesso focado em dados e análises, podendo consultar informações históricas e gerar relatórios científicos.

Os **Operadores** são responsáveis pela execução e monitoramento dos sistemas, tendo acesso a dashboards operacionais e ferramentas de controle. O grupo **Suporte** possui acesso limitado focado em resolução de problemas técnicos e atendimento aos usuários. Os **Visitantes** têm acesso restrito para consulta de informações públicas e documentação básica.

O sistema permite que usuários pertençam a múltiplos grupos simultaneamente, com permissões acumulativas. Cada grupo possui ícone distintivo, cor de identificação e limite máximo de usuários configurável. A gestão de grupos é centralizada na interface administrativa, permitindo criação, edição e exclusão conforme necessidades organizacionais.

## 💬 Chat
O sistema de Chat implementa uma plataforma de comunicação em tempo real inspirada no WhatsApp, oferecendo funcionalidades avançadas para colaboração entre equipes do CPTEC/INPE. A interface suporta conversas em grupos específicos e mensagens diretas entre usuários, facilitando a comunicação contextual e resolução rápida de problemas.

O sistema de presença mostra o status atual de cada usuário (Online, Ausente, Ocupado, Offline), permitindo que a equipe saiba quando colegas estão disponíveis para comunicação. O emoji picker integrado oferece mais de 6 categorias de emojis com funcionalidade de busca, enriquecendo a comunicação e expressão das mensagens.

As notificações em tempo real garantem que mensagens importantes sejam recebidas imediatamente, enquanto o sistema de polling inteligente otimiza o consumo de recursos, sincronizando apenas quando necessário. O histórico de mensagens é preservado com paginação automática, permitindo consulta de conversas anteriores.

O chat pode ser ativado ou desativado individualmente por cada usuário através das configurações, reduzindo consumo de banco de dados quando não necessário. A integração com grupos de usuários permite criação de salas específicas por departamento, projeto ou função, facilitando a organização da comunicação institucional.

## ⚙️ Configurações
O módulo de Configurações oferece controle completo sobre preferências pessoais e configurações de conta do usuário. A interface unificada organiza todas as opções em seções lógicas: Perfil (dados pessoais), Preferências (comportamento do sistema) e Segurança (senhas e autenticação).

Na seção de Perfil, os usuários podem editar informações pessoais, fazer upload de foto de avatar com otimização automática, e atualizar dados de contato. O sistema de upload local garante segurança institucional, processando imagens automaticamente para formato WebP com redimensionamento otimizado.

As Preferências incluem configurações de tema (dark/light), notificações por email, controle de chat (ativar/desativar), e configurações de interface. Todas as alterações são salvas automaticamente, proporcionando experiência personalizada e consistente em todas as sessões.

A seção de Segurança permite alteração de senha com validações rigorosas, configuração de autenticação de dois fatores, e visualização de sessões ativas. O sistema mantém histórico de alterações de segurança e envia notificações por email para mudanças críticas, garantindo transparência e controle sobre a conta do usuário.

## 🔧 Suporte
O sistema de Suporte integra múltiplas funcionalidades para assistência técnica e base de conhecimento. A documentação hierárquica organiza informações em seções navegáveis, permitindo busca rápida por tópicos específicos e acesso contextual a manuais técnicos.

A base de conhecimento é editável em tempo real através de editor Markdown integrado, permitindo que especialistas atualizem documentação conforme evolução dos sistemas. O sistema de busca inteligente localiza conteúdo por palavras-chave, facilitando descoberta de informações relevantes.

O chat de suporte oferece comunicação direta com equipe técnica especializada, enquanto o sistema de problemas permite criação de tickets estruturados com categorização automática e acompanhamento de status. Cada problema pode ser associado a produtos específicos e contatos técnicos responsáveis.

Os manuais específicos de cada produto meteorológico são acessíveis diretamente do módulo de Produtos, oferecendo documentação técnica detalhada sobre instalação, configuração, utilização e troubleshooting. O sistema mantém histórico de alterações na documentação, permitindo rastreamento de evolução e colaboração entre especialistas.

----

*Manual do Usuário do Sistema SILO - CPTEC/INPE*`

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
