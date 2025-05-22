import Image from 'next/image'

import Tree, { type TreeItemProps } from '@/app/components/Tree'
import Accordion, { type Section } from '@/app/components/Accordion'
import Button from '@/app/components/Button'

// Dados de documentos
const docs: TreeItemProps[] = [
	{
		icon: undefined,
		label: 'Equipamentos',
		url: undefined,
		children: [
			{
				icon: undefined,
				label: 'Máquinas',
				url: undefined,
				children: [
					{
						icon: 'icon-[lucide--computer]',
						label: 'Máquina 1',
						url: '#',
						children: undefined,
					},
					{
						icon: 'icon-[lucide--computer]',
						label: 'Máquina 2',
						url: '#',
						children: undefined,
					},
					{
						icon: 'icon-[lucide--computer]',
						label: 'Máquina 3',
						url: '#',
						children: undefined,
					},
				],
			},
			{
				icon: undefined,
				label: 'Redes internas',
				url: '#',
				children: [
					{
						icon: 'icon-[lucide--network]',
						label: 'Rede interna 1',
						url: '#',
						children: undefined,
					},
					{
						icon: 'icon-[lucide--network]',
						label: 'Rede interna 2',
						url: '#',
						children: undefined,
					},
				],
			},
			{
				icon: undefined,
				label: 'Redes externas',
				url: '#',
				children: [
					{
						icon: 'icon-[lucide--network]',
						label: 'Rede externa 1',
						url: '#',
						children: undefined,
					},
					{
						icon: 'icon-[lucide--network]',
						label: 'Rede externa 2',
						url: '#',
						children: undefined,
					},
				],
			},
		],
	},
	{
		icon: undefined,
		label: 'Dependências',
		url: undefined,
		children: [
			{
				icon: undefined,
				label: 'Sistema',
				url: undefined,
				children: [
					{
						icon: undefined,
						label: 'Hosts',
						url: '#',
						children: [
							{
								icon: 'icon-[lucide--computer]',
								label: 'Host 1',
								url: '#',
								children: undefined,
							},
							{
								icon: 'icon-[lucide--computer]',
								label: 'Host 2',
								url: '#',
								children: undefined,
							},
						],
					},
					{
						icon: undefined,
						label: 'Softwares',
						url: '#',
						children: [
							{
								icon: 'icon-[lucide--app-window]',
								label: 'Software 1',
								url: '#',
								children: undefined,
							},
							{
								icon: 'icon-[lucide--app-window]',
								label: 'Software 2',
								url: '#',
								children: undefined,
							},
						],
					},
				],
			},
			{
				icon: undefined,
				label: 'Recursos humanos',
				url: undefined,
				children: [
					{
						icon: undefined,
						label: 'Responsáveis técnicos do INPE',
						url: '#',
						children: [
							{
								icon: 'icon-[lucide--user-round]',
								label: 'Pesquisador 1',
								url: '#',
								children: undefined,
							},
							{
								icon: 'icon-[lucide--user-round]',
								label: 'Pesquisador 2',
								url: '#',
								children: undefined,
							},
						],
					},
					{
						icon: undefined,
						label: 'Suporte',
						url: '#',
						children: [
							{
								icon: 'icon-[lucide--user-round]',
								label: 'Técnico 1',
								url: '#',
								children: undefined,
							},
							{
								icon: 'icon-[lucide--user-round]',
								label: 'Técnico 2',
								url: '#',
								children: undefined,
							},
						],
					},
				],
			},
		],
	},
	{
		icon: undefined,
		label: 'Elementos afetados',
		url: undefined,
		children: [
			{
				icon: undefined,
				label: 'Recursos',
				url: undefined,
				children: [
					{
						icon: undefined,
						label: 'Hosts',
						url: '#',
						children: [
							{
								icon: 'icon-[lucide--computer]',
								label: 'Host 1',
								url: '#',
								children: undefined,
							},
							{
								icon: 'icon-[lucide--computer]',
								label: 'Host 2',
								url: '#',
								children: undefined,
							},
						],
					},
					{
						icon: undefined,
						label: 'Softwares',
						url: '#',
						children: [
							{
								icon: 'icon-[lucide--app-window]',
								label: 'Software 1',
								url: '#',
								children: undefined,
							},
							{
								icon: 'icon-[lucide--app-window]',
								label: 'Software 2',
								url: '#',
								children: undefined,
							},
						],
					},
				],
			},
			{
				icon: undefined,
				label: 'Grupos',
				url: undefined,
				children: [
					{
						icon: 'icon-[lucide--users-round]',
						label: 'Grupo 1',
						url: '#',
						children: undefined,
					},
					{
						icon: 'icon-[lucide--users-round]',
						label: 'Grupo 2',
						url: '#',
						children: undefined,
					},
					{
						icon: 'icon-[lucide--users-round]',
						label: 'Grupo 3',
						url: '#',
						children: undefined,
					},
					{
						icon: 'icon-[lucide--users-round]',
						label: 'Grupo 4',
						url: '#',
						children: undefined,
					},
				],
			},
			{
				icon: undefined,
				label: 'Clientes externos',
				url: undefined,
				children: [
					{
						icon: undefined,
						label: 'INPE',
						url: '#',
						children: [
							{
								icon: 'icon-[lucide--user-round]',
								label: 'Cliente 1',
								url: '#',
								children: undefined,
							},
							{
								icon: 'icon-[lucide--user-round]',
								label: 'Cliente 2',
								url: '#',
								children: undefined,
							},
						],
					},
					{
						icon: undefined,
						label: 'Outros',
						url: '#',
						children: [
							{
								icon: 'icon-[lucide--user-round]',
								label: 'Cliente 3',
								url: '#',
								children: undefined,
							},
							{
								icon: 'icon-[lucide--user-round]',
								label: 'Cliente 4',
								url: '#',
								children: undefined,
							},
							{
								icon: 'icon-[lucide--user-round]',
								label: 'Cliente 5',
								url: '#',
								children: undefined,
							},
						],
					},
				],
			},
		],
	},
]

