import { NextResponse } from 'next/server'
import { eq, and, lt, ne } from 'drizzle-orm'
import { db, dbProduction, schema, schemaProduction } from '@/app/lib/db'
import { AuthSession } from '@/app/lib/db/schema.postgres'
import { generateId, generateHashToken, generateToken, generateOtp, generateHashPassword, verifyPassword } from '@/app/lib/utils'
import { validateEmail, validatePassword, validateUserName } from '@/app/lib/validate'
import { sendEmail } from './sendEmail'

// Sessões
// Os usuários usarão um token de sessão vinculado a uma sessão em vez do ID diretamente.
// O ID da sessão será o hash SHA-256 do token.
// O SHA-256 é uma função de hash unidirecional.
// Isso garante que, mesmo que o conteúdo do banco de dados tenha vazado,
// o invasor não conseguirá recuperar tokens válidos.

// Cria uma sessão para o usuário
// O token da sessão será um hash SHA-256 do token
// A sessão expira em 30 dias
export async function createSessionToken(userId: string): Promise<{ session: { token: string; userId: string; expiresAt: Date }; token: string } | { error: { code: string; message: string } }> {
	// Gera um token aleatório
	const token = generateToken()

	// Gera o hash do token
	const hashToken = generateHashToken(token)

	// Um dia em milissegundos
	const DAY_IN_MS = 24 * 60 * 60 * 1000 // 86400000 ms (1 dia)

	// Sessão expira em 30 dias
	const expiresAt = new Date(Date.now() + DAY_IN_MS * 30)

	// ID da sessão
	const sessionId = generateId()

	// Dados da sessão
	const session: AuthSession = { id: sessionId, token: hashToken, userId, expiresAt }

	// Insere a sessão no banco de dados
	const [insertSession] = await (db as typeof dbProduction)
		.insert((schema as typeof schemaProduction).authSession)
		.values(session)
		.returning()
	if (!insertSession) return { error: { code: 'INSERT_SESSION_ERROR', message: 'Erro ao salvar a sessão.' } }

	// Retorna a sessão
	return { session, token }
}

// Valida um token de sessão
// 1. Verifica se a sessão existe no banco de dados
// 2. Verifica se a sessão expirou
// 3. Se a sessão não expirou, verifica se ela precisa ser estendida
// 4. Apaga do banco de dados todos os tokens expirados
export async function validateSessionToken(token: string): Promise<{ session: { id: string; token: string; userId: string; expiresAt: Date }; user: { id: string; name: string; email: string } } | { error: { code: string; message: string } }> {
	// Gera o hash do token
	const hashToken = generateHashToken(token)

	// 1. Verifica se a sessão existe no banco de dados
	const [selectSession] = await (db as typeof dbProduction)
		.select({
			user: { id: schemaProduction.authUser.id, name: schemaProduction.authUser.name, email: schemaProduction.authUser.email },
			session: { id: schemaProduction.authSession.id, token: schemaProduction.authSession.token, userId: schemaProduction.authSession.userId, expiresAt: schemaProduction.authSession.expiresAt },
		})
		.from(schemaProduction.authSession)
		.innerJoin(schemaProduction.authUser, eq(schemaProduction.authSession.userId, schemaProduction.authUser.id))
		.where(eq(schemaProduction.authSession.token, hashToken))

	// Se a sessão não existe
	if (!selectSession) return { error: { code: 'SESSION_NOT_EXISTS', message: 'A sessão não existe.' } }

	// Obtém a sessão e o usuário
	const { session, user } = selectSession

	// 2. Verifica se a sessão expirou
	const sessionExpired = Date.now() >= session.expiresAt.getTime()

	// Se a sessão expirou
	if (sessionExpired) {
		// Exclui a sessão do banco de dados
		await (db as typeof dbProduction).delete(schemaProduction.authSession).where(eq(schemaProduction.authSession.id, session.id))
		return { error: { code: 'SESSION_EXPIRED', message: 'A sessão expirou.' } }
	}

	// Um dia em milissegundos
	const DAY_IN_MS = 24 * 60 * 60 * 1000 // 86400000 ms (1 dia)

	// 3. Se a sessão não expirou, verifica se ela precisa ser estendida
	// Isso garante que as sessões ativas sejam persistidas, enquanto as inativas eventualmente expirarão.
	// Verifica se há menos de 15 dias (metade da expiração de 30 dias) antes da expiração.
	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15

	// Se a sessão precisa ser estendida, atualiza a data de expiração
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30)
		await (db as typeof dbProduction).update(schemaProduction.authSession).set({ expiresAt: session.expiresAt }).where(eq(schemaProduction.authSession.id, session.id))
	}

	// 4. Apaga do banco de dados todos os tokens expirados
	await (db as typeof dbProduction).delete(schemaProduction.authSession).where(lt(schemaProduction.authSession.expiresAt, new Date()))

	// Retorna a sessão e o usuário
	return { session, user }
}
export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>

