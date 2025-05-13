'use client'

import Link from 'next/link'

import Label from '@/app/components/Label'
import InputCheckbox from '@/app/components/InputCheckbox'

interface WelcomeProps {
	icon: string
	title: string
	description: string
	link: string
	completed: boolean
}

const welcome: WelcomeProps[] = [
	{
		icon: 'icon-[lucide--user-round-pen]',
		title: 'Complete seu perfil de usuário',
		description: 'Termine de configurar as informações de seu perfil, como nome, imagem de perfil e outras informações.',
		link: '/admin/settings/profile',
		completed: true,
	},
	{
		icon: 'icon-[lucide--folder-git-2]',
		title: 'Configure os produtos e tarefas',
		description: 'Selecione os produtos e tarefas que deseja monitorar e acompanhar na visão geral.',
		link: '#',
		completed: false,
	},
	{
		icon: 'icon-[lucide--square-chart-gantt]',
		title: 'Configure os projetos',
		description: 'Selecione ou crie os projetos e configure seu Kanban e acompanhe o gráfico Gantt.',
		link: '#',
		completed: false,
	},
]

export default function WelcomePage() {
	return (
		<div className='container flex h-full flex-col items-center justify-center p-8 text-zinc-600 dark:text-zinc-200'>
			<div className='mb-4 max-w-2xl'>
				<h1 className='text-center text-3xl font-bold tracking-tight'>
					Bem-vindo <span className='text-blue-600'>Fulano</span> 👋
				</h1>
				<p className='mt-1 text-center text-base'>Siga as etapas abaixo para finalizar a configuração de sua conta.</p>
			</div>

			{/* Cartão de boas-vindas */}
			<div className='w-full max-w-2xl'>
				<div className='flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900'>
					<div className='flex items-center justify-between rounded-t-xl border-b border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800'>
						<h3 className='text-2xl font-bold'>Vamos começar!</h3>
						<div className='text-sm text-zinc-500 dark:text-zinc-400'>
							{welcome.filter((item) => item.completed).length} de {welcome.length}
						</div>
					</div>

					<div className='flex flex-col gap-4 p-6'>
						{welcome.map((item, index) => (
							<Link key={index} href={item.link} className={`group flex items-center gap-x-4 rounded-lg border p-4 transition-colors ${item.completed ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' : 'border-zinc-200 bg-zinc-50 hover:border-blue-200 hover:bg-blue-50'}`}>
								<div>
									<div className={`flex size-14 items-center justify-center rounded-lg border transition-colors ${item.completed ? 'border-blue-300 bg-blue-300 group-hover:bg-blue-400' : 'border-zinc-200 bg-zinc-100 group-hover:border-blue-200 group-hover:bg-blue-100'}`}>{item.completed ? <span className='icon-[lucide--check-check] size-8 shrink-0 text-white'></span> : <span className={`${item.icon} size-8 shrink-0 text-zinc-400 group-hover:text-blue-400`}></span>}</div>
								</div>
								<div>
									<h3 className='text-lg font-medium'>{item.title}</h3>
									<p className='text-sm text-zinc-500 dark:text-zinc-400'>{item.description}</p>
								</div>
							</Link>
						))}

						<div className='flex items-center justify-center pt-2 text-center'>
							<Label htmlFor='hide-welcome'>
								<InputCheckbox id='hide-welcome' name='hide-welcome' label='Não exibir mais as boas-vindas.' />
							</Label>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
