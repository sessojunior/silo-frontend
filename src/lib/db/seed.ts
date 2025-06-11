import 'dotenv/config'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'

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

const solutionDescriptions = ['Verifique se os dados meteorológicos estão no formato esperado.', 'Confirme se os arquivos possuem as permissões corretas.', 'Reinicie o sistema e tente novamente.', 'Otimize os parâmetros de simulação para melhorar a performance.', 'Siga o passo a passo do manual de configuração.', 'Ajuste as permissões dos diretórios de trabalho.', 'Compare os resultados com execuções anteriores para identificar padrões.', 'Limpe o cache do navegador e recarregue a página.', 'Verifique o caminho de destino dos logs no arquivo de configuração.', 'Consulte a documentação para os parâmetros aceitos.', 'Atualize o software para a versão mais recente.', 'Aumente o tempo limite de execução nas configurações.', 'Verifique a conexão com a internet e serviços externos.', 'Reimporte os dados de entrada após validação.', 'Instale as dependências compatíveis com seu sistema operacional.', 'Libere memória ou feche outros aplicativos antes de executar.', 'Execute o comando de atualização de dependências novamente.', 'Revise os dados utilizados para gerar os gráficos.', 'Corrija os parâmetros conforme as mensagens de erro.', 'Acesse o manual diretamente pelo site oficial.', 'Sincronize os dados manualmente se necessário.', 'Salve as configurações e reinicie o sistema.', 'Verifique as credenciais do usuário e tente novamente.', 'Ajuste o timezone nas configurações do sistema.', 'Reinstale os plugins e reinicie o software.', 'Limpe o cache do sistema e tente novamente.', 'Configure corretamente o serviço de notificações.', 'Restaure o backup em um ambiente limpo.', 'Renomeie os arquivos conforme o padrão exigido.', 'Recrie o ambiente virtual seguindo o tutorial oficial.']