// Invalida uma sessão pelo token excluindo-a do banco de dados
export async function invalidateSessionToken(sessionToken: string): Promise<void> {
	await (db as typeof dbProduction).delete(schemaProduction.authSession).where(eq(schemaProduction.authSession.token, sessionToken))
}

// Invalida todas as sessões de um usuário excluindo-as do banco de dados
export async function invalidateAllUserSessionTokens(userId: string): Promise<void> {
	await (db as typeof dbProduction).delete(schemaProduction.authSession).where(eq(schemaProduction.authSession.userId, userId))
}

// Gera o código de verificação OTP para enviá-lo por e-mail e salva-o no banco de dados
export async function generateCode(email: string): Promise<{ success: boolean; code: string } | { error: { code: string; message: string } }> {
	// Formata os dados recebidos
	const formatEmail = email.trim().toLowerCase()

	// Se o e-mail for inválido retorna null
	if (!validateEmail(formatEmail)) return { error: { code: 'INVALID_EMAIL', message: 'E-mail inválido.' } }

	// Verifica se o usuário existe no banco de dados pelo e-mail
	const selectUser = await (db as typeof dbProduction)
		.select()
		.from(schemaProduction.authUser)
		.where(eq(schemaProduction.authUser.email, formatEmail))
		.limit(1)
		.then((results) => results.at(0))

	// Se o usuário não for encontrado
	if (!selectUser?.id) return { error: { code: 'NO_EMAIL_FOUND', message: 'Não existe um usuário com este e-mail.' } }

	// ID do código
	const codeId = generateId()

	// Gera um código aleatório utilizando caracteres legíveis em todas as tipografias, para evitar ambiguidades e número de caracteres que serão gerados
	// A probabilidade de acertar aleatoriamente este código é de 1 em 1.048.576 (cerca de 1 em 1 milhão)
	const code = generateOtp({ allowedCharacters: '347AEFHJKMNPRTWY', numberCharacters: 5 })

	// Remove códigos anteriores do mesmo usuário
	await (db as typeof dbProduction).delete(schemaProduction.authCode).where(eq(schemaProduction.authCode.userId, selectUser.id))

	// Um minuto em milissegundos
	const MINUTE_IN_MS = 60 * 1000 // 60000 ms (1 minuto)

	// Tempo de expiração do código, expira em 10 minutos
	const expiresAt = new Date(Date.now() + MINUTE_IN_MS * 10)

	// Insere o novo código no banco de dados
	const [insertCode] = await (db as typeof dbProduction)
		.insert(schemaProduction.authCode)
		.values({
			id: codeId,
			code,
			email,
			userId: selectUser.id,
			expiresAt,
		})
		.returning()
	if (!insertCode) return { error: { code: 'INSERT_CODE_ERROR', message: 'Erro ao salvar a código no banco de dados.' } }

	// Retorna o código OTP
	return { success: true, code }
}

// Envia o código de verificação OTP para o e-mail do usuário
export async function sendEmailCode({ email, type, code }: { email: string; type: string; code: string }): Promise<{ success: boolean } | { error: { code: string; message: string } }> {
	// Formata os dados recebidos
	const formatEmail = email.trim().toLowerCase()

	// Se o e-mail for inválido retorna null
	if (!validateEmail(formatEmail)) return { error: { code: 'INVALID_EMAIL', message: 'E-mail inválido.' } }

	// Envia o e-mail com o código OTP
	// Retorna um objeto: { success: boolean, error?: { code, message } }
	return await sendEmail({
		to: email,
		subject: 'Código de verificação',
		text: `Utilize o seguinte código de verificação ${type === 'sign-in' ? 'para fazer login' : type === 'email-verification' ? 'para verificar seu e-mail' : type === 'forget-password' ? 'para recuperar sua senha' : 'a seguir'}: ${code}`,
	})
}

