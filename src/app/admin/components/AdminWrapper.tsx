'use client'

import { useState, createContext, useContext } from 'react'
import Sidebar from './sidebar/Sidebar'
import Topbar from './topbar/Topbar'

import type { UserProps, SidebarProps, AccountProps } from '../layout'

// Contexto para compartilhar estado entre Topbar e Sidebar
const SidebarContext = createContext<{
	isOpen: boolean
	setIsOpen: (open: boolean) => void
}>({
	isOpen: false,
	setIsOpen: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

export default function AdminWrapper({ user, sidebar, account, children }: { user: UserProps; sidebar: SidebarProps; account: AccountProps; children: React.ReactNode }) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<SidebarContext.Provider value={{ isOpen, setIsOpen }}>
			{/* Barra lateral */}
			<Sidebar user={user} sidebar={sidebar} isOpen={isOpen} onClose={() => setIsOpen(false)} />

			{/* Barra do topo */}
			<Topbar title='Bem-vindo ao Silo' account={account} />

			{/* Conteúdo */}
			<div className='w-full transition-all duration-300 lg:pl-[260px]'>
				<div className='h-[calc(100svh-64px)] bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100'>
					{/* Contéudo da página */}
					{children}
				</div>
			</div>
		</SidebarContext.Provider>
	)
}
