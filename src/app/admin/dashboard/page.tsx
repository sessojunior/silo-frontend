'use client'

import ChartColumn from '@/components/admin/dashboard/ChartColumn'
import ChartLine from '@/components/admin/dashboard/ChartLine'
import ChartDonut from '@/components/admin/dashboard/ChartDonut'

import CircleProgress from '@/components/admin/dashboard/CircleProgress'
import Stats from '@/components/admin/dashboard/Stats'
import Radial from '@/components/admin/dashboard/Radial'
import Project from '@/components/admin/dashboard/Project'
import Product from '@/components/admin/dashboard/Product'
import ProductSkeleton from '@/components/admin/dashboard/ProductSkeleton'
import Link from 'next/link'

type ProductDateStatus = {
	date: string
	turn: number
	user_id: string
	status: string
	description: string | null
	alert: boolean
}

type DashboardProduct = {
	productId: string
	name: string
	priority: string
	last_run: string | null
	percent_completed: number
	dates: ProductDateStatus[]
	turns: string[]
}

import { useEffect, useState } from 'react'

function splitGroups(items: DashboardProduct[]) {
	return {
		notStarted: items.filter((p) => p.percent_completed === 0),
		running: items.filter((p) => p.percent_completed > 0 && p.percent_completed < 100),
		finished: items.filter((p) => p.percent_completed === 100),
	}
}

