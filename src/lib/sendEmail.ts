import nodemailer from 'nodemailer'
import { sendEmailTemplate } from './email/sendEmailTemplate'
import { EmailTemplate, EmailTemplateData } from './email/types'

// BACKUP DA FUNÇÃO ORIGINAL (para rollback seguro)
async function sendEmailOriginal({ to, subject, text }: { to: string; subject: string; text: string }): Promise<{ success: boolean } | { error: { code: string; message: string } }> {
	// Configuração do SMTP
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT || '587'),
		secure: process.env.SMTP_SECURE === 'true',
		auth: {
			user: process.env.SMTP_USERNAME,
			pass: process.env.SMTP_PASSWORD,
		},
	})

	// Verifica se a conexão com o SMTP está funcionando
	try {
		await transporter.verify()
		console.log('✅ Servidor SMTP pronto para enviar e-mails!')
	} catch (error) {
		console.error('❌ Erro de conexão SMTP:', error)
		return { error: { code: 'SEND_EMAIL_SMTP_ERROR', message: 'Erro de conexão SMTP' } }
	}

	// Configuração do e-mail
	const mailOptions = {
		from: process.env.SMTP_USERNAME,
		to,
		subject,
		text,
	}

	try {
		await transporter.sendMail(mailOptions)
		console.log(`✅ E-mail enviado com sucesso para: ${to}!`)
		return { success: true }
	} catch (err) {
		console.error(`❌ Erro ao enviar o e-mail para: ${to}!\n`, err)
		return { error: err instanceof Error ? { code: err.name, message: err.message } : { code: 'SEND_EMAIL_UNKNOWN_ERROR', message: 'Erro desconhecido' } }
	}
}

// FUNÇÃO HÍBRIDA COM SUPORTE A TEMPLATES E FALLBACK AUTOMÁTICO
export async function sendEmail(params: {
	to: string
	subject: string
	text?: string
	template?: EmailTemplate
	data?: EmailTemplateData[EmailTemplate]
}): Promise<{ success: boolean } | { error: { code: string; message: string } }> {
	const { to, subject, text, template, data } = params

	// Se template e data fornecidos, usar nova implementação com templates
	if (template && data) {
		try {
			console.log('🔵 Usando template de email:', { template, to })
			return await sendEmailTemplate({ to, subject, template, data })
		} catch (error) {
			console.warn('⚠️ Erro no template, usando fallback para texto simples:', error)
			// FALLBACK: Se template falhar, usar implementação original
			if (text) {
				return await sendEmailOriginal({ to, subject, text })
			} else {
				return { error: { code: 'TEMPLATE_FALLBACK_ERROR', message: 'Template falhou e não há texto de fallback' } }
			}
		}
	}

	// Se apenas texto fornecido, usar implementação original
	if (text) {
		console.log('🔵 Usando envio de email original (texto simples):', { to })
		return await sendEmailOriginal({ to, subject, text })
	}

	// Se nenhum parâmetro válido fornecido
	return { error: { code: 'INVALID_PARAMS', message: 'Forneça text ou template+data' } }
}
