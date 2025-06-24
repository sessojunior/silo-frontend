import Popover from '@/components/ui/Popover'

interface TurnCell {
	time: number
	status: string
	description?: string | null
}
interface DayItem {
	date: string
	turns: TurnCell[]
}
interface Props {
	productName: string
	days: DayItem[]
}

const COLOR_MAP: Record<string, string> = {
	completed: 'bg-green-600 text-white',
	waiting: 'bg-zinc-200 text-zinc-600',
	in_progress: 'bg-transparent border border-zinc-300 text-zinc-600 dark:border-zinc-700',
	pending: 'bg-orange-600 text-white',
	under_support: 'bg-orange-500 text-white',
	suspended: 'bg-orange-500 text-white',
	not_run: 'bg-red-600 text-white',
	with_problems: 'bg-red-600 text-white',
	run_again: 'bg-red-600 text-white',
}

export default function ProductTurn({ productName, days }: Props) {
	return (
		<div className='relative h-8'>
			<div className='flex gap-1'>
				{days.map((day, i) => {
					const incidentsStatuses = ['pending', 'under_support', 'suspended', 'not_run', 'with_problems', 'run_again']
					const totalIncidents = day.turns.filter((t) => incidentsStatuses.includes(t.status)).length

					return (
						<Popover
							key={i}
							position='top-right'
							content={
								<div className='w-72 text-sm'>
									{/* Cabeçalho */}
									<div className='rounded-t-xl border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700'>
										<div className='flex items-center gap-2'>
											<span className='icon-[lucide--calendar-days] size-5 shrink-0 text-zinc-400'></span>
											<span className='text-lg font-medium'>{productName}</span>
										</div>
									</div>

									{/* Turnos detalhados */}
									<ul className='px-2 py-1 space-y-0.5'>
										{day.turns.map((turn, index) => (
											<li key={index} className='flex items-start gap-2 rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900'>
												<div className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${COLOR_MAP[turn.status] || 'bg-zinc-200 text-zinc-600'}`}>{turn.time}</div>
												<div className='flex flex-col'>
													<span className='font-medium'>{STATUS_LABEL(turn.status)}.</span>
													{turn.description && (
														<span className='text-xs text-zinc-500 dark:text-zinc-400 line-clamp-4 cursor-default' title={turn.description}>
															{turn.description}
														</span>
													)}
												</div>
											</li>
										))}
									</ul>

									{/* Rodapé */}
									<div className='flex items-center justify-between rounded-b-xl border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'>
										<span>{new Date(day.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
										{totalIncidents > 0 && (
											<span className='flex items-center gap-1'>
												<span className='icon-[lucide--flag] size-4 shrink-0 text-zinc-400'></span>
												{totalIncidents} alerta{totalIncidents > 1 && 's'}
											</span>
										)}
									</div>
								</div>
							}
						>
							<div className='rounded-full bg-zinc-50 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-700'>
								<div className='flex gap-x-0.5 rounded-full p-1.5'>
									{day.turns.map((turn, index) => (
										<div key={index} className={`flex h-5 w-5 items-center justify-center rounded-full text-center text-xs ${COLOR_MAP[turn.status] || 'bg-zinc-200 text-zinc-600'}`}>
											{turn.time}
										</div>
									))}
								</div>
							</div>
						</Popover>
					)
				})}
			</div>
		</div>
	)
}

function STATUS_LABEL(status: string) {
	const map: Record<string, string> = {
		completed: 'Concluído',
		waiting: 'Aguardando',
		in_progress: 'Em execução',
		pending: 'Pendente',
		under_support: 'Sob intervenção',
		suspended: 'Suspenso',
		not_run: 'Não rodou',
		with_problems: 'Com problemas',
		run_again: 'Rodar novamente',
	}
	return map[status] || status
}