// Dados de contatos
const contacts = [
	{
		image: '/uploads/profile/10.jpg',
		name: 'Marcelo Silvano',
		role: 'Analista técnico',
		team: 'CGCT',
		email: 'marcelo.silvano@inpe.br',
	},
	{
		image: '/uploads/profile/20.jpg',
		name: 'José Santana',
		role: 'Metereologista',
		team: 'DIPTC',
		email: 'jose.santana@inpe.br',
	},
	{
		image: '/uploads/profile/30.jpg',
		name: 'Aline Mendez',
		role: 'Pesquisador',
		team: 'DIPTC',
		email: 'aline.mendez@inpe.br',
	},
]

// Dados de manual
const sections: Section[] = [
	{
		id: '1',
		title: '1. Introdução',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
		chapters: [
			{
				id: '1.1',
				title: '1.1. Como funciona o modelo',
				description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			},
			{
				id: '1.2',
				title: '1.2. Descrição do funcionamento interno',
				description: 'Nam turpis ligula, vestibulum id risus vitae, posuere scelerisque massa. Proin odio risus, pulvinar ac elementum sit amet, dignissim vel lacus. Maecenas efficitur velit eget tellus maximus iaculis.',
			},
		],
	},
	{
		id: '2',
		title: '2. Funcionamento',
		description: undefined,
		chapters: [
			{
				id: '2.1',
				title: '2.1. Pré-processamento',
				description: 'Donec quis feugiat metus, at cursus erat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Cras varius nisi sit amet ante auctor lacinia. Nulla in rutrum nulla, et auctor nulla.',
			},
			{
				id: '2.2',
				title: '2.2. Operações realizadas',
				description: 'Vestibulum id magna ullamcorper dolor rutrum tincidunt. Maecenas egestas lorem mi, nec elementum libero feugiat quis. Vivamus erat lacus, commodo eget vehicula at, blandit eget velit..',
			},
			{
				id: '2.3',
				title: '2.3. Pós-processamento',
				description: 'Suspendisse iaculis porttitor mollis. Pellentesque quis augue nisi. Aenean maximus ex congue arcu euismod gravida. Nam nec neque nisl.',
			},
		],
	},
	{
		id: '3',
		title: '3. Resolução de conflitos',
		description: 'Pellentesque condimentum imperdiet sapien, vel vestibulum ante maximus ultricies. Sed scelerisque maximus enim. Vivamus sed ornare sem.',
		chapters: [],
	},
]

