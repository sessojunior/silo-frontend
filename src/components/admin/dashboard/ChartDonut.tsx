'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { ApexOptions } from 'apexcharts'

// Importa dinamicamente o ApexChart para evitar SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function ChartDonut() {
	const [mounted, setMounted] = useState(false)

	const series = [65, 17, 21, 48, 121]
	const labels = ['Rede externa', 'Servidor indisponível', 'Falha humana', 'Rede interna', 'Erro no software']

	const options: ApexOptions = {
		chart: {
			type: 'donut',
			width: '100%',
		},
		labels,
		plotOptions: {
			pie: {
				startAngle: -90,
				endAngle: 270,
				expandOnClick: false,
			},
		},
		dataLabels: {
			enabled: false,
		},
		fill: {
			type: 'gradient',
		},
		legend: {
			show: true,
			position: 'left',
			formatter: function (val, opts) {
				const value = opts.w.globals.series[opts.seriesIndex]
				return `${val}: ${value}`
			},
			labels: {
				colors: 'inherit',
				useSeriesColors: false,
			},
			fontSize: '14px',
			itemMargin: {
				vertical: 4,
			},
		},
		responsive: [
			{
				breakpoint: 480,
				options: {
					chart: {
						width: 200,
					},
					legend: {
						position: 'bottom',
					},
				},
			},
		],
	}

	useEffect(() => {
		setMounted(true)
	}, [])

	return <div className='w-full max-w-lg'>{mounted && <ReactApexChart options={options} series={series} type='donut' height={360} />}</div>
}
