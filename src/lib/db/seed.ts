import 'dotenv/config'
import { randomUUID } from 'crypto'

import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth/hash'

const products = [
	{ name: 'BAM', slug: 'bam' },
	{ name: 'SMEC', slug: 'smec' },
	{ name: 'BRAMS AMS 15KM', slug: 'brams-ams-15km' },
	{ name: 'WRF', slug: 'wrf' },
]

const problemTitles = ['Erro ao processar dados meteorológicos', 'Falha na importação de arquivos', 'Inconsistência nos resultados do modelo', 'Problema de performance em simulações longas', 'Dificuldade na configuração inicial', 'Erro de permissão ao acessar diretórios', 'Resultados divergentes entre execuções', 'Interface gráfica não carrega corretamente', 'Logs não estão sendo salvos', 'Parâmetros de entrada não reconhecidos', 'Erro ao exportar resultados', 'Timeout durante execução do modelo', 'Falha ao conectar com serviço externo', 'Dados de entrada corrompidos', 'Problema de compatibilidade com sistema operacional', 'Erro de memória insuficiente', 'Falha ao atualizar dependências', 'Problema ao gerar gráficos', 'Erro ao validar parâmetros', 'Dificuldade para acessar manual do usuário']

const problemDescriptions = [
	['Ao tentar processar os dados meteorológicos, o sistema apresenta uma mensagem de erro indicando falha na leitura dos arquivos. Isso geralmente ocorre quando os dados estão em um formato inesperado ou corrompido.', 'Além disso, arquivos muito grandes podem causar estouro de memória, especialmente em ambientes com recursos limitados.', 'Recomenda-se validar os arquivos antes de iniciar o processamento e garantir que estejam de acordo com o padrão exigido pelo sistema.', 'Caso o erro persista, consulte os logs detalhados para identificar a linha exata do problema e, se necessário, entre em contato com o suporte técnico.'],
	['Durante a importação de arquivos, o sistema pode não reconhecer determinados formatos ou encontrar permissões insuficientes para leitura.', 'É importante garantir que os arquivos estejam no diretório correto e que o usuário do sistema tenha acesso de leitura.', 'Falhas silenciosas podem ocorrer se o nome do arquivo contiver caracteres especiais ou espaços em branco no final.', 'Verifique também se não há arquivos duplicados, pois isso pode causar conflitos durante a importação.'],
	['Os resultados do modelo variam entre execuções, mesmo quando os parâmetros de entrada permanecem inalterados.', 'Essa inconsistência pode ser causada por dependências não determinísticas ou por variáveis de ambiente que mudam a cada execução.', 'Recomenda-se fixar as seeds dos geradores aleatórios e documentar o ambiente de execução para garantir reprodutibilidade.', 'Se o problema persistir, revise as versões das bibliotecas utilizadas e considere atualizar para versões estáveis.'],
	['Simulações longas estão apresentando performance abaixo do esperado, levando horas para finalizar tarefas que normalmente seriam concluídas em minutos.', 'O uso excessivo de memória pode estar causando swap no sistema operacional, impactando negativamente o tempo de execução.', 'Analise os logs de performance para identificar gargalos e otimize os parâmetros de simulação conforme recomendado na documentação.', 'Considere dividir grandes simulações em blocos menores para facilitar o gerenciamento de recursos.'],
	['Usuários relatam dificuldades ao configurar o ambiente inicial do sistema, especialmente em máquinas com sistemas operacionais diferentes.', 'A ausência de dependências obrigatórias pode impedir a conclusão da configuração, resultando em mensagens de erro pouco claras.', 'Siga o guia de instalação passo a passo e utilize os scripts de verificação automática para garantir que todos os requisitos estejam atendidos.', 'Em caso de dúvidas, consulte o manual do usuário ou acione o suporte técnico para assistência personalizada.'],
	['Ao tentar acessar determinados diretórios, o sistema retorna um erro de permissão negada.', 'Isso pode ocorrer se o usuário não possuir privilégios suficientes ou se as permissões dos diretórios estiverem restritas.', 'Recomenda-se revisar as permissões dos diretórios e garantir que o usuário do sistema tenha acesso de leitura e escrita conforme necessário.', 'Em ambientes multiusuário, conflitos de permissão podem ser resolvidos ajustando os grupos de usuários.'],
	['Resultados de simulações apresentam divergências inexplicáveis entre execuções consecutivas.', 'Esse comportamento pode ser causado por arquivos temporários residuais ou por processos concorrentes acessando os mesmos dados.', 'Limpe os diretórios temporários antes de cada execução e evite rodar múltiplas instâncias simultaneamente.', 'Se persistir, investigue possíveis condições de corrida no código-fonte do modelo.'],
	['A interface gráfica do sistema não está carregando corretamente em alguns navegadores.', 'Problemas de compatibilidade com versões antigas de navegadores podem impedir o carregamento de scripts essenciais.', 'Limpe o cache do navegador e tente acessar a interface em modo anônimo para descartar problemas locais.', 'Consulte a lista de navegadores suportados na documentação oficial do sistema.'],
	['Os logs de execução não estão sendo salvos no diretório especificado, dificultando a análise de erros.', 'Verifique se o caminho de destino dos logs está correto e se o sistema possui permissões de escrita no diretório.', 'Em alguns casos, logs muito grandes podem ser rotacionados automaticamente, resultando em perda de informações antigas.', 'Considere configurar alertas para monitorar o tamanho dos arquivos de log e evitar sobrecarga do sistema.'],
	['Alguns parâmetros de entrada não são reconhecidos pelo sistema, resultando em falhas na inicialização do modelo.', 'Isso pode ocorrer devido a erros de digitação ou ao uso de parâmetros obsoletos em versões mais recentes do software.', 'Consulte a documentação para obter a lista completa de parâmetros suportados e revise os arquivos de configuração.', 'Em caso de dúvida, utilize os comandos de ajuda integrados ao sistema para validar os parâmetros informados.'],
	['Ao exportar resultados, o sistema pode apresentar falhas se o formato de saída não for suportado.', 'Verifique se o diretório de destino existe e se há espaço suficiente em disco.', 'Falhas de exportação também podem ocorrer devido a permissões insuficientes ou arquivos em uso por outros processos.'],
	['O modelo atinge o tempo limite antes de finalizar a execução, especialmente em simulações complexas.', 'Ajuste o parâmetro de timeout nas configurações ou otimize o modelo para reduzir o tempo de processamento.', 'Considere dividir a tarefa em etapas menores para facilitar o controle do tempo de execução.'],
	['Falhas ao conectar com serviços externos podem ser causadas por instabilidade de rede ou configurações incorretas.', 'Verifique se o endereço do serviço está correto e se o firewall não está bloqueando a comunicação.', 'Em ambientes corporativos, pode ser necessário configurar proxies ou VPNs para acesso externo.'],
	['Dados de entrada corrompidos podem comprometer toda a execução do modelo.', 'Utilize ferramentas de validação para garantir a integridade dos dados antes de iniciar o processamento.', 'Mantenha backups regulares dos arquivos de entrada para evitar perdas em caso de corrupção.'],
	['Problemas de compatibilidade com o sistema operacional podem impedir a instalação ou execução do software.', 'Verifique os requisitos mínimos na documentação e atualize o sistema operacional se necessário.', 'Em alguns casos, a execução em modo de compatibilidade pode resolver o problema.'],
	['Erros de memória insuficiente são comuns em simulações que demandam muitos recursos.', 'Feche outros aplicativos para liberar memória e, se possível, aumente a memória RAM disponível.', 'Considere otimizar o modelo para consumir menos recursos durante a execução.'],
	['Falhas ao atualizar dependências podem ocorrer devido a conflitos de versão ou problemas de rede.', 'Tente atualizar as dependências individualmente e verifique a compatibilidade entre elas.', 'Em casos extremos, reinstale o ambiente virtual do projeto.'],
	['Problemas ao gerar gráficos podem estar relacionados a bibliotecas desatualizadas ou dados inconsistentes.', 'Atualize as bibliotecas de visualização e valide os dados antes de gerar os gráficos.', 'Consulte exemplos de gráficos na documentação para garantir o formato correto dos dados.'],
	['Erros ao validar parâmetros geralmente indicam valores fora do intervalo permitido ou formatos incorretos.', 'Revise os parâmetros informados e utilize as funções de validação disponíveis no sistema.', 'Em caso de dúvidas, consulte o manual ou peça suporte à equipe técnica.'],
	['Dificuldades para acessar o manual do usuário podem ser causadas por links quebrados ou arquivos ausentes.', 'Verifique se o manual está instalado corretamente e se o caminho de acesso está configurado.', 'Consulte a versão online do manual caso o arquivo local não esteja disponível.'],
]

