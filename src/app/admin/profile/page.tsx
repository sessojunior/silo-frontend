'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { isValidName } from '@/lib/auth/validate'

import { toast } from '@/lib/toast'

import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import PhotoUpload from '@/components/ui/PhotoUpload'

import { useUser } from '@/context/UserContext'

export default function ProfilePage() {
	const user = useUser()
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ field: null as null | string, message: '' })

	const [name, setName] = useState('')
	const [genre, setGenre] = useState('')
	const [role, setRole] = useState('')
	const [phone, setPhone] = useState('')
	const [company, setCompany] = useState('')
	const [location, setLocation] = useState('')
	const [team, setTeam] = useState('')
	const [image, setImage] = useState(user?.image || '')

	const [googleLinked, setGoogleLinked] = useState(false)

	useEffect(() => {
		const fetchUserProfile = async () => {
			setLoading(true)
			try {
				const res = await fetch('/api/user-profile')
				const data = await res.json()

				if (!res.ok) {
					toast({
						type: 'error',
						title: data.message || 'Erro ao carregar os dados do perfil do usuário.',
					})
					return
				}

				const { user, userProfile, googleId } = data

				// Seta os dados vindos do backend
				setName(user?.name || '')
				setImage(user?.image || '')
				setGoogleLinked(googleId || false)
				setGenre(userProfile?.genre || '')
				setRole(userProfile?.role || '')
				setPhone(userProfile?.phone || '')
				setCompany(userProfile?.company || '')
				setLocation(userProfile?.location || '')
				setTeam(userProfile?.team || '')
			} catch (error) {
				console.error('Erro ao carregar os dados do perfil do usuário:', error)
				toast({
					type: 'error',
					title: 'Erro inesperado ao carregar os dados do perfil do usuário.',
				})
			} finally {
				setLoading(false)
			}
		}

		fetchUserProfile()
	}, [])

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault()

		const format = {
			name: name.trim(),
			genre,
			role,
			phone: phone.trim(),
			company: company.trim(),
			location,
			team,
		}

		// Validações de campos obrigatórios
		if (!isValidName(format.name)) {
			setForm({ field: 'name', message: 'Digite seu nome completo corretamente.' })
			return
		}

		// Validações de campos opcionais
		if (format.phone && format.phone.length < 2) {
			setForm({ field: 'role', message: 'Digite seu celular corretamente.' })
			return
		}
		if (format.company && format.company.length < 2) {
			setForm({ field: 'company', message: 'Digite o prédio corretamente.' })
			return
		}

		setLoading(true)
		setForm({ field: null, message: '' })

		try {
			const res = await fetch('/api/user-profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...format }),
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
					title: 'Dados do perfil alterados com sucesso.',
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
			{/* Cabecalho */}
			<div className='flex w-full'>
				<div className='w-full flex-grow'>
					<h1 className='text-3xl font-bold tracking-tight'>Alterar perfil</h1>
					<p className='mt-1 text-base'>Altere suas informações pessoais, como nome, função, celular, equipe, imagem de perfil e outras informações.</p>
				</div>
			</div>

			{/* Cartões */}
			<div className='flex flex-col lg:flex-row w-full max-w-7xl gap-8'>
				<div className='flex w-full lg:w-96 flex-col flex-grow self-start rounded-xl border border-zinc-200 bg-white shadow-2xs'>
					<div className='flex items-center rounded-t-xl border-b border-zinc-200 bg-zinc-100 px-6 py-4'>
						<h3 className='text-xl font-bold'>Informações pessoais</h3>
					</div>
					<div className='flex flex-col gap-4 p-6'>
						<form onSubmit={handleUpdate}>
							<fieldset className='grid w-full gap-5' disabled={loading}>
								<div>
									<Label htmlFor='name' isInvalid={form?.field === 'name'} required>
										Nome
									</Label>
									<Input type='text' id='name' name='name' value={name} setValue={setName} autoComplete='name' placeholder='Fulano' required isInvalid={form?.field === 'name'} invalidMessage={form?.message} />
								</div>
								<div className='flex gap-4'>
									<div className='w-1/2'>
										<Label htmlFor='genre' isInvalid={form?.field === 'genre'}>
											Sexo
										</Label>
										<Select
											name='genre'
											id='genre'
											selected={genre}
											onChange={(value) => setGenre(value)}
											options={[
												{ label: 'Masculino', value: 'male' },
												{ label: 'Feminino', value: 'female' },
											]}
											isInvalid={form?.field === 'genre'}
											invalidMessage={form?.message}
										/>
									</div>
									<div className='w-1/2'>
										<Label htmlFor='phone' isInvalid={form?.field === 'phone'}>
											Celular
										</Label>
										<Input type='text' id='phone' name='phone' value={phone} setValue={setPhone} autoComplete='phone' mask='phone' placeholder='(00) 00000-0000' isInvalid={form?.field === 'phone'} invalidMessage={form?.message} />
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='w-1/2'>
										<Label htmlFor='role' isInvalid={form?.field === 'role'}>
											Função
										</Label>
										<Select
											name='role'
											id='role'
											selected={role}
											onChange={(value) => setRole(value)}
											options={[
												{ label: 'Suporte técnico', value: 'support' },
												{ label: 'Desenvolvedor', value: 'developer' },
												{ label: 'Gerente', value: 'manager' },
											]}
											isInvalid={form?.field === 'role'}
											invalidMessage={form?.message}
										/>
									</div>
									<div className='w-1/2'>
										<Label htmlFor='team' isInvalid={form?.field === 'team'}>
											Equipe
										</Label>
										<Select
											name='team'
											id='team'
											selected={team}
											onChange={(value) => setTeam(value)}
											options={[
												{ label: 'DIPTC', value: 'DIPTC' },
												{ label: 'Outros', value: 'Outros' },
											]}
											isInvalid={form?.field === 'team'}
											invalidMessage={form?.message}
										/>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='w-1/2'>
										<Label htmlFor='company' isInvalid={form?.field === 'company'}>
											Prédio
										</Label>
										<Input type='text' id='company' name='company' value={company} setValue={setCompany} autoComplete='company' placeholder='Nome do prédio' isInvalid={form?.field === 'company'} invalidMessage={form?.message} />
									</div>
									<div className='w-1/2'>
										<Label htmlFor='location' isInvalid={form?.field === 'location'}>
											Localização
										</Label>
										<Select
											name='location'
											id='location'
											selected={location}
											onChange={(value) => setLocation(value)}
											options={[
												{ label: 'Cachoeira Paulista', value: 'Cachoeira Paulista' },
												{ label: 'São José dos Campos', value: 'São José dos Campos' },
												{ label: 'Outros', value: 'Outros' },
											]}
											isInvalid={form?.field === 'location'}
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
							</fieldset>
						</form>
					</div>
				</div>

				<div className='flex flex-col gap-8'>
					<div className='flex w-full lg:w-96 flex-col self-start rounded-xl border border-zinc-200 bg-white shadow-2xs'>
						<div className='flex items-center rounded-t-xl border-b border-zinc-200 bg-zinc-100 px-6 py-4'>
							<h3 className='text-xl font-bold'>Sua foto</h3>
						</div>
						<div className='flex flex-col gap-4 p-6'>
							{/* Upload da imagem */}
							<PhotoUpload image={image} />
						</div>
					</div>

					<div className='flex w-full lg:w-96 flex-col self-start rounded-xl border border-zinc-200 bg-white shadow-2xs'>
						<div className='flex flex-col p-6'>
							<div className='flex w-full items-center justify-between'>
								<div>
									<Image src='/images/google-logo.png' alt='Google' width={240} height={81} className='h-10 w-auto' />
								</div>
								<div>
									{googleLinked ? (
										<button disabled className='flex w-full cursor-not-allowed items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-400'>
											<span className='icon-[logos--google-icon] size-4 shrink-0'></span>
											Conectado
										</button>
									) : (
										<a href='/login-google' className='flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-red-400 hover:text-white'>
											<span className='icon-[logos--google-icon] size-4 shrink-0'></span>
											Conectar
										</a>
									)}
								</div>
							</div>
						</div>
						<div className='px-6 pb-6'>
							<h3 className='text-lg font-bold tracking-tight text-zinc-600 dark:text-zinc-200'>Entrar com o Google</h3>
							<p className='mt-1 text-base text-zinc-400 dark:text-zinc-200'>Para conectar sua conta ao Google, use o mesmo e-mail de sua conta atual. Assim, você poderá entrar mais facilmente com a sua conta do Google.</p>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