export default function DashboardPage() {
	const [data, setData] = useState<DashboardProduct[]>([])
	const [loading, setLoading] = useState(true)
	const [projects, setProjects] = useState<{ projectId: string; name: string; shortDescription: string; elapsedText: string; progress: number; time: string }[]>([])
	const [projectsLoading, setProjectsLoading] = useState(true)

	useEffect(() => {
		async function load() {
			const res = await fetch('/api/admin/dashboard')
			if (res.ok) {
				setData(await res.json())
			}
			setLoading(false)
		}
		load()
	}, [])

	// Carregar projetos em andamento
	useEffect(() => {
		async function loadProjects() {
			try {
				const res = await fetch('/api/admin/dashboard/projects')
				if (res.ok) {
					setProjects(await res.json())
				}
			} catch (error) {
				console.error('⚠️ Erro ao carregar projetos em andamento', error)
			} finally {
				setProjectsLoading(false)
			}
		}
		loadProjects()
	}, [])

	const groups = splitGroups(data)

	// ===== Estatísticas dinâmicas =====
	const today = new Date()
	const cut28 = new Date()
	cut28.setDate(today.getDate() - 28)

	// Mapeamento de status → info visual
	const STATUS_INFO: Record<string, { label: string; color: string; colorDark: string; severity: number }> = {
		completed: { label: 'Concluídos', color: 'bg-green-400', colorDark: 'bg-green-700', severity: 0 },
		waiting: { label: 'Aguardando', color: 'bg-zinc-400', colorDark: 'bg-zinc-500', severity: 1 },
		in_progress: { label: 'Em execução', color: 'bg-zinc-100', colorDark: 'bg-zinc-600', severity: 2 },
		pending: { label: 'Pendentes', color: 'bg-orange-600', colorDark: 'bg-orange-500', severity: 3 },
		under_support: { label: 'Sob intervenção', color: 'bg-orange-500', colorDark: 'bg-orange-600', severity: 3 },
		suspended: { label: 'Suspensos', color: 'bg-orange-400', colorDark: 'bg-orange-700', severity: 3 },
		not_run: { label: 'Não rodaram', color: 'bg-red-600', colorDark: 'bg-red-500', severity: 4 },
		with_problems: { label: 'Com problemas', color: 'bg-red-600', colorDark: 'bg-red-600', severity: 4 },
		run_again: { label: 'Rodar novamente', color: 'bg-red-400', colorDark: 'bg-red-700', severity: 4 },
		off: { label: 'Desligados', color: 'bg-black', colorDark: 'bg-white', severity: 5 },
	}

	// Inicializa contagem
	const statusCounts: Record<string, number> = {}
	Object.keys(STATUS_INFO).forEach((s) => (statusCounts[s] = 0))

	// Conta cada ocorrência (turno) no período de 28 dias, limitado aos turnos configurados do produto
	data.forEach((product) => {
		product.dates.forEach((d) => {
			if (new Date(d.date) < cut28) return
			if (!product.turns.includes(String(d.turn))) return
			if (STATUS_INFO[d.status]) statusCounts[d.status]++
		})
	})

	// Incidentes últimos 7 dias
	const last7Dates: string[] = []
	for (let i = 6; i >= 0; i--) {
		const d = new Date()
		d.setDate(today.getDate() - i)
		last7Dates.push(d.toISOString().split('T')[0])
	}

	const incidentsByDay: Record<string, number> = {}
	last7Dates.forEach((d) => (incidentsByDay[d] = 0))

	data.forEach((product) => {
		product.dates.forEach((d) => {
			if (last7Dates.includes(d.date) && STATUS_INFO[d.status]?.severity >= 3) {
				incidentsByDay[d.date]++
			}
		})
	})

	const columnCategories = last7Dates.map((d) => {
		const parts = d.split('-')
		return `${parts[2]}/${parts[1]}`
	})

	const columnData = last7Dates.map((d) => incidentsByDay[d])

	// Monta itens para Stats, omitindo status com 0
	const statsItems = Object.entries(statusCounts)
		.filter(([, count]) => count > 0)
		.map(([status, count]) => {
			const info = STATUS_INFO[status]
			const incidents = info.severity >= 3 ? count : 0 // incidentes = laranja ou vermelho
			return { name: info.label, progress: count, incidents, color: info.color, colorDark: info.colorDark }
		})

	return (
		<div className='flex w-full bg-white dark:bg-zinc-900'>
			{/* Lado esquerdo */}
			<div className='flex flex-grow flex-col'>
				<div className='size-full h-[calc(100vh-64px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-zinc-700'>
					{/* Estatísticas */}
					<div className='flex flex-col border-b border-b-zinc-200 p-8 pb-10 dark:border-b-zinc-700'>
						<Stats productCount={data.length} items={statsItems} />
					</div>

					{/* Colunas */}
					<div className='flex flex-col divide-zinc-200 border-zinc-200 md:grid md:grid-cols-2 md:divide-x dark:divide-zinc-700 dark:border-zinc-700 dark:border-b-zinc-700'>
						{/* Coluna esquerda */}
						<div className='flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700'>
							{/* Produtos & tasks */}
							{/* Item 1 */}
							<div className='p-8'>
								<h3 className='pb-4 text-xl font-medium text-zinc-500 dark:text-zinc-400'>Produtos não iniciados</h3>
								<div className='flex flex-col gap-3'>
									{/* Itens dinâmicos */}
									{loading && [1, 2, 3].map((i) => <ProductSkeleton key={i} />)}
									{!loading &&
										groups.notStarted.map((p) => {
											const uniqueDates = Array.from(new Set(p.dates.map((d) => d.date))).sort()

											let daysCount = 2
											if (p.turns.length === 1) daysCount = 4
											else if (p.turns.length === 2) daysCount = 3

											const lastDates = uniqueDates.slice(-daysCount)
											const lastDaysStatus = p.dates.filter((d) => lastDates.includes(d.date))

											// Últimos 28 dias (timeline)
											const last28Dates = uniqueDates.slice(-28)
											const last28DaysStatus = p.dates.filter((d) => last28Dates.includes(d.date))

											const calendarStatus = p.dates // 3 meses já retornados pela API

											return <Product key={p.productId} id={p.productId} name={p.name} turns={p.turns} progress={p.percent_completed} priority={p.priority === 'high' ? 'normal' : p.priority} date={p.last_run ? new Date(p.last_run).toLocaleDateString('pt-BR') : ''} lastDaysStatus={lastDaysStatus} last28DaysStatus={last28DaysStatus} calendarStatus={calendarStatus} />
										})}
								</div>
							</div>
							{/* Item 2 */}
							<div className='p-8'>
								<h3 className='pb-4 text-xl font-medium text-orange-500'>Produtos rodando</h3>
								<div className='flex flex-col gap-3'>
									{/* Itens dinâmicos */}
									{loading && [1, 2, 3].map((i) => <ProductSkeleton key={i} />)}
									{!loading &&
										groups.running.map((p) => {
											const uniqueDates = Array.from(new Set(p.dates.map((d) => d.date))).sort()

											let daysCount = 2
											if (p.turns.length === 1) daysCount = 4
											else if (p.turns.length === 2) daysCount = 3

											const lastDates = uniqueDates.slice(-daysCount)
											const lastDaysStatus = p.dates.filter((d) => lastDates.includes(d.date))

											// Últimos 28 dias (timeline)
											const last28Dates = uniqueDates.slice(-28)
											const last28DaysStatus = p.dates.filter((d) => last28Dates.includes(d.date))

											const calendarStatus = p.dates // 3 meses já retornados pela API

											return <Product key={p.productId} id={p.productId} name={p.name} turns={p.turns} progress={p.percent_completed} priority={p.priority === 'high' ? 'normal' : p.priority} date={p.last_run ? new Date(p.last_run).toLocaleDateString('pt-BR') : ''} lastDaysStatus={lastDaysStatus} last28DaysStatus={last28DaysStatus} calendarStatus={calendarStatus} />
										})}
								</div>
							</div>
							{/* Item 3 */}
							<div className='p-8'>
								<h3 className='pb-4 text-xl font-medium text-green-500'>Produtos finalizados</h3>
								<div className='flex flex-col gap-3'>
									{/* Itens dinâmicos */}
									{loading && [1, 2, 3].map((i) => <ProductSkeleton key={i} />)}
									{!loading &&
										groups.finished.map((p) => {
											const uniqueDates = Array.from(new Set(p.dates.map((d) => d.date))).sort()

											let daysCount = 2
											if (p.turns.length === 1) daysCount = 4
											else if (p.turns.length === 2) daysCount = 3

											const lastDates = uniqueDates.slice(-daysCount)
											const lastDaysStatus = p.dates.filter((d) => lastDates.includes(d.date))

											// Últimos 28 dias (timeline)
											const last28Dates = uniqueDates.slice(-28)
											const last28DaysStatus = p.dates.filter((d) => last28Dates.includes(d.date))

											const calendarStatus = p.dates // 3 meses já retornados pela API

											return <Product key={p.productId} id={p.productId} name={p.name} turns={p.turns} progress={p.percent_completed} priority={p.priority === 'high' ? 'normal' : p.priority} date={p.last_run ? new Date(p.last_run).toLocaleDateString('pt-BR') : ''} lastDaysStatus={lastDaysStatus} last28DaysStatus={last28DaysStatus} calendarStatus={calendarStatus} />
										})}
								</div>
							</div>
						</div>
						{/* Coluna direita */}
						<div className='flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700'>
							{/* Gráficos */}
							{/* Item 1 */}
							<div className='flex flex-col p-8'>
								<h3 className='pb-2 text-xl font-medium'>Incidentes nos últimos 7 dias</h3>
								<div className='mx-auto -mb-4 w-full'>
									<ChartColumn categories={columnCategories} data={columnData} />
								</div>
							</div>
							{/* Item 2 */}
							<div className='flex flex-col p-8'>
								<h3 className='pb-2 text-xl font-medium'>Causas de problemas</h3>
								<div className='flex'>
									<div className='mx-auto w-full'>
										<ChartDonut />
									</div>
								</div>
							</div>
							{/* Item 3 */}
							<div className='flex flex-col p-8'>
								<h3 className='pb-2 text-xl font-medium'>Problemas & soluções nos últimos 28 dias</h3>
								<div className='flex'>
									<div className='mx-auto w-full'>
										<ChartLine />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Lado direito */}
			<div className='hidden w-[400px] flex-shrink-0 flex-col border-l border-l-zinc-200 2xl:flex dark:border-l-zinc-700'>
				<div className='size-full h-[calc(100vh-64px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-zinc-700'>
					<div className='p-8'>
						{/* Resumo */}
						<div className='flex flex-col border-b border-b-zinc-200 pb-6 dark:border-b-zinc-700'>
							<h3 className='pb-4 text-2xl font-medium'>Resumo do dia</h3>
							<p className='text-base'>
								Hoje você tem
								<strong>20%</strong>
								mais problemas que o normal, você resolveu
								<strong>3 problemas</strong> em dois projetos, mas o foco está
								<strong>12%</strong>
								menor.
							</p>
						</div>

						{/* Resumo da produtividade */}
						<div className='grid grid-cols-2 border-b border-b-zinc-200 py-6 dark:border-b-zinc-700'>
							<div>
								<h4 className='pb-2 text-base font-medium'>Tempo parado</h4>
								<div>
									<span className='text-xl font-medium'>6h 18min</span>
								</div>
							</div>
							<div>
								<h4 className='pb-2 text-base font-medium'>Produtos finalizados</h4>
								<div>
									<span className='flex items-center'>
										<CircleProgress percent={79} strokeWidth={4} showText={false} size='size-6' fontSize='text-sm' fontColor='text-zinc-600' fontColorDark='text-zinc-200' colorFilled='text-zinc-200' colorDarkFilled='text-zinc-600' colorUnfilled='text-blue-500' colorDarkUnfilled='text-blue-600' />
										<span className='px-2 text-xl font-medium'> 79% </span>
										<span className='pt-0.5 text-sm text-zinc-400'>17 de 23</span>
									</span>
								</div>
							</div>
						</div>

						{/* Progresso radial */}
						<div className='grid w-full grid-cols-2 divide-x divide-zinc-200 border-b border-b-zinc-200 dark:divide-zinc-700 dark:border-b-zinc-700'>
							<Radial name='Produtos' progress={36} color='text-purple-500' colorDark='text-purple-600' />
							<Radial name='Projetos' progress={63} color='text-rose-400' colorDark='text-rose-500' />
						</div>

						{/* Projetos em andamento */}
						<div className='flex flex-col py-6'>
							<h3 className='pb-4 text-xl font-medium text-zinc-800 dark:text-zinc-100'>Projetos em andamento</h3>
							<div className='flex flex-col gap-3'>
								{projectsLoading && [1, 2, 3].map((i) => <Project key={i} name='Carregando...' progress={0} time='' />)}
								{!projectsLoading &&
									projects.map((p) => (
										<Link key={p.projectId} href={`/admin/projects/${p.projectId}`} title={`${p.shortDescription} (${p.elapsedText})`} className='block'>
											<Project name={p.name} progress={p.progress} time={p.time} />
										</Link>
									))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