interface DependencyItem {
	name: string
	icon: string | null
	description?: string
	children?: DependencyItem[]
}

const solutionDescriptions = ['Verifique se os dados meteorológicos estão no formato esperado.', 'Confirme se os arquivos possuem as permissões corretas.', 'Reinicie o sistema e tente novamente.', 'Otimize os parâmetros de simulação para melhorar a performance.', 'Siga o passo a passo do manual de configuração.', 'Ajuste as permissões dos diretórios de trabalho.', 'Compare os resultados com execuções anteriores para identificar padrões.', 'Limpe o cache do navegador e recarregue a página.', 'Verifique o caminho de destino dos logs no arquivo de configuração.', 'Consulte a documentação para os parâmetros aceitos.', 'Atualize o software para a versão mais recente.', 'Aumente o tempo limite de execução nas configurações.', 'Verifique a conexão com a internet e serviços externos.', 'Reimporte os dados de entrada após validação.', 'Instale as dependências compatíveis com seu sistema operacional.', 'Libere memória ou feche outros aplicativos antes de executar.', 'Execute o comando de atualização de dependências novamente.', 'Revise os dados utilizados para gerar os gráficos.', 'Corrija os parâmetros conforme as mensagens de erro.', 'Acesse o manual diretamente pelo site oficial.', 'Sincronize os dados manualmente se necessário.', 'Salve as configurações e reinicie o sistema.', 'Verifique as credenciais do usuário e tente novamente.', 'Ajuste o timezone nas configurações do sistema.', 'Reinstale os plugins e reinicie o software.', 'Limpe o cache do sistema e tente novamente.', 'Configure corretamente o serviço de notificações.', 'Restaure o backup em um ambiente limpo.', 'Renomeie os arquivos conforme o padrão exigido.', 'Recrie o ambiente virtual seguindo o tutorial oficial.']