export default function ProductsPage() {
	return (
		<div className='flex w-full'>
			{/* Side left */}
			<div className='flex w-[320px] flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-700'>
				<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
					{/* Tree */}
					<div className='px-8 pt-8' role='tree' aria-orientation='vertical'>
						{docs.map((category, index) => (
							<div key={index} className='pb-8'>
								<h3 className='pb-4 text-xl font-medium'>{category.label}</h3>
								{category.children?.map((child, childIndex) => (
									<Tree
										key={childIndex}
										item={child as TreeItemProps} // Assegura que estamos passando um tipo válido
										defaultOpen={false}
										activeUrl='/admin/products/' // Aqui você pode ajustar conforme a URL ativa
									/>
								))}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Side right */}
			<div className='flex w-full flex-grow flex-col'>
				<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
					{/* Cabeçalho */}
					<div className='flex flex-col gap-2 border-b border-zinc-200 p-8 md:grid md:grid-cols-2'>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--book-text] size-4'></span>
							</div>
							<div className='flex'>
								<span>3 seções & 9 capítulos</span>
							</div>
						</div>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--users-round] size-4'></span>
							</div>
							<div className='flex'>
								<span>Técnicos responsáveis: 3</span>
							</div>
						</div>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--triangle-alert] size-4'></span>
							</div>
							<div className='flex'>
								<span>Problemas reportados: 5</span>
							</div>
						</div>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--book-check] size-4'></span>
							</div>
							<div className='flex'>
								<span>Soluções encontradas: 4</span>
							</div>
						</div>
						<div className='flex'>
							<div className='flex w-8 items-center justify-center'>
								<span className='icon-[lucide--clock-4] size-4'></span>
							</div>
							<div className='flex'>
								<span>Atualizado há 69 dias</span>
							</div>
						</div>
					</div>

					{/* Responsáveis técnicos */}
					<div className='border-b border-zinc-200 p-8'>
						<div className='flex w-full items-center justify-between pb-6'>
							<div>
								<h3 className='text-xl font-medium'>Contatos em caso de problemas</h3>
								<div>
									<span className='text-sm font-medium'>3 responsáveis técnicos</span>
								</div>
							</div>
							<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2'>
								Adicionar contato
							</Button>
						</div>
						<div className='flex flex-col gap-4 md:grid md:grid-cols-2'>
							{/* Contatos */}
							{contacts.map(({ image, name, role, team, email }, index) => (
								<div key={email || index} className='flex gap-x-2'>
									<div className='size-12 shrink-0'>
										<Image src={image} alt={name} width={40} height={40} className='size-full rounded-full' />
									</div>
									<div className='flex flex-col'>
										<div className='text-base font-bold'>{name}</div>
										<div className='text-sm font-medium'>
											{role} <span className='text-zinc-300'>•</span> {team}
										</div>
										<div className='text-sm font-medium'>
											<a href={`mailto:${email}`} className='text-zinc-400 hover:text-zinc-500'>
												{email}
											</a>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Manual do produto */}
					<div className='p-8'>
						<div className='flex w-full items-center justify-between pb-6'>
							<div>
								<h3 className='text-xl font-medium'>Manual do produto</h3>
								<div>
									<span className='text-sm font-medium'>
										3 seções <span className='text-zinc-300'>•</span> 9 capítulos
									</span>
								</div>
							</div>
							<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2'>
								Adicionar seção
							</Button>
						</div>
						<div className='flex flex-col'>
							{/* Manual */}
							<Accordion sections={sections} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
