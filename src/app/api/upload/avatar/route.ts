import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST(request: NextRequest) {
	try {
		// Obter dados do formulário
		const formData = await request.formData()

		// Enviar para o servidor de arquivos local
		const fileServerUrl = config.fileServerUrl
		const response = await fetch(`${fileServerUrl}/upload/avatar`, {
			method: 'POST',
			body: formData,
		})

		if (!response.ok) {
			throw new Error(`Erro no servidor de arquivos: ${response.statusText}`)
		}

		const result = await response.json()
		return NextResponse.json(result)
	} catch (error) {
		console.error('❌ [API_UPLOAD_AVATAR] Erro no proxy de upload de avatar:', { error })
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
