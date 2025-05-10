'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { toast } from '$lib/client/utils/toast'

import AuthHeader from '../components/AuthHeader'
import AuthDivider from '../components/AuthDivider'
import AuthLink from '../components/AuthLink'

import Label from '@/app/components/Label'
import Button from '@/app/components/Button'
import Input from '@/app/components/Input'
import InputPassword from '@/app/components/InputPassword'
import Pin from '@/app/components/Pin'

export default function LoginPage() {
	const router = useRouter()

	const [loading, setLoading] = useState(false)
	const [step, setStep] = useState(1)
	const [form, setForm] = useState({ field: null, message: '' })

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [code, setCode] = useState('')

	useEffect(() => {
		console.log('mudou password')
	}, [password])

	// Enviar dados de login
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()

		setLoading(true)
		setForm({ field: null, message: '' })

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			})

			const data = await res.json()

			if (!res.ok) {
				setForm({ field: data.field, message: data.message })
			} else {
				// Exemplo: caso precise verificar código, avança para etapa 2
				if (data.requireVerification) {
					setStep(2)
				} else {
					// login bem-sucedido
					router.push('/admin/dashboard')
				}
			}
		} catch (err) {
			console.error(err)
			setForm({ field: null, message: 'Erro inesperado. Tente novamente.' })
		} finally {
			setLoading(false)
		}
	}

	// Enviar código de verificação
	const handleVerifyCode = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setForm({ field: null, message: '' })

		try {
			const res = await fetch('/api/auth/verify-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, code }),
			})

			const data = await res.json()

			if (!res.ok) {
				setForm({ field: data.field, message: data.message })
			} else {
				window.location.href = '/dashboard'
			}
		} catch (err) {
			console.error(err)
			setForm({ field: null, message: 'Erro inesperado.' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			{/* Header */}
			{step === 1 && <AuthHeader icon='icon-[lucide--log-in]' title='Entrar' description='Entre para começar a usar.' />}
			{step === 2 && <AuthHeader icon='icon-[lucide--square-asterisk]' title='Verifique a conta' description='Precisamos verificar seu e-mail, insira o código que recebeu por e-mail.' />}

			{/* Container */}
			<div className='mt-10 text-base text-zinc-600 dark:text-zinc-200'>
				{/* Etapa 1: Inserir o e-mail e a senha para fazer login */}
				{step === 1 && (
					<>
						<form onSubmit={handleLogin}>
							<fieldset className='grid gap-5'>
								<div>
									<Label htmlFor='email' isInvalid={form?.field === 'email'}>
										E-mail
									</Label>
									<Input type='email' id='email' name='email' value={email} setValue={setEmail} autocomplete='email' placeholder='seuemail@inpe.br' minlength={8} maxlength={255} required autofocus isInvalid={form?.field === 'email'} invalidMessage={form?.message} />
								</div>
								<div>
									<Label htmlFor='password' isInvalid={form?.field === 'password'}>
										Senha
									</Label>
									<InputPassword id='password' name='password' value={password} setValue={setPassword} autocomplete='current-password' placeholder='••••••••' minlength={6} maxlength={160} required isInvalid={form?.field === 'password'} invalidMessage={form?.message} />
								</div>
								<p className='text-end'>
									<AuthLink href='/forget-password'>Redefinir ou esqueceu a senha?</AuthLink>
								</p>
								<div>
									<Button type='submit' disabled={loading}>
										{loading ? (
											<>
												<span className='icon-[lucide--loader-circle] animate-spin'></span> Entrando...
											</>
										) : (
											<>Entrar</>
										)}
									</Button>
								</div>
								<AuthDivider>ou</AuthDivider>
								<div className='flex w-full flex-col items-center justify-center gap-3'>
									<Button href='/login/code' type='button' style='bordered' icon='icon-[lucide--log-in]'>
										Entrar só com e-mail
									</Button>
									<Button href='/login/google' type='button' style='bordered' icon='icon-[logos--google-icon]'>
										Entrar com Google
									</Button>
								</div>
								<p className='mt-2 text-center'>
									Não tem conta? <AuthLink href='/register'>Cadastre-se</AuthLink>.
								</p>
							</fieldset>
						</form>
					</>
				)}

				{/* Etapa 2: Se o e-mail do usuário não estiver verificado, envia o código OTP para verificar o e-mail */}
				{step === 2 && (
					<>
						<form onSubmit={handleVerifyCode}>
							<fieldset className='grid gap-5'>
								<input type='hidden' name='email' value={email} />
								<div>
									<Label htmlFor='code' isInvalid={form?.field === 'code'}>
										Código que recebeu por e-mail
									</Label>
									<Pin id='code' name='code' length={5} value={code} setValue={setCode} isInvalid={form?.field === 'code'} invalidMessage={form?.message} />
								</div>
								<div>
									<Button type='submit' disabled={loading}>
										{loading ? (
											<>
												<span className='icon-[lucide--loader-circle] animate-spin'></span> Enviando...
											</>
										) : (
											<>Enviar código</>
										)}
									</Button>
								</div>
								<p className='mt-2 text-center'>
									<AuthLink href='/login'>Voltar</AuthLink>
								</p>
							</fieldset>
						</form>
					</>
				)}
			</div>
		</>
	)
}
