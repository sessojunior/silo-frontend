'use client'

import { useState, useEffect } from 'react'

import { useSidebar } from '@/context/SidebarContext'
import SidebarHeader from '@/components/admin/sidebar/SidebarHeader'
import SidebarFooter from '@/components/admin/sidebar/SidebarFooter'
import SidebarMenu from '@/components/admin/sidebar/SidebarMenu'
import SidebarBlocks from '@/components/admin/sidebar/SidebarBlocks'
import type { Product } from '@/lib/db/schema'
import type { Project } from '@/types/projects'

export type SidebarMenuProps = {
	id: string
	title: string
	icon?: string | null
	url?: string | null
	items: SidebarMenuProps[] | null
}

export type SidebarBlockProps = {
	id: string
	title: string
	description: string
}

export type SidebarProps = {
	menu: SidebarMenuProps[]
	blocks: SidebarBlockProps[]
}

export default function Sidebar() {
	const { isOpenSidebar, closeSidebar } = useSidebar()
	const [products, setProducts] = useState<Product[]>([])
	const [projects, setProjects] = useState<Project[]>([])

	// Obter dados dos produtos
	useEffect(() => {
		const fetchProducts = async () => {
			const response = await fetch('/api/admin/products')
			const data = await response.json()
			// Filtrar apenas produtos disponíveis
			const availableProducts = data.items.filter((product: Product) => product.available)
			setProducts(availableProducts)
		}

		fetchProducts()
	}, [])

	// Obter dados dos projetos reais da API
	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await fetch('/api/admin/projects')
				if (!response.ok) {
					console.error('❌ Erro ao buscar projetos para sidebar')
					return
				}
				const projectsData = await response.json()

				// Definir tipo para os dados do banco
				interface ProjectDB {
					id: string
					name: string
					shortDescription: string
					description: string
					startDate: string | null
					endDate: string | null
					priority: 'low' | 'medium' | 'high' | 'urgent'
					status: 'active' | 'completed' | 'paused' | 'cancelled'
					createdAt: Date
					updatedAt: Date
				}

				// Converter dados do banco para formato da interface e filtrar apenas projetos ativos e importantes
				const formattedProjects: Project[] = (projectsData as ProjectDB[])
					.filter((project) => project.status === 'active' && (project.priority === 'high' || project.priority === 'urgent'))
					.map((project) => ({
						id: project.id,
						name: project.name,
						shortDescription: project.shortDescription,
						description: project.description,
						status: project.status,
						priority: project.priority,
						startDate: project.startDate,
						endDate: project.endDate,
						// Campos padrão para compatibilidade
						icon: 'folder',
						color: '#3b82f6',
						progress: 0,
						members: [],
						activities: [],
						createdAt: new Date(project.createdAt).toISOString(),
						updatedAt: new Date(project.updatedAt).toISOString(),
					}))

				setProjects(formattedProjects)
			} catch (error) {
				console.error('❌ Erro ao carregar projetos para sidebar:', error)
				setProjects([])
			}
		}

		fetchProjects()
	}, [])

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
							...products
								.sort((a, b) => a.name.localeCompare(b.name))
								.map((product) => ({
									id: product.id,
									title: product.name,
									icon: null,
									url: `/admin/products/${product.slug}`,
									items: null,
								})),
						],
					},
					{
						id: '1.3',
						title: 'Projetos ativos',
						icon: 'icon-[lucide--square-chart-gantt]',
						url: '/admin/projects',
						items: [
							{
								id: 'all-projects',
								title: 'Todos os projetos',
								icon: null,
								url: '/admin/projects',
								items: null,
							},
							...projects
								.sort((a, b) => a.name.localeCompare(b.name))
								.map((project) => ({
									id: project.id,
									title: project.name,
									icon: null,
									url: `/admin/projects/${project.id}`,
									items: null,
								})),
						],
					},
					{
						id: '1.4',
						title: 'Grupos & usuários',
						icon: 'icon-[lucide--users-round]',
						url: '/admin/groups',
						items: null,
					},
					{
						id: '1.5',
						title: 'Contatos',
						icon: 'icon-[lucide--contact]',
						url: '/admin/contacts',
						items: null,
					},
				],
			},
			{
				id: '2',
				title: 'Outros',
				items: [
					{
						id: '2.2',
						title: 'Bate-papo',
						icon: 'icon-[lucide--messages-square]',
						url: '/admin/chat',
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
								url: '/admin/settings',
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
								url: '/admin/projects',
								items: null,
							},
						],
					},
					{
						id: '2.4',
						title: 'Ajuda',
						icon: 'icon-[lucide--life-buoy]',
						url: '/admin/help',
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

	return (
		<div
			className={`fixed inset-y-0 start-0 z-[60] h-full w-[260px] transform border-e border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-900 lg:block lg:translate-x-0 
					${isOpenSidebar ? 'translate-x-0' : '-translate-x-full'}
				`}
			role='dialog'
			aria-label='Barra lateral'
		>
			<div className='relative flex h-full max-h-full flex-col'>
				{/* Cabeçalho e logotipo */}
				<SidebarHeader onClose={closeSidebar} />

				{/* Conteúdo */}
				<div className='size-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-700'>
					{/* Container */}
					<div className='flex h-full w-full flex-col justify-between'>
						{/* Top */}
						<div className='flex w-full'>
							{/* Menu */}
							<SidebarMenu menu={sidebar.menu} />
						</div>
						{/* Bottom */}
						<div className='flex w-full flex-col'>
							{/* Blocos */}
							<SidebarBlocks blocks={sidebar.blocks} />
						</div>
					</div>
				</div>

				{/* Rodapé */}
				<SidebarFooter />
			</div>
		</div>
	)
}
