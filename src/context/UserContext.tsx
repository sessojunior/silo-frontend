'use client'

import { createContext, useContext } from 'react'
import type { UserProps } from '@/app/admin/layout'

const UserContext = createContext<{
	user: UserProps
} | null>(null)

export const useUser = () => {
	const context = useContext(UserContext)
	if (!context) throw new Error('O useUser precisa ser usado dentro de UserProvider.')
	return context.user
}

export const UserProvider = ({ user, children }: { user: UserProps; children: React.ReactNode }) => {
	return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
}
