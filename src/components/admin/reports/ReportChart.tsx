'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Importação dinâmica do ApexCharts para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface ReportChartProps {
	type: 'line' | 'bar' | 'donut' | 'area'
	data: Record<string, unknown>
	reportType?: 'availability' | 'problems' | 'performance' | 'executive'
	height?: number
	className?: string
}

export function ReportChart({ type, data, reportType, height = 300, className = '' }: ReportChartProps) {
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	if (!isMounted) {
		return (
			<div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
				</div>
			</div>
		)
	}

	// Logs de debug
	console.log('🔵 ReportChart renderizando:', { type, reportType, dataKeys: Object.keys(data || {}) })

	const getChartTitle = () => {
		if (!reportType) return 'Gráfico'

		switch (reportType) {
			case 'availability':
				return 'Disponibilidade por Produto'
			case 'problems':
				return 'Problemas por Categoria'
			case 'performance':
				return 'Performance da Equipe'
			case 'executive':
				return 'Resumo Executivo'
			default:
				return 'Gráfico'
		}
	}

	const getChartSeries = () => {
		if (!reportType || !data) return []

		switch (reportType) {
			case 'availability':
				if (data.products && Array.isArray(data.products)) {
					// Para gráficos donut, categorizar produtos por nível de disponibilidade
					if (type === 'donut') {
						const availableProducts = data.products.filter((item: Record<string, unknown>) => (parseFloat(item.availabilityPercentage as string) || 0) >= 90).length
						const warningProducts = data.products.filter((item: Record<string, unknown>) => {
							const availability = parseFloat(item.availabilityPercentage as string) || 0
							return availability >= 70 && availability < 90
						}).length
						const criticalProducts = data.products.filter((item: Record<string, unknown>) => (parseFloat(item.availabilityPercentage as string) || 0) < 70).length

						// Calcular porcentagens baseadas nas contagens
						const totalProducts = data.products.length
						const availablePercentage = totalProducts > 0 ? Math.round((availableProducts / totalProducts) * 1000) / 10 : 0
						const warningPercentage = totalProducts > 0 ? Math.round((warningProducts / totalProducts) * 1000) / 10 : 0
						const criticalPercentage = totalProducts > 0 ? Math.round((criticalProducts / totalProducts) * 1000) / 10 : 0

						return [availablePercentage, warningPercentage, criticalPercentage]
					} else {
						// Para gráficos de barra e linha, usar dados individuais
						return [
							{
								name: 'Disponibilidade (%)',
								data: data.products.map((item: Record<string, unknown>) => parseFloat(item.availabilityPercentage as string) || 0),
							},
						]
					}
				}
				break
			case 'problems':
				if (data.problemsByCategory && Array.isArray(data.problemsByCategory)) {
					// Para gráficos donut, calcular porcentagens baseadas nas contagens
					if (type === 'donut') {
						const totalProblems = data.problemsByCategory.reduce((sum: number, item: Record<string, unknown>) => sum + (parseInt(item.problemsCount as string) || 0), 0)

						// Calcular porcentagens para cada categoria
						return data.problemsByCategory.map((item: Record<string, unknown>) => {
							const count = parseInt(item.problemsCount as string) || 0
							const percentage = totalProblems > 0 ? Math.round((count / totalProblems) * 1000) / 10 : 0
							return percentage
						})
					} else {
						// Para gráficos de barra e linha, usar formato de série
						return [
							{
								name: 'Quantidade de Problemas',
								data: data.problemsByCategory.map((item: Record<string, unknown>) => parseInt(item.problemsCount as string) || 0),
							},
						]
					}
				}
				break
			case 'performance':
				if (data.userPerformance && Array.isArray(data.userPerformance)) {
					// Para gráficos de barra e linha, usar múltiplas séries
					if (type !== 'donut') {
						return [
							{
								name: 'Problemas Criados',
								data: data.userPerformance.map((user: Record<string, unknown>) => parseInt(user.problemsCreated as string) || 0),
							},
							{
								name: 'Soluções Fornecidas',
								data: data.userPerformance.map((user: Record<string, unknown>) => parseInt(user.solutionsProvided as string) || 0),
							},
						]
					} else {
						// Para gráfico donut, calcular porcentagens baseadas nos totais
						const totalProblems = data.userPerformance.reduce((sum: number, user: Record<string, unknown>) => sum + (parseInt(user.problemsCreated as string) || 0), 0)
						const totalSolutions = data.userPerformance.reduce((sum: number, user: Record<string, unknown>) => sum + (parseInt(user.solutionsProvided as string) || 0), 0)
						const total = totalProblems + totalSolutions

						// Calcular porcentagens para problemas e soluções
						const problemsPercentage = total > 0 ? Math.round((totalProblems / total) * 1000) / 10 : 0
						const solutionsPercentage = total > 0 ? Math.round((totalSolutions / total) * 1000) / 10 : 0

						return [problemsPercentage, solutionsPercentage]
					}
				}
				break
		}

		return []
	}

	const getChartLabels = () => {
		if (!reportType || !data) return []

		switch (reportType) {
			case 'availability':
				if (data.products && Array.isArray(data.products)) {
					// Para gráficos donut, usar categorias de disponibilidade
					if (type === 'donut') {
						return ['Disponível (≥90%)', 'Atenção (70-89%)', 'Crítico (<70%)']
					} else {
						// Para gráficos de barra e linha, usar nomes dos produtos
						return data.products.map((item: Record<string, unknown>) => (item.name as string) || 'Produto')
					}
				}
				break
			case 'problems':
				if (data.problemsByCategory && Array.isArray(data.problemsByCategory)) {
					return data.problemsByCategory.map((item: Record<string, unknown>) => (item.name as string) || 'Categoria')
				}
				break
			case 'performance':
				if (data.userPerformance && Array.isArray(data.userPerformance)) {
					// Para gráficos donut, usar labels específicos para problemas e soluções
					if (type === 'donut') {
						return ['Problemas Criados', 'Soluções Fornecidas']
					} else {
						return data.userPerformance.map((user: Record<string, unknown>) => (user.name as string) || 'Usuário')
					}
				}
				break
		}

		return []
	}

	const getChartOptions = () => {
		const baseOptions = {
			chart: {
				type,
				toolbar: {
					show: true,
					tools: {
						download: true,
						selection: true,
						zoom: true,
						zoomin: true,
						zoomout: true,
						pan: true,
						reset: true,
					},
				},
				background: 'transparent',
			},
			theme: {
				mode: 'light' as const,
			},
			title: {
				text: getChartTitle(),
				align: 'left' as const,
				style: {
					fontSize: '16px',
					fontWeight: 600,
					color: '#374151',
				},
			},
			colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
			legend: {
				position: 'bottom' as const,
				labels: {
					colors: '#6b7280',
				},
			},
			grid: {
				borderColor: '#e5e7eb',
				strokeDashArray: 5,
			},
			xaxis: {
				labels: {
					style: {
						colors: '#6b7280',
					},
				},
			},
			yaxis: {
				labels: {
					style: {
						colors: '#6b7280',
					},
				},
			},
			tooltip: {
				theme: 'light' as const,
				y: {
					formatter: (value: number) => {
						if (type === 'donut') {
							// Para gráficos donut, exibir com uma casa decimal e símbolo %
							return `${value.toFixed(1)}%`
						}
						return value.toLocaleString('pt-BR')
					},
				},
			},
		}

		// Configurações específicas por tipo
		switch (type) {
			case 'line':
				return {
					...baseOptions,
					stroke: {
						curve: 'smooth' as const,
						width: 3,
					},
					markers: {
						size: 5,
						hover: {
							size: 7,
						},
					},
				}

			case 'bar':
				return {
					...baseOptions,
					plotOptions: {
						bar: {
							borderRadius: 4,
							columnWidth: '70%',
						},
					},
				}

			case 'donut':
				return {
					...baseOptions,
					plotOptions: {
						pie: {
							donut: {
								size: '60%',
								labels: {
									show: true,
									name: {
										show: true,
										fontSize: '14px',
										fontWeight: 600,
										color: '#374151',
									},
									value: {
										show: true,
										fontSize: '16px',
										fontWeight: 700,
										color: '#374151',
										formatter: (val: string) => {
											const value = parseFloat(val)
											return `${value.toFixed(1)}%`
										},
									},
								},
							},
						},
					},
					// Para gráficos donut, configurar legendas das séries
					labels: getChartLabels(),
					// Configurar cores específicas baseadas no tipo de relatório
					colors:
						reportType === 'availability'
							? ['#10b981', '#f59e0b', '#ef4444'] // Verde para disponível, amarelo para atenção, vermelho para crítico
							: reportType === 'problems'
								? data.problemsByCategory && Array.isArray(data.problemsByCategory)
									? data.problemsByCategory.map((item: Record<string, unknown>) => (item.color as string) || '#6b7280')
									: ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'] // Cores padrão para problemas
								: ['#ef4444', '#10b981'], // Vermelho para problemas, verde para soluções (performance)
					legend: {
						...baseOptions.legend,
					},
				}

			case 'area':
				return {
					...baseOptions,
					stroke: {
						curve: 'smooth' as const,
						width: 2,
					},
					fill: {
						type: 'gradient',
						gradient: {
							shadeIntensity: 1,
							opacityFrom: 0.7,
							opacityTo: 0.3,
							stops: [0, 100],
						},
					},
				}

			default:
				return baseOptions
		}
	}

	const chartOptions = getChartOptions()
	const chartSeries = getChartSeries()
	const chartLabels = getChartLabels()

	console.log('📊 Chart Series:', chartSeries)
	console.log('🏷️ Chart Labels:', chartLabels)
	console.log('📈 Chart Type:', type)

	// Atualizar as opções do gráfico com os labels
	if (chartLabels.length > 0) {
		;(chartOptions.xaxis as Record<string, unknown>).categories = chartLabels
	}

	return (
		<div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
			<Chart options={chartOptions} series={chartSeries} type={type} height={height} />
		</div>
	)
}
