'use client'

import { useState, useEffect } from 'react'

interface CurrentUser {
	id: string
	name: string
	email: string
	isActive: boolean
	emailVerified: boolean
}

interface CurrentUserResult {
	currentUser: CurrentUser | null
	loading: boolean
	error: string | null
}

/**
 * Hook para obter informações do usuário atual
 * @returns {CurrentUserResult} Estado do usuário atual
 */
export function useCurrentUser(): CurrentUserResult {
	const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		fetchCurrentUser()
	}, [])

	const fetchCurrentUser = async () => {
		try {
			setLoading(true)
			setError(null)
			
			console.log('🔍 Buscando informações do usuário atual...')
			
			const response = await fetch('/api/user-profile')
			
			if (response.ok) {
				const data = await response.json()
				if (data.user) {
					setCurrentUser({
						id: data.user.id,
						name: data.user.name,
						email: data.user.email,
						isActive: data.user.isActive,
						emailVerified: data.user.emailVerified
					})
					console.log('✅ Usuário atual carregado:', data.user.email)
				} else {
					setError(data.message || 'Erro ao carregar usuário')
					console.log('❌ Erro na resposta da API:', data.message)
				}
			} else if (response.status === 401) {
				// Usuário não autenticado
				setCurrentUser(null)
				console.log('❌ Usuário não autenticado')
			} else {
				// Outros erros
				setError('Erro ao carregar usuário')
				console.log('⚠️ Erro ao carregar usuário:', response.status)
			}
		} catch (err) {
			console.error('❌ Erro ao buscar usuário atual:', err)
			setError('Erro ao carregar usuário')
		} finally {
			setLoading(false)
		}
	}

	return { currentUser, loading, error }
}
