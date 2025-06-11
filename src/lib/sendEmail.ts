import nodemailer from 'nodemailer'

// Envia um e-mail

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }): Promise<{ success: boolean } | { error: { code: string; message: string } }> {
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
