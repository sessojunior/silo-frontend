import { v4 as uuidv4 } from 'uuid'
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

// Gera bytes aleatórios usando Web Crypto API
function getRandomBytes(size: number): Uint8Array {
	const array = new Uint8Array(size)
	crypto.getRandomValues(array)
	return array
}

// Gera token base64url de tamanho variável (padrão 30 bytes)
export function generateToken(size: number = 30): string {
	const bytes = getRandomBytes(size)
	let binary = ''
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	const base64 = btoa(binary)
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Gera o hash SHA-256 de um token com Web Crypto API
export async function generateHashToken(token: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(token)
	const hashBuffer = await crypto.subtle.digest('SHA-256', data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
	return hashHex
}

// Gera um código OTP com caracteres legíveis (ex: '347AEFHJKMNPRTWY')
// - allowedCharacters: Caracteres permitidos e legíveis em todas as tipografias, para evitar ambiguidades (exemplo: '347AEFHJKMNPRTWY')
// - numberCharacters: Número de caracteres que serão gerados (exemplo: 5)
export function generateOtp({ allowedCharacters, numberCharacters }: { allowedCharacters: string; numberCharacters: number }): string {
	const chars = allowedCharacters
	const charsLen = chars.length
	const random = getRandomBytes(numberCharacters)
	let code = ''

	for (let i = 0; i < numberCharacters; i++) {
		const index = random[i] % charsLen
		code += chars[index]
	}

	return code
}
