import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/token'
import { uploadProfileImageFromInput, deleteUserProfileImage } from '@/lib/profileImage'
import { db } from '@/lib/db'
import { authUser } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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
		console.error('❌ [API_USER_PROFILE_IMAGE] Erro ao alterar a imagem de perfil do usuário:', { error })
		return NextResponse.json({ message: 'Erro inesperado. Tente novamente.' }, { status: 500 })
	}
}

// Apaga a imagem de perfil do usuário
export async function DELETE() {
	try {
		// Verifica se o usuário está logado e obtém os dados do usuário
		const user = await getAuthUser()
		if (!user) return NextResponse.json({ field: null, message: 'Usuário não logado.' }, { status: 400 })

		// Busca a imagem atual do usuário
		const currentUser = await db.select({ image: authUser.image }).from(authUser).where(eq(authUser.id, user.id)).limit(1)

		if (currentUser[0]?.image) {
			const imageUrl = currentUser[0].image

			// Verificar se é URL do servidor local
			const fileServerUrl = process.env.FILE_SERVER_URL || 'http://localhost:4000'
			if (imageUrl.startsWith(fileServerUrl)) {
				// Extrair filename da URL
				const filename = imageUrl.split('/').pop()
				if (filename) {
					try {
						const deleteResponse = await fetch(`${fileServerUrl}/files/avatars/${filename}`, {
							method: 'DELETE',
						})
						if (deleteResponse.ok) {
						} else {
							console.warn('⚠️ [API_USER_PROFILE_IMAGE] Erro ao deletar arquivo do servidor local')
						}
					} catch (error) {
						console.error('❌ [API_USER_PROFILE_IMAGE] Erro ao excluir imagem de perfil do servidor local:', { error })
						// Continua mesmo se falhar a exclusão do arquivo remoto
					}
				}
			} else {
				// Se é imagem local (antiga), usa método antigo
				const deleteImage = deleteUserProfileImage(user.id)
				if ('error' in deleteImage) {
					console.error('❌ [API_USER_PROFILE_IMAGE] Erro ao apagar a imagem de perfil local:', { error: deleteImage.error })
					return NextResponse.json({ message: deleteImage.error.message }, { status: 400 })
				}
			}
		}

		// Limpa a referência no banco
		await db.update(authUser).set({ image: null }).where(eq(authUser.id, user.id))

		// Retorna a resposta com sucesso
		return NextResponse.json({ message: 'Imagem apagada com sucesso!' })
	} catch (error) {
		console.error('❌ [API_USER_PROFILE_IMAGE] Erro ao apagar a imagem de perfil do usuário:', { error })
		return NextResponse.json({ message: 'Erro inesperado. Tente novamente.' }, { status: 500 })
	}
}