// Base de Conhecimento - Estrutura de dependências
const dependencyStructure = [
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
							{ name: 'Dr. João Silva', icon: 'icon-[lucide--user-round]' },
							{ name: 'Dra. Maria Santos', icon: 'icon-[lucide--user-round]' },
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
	{
		name: 'Elementos afetados',
		icon: null,
		children: [
			{
				name: 'Recursos',
				icon: null,
				children: [
					{
						name: 'Hosts',
						icon: null,
						children: [
							{ name: 'weather01.inpe.br', icon: 'icon-[lucide--computer]' },
							{ name: 'data02.inpe.br', icon: 'icon-[lucide--computer]' },
						],
					},
					{
						name: 'Softwares',
						icon: null,
						children: [
							{ name: 'Sistema de Coleta', icon: 'icon-[lucide--download]' },
							{ name: 'Interface Web', icon: 'icon-[lucide--monitor]' },
						],
					},
				],
			},
			{
				name: 'Grupos',
				icon: null,
				children: [
					{ name: 'Meteorologistas', icon: 'icon-[lucide--users-round]' },
					{ name: 'Pesquisadores', icon: 'icon-[lucide--users-round]' },
					{ name: 'Operadores', icon: 'icon-[lucide--users-round]' },
				],
			},
			{
				name: 'Clientes externos',
				icon: null,
				children: [
					{
						name: 'INPE',
						icon: null,
						children: [
							{ name: 'CPTEC Operacional', icon: 'icon-[lucide--building]' },
							{ name: 'DIPTC', icon: 'icon-[lucide--building]' },
						],
					},
					{
						name: 'Outros',
						icon: null,
						children: [
							{ name: 'INMET', icon: 'icon-[lucide--cloud]' },
							{ name: 'Marinha do Brasil', icon: 'icon-[lucide--anchor]' },
							{ name: 'Universidades Parceiras', icon: 'icon-[lucide--graduation-cap]' },
						],
					},
				],
			},
		],
	},
]

// Grupos padrão do sistema (categorias para chat futuro)
const groups = [
	{
		name: 'Administradores',
		description: 'Administradores do sistema com acesso completo',
		icon: 'icon-[lucide--shield-check]',
		color: '#DC2626',
		active: true,
		isDefault: false,
		maxUsers: 10,
	},
	{
		name: 'Meteorologistas',
		description: 'Profissionais responsáveis por análises meteorológicas',
		icon: 'icon-[lucide--cloud-sun]',
		color: '#2563EB',
		active: true,
		isDefault: true, // Grupo padrão para novos usuários
		maxUsers: null,
	},
	{
		name: 'Pesquisadores',
		description: 'Pesquisadores e cientistas do CPTEC',
		icon: 'icon-[lucide--microscope]',
		color: '#059669',
		active: true,
		isDefault: false,
		maxUsers: null,
	},
	{
		name: 'Operadores',
		description: 'Operadores do sistema de monitoramento',
		icon: 'icon-[lucide--monitor-speaker]',
		color: '#D97706',
		active: true,
		isDefault: false,
		maxUsers: 20,
	},
	{
		name: 'Suporte Técnico',
		description: 'Equipe de suporte técnico e manutenção',
		icon: 'icon-[lucide--headphones]',
		color: '#7C3AED',
		active: true,
		isDefault: false,
		maxUsers: 15,
	},
	{
		name: 'Visitantes',
		description: 'Usuários visitantes com acesso limitado',
		icon: 'icon-[lucide--user-round]',
		color: '#6B7280',
		active: true,
		isDefault: false,
		maxUsers: 50,
	},
]

