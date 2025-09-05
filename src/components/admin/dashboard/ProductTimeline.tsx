interface TimelineItem {
	id?: string
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
			return 'bg-green-600 text-white' // Consistente com ProductTurn
		case 'pending':
		case 'under_support':
		case 'suspended':
			return 'bg-orange-600 text-white' // Consistente com ProductTurn
		case 'not_run':
			return 'bg-zinc-400 text-white' // Consistente com ProductTurn
		case 'with_problems':
		case 'run_again':
			return 'bg-red-600 text-white' // Consistente com ProductTurn
		case 'waiting':
			return 'bg-zinc-200 text-zinc-600' // Consistente com ProductTurn
		case 'in_progress':
			return 'bg-transparent border border-zinc-300 text-zinc-600 dark:border-zinc-700' // Consistente com ProductTurn
		default:
			return 'bg-zinc-200 dark:bg-zinc-700'
	}
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

export default function ProductTimeline({ statuses, timelineData, onTimelineClick }: Props) {
	// Debug: verificar dados recebidos
	console.log('🔍 Debug ProductTimeline:', {
		statusesLength: statuses.length,
		timelineDataLength: timelineData?.length || 0,
		timelineDataSample: timelineData?.slice(0, 3),
		hasCompleteData: timelineData && timelineData.length > 0,
	})

	// Se timelineData está disponível, usar dados completos; senão usar statuses simples
	const hasCompleteData = timelineData && timelineData.length > 0

	if (hasCompleteData && onTimelineClick) {
		// Modo avançado com clique implementado
		// Não reverter - manter ordem original (mais recente → mais antigo)
		const weeks = [0, 7, 14, 21]
		const weekClass = 'flex gap-x-0.5 p-1.5'

		return (
			<div className='h-8'>
				<div className='flex'>
					{weeks.map((start, wIdx) => (
						<div key={wIdx} className={weekClass}>
							{timelineData.slice(start, start + 7).map((item, idx) => (
								<button
									key={idx}
									onClick={(e) => {
										e.stopPropagation() // Previne abertura do modal
										onTimelineClick(item)
									}}
									className={`h-5 w-1.5 rounded-full ${cls(item.status)} hover:scale-110 transition-transform cursor-pointer`}
									title={`${item.date} - Turno ${item.turn} - ${STATUS_LABEL(item.status)}${item.description ? ': ' + item.description : ''}`}
								/>
							))}
						</div>
					))}
				</div>
			</div>
		)
	}

	// Modo legacy com apenas statuses
	// Não reverter - manter ordem original (mais recente → mais antigo)
	const weeks = [0, 7, 14, 21]
	const weekClass = 'flex gap-x-0.5 p-1.5'
	return (
		<div className='h-8'>
			<div className='flex'>
				{weeks.map((start, wIdx) => (
					<div key={wIdx} className={weekClass}>
						{statuses.slice(start, start + 7).map((s, idx) => (
							<div key={idx} className={`h-5 w-1.5 rounded-full ${cls(s)}`}></div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
