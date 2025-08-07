import { createUploadthing, type FileRouter, UTFile, UTApi } from 'uploadthing/server'
import sharp from 'sharp'

// Instância da API (lê UPLOADTHING_TOKEN automaticamente)
export const utapi = new UTApi()

const f = createUploadthing()

// Função auxiliar para extrair a chave do arquivo da URL do UploadThing
export function getFileKeyFromUrl(url: string): string | null {
	// URLs do UploadThing são no formato: https://utfs.io/f/CHAVE_DO_ARQUIVO
	if (!url || !url.startsWith('https://utfs.io/f/')) return null
	return url.split('/').pop() || null
}

// Função auxiliar para criar versão 128x128 WebP a partir de URL
async function generateAvatarThumbnail(originalUrl: string, fileKey: string) {
	try {
		console.log('🔵 Gerando thumbnail para avatar:', fileKey)
		const res = await fetch(originalUrl)
		if (!res.ok) throw new Error(`Erro ao baixar imagem original: ${res.status}`)

		const buffer = Buffer.from(await res.arrayBuffer())
		const thumb = await sharp(buffer).resize(128, 128, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()

		// Cria um novo arquivo com o mesmo fileKey (sobrescreve o original)
		const utFile = new UTFile([thumb], fileKey)
		await utapi.uploadFiles(utFile) // sobrescreve o mesmo key mantendo URL
		console.log('✅ Thumbnail do avatar gerado com sucesso')
	} catch (err) {
		console.error('❌ Falha ao gerar thumbnail do avatar:', err)
	}
}

export const uploadRouter = {
	/* Avatar do usuário (1 imagem, máx 2 MB) */
	avatarUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
		.middleware(async () => {
			// Em breve: autenticação real – deixa metadata vazia por enquanto
			return { userId: null }
		})
		.onUploadComplete(async ({ file /*, metadata*/ }) => {
			// Gera miniatura 128×128 e sobrescreve
			await generateAvatarThumbnail(file.url, file.key)
		}),

	/* Imagens dos contatos */
	contactImageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } }).onUploadComplete(async () => {}),

	/* Imagens para problemas/soluções */
	problemImageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 3 } }).onUploadComplete(async () => {}),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
