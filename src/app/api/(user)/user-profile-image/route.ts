import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { uploadProfileImageFromInput, deleteUserProfileImage } from '@/lib/profileImage'

// Faz o upload da imagem de perfil do usuário
export async function POST(req: NextRequest) {
	try {
		// Verifica se o usuário está logado e obtém os dados do usuário
		const user = await getAuthUser()
		if (!user) return NextResponse.json({ field: null, message: 'Usuário não logado.' }, { status: 400 })

		// Obtem a imagem de perfil do usuário
		const formData = await req.formData()
		const file = formData.get('fileToUpload') as File

		// Verifica se o arquivo de imagem foi enviado
		if (!file || !(file instanceof File)) {
			return NextResponse.json({ field: null, message: 'O arquivo da imagem não foi enviado.' }, { status: 400 })
		}

		// Faz o upload da imagem de perfil do usuário
		const uploadImage = await uploadProfileImageFromInput(file, user.id)
		if ('error' in uploadImage) {
			return NextResponse.json({ field: null, message: uploadImage.error.message ?? 'Ocorreu um erro ao fazer upload da imagem.' }, { status: 400 })
		}

		// Retorna a resposta com sucesso
		return NextResponse.json({ message: 'Imagem alterada com sucesso!' })
	} catch (error) {
		console.error('❌ Erro ao alterar a imagem de perfil do usuário:', error)
		return NextResponse.json({ message: 'Erro inesperado. Tente novamente.' }, { status: 500 })
	}
}

// Apaga a imagem de perfil do usuário
export async function DELETE() {
	try {
		// Verifica se o usuário está logado e obtém os dados do usuário
		const user = await getAuthUser()
		if (!user) return NextResponse.json({ field: null, message: 'Usuário não logado.' }, { status: 400 })

		// Apaga a imagem de perfil do usuário
		const deleteImage = deleteUserProfileImage(user.id)
		if ('error' in deleteImage) {
			console.error('❌ Erro ao apagar a imagem de perfil do usuário:', deleteImage.error)
			return NextResponse.json({ message: deleteImage.error.message }, { status: 400 })
		}

		// Retorna a resposta com sucesso
		return NextResponse.json({ message: 'Imagem apagada com sucesso!' })
	} catch (error) {
		console.error('❌ Erro ao apagar a imagem de perfil do usuário:', error)
		return NextResponse.json({ message: 'Erro inesperado. Tente novamente.' }, { status: 500 })
	}
}
