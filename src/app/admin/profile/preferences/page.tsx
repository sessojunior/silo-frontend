'use client'

import { useState, useEffect } from 'react'

import { toast } from '@/lib/toast'

import Button from '@/components/ui/Button'
import Switch from '@/components/ui/Switch'

export default function PreferencesPage() {
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ field: null, message: '' })

	const [notifyUpdates, setNotifyUpdates] = useState(false)
	const [sendNewsletters, setSendNewsletters] = useState(false)

	useEffect(() => {
		const fetchUserPreferences = async () => {
			setLoading(true)
			try {
				const res = await fetch('/api/user-preferences')
				const data = await res.json()

				if (!res.ok) {
					toast({
						type: 'error',
						title:
							data.message || 'Erro ao carregar as preferências do usuário.',
					})
					return
				}

				const { userPreferences } = data

				// Atualiza os dados vindos da API
				setNotifyUpdates(userPreferences?.notifyUpdates || false)
				setSendNewsletters(userPreferences?.sendNewsletters || false)
			} catch (error) {
				console.error('Erro ao carregar as preferências do usuário:', error)
				toast({
					type: 'error',
					title: 'Erro inesperado ao carregar as preferências do usuário.',
				})
			} finally {
				setLoading(false)
			}
		}

		fetchUserPreferences()
	}, [])

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault()

		setLoading(true)
		setForm({ field: null, message: '' })

		try {
			const res = await fetch('/api/user-preferences', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ notifyUpdates, sendNewsletters }),
			})

			const data = await res.json()

			if (!res.ok) {
				setForm({ field: data.field, message: data.message })
				toast({
					type: 'error',
					title: data.message,
				})
			} else {
				toast({
					type: 'success',
					title: 'Preferências alteradas com sucesso.',
				})
			}
		} catch (error) {
			console.error(error)
			toast({
				type: 'error',
				title: 'Erro inesperado. Tente novamente.',
			})
			setForm({ field: null, message: 'Erro inesperado. Tente novamente.' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<div className='flex w-full justify-between'>
				<div className='w-full flex-grow'>
					<h1 className='text-3xl font-bold tracking-tight'>Preferências</h1>
					<p className='mt-1 text-base'>Altere suas preferências no sistema.</p>
				</div>
			</div>

			<div className='flex w-full max-w-7xl gap-8'>
				<div className='flex flex-grow flex-col self-start rounded-xl border border-zinc-200 bg-white shadow-2xs'>
					<div className='flex items-center rounded-t-xl border-b border-zinc-200 bg-zinc-50 px-6 py-4'>
						<h3 className='text-xl font-bold'>Permissões gerais</h3>
					</div>
					<form onSubmit={handleUpdate} className='space-y-6 px-6 py-4'>
						<Switch
							id='notify-updates'
							name='notifyUpdates'
							checked={notifyUpdates}
							onChange={setNotifyUpdates}
							size='lg'
							title='Notificar quando houver novas atualizações'
							description='Notifique-me quando houver novas atualizações no sistema ou novas versões.'
							isInvalid={form?.field === 'notifyUpdates'}
							invalidMessage={form?.message}
						/>

						<Switch
							id='send-newsletters'
							name='sendNewsletters'
							checked={sendNewsletters}
							onChange={setSendNewsletters}
							size='lg'
							title='Enviar e-mails semanalmente'
							description='Enviar e-mails semanalmente com novidades e atualizações.'
							isInvalid={form?.field === 'sendNewsletters'}
							invalidMessage={form?.message}
						/>

						<div>
							<Button type='submit' disabled={loading} className='w-auto'>
								{loading ? (
									<>
										<span className='icon-[lucide--loader-circle] animate-spin'></span>{' '}
										Aguarde...
									</>
								) : (
									<>Salvar</>
								)}
							</Button>
						</div>
					</form>
				</div>

				{/* Cartão lateral de recomendações */}
				<div className='flex flex-col gap-8'>
					<div className='flex w-96 flex-col self-start rounded-xl border border-zinc-200 bg-white shadow-2xs'>
						<div className='flex items-center rounded-t-xl border-b border-zinc-200 bg-zinc-100 px-6 py-4'>
							<h3 className='text-xl font-bold'>Recomendações</h3>
						</div>
						{[
							{
								title: 'Alterar senha',
								description:
									'Sua senha não é alterada há 605 dias. É recomendável alterar a senha para manter sua conta segura.',
							},
							{
								title: 'Adicionar produtos',
								description:
									'Você ainda não adicionou nenhum produto para monitoramento. É recomendável adicionar ao menos algum produto.',
							},
							{
								title: 'Adicionar projetos',
								description:
									'Você ainda não adicionou nenhum projeto para monitoramento. É recomendável adicionar ao menos algum projeto.',
							},
						].map((item, i) => (
							<div key={i}>
								<div className='p-6 flex flex-col gap-2'>
									<h3 className='text-lg font-bold tracking-tight text-zinc-600 dark:text-zinc-200'>
										{item.title}
									</h3>
									<p className='text-base text-zinc-400 dark:text-zinc-200'>
										{item.description}
									</p>
								</div>
								{i < 2 && <div className='h-px w-full bg-zinc-200'></div>}
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	)
}
