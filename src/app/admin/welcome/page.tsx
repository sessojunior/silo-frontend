'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import InputCheckbox from '@/components/ui/InputCheckbox'
import { useUser } from '@/context/UserContext'

interface Step {
	icon: string
	title: string
	description: string
	link: string
	completed: boolean
}

export default function WelcomePage() {
	const user = useUser()
	const router = useRouter()

	const [steps, setSteps] = useState<Step[]>([])
	const [hideWelcome, setHideWelcome] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		async function loadData() {
			// === 1. Verificar Perfil ===
			let profileCompleted = false
			try {
				const res = await fetch('/api/user-profile')
				if (res.ok) {
					const data = await res.json()
					profileCompleted = Boolean(data?.user?.image)
				}
			} catch {
				profileCompleted = false
			}

			// === 2. Verificar Produtos ===
			let productsConfigured = false
			try {
				const res = await fetch('/api/admin/products')
				if (res.ok) {
					const data = await res.json()
					productsConfigured = Array.isArray(data?.products) && data.products.length > 0
				}
			} catch {
				productsConfigured = false
			}

			// === 3. Verificar Projetos ===
			let projectsConfigured = false
			try {
				const res = await fetch('/api/admin/projects')
				if (res.ok) {
					const data = await res.json()
					projectsConfigured = Array.isArray(data?.projects) && data.projects.length > 0
				}
			} catch {
				projectsConfigured = false
			}

			setSteps([
				{
					icon: 'icon-[lucide--user-round-pen]',
					title: 'Complete seu perfil de usuário',
					description: 'Adicione sua foto, função e demais informações pessoais.',
					link: '/admin/settings',
					completed: profileCompleted,
				},
				{
					icon: 'icon-[lucide--folder-git-2]',
					title: 'Cadastre produtos',
					description: 'Crie ou configure os produtos que serão monitorados.',
					link: '/admin/products',
					completed: productsConfigured,
				},
				{
					icon: 'icon-[lucide--square-chart-gantt]',
					title: 'Crie projetos',
					description: 'Organize as atividades em projetos com Kanban e Gantt.',
					link: '/admin/projects',
					completed: projectsConfigured,
				},
			])
			console.log('ℹ️ [WelcomePage] Passos carregados', { profileCompleted, productsConfigured, projectsConfigured })
			setLoading(false)
		}

		loadData()
	}, [])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('hideWelcome')
			setHideWelcome(stored === 'true')
		}
	}, [])

	useEffect(() => {
		if (hideWelcome) {
			localStorage.setItem('hideWelcome', 'true')
			router.replace('/admin')
		} else {
			localStorage.setItem('hideWelcome', 'false')
		}
	}, [hideWelcome, router])

	const completedCount = steps.filter((s) => s.completed).length

	if (loading) {
		return (
			<div className='flex min-h-screen w-full items-center justify-center text-zinc-500 dark:text-zinc-400'>
				<div className='flex items-center gap-3'>
					<span className='icon-[lucide--loader-circle] animate-spin size-5' />
					Carregando página...
				</div>
			</div>
		)
	}

	return (
		<div className='w-full flex min-h-full flex-col items-center justify-center p-8 text-zinc-600 dark:text-zinc-200'>
			<div className='mb-4 max-w-2xl'>
				<h1 className='text-center text-3xl font-bold tracking-tight'>
					Bem-vindo <span className='text-blue-600'>{user?.name?.split(' ')[0] || 'Usuário'}</span> 👋
				</h1>
				<p className='mt-1 text-center text-base'>Siga as etapas abaixo para finalizar a configuração inicial.</p>
			</div>

			{/* Cartão de boas-vindas */}
			<div className='w-full max-w-2xl'>
				<div className='flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900'>
					<div className='flex items-center justify-between rounded-t-xl border-b border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800'>
						<h3 className='text-2xl font-bold'>Vamos começar!</h3>
						<div className='text-sm text-zinc-500 dark:text-zinc-400'>
							{completedCount} de {steps.length}
						</div>
					</div>

					<div className='flex flex-col gap-4 p-6'>
						{steps.map((item, index) => (
							<Link key={index} href={item.link} className={`group flex items-center gap-x-4 rounded-lg border p-4 transition-colors ${item.completed ? 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/30 dark:hover:bg-green-800/40' : 'border-zinc-200 bg-zinc-50 hover:border-blue-200 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-blue-600 dark:hover:bg-blue-900/30'}`}>
								<div>
									<div className={`flex size-14 items-center justify-center rounded-lg border transition-colors ${item.completed ? 'border-green-300 bg-green-300 group-hover:bg-green-400 dark:border-green-600 dark:bg-green-600 dark:group-hover:bg-green-500' : 'border-zinc-200 bg-zinc-100 group-hover:border-blue-200 group-hover:bg-blue-100 dark:border-zinc-600 dark:bg-zinc-700 dark:group-hover:border-blue-600 dark:group-hover:bg-blue-800/50'}`}>{item.completed ? <span className='icon-[lucide--check-check] size-8 shrink-0 text-white'></span> : <span className={`${item.icon} size-8 shrink-0 text-zinc-400 group-hover:text-blue-400`}></span>}</div>
								</div>
								<div>
									<h3 className='text-lg font-medium'>{item.title}</h3>
									<p className='text-sm text-zinc-500 dark:text-zinc-400'>{item.description}</p>
								</div>
							</Link>
						))}

						<div className='flex items-center justify-center pt-2 text-center'>
							<InputCheckbox id='hide-welcome' name='hide-welcome' label='Não exibir mais as boas-vindas.' checked={hideWelcome} onChange={(e) => setHideWelcome(e.currentTarget.checked)} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