// Contatos globais da organização
const contacts = [
	{
		name: 'Dr. Marcelo Silvano',
		role: 'Coordenador Técnico',
		team: 'CGCT',
		email: 'marcelo.silvano@inpe.br',
		phone: '+55 12 3186-8000',
		image: '/uploads/profile/10.jpg',
		active: true,
	},
	{
		name: 'José Santana',
		role: 'Meteorologista Sênior',
		team: 'DIPTC',
		email: 'jose.santana@inpe.br',
		phone: '+55 12 3186-8001',
		image: '/uploads/profile/20.jpg',
		active: true,
	},
	{
		name: 'Dra. Aline Mendez',
		role: 'Pesquisadora Principal',
		team: 'DIPTC',
		email: 'aline.mendez@inpe.br',
		phone: '+55 12 3186-8002',
		image: '/uploads/profile/30.jpg',
		active: true,
	},
	{
		name: 'Carlos Santos',
		role: 'Analista de Sistemas',
		team: 'TI',
		email: 'carlos.santos@inpe.br',
		phone: '+55 12 3186-8003',
		image: '/uploads/profile/40.jpg',
		active: true,
	},
	{
		name: 'Ana Oliveira',
		role: 'Suporte Técnico',
		team: 'TI',
		email: 'ana.oliveira@inpe.br',
		phone: '+55 12 3186-8004',
		image: '/uploads/profile/50.jpg',
		active: false, // Ex-funcionária
	},
]

