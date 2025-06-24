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

function statusToClass(status: string) {
	switch (status) {
		case 'completed':
		case 'normal':
			return { bg: 'bg-green-600 text-white', label: 'Normal' }
		case 'pending':
		case 'waiting':
			return { bg: 'bg-zinc-100 text-zinc-600', label: '' }
		case 'with_problems':
		case 'not_run':
		case 'run_again':
			return { bg: 'bg-red-600 text-white', label: 'Crítico' }
		case 'under_support':
		case 'suspended':
			return { bg: 'bg-orange-600 text-white', label: 'Alerta' }
		default:
			return { bg: 'bg-zinc-200 text-zinc-600', label: '' }
	}
}

export default function ProductTurn({ productName, days }: Props) {
	return (
		<div className='relative h-8'>
			<div className='flex gap-1'>
				{days.map((day, i) => {
					const totalIncidents = day.turns.filter((t) => ['pending', 'not_run', 'with_problems', 'run_again', 'under_support', 'suspended'].includes(t.status)).length

					return (
						<Popover
							key={i}
							position='top-right'
							content={
								<div className='w-64 text-sm'>
									{/* Cabeçalho */}
									<div className='rounded-t-xl border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700'>
										<div className='flex flex-col'>
											<div className='flex items-center gap-2'>
												<span className='icon-[lucide--folder-git-2] size-5 shrink-0 text-zinc-400'></span>
												<span className='text-lg font-medium'>{productName}</span>
											</div>
										</div>
									</div>

									{/* Turnos */}
									<ul className='p-2'>
										{day.turns.map((turn, index) => {
											let bgClass = ''
											let text = ''

											switch (turn.status) {
												case 'pending':
													bgClass = 'bg-zinc-200 text-zinc-600'
													text = ''
													break
												case 'normal':
													bgClass = 'bg-green-600 text-white'
													text = 'Normal'
													break
												case 'alert':
													bgClass = 'bg-orange-600 text-white'
													text = turn.description || 'Alerta'
													break
												case 'danger':
													bgClass = 'bg-red-600 text-white'
													text = turn.description || 'Crítico'
													break
												default:
													bgClass = 'bg-zinc-100 text-zinc-600'
													text = ''
											}

											return (
												<li key={index} className='flex items-start gap-2 rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900'>
													<div className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${bgClass}`}>{turn.time}</div>
													<div className='text-zinc-800 dark:text-zinc-200'>{text}</div>
												</li>
											)
										})}
									</ul>

									{/* Rodapé */}
									<div className='flex items-center justify-between rounded-b-xl border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'>
										<span className='flex items-center gap-x-1.5'>
											<span>{new Date(day.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
											<span className='text-zinc-300'>•</span>
											{totalIncidents > 0 && (
												<>
													<span className='icon-[lucide--flag] size-4 shrink-0 text-zinc-400'></span>
													{totalIncidents === 1 ? '1 alerta' : `${totalIncidents} alertas`}
												</>
											)}
										</span>
									</div>
								</div>
							}
						>
							<div className='rounded-full bg-zinc-50 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-700'>
								<div className='flex gap-x-0.5 rounded-full p-1.5'>
									{day.turns.map((turn, index) => {
										const bgColorMap: Record<string, string> = {
											pending: 'bg-zinc-100 text-zinc-600',
											normal: 'bg-green-600 text-white',
											alert: 'bg-orange-600 text-white',
											danger: 'bg-red-600 text-white',
										}
										return (
											<div key={index} className={`flex h-5 w-5 items-center justify-center rounded-full text-center text-xs ${bgColorMap[turn.status] || 'bg-zinc-200 text-zinc-500'}`}>
												{turn.time}
											</div>
										)
									})}
								</div>
							</div>
						</Popover>
					)
				})}
			</div>
		</div>
	)
}