// Verifica se o código de verificação OTP enviado para o usuário é válido e se não expirou
// 1. Se o código for válido, define o e-mail do usuário como verificado (1) na tabela 'user' do banco de dados
// 2. Apaga do banco de dados todos os códigos expirados
export async function validateCode({ email, code }: { email: string; code: string }): Promise<{ success: boolean } | { error: { code: string; message: string } }> {
	// Formata os dados recebidos
	const formatEmail = email.trim().toLowerCase()

	// Verifica se o e-mail é válido
	if (!validateEmail(formatEmail)) return { error: { code: 'INVALID_EMAIL', message: 'O e-mail é inválido.' } }

	// Apaga do banco de dados todos os códigos expirados
	await (db as typeof dbProduction).delete(schemaProduction.authCode).where(lt(schemaProduction.authCode.expiresAt, new Date()))

	// Busca o código informado, que ainda esteja ativo, para o e-mail fornecido
	const selectCode = await (db as typeof dbProduction)
		.select({
			code: schemaProduction.authCode.code,
			userId: schemaProduction.authCode.userId,
			expiresAt: schemaProduction.authCode.expiresAt,
		})
		.from(schemaProduction.authCode)
		.where(and(eq(schemaProduction.authCode.email, formatEmail), eq(schemaProduction.authCode.code, code)))
		.limit(1)
		.then((res) => res[0])

	// Se não encontrou o código (porque não existe ou expirou e foi deletado)
	if (!selectCode) return { error: { code: 'WRONG_OR_EXPIRED_CODE', message: 'O código é inválido ou expirou.' } }

	// Se encontrou o código, e ele não está expirado, apaga ele para evitar que ele seja utilizado novamente
	await (db as typeof dbProduction).delete(schemaProduction.authCode).where(eq(schemaProduction.authCode.code, code))

	// Define o e-mail do usuário como verificado (1) na tabela 'user' do banco de dados
	await (db as typeof dbProduction).update(schemaProduction.authUser).set({ emailVerified: 1 }).where(eq(schemaProduction.authUser.email, formatEmail))

	// Por seguranca, todas as sessões devem ser invalidadas após o e-mail ser verificado
	// Será criado depois uma nova sessão para o usuário
	await invalidateAllUserSessionTokens(selectCode.userId)

	// Código válido
	return { success: true }
}

// Verifica se o e-mail do usuário é válido e existe e obtém os dados do usuário
export async function validateUserEmail(email: string): Promise<{ success: boolean; user: { id: string; name: string; email: string } } | { error: { code: string; message: string } }> {
	// Formata os dados recebidos
	const formatEmail = email.trim().toLowerCase()

	// Verifica se o e-mail é válido
	if (!validateEmail(formatEmail)) return { error: { code: 'INVALID_EMAIL', message: 'O e-mail é inválido.' } }

	// Verifica se o usuário existe no banco de dados pelo e-mail
	const selectUser = await (db as typeof dbProduction)
		.select()
		.from(schemaProduction.authUser)
		.where(eq(schemaProduction.authUser.email, formatEmail))
		.limit(1)
		.then((results) => results.at(0))

	// Se usuário não for encontrado
	if (!selectUser?.id) return { error: { code: 'NO_EMAIL_FOUND', message: 'Não existe um usuário com este e-mail.' } }

	// Retorna os dados do usuário
	return { success: true, user: { id: selectUser.id, name: selectUser.name, email: selectUser.email } }
}