// Manual do produto em formato markdown único
const manualData = [
	{
		productSlug: 'bam',
		description: `# Manual do BAM

## Introdução

O BAM (Brazilian Global Atmospheric Model) é um modelo atmosférico global desenvolvido pelo CPTEC/INPE para previsão numérica do tempo. Este manual apresenta as principais características e procedimentos operacionais.

### Como funciona o modelo

O modelo meteorológico BAM funciona através de uma série de cálculos complexos que simulam o comportamento da atmosfera. Utiliza equações diferenciais parciais para simular:

- Dinâmica dos fluidos atmosféricos
- Termodinâmica
- Radiação solar e terrestre
- Microfísica de nuvens

### Arquitetura do sistema

O sistema é composto por várias camadas:

1. **Camada de dados**: Responsável pelo acesso e gerenciamento dos dados meteorológicos
2. **Camada de processamento**: Executa os cálculos do modelo numérico
3. **Camada de apresentação**: Interface para visualização e análise

## Funcionamento

### Pré-processamento

O pré-processamento é uma etapa crucial que prepara os dados para a simulação numérica.

#### Controle de qualidade

- Análise de valores extremos
- Verificação temporal e espacial
- Detecção de erros sistemáticos

#### Interpolação

- Interpolação bilinear para dados em grade
- Interpolação cúbica para suavização
- Interpolação ótima para assimilação

### Operações realizadas

#### Integração temporal

- Método de Runge-Kutta de 4ª ordem
- Esquema semi-implícito para ondas gravitacionais
- Filtro temporal para estabilidade

#### Cálculos físicos

- Radiação solar direta e difusa
- Parametrização de convecção profunda
- Formação e evolução de nuvens

### Pós-processamento

O pós-processamento transforma as saídas brutas do modelo em produtos úteis para os usuários.

#### Produtos meteorológicos

- Temperatura, umidade, vento
- Pressão ao nível do mar
- Altura geopotencial
- Índices de instabilidade

## Resolução de conflitos

### Problemas de inicialização

#### Dados de entrada

- Conferir se todos os arquivos necessários estão presentes
- Verificar permissões de leitura
- Validar formato e estrutura dos dados

#### Configuração

- Verificar consistência dos parâmetros
- Validar domain e resolução
- Conferir configurações de física

### Soluções comuns

- Procedimentos para reinício limpo
- Recuperação de estado anterior
- Backup e restauração de configurações`,
	},
	{
		productSlug: 'smec',
		description: `# Manual do SMEC

## Introdução

O SMEC (Sistema de Monitoramento e Estudos Climáticos) é uma ferramenta desenvolvida pelo CPTEC/INPE para análise e monitoramento de dados climáticos.

### Características principais

- Processamento de dados meteorológicos
- Análise estatística de séries temporais
- Geração de produtos climáticos
- Interface web para visualização

## Instalação

### Pré-requisitos

- Sistema operacional Linux/Windows
- Python 3.8+
- Bibliotecas científicas (NumPy, SciPy, Matplotlib)

### Processo de instalação

1. Download do software
2. Configuração do ambiente virtual
3. Instalação das dependências
4. Configuração inicial

## Configuração

### Configuração básica

Configurações essenciais para funcionamento:

- Diretórios de dados
- Parâmetros de processamento
- Configurações de saída

### Configuração avançada

Para usuários experientes:

- Otimização de performance
- Configurações de paralelização
- Integração com outros sistemas

## Troubleshooting

### Problemas comuns

- Erros de importação de dados
- Problemas de performance
- Falhas na geração de produtos

### Soluções

- Verificação de formatos de arquivo
- Otimização de recursos
- Validação de dados de entrada`,
	},
	{
		productSlug: 'brams-ams-15km',
		description: `# Manual do BRAMS AMS 15KM

## Introdução

O BRAMS (Brazilian developments on the Regional Atmospheric Modeling System) é um modelo atmosférico regional desenvolvido para previsão de alta resolução.

### Características técnicas

- Resolução horizontal de 15km
- Múltiplos níveis verticais
- Física atmosférica avançada
- Assimilação de dados

## Operação

### Inicialização

#### Dados de entrada

- Dados de análise global
- Observações de superfície
- Dados de radiossondagem
- Imagens de satélite

#### Configuração do domínio

- Definição da grade
- Configuração de níveis verticais
- Condições de contorno

### Execução

#### Processamento

- Integração temporal
- Cálculos de física
- Assimilação de dados
- Geração de produtos

#### Monitoramento

- Verificação de logs
- Análise de performance
- Controle de qualidade

## Produtos

### Campos meteorológicos

- Temperatura
- Umidade
- Vento
- Precipitação
- Pressão

### Produtos derivados

- Índices de instabilidade
- Parâmetros de convecção
- Variáveis de superfície

## Manutenção

### Procedimentos regulares

- Backup de dados
- Limpeza de arquivos temporários
- Verificação de integridade

### Resolução de problemas

- Análise de erros
- Procedimentos de recuperação
- Contato com suporte técnico`,
	},
	{
		productSlug: 'wrf',
		description: `# Manual do WRF

## Introdução

O WRF (Weather Research and Forecasting) é um modelo atmosférico de mesoescala desenvolvido para pesquisa e previsão operacional.

### Características

- Modelo não-hidrostático
- Múltiplas opções de física
- Grades aninhadas
- Paralelização eficiente

## Configuração

### Pré-processamento

#### WPS (WRF Preprocessing System)

- Definição de domínios
- Interpolação de dados
- Preparação de dados de entrada

#### Namelist

- Configuração de parâmetros
- Definição de física
- Configurações de execução

### Execução

#### WRF Model

- Integração temporal
- Cálculos de dinâmica
- Parametrizações físicas

#### Paralelização

- Configuração MPI
- Distribuição de domínios
- Otimização de recursos

## Pós-processamento

### Extração de dados

- Interpolação para pontos
- Cálculo de variáveis derivadas
- Formatação de saída

### Visualização

- Geração de mapas
- Plots de séries temporais
- Análise estatística

## Troubleshooting

### Problemas comuns

- Erros de compilação
- Problemas de namelist
- Falhas de execução

### Soluções

- Verificação de dependências
- Validação de configurações
- Análise de logs de erro

### Suporte

- Documentação oficial
- Fóruns de usuários
- Contato com desenvolvedores`,
	},
]