// Base de Conhecimento - Estrutura de dependências
const dependencyStructure = [
	{
		type: 'equipamento',
		category: 'equipamentos',
		name: 'Equipamentos',
		icon: null,
		children: [
			{
				type: 'equipamento',
				category: 'maquinas',
				name: 'Máquinas',
				icon: null,
				children: [
					{ type: 'equipamento', category: 'maquina', name: 'Servidor Principal', icon: 'icon-[lucide--server]' },
					{ type: 'equipamento', category: 'maquina', name: 'Workstation Linux', icon: 'icon-[lucide--computer]' },
					{ type: 'equipamento', category: 'maquina', name: 'Cluster de Processamento', icon: 'icon-[lucide--cpu]' },
				],
			},
			{
				type: 'equipamento',
				category: 'redes',
				name: 'Redes internas',
				icon: null,
				children: [
					{ type: 'equipamento', category: 'rede', name: 'Rede CPTEC', icon: 'icon-[lucide--network]' },
					{ type: 'equipamento', category: 'rede', name: 'Rede Laboratório', icon: 'icon-[lucide--network]' },
				],
			},
			{
				type: 'equipamento',
				category: 'redes_externas',
				name: 'Redes externas',
				icon: null,
				children: [
					{ type: 'equipamento', category: 'rede', name: 'Internet INPE', icon: 'icon-[lucide--globe]' },
					{ type: 'equipamento', category: 'rede', name: 'VPN Científica', icon: 'icon-[lucide--shield]' },
				],
			},
		],
	},
	{
		type: 'dependencia',
		category: 'dependencias',
		name: 'Dependências',
		icon: null,
		children: [
			{
				type: 'dependencia',
				category: 'sistema',
				name: 'Sistema',
				icon: null,
				children: [
					{
						type: 'dependencia',
						category: 'hosts',
						name: 'Hosts',
						icon: null,
						children: [
							{ type: 'dependencia', category: 'host', name: 'met01.cptec.inpe.br', icon: 'icon-[lucide--computer]' },
							{ type: 'dependencia', category: 'host', name: 'model02.cptec.inpe.br', icon: 'icon-[lucide--computer]' },
						],
					},
					{
						type: 'dependencia',
						category: 'softwares',
						name: 'Softwares',
						icon: null,
						children: [
							{ type: 'dependencia', category: 'software', name: 'Python 3.9+', icon: 'icon-[lucide--code]' },
							{ type: 'dependencia', category: 'software', name: 'NetCDF4', icon: 'icon-[lucide--database]' },
							{ type: 'dependencia', category: 'software', name: 'GrADS', icon: 'icon-[lucide--bar-chart]' },
						],
					},
				],
			},
			{
				type: 'dependencia',
				category: 'recursos_humanos',
				name: 'Recursos humanos',
				icon: null,
				children: [
					{
						type: 'dependencia',
						category: 'responsaveis',
						name: 'Responsáveis técnicos do INPE',
						icon: null,
						children: [
							{ type: 'dependencia', category: 'pessoa', name: 'Dr. João Silva', icon: 'icon-[lucide--user-round]' },
							{ type: 'dependencia', category: 'pessoa', name: 'Dra. Maria Santos', icon: 'icon-[lucide--user-round]' },
						],
					},
					{
						type: 'dependencia',
						category: 'suporte',
						name: 'Suporte',
						icon: null,
						children: [
							{ type: 'dependencia', category: 'pessoa', name: 'Carlos Tech', icon: 'icon-[lucide--headphones]' },
							{ type: 'dependencia', category: 'pessoa', name: 'Ana Support', icon: 'icon-[lucide--headphones]' },
						],
					},
				],
			},
		],
	},
	{
		type: 'elemento_afetado',
		category: 'elementos_afetados',
		name: 'Elementos afetados',
		icon: null,
		children: [
			{
				type: 'elemento_afetado',
				category: 'recursos',
				name: 'Recursos',
				icon: null,
				children: [
					{
						type: 'elemento_afetado',
						category: 'hosts_afetados',
						name: 'Hosts',
						icon: null,
						children: [
							{ type: 'elemento_afetado', category: 'host', name: 'weather01.inpe.br', icon: 'icon-[lucide--computer]' },
							{ type: 'elemento_afetado', category: 'host', name: 'data02.inpe.br', icon: 'icon-[lucide--computer]' },
						],
					},
					{
						type: 'elemento_afetado',
						category: 'softwares_afetados',
						name: 'Softwares',
						icon: null,
						children: [
							{ type: 'elemento_afetado', category: 'software', name: 'Sistema de Coleta', icon: 'icon-[lucide--download]' },
							{ type: 'elemento_afetado', category: 'software', name: 'Interface Web', icon: 'icon-[lucide--monitor]' },
						],
					},
				],
			},
			{
				type: 'elemento_afetado',
				category: 'grupos',
				name: 'Grupos',
				icon: null,
				children: [
					{ type: 'elemento_afetado', category: 'grupo', name: 'Meteorologistas', icon: 'icon-[lucide--users-round]' },
					{ type: 'elemento_afetado', category: 'grupo', name: 'Pesquisadores', icon: 'icon-[lucide--users-round]' },
					{ type: 'elemento_afetado', category: 'grupo', name: 'Operadores', icon: 'icon-[lucide--users-round]' },
				],
			},
			{
				type: 'elemento_afetado',
				category: 'clientes_externos',
				name: 'Clientes externos',
				icon: null,
				children: [
					{
						type: 'elemento_afetado',
						category: 'inpe',
						name: 'INPE',
						icon: null,
						children: [
							{ type: 'elemento_afetado', category: 'cliente', name: 'CPTEC Operacional', icon: 'icon-[lucide--building]' },
							{ type: 'elemento_afetado', category: 'cliente', name: 'DIPTC', icon: 'icon-[lucide--building]' },
						],
					},
					{
						type: 'elemento_afetado',
						category: 'outros',
						name: 'Outros',
						icon: null,
						children: [
							{ type: 'elemento_afetado', category: 'cliente', name: 'INMET', icon: 'icon-[lucide--cloud]' },
							{ type: 'elemento_afetado', category: 'cliente', name: 'Marinha do Brasil', icon: 'icon-[lucide--anchor]' },
							{ type: 'elemento_afetado', category: 'cliente', name: 'Universidades Parceiras', icon: 'icon-[lucide--graduation-cap]' },
						],
					},
				],
			},
		],
	},
]

// Contatos para os produtos
const productContacts = [
	{
		name: 'Dr. Marcelo Silvano',
		role: 'Coordenador Técnico',
		team: 'CGCT',
		email: 'marcelo.silvano@inpe.br',
		phone: '+55 12 3186-8000',
		image: '/uploads/profile/10.jpg',
	},
	{
		name: 'José Santana',
		role: 'Meteorologista Sênior',
		team: 'DIPTC',
		email: 'jose.santana@inpe.br',
		phone: '+55 12 3186-8001',
		image: '/uploads/profile/20.jpg',
	},
	{
		name: 'Dra. Aline Mendez',
		role: 'Pesquisadora Principal',
		team: 'DIPTC',
		email: 'aline.mendez@inpe.br',
		phone: '+55 12 3186-8002',
		image: '/uploads/profile/30.jpg',
	},
]

