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
					return [
						{
							name: 'Disponibilidade (%)',
							data: data.products.map((item: Record<string, unknown>) => parseFloat(item.availabilityPercentage as string) || 0),
						},
					]
				}
				break
			case 'problems':
				if (data.problemsByCategory && Array.isArray(data.problemsByCategory)) {
					return [
						{
							name: 'Quantidade de Problemas',
							data: data.problemsByCategory.map((item: Record<string, unknown>) => parseInt(item.problemsCount as string) || 0),
						},
					]
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
					return data.products.map((item: Record<string, unknown>) => (item.name as string) || 'Produto')
				}
				break
			case 'problems':
				if (data.problemsByCategory && Array.isArray(data.problemsByCategory)) {
					return data.problemsByCategory.map((item: Record<string, unknown>) => (item.name as string) || 'Categoria')
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
							return `${value}%`
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
									},
								},
							},
						},
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