// Documentação de Ajuda do Sistema
const helpDocumentation = `# Sistema Silo - Documentação

Bem-vindo ao **Sistema Silo**, a plataforma de gestão de produtos meteorológicos do CPTEC/INPE. Este sistema foi desenvolvido para facilitar o gerenciamento, monitoramento e análise de modelos meteorológicos utilizados na pesquisa e operação do Instituto Nacional de Pesquisas Espaciais.

## Visão Geral

O Sistema Silo oferece uma interface moderna e intuitiva para:

- **Gestão de Produtos Meteorológicos**: Controle completo dos modelos BAM, SMEC, BRAMS e WRF
- **Sistema de Chat em Tempo Real**: Comunicação instantânea entre equipes
- **Gerenciamento de Usuários e Grupos**: Controle de acesso baseado em papéis
- **Base de Conhecimento**: Documentação de problemas e soluções
- **Monitoramento de Dependências**: Rastreamento de recursos e infraestrutura

## Primeiros Passos

### Acesso ao Sistema

1. **Login**: Acesse o sistema usando suas credenciais institucionais
2. **Dashboard**: Visualize o painel principal com informações de todos os produtos
3. **Navegação**: Use o menu lateral para acessar diferentes seções

### Gerenciamento de Produtos

#### Visualização de Produtos
- Acesse **"Produtos"** no menu principal
- Visualize cards com informações resumidas de cada modelo
- Clique em um produto para acessar detalhes completos

#### Gerenciamento de Problemas
- Dentro de cada produto, acesse a aba **"Problemas"**
- Registre novos problemas encontrados durante operações
- Adicione soluções e marque como resolvidas
- Anexe imagens e arquivos quando necessário

#### Base de Conhecimento
- Consulte o manual específico de cada produto
- Visualize dependências hierárquicas (equipamentos, software, recursos humanos)
- Gerencie contatos responsáveis por cada área

### Sistema de Chat

#### Canais por Grupos
O sistema de chat é organizado por grupos funcionais:

- **#administradores**: Canal para gestores do sistema
- **#meteorologistas**: Discussões técnicas sobre modelos
- **#pesquisadores**: Colaboração em projetos de pesquisa
- **#operadores**: Comunicação operacional diária
- **#suporte**: Canal para solicitações de ajuda
- **#visitantes**: Área para usuários temporários

#### Funcionalidades do Chat
- **Mensagens em tempo real** com WebSocket
- **Upload de arquivos** (imagens, documentos, vídeos)
- **Emoji picker** com categorias e busca
- **Status de leitura** estilo WhatsApp (✓✓)
- **Typing indicators** mostrando quando alguém está digitando
- **Notificações** integradas na barra superior

### Administração

#### Gerenciamento de Usuários
- Acesse **"Configurações > Grupos"** para gerenciar usuários
- Visualize informações por grupo ou lista completa
- Adicione, edite ou desative usuários conforme necessário
- Controle permissões através dos grupos

#### Configurações de Sistema
- **Perfil pessoal**: Atualize informações e foto do perfil
- **Preferências**: Configure notificações e aparência
- **Segurança**: Altere senha e configurações de acesso

## Funcionalidades Avançadas

### Monitoramento de Status
- **Indicadores de conectividade** em tempo real
- **Status de presença** dos usuários (Online, Ausente, Ocupado, Offline)
- **Notificações push** para eventos importantes

### Relatórios e Análises
- **Estatísticas de problemas** por produto
- **Métricas de resolução** de incidentes
- **Histórico de atividades** do sistema

### Integração com Infraestrutura
- **Monitoramento de hosts** e servidores
- **Verificação de dependências** automática
- **Alertas de indisponibilidade** de recursos críticos

## Solução de Problemas Comuns

### Problemas de Acesso
- **Esqueci minha senha**: Use a opção de recuperação na tela de login
- **Erro de permissão**: Verifique se você pertence ao grupo correto
- **Sistema lento**: Limpe o cache do navegador e tente novamente

### Problemas de Chat
- **Mensagens não aparecem**: Verifique a conexão de internet
- **Upload de arquivo falha**: Verifique o tamanho (máximo 10MB)
- **Notificações não funcionam**: Permita notificações no navegador

### Problemas de Produtos
- **Dados não carregam**: Verifique se o produto está ativo
- **Erro ao salvar**: Verifique se todos os campos obrigatórios foram preenchidos
- **Imagens não aparecem**: Verifique se o arquivo foi carregado corretamente

## Suporte Técnico

### Canais de Suporte
- **Chat interno**: Use o canal #suporte para dúvidas rápidas
- **Email**: Envie detalhes para suporte.silo@cptec.inpe.br
- **Documentação**: Consulte esta seção sempre que necessário

### Informações Importantes
- **Horário de suporte**: Segunda a sexta, 8h às 18h
- **Emergências**: Para problemas críticos, contate a equipe de plantão
- **Atualizações**: O sistema é atualizado semanalmente (domingos, 2h)

### Contatos da Equipe
- **Coordenação Técnica**: Dr. João Silva (joao.silva@inpe.br)
- **Desenvolvimento**: Equipe TI CPTEC (ti.cptec@inpe.br)
- **Suporte Operacional**: Central de Operações (ops@cptec.inpe.br)

---

**Versão do Sistema**: 2.0.0  
**Última atualização da documentação**: ${new Date().toLocaleDateString('pt-BR')}  
**Desenvolvido por**: CPTEC/INPE - Centro de Previsão de Tempo e Estudos Climáticos`

