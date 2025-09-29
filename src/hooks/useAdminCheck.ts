'use client'

import { useState, useEffect } from 'react'

interface AdminCheckResult {
	isAdmin: boolean
	loading: boolean
	error: string | null
}

/**
 * Hook para verificar se o usuário atual é administrador
 * @returns {AdminCheckResult} Estado da verificação de administrador
 */
export function useAdminCheck(): AdminCheckResult {
	const [isAdmin, setIsAdmin] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		checkAdminStatus()
	}, [])

	const checkAdminStatus = async () => {
		try {
			setLoading(true)
			setError(null)
			
			console.log('🔍 Verificando se usuário atual é administrador...')
			
			// Fazer uma chamada para uma API que verifica se o usuário é admin
			// Usamos a API de usuários com um filtro específico para verificar permissões
			const response = await fetch('/api/admin/users?search=&status=all&groupId=')
			
			if (response.status === 403) {
				// Se retornar 403, significa que não é administrador
				setIsAdmin(false)
				console.log('❌ Usuário não é administrador (403)')
			} else if (response.ok) {
				// Se conseguir acessar a API de usuários, é administrador
				setIsAdmin(true)
				console.log('✅ Usuário é administrador')
			} else {
				// Outros erros
				setIsAdmin(false)
				setError('Erro ao verificar permissões')
				console.log('⚠️ Erro ao verificar permissões:', response.status)
			}
		} catch (err) {
			console.error('❌ Erro ao verificar status de administrador:', err)
			setIsAdmin(false)
			setError('Erro ao verificar permissões')
		} finally {
			setLoading(false)
		}
	}

	return { isAdmin, loading, error }
}
