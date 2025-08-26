'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ReportChart } from './ReportChart'
import { ExportDialog } from './ExportDialog'
import { ReportFilters } from './ReportFilters'
import Button from '@/components/ui/Button'

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
	const router = useRouter()
	const [report, setReport] = useState<ReportData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showExportDialog, setShowExportDialog] = useState(false)
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

	const handleBack = () => {
		router.push('/admin/reports')
	}

	const handleExport = () => {
		setShowExportDialog(true)
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
						<Button onClick={handleBack} style='bordered'>
							Voltar aos Relatórios
						</Button>
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
						<Button onClick={handleBack} style='bordered'>
							Voltar aos Relatórios
						</Button>
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
							<Button onClick={handleBack} style='bordered' className='flex items-center mr-4'>
								<span className='mr-2'>←</span>
								Voltar
							</Button>
							<div>
								<h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100'>{report.title}</h1>
								<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{report.description}</p>
							</div>
						</div>
						<Button onClick={handleExport} className='bg-blue-600 hover:bg-blue-700 text-white'>
							Exportar Relatório
						</Button>
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
			</div>

			{/* Export Dialog */}
			{showExportDialog && <ExportDialog isOpen={showExportDialog} onClose={() => setShowExportDialog(false)} reportType={report.type} reportData={report.data} />}
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
