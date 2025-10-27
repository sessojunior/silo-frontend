# 📧 Configuração SMTP

Documentação sobre configuração de servidor de email SMTP para envio de notificações.

---

## 📋 **ÍNDICE**

1. [Visão Geral](#-visão-geral)
2. [Configuração](#-configuração)
3. [Templates de Email](#-templates-de-email)
4. [Testando](#-testando)
5. [Provedores](#-provedores)
6. [Troubleshooting](#-troubleshooting)

---

## 🎯 **VISÃO GERAL**

O sistema usa **SMTP** para envio de emails institucionais:

- Códigos OTP para login e recuperação de senha
- Notificações de ativação de conta
- Alertas e avisos importantes

---

## ⚙️ **CONFIGURAÇÃO**

### **Variáveis de Ambiente**

```bash
# .env

SMTP_HOST='smtp.exemplo.com'
SMTP_PORT='587'
SMTP_SECURE='false'
SMTP_USERNAME='usuario@exemplo.com'
SMTP_PASSWORD='senha-do-email'
```

### **Tipos de Conexão**

#### **SMTP com TLS (Porta 587) - Recomendado**

```bash
SMTP_HOST='smtp.gmail.com'
SMTP_PORT='587'
SMTP_SECURE='false'
SMTP_USERNAME='seu-email@gmail.com'
SMTP_PASSWORD='senha-do-app'
```

#### **SMTP com SSL (Porta 465)**

```bash
SMTP_HOST='smtp.gmail.com'
SMTP_PORT='465'
SMTP_SECURE='true'
SMTP_USERNAME='seu-email@gmail.com'
SMTP_PASSWORD='senha-do-app'
```

### **Arquivo de Configuração**

Arquivo: `src/lib/config.ts`

```typescript
export const smtpConfig = {
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USERNAME!,
    pass: process.env.SMTP_PASSWORD!
  }
}
```

---

## 📧 **TEMPLATES DE EMAIL**

### **Código OTP**

Arquivo: `src/lib/email/otpEmail.ts`

```typescript
export function generateOTPEmail(code: string): string {
  return `
    <html>
      <body>
        <h1>Código de Acesso</h1>
        <p>Seu código de acesso é: <strong>${code}</strong></p>
        <p>Este código expira em 10 minutos.</p>
      </body>
    </html>
  `
}
```

### **Recuperação de Senha**

Arquivo: `src/lib/email/passwordResetEmail.ts`

```typescript
export function generatePasswordResetEmail(code: string): string {
  return `
    <html>
      <body>
        <h1>Recuperação de Senha</h1>
        <p>Seu código de recuperação é: <strong>${code}</strong></p>
        <p>Este código expira em 30 minutos.</p>
      </body>
    </html>
  `
}
```

### **Envio de Email**

Arquivo: `src/lib/sendEmail.ts`

```typescript
import nodemailer from 'nodemailer'
import { smtpConfig } from './config.js'

const transporter = nodemailer.createTransport(smtpConfig)

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({
    from: smtpConfig.auth.user,
    to,
    subject,
    html
  })
}
```

---

## 🧪 **TESTANDO**

### **Testar Conexão SMTP**

```bash
# Via código Node.js
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'seu-email@gmail.com',
    pass: 'senha-do-app'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro:', error);
  } else {
    console.log('✅ Servidor pronto para enviar emails');
  }
});
"
```

### **Enviar Email de Teste**

```typescript
import { sendEmail } from '@/lib/sendEmail'

await sendEmail(
  'destinatario@inpe.br',
  'Teste SMTP',
  '<h1>Teste de Email</h1><p>Este é um teste.</p>'
)
```

---

## 📦 **PROVEDORES**

### **Gmail**

```bash
# Usar senha de app (não a senha do email)
SMTP_HOST='smtp.gmail.com'
SMTP_PORT='587'
SMTP_SECURE='false'
SMTP_USERNAME='seu-email@gmail.com'
SMTP_PASSWORD='senha-do-app'  # Gerar em: https://myaccount.google.com/apppasswords
```

**Como gerar senha de app:**

1. Acesse: <https://myaccount.google.com/apppasswords>
2. Selecione "Email" e "Outro (Nome personalizado)"
3. Digite um nome (ex: "SILO")
4. Copie a senha gerada (16 caracteres)

### **SendGrid**

```bash
SMTP_HOST='smtp.sendgrid.net'
SMTP_PORT='587'
SMTP_SECURE='false'
SMTP_USERNAME='apikey'
SMTP_PASSWORD='SG.sua-api-key'
```

### **Mailgun**

```bash
SMTP_HOST='smtp.mailgun.org'
SMTP_PORT='587'
SMTP_SECURE='false'
SMTP_USERNAME='postmaster@sandbox.mailgun.org'
SMTP_PASSWORD='sua-senha'
```

---

## 🔧 **TROUBLESHOOTING**

### **Erro: "Authentication failed"**

```bash
# Verificar credenciais
# Gmail: Usar senha de app (não senha do email)
# Outlook: Verificar autenticação de dois fatores
```

### **Erro: "Connection timeout"**

```bash
# Verificar firewall
# Verificar se porta está bloqueada
# Testar com telnet:
telnet smtp.gmail.com 587
```

### **Email não chega**

```bash
# Verificar pasta de spam
# Verificar logs do servidor
# Testar com outro provedor
```

### **Rate Limiting**

```bash
# Gmail limita a 99 emails/dia para contas gratuitas
# Considerar usar provedor pago para produção
```

---

## 📊 **TEMPLATES PADRÃO**

### **Template Base HTML**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
    }
    .code {
      background: #007bff;
      color: white;
      padding: 10px 20px;
      font-size: 24px;
      border-radius: 4px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 Sistema SILO - CPTEC/INPE</h1>
    <p>Olá,</p>
    <p>Você solicitou um código de acesso para o Sistema SILO.</p>
    <div align="center">
      <div class="code">{{CODE}}</div>
    </div>
    <p>Este código expira em 10 minutos.</p>
    <p>Se você não solicitou este código, ignore este email.</p>
    <hr>
    <p style="color: #666; font-size: 12px;">
      CPTEC/INPE - Sistema de Gerenciamento de Produtos Meteorológicos
    </p>
  </div>
</body>
</html>
```

---

**🎯 Implementação em: `src/lib/sendEmail.ts` e `src/lib/email/`**
