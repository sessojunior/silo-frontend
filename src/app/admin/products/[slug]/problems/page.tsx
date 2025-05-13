import ReactMarkdown from 'react-markdown'

import Button from '@/app/components/Button'

// Tipagem base de um problema (sem soluções detalhadas)
type ProblemProps = {
	id: string
	title: string
	date: string
	description: string
	solutions: number
}

// Usuário relacionado a uma solução
type UserProps = {
	id: string
	name: string
	avatar: string
}

// Screenshot de um problema
type ScreenshotProps = {
	id: string
	src: string
	alt: string
}

// Solução de um problema, com um usuário associado
type SolutionProps = {
	id: string
	replyId: string | null
	date: string
	user: UserProps
	description: string
	verified: boolean
}

// Tipo com soluções completas e imagens
type ProblemWithSolutionsProps = Omit<ProblemProps, 'solutions'> & {
	solutions: SolutionProps[]
	screenshots?: ScreenshotProps[]
}

// Lista de problemas
const problems: ProblemProps[] = [
	{
		id: '1',
		title: 'Problema augue velit sagittis in purus blandit vulputate 1',
		date: '2025-02-09 07:08:00',
		description: 'Praesent augue velit, sagittis in purus blandit, vulputate volutpat est. Etiam vel justo justo. Praesent eget tempor lectus, sed placerat turpis. Cras consequat et lacus et suscipit. Nam vitae turpis feugiat, interdum nunc a, tincidunt velit...',
		solutions: 5,
	},
	{
		id: '2',
		title: 'Problema eget vulputate 2',
		date: '2025-01-09 11:47:00',
		description: 'Aenean ut turpis dui. Pellentesque a efficitur odio, eu volutpat nisi. Nulla ornare tincidunt auctor. Nam ac velit mi. Phasellus sit amet mauris id ipsum interdum dapibus eu et sem. Vivamus vestibulum mi nisl, eu rutrum quam cursus in. Duis vitae mattis mi, at suscipit massa...',
		solutions: 0,
	},
	{
		id: '3',
		title: 'Problema placerat turpis interdum vulputate volutpat nunc 3',
		date: '2025-02-13 13:45:00',
		description: 'Nunc a nisi ipsum. Mauris iaculis metus ut euismod venenatis. Ut commodo, elit ac accumsan vulputate, urna purus sodales augue, ut congue enim tortor ac lacus. Morbi finibus tellus vel turpis fermentum, nec iaculis nisi posuere. Suspendisse sit amet blandit ligula, vitae auctor ligula...',
		solutions: 2,
	},
	{
		id: '4',
		title: 'Zone efficitur efficitur odio 4',
		date: '2025-01-09 11:47:00',
		description: 'Pellentesque a efficitur odio ornare tincidunt auctor. Nam ac velit mi. Phasellus sit amet mauris id ipsum interdum dapibus eu et sem. Vivamus vestibulum mi nisl, eu rutrum quam cursus in. Duis vitae mattis mi, at suscipit massa...',
		solutions: 0,
	},
]

