import { v4 as uuidv4 } from 'uuid'
import { randomBytes, createHash } from 'crypto'
import { argon2id, hash, verify } from 'argon2'

// Gera um hash seguro da senha
export async function generateHashPassword(password: string): Promise<string> {
	// Utiliza parâmetros padrão seguros do argon2id
	return await hash(password, {
		type: argon2id, // Algoritmo recomendado
		memoryCost: 2 ** 14, // 16 MB de memória (padrão)
		timeCost: 3, // Iterações
		parallelism: 1, // Threads
	})
}

// Verifica se a senha corresponde ao hash
export async function verifyPassword({ password, hashPassword }: { password: string; hashPassword: string }): Promise<boolean> {
	return await verify(hashPassword, password)
}

// Gera um ID baseado em UUID v4 (128 bits, padrão universal)
export function generateId(): string {
	return uuidv4()
}

// Gera um token aleatório de 30 bytes codificado em base64url
export function generateToken(): string {
	return randomBytes(30)
		.toString('base64') // codifica em base64 padrão
		.replace(/\+/g, '-') // substitui + por -
		.replace(/\//g, '_') // substitui / por _
		.replace(/=+$/, '') // remove padding
}

// Gera o hash SHA-256 de um token (output em hexadecimal minúsculo)
export function generateHashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex')
}

// Gera um código OTP com caracteres legíveis (ex: '347AEFHJKMNPRTWY')
// - allowedCharacters: Caracteres permitidos e legíveis em todas as tipografias, para evitar ambiguidades (exemplo: '347AEFHJKMNPRTWY')
// - numberCharacters: Número de caracteres que serão gerados (exemplo: 5)
export function generateOtp({ allowedCharacters, numberCharacters }: { allowedCharacters: string; numberCharacters: number }): string {
	const chars = allowedCharacters
	const charsLen = chars.length
	const random = randomBytes(numberCharacters)
	let code = ''

	for (let i = 0; i < numberCharacters; i++) {
		const index = random[i] % charsLen
		code += chars[index]
	}

	return code
}
