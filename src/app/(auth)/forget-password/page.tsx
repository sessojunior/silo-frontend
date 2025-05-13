'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { toast } from '$lib/client/utils/toast'

import AuthHeader from '../components/AuthHeader'
import AuthLink from '../components/AuthLink'

import Label from '@/app/components/Label'
import Button from '@/app/components/Button'
import Input from '@/app/components/Input'
import InputPassword from '@/app/components/InputPassword'
import Pin from '@/app/components/Pin'

export default function ForgetPasswordPage() {
	const router = useRouter()

	const [loading, setLoading] = useState(false)
	const [step, setStep] = useState(1)
	const [form, setForm] = useState({ field: null, message: '' })

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [code, setCode] = useState('')

	return (
		<>
			{/* Header */}
			{step === 1 && <AuthHeader icon='icon-[lucide--key-round]' title='Esqueceu a senha' description='Não se preocupe, iremos te ajudar a recuperar sua senha.' />}
			{step === 2 && <AuthHeader icon='icon-[lucide--square-asterisk]' title='Verifique a conta' description='Para sua segurança, insira o código que recebeu por e-mail.' />}
			{step === 3 && <AuthHeader icon='icon-[lucide--lock]' title='Redefinir a senha' description='Agora você precisa digitar a nova senha para sua conta.' />}
			{step === 4 && <AuthHeader icon='icon-[lucide--lock-keyhole]' title='Senha alterada' description='A sua senha foi alterada com sucesso! Volte para continuar.' />}

			{/* Container */}
			<div className='mt-10 text-base text-zinc-600 dark:text-zinc-200'>
				{/* Etapa 1: Inserir e-mail para enviar o código OTP para o e-mail */}
				{step === 1 && (
					<>
						<form>
							<fieldset className='grid gap-5'>
								<div>
									<Label htmlFor='email' isInvalid={form?.field === 'email'}>
										E-mail
									</Label>
									<Input type='email' id='email' name='email' value={email} setValue={setEmail} autocomplete='email' placeholder='seuemail@inpe.br' minlength={8} maxlength={255} required autofocus isInvalid={form?.field === 'email'} invalidMessage={form?.message ?? ''} />
								</div>
								<div>
									<Button type='submit' disabled={loading} className='w-full'>
										{loading ? (
											<>
												<span className='icon-[lucide--loader-circle] animate-spin'></span> Enviando...
											</>
										) : (
											<>Enviar instruções</>
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

				{/* Etapa 2: Enviar código OTP para verificar se está correto */}
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
									<AuthLink href='/sign-in'>Voltar</AuthLink>
								</p>
							</fieldset>
						</form>
					</>
				)}

				{/* Etapa 3: Enviar nova senha para alteração */}
				{step === 3 && (
					<>
						<form>
							<fieldset className='grid gap-5'>
								<div>
									<Label htmlFor='new-password' isInvalid={form?.field === 'password'}>
										Nova senha
									</Label>
									<InputPassword id='new-password' name='password' value={password} setValue={setPassword} autocomplete='current-password' placeholder='••••••••' minlength={6} maxlength={160} required isInvalid={form?.field === 'password'} invalidMessage={form?.message} />
								</div>
								<div>
									<Button type='submit' disabled={loading} className='w-full'>
										{loading ? (
											<>
												<span className='icon-[lucide--loader-circle] animate-spin'></span> Redefinindo...
											</>
										) : (
											<>Redefinir senha</>
										)}
									</Button>
								</div>
								<p className='text-center'>
									<AuthLink href='/sign-in'>Voltar</AuthLink>
								</p>
							</fieldset>
						</form>
					</>
				)}

				{/* Etapa 4: Senha alterada com sucesso */}
				{step === 4 && (
					<>
						<div className='grid gap-5'>
							<div>
								<Button href='/app/welcome' type='button' className='w-full'>
									Ir para o painel
								</Button>
							</div>
							<p className='text-center'>
								<AuthLink href='/sign-in'>Voltar</AuthLink>
							</p>
						</div>
					</>
				)}
			</div>
		</>
	)
}
