'use client'

import { useState } from 'react'

import ProductTimeline from '@/components/admin/dashboard/ProductTimeline'
import ProductTurn from '@/components/admin/dashboard/ProductTurn'
import ProductCalendar from '@/components/admin/dashboard/ProductCalendar'
import Modal from '@/components/ui/Modal'
import ProductActivityOffcanvas from '@/components/admin/dashboard/ProductActivityOffcanvas'

interface ProductDateStatus {
	date: string
	turn: number
	status: string
	description?: string | null
	category_id?: string | null
}

interface ProductProps {
	id: string
	name: string
	turns: string[]
	progress: number
	priority: string
	date: string
	lastDaysStatus: ProductDateStatus[]
	last28DaysStatus: ProductDateStatus[] // para timeline
	calendarStatus: ProductDateStatus[] // para calendário 3 meses
	onSaved?: () => void
}

export default function Product({ id, name, turns, progress, priority, date, lastDaysStatus, last28DaysStatus, calendarStatus, onSaved }: ProductProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [activityCtx, setActivityCtx] = useState<{ date: string; turn: number; status: string; description?: string | null; category_id?: string | null } | null>(null)
	const [activityPanelOpen, setActivityPanelOpen] = useState(false)

	// Filtra status conforme turnos configurados do produto
	const filteredLastDays = lastDaysStatus.filter((d) => turns.includes(String(d.turn)))
	const filteredTimeline = last28DaysStatus.filter((d) => turns.includes(String(d.turn)))
	const filteredCalendar = calendarStatus.filter((d) => turns.includes(String(d.turn)))

	const timelineStatuses = filteredTimeline.map((d) => d.status)

	// Build days array for ProductTurn
	const daysMap: Record<string, { date: string; turns: { time: number; status: string; description?: string | null; category_id?: string | null }[] }> = {}

	filteredLastDays.forEach((d) => {
		if (!daysMap[d.date]) {
			daysMap[d.date] = { date: d.date, turns: [] }
		}
		const existingTurn = daysMap[d.date].turns.find((t) => t.time === d.turn)
		if (!existingTurn) {
			daysMap[d.date].turns.push({ time: d.turn, status: d.status, description: d.description, category_id: d.category_id })
		} else {
			// Se já existe, escolher status mais severo (orange/red substitui green) – simples prioridade
			const severityOrder: Record<string, number> = { completed: 0, waiting: 1, in_progress: 2, pending: 3, under_support: 3, suspended: 3, not_run: 4, with_problems: 4, run_again: 4, off: 5 }
			if ((severityOrder[d.status] ?? 0) > (severityOrder[existingTurn.status] ?? 0)) {
				existingTurn.status = d.status
				existingTurn.description = d.description
				existingTurn.category_id = d.category_id
			}
		}
	})
	const days = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date))

	/* ----------- Construção de calendários para os últimos 28 dias ----------- */
	type CalendarDate = {
		dateWeek: string
		dateDay: number
		dateTurns: { dateTurn: number; dateStatus: 'green' | 'orange' | 'red' | '' }[]
	}

	type Calendar = { year: number; month: number; dates: CalendarDate[] }

	const dayOfWeekName = (d: number): string => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d]

	const colorForStatus = (status?: string): 'green' | 'orange' | 'red' | '' => {
		switch (status) {
			case 'completed':
				return 'green'
			case 'pending':
			case 'under_support':
			case 'suspended':
				return 'orange'
			case 'not_run':
			case 'with_problems':
			case 'run_again':
				return 'red'
			default:
				return ''
		}
	}

	// Mapa status por (date + turn) para calendário
	const statusMap = new Map<string, string>()
	filteredCalendar.forEach((d) => {
		statusMap.set(`${d.date}_${d.turn}`, d.status)
	})

	// Gera lista dos 3 últimos meses a partir da data atual
	const today = new Date()
	const monthsArr: string[] = []
	for (let i = 0; i < 3; i++) {
		const dt = new Date(today.getFullYear(), today.getMonth() - i, 1)
		const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
		monthsArr.push(ym)
	}
	monthsArr.sort()

	const calendars: Calendar[] = monthsArr.map((ym) => {
		const [yearStr, monthStr] = ym.split('-')
		const year = Number(yearStr)
		const month = Number(monthStr) // 1-12

		const daysInMonth = new Date(Number(yearStr), month, 0).getDate()
		const dates: CalendarDate[] = []

		for (let day = 1; day <= daysInMonth; day++) {
			const dateStr = `${ym}-${String(day).padStart(2, '0')}`
			const weekName = dayOfWeekName(new Date(dateStr).getDay())
			const dateTurns = [0, 6, 12, 18].map((t) => ({ dateTurn: t, dateStatus: colorForStatus(statusMap.get(`${dateStr}_${t}`)) }))
			dates.push({ dateWeek: weekName, dateDay: day, dateTurns })
		}

		return { year, month, dates }
	})

	return (
		<>
			<div key={id} className='flex flex-col rounded-lg border border-dashed border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'>
				<div className='flex items-center justify-between'>
					{/* Produto */}
					<div className='flex flex-col'>
						<div className='flex items-center gap-2'>
							<span className='icon-[lucide--folder-git-2] size-5 shrink-0 text-zinc-400'></span>
							<span className='text-lg font-medium'>{name}</span>
						</div>
						<div className='text-sm'>
							{progress}% <span className='text-zinc-300'>•</span>
							{date}
						</div>
					</div>

					{/* Barra de turno */}
					<div className='flex flex-col'>
						<ProductTurn
							productName={name}
							days={days}
							onTurnClick={(ctx) => {
								setActivityCtx({ date: ctx.date, turn: ctx.turn, status: ctx.status, description: ctx.description, category_id: ctx.category_id })
								setActivityPanelOpen(true)
							}}
						/>
					</div>
				</div>
				<div className='mt-1.5 flex items-center justify-between'>
					{/* Modal Trigger */}
					<button onClick={() => setIsModalOpen(true)} className='rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'>
						{/* Linha do tempo */}
						<ProductTimeline statuses={timelineStatuses} />
					</button>

					{/* Prioridade */}
					<div className='flex items-center text-xs leading-none'>
						{priority == 'urgent' && (
							<div className='inline-block rounded-full bg-red-100 px-4 py-2 dark:bg-red-600'>
								<span className='text-xs font-medium text-nowrap text-red-500 uppercase dark:text-white'>Urgente</span>
							</div>
						)}
						{priority == 'high' && (
							<div className='inline-block rounded-full bg-orange-100 px-4 py-2 dark:bg-red-600'>
								<span className='text-xs font-medium text-nowrap text-red-500 uppercase dark:text-white'>Alta</span>
							</div>
						)}
						{priority == 'normal' && (
							<div className='inline-block rounded-full bg-orange-100 px-4 py-2 dark:bg-orange-600'>
								<span className='text-xs font-medium text-nowrap text-orange-500 uppercase dark:text-white'>Normal</span>
							</div>
						)}
						{priority == 'low' && (
							<div className='inline-block rounded-full bg-green-200 px-4 py-2 dark:bg-green-700'>
								<span className='text-xs font-medium text-nowrap text-green-600 uppercase dark:text-white'>Baixa</span>
							</div>
						)}
					</div>
				</div>
			</div>
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Detalhes de ${name}`}>
				{/* Calendário gerado dinamicamente (últimos 28 dias) */}
				{calendars.map((cal, idx) => (
					<ProductCalendar
						key={idx}
						calendar={cal}
						onDotClick={({ date: d, turn }) => {
							const target = filteredCalendar.find((ds) => ds.date === d && ds.turn === turn)
							if (target) {
								setActivityCtx({ date: target.date, turn: target.turn, status: target.status, description: target.description, category_id: target.category_id })
								setActivityPanelOpen(true)
							}
						}}
					/>
				))}

				{/* Legenda */}
				<div className='p-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm'>
					<div className='flex items-center gap-1.5' title='Quando está ok.'>
						<span className='size-3 rounded-full bg-green-600 dark:bg-green-700'></span> Concluído
					</div>
					<div className='flex items-center gap-1.5' title='Quando ainda não deu a hora de executar.'>
						<span className='size-3 rounded-full bg-zinc-300 dark:bg-zinc-700'></span> Aguardando
					</div>
					<div className='flex items-center gap-1.5' title='Deu a hora de executar, mas não executou o modelo, é necessário executá-lo depois. Ou sob intervenção do suporte técnico. Ou rodada suspensa.'>
						<span className='size-3 rounded-full bg-orange-400 dark:bg-orange-700'></span> Pendente • Sob intervenção • Suspenso
					</div>
					<div className='flex items-center gap-1.5' title='Produto rodando normalmente no turno atual.'>
						<span className='size-3 rounded-full bg-transparent border border-zinc-300 dark:border-zinc-700'></span> Em andamento
					</div>
					<div className='flex items-center gap-1.5' title='Produto não rodou durante o turno, rodou com problemas ou deve ser rodado novamente.'>
						<span className='size-3 rounded-full bg-red-600'></span> Não rodou • Com problemas • Rodar novamente
					</div>
					<div className='flex items-center gap-1.5' title='Quando não executou'>
						<span className='size-3 rounded-full bg-zinc-300 dark:bg-zinc-700'></span> Sem execução
					</div>
					<div className='flex items-center gap-1.5' title='Produto desligado'>
						<span className='size-3 rounded-full bg-black dark:bg-white'></span> Desligado
					</div>
				</div>
			</Modal>

			{/* Offcanvas edição de turno */}
			{activityCtx && (
				<ProductActivityOffcanvas
					open={activityPanelOpen}
					onClose={() => setActivityPanelOpen(false)}
					productId={id}
					productName={name}
					date={activityCtx.date}
					turn={activityCtx.turn}
					initialStatus={activityCtx.status}
					initialDescription={activityCtx.description || ''}
					initialCategoryId={activityCtx.category_id || null}
					onSaved={() => {
						onSaved?.()
					}}
				/>
			)}
		</>
	)
}
