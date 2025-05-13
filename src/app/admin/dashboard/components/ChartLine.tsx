'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { ApexOptions } from 'apexcharts'

// Importação dinâmica para evitar SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function ChartLine() {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const series = [
		{
			name: 'Problemas',
			data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
		},
		{
			name: 'Soluções',
			data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35],
		},
	]

	const options: ApexOptions = {
		chart: {
			type: 'line',
			toolbar: { show: false },
			zoom: { enabled: false },
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			width: [5, 7],
			curve: 'straight',
			dashArray: [0, 8],
		},
		markers: {
			size: 0,
			hover: {
				sizeOffset: 6,
			},
		},
		xaxis: {
			categories: ['01/01', '02/01', '03/01', '04/01', '05/01', '06/01', '07/01', '08/01', '09/01', '10/01', '11/01', '12/01'],
		},
		tooltip: {
			y: [
				{
					title: {
						formatter: (val: string) => `${val}:`,
					},
				},
				{
					title: {
						formatter: (val: string) => `${val} documentadas:`,
					},
				},
			],
		},
		grid: {
			borderColor: '#f1f1f1',
		},
	}

	return <div className='w-full max-w-lg'>{mounted && <ReactApexChart options={options} series={series} type='line' height={360} />}</div>
}