function generateProblems() {
	return problemTitles.map((title, i) => {
		const paragraphs = problemDescriptions[i % problemDescriptions.length]
		const longDescription = Array.isArray(paragraphs) ? paragraphs.join('\n\n') : paragraphs
		return {
			title,
			description: longDescription,
		}
	})
}

function generateSolutions() {
	return solutionDescriptions.map((description) => ({
		description,
	}))
}

async function insertDependencies(productId: string, dependencies: DependencyItem[], parentId: string | null = null, parentPath: string = '', parentDepth: number = 0, siblingIndex: number = 0) {
	for (let i = 0; i < dependencies.length; i++) {
		const dep = dependencies[i]
		const depId = randomUUID()

		// Calcular campos híbridos otimizados
		const currentIndex = siblingIndex + i
		const treePath = parentPath + '/' + currentIndex
		const treeDepth = parentDepth
		const sortKey = parentPath ? parentPath.split('/').filter(Boolean).join('.') + '.' + currentIndex.toString().padStart(3, '0') : currentIndex.toString().padStart(3, '0')

		await db.insert(schema.productDependency).values({
			id: depId,
			productId,
			name: dep.name,
			icon: dep.icon,
			description: dep.description || null,
			parentId,
			// Campos híbridos otimizados
			treePath,
			treeDepth,
			sortKey,
		})

		if (dep.children) {
			await insertDependencies(productId, dep.children, depId, treePath, parentDepth + 1, 0)
		}
	}
}

