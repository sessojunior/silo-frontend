interface Props {
	statuses: string[] // array 28 itens (dia0..dia27)
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

export default function ProductTimeline({ statuses }: Props) {
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