// Cria um usuário
export async function signUp(name: string, email: string, password: string): Promise<{ success: boolean; user: { id: string; name: string; email: string; emailVerified: number } } | { error: { field: string | null; code: string; message: string } }> {
	// Formata os dados recebidos
	const formatName = name.trim()
	const formatEmail = email.trim().toLowerCase()

	// Verifica se o nome é válido
	if (!validateUserName(formatName)) return { error: { field: 'name', code: 'INVALID_NAME', message: 'O nome é inválido.' } }

	// Verifica se o e-mail é válido
	if (!validateEmail(formatEmail)) return { error: { field: 'email', code: 'INVALID_EMAIL', message: 'O e-mail é inválido.' } }

	// Verifica se a senha é válida
	if (!validatePassword(password)) return { error: { field: 'password', code: 'INVALID_PASSWORD', message: 'A senha é inválida.' } }

	// Verifica se o usuário já existe no banco de dados pelo e-mail
	const selectUser = await (db as typeof dbProduction)
		.select()
		.from(schemaProduction.authUser)
		.where(eq(schemaProduction.authUser.email, formatEmail))
		.limit(1)
		.then((results) => results.at(0))

	// Se usuário for encontrado
	if (selectUser?.id) return { error: { field: 'email', code: 'USER_ALREADY_EXISTS', message: 'Já existe um usuário com este e-mail.' } }

	// ID do usuário
	const userId = generateId()

	// E-mail não está verificado ainda
	const emailVerified = 0 // Deixar como o (não verificado). 0 é false (não verificado) e 1 é true (verificado)

	// Cria o hash da senha
	const passwordHash = await generateHashPassword(password)

	// Insere o usuário no banco de dados
	const [insertUser] = await (db as typeof dbProduction)
		.insert(schemaProduction.authUser)
		.values({
			id: userId,
			name: formatName,
			email: formatEmail,
			emailVerified,
			password: passwordHash,
			createdAt: new Date(),
		})
		.returning()
	if (!insertUser) return { error: { field: null, code: 'INSERT_USER_ERROR', message: 'Erro ao salvar o usuário no banco de dados.' } }

	// Retorna os dados do usuário criado
	return { success: true, user: { id: insertUser.id, name: insertUser.name, email: insertUser.email, emailVerified: insertUser.emailVerified } }
}

// Login do usuário
export async function signIn(email: string, password: string): Promise<{ success: boolean; user: { id: string; name: string; email: string; emailVerified: number } } | { error: { field: string | null; code: string; message: string } }> {
	// Formata os dados recebidos
	const formatEmail = email.trim().toLowerCase()

	// Verifica se o e-mail é válido
	if (!validateEmail(formatEmail)) return { error: { field: 'email', code: 'INVALID_EMAIL', message: 'O e-mail é inválido.' } }

	// Verifica se o usuário não existe no banco de dados pelo e-mail
	const selectUser = await (db as typeof dbProduction)
		.select()
		.from(schemaProduction.authUser)
		.where(eq(schemaProduction.authUser.email, formatEmail))
		.limit(1)
		.then((results) => results.at(0))

	// Se usuário não for encontrado
	if (!selectUser?.id) return { error: { field: 'email', code: 'USER_NOT_FOUND', message: 'Não existe um usuário com este e-mail.' } }

	// Verifica se o usuário foi criado com login social (sem senha definida)
	// Se não foi definido senha, significa que o usuário foi criado com login social
	if (!selectUser.password?.trim()) {
		return { error: { field: null, code: 'SOCIAL_ACCOUNT', message: 'Conta criada com login social, redefina a senha.' } }
	}

	// Verifica se a senha é válida
	if (!validatePassword(password)) return { error: { field: 'password', code: 'INVALID_PASSWORD', message: 'A senha é inválida.' } }

	// Verifica se a senha corresponde ao hash armazenado no banco de dados
	const validPassword = verifyPassword({ hashPassword: selectUser.password, password })
	if (!validPassword) return { error: { field: 'password', code: 'INCORRECT_PASSWORD', message: 'A senha está incorreta.' } }

	// Retorna os dados do usuário
	return { success: true, user: { id: selectUser.id, name: selectUser.name, email: selectUser.email, emailVerified: selectUser.emailVerified } }
}

// Altera a senha do usuário
export async function changeUserPassword({ userId, password }: { userId: string; password: string }): Promise<{ success: boolean; user: { id: string; name: string; email: string } } | { error: { code: string; message: string } }> {
	// Verifica se o usuário existe no banco de dados pelo ID do usuário (userId)
	const selectUser = await (db as typeof dbProduction)
		.select()
		.from(schemaProduction.authUser)
		.where(eq(schemaProduction.authUser.id, userId))
		.limit(1)
		.then((results) => results.at(0))

	// Se usuário não for encontrado
	if (!selectUser?.id) return { error: { code: 'NO_USER_FOUND', message: 'O usuário não existe.' } }

	// Verifica se a senha é válida
	if (!validatePassword(password)) return { error: { code: 'INVALID_PASSWORD', message: 'A senha é inválida.' } }

	// Cria o hash da senha
	const passwordHash = await generateHashPassword(password)

	// Altera a senha do usuário
	const updateUser = await (db as typeof dbProduction).update(schemaProduction.authUser).set({ password: passwordHash }).where(eq(schemaProduction.authUser.id, selectUser.id)).returning({ id: schemaProduction.authUser.id })
	if (!updateUser) return { error: { code: 'UPDATE_PASSWORD_ERROR', message: 'Ocorreu um erro ao alterar a senha.' } }

	// Envia o e-mail informando da alteração da senha
	// Retorna um objeto: { success: boolean, error?: { code, message } }
	await sendEmail({
		to: selectUser.email,
		subject: 'Senha alterada',
		text: `Sua senha foi alterada no sistema.`,
	})

	// Retorna os dados do usuário
	return { success: true, user: { id: selectUser.id, name: selectUser.name, email: selectUser.email } }
}

