interface TimelineItem {
	date: string
	turn: number
	status: string
	description?: string | null
	category_id?: string | null
}

interface Props {
	statuses: string[] // array 28 itens (dia0..dia27) - DEPRECATED
	timelineData?: TimelineItem[] // dados completos para clique
	onTimelineClick?: (item: TimelineItem) => void // callback para clique
}

function cls(status: string) {
	switch (status) {
		case 'completed':
			return 'bg-green-400 dark:bg-green-900'
		case 'pending':
		case 'under_support':
		case 'suspended':
			return 'bg-orange-300 dark:bg-orange-500'
		case 'not_run':
		case 'with_problems':
		case 'run_again':
			return 'bg-red-600'
		default:
			return 'bg-zinc-200 dark:bg-zinc-700'
	}
}

export default function ProductTimeline({ statuses, timelineData, onTimelineClick }: Props) {
	// Se timelineData está disponível, usar dados completos; senão usar statuses simples
	const hasCompleteData = timelineData && timelineData.length > 0

	if (hasCompleteData && onTimelineClick) {
		// Modo avançado com clique implementado
		const reversed = [...timelineData].reverse()
		const weeks = [0, 7, 14, 21]
		const weekClass = 'flex gap-x-0.5 p-1.5'

		return (
			<div className='h-8'>
				<div className='flex flex-row-reverse'>
					{weeks.map((start, wIdx) => (
						<div key={wIdx} className={weekClass}>
							{reversed.slice(start, start + 7).map((item, idx) => (
								<button
									key={idx}
									onClick={(e) => {
										e.stopPropagation() // Previne abertura do modal
										onTimelineClick(item)
									}}
									className={`h-5 w-1.5 rounded-full ${cls(item.status)} hover:scale-110 transition-transform cursor-pointer`}
									title={`${item.date} - Turno ${item.turn} - ${item.status}${item.description ? ': ' + item.description : ''}`}
								/>
							))}
						</div>
					))}
				</div>
			</div>
		)
	}

	// Modo legacy com apenas statuses
	const reversed = [...statuses].reverse()
	const weeks = [0, 7, 14, 21]
	const weekClass = 'flex gap-x-0.5 p-1.5'
	return (
		<div className='h-8'>
			<div className='flex flex-row-reverse'>
				{weeks.map((start, wIdx) => (
					<div key={wIdx} className={weekClass}>
						{reversed.slice(start, start + 7).map((s, idx) => (
							<div key={idx} className={`h-5 w-1.5 rounded-full ${cls(s)}`}></div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
