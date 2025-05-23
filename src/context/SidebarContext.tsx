'use client'

import { createContext, useContext, useState } from 'react'

type SidebarContextType = {
	isOpenSidebar: boolean
	setIsOpenSidebar: (openSidebar: boolean) => void
	openSidebar: () => void
	closeSidebar: () => void
	toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export const useSidebar = () => {
	const context = useContext(SidebarContext)
	if (!context) throw new Error('useSidebar must be used within a SidebarProvider')
	return context
}

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
	const [isOpenSidebar, setIsOpenSidebar] = useState(false)

	const openSidebar = () => setIsOpenSidebar(true)
	const closeSidebar = () => setIsOpenSidebar(false)
	const toggleSidebar = () => setIsOpenSidebar((prev) => !prev)

	return <SidebarContext.Provider value={{ isOpenSidebar, setIsOpenSidebar, openSidebar, closeSidebar, toggleSidebar }}>{children}</SidebarContext.Provider>
}
