'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { toast } from '$lib/client/utils/toast'

import AuthHeader from '../../components/AuthHeader'
import AuthDivider from '../../components/AuthDivider'
import AuthLink from '../../components/AuthLink'

import Label from '@/app/components/Label'
import Button from '@/app/components/Button'
import Input from '@/app/components/Input'
import Pin from '@/app/components/Pin'

export default function LoginEmailPage() {
	const router = useRouter()

	const [loading, setLoading] = useState(false)
	const [step, setStep] = useState(1)
	const [form, setForm] = useState({ field: null, message: '' })

	const [email, setEmail] = useState('')
	const [code, setCode] = useState('')

	return (
		<>
			{step === 1 && <AuthHeader icon='icon-[lucide--log-in]' title='Entrar' description='Entre para commençar a usar.' />}
			{step === 2 && <AuthHeader icon='icon-[lucide--square-asterisk]' title='Verifique a conta' description='Precisamos verificar seu e-mail, insira o código que recebeu por e-mail.' />}

			{/* Container */}
			<div className='mt-10 text-base text-zinc-600 dark:text-zinc-200'>
				{/* Etapa 1: Inserir o e-mail para fazer login */}
				{step === 1 && (
					<>
						<form>
							<fieldset className='grid gap-5'>
								<div>
									<Label htmlFor='email' isInvalid={form?.field === 'email'}>
										E-mail
									</Label>
									<Input type='email' id='email' name='email' value={email} setValue={setEmail} autocomplete='email' placeholder='seuemail@inpe.br' minlength={8} maxlength={255} required autofocus isInvalid={form?.field === 'email'} invalidMessage={form?.message} />
								</div>
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
									<Button href='/login' type='button' style='bordered' icon='icon-[lucide--log-in]'>
										Entrar com e-mail e senha
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

				{/* Etapa 2: Enviar o código OTP para fazer login */}
				{step === 2 && (
					<>
						<form>
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
