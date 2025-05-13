'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import type { ApexOptions } from 'apexcharts'

// Importação dinâmica para evitar SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function ChartColumn() {
	const [isClient, setIsClient] = useState(false)

	// Simula os dados reativos do Svelte
	const [series] = useState([
		{
			name: 'Incidentes',
			data: [44, 55, 41, 67, 22, 43, 21],
		},
	])

	const [options] = useState<ApexOptions>({
		chart: {
			type: 'bar',
			toolbar: { show: false },
		},
		plotOptions: {
			bar: {
				borderRadius: 8,
				columnWidth: '50%',
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			width: 0,
		},
		grid: {
			show: false,
			row: {
				colors: ['#fff', '#f2f2f2'],
			},
		},
		xaxis: {
			labels: {
				rotate: -45,
			},
			categories: ['25/02', '26/02', '27/02', '28/02', '01/03', '02/03', '03/03'],
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				type: 'horizontal',
				shadeIntensity: 0.25,
				gradientToColors: undefined,
				inverseColors: true,
				opacityFrom: 0.85,
				opacityTo: 0.85,
				stops: [50, 0, 100],
			},
		},
	})

	// Evita SSR
	useEffect(() => {
		setIsClient(true)
	}, [])

	return <div className='w-full max-w-lg'>{isClient && <ReactApexChart options={options} series={series} type='bar' height={320} />}</div>
}
