'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo } from 'react'
import type { ApexOptions } from 'apexcharts'

// Importação dinâmica para evitar SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function ChartColumn({ categories, data }: { categories: string[]; data: number[] }) {
	const [isClient, setIsClient] = useState(false)

	// Tons claros e escuros para cada faixa
	const LIGHT = {
		green: '#05DF72',
		orange: '#FF8904',
		red: '#e7000b',
	}
	const DARK = {
		green: '#05df7296',
		orange: '#ff8a04b7',
		red: '#e7000cba',
	}

	// Arrays de cores por barra (claro → escuro)
	const { leftColors, rightColors } = useMemo(() => {
		const left: string[] = []
		const right: string[] = []

		data.forEach((v) => {
			if (v <= 2) {
				left.push(LIGHT.green)
				right.push(DARK.green)
			} else if (v <= 4) {
				left.push(LIGHT.orange)
				right.push(DARK.orange)
			} else {
				left.push(LIGHT.red)
				right.push(DARK.red)
			}
		})

		return { leftColors: left, rightColors: right }
	}, [data])

	const series = useMemo(
		() => [
			{
				name: 'Incidentes',
				data,
			},
		],
		[data],
	)

	const options: ApexOptions = useMemo(
		() => ({
			chart: {
				type: 'bar',
				toolbar: { show: false },
			},
			plotOptions: {
				bar: {
					distributed: true,
					borderRadius: 8,
					columnWidth: '50%',
				},
			},
			legend: { show: false },
			colors: leftColors,
			dataLabels: { enabled: false },
			stroke: { width: 0 },
			grid: {
				show: false,
				row: {
					colors: ['#fff', '#f2f2f2'],
				},
			},
			xaxis: {
				categories,
				labels: { rotate: -45 },
			},
			fill: {
				type: 'gradient',
				gradient: {
					type: 'horizontal',
					shadeIntensity: 0.25,
					gradientToColors: undefined,
					opacityFrom: 0.85,
					opacityTo: 0.85,
					stops: [50, 0, 100],
				},
			},
		}),
		[categories, leftColors, rightColors],
	)

	useEffect(() => {
		setIsClient(true)
	}, [])

	return <div className='w-full max-w-lg'>{isClient && <ReactApexChart options={options} series={series} type='bar' height={320} />}</div>
}
