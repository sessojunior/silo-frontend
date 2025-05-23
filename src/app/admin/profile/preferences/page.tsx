'use client'

import { useState } from 'react'

import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Switch from '@/components/ui/Switch'

export default function PreferencesPage() {
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ field: null, message: '' })

	const [theme, setTheme] = useState('')
	const [notifyUpdates, setNotifyUpdates] = useState(false)
	const [sendNewsletters, setSendNewsletters] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			// Simulação de envio
			await new Promise((resolve) => setTimeout(resolve, 1000))
			console.log({ theme, notifyUpdates, sendNewsletters })
		} catch (err) {
			setForm({ field: null, message: 'Erro ao salvar preferências.' })
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
					<form onSubmit={handleSubmit} className='space-y-6 px-6 py-4'>
						<Switch id='notify-updates' name='notifyUpdates' checked={notifyUpdates} onChange={setNotifyUpdates} size='lg' title='Notificar quando houver novas atualizações' description='Notifique-me quando houver novas atualizações no sistema ou novas versões.' isInvalid={form?.field === 'notifyUpdates'} invalidMessage={form?.message} />

						<Switch id='send-newsletters' name='sendNewsletters' checked={sendNewsletters} onChange={setSendNewsletters} size='lg' title='Enviar e-mails semanalmente' description='Enviar e-mails semanalmente com novidades e atualizações.' isInvalid={form?.field === 'sendNewsletters'} invalidMessage={form?.message} />

						<div className='flex items-center justify-between'>
							<div>
								<h3 className='text-lg font-bold tracking-tight text-zinc-600 dark:text-zinc-200'>Tema padrão do sistema</h3>
								<p className='mt-1 text-base text-zinc-400 dark:text-zinc-600'>Alterne entre o tema claro e escuro.</p>
							</div>
							<div>
								<Select
									name='theme'
									selected={theme}
									onChange={setTheme}
									placeholder='Selecione...'
									options={[
										{ label: 'Claro', value: 'light' },
										{ label: 'Escuro', value: 'dark' },
									]}
									isInvalid={form?.field === 'theme'}
									invalidMessage={form?.message}
								/>
							</div>
						</div>

						<div>
							<Button type='submit' disabled={loading} className='w-auto'>
								{loading ? (
									<>
										<span className='icon-[lucide--loader-circle] animate-spin'></span> Aguarde...
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
								description: 'Sua senha não é alterada há 605 dias. É recomendável alterar a senha para manter sua conta segura.',
								action: 'Ir para segurança',
							},
							{
								title: 'Adicionar produtos',
								description: 'Você ainda não adicionou nenhum produto para monitoramento. É recomendável adicionar ao menos algum produto.',
								action: 'Adicionar produto',
							},
							{
								title: 'Adicionar projetos',
								description: 'Você ainda não adicionou nenhum projeto para monitoramento. É recomendável adicionar ao menos algum projeto.',
								action: 'Adicionar projeto',
							},
						].map((item, i) => (
							<div key={i}>
								<div className='p-6 flex flex-col gap-2'>
									<h3 className='text-lg font-bold tracking-tight text-zinc-600 dark:text-zinc-200'>{item.title}</h3>
									<p className='text-base text-zinc-400 dark:text-zinc-200'>{item.description}</p>
									<div className='mt-4'>
										<button type='button' className='inline-flex items-center gap-x-2 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-xs font-semibold text-zinc-600 transition-all duration-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus:bg-zinc-100 focus:outline-hidden disabled:pointer-events-none disabled:opacity-75'>
											{item.action}
										</button>
									</div>
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
