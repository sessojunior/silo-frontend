import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

const USER_ID = 'a5c0b6e7-2c76-4447-a512-a095fb78e4d7'

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

async function seed() {
	console.log('✅ Iniciando seed...')

	// 1. Produtos
	const existingProducts = await db.select().from(schema.product).limit(1)
	const productMap = new Map<string, string>()

	if (existingProducts.length === 0) {
		console.log('🔄 Inserindo produtos...')
		const inserted = await db
			.insert(schema.product)
			.values(products.map((p) => ({ id: randomUUID(), ...p, available: true })))
			.returning()

		inserted.forEach((p) => productMap.set(p.slug, p.id))
	} else {
		console.log('✅ Produtos já existentes.')
		const all = await db.select().from(schema.product)
		all.forEach((p) => productMap.set(p.slug, p.id))
	}

	for (const { slug } of products) {
		const productId = productMap.get(slug)!

		console.log(`🔄 Inserindo problemas para o produto: ${slug.toUpperCase()}`)

		const problems = generateProblems()
		const problemRows = problems.map((p) => ({
			id: randomUUID(),
			productId,
			userId: USER_ID,
			title: p.title,
			description: p.description,
			createdAt: new Date(),
			updatedAt: new Date(),
		}))

		const insertedProblems = await db.insert(schema.productProblem).values(problemRows).returning()

		for (const problem of insertedProblems) {
			console.log(`🔄 Inserindo soluções para o problema: ${problem.title}`)

			// Gera um número aleatório de soluções entre 2 e 10
			const numSolutions = Math.floor(Math.random() * 9) + 2 // 2 a 10
			const solutions = generateSolutions().slice(0, numSolutions)
			const solutionRows = solutions.map((s, i) => ({
				id: randomUUID(),
				userId: USER_ID,
				productProblemId: problem.id,
				description: s.description,
				replyId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}))

			await db.insert(schema.productSolution).values(solutionRows)

			// Checar a primeira solução
			await db.insert(schema.productSolutionChecked).values({
				id: randomUUID(),
				userId: USER_ID,
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
