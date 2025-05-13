import type { Metadata } from 'next'

import AdminWrapper from './components/AdminWrapper'

export interface UserProps {
	id: string
	name: string
	email: string
	image: string | null
}

export interface SidebarMenuProps {
	id: string
	title: string
	icon?: string | null
	url?: string | null
	items: SidebarMenuProps[] | null
}

export interface SidebarBlockProps {
	id: string
	title: string
	description: string
}

export interface SidebarProps {
	menu: SidebarMenuProps[]
	blocks: SidebarBlockProps[]
}

export interface AccountLinkProps {
	id: string
	icon: string
	title: string
	url: string
}

export interface AccountProps {
	id: string
	name: string
	email: string
	image: string
	links: AccountLinkProps[]
}

export const metadata: Metadata = {
	title: 'Administração do Silo',
	description: 'Sistema de gerenciamento de produtos e tarefas.',
}

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	// Dados do usuário
	const user: UserProps = {
		id: '1',
		name: 'John Doe',
		email: 'T4Z8o@example.com',
		image: null,
	}

	// Dados para o menu lateral
	const sidebar: SidebarProps = {
		menu: [
			{
				id: '1',
				title: 'Menu principal',
				items: [
					{
						id: '1.1',
						title: 'Visão geral',
						icon: 'icon-[lucide--house]',
						url: '/admin/dashboard',
						items: null,
					},
					{
						id: '1.2',
						title: 'Produtos & tasks',
						icon: 'icon-[lucide--folder-git-2]',
						url: '#',
						items: [
							{
								id: '1.2.1',
								title: 'BAM',
								icon: null,
								url: null,
								items: [
									{
										id: '1.2.1.1',
										title: 'Link 1',
										icon: null,
										url: '/admin/products/bam/manual',
										items: null,
									},
									{
										id: '1.2.1.2',
										title: 'Link 2',
										icon: null,
										url: '#',
										items: null,
									},
									{
										id: '1.2.1.3',
										title: 'Link 3',
										icon: null,
										url: '#',
										items: null,
									},
								],
							},
							{
								id: '1.2.2',
								title: 'SMEC',
								icon: null,
								url: null,
								items: [
									{
										id: '1.2.2.1',
										title: 'Link 1',
										icon: null,
										url: '/admin/products/smec/manual',
										items: null,
									},
									{
										id: '1.2.2.2',
										title: 'Link 2',
										icon: null,
										url: '#',
										items: null,
									},
									{
										id: '1.2.2.3',
										title: 'Link 3',
										icon: null,
										url: '#',
										items: null,
									},
								],
							},
							{
								id: '1.2.3',
								title: 'BRAMS ams 15 km',
								icon: null,
								url: '/admin/products/brams-ams-15-km/manual',
								items: null,
							},
							{
								id: '1.2.4',
								title: 'WRF',
								icon: null,
								url: '/admin/products/wrf/manual',
								items: null,
							},
						],
					},
					{
						id: '1.3',
						title: 'Projetos',
						icon: 'icon-[lucide--square-chart-gantt]',
						url: '#',
						items: null,
					},
					{
						id: '1.4',
						title: 'Grupos',
						icon: 'icon-[lucide--users-round]',
						url: '#',
						items: null,
					},
				],
			},
			{
				id: '2',
				title: 'Outros',
				items: [
					{
						id: '2.1',
						title: 'Agenda',
						icon: 'icon-[lucide--calendar-clock]',
						url: '#',
						items: null,
					},
					{
						id: '2.2',
						title: 'Bate-papo',
						icon: 'icon-[lucide--messages-square]',
						url: '#',
						items: null,
					},
					{
						id: '2.3',
						title: 'Configurações',
						icon: 'icon-[lucide--settings-2]',
						url: '/admin/settings',
						items: [
							{
								id: '2.3.1',
								title: 'Config. gerais',
								icon: null,
								url: '/admin/settings/general',
								items: null,
							},
							{
								id: '2.3.2',
								title: 'Produtos & tasks',
								icon: null,
								url: '/admin/settings/products',
								items: null,
							},
							{
								id: '2.3.3',
								title: 'Projetos',
								icon: null,
								url: '/admin/settings/projects',
								items: null,
							},
							{
								id: '2.3.4',
								title: 'Grupos',
								icon: null,
								url: '/admin/settings/groups',
								items: null,
							},
						],
					},
					{
						id: '2.4',
						title: 'Ajuda',
						icon: 'icon-[lucide--life-buoy]',
						url: '#',
						items: null,
					},
				],
			},
		],
		blocks: [
			{
				id: '1',
				title: 'O que há de novo?',
				description: 'Você pode conferir todas as novidades dessa nova versão do dashboard no aplicativo Silo.',
			},
		],
	}

	// Dados da conta para o dropdown da barra do topo
	const account: AccountProps = {
		id: user.id,
		image: user.image ? `/uploads/avatar/${user.image}` : '/images/avatar.png',
		name: user.name,
		email: user.email,
		links: [
			{
				id: '1',
				icon: 'icon-[lucide--user-round-pen]',
				title: 'Alterar perfil',
				url: '/admin/profile',
			},
			{
				id: '2',
				icon: 'icon-[lucide--settings-2]',
				title: 'Preferências',
				url: '/admin/profile/preferences',
			},
			{
				id: '3',
				icon: 'icon-[lucide--shield-check]',
				title: 'Segurança',
				url: '/admin/profile/security',
			},
			{
				id: '4',
				icon: 'icon-[lucide--log-out]',
				title: 'Sair',
				url: '/logout',
			},
		],
	}

	return (
		<AdminWrapper sidebar={sidebar} user={user} account={account}>
			{children}
		</AdminWrapper>
	)
}