async function seed() {
	console.log('🔵 Iniciando seed...')

	// 1. Criar grupos padrão
	console.log('🔵 Criando grupos padrão do sistema...')
	const insertedGroups = await db
		.insert(schema.group)
		.values(
			groups.map((group) => ({
				id: randomUUID(),
				...group,
			})),
		)
		.returning()

	// Encontrar o grupo padrão (Meteorologistas)
	const defaultGroup = insertedGroups.find((g) => g.isDefault)
	if (!defaultGroup) {
		throw new Error('Grupo padrão não encontrado!')
	}

	console.log(`✅ ${insertedGroups.length} grupos criados com sucesso!`)
	console.log(`✅ Grupo padrão: ${defaultGroup.name} (${defaultGroup.id})`)

	// 1.1. Criar canais de chat baseados nos grupos
	console.log('🔵 Criando canais de chat baseados nos grupos...')
	const insertedChannels = await db
		.insert(schema.chatChannel)
		.values(
			insertedGroups.map((group) => ({
				name: `#${group.name.toLowerCase().replace(/\s+/g, '-')}`,
				description: `Canal do grupo ${group.name} - ${group.description}`,
				type: 'group',
				icon: group.icon,
				color: group.color,
				isActive: group.active,
			})),
		)
		.returning()

	console.log(`✅ ${insertedChannels.length} canais de chat criados com sucesso!`)

	// 2. Criar usuário de teste Mario Junior
	console.log('🔵 Criando usuário de teste: Mario Junior...')

	const userId = randomUUID()
	const hashedPassword = await hashPassword('#Admin123')

	// Criar usuário
	await db.insert(schema.authUser).values({
		id: userId,
		name: 'Mario Junior',
		email: 'sessojunior@gmail.com',
		emailVerified: true,
		password: hashedPassword,
		isActive: true,
		lastLogin: null,
	})

	// Adicionar usuário ao grupo padrão via tabela user_group
	await db.insert(schema.userGroup).values({
		userId: userId,
		groupId: defaultGroup.id,
		role: 'admin',
	})

	// Criar perfil do usuário
	await db.insert(schema.userProfile).values({
		id: randomUUID(),
		userId: userId,
		genre: 'Masculino',
		phone: '+55 11 99999-9999',
		role: 'Administrador',
		team: 'CPTEC',
		company: 'INPE',
		location: 'São José dos Campos, SP',
	})

	// Criar preferências do usuário
	await db.insert(schema.userPreferences).values({
		id: randomUUID(),
		userId: userId,
		notifyUpdates: true,
		sendNewsletters: false,
	})

	console.log('✅ Usuário Mario Junior criado com sucesso!')

	// 2.1. Criar documentação de ajuda do sistema
	console.log('🔵 Criando documentação de ajuda do sistema...')
	await db.insert(schema.help).values({
		id: 'system-help',
		description: helpDocumentation,
	})
	console.log('✅ Documentação de ajuda criada com sucesso!')

	// 2.2. Adicionar usuário como participante de todos os canais
	console.log('🔵 Adicionando usuário Mario Junior como participante dos canais...')
	const participantRoles = insertedChannels.map((channel) => ({
		channelId: channel.id,
		userId: userId,
		role: channel.name === '#administradores' ? 'admin' : 'member',
		lastReadAt: null,
	}))

	await db.insert(schema.chatParticipant).values(participantRoles)
	console.log(`✅ Usuário adicionado como participante de ${participantRoles.length} canais!`)

	// 2.3. Criar status inicial do usuário no chat
	console.log('🔵 Criando status inicial do usuário no chat...')
	await db.insert(schema.chatUserStatus).values({
		userId: userId,
		status: 'offline',
		lastSeenAt: new Date(),
	})
	console.log('✅ Status inicial do usuário criado!')

	// 3. Produtos
	console.log('🔵 Inserindo produtos...')
	const productMap = new Map<string, string>()

	const inserted = await db
		.insert(schema.product)
		.values(products.map((p) => ({ id: randomUUID(), ...p, available: true })))
		.returning()

	inserted.forEach((p) => productMap.set(p.slug, p.id))

	// 4. Contatos Globais
	console.log('🔵 Inserindo contatos globais...')
	const insertedContacts = await db
		.insert(schema.contact)
		.values(
			contacts.map((contact) => ({
				id: randomUUID(),
				...contact,
			})),
		)
		.returning()

	// Criar mapa de contatos para facilitar associações
	const contactMap = new Map<string, string>()
	insertedContacts.forEach((c) => contactMap.set(c.email, c.id))
	console.log(`✅ ${insertedContacts.length} contatos inseridos com sucesso!`)

	for (const { slug } of products) {
		const productId = productMap.get(slug)!

		console.log(`🔵 Inserindo dados para o produto: ${slug.toUpperCase()}`)

		// 5.1. Dependências hierárquicas
		console.log(`🔵 Inserindo dependências para ${slug}...`)
		await insertDependencies(productId, dependencyStructure)

		// 5.2. Associações Produto-Contato
		console.log(`🔵 Associando contatos ao produto: ${slug}...`)
		// Associar os 3 primeiros contatos ativos a cada produto (exemplo)
		const activeContacts = insertedContacts.filter((c) => c.active).slice(0, 3)
		const associations = activeContacts.map((contact) => ({
			id: randomUUID(),
			productId,
			contactId: contact.id,
		}))

		await db.insert(schema.productContact).values(associations)
		console.log(`✅ ${associations.length} contatos associados ao produto ${slug}!`)

		// 5.3. Manual do produto (markdown único)
		console.log(`🔵 Inserindo manual para ${slug}...`)
		const manual = manualData.find((m) => m.productSlug === slug)
		if (manual) {
			await db.insert(schema.productManual).values({
				id: randomUUID(),
				productId,
				description: manual.description,
			})
		}

		// 5.4. Problemas e Soluções
		console.log(`🔵 Inserindo problemas para o produto: ${slug.toUpperCase()}`)
		const problems = generateProblems()
		const problemRows = problems.map((p) => ({
			id: randomUUID(),
			productId,
			userId: userId,
			title: p.title,
			description: p.description,
		}))

		const insertedProblems = await db.insert(schema.productProblem).values(problemRows).returning()

		for (const problem of insertedProblems) {
			console.log(`🔵 Inserindo soluções para o problema: ${problem.title}`)

			// Gera um número aleatório de soluções entre 2 e 10
			const numSolutions = Math.floor(Math.random() * 9) + 2 // 2 a 10
			const solutions = generateSolutions().slice(0, numSolutions)
			const solutionRows = solutions.map((s) => ({
				id: randomUUID(),
				userId: userId,
				productProblemId: problem.id,
				description: s.description,
				replyId: null,
			}))

			await db.insert(schema.productSolution).values(solutionRows)

			// Checar a primeira solução
			await db.insert(schema.productSolutionChecked).values({
				id: randomUUID(),
				userId: userId,
				productSolutionId: solutionRows[0].id,
			})

			// Adicionar imagens exemplo
			await db.insert(schema.productProblemImage).values([
				{
					id: randomUUID(),
					productProblemId: problem.id,
					image: '/uploads/products/problems/erro1.jpg',
					description: 'Imagem demonstrando o erro',
				},
				{
					id: randomUUID(),
					productProblemId: problem.id,
					image: '/uploads/products/problems/erro2.jpg',
					description: 'Outra imagem do erro',
				},
			])
		}
	}

	console.log('✅ Seed finalizado com sucesso.')
}

seed().catch((err) => {
	console.error('❌ Erro ao rodar o seed:', err)
	process.exit(1)
})