// Altera o e-mail do usuário
export async function changeUserEmail({ userId, email }: { userId: string; email: string }): Promise<{ success: boolean; user: { id: string; name: string; email: string } } | { error: { code: string; message: string } }> {
	// Formata os dados recebidos
	const formatEmail = email.trim().toLowerCase()

	// Verifica se o e-mail é válido
	if (!validateEmail(formatEmail)) return { error: { code: 'INVALID_EMAIL', message: 'O e-mail é inválido.' } }

	// Verifica se o usuário existe no banco de dados pelo ID do usuário (userId)
	const selectUser = await (db as typeof dbProduction)
		.select()
		.from(schemaProduction.authUser)
		.where(eq(schemaProduction.authUser.id, userId))
		.limit(1)
		.then((results) => results.at(0))

	// Se usuário não for encontrado
	if (!selectUser?.id) return { error: { code: 'NO_USER_FOUND', message: 'O usuário não existe.' } }

	// Verifica se o e-mail informado é o mesmo do usuário
	if (selectUser.email.toLowerCase() === formatEmail) {
		return { error: { code: 'SAME_EMAIL', message: 'O e-mail informado é o mesmo que o atual.' } }
	}

	// Verifica se o e-mail já está em uso por outro usuário (que não seja o próprio)
	const selectEmail = await (db as typeof dbProduction)
		.select()
		.from(schemaProduction.authUser)
		.where(and(eq(schemaProduction.authUser.email, formatEmail), ne(schemaProduction.authUser.id, selectUser.id)))
		.limit(1)
		.then((results) => results.at(0))

	// Se o e-mail já está em uso por outro usuário, que não seja o próprio usuário, retorna um erro
	if (selectEmail?.id) return { error: { code: 'EMAIL_ALREADY_EXISTS', message: 'O e-mail já está em uso por outro usuário.' } }

	// Altera o e-mail do usuário
	const updateUser = await (db as typeof dbProduction).update(schemaProduction.authUser).set({ email: formatEmail, emailVerified: 0 }).where(eq(schemaProduction.authUser.id, selectUser.id)).returning({ id: schemaProduction.authUser.id })
	if (!updateUser) return { error: { code: 'UPDATE_EMAIL_ERROR', message: 'Ocorreu um erro ao alterar o e-mail.' } }

	// Envia o e-mail informando da alteração do e-mail
	// Retorna um objeto: { success: boolean, error?: { code, message } }
	await sendEmail({
		to: selectUser.email,
		subject: 'E-mail alterado',
		text: `Seu e-mail foi alterado com sucesso, mas é necessário confirmar o e-mail no próximo login, informando o código de verificação que será enviado para este e-mail quando fizer login novamente.`,
	})

	// Retorna os dados do usuário
	return { success: true, user: { id: selectUser.id, name: selectUser.name, email: selectUser.email } }
}

// Cookies
// A proteção CSRF é essencial ao usar cookies.
// Os cookies de sessão devem ter os seguintes atributos:
// - HttpOnly: Os cookies são acessíveis apenas no lado do servidor
// - SameSite=Lax: Use Strict para sites críticos
// - Secure: Os cookies só podem ser enviados por HTTPS (deve ser omitido ao testar no localhost)
// - Max-Age ou Expires: Deve ser definido para persistir cookies
// - Path=/: Os cookies podem ser acessados de todas as rotas

// Nome do cookie de sessão
export const sessionCookieName = 'auth-session'

// Cria o cookie de sessão com o token e a data de expiração
export function setCookieSessionToken(response: NextResponse, token: string, expiresAt: Date): void {
	response.cookies.set({
		name: sessionCookieName,
		value: token,
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.ENVIRONMENT === 'production',
		expires: expiresAt,
		path: '/',
	})
}

// Exclui o cookie de sessão
export function deleteCookieSessionToken(response: NextResponse): void {
	response.cookies.set({
		name: sessionCookieName,
		value: '',
		maxAge: 0,
		path: '/',
	})
}
