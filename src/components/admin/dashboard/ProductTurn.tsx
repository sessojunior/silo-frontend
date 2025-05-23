import Popover from '@/components/ui/Popover'

const turns = {
	product: 'SMEC',
	days: [
		{
			date: '2025-03-23',
			turns: [
				{
					time: 0,
					status: 'normal',
					incidents: 0,
					description: null,
				},
				{
					time: 6,
					status: 'normal',
					incidents: 0,
					description: null,
				},
				{
					time: 12,
					status: 'danger',
					incidents: 1,
					description: 'Acabou a luz.',
				},
				{
					time: 18,
					status: 'alert',
					incidents: 0,
					description: 'Acabou a luz.',
				},
			],
		},
		{
			date: '2025-03-24',
			turns: [
				{
					time: 0,
					status: 'normal',
					incidents: 0,
					description: null,
				},
				{
					time: 6,
					status: 'normal',
					incidents: 0,
					description: null,
				},
				{
					time: 12,
					status: 'pending',
					incidents: 1,
					description: null,
				},
				{
					time: 18,
					status: 'pending',
					incidents: 0,
					description: null,
				},
			],
		},
	],
}

export default function ProductTurn() {
	return (
		<div className='relative h-8'>
			<div className='flex gap-1'>
				{turns.days.map((day, i) => {
					const totalIncidents = day.turns.reduce((acc, turn) => acc + turn.incidents, 0)

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
												<span className='text-lg font-medium'>{turns.product}</span>
											</div>
										</div>
									</div>

									{/* Turnos */}
									<ul className='p-2'>
										{day.turns.map((turn, index) => {
											let bgClass = ''
											let text: React.ReactNode = ''

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
													text = turn.description ? <i>{turn.description}</i> : 'Alerta'
													break
												case 'danger':
													bgClass = 'bg-red-600 text-white'
													text = turn.description ? <i>{turn.description}</i> : 'Crítico'
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