// Problema atual com soluções
const problem: ProblemWithSolutionsProps = {
	id: '1',
	title: 'Problema augue velit sagittis in purus blandit vulputate 1',
	date: '2025-02-09 07:08:00',
	description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis efficitur tellus. Suspendisse vitae justo lacinia, dictum orci mattis, fermentum dui.
    \n\nNulla efficitur porta velit, in sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec vehicula nulla quis laoreet convallis. In malesuada
	  ligula vel molestie sagittis.
	  \n\nCras non lacus id est accumsan vestibulum.`,
	screenshots: [
		{ id: '1', src: 'https://confluence.ecmwf.int/download/attachments/52464844/worddavf74394bf4344047a1d0f1835d6740525.png', alt: 'Screenshot 1' },
		{ id: '2', src: 'https://confluence.ecmwf.int/download/attachments/52464881/worddav2b63bcd14ea990b6058f3dd44b65ab79.png', alt: 'Screenshot 2' },
	],
	// solutions: []
	solutions: [
		{
			id: '1.1',
			replyId: null,
			date: '2025-02-17 11:39:00',
			user: {
				id: '1',
				name: 'Ronaldo Gaúcho',
				avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
			},
			description: 'Praesent eget tempor lectus, sed placerat turpis. Phasellus sit amet mauris id ipsum interdum dapibus eu et sem. Vivamus vestibulum mi nisl, eu rutrum quam cursus in. Cras consequat et lacus et suscipit. Morbi finibus tellus vel turpis fermentum, nec iaculis nisi posuere. Suspendisse sit amet blandit ligula.',
			verified: false,
		},
		{
			id: '1.2',
			replyId: null,
			date: '2025-02-15 22:40',
			user: {
				id: '2',
				name: 'Angélica Carioca',
				avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
			},
			description: 'Phasellus sit amet mauris id ipsum interdum dapibus eu et sem. Morbi finibus tellus vel turpis fermentum, nec iaculis nisi posuere. Suspendisse sit amet blandit ligula.',
			verified: false,
		},
		{
			id: '1.2.1',
			replyId: '1.2',
			date: '2025-02-16 11:32:00',
			user: {
				id: '3',
				name: 'Rafael Dias',
				avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
			},
			description: 'Quisque eget est ipsum. Phasellus a augue a nibh placerat facilisis?',
			verified: false,
		},
		{
			id: '1.2.2',
			replyId: '1.2',
			date: '2025-02-16 21:07:00',
			user: {
				id: '4',
				name: 'Anderson Santos',
				avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
			},
			description: 'Ut id libero non tortor ullamcorper porta sit amet eget justo. Proin viverra vitae nibh vel placerat. Donec sed pellentesque libero, ac ultrices felis.',
			verified: true,
		},
		{
			id: '1.3',
			replyId: null,
			date: '2025-02-09 07:08:00',
			user: {
				id: '5',
				name: 'Mateus Gonçalves',
				avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
			},
			description: 'Aenean vehicula placerat lectus, vel facilisis odio gravida non. Suspendisse nisi nisl, venenatis vitae laoreet vel, tempor sit amet velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
			verified: false,
		},
		{
			id: '1.3.1',
			replyId: '1.3',
			date: '2025-02-16 21:07:00',
			user: {
				id: '6',
				name: 'Carlitos Dantes',
				avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
			},
			description: 'Morbi finibus tellus vel turpis fermentum.',
			verified: false,
		},
	],
}

export default function ProblemsPage() {
	function formatDate(dateString: string) {
		return new Date(dateString)
			.toLocaleDateString('pt-BR', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				timeZone: 'America/Sao_Paulo',
			})
			.replace(/\bde\b/g, '')
			.replace(/(\w{3})$/, '$1.')
	}

	return (
		<div className='flex'>
			{/* Coluna da esquerda */}
			<div className='flex w-full flex-shrink-0 flex-col border-r border-zinc-200 sm:w-[480px] dark:border-zinc-700'>
				<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
					{/* Campo de busca */}
					<div className='border-b border-zinc-200 px-8 py-4'>
						<div className='relative'>
							<input type='text' name='problem' className='block w-full rounded-lg border-zinc-200 px-4 py-2.5 pe-11 sm:py-3 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500' placeholder='Procurar problema...' />
							<div className='pointer-events-none absolute inset-y-0 end-0 z-20 flex items-center pe-4'>
								<span className='icon-[lucide--search] ml-1 size-4 shrink-0 text-zinc-400 dark:text-zinc-500'></span>
							</div>
						</div>
					</div>

					{problems.length > 0 ? (
						<ListProblems problems={problems} />
					) : (
						<div className='border-b border-zinc-200 p-8'>
							<div className='rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-zinc-600 dark:bg-yellow-800/10 dark:text-zinc-500' role='alert'>
								<div className='flex flex-col'>
									<div className='flex justify-center pb-1'>
										<span className='icon-[lucide--search-x] size-12 shrink-0 text-zinc-300 dark:text-zinc-500'></span>
									</div>
									<div className='flex flex-col'>
										<h3 className='text-center text-base font-semibold text-zinc-600'>Nenhum resultado</h3>
										<div className='text-center text-sm text-zinc-700'>Nenhum resultado para o texto informado.</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Botão adicionar problema */}
					<div className='px-8 py-4'>
						<div className='flex justify-center'>
							<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2'>
								Adicionar problema
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Coluna direita com o problema selecionado */}
			<div className='flex w-full flex-grow flex-col'>
				<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
					{/* Descrição do problema */}
					<div className='flex w-full flex-col border-b border-zinc-200 p-8'>
						<div className='flex w-full items-center justify-between pb-6'>
							<div>
								<h3 className='text-xl font-medium'>{problem.title}</h3>
								<div className='text-base'>
									<span className='text-sm font-medium'>{problem.solutions.length} soluções</span> <span className='text-zinc-300'>•</span> <span className='text-sm text-zinc-400'>Registrado em {formatDate(problem.date)}</span>
								</div>
							</div>
							<Button type='button' icon='icon-[lucide--edit]' style='unstyled' className='py-2'>
								Editar problema
							</Button>
						</div>

						<div className='flex flex-col gap-y-2 text-zinc-800'>
							{/* Uso de Markdown para a descrição */}
							<ReactMarkdown>{problem.description}</ReactMarkdown>
						</div>

						<div className='flex gap-6 pt-6'>
							{problem.screenshots &&
								problem.screenshots.map(({ id, src, alt }) => (
									<div key={id}>
										<img className='h-32 w-auto rounded-lg' src={src} alt={alt} />
									</div>
								))}
						</div>
					</div>

					{/* Soluções */}
					<div className='flex w-full flex-col border-b border-zinc-200 p-8'>
						<div className='flex w-full items-center justify-between pb-6'>
							<div>
								<h3 className='text-xl font-medium'>Soluções</h3>
								<div>
									<span className='text-sm font-medium'>
										{problem.solutions.length > 0 ? (
											<>
												{problem.solutions.length} soluções para o problema <span className='text-zinc-300'>•</span> {problem.solutions.filter((s) => s.verified).length} foram verificadas
											</>
										) : (
											'Sem soluções cadastradas'
										)}
									</span>
								</div>
							</div>
							<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2'>
								Adicionar solução
							</Button>
						</div>

						{/* Soluções principais */}
						<div className='flex flex-col gap-y-4'>
							{problem.solutions
								.filter((solution) => solution.replyId === null)
								.map((solution) => (
									<div key={solution.id} className='flex gap-x-2'>
										<div className='size-12 shrink-0'>
											<img src={solution.user.avatar} alt={solution.user.name} className='size-full rounded-full' />
										</div>
										<div className='flex flex-col'>
											<div className='flex flex-col gap-y-1'>
												<div className='text-base'>
													<span className='font-bold text-zinc-700'>{solution.user.name}</span> <span className='text-zinc-300'>•</span> <span className='text-sm text-zinc-400'>{formatDate(solution.date)}</span>
													{solution.verified && (
														<span className='ml-2 inline-flex items-center gap-x-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-500/10 dark:text-green-500'>
															<span className='icon-[lucide--check] size-3 shrink-0'></span>
															Resposta verificada
														</span>
													)}
												</div>
												<div className='text-sm font-medium text-zinc-600'>{solution.description}</div>
											</div>
											<div className='py-2'>
												<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2 hover:border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800 dark:text-blue-500 dark:hover:bg-blue-800/30 dark:hover:text-blue-400'>
													Responder
												</Button>
											</div>

											<div className='flex flex-col gap-y-3'>
												{/* Respostas a esta solução */}
												{problem.solutions
													.filter((reply) => reply.replyId === solution.id)
													.map((reply) => (
														<div key={reply.id} className='flex gap-x-2 ml-4 mt-2'>
															<div className='size-12 shrink-0'>
																<img src={reply.user.avatar} alt={reply.user.name} className='size-full rounded-full' />
															</div>
															<div className='flex flex-col'>
																<div className='flex flex-col gap-y-1'>
																	<div className='text-base'>
																		<span className='font-bold text-zinc-700'>{reply.user.name}</span> <span className='text-zinc-300'>•</span> <span className='text-sm text-zinc-400'>{formatDate(reply.date)}</span>
																		{reply.verified && (
																			<span className='ml-2 inline-flex items-center gap-x-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-500/10 dark:text-green-500'>
																				<span className='icon-[lucide--check] size-3 shrink-0'></span>
																				Resposta verificada
																			</span>
																		)}
																	</div>
																	<div className='text-sm font-medium text-zinc-600'>{reply.description}</div>
																</div>
															</div>
														</div>
													))}
											</div>
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function ListProblems({ problems }: { problems: ProblemProps[] }) {
	return (
		<div className='flex flex-col'>
			{problems.length > 0 &&
				problems.map(({ id, title, description, solutions }: ProblemProps) => (
					<div key={id} className='flex flex-col border-b border-zinc-200'>
						<div className='flex w-full flex-col gap-y-1 p-8 hover:bg-zinc-100'>
							<div className='flex w-full items-center justify-between gap-x-2'>
								<span className='text-base font-semibold text-zinc-700'>{title}</span>
								<span className='ms-1 shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600'>{solutions}</span>
							</div>
							<div className='flex text-sm text-zinc-600'>
								<p>{description}</p>
							</div>
						</div>
					</div>
				))}
		</div>
	)
}
