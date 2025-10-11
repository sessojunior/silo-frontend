// Função independente para envio de emails com templates

import nodemailer from 'nodemailer'
import { EmailTemplate, SendEmailTemplateParams } from './types'
import { generateEmailTemplate, generateTextFallback } from './templates'

// Função independente para envio de emails com templates
export async function sendEmailTemplate<T extends EmailTemplate>(
	params: SendEmailTemplateParams<T>
): Promise<{ success: boolean } | { error: { code: string; message: string } }> {
	const { to, subject, template, data } = params
	
	// Configuração do SMTP (mesma da função original)
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
	} catch (error) {
		console.error('❌ [LIB_SEND_EMAIL_TEMPLATE] Erro de conexão SMTP:', { error })
		return { error: { code: 'SEND_EMAIL_SMTP_ERROR', message: 'Erro de conexão SMTP' } }
	}

	// Gera HTML do template
	let html: string
	let textFallback: string
	
	try {
		html = generateEmailTemplate(template, data, subject)
		textFallback = generateTextFallback(template, data)
	} catch (error) {
		console.error('❌ [LIB_SEND_EMAIL_TEMPLATE] Erro ao gerar template:', { error })
		return { error: { code: 'TEMPLATE_ERROR', message: 'Erro ao gerar template de email' } }
	}

	// Configuração do e-mail com HTML e fallback de texto
	const mailOptions = {
		from: process.env.SMTP_USERNAME,
		to,
		subject,
		html,
		text: textFallback, // Fallback para clientes que não suportam HTML
	}

	try {
		await transporter.sendMail(mailOptions)
		return { success: true }
	} catch (err) {
		console.error('❌ [LIB_SEND_EMAIL_TEMPLATE] Erro ao enviar o e-mail com template:', { to, error: err })
		return { error: err instanceof Error ? { code: err.name, message: err.message } : { code: 'SEND_EMAIL_UNKNOWN_ERROR', message: 'Erro desconhecido' } }
	}
}

