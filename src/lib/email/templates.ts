// Templates de email modernos e clean para o sistema SILO

import { EmailTemplate, EmailTemplateData } from './types'

// Template base com layout CPTEC/INPE
const baseTemplate = (content: string, subject: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f8fafc;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background:#2563eb;color:white;padding:20px;text-align:center;">
      <h1 style="margin:0;font-size:24px;font-weight:600;">SILO</h1>
      <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">CPTEC/INPE</p>
    </div>
    
    <!-- Content -->
    <div style="padding:40px 30px;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#64748b;">CPTEC/INPE - Sistema SILO</p>
    </div>
  </div>
</body>
</html>
`

// Template para códigos OTP
const otpCodeTemplate = (data: EmailTemplateData['otpCode']): string => {
	const { code, type } = data
	
	const getTypeText = (type: string): string => {
		switch (type) {
			case 'sign-in': return 'para fazer login'
			case 'email-verification': return 'para verificar seu e-mail'
			case 'forget-password': return 'para recuperar sua senha'
			case 'email-change': return 'para alterar seu e-mail'
			default: return 'a seguir'
		}
	}
	
	return `
		<h2 style="color:#1e293b;margin:0 0 20px;font-size:20px;">Código de Verificação</h2>
		<p style="color:#64748b;margin:0 0 30px;line-height:1.6;">
			Utilize o seguinte código de verificação ${getTypeText(type)}:
		</p>
		<div style="background:#f1f5f9;border:2px solid #e2e8f0;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
			<span style="font-size:32px;font-weight:700;color:#2563eb;letter-spacing:4px;">${code}</span>
		</div>
		<p style="color:#64748b;margin:20px 0 0;font-size:14px;">
			Este código expira em 10 minutos.<br>
			Se você não solicitou isso, ignore este email.
		</p>
	`
}

// Template para confirmação de alteração de email
const emailChangedTemplate = (data: EmailTemplateData['emailChanged']): string => {
	const { oldEmail, newEmail } = data
	
	return `
		<h2 style="color:#1e293b;margin:0 0 20px;font-size:20px;">Email Alterado</h2>
		<p style="color:#64748b;margin:0 0 20px;line-height:1.6;">
			Seu email foi alterado com sucesso de <strong>${oldEmail}</strong> para <strong>${newEmail}</strong>.
		</p>
		<p style="color:#64748b;margin:0;font-size:14px;">
			Se você não fez esta alteração, entre em contato conosco imediatamente.
		</p>
	`
}

// Template para confirmação de alteração de senha
const passwordChangedTemplate = (data: EmailTemplateData['passwordChanged']): string => {
	const { email } = data
	
	return `
		<h2 style="color:#1e293b;margin:0 0 20px;font-size:20px;">Senha Alterada</h2>
		<p style="color:#64748b;margin:0 0 20px;line-height:1.6;">
			Sua senha foi alterada com sucesso para o email <strong>${email}</strong>.
		</p>
		<p style="color:#64748b;margin:0;font-size:14px;">
			Se você não fez esta alteração, entre em contato conosco imediatamente.
		</p>
	`
}

// Função principal para gerar templates
export function generateEmailTemplate<T extends EmailTemplate>(
	template: T,
	data: EmailTemplateData[T],
	subject: string
): string {
	let content: string
	
	switch (template) {
		case 'otpCode':
			content = otpCodeTemplate(data as EmailTemplateData['otpCode'])
			break
		case 'emailChanged':
			content = emailChangedTemplate(data as EmailTemplateData['emailChanged'])
			break
		case 'passwordChanged':
			content = passwordChangedTemplate(data as EmailTemplateData['passwordChanged'])
			break
		default:
			throw new Error(`Template não encontrado: ${template}`)
	}
	
	return baseTemplate(content, subject)
}

// Função para gerar fallback de texto simples
export function generateTextFallback<T extends EmailTemplate>(
	template: T,
	data: EmailTemplateData[T]
): string {
	switch (template) {
		case 'otpCode': {
			const { code, type } = data as EmailTemplateData['otpCode']
			const typeText = type === 'sign-in' ? 'para fazer login' : 
				type === 'email-verification' ? 'para verificar seu e-mail' :
				type === 'forget-password' ? 'para recuperar sua senha' :
				type === 'email-change' ? 'para alterar seu e-mail' : 'a seguir'
			return `Utilize o seguinte código de verificação ${typeText}: ${code}`
		}
		case 'emailChanged': {
			const { oldEmail, newEmail } = data as EmailTemplateData['emailChanged']
			return `Seu email foi alterado de ${oldEmail} para ${newEmail}. Se você não fez esta alteração, entre em contato conosco.`
		}
		case 'passwordChanged': {
			const { email } = data as EmailTemplateData['passwordChanged']
			return `Sua senha foi alterada para o email ${email}. Se você não fez esta alteração, entre em contato conosco.`
		}
		default:
			throw new Error(`Template não encontrado: ${template}`)
	}
}
