export default function ProductCalendar({ calendar }) {
	const monthFullName = (month: number): string => ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][month - 1] || ''
	const weekDayLetter = (day: string): string => ({ sunday: 'D', monday: 'S', tuesday: 'T', wednesday: 'Q', thursday: 'Q', friday: 'S', saturday: 'S' }[day.toLowerCase()] || '')
	const turns = [0, 6, 12, 18]

	// Classes Tailwind
	const turn = 'flex h-6 items-center justify-end px-1.5 text-center text-sm font-semibold text-zinc-400 dark:text-zinc-400'
	const dayNormal = 'py-2 flex-col rounded-sm bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800'
	const dayWeekend = 'py-2 bg-amber-50 rounded-sm hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-600'
	const dayWeekNormal = 'flex h-6 w-6 items-center justify-center text-base text-zinc-300 dark:text-zinc-500'
	const dayWeekWeekend = 'flex h-6 w-6 items-center justify-center text-base text-zinc-400 dark:text-zinc-500'
	const dayNumber = 'flex h-6 w-6 items-center justify-center text-sm font-semibold text-zinc-400 dark:text-zinc-400'
	const dayTurn = 'flex h-6 w-6 items-center justify-center'
	const dayButton = 'flex h-4 w-4 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600'
	const dayGreen = 'h-2.5 w-2.5 rounded-full bg-green-200 dark:bg-green-900'
	const dayOrange = 'h-2.5 w-2.5 rounded-full bg-orange-400'
	const dayRed = 'h-2.5 w-2.5 rounded-full bg-red-600'
	const dayNone = 'h-2.5 w-2.5 rounded-full bg-transparent'
	const monthName = 'flex h-6 w-24 items-center justify-end px-1.5 text-base font-semibold text-zinc-400 dark:text-zinc-400'

	return (
		<div className='flex'>
			{/* Turnos */}
			<div className='flex-col py-2'>
				<div className={monthName}>{monthFullName(calendar.month)}</div>
				<div className='h-6 w-6'></div>
				{turns.map((turnValue, index) => (
					<div key={index} className={turn}>
						{turnValue}
					</div>
				))}
			</div>

			{/* Dias do mês */}
			{calendar.dates.map((date, index) => (
				<div
					key={index}
					className={`${date.dateWeek === 'saturday' || date.dateWeek === 'sunday' ? dayWeekend : dayNormal}
							${index === 0 ? 'border-r border-l border-zinc-200' : ''}
							${index !== calendar.dates.length - 1 ? 'border-r border-zinc-200' : ''}`}
				>
					<div className={date.dateWeek === 'saturday' || date.dateWeek === 'sunday' ? dayWeekWeekend : dayWeekNormal}>{weekDayLetter(date.dateWeek)}</div>
					<div className={dayNumber}>{date.dateDay}</div>

					{/* Turnos */}
					{date.dateTurns.map((turn, index) => (
						<div key={index} className={dayTurn}>
							<div className={dayButton}>
								<div className={turn.dateStatus === 'green' ? dayGreen : turn.dateStatus === 'orange' ? dayOrange : turn.dateStatus === 'red' ? dayRed : ''}></div>
							</div>
						</div>
					))}
				</div>
			))}
		</div>
	)
}
