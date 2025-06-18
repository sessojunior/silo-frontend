import * as schema from '@/lib/db/schema'

// === TIPAGENS DO SCHEMA ===
export type ProductData = Pick<typeof schema.product.$inferInsert, 'name' | 'slug'>
export type GroupData = Omit<typeof schema.group.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
export type ContactData = Omit<typeof schema.contact.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
export type TestUserData = Pick<typeof schema.authUser.$inferInsert, 'name' | 'email' | 'password' | 'emailVerified' | 'isActive'> & { groupName: string }
export type ProjectData = Omit<typeof schema.project.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
export type ManualData = { productSlug: string; description: string }

export interface DependencyItem {
	name: string
	icon: string | null
	description?: string
	children?: DependencyItem[]
}

// === DADOS BÁSICOS ===
export const products: ProductData[] = [
	{ name: 'BAM', slug: 'bam' },
	{ name: 'SMEC', slug: 'smec' },
	{ name: 'BRAMS AMS 15KM', slug: 'brams-ams-15km' },
	{ name: 'WRF', slug: 'wrf' },
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

O Sistema SILO é uma plataforma integrada de gestão desenvolvida especificamente para o INPE/CPTEC, focada na administração de produtos meteorológicos, projetos científicos e colaboração entre equipes.

### 🔧 Funcionalidades Principais

- **Gestão de Produtos**: Catálogo completo de produtos meteorológicos (BAM, SMEC, BRAMS, WRF)
- **Base de Conhecimento**: Documentação técnica, problemas conhecidos e soluções
- **Sistema de Projetos**: Acompanhamento de projetos com Kanban e Gantt integrados
- **Chat Institucional**: Comunicação em tempo real entre equipes
- **Administração Avançada**: Gestão de usuários, grupos e permissões

---

## 📦 Gestão de Produtos

### Cadastro e Manutenção
- Produtos organizados por categoria e disponibilidade
- Documentação técnica integrada em Markdown
- Sistema hierárquico de dependências tecnológicas
- Registro de problemas e soluções da comunidade

### Base de Conhecimento
- **Problemas**: Registro colaborativo de issues técnicas
- **Soluções**: Respostas da comunidade com sistema de validação
- **Dependências**: Mapeamento visual de tecnologias e recursos necessários
- **Contatos**: Especialistas responsáveis por cada produto

---

## 🚀 Sistema de Projetos

### Gerenciamento Avançado
- **Visão Kanban**: Quadros personalizáveis com regras de WIP
- **Cronograma Gantt**: Timeline visual com dependências entre tarefas
- **Membros**: Sistema de atribuição e papéis por projeto
- **Atividades**: Tracking detalhado de progresso e responsabilidades

### Configurações Kanban
- Colunas personalizáveis com cores e ícones
- Limites WIP (Work in Progress) configuráveis
- Regras automáticas de transição
- Notificações de limite atingido

---

## 💬 Sistema de Chat

### Canais Organizados
- **Canais por Grupo**: Baseados na estrutura organizacional
- **Mensagens Diretas**: Comunicação privada entre membros
- **Status de Presença**: Indicadores de disponibilidade em tempo real
- **Histórico Completo**: Busca avançada em conversas anteriores

### Funcionalidades Avançadas
- Upload de arquivos (imagens, documentos, áudio)
- Emoji picker com categorias organizadas
- Status de leitura (✓✓ estilo WhatsApp)
- Typing indicators em tempo real
- Notificações push configuráveis

---

## 👥 Administração do Sistema

### Gestão de Usuários
- Cadastro com perfis detalhados
- Sistema de grupos e permissões
- Preferências individuais de notificação
- Upload de foto de perfil

### Grupos Organizacionais
- **Administradores**: Acesso completo ao sistema
- **Meteorologistas**: Especialistas em previsão do tempo
- **Pesquisadores**: Cientistas e acadêmicos
- **Operadores**: Responsáveis por sistemas críticos
- **Suporte**: Equipe de atendimento técnico
- **Visitantes**: Usuários externos com acesso limitado

### Configurações Gerais
- Temas (Claro/Escuro) com alternância automática
- Notificações por email configuráveis
- Configurações de segurança e privacidade
- Backup automático de dados críticos

---

## 🔧 Troubleshooting

### Problemas Comuns

#### Chat não carrega mensagens
1. Verifique a conexão WebSocket no console do navegador
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Verifique se há bloqueadores de anúncio interferindo
4. Tente acessar em modo anônimo

#### Erro de permissão ao acessar páginas admin
1. Confirme se está logado com usuário administrador
2. Verifique se o token de sessão não expirou
3. Faça logout e login novamente
4. Contate suporte se persistir

#### Upload de arquivos falha
1. Verifique se o arquivo é menor que 10MB
2. Confirme se o formato é suportado
3. Verifique espaço em disco no servidor
4. Tente renomear o arquivo removendo caracteres especiais

#### Gantt não exibe corretamente
1. Atualize a página (F5)
2. Verifique se há atividades cadastradas no projeto
3. Confirme se as datas estão no formato correto
4. Teste em navegador atualizado

### Performance
- **Otimização**: Sistema otimizado para até 1000 usuários simultâneos
- **Cache**: Dados críticos mantidos em cache Redis
- **CDN**: Assets estáticos servidos via CDN
- **Monitoramento**: Logs detalhados para análise de performance

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

### Última Atualização
- **Versão**: 2.1.0
- **Data**: Janeiro 2024
- **Principais Mudanças**: Sistema de projetos com Kanban/Gantt, chat em tempo real

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
- WebSocket para dados em tempo real
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

// Mensagens de exemplo para o chat
export const exampleChatMessages = ['🎉 Olá pessoal! Bem-vindos ao canal!', 'Sistema de chat funcionando perfeitamente! 🚀', 'Que bom ter todos vocês aqui. Vamos começar a colaborar! 💪', 'Este canal vai ser muito útil para nossa equipe! 👥', 'Alguém pode me ajudar com uma dúvida técnica?', 'Acabei de atualizar a documentação do projeto 📝', 'Reunião hoje às 14h, não esqueçam! ⏰', 'Parabéns pelo excelente trabalho na sprint passada! 👏']