// Seções e capítulos do manual
const manualData = [
	{
		title: '1. Introdução',
		description: 'Visão geral do sistema e conceitos fundamentais',
		chapters: [
			{
				title: '1.1. Como funciona o modelo',
				content: `O modelo meteorológico funciona através de uma série de cálculos complexos que simulam o comportamento da atmosfera. Este capítulo explica os conceitos fundamentais.

# Princípios básicos

O modelo utiliza equações diferenciais parciais para simular:
- Dinâmica dos fluidos atmosféricos
- Termodinâmica
- Radiação solar e terrestre
- Microfísica de nuvens

# Estrutura do código

O sistema está organizado em módulos funcionais que processam diferentes aspectos da simulação.

## Inicialização
- Leitura de dados observacionais
- Interpolação para a grade do modelo
- Verificação de consistência

## Processamento
- Integração temporal das equações
- Cálculos de física atmosférica
- Aplicação de condições de contorno

## Saída
- Geração de campos meteorológicos
- Formatação em NetCDF
- Disponibilização via web`,
			},
			{
				title: '1.2. Descrição do funcionamento interno',
				content: `Este capítulo detalha a arquitetura interna e o fluxo de dados do sistema.

# Arquitetura do sistema

O sistema é composto por várias camadas:

1. **Camada de dados**: Responsável pelo acesso e gerenciamento dos dados meteorológicos
2. **Camada de processamento**: Executa os cálculos do modelo numérico
3. **Camada de apresentação**: Interface para visualização e análise

# Fluxo de dados

## Entrada de dados
- Dados observacionais (estações, radiossondas, satélites)
- Condições de contorno (modelos globais)
- Parâmetros de configuração

## Processamento
- Pré-processamento e controle de qualidade
- Assimilação de dados
- Integração do modelo
- Pós-processamento

## Saída
- Campos meteorológicos em grade regular
- Produtos específicos para usuários
- Arquivos de verificação e diagnóstico`,
			},
		],
	},
	{
		title: '2. Funcionamento',
		description: 'Procedimentos operacionais e configuração do sistema',
		chapters: [
			{
				title: '2.1. Pré-processamento',
				content: `O pré-processamento é uma etapa crucial que prepara os dados para a simulação numérica.

# Controle de qualidade

## Verificação de consistência
- Análise de valores extremos
- Verificação temporal e espacial
- Detecção de erros sistemáticos

## Correção de dados
- Interpolação de dados faltantes
- Correção de bias sistemático
- Filtragem de ruído

# Interpolação

## Métodos de interpolação
- Interpolação bilinear para dados em grade
- Interpolação cúbica para suavização
- Interpolação ótima para assimilação

## Transformação de coordenadas
- Conversão entre sistemas de projeção
- Interpolação vertical entre níveis
- Ajuste para topografia local`,
			},
			{
				title: '2.2. Operações realizadas',
				content: `Este capítulo descreve as principais operações realizadas durante a execução do modelo.

# Integração temporal

## Esquemas numéricos
- Método de Runge-Kutta de 4ª ordem
- Esquema semi-implícito para ondas gravitacionais
- Filtro temporal para estabilidade

## Passo de tempo
- Determinação automática do passo de tempo
- Critério de estabilidade CFL
- Adaptação dinâmica para eficiência

# Cálculos físicos

## Radiação
- Cálculo de radiação solar direta e difusa
- Radiação terrestre de onda longa
- Interação com nuvens e aerossóis

## Convecção
- Parametrização de convecção profunda
- Convecção rasa e turbulência
- Liberação de calor latente

## Microfísica
- Formação e evolução de nuvens
- Processos de precipitação
- Conversão entre fases da água`,
			},
			{
				title: '2.3. Pós-processamento',
				content: `O pós-processamento transforma as saídas brutas do modelo em produtos úteis para os usuários.

# Interpolação de saída

## Grades de saída
- Interpolação para grades regulares
- Projeção para diferentes sistemas de coordenadas
- Recorte para regiões específicas

## Níveis verticais
- Interpolação para níveis de pressão
- Cálculo de variáveis derivadas
- Extração de perfis verticais

# Produtos meteorológicos

## Campos básicos
- Temperatura, umidade, vento
- Pressão ao nível do mar
- Altura geopotencial

## Produtos derivados
- Índices de instabilidade
- Parâmetros de convecção
- Variáveis de superfície

# Formatação de dados

## Formatos de arquivo
- NetCDF para dados científicos
- GRIB para intercâmbio operacional
- CSV para análise estatística

## Metadados
- Informações sobre a simulação
- Coordenadas e projeção
- Unidades e convenções`,
			},
		],
	},
	{
		title: '3. Resolução de conflitos',
		description: 'Procedimentos para solução de problemas comuns',
		chapters: [
			{
				title: '3.1. Problemas de inicialização',
				content: `Este capítulo aborda os problemas mais comuns durante a inicialização do modelo.

# Dados de entrada

## Verificação de arquivos
- Conferir se todos os arquivos necessários estão presentes
- Verificar permissões de leitura
- Validar formato e estrutura dos dados

## Diagnóstico de problemas
- Análise de logs de erro
- Verificação de integridade dos dados
- Teste com dados alternativos

# Configuração

## Parâmetros do modelo
- Verificar consistência dos parâmetros
- Validar domain e resolução
- Conferir configurações de física

## Ambiente computacional
- Verificar recursos disponíveis (CPU, memória)
- Configurar variáveis de ambiente
- Testar conectividade de rede

# Soluções comuns

## Reinicialização
- Procedimentos para reinício limpo
- Recuperação de estado anterior
- Backup e restauração de configurações`,
			},
		],
	},
]

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

