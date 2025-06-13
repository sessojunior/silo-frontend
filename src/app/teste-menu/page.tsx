'use client'

import { useState, useEffect } from 'react'
import MenuBuilder from '@/components/ui/MenuBuilder'

export default function TesteMenuPage() {
	const [isMounted, setIsMounted] = useState(false)
	const [menus, setMenus] = useState([
		{
			id: 'home',
			name: 'Início',
			href: '/',
			children: [],
		},
		{
			id: 'produtos',
			name: 'Produtos',
			href: '/produtos',
			children: [
				{
					id: 'roupas',
					name: 'Roupas',
					href: '/produtos/roupas',
					children: [
						{
							id: 'camisetas',
							name: 'Camisetas',
							href: '/produtos/roupas/camisetas',
							children: [
								{
									id: 'camisetas-masculinas',
									name: 'Masculinas',
									href: '/produtos/roupas/camisetas/masculinas',
									children: [],
								},
								{
									id: 'camisetas-femininas',
									name: 'Femininas',
									href: '/produtos/roupas/camisetas/femininas',
									children: [],
								},
							],
						},
						{
							id: 'calcas',
							name: 'Calças',
							href: '/produtos/roupas/calcas',
							children: [
								{
									id: 'jeans',
									name: 'Jeans',
									href: '/produtos/roupas/calcas/jeans',
									children: [],
								},
								{
									id: 'sociais',
									name: 'Sociais',
									href: '/produtos/roupas/calcas/sociais',
									children: [],
								},
							],
						},
					],
				},
				{
					id: 'calcados',
					name: 'Calçados',
					href: '/produtos/calcados',
					children: [
						{
							id: 'tenis',
							name: 'Tênis',
							href: '/produtos/calcados/tenis',
							children: [
								{
									id: 'corrida',
									name: 'Corrida',
									href: '/produtos/calcados/tenis/corrida',
									children: [],
								},
								{
									id: 'casual',
									name: 'Casual',
									href: '/produtos/calcados/tenis/casual',
									children: [],
								},
							],
						},
						{
							id: 'sapatos',
							name: 'Sapatos',
							href: '/produtos/calcados/sapatos',
							children: [],
						},
					],
				},
			],
		},
		{
			id: 'servicos',
			name: 'Serviços',
			href: '/servicos',
			children: [
				{
					id: 'consultoria',
					name: 'Consultoria',
					href: '/servicos/consultoria',
					children: [
						{
							id: 'consultoria-ti',
							name: 'Tecnologia da Informação',
							href: '/servicos/consultoria/ti',
							children: [
								{
									id: 'desenvolvimento',
									name: 'Desenvolvimento',
									href: '/servicos/consultoria/ti/desenvolvimento',
									children: [],
								},
								{
									id: 'infraestrutura',
									name: 'Infraestrutura',
									href: '/servicos/consultoria/ti/infraestrutura',
									children: [],
								},
							],
						},
						{
							id: 'consultoria-marketing',
							name: 'Marketing Digital',
							href: '/servicos/consultoria/marketing',
							children: [],
						},
					],
				},
				{
					id: 'suporte',
					name: 'Suporte Técnico',
					href: '/servicos/suporte',
					children: [
						{
							id: 'suporte-nivel1',
							name: 'Nível 1',
							href: '/servicos/suporte/nivel1',
							children: [],
						},
						{
							id: 'suporte-nivel2',
							name: 'Nível 2',
							href: '/servicos/suporte/nivel2',
							children: [],
						},
						{
							id: 'suporte-nivel3',
							name: 'Nível 3',
							href: '/servicos/suporte/nivel3',
							children: [],
						},
					],
				},
			],
		},
		{
			id: 'sobre',
			name: 'Sobre Nós',
			href: '/sobre',
			children: [
				{
					id: 'historia',
					name: 'Nossa História',
					href: '/sobre/historia',
					children: [],
				},
				{
					id: 'equipe',
					name: 'Equipe',
					href: '/sobre/equipe',
					children: [
						{
							id: 'diretoria',
							name: 'Diretoria',
							href: '/sobre/equipe/diretoria',
							children: [],
						},
						{
							id: 'desenvolvedores',
							name: 'Desenvolvedores',
							href: '/sobre/equipe/desenvolvedores',
							children: [],
						},
					],
				},
			],
		},
		{
			id: 'contato',
			name: 'Contato',
			href: '/contato',
			children: [],
		},
	])

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const handleSetMenus = (newMenus: any) => {
		setMenus(newMenus)
	}

	// Evita problemas de hidratação SSR
	if (!isMounted) {
		return (
			<div className='p-8 space-y-6 min-h-screen bg-gray-50'>
				<div className='text-center'>
					<h1 className='text-3xl font-bold'>Teste MenuBuilder - Drag & Drop</h1>
					<p className='text-gray-600 mt-2'>Carregando...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='p-8 space-y-6 min-h-screen bg-gray-50'>
			<div className='text-center'>
				<h1 className='text-3xl font-bold'>Teste MenuBuilder - Drag & Drop</h1>
				<p className='text-gray-600 mt-2'>Teste o drag & drop hierárquico com múltiplos níveis. Arraste itens para reordenar e criar hierarquias.</p>
			</div>

			<div className='max-w-4xl mx-auto bg-white border rounded-lg p-6 shadow'>
				<h3 className='text-lg font-semibold mb-4'>MenuBuilder Component ({menus.length} itens principais):</h3>
				<MenuBuilder items={menus} setItems={handleSetMenus} />
			</div>

			<div className='max-w-4xl mx-auto bg-white border rounded-lg p-6 shadow'>
				<h2 className='text-xl font-semibold mb-4'>Estado Atual (JSON):</h2>
				<pre className='bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96'>{JSON.stringify(menus, null, 2)}</pre>
			</div>
		</div>
	)
}
