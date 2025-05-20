'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { toast } from '@/app/lib/toast'

import AuthHeader from '../components/AuthHeader'
import AuthDivider from '../components/AuthDivider'
import AuthLink from '../components/AuthLink'

import Label from '@/app/components/Label'
import Button from '@/app/components/Button'
import Input from '@/app/components/Input'
import InputPasswordHints from '@/app/components/InputPasswordHints'
import Pin from '@/app/components/Pin'

export default function RegisterPage() {
	const router = useRouter()

	const [loading, setLoading] = useState(false)
	const [step, setStep] = useState(1)
	const [form, setForm] = useState({ field: null as null | string, message: '' })

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [code, setCode] = useState('')

	const nameRef = useRef<HTMLInputElement>(null)
	const emailRef = useRef<HTMLInputElement>(null)
	const passwordRef = useRef<HTMLInputElement>(null)
	const codeRef = useRef<HTMLInputElement>(null)

	// Foca no campo inválido quando houver erro
	useEffect(() => {
		if (!form.field) return

		switch (form.field) {
			case 'name':
				nameRef.current?.focus()
				break
			case 'email':
				emailRef.current?.focus()
				break
			case 'password':
				passwordRef.current?.focus()
				break
			case 'code':
				codeRef.current?.focus()
				break
		}
	}, [form])

	// Etapa 1: Criar conta
	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault()

		const formatEmail = email.trim().toLowerCase()

		// Validações básicas
		if (!name || name.length < 2) {
			setForm({ field: 'name', message: 'Digite um nome válido.' })
			return
		}
		if (!formatEmail.includes('@')) {
			setForm({ field: 'email', message: 'Digite um e-mail válido.' })
			return
		}
		if (password.length < 8) {
			setForm({ field: 'password', message: 'A senha deve ter pelo menos 8 caracteres.' })
			return
		}

		setLoading(true)
		setForm({ field: null, message: '' })

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email: formatEmail, password }),
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
					title: 'Conta criada com sucesso. Verifique seu e-mail.',
				})
				setStep(2)
			}
		} catch (err) {
			console.error(err)
			toast({
				type: 'error',
				title: 'Erro inesperado. Tente novamente.',
			})
			setForm({ field: null, message: 'Erro inesperado. Tente novamente.' })
		} finally {
			setLoading(false)
		}
	}

	// Etapa 2: Enviar código de verificação
	const handleVerifyCode = async (e: React.FormEvent) => {
		e.preventDefault()

		const formatEmail = email.trim().toLowerCase()

		if (!code || code.length !== 5) {
			setForm({ field: 'code', message: 'Digite o código com 5 caracteres.' })
			return
		}

		setLoading(true)
		setForm({ field: null, message: '' })

		try {
			const res = await fetch('/api/auth/verify-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: formatEmail, code }),
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
					title: 'Conta verificada com sucesso.',
				})
				router.push('/app/welcome')
			}
		} catch (err) {
			console.error(err)
			toast({
				type: 'error',
				title: 'Erro ao verificar o código.',
			})
			setForm({ field: null, message: 'Erro ao verificar o código.' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			{/* Header */}
			{step === 1 && <AuthHeader icon='icon-[lucide--user-round-plus]' title='Criar conta' description='Preencha os dados abaixo para criar sua conta e começar a usar.' />}
			{step === 2 && <AuthHeader icon='icon-[lucide--square-asterisk]' title='Verifique a conta' description='Precisamos verificar seu e-mail, insira o código que recebeu por e-mail.' />}

			{/* Container */}
			<div className='mt-10 text-base text-zinc-600 dark:text-zinc-200'>
				{/* Etapa 1: Inserir os dados para criar a conta */}
				{step === 1 && (
					<>
						<form onSubmit={handleRegister}>
							<fieldset className='grid gap-5' disabled={loading}>
								<div>
									<Label htmlFor='name' isInvalid={form?.field === 'name'}>
										Nome
									</Label>
									<Input ref={nameRef} type='text' id='name' name='name' value={name} setValue={setName} autocomplete='name' placeholder='Fulano' required isInvalid={form?.field === 'name'} invalidMessage={form?.message} />
								</div>
								<div>
									<Label htmlFor='email' isInvalid={form?.field === 'email'}>
										E-mail
									</Label>
									<Input ref={emailRef} type='email' id='email' name='email' value={email} setValue={setEmail} autocomplete='email' placeholder='seuemail@inpe.br' minlength={8} maxlength={255} required isInvalid={form?.field === 'email'} invalidMessage={form?.message} />
								</div>
								<div>
									<Label htmlFor='password' isInvalid={form?.field === 'password'}>
										Senha
									</Label>
									<InputPasswordHints ref={passwordRef} id='password' name='password' value={password} setValue={setPassword} autocomplete='current-password' placeholder='••••••••' minlength={8} maxlength={160} required isInvalid={form?.field === 'password'} invalidMessage={form?.message} />
								</div>
								<div>
									<Button type='submit' disabled={loading} className='w-full'>
										{loading ? (
											<>
												<span className='icon-[lucide--loader-circle] animate-spin'></span> Criando conta...
											</>
										) : (
											<>Criar conta</>
										)}
									</Button>
								</div>
								<AuthDivider>ou</AuthDivider>
								<div className='flex w-full flex-col items-center justify-center gap-3'>
									<Button href='/login/google' type='button' style='bordered' icon='icon-[logos--google-icon]' className='w-full'>
										Criar com Google
									</Button>
								</div>
								<p className='text-center'>
									Tem uma conta? <AuthLink href='/login'>Entre</AuthLink>.
								</p>
							</fieldset>
						</form>
					</>
				)}

				{/* Etapa 2: Se o e-mail do usuário não estiver verificado, envia o código OTP para verificar o e-mail */}
				{step === 2 && (
					<>
						<form onSubmit={handleVerifyCode}>
							<fieldset className='grid gap-5' disabled={loading}>
								<input type='hidden' name='email' value={email} />
								<div>
									<Label htmlFor='code' isInvalid={form?.field === 'code'}>
										Código que recebeu por e-mail
									</Label>
									<Pin id='code' name='code' length={5} value={code} setValue={setCode} isInvalid={form?.field === 'code'} invalidMessage={form?.message ?? ''} />
								</div>
								<div>
									<Button type='submit' disabled={loading} className='w-full'>
										{loading ? (
											<>
												<span className='icon-[lucide--loader-circle] animate-spin'></span> Enviando...
											</>
										) : (
											<>Enviar código</>
										)}
									</Button>
								</div>
								<p className='text-center'>
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
