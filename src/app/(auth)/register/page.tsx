'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { toast } from '$lib/client/utils/toast'

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
	const [form, setForm] = useState({ field: null, message: '' })

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [code, setCode] = useState('')

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
						<form>
							<fieldset className='grid gap-5'>
								<div>
									<Label htmlFor='name' isInvalid={form?.field === 'name'}>
										Nome
									</Label>
									<Input type='text' id='name' name='name' value={name} setValue={setName} autocomplete='name' placeholder='Fulano' required isInvalid={form?.field === 'name'} invalidMessage={form?.message} />
								</div>
								<div>
									<Label htmlFor='email' isInvalid={form?.field === 'email'}>
										E-mail
									</Label>
									<Input type='email' id='email' name='email' value={email} setValue={setEmail} autocomplete='email' placeholder='seuemail@inpe.br' minlength={8} maxlength={255} required isInvalid={form?.field === 'email'} invalidMessage={form?.message} />
								</div>
								<div>
									<Label htmlFor='password' isInvalid={form?.field === 'password'}>
										Senha
									</Label>
									<InputPasswordHints id='password' name='password' value={password} setValue={setPassword} autocomplete='current-password' placeholder='••••••••' minlength={8} maxlength={160} required isInvalid={form?.field === 'password'} invalidMessage={form?.message} />
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
						<form>
							<fieldset className='grid gap-5'>
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
