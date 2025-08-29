'use client'

import { useState, useEffect } from 'react'
import { isValidName, isValidEmail, isValidPassword } from '@/lib/auth/validate'
import { toast } from '@/lib/toast'

import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import PhotoUpload from '@/components/ui/PhotoUpload'
import InputPasswordHints from '@/components/ui/InputPasswordHints'

import { useUser } from '@/context/UserContext'

type TabType = 'profile' | 'preferences' | 'security'

interface FormState {
	field: string | null
	message: string
}

export default function SettingsPage() {
	const user = useUser()
	const [activeTab, setActiveTab] = useState<TabType>('profile')
	const [loadingProfile, setLoadingProfile] = useState(false)
	const [loadingPreferences, setLoadingPreferences] = useState(false)
	const [loadingEmail, setLoadingEmail] = useState(false)
	const [loadingPassword, setLoadingPassword] = useState(false)
	const [form, setForm] = useState<FormState>({ field: null, message: '' })

	// Profile tab state
	const [name, setName] = useState('')
	const [genre, setGenre] = useState('')
	const [role, setRole] = useState('')
	const [phone, setPhone] = useState('')
	const [company, setCompany] = useState('')
	const [location, setLocation] = useState('')
	const [team, setTeam] = useState('')
	const [image, setImage] = useState(user?.image || '')

	// Preferences tab state
	const [chatEnabled, setChatEnabled] = useState(true)
	const [showWelcome, setShowWelcome] = useState<boolean>(true)

	// Leitura rápida do localStorage na montagem
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const hide = localStorage.getItem('hideWelcome') === 'true'
			setShowWelcome(!hide)
		}
	}, [])

	// Security tab state
	const [email, setEmail] = useState(user?.email || '')
	const [password, setPassword] = useState('')

	// Load data on component mount and when activeTab changes
	useEffect(() => {
		// Carregar dados apenas na montagem inicial para evitar sobrescrever estado local
		fetchAllData()
	}, []) // Remover activeTab da dependência para evitar recarregar preferências

	// Navigation items
	const navigationItems = [
		{
			id: 'profile' as TabType,
			name: 'Perfil',
			icon: 'icon-[lucide--user]',
			description: 'Informações pessoais e foto',
		},
		{
			id: 'preferences' as TabType,
			name: 'Preferências',
			icon: 'icon-[lucide--settings]',
			description: 'Permissões e notificações',
		},
		{
			id: 'security' as TabType,
			name: 'Segurança',
			icon: 'icon-[lucide--shield-check]',
			description: 'E-mail e senha',
		},
	]

	const fetchAllData = async () => {
		setLoadingProfile(true)
		try {
			// Fetch user profile
			const profileRes = await fetch('/api/user-profile')
			const profileData = await profileRes.json()

			if (profileRes.ok) {
				const { user: userData, userProfile } = profileData
				setName(userData?.name || '')
				setImage(userData?.image || '')
				setGenre(userProfile?.genre || '')
				setRole(userProfile?.role || '')
				setPhone(userProfile?.phone || '')
				setCompany(userProfile?.company || '')
				setLocation(userProfile?.location || '')
				setTeam(userProfile?.team || '')
			}

			// Fetch user preferences
			const preferencesRes = await fetch('/api/user-preferences')
			const preferencesData = await preferencesRes.json()

			if (preferencesRes.ok) {
				const { userPreferences } = preferencesData
				// Lógica mais clara para chatEnabled: se não existir, usar true como padrão
				setChatEnabled(userPreferences?.chatEnabled ?? true)
			}
		} catch (error) {
			console.error('❌ Erro ao carregar dados do usuário:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado ao carregar dados do usuário.',
			})
		} finally {
			setLoadingProfile(false)
		}
	}

	const handleUpdateProfile = async (e: React.FormEvent) => {
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

		// Validations
		if (!isValidName(format.name)) {
			setForm({ field: 'name', message: 'Digite seu nome completo corretamente.' })
			return
		}

		if (format.phone && format.phone.length < 2) {
			setForm({ field: 'phone', message: 'Digite seu celular corretamente.' })
			return
		}

		if (format.company && format.company.length < 2) {
			setForm({ field: 'company', message: 'Digite o prédio corretamente.' })
			return
		}

		setLoadingProfile(true)
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
			console.error('❌ Erro ao atualizar perfil:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado. Tente novamente.',
			})
		} finally {
			setLoadingProfile(false)
		}
	}

	const handleUpdatePreferences = async (e: React.FormEvent) => {
		e.preventDefault()

		setLoadingPreferences(true)
		setForm({ field: null, message: '' })

		try {
			const res = await fetch('/api/user-preferences', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ chatEnabled }),
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

				// Atualiza localStorage para refletir a preferência de boas-vindas
				if (typeof window !== 'undefined') {
					localStorage.setItem('hideWelcome', showWelcome ? 'false' : 'true')
				}

				// Se a preferência de chat foi alterada, atualiza o sidebar e topbar
				if (data.userPreferences?.chatEnabled !== chatEnabled) {
					// Força a atualização dos componentes que dependem do chat
					window.dispatchEvent(
						new CustomEvent('chatPreferenceChanged', {
							detail: { chatEnabled },
						}),
					)
				}
			}
		} catch (error) {
			console.error('❌ Erro ao atualizar preferências:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado. Tente novamente.',
			})
		} finally {
			setLoadingPreferences(false)
		}
	}

	const handleUpdateEmail = async (e: React.FormEvent) => {
		e.preventDefault()

		const formatEmail = email ? email.trim().toLowerCase() : ''

		if (!isValidEmail(formatEmail)) {
			setForm({ field: 'email', message: 'Digite seu e-mail corretamente.' })
			return
		}

		setLoadingEmail(true)
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
		} finally {
			setLoadingEmail(false)
		}
	}

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!isValidPassword(password)) {
			setForm({ field: 'password', message: 'Digite a senha corretamente.' })
			return
		}

		setLoadingPassword(true)
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
				setPassword('')
			}
		} catch (error) {
			console.error('❌ Erro ao atualizar senha:', error)
			toast({
				type: 'error',
				title: 'Erro inesperado. Tente novamente.',
			})
		} finally {
			setLoadingPassword(false)
		}
	}

	const renderProfileContent = () => (
		<div className='space-y-6'>
			<div>
				<h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1'>Informações Pessoais</h2>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>Altere suas informações pessoais, como nome, função, celular, equipe e foto de perfil.</p>
			</div>

			<form onSubmit={handleUpdateProfile} className='space-y-6'>
				{/* Photo Upload */}
				<div>
					<Label>Foto de perfil</Label>
					<div className='mt-2'>
						<PhotoUpload image={image} />
					</div>
				</div>

				<fieldset className='grid gap-6' disabled={loadingProfile}>
					{/* Name */}
					<div>
						<Label htmlFor='name' isInvalid={form?.field === 'name'} required>
							Nome completo
						</Label>
						<Input type='text' id='name' name='name' value={name} setValue={setName} autoComplete='name' placeholder='Fulano da Silva' required isInvalid={form?.field === 'name'} invalidMessage={form?.message} />
					</div>

					{/* Genre and Phone */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div>
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
								placeholder='Selecione seu sexo'
								isInvalid={form?.field === 'genre'}
								invalidMessage={form?.message}
							/>
						</div>
						<div>
							<Label htmlFor='phone' isInvalid={form?.field === 'phone'}>
								Celular
							</Label>
							<Input type='text' id='phone' name='phone' value={phone} setValue={setPhone} autoComplete='phone' mask='phone' placeholder='(00) 00000-0000' isInvalid={form?.field === 'phone'} invalidMessage={form?.message} />
						</div>
					</div>

					{/* Role and Team */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div>
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
									{ label: 'Analista', value: 'analyst' },
								]}
								placeholder='Selecione sua função'
								isInvalid={form?.field === 'role'}
								invalidMessage={form?.message}
							/>
						</div>
						<div>
							<Label htmlFor='team' isInvalid={form?.field === 'team'}>
								Equipe
							</Label>
							<Select
								name='team'
								id='team'
								selected={team}
								onChange={(value) => setTeam(value)}
								options={[
									{ label: 'CPTEC', value: 'cptec' },
									{ label: 'INPE', value: 'inpe' },
									{ label: 'MCTIC', value: 'mctic' },
									{ label: 'Externa', value: 'external' },
								]}
								placeholder='Selecione sua equipe'
								isInvalid={form?.field === 'team'}
								invalidMessage={form?.message}
							/>
						</div>
					</div>

					{/* Company and Location */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='company' isInvalid={form?.field === 'company'}>
								Prédio
							</Label>
							<Input type='text' id='company' name='company' value={company} setValue={setCompany} placeholder='Prédio Principal' isInvalid={form?.field === 'company'} invalidMessage={form?.message} />
						</div>
						<div>
							<Label htmlFor='location' isInvalid={form?.field === 'location'}>
								Localização
							</Label>
							<Select
								name='location'
								id='location'
								selected={location}
								onChange={(value) => setLocation(value)}
								options={[
									{ label: 'São José dos Campos - SP', value: 'sao-jose-dos-campos' },
									{ label: 'São Paulo - SP', value: 'sao-paulo' },
									{ label: 'Brasília - DF', value: 'brasilia' },
									{ label: 'Remoto', value: 'remote' },
								]}
								placeholder='Selecione sua localização'
								isInvalid={form?.field === 'location'}
								invalidMessage={form?.message}
							/>
						</div>
					</div>

					{/* Submit Button */}
					<div className='flex justify-end pt-4'>
						<Button type='submit' disabled={loadingProfile}>
							{loadingProfile ? (
								<>
									<span className='icon-[lucide--loader-circle] animate-spin size-4' />
									Salvando...
								</>
							) : (
								<>
									<span className='icon-[lucide--save] size-4' />
									Salvar Alterações
								</>
							)}
						</Button>
					</div>
				</fieldset>
			</form>
		</div>
	)

	const renderPreferencesContent = () => (
		<div className='space-y-6'>
			<div>
				<h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1'>Permissões Gerais</h2>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>Configure suas preferências de notificações e comunicações do sistema.</p>
			</div>

			<form onSubmit={handleUpdatePreferences} className='space-y-6'>
				<fieldset className='space-y-6' disabled={loadingPreferences}>
					<Switch id='show-welcome' name='showWelcome' checked={showWelcome} onChange={setShowWelcome} size='lg' title='Exibir página de boas-vindas' description='Mostrar a página de boas-vindas na próxima vez que você acessar o sistema.' />

					<Switch id='chat-enabled' name='chatEnabled' checked={chatEnabled} onChange={setChatEnabled} size='lg' title='Ativar sistema de chat' description='Permitir o uso do sistema de chat e notificações em tempo real. Desativar reduz o consumo de banco de dados.' />

					{/* Submit Button */}
					<div className='flex justify-end pt-4'>
						<Button type='submit' disabled={loadingPreferences}>
							{loadingPreferences ? (
								<>
									<span className='icon-[lucide--loader-circle] animate-spin size-4' />
									Salvando...
								</>
							) : (
								<>
									<span className='icon-[lucide--save] size-4' />
									Salvar Preferências
								</>
							)}
						</Button>
					</div>
				</fieldset>
			</form>
		</div>
	)

	const renderSecurityContent = () => (
		<div className='space-y-8'>
			{/* Change Email Section */}
			<div className='space-y-6'>
				<div>
					<h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1'>Alterar E-mail</h2>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>Altere seu e-mail de acesso ao sistema. Um código de confirmação será enviado para o novo e-mail.</p>
				</div>

				<form onSubmit={handleUpdateEmail} className='space-y-4'>
					<fieldset className='space-y-4' disabled={loadingEmail}>
						<div>
							<Label htmlFor='email' isInvalid={form?.field === 'email'} required>
								Novo e-mail
							</Label>
							<Input type='email' id='email' name='email' autoComplete='email' placeholder='seuemail@inpe.br' value={email} setValue={setEmail} minLength={8} maxLength={255} required isInvalid={form?.field === 'email'} invalidMessage={form?.message} />
						</div>

						<div className='flex justify-end'>
							<Button type='submit' disabled={loadingEmail} style='bordered'>
								{loadingEmail ? (
									<>
										<span className='icon-[lucide--loader-circle] animate-spin size-4' />
										Aguarde...
									</>
								) : (
									<>
										<span className='icon-[lucide--mail] size-4' />
										Alterar E-mail
									</>
								)}
							</Button>
						</div>
					</fieldset>
				</form>
			</div>

			{/* Divider */}
			<div className='border-t border-zinc-200 dark:border-zinc-700'></div>

			{/* Change Password Section */}
			<div className='space-y-6'>
				<div>
					<h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1'>Alterar Senha</h2>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>Defina uma nova senha forte para proteger sua conta.</p>
				</div>

				<form onSubmit={handleUpdatePassword} className='space-y-4'>
					<fieldset className='space-y-4' disabled={loadingPassword}>
						<div>
							<Label htmlFor='password' isInvalid={form?.field === 'password'} required>
								Nova senha
							</Label>
							<InputPasswordHints id='password' name='password' value={password} setValue={setPassword} autoComplete='new-password' placeholder='••••••••' minLength={8} maxLength={160} required isInvalid={form?.field === 'password'} invalidMessage={form?.message} />
						</div>

						<div className='flex justify-end'>
							<Button type='submit' disabled={loadingPassword} style='bordered'>
								{loadingPassword ? (
									<>
										<span className='icon-[lucide--loader-circle] animate-spin size-4' />
										Aguarde...
									</>
								) : (
									<>
										<span className='icon-[lucide--key] size-4' />
										Alterar Senha
									</>
								)}
							</Button>
						</div>
					</fieldset>
				</form>
			</div>

			{/* Security Info */}
			<div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
				<div className='flex items-start gap-3'>
					<span className='icon-[lucide--shield-check] size-5 text-blue-600 dark:text-blue-400 mt-0.5' />
					<div>
						<h3 className='font-medium text-blue-900 dark:text-blue-100 mb-1'>Informações de Segurança</h3>
						<ul className='text-sm text-blue-800 dark:text-blue-200 space-y-1'>
							<li>• Ao alterar seu e-mail, um código de confirmação será enviado</li>
							<li>• Use senhas fortes com pelo menos 8 caracteres</li>
							<li>• Inclua letras maiúsculas, minúsculas, números e símbolos</li>
							<li>• Evite usar informações pessoais na senha</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)

	const getActiveTabContent = () => {
		switch (activeTab) {
			case 'profile':
				return renderProfileContent()
			case 'preferences':
				return renderPreferencesContent()
			case 'security':
				return renderSecurityContent()
			default:
				return renderProfileContent()
		}
	}

	return (
		<div className='w-full'>
			{/* Header */}
			<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
				<h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Configurações</h1>
				<p className='text-zinc-600 dark:text-zinc-400 mt-1'>Gerencie suas informações pessoais, preferências e configurações de segurança</p>
			</div>

			{/* Content */}
			<div className='p-6'>
				<div className='max-w-7xl mx-auto'>
					{/* Mobile Navigation Dropdown */}
					<div className='lg:hidden mb-6'>
						<Select
							name='mobile-navigation'
							selected={activeTab}
							onChange={(value) => setActiveTab(value as TabType)}
							options={navigationItems.map((item) => ({
								value: item.id,
								label: item.name,
							}))}
							placeholder='Selecione uma seção'
						/>
					</div>

					{/* Desktop Layout */}
					<div className='grid lg:grid-cols-[280px_1fr] gap-6'>
						{/* Left Sidebar Navigation - Hidden on mobile */}
						<div className='hidden lg:block'>
							<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-2'>
								<nav className='space-y-1'>
									{navigationItems.map((item) => (
										<button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition-colors ${activeTab === item.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
											<span className={`${item.icon} size-5`} />
											<div className='flex-1 min-w-0'>
												<div className='font-medium'>{item.name}</div>
												<div className='text-xs text-zinc-500 dark:text-zinc-400 truncate'>{item.description}</div>
											</div>
										</button>
									))}
								</nav>
							</div>
						</div>

						{/* Right Content Area */}
						<div className='min-w-0 flex-1'>
							<div className='bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6'>{getActiveTabContent()}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
