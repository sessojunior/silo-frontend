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
			return 'bg-zinc-200 text-zinc-600' // Consistente com ProductTurn
		case 'under_support':
		case 'suspended':
			return 'bg-orange-600 text-white' // Consistente com ProductTurn
		case 'not_run':
			return 'bg-zinc-400 text-white' // Consistente com ProductTurn
		case 'with_problems':
		case 'run_again':
			return 'bg-red-600 text-white' // Consistente com ProductTurn
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
	// Se timelineData está disponível, usar dados completos; senão usar statuses simples
	const hasCompleteData = timelineData && timelineData.length > 0

	if (hasCompleteData) {
		// Função para formatar data no padrão brasileiro
		const formatDateBR = (dateStr: string) => {
			const [year, month, day] = dateStr.split('-')
			return `${day}/${month}/${year}`
		}

		// Função para determinar o status mais severo
		const getMostSevereStatus = (turns: TimelineItem[]) => {
			const severityOrder: Record<string, number> = {
				completed: 0,
				in_progress: 2,
				pending: 3,
				under_support: 3,
				suspended: 3,
				not_run: 4,
				with_problems: 4,
				run_again: 4,
				off: 5,
			}

			return turns.reduce((mostSevere, turn) => {
				const currentSeverity = severityOrder[turn.status] ?? 0
				const mostSevereSeverity = severityOrder[mostSevere.status] ?? 0
				return currentSeverity > mostSevereSeverity ? turn : mostSevere
			})
		}

		// Agrupar dados por data para exibir todos os turnos no tooltip
		const dataByDate = timelineData.reduce(
			(acc, item) => {
				if (!acc[item.date]) {
					acc[item.date] = []
				}
				acc[item.date].push(item)
				return acc
			},
			{} as Record<string, TimelineItem[]>,
		)

		/**
		 * Função para garantir que todos os turnos esperados sejam exibidos no tooltip
		 *
		 * LÓGICA DOS TURNOS FALTANTES:
		 * - Turnos esperados: [0, 6, 12, 18] (meia-noite, 6h, meio-dia, 18h)
		 * - Se existe registro no banco: usa o status real do banco
		 * - Se NÃO existe registro no banco: status = 'pending' (Pendente)
		 *
		 * Isso garante que o tooltip sempre mostre os 4 turnos por dia,
		 * mesmo quando alguns turnos não foram executados ou não têm dados.
		 */
		const getExpectedTurns = (date: string, existingTurns: TimelineItem[]): TimelineItem[] => {
			const expectedTurns = [0, 6, 12, 18]
			const result: TimelineItem[] = []

			for (const turn of expectedTurns) {
				const existingTurn = existingTurns.find((t) => t.turn === turn)
				if (existingTurn) {
					// Turno existe no banco - usar dados reais
					result.push(existingTurn)
				} else {
					// Turno não existe no banco - status padrão "Pendente"
					result.push({
						date,
						turn,
						status: 'pending',
						description: null,
						category_id: null,
					})
				}
			}

			return result
		}

		// Ordenar turnos por horário dentro de cada data
		Object.keys(dataByDate).forEach((date) => {
			dataByDate[date].sort((a, b) => a.turn - b.turn)
		})

		// Modo avançado com tooltip agrupado por dia
		const weeks = [0, 7, 14, 21]
		const weekClass = 'flex gap-x-0.5 p-1.5'

		// Criar array de datas únicas ordenadas para exibir todos os 28 dias
		const uniqueDates = [...new Set(timelineData.map((item) => item.date))].sort()

		// Debug: verificar quantas datas únicas temos
		console.log(`🔍 Timeline Debug - Total de datas únicas: ${uniqueDates.length}`, uniqueDates)

		return (
			<div className='h-8'>
				<div className='flex'>
					{weeks.map((start, wIdx) => (
						<div key={wIdx} className={weekClass}>
							{uniqueDates.slice(start, start + 7).map((date, idx) => {
								// Obter turnos existentes e garantir que todos os turnos esperados sejam exibidos
								const existingTurns = dataByDate[date] || []
								const allTurnsForDate = getExpectedTurns(date, existingTurns)

								// Se não há dados para esta data, criar elemento vazio
								if (allTurnsForDate.length === 0) {
									return <div key={`${date}-${idx}`} className='h-5 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700' title={`${formatDateBR(date)} - Sem dados`} />
								}

								// Determinar status mais severo para cor do elemento
								const mostSevereTurn = getMostSevereStatus(allTurnsForDate)

								// Construir tooltip com todos os turnos da data
								const dateFormatted = formatDateBR(date)

								// Função para truncar e limpar descrição
								const truncateDescription = (desc: string | null | undefined): string => {
									if (!desc) return ''
									// Remove quebras de linha e caracteres inválidos
									const cleaned = desc
										.replace(/[\r\n\t]+/g, ' ')
										.replace(/\s+/g, ' ')
										.trim()
									// Trunca em 60 caracteres
									return cleaned.length > 60 ? cleaned.substring(0, 60) + '...' : cleaned
								}

								const turnsInfo = allTurnsForDate
									.map((turn) => {
										const description = turn.description ? truncateDescription(turn.description) : ''
										return `Turno ${turn.turn}: ${STATUS_LABEL(turn.status)}${description ? ' - ' + description : ''}`
									})
									.join('\n')

								// Variável final com data e todos os turnos
								const tooltipContent = `${dateFormatted}\n${turnsInfo}`

								return <div key={`${date}-${idx}`} className={`h-5 w-1.5 rounded-full ${cls(mostSevereTurn.status)} hover:scale-110 transition-transform`} title={tooltipContent} />
							})}
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
