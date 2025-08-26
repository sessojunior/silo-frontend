'use client'

import { useState, useEffect } from 'react'
import { ReportChart } from './ReportChart'
import { ReportFilters } from './ReportFilters'

interface ReportViewPageProps {
	reportId: string
}

interface ReportFilters {
	dateRange: string
	startDate?: Date
	endDate?: Date
}

interface ReportData {
	id: string
	title: string
	description: string
	type: 'availability' | 'problems' | 'performance' | 'projects'
	data: Record<string, unknown>
	filters: ReportFilters
}

export function ReportViewPage({ reportId }: ReportViewPageProps) {
	const [report, setReport] = useState<ReportData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [filters, setFilters] = useState<ReportFilters>({
		dateRange: '30d',
	})

	useEffect(() => {
		const fetchReport = async () => {
			try {
				setLoading(true)

				// Determinar qual API chamar baseado no tipo de relatório
				let apiUrl = ''
				switch (reportId) {
					case 'availability':
						apiUrl = '/api/admin/reports/availability'
						break
					case 'problems':
						apiUrl = '/api/admin/reports/problems'
						break
					case 'performance':
						apiUrl = '/api/admin/reports/performance'
						break
					case 'projects':
						apiUrl = '/api/admin/reports/projects'
						break
					default:
						throw new Error('Tipo de relatório não reconhecido')
				}

				// Construir query string com filtros
				const queryParams = new URLSearchParams()
				if (filters.dateRange !== '30d') queryParams.append('dateRange', filters.dateRange)
				if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString())
				if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString())

				const response = await fetch(`${apiUrl}?${queryParams.toString()}`)
				console.log('🔵 Status da resposta:', response.status)

				if (!response.ok) {
					const errorData = await response.json()
					console.log('❌ Erro da API:', errorData)
					throw new Error(errorData.error || 'Erro ao buscar dados do relatório')
				}

				const data = await response.json()
				console.log('✅ Dados recebidos:', data)

				// Mapear dados para o formato do relatório
				const reportData: ReportData = {
					id: reportId,
					title: getReportTitle(reportId),
					description: getReportDescription(reportId),
					type: reportId as 'availability' | 'problems' | 'performance' | 'projects',
					data: data,
					filters: filters,
				}

				setReport(reportData)
			} catch (err) {
				console.error('❌ Erro ao buscar relatório:', err)
				setError(err instanceof Error ? err.message : 'Erro desconhecido')
			} finally {
				setLoading(false)
			}
		}

		fetchReport()
	}, [reportId, filters])

	// Recarregar relatório quando filtros mudarem
	useEffect(() => {
		if (report && Object.values(filters).some((value) => value !== '30d' && value !== undefined)) {
			// Recarregar o relatório quando os filtros mudarem
			// A lógica já está implementada no useEffect principal
		}
	}, [filters, report])

	const handleFiltersChange = (newFilters: ReportFilters) => {
		setFilters(newFilters)
	}

	const getReportTitle = (id: string): string => {
		switch (id) {
			case 'availability':
				return 'Relatório de Disponibilidade por Produto'
			case 'problems':
				return 'Relatório de Problemas Mais Frequentes'
			case 'performance':
				return 'Relatório de Performance da Equipe'
			case 'projects':
				return 'Relatório de Projetos e Atividades'
			case 'executive':
				return 'Relatório Executivo'
			default:
				return 'Relatório'
		}
	}

	const getReportDescription = (id: string): string => {
		switch (id) {
			case 'availability':
				return 'Análise detalhada da disponibilidade de produtos no sistema'
			case 'problems':
				return 'Visão geral dos problemas mais frequentes e suas categorias'
			case 'performance':
				return 'Métricas de performance e produtividade da equipe'
			case 'projects':
				return 'Análise completa de projetos, atividades e progresso'
			case 'executive':
				return 'Resumo executivo com indicadores-chave de performance'
			default:
				return 'Descrição do relatório'
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-6'>
				<div className='max-w-7xl mx-auto'>
					<div className='flex items-center justify-center h-64'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-6'>
				<div className='max-w-7xl mx-auto'>
					<div className='bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6'>
						<h2 className='text-lg font-semibold text-red-800 dark:text-red-200 mb-2'>Erro ao carregar relatório</h2>
						<p className='text-red-600 dark:text-red-300 mb-4'>{error}</p>
					</div>
				</div>
			</div>
		)
	}

	if (!report) {
		return (
			<div className='min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-6'>
				<div className='max-w-7xl mx-auto'>
					<div className='bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6'>
						<h2 className='text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>Relatório não encontrado</h2>
						<p className='text-yellow-600 dark:text-yellow-300 mb-4'>O relatório solicitado não foi encontrado ou não está disponível.</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen w-full bg-gray-50 dark:bg-gray-900'>
			{/* Header */}
			<div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
				<div className='mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center'>
							<div>
								<h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100'>{report.title}</h1>
								<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{report.description}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filtros do Relatório - AQUI ESTÃO OS FILTROS EM CADA PÁGINA ESPECÍFICA */}

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8'>
				<ReportFilters filters={filters} onFiltersChange={handleFiltersChange} reportType={reportId as 'availability' | 'problems' | 'performance' | 'projects'} />
			</div>

			{/* Content */}
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8'>
				<div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8'>
					{/* Gráfico Principal */}
					<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
						<h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4'>Visualização dos Dados</h3>
						<ReportChart type='bar' data={report.data} reportType={report.type} />
					</div>

					{/* Métricas */}
					<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
						<h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4'>Métricas Principais</h3>
						<div className='space-y-3 sm:space-y-4'>{renderMetrics(report.data, report.type)}</div>
					</div>
				</div>

				{/* Gráficos Adicionais */}
				<div className='mt-6 sm:mt-8 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8'>
					<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
						<h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4'>Tendências</h3>
						<ReportChart type='line' data={report.data} reportType={report.type} />
					</div>
					<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
						<h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4'>Distribuição</h3>
						<ReportChart type='donut' data={report.data} reportType={report.type} />
					</div>
				</div>

				{/* Tabela Detalhada - Apenas para relatório de projetos */}
				{report.type === 'projects' && (
					<div className='mt-6 sm:mt-8'>
						<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
							<h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>Detalhamento dos Projetos</h3>
							{renderProjectsTable(report.data)}
						</div>
					</div>
				)}

				{/* Tabela Detalhada - Apenas para relatório de disponibilidade */}
				{report.type === 'availability' && (
					<div className='mt-6 sm:mt-8'>
						<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
							<h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>Detalhamento dos Produtos</h3>
							{renderAvailabilityTable(report.data)}
						</div>
					</div>
				)}

				{/* Tabela Detalhada - Apenas para relatório de problemas */}
				{report.type === 'problems' && (
					<div className='mt-6 sm:mt-8'>
						<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
							<h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>Detalhamento dos Problemas</h3>
							{renderProblemsTable(report.data)}
						</div>
					</div>
				)}

				{/* Tabela Detalhada - Apenas para relatório de performance */}
				{report.type === 'performance' && (
					<div className='mt-6 sm:mt-8'>
						<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
							<h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>Detalhamento da Performance da Equipe</h3>
							{renderPerformanceTable(report.data)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

function renderMetrics(data: Record<string, unknown>, reportType: string) {
	switch (reportType) {
		case 'availability':
			return (
				<>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base'>Total de Produtos</span>
						<span className='text-blue-900 dark:text-blue-100 font-bold text-lg sm:text-xl'>{(data.totalProducts as number) || 0}</span>
					</div>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-green-50 dark:bg-green-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-green-800 dark:text-green-200 font-medium text-sm sm:text-base'>Disponibilidade Média</span>
						<span className='text-green-900 dark:text-green-100 font-bold text-lg sm:text-xl'>{(data.avgAvailability as number) ? `${(data.avgAvailability as number).toFixed(1)}%` : '0%'}</span>
					</div>
				</>
			)

		case 'problems':
			return (
				<>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-red-50 dark:bg-red-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-red-800 dark:text-red-200 font-medium text-sm sm:text-base'>Total de Problemas</span>
						<span className='text-red-900 dark:text-red-100 font-bold text-lg sm:text-xl'>{(data.totalProblems as number) || 0}</span>
					</div>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-yellow-800 dark:text-yellow-200 font-medium text-sm sm:text-base'>Tempo Médio de Resolução</span>
						<span className='text-yellow-900 dark:text-yellow-100 font-bold text-lg sm:text-xl'>{(data.avgResolutionHours as number) ? `${(data.avgResolutionHours as number).toFixed(1)}h` : '0h'}</span>
					</div>
				</>
			)

		case 'performance':
			return (
				<>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base'>Total de Problemas</span>
						<span className='text-blue-900 dark:text-blue-100 font-bold text-lg sm:text-xl'>{((data.summary as Record<string, unknown>)?.totalProblems as number) || 0}</span>
					</div>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-green-50 dark:bg-green-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-green-800 dark:text-green-200 font-medium text-sm sm:text-base'>Total de Soluções</span>
						<span className='text-green-900 dark:text-green-100 font-bold text-lg sm:text-xl'>{((data.summary as Record<string, unknown>)?.totalSolutions as number) || 0}</span>
					</div>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-purple-800 dark:text-purple-200 font-medium text-sm sm:text-base'>Usuários Ativos</span>
						<span className='text-purple-900 dark:text-purple-100 font-bold text-lg sm:text-xl'>{((data.summary as Record<string, unknown>)?.activeUsers as number) || 0}</span>
					</div>
				</>
			)

		case 'projects':
			return (
				<>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base'>Total de Projetos</span>
						<span className='text-blue-900 dark:text-blue-100 font-bold text-lg sm:text-xl'>{((data.summary as Record<string, unknown>)?.totalProjects as number) || 0}</span>
					</div>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-green-50 dark:bg-green-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-green-800 dark:text-green-200 font-medium text-sm sm:text-base'>Total de Atividades</span>
						<span className='text-green-900 dark:text-green-100 font-bold text-lg sm:text-xl'>{((data.summary as Record<string, unknown>)?.totalActivities as number) || 0}</span>
					</div>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-950 rounded-lg space-y-2 sm:space-y-0'>
						<span className='text-purple-800 dark:text-purple-200 font-medium text-sm sm:text-base'>Progresso Médio</span>
						<span className='text-purple-900 dark:text-purple-100 font-bold text-lg sm:text-xl'>{((data.summary as Record<string, unknown>)?.avgProgress as number) || 0}%</span>
					</div>
				</>
			)

		default:
			return <div className='text-gray-500 dark:text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base'>Métricas não disponíveis para este tipo de relatório</div>
	}
}

function renderProjectsTable(data: Record<string, unknown>) {
	const projectsWithProgress = (data.projectsWithProgress as Array<Record<string, unknown>>) || []
	const mostActiveProjects = (data.mostActiveProjects as Array<Record<string, unknown>>) || []

	if (projectsWithProgress.length === 0) {
		return (
			<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
				<p>Nenhum projeto encontrado para o período selecionado.</p>
			</div>
		)
	}

	const getStatusColor = (status: string) => {
		const statusColors: Record<string, string> = {
			active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
			completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
			paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
			cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		}
		return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
	}

	const getPriorityColor = (priority: string) => {
		const priorityColors: Record<string, string> = {
			urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
			high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
			medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
			low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		}
		return priorityColors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
	}

	const getStatusLabel = (status: string) => {
		const statusLabels: Record<string, string> = {
			active: 'Ativo',
			completed: 'Concluído',
			paused: 'Pausado',
			cancelled: 'Cancelado',
		}
		return statusLabels[status] || status
	}

	const getPriorityLabel = (priority: string) => {
		const priorityLabels: Record<string, string> = {
			urgent: 'Urgente',
			high: 'Alta',
			medium: 'Média',
			low: 'Baixa',
		}
		return priorityLabels[priority] || priority
	}

	// Função para obter contagem de atividades por projeto
	const getProjectActivityCount = (projectId: string) => {
		const project = mostActiveProjects.find((p: Record<string, unknown>) => p.projectId === projectId)
		return project ? (project.activityCount as number) : 0
	}

	// Função para obter contagem de tarefas por projeto
	const getProjectTaskCount = () => {
		const tasksByStatus = (data.tasksByStatus as Record<string, number>) || {}
		// Para simplificar, vamos usar o total de tarefas do período
		return Object.values(tasksByStatus).reduce((sum, count) => sum + count, 0)
	}

	return (
		<div className='overflow-x-auto'>
			<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
				<thead className='bg-gray-50 dark:bg-gray-700'>
					<tr>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Projeto</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Status</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Prioridade</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Progresso</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Atividades</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Tarefas</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Usuários</th>
					</tr>
				</thead>
				<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
					{projectsWithProgress.map((project, index) => (
						<tr key={project.id as string} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
							<td className='px-6 py-4 whitespace-nowrap'>
								<div className='flex items-center'>
									<div className='flex-shrink-0 h-10 w-10'>
										<div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center'>
											<span className='text-sm font-medium text-white'>{(project.name as string)?.charAt(0)?.toUpperCase() || 'P'}</span>
										</div>
									</div>
									<div className='ml-4 min-w-0 flex-1'>
										<div className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>{project.name as string}</div>
										<div className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs' title={project.description as string}>
											{(project.description as string) || 'Sem descrição'}
										</div>
									</div>
								</div>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status as string)}`}>{getStatusLabel(project.status as string)}</span>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(project.priority as string)}`}>{getPriorityLabel(project.priority as string)}</span>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<div className='flex items-center'>
									<div className='w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2'>
										<div className='bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300' style={{ width: `${(project.progress as number) || 0}%` }}></div>
									</div>
									<span className='text-sm text-gray-900 dark:text-gray-100'>{(project.progress as number) || 0}%</span>
								</div>
							</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>{getProjectActivityCount(project.id as string)}</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>{getProjectTaskCount()}</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<div className='flex items-center'>
									{((project.users as Array<Record<string, unknown>>) || []).length === 0 ? (
										<span className='text-xs text-gray-400 dark:text-gray-500'>Sem usuários</span>
									) : (
										<div className='flex -space-x-2'>
											{((project.users as Array<Record<string, unknown>>) || []).map((user, index) => (
												<div key={user.id as string} className='relative' title={`${user.name as string} (${user.email as string})`} style={{ zIndex: ((project.users as Array<Record<string, unknown>>) || []).length - index }}>
													<div className='h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm'>
														<span className='text-sm font-medium text-white'>{(user.name as string)?.charAt(0)?.toUpperCase() || 'U'}</span>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function renderAvailabilityTable(data: Record<string, unknown>) {
	const products = (data.products as Array<Record<string, unknown>>) || []

	if (products.length === 0) {
		return (
			<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
				<p>Nenhum produto encontrado para o período selecionado.</p>
			</div>
		)
	}

	const getAvailabilityColor = (availability: number) => {
		if (availability >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
		if (availability >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
		if (availability >= 50) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
		return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
	}

	const getProductStatusColor = (status: string) => {
		const statusColors: Record<string, string> = {
			active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
			stable: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
			warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
			critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		}
		return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
	}

	const getProductStatusLabel = (status: string) => {
		const statusLabels: Record<string, string> = {
			active: 'Ativo',
			stable: 'Estável',
			warning: 'Atenção',
			critical: 'Crítico',
		}
		return statusLabels[status] || status
	}

	return (
		<div className='overflow-x-auto'>
			<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
				<thead className='bg-gray-50 dark:bg-gray-700'>
					<tr>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Produto</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Status</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Disponibilidade</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Total Atividades</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Atividades Falharam</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Última Atividade</th>
					</tr>
				</thead>
				<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
					{products.map((product, index) => (
						<tr key={product.id as string} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
							<td className='px-6 py-4 whitespace-nowrap'>
								<div className='flex items-center'>
									<div className='flex-shrink-0 h-10 w-10'>
										<div className='h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center'>
											<span className='text-sm font-medium text-white'>{(product.name as string)?.charAt(0)?.toUpperCase() || 'P'}</span>
										</div>
									</div>
									<div className='ml-4 min-w-0 flex-1'>
										<div className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>{product.name as string}</div>
										<div className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs' title={product.description as string}>
											{(product.description as string) || 'Sem descrição'}
										</div>
									</div>
								</div>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProductStatusColor((product.status as string) || '')}`}>{getProductStatusLabel((product.status as string) || '')}</span>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<div className='flex items-center'>
									<div className='w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2'>
										<div className='bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300' style={{ width: `${(product.availabilityPercentage as number) || 0}%` }}></div>
									</div>
									<span className={`text-sm font-semibold ${getAvailabilityColor((product.availabilityPercentage as number) || 0)} px-2 py-1 rounded-full`}>{(product.availabilityPercentage as number) || 0}%</span>
								</div>
							</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>{(product.totalActivities as number) || 0}</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>{(product.failedActivities as number) || 0}</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{(product.lastActivityDate as string) ? new Date(product.lastActivityDate as string).toLocaleDateString('pt-BR') : 'Nunca'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
function renderProblemsTable(data: Record<string, unknown>) {
	const problems = (data.topProblems as Array<Record<string, unknown>>) || []

	if (problems.length === 0) {
		return (
			<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
				<p>Nenhum problema encontrado para o período selecionado.</p>
			</div>
		)
	}

	const getCategoryColor = (category: string) => {
		const categoryColors: Record<string, string> = {
			'rede externa': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
			'rede interna': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
			'servidor indisponível': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
			'falha humana': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
			'erro no software': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
			outros: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
		}
		return categoryColors[category.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
	}

	return (
		<div className='overflow-x-auto'>
			<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
				<thead className='bg-gray-50 dark:bg-gray-700'>
					<tr>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Problema</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Produto</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Categoria</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Prioridade</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Status</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Soluções</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Data Criação</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Última Atualização</th>
					</tr>
				</thead>
				<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
					{problems.map((problem, index) => (
						<tr key={problem.id as string} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
							<td className='px-6 py-4 whitespace-nowrap'>
								<div className='flex items-center'>
									<div className='flex-shrink-0 h-10 w-10'>
										<div className='h-10 w-10 rounded-full bg-gradient-to-r from-red-400 to-orange-500 flex items-center justify-center'>
											<span className='text-sm font-medium text-white'>⚠️</span>
										</div>
									</div>
									<div className='ml-4 min-w-0 flex-1'>
										<div className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs' title={problem.title as string}>
											{(problem.title as string) || 'Sem título'}
										</div>
										<div className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs' title={problem.description as string}>
											{(problem.description as string) || 'Sem descrição'}
										</div>
									</div>
								</div>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<div className='flex items-center'>
									<div className='flex-shrink-0 h-8 w-8'>
										<div className='h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center'>
											<span className='text-xs font-medium text-white'>{((problem.product as Record<string, unknown>)?.name as string)?.charAt(0)?.toUpperCase() || 'P'}</span>
										</div>
									</div>
									<div className='ml-3'>
										<div className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-24' title={(problem.product as Record<string, unknown>)?.name as string}>
											{((problem.product as Record<string, unknown>)?.name as string) || 'Produto não encontrado'}
										</div>
									</div>
								</div>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(((problem.category as Record<string, unknown>)?.name as string) || '')}`}>{((problem.category as Record<string, unknown>)?.name as string) || 'Sem categoria'}</span>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<span className='text-sm text-gray-500 dark:text-gray-400'>N/A</span>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<span className='text-sm text-gray-500 dark:text-gray-400'>N/A</span>
							</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>{(problem.solutionsCount as number) || 0}</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{(problem.createdAt as string) ? new Date(problem.createdAt as string).toLocaleDateString('pt-BR') : 'N/A'}</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{(problem.updatedAt as string) ? new Date(problem.updatedAt as string).toLocaleDateString('pt-BR') : 'N/A'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function renderPerformanceTable(data: Record<string, unknown>) {
	const userPerformance = (data.userPerformance as Array<Record<string, unknown>>) || []

	if (userPerformance.length === 0) {
		return (
			<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
				<p>Nenhum usuário encontrado para o período selecionado.</p>
			</div>
		)
	}

	const getProductivityColor = (productivity: number) => {
		if (productivity >= 10) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
		if (productivity >= 5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
		if (productivity >= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
		return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
	}

	const getProductivityLabel = (productivity: number) => {
		if (productivity >= 10) return 'Excelente'
		if (productivity >= 5) return 'Bom'
		if (productivity >= 2) return 'Regular'
		return 'Baixo'
	}

	return (
		<div className='overflow-x-auto'>
			<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
				<thead className='bg-gray-50 dark:bg-gray-700'>
					<tr>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Usuário</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Performance</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Problemas Criados</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Soluções Fornecidas</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Produtividade</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Última Atividade</th>
					</tr>
				</thead>
				<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
					{userPerformance.map((user, index) => (
						<tr key={user.userId as string} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
							<td className='px-6 py-4 whitespace-nowrap'>
								<div className='flex items-center'>
									<div className='flex-shrink-0 h-10 w-10'>
										<div className='h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center'>
											<span className='text-sm font-medium text-white'>{(user.name as string)?.charAt(0)?.toUpperCase() || 'U'}</span>
										</div>
									</div>
									<div className='ml-4 min-w-0 flex-1'>
										<div className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>{user.name as string}</div>
										<div className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs' title={user.email as string}>
											{user.email as string}
										</div>
									</div>
								</div>
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProductivityColor((user.productivity as number) || 0)}`}>{getProductivityLabel((user.productivity as number) || 0)}</span>
							</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>{(user.problemsCreated as number) || 0}</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>{(user.solutionsProvided as number) || 0}</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<div className='flex items-center'>
									<div className='w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2'>
										<div className='bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300' style={{ width: `${Math.min(((user.productivity as number) || 0) * 10, 100)}%` }}></div>
									</div>
									<span className='text-sm font-semibold text-gray-900 dark:text-gray-100'>{(user.productivity as number) || 0}</span>
								</div>
							</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{(user.lastActivity as number) ? new Date(user.lastActivity as number).toLocaleDateString('pt-BR') : 'Nunca'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
