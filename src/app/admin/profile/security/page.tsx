'use client'

import { useState } from 'react'
import { isValidEmail, isValidPassword } from '@/lib/auth/validate'

import Label from '@/components/ui/Label'
import Input from '@/components/ui/Input'
import InputPasswordHints from '@/components/ui/InputPasswordHints'
import Button from '@/components/ui/Button'

import { toast } from '@/lib/toast'

import { useUser } from '@/context/UserContext'

export default function SecurityPage() {
	const user = useUser()
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ field: null as null | string, message: '' })

	const [email, setEmail] = useState(user.email)
	const [password, setPassword] = useState('')

	const handleUpdateEmail = async (e: React.FormEvent) => {
		e.preventDefault()

		const formatEmail = email ? email.trim().toLowerCase() : ''

		// Validações de campos obrigatórios
		if (!isValidEmail(formatEmail)) {
			setForm({ field: 'email', message: 'Digite seu e-mail corretamente.' })
			return
		}

		setLoading(true)
		setForm({ field: null, message: '' })

		try {
			const res = await fetch('/api/user-email', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: formatEmail }),
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
					title: 'O e-mail foi alterado com sucesso.',
				})
			}
		} catch (error) {
			console.error('❌ Erro ao atualizar email:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado. Tente novamente.',
			})
			setForm({ field: null, message: 'Erro inesperado. Tente novamente.' })
		} finally {
			setLoading(false)
		}
	}

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validações de campos obrigatórios
		if (!isValidPassword(password)) {
			setForm({ field: 'password', message: 'Digite a senha corretamente.' })
			return
		}

		setLoading(true)
		setForm({ field: null, message: '' })

		try {
			const res = await fetch('/api/user-password', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password }),
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
					title: 'A senha foi alterada com sucesso.',
				})
			}
		} catch (error) {
			console.error('❌ Erro ao atualizar senha:', error)
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
			{/* Cabeçalho */}
			<div className='flex w-full'>
				<div className='w-full flex-grow'>
					<h1 className='text-3xl font-bold tracking-tight'>Segurança</h1>
					<p className='mt-1 text-base'>Altere seu e-mail de acesso ou sua senha se for necessário.</p>
				</div>
			</div>

			{/* Cartões */}
			<div className='flex w-full max-w-7xl gap-8'>
				<div className='flex w-1/2 flex-col gap-8'>
					<div className='flex w-full flex-grow flex-col self-start rounded-xl border border-zinc-200 bg-white shadow-2xs'>
						<div className='flex items-center rounded-t-xl border-b border-zinc-200 bg-zinc-100 px-6 py-4'>
							<h3 className='text-xl font-bold'>Alterar e-mail</h3>
						</div>
						<div className='flex flex-col gap-4 p-6'>
							<form onSubmit={handleUpdateEmail}>
								<fieldset className='grid w-full gap-5' disabled={loading}>
									<div className='flex gap-4'>
										<div className='w-full'>
											<Label htmlFor='email' isInvalid={form?.field === 'email'}>
												Novo e-mail
											</Label>
											<Input type='email' id='email' name='email' autoComplete='email' placeholder='seuemail@inpe.br' value={email} setValue={setEmail} minLength={8} maxLength={255} required isInvalid={form?.field === 'email'} invalidMessage={form?.message} />
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
								</fieldset>
							</form>
						</div>
					</div>

					<div className='flex w-full flex-grow flex-col self-start rounded-xl border border-zinc-200 bg-white shadow-2xs'>
						<div className='flex items-center rounded-t-xl border-b border-zinc-200 bg-zinc-100 px-6 py-4'>
							<h3 className='text-xl font-bold'>Alterar senha</h3>
						</div>
						<div className='flex flex-col gap-4 p-6'>
							<form onSubmit={handleUpdatePassword}>
								<fieldset className='grid w-full gap-5' disabled={loading}>
									<div className='flex gap-4'>
										<div className='w-full'>
											<Label htmlFor='password' isInvalid={form?.field === 'password'}>
												Nova senha
											</Label>
											<InputPasswordHints id='password' name='password' value={password} setValue={setPassword} autoComplete='current-password' placeholder='••••••••' minLength={8} maxLength={160} required isInvalid={form?.field === 'password'} invalidMessage={form?.message} />
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
								</fieldset>
							</form>
						</div>
					</div>
				</div>

				<div className='flex w-1/2 flex-col gap-8'>
					<div className='flex w-full flex-col self-start rounded-xl border border-zinc-200 bg-white shadow-2xs'>
						<div className='flex items-center rounded-t-xl border-b border-zinc-200 bg-zinc-100 px-6 py-4'>
							<h3 className='text-xl font-bold'>Informações importantes</h3>
						</div>
						<div className='flex flex-col gap-6'>
							<div className='p-6'>
								<h3 className='text-lg font-bold tracking-tight text-zinc-600 dark:text-zinc-200'>Alteração de e-mail</h3>
								<div className='text-base text-zinc-400 dark:text-zinc-200'>
									<p className='mt-1'>Ao alterar seu e-mail, será enviado um código para seu novo e-mail para confirmação de que ele existe. Você deve digitar esse código no campo correspondente que irá aparecer em seguida.</p>
								</div>
							</div>
						</div>
						<div className='h-px w-full bg-zinc-200'></div>
						<div className='flex flex-col gap-6'>
							<div className='p-6'>
								<h3 className='text-lg font-bold tracking-tight text-zinc-600 dark:text-zinc-200'>Alteração de senha</h3>
								<div className='text-base text-zinc-400 dark:text-zinc-200'>
									<p className='mt-1'>Crie uma senha forte, se possível única, que contenha de 8 a 40 caracteres, com letras maiúsculas e minúsculas, números e caracteres especiais.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