async function insertDependencies(productId: string, dependencies: any[], parentId: string | null = null, order = 0) {
	for (const dep of dependencies) {
		const depId = randomUUID()
		await db.insert(schema.productDependency).values({
			id: depId,
			productId,
			name: dep.name,
			type: dep.type,
			category: dep.category,
			icon: dep.icon,
			description: dep.description || null,
			url: dep.url || null,
			parentId,
			order,
		})

		if (dep.children) {
			await insertDependencies(productId, dep.children, depId, 0)
		}
		order++
	}
}

async function seed() {
	console.log('ℹ️ Iniciando seed...')

	// 1. Criar usuário de teste Mario Junior
	console.log('ℹ️ Criando usuário de teste: Mario Junior...')

	const userId = randomUUID()
	const hashedPassword = await hashPassword('#Admin123')

	// Criar usuário
	await db.insert(schema.authUser).values({
		id: userId,
		name: 'Mario Junior',
		email: 'sessojunior@gmail.com',
		emailVerified: true,
		password: hashedPassword,
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

	// 2. Produtos
	console.log('ℹ️ Inserindo produtos...')
	const productMap = new Map<string, string>()

	const inserted = await db
		.insert(schema.product)
		.values(products.map((p) => ({ id: randomUUID(), ...p, available: true })))
		.returning()

	inserted.forEach((p) => productMap.set(p.slug, p.id))

	for (const { slug } of products) {
		const productId = productMap.get(slug)!

		console.log(`ℹ️ Inserindo dados para o produto: ${slug.toUpperCase()}`)

		// 2. Dependências hierárquicas
		console.log(`ℹ️ Inserindo dependências para ${slug}...`)
		await insertDependencies(productId, dependencyStructure)

		// 3. Contatos
		console.log(`ℹ️ Inserindo contatos para ${slug}...`)
		await db.insert(schema.productContact).values(
			productContacts.map((contact, index) => ({
				id: randomUUID(),
				productId,
				...contact,
				order: index,
			})),
		)

		// 4. Manual - Seções e Capítulos
		console.log(`ℹ️ Inserindo manual para ${slug}...`)
		for (let i = 0; i < manualData.length; i++) {
			const section = manualData[i]
			const sectionId = randomUUID()

			await db.insert(schema.productManualSection).values({
				id: sectionId,
				productId,
				title: section.title,
				description: section.description,
				order: i,
			})

			for (let j = 0; j < section.chapters.length; j++) {
				const chapter = section.chapters[j]
				await db.insert(schema.productManualChapter).values({
					id: randomUUID(),
					sectionId,
					title: chapter.title,
					content: chapter.content,
					order: j,
				})
			}
		}

		// 5. Problemas e Soluções
		console.log(`ℹ️ Inserindo problemas para o produto: ${slug.toUpperCase()}`)
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
			console.log(`ℹ️ Inserindo soluções para o problema: ${problem.title}`)

			// Gera um número aleatório de soluções entre 2 e 10
			const numSolutions = Math.floor(Math.random() * 9) + 2 // 2 a 10
			const solutions = generateSolutions().slice(0, numSolutions)
			const solutionRows = solutions.map((s, i) => ({
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
