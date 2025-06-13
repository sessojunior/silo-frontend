'use client'

import { useState, useEffect } from 'react'
import MenuBuilder from '@/components/ui/MenuBuilder'

export default function HomePage() {
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
					children: [],
				},
			],
		},
	])

	useEffect(() => {
		console.log('🔵 Página teste carregada')
		console.log('🔵 Menus iniciais:', menus)
	}, [])

	const handleSetMenus = (newMenus: any) => {
		console.log('🔵 Atualizando menus:', newMenus)
		setMenus(newMenus)
	}

	return (
		<div className='p-8 space-y-6'>
			<h1 className='text-2xl font-bold'>Teste MenuBuilder</h1>

			<div className='border rounded p-4'>
				<h3 className='mb-4'>MenuBuilder Component:</h3>
				<MenuBuilder items={menus} setItems={handleSetMenus} />
			</div>

			<div>
				<h2 className='text-xl font-semibold'>Estado Atual:</h2>
				<pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>{JSON.stringify(menus, null, 2)}</pre>
			</div>
		</div>
	)
}
