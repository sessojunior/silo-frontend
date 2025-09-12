import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		// Obter dados do formulário
		const formData = await request.formData()

		// Enviar para o servidor de arquivos local
		const fileServerUrl = process.env.FILE_SERVER_URL || 'http://localhost:4000'
		const response = await fetch(`${fileServerUrl}/upload/contact`, {
			method: 'POST',
			body: formData,
		})

		if (!response.ok) {
			throw new Error(`Erro no servidor de arquivos: ${response.statusText}`)
		}

		const result = await response.json()
		return NextResponse.json(result)
	} catch (error) {
		console.error('❌ Erro no proxy de upload de contato:', error)
		return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
	}
}
