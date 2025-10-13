# 🗂️ Servidor de Arquivos Local SILO

**Servidor de arquivos independente** desenvolvido para substituir serviços externos e atender requisitos de segurança institucional do **CPTEC/INPE**.

---

## 📋 VISÃO GERAL

Este servidor Node.js oferece **controle total** sobre uploads e armazenamento de arquivos, com otimização automática de imagens e geração de thumbnails. Desenvolvido especificamente para o sistema SILO, garante conformidade com políticas de segurança institucional.

### 🎯 **CARACTERÍSTICAS PRINCIPAIS**

- ✅ **Servidor Independente**: Executa separadamente do frontend Next.js
- ✅ **TypeScript**: Desenvolvido em TypeScript com tipagem completa
- ✅ **Configuração Centralizada**: Todas as configurações em `src/config.ts`
- ✅ **Otimização Automática**: Conversão para WebP, redimensionamento, rotação EXIF
- ✅ **Thumbnails Automáticos**: Geração de miniaturas 128x128 para avatars
- ✅ **Estrutura Organizada**: Diretórios separados por tipo de arquivo
- ✅ **Segurança Robusta**: Validação de tipos, limites de tamanho, CORS configurado
- ✅ **Limpeza Automática**: Remoção de arquivos temporários
- ✅ **Proxy Transparente**: Integração via Next.js sem mudanças nos componentes

---

## ⚡ INÍCIO RÁPIDO

### 🚀 **Executar em 3 Passos**

```bash
# 1. Instalar dependências
cd fileserver
npm install

# 2. Executar servidor
npm run dev

# 3. Em outro terminal, executar frontend
cd ..
npm run dev
```

**✅ Pronto!** O servidor estará rodando em `http://localhost:4000` e o frontend em `http://localhost:3000`.

---

## 🚀 INSTALAÇÃO E CONFIGURAÇÃO

### 📦 **Instalação das Dependências**

```bash
# Navegar para o diretório do servidor
cd fileserver

# Instalar dependências
npm install
```

### ⚙️ **Configuração**

**Todas as configurações estão centralizadas em `src/config.ts`** - não é necessário arquivo `.env`:

```typescript
// src/config.ts - Configuração centralizada
export const config = {
  port: 4000,
  fileServerUrl: 'http://localhost:4000',
  nextPublicAppUrl: 'http://localhost:3000',
  upload: {
    maxFileSize: 4194304, // 4MB
    maxFilesCount: 3,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  optimization: {
    avatar: { thumbnailSize: 128, thumbnailQuality: 85 },
    profile: { size: 80, quality: 85 },
    general: { maxWidth: 1920, maxHeight: 1080, quality: 90 }
  }
}
```

**📝 Para alterar configurações**: Edite diretamente o arquivo `src/config.ts` e reinicie o servidor.

### 📁 **Estrutura de Diretórios**

O servidor criará automaticamente a seguinte estrutura:

```
fileserver/
├── src/
│   ├── server.ts              # Servidor principal (TypeScript)
│   ├── config.ts              # Configurações centralizadas
│   ├── types.ts               # Tipos e interfaces
│   ├── utils.ts               # Funções auxiliares (validação, otimização)
│   ├── handlers.ts            # Handlers de upload (avatar, contato, etc.)
│   ├── fileHandlers.ts        # Handlers de arquivos (serve, delete, health)
│   └── multerConfig.ts        # Configuração do Multer
├── uploads/                    # Arquivos organizados por tipo
│   ├── avatars/               # Avatars com thumbnails automáticos
│   │   ├── thumb-*.webp      # Thumbnails 128x128
│   │   └── *.webp            # Imagens otimizadas
│   ├── contacts/              # Fotos de contatos
│   │   └── *.webp            # Imagens otimizadas
│   ├── problems/              # Imagens de problemas
│   │   └── *.webp            # Imagens otimizadas
│   ├── solutions/             # Imagens de soluções
│   │   └── *.webp            # Imagens otimizadas
│   ├── general/               # Uploads genéricos
│   │   └── *.webp            # Imagens otimizadas
│   └── temp/                  # Arquivos temporários
│       └── *.tmp             # Limpeza automática
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
└── README.md                  # Esta documentação
```

---

## 🔧 EXECUÇÃO

### 🛠️ **Desenvolvimento**

```bash
# 1. Instalar dependências (primeira vez)
cd fileserver
npm install

# 2. Executar em modo desenvolvimento (com auto-reload)
npm run dev

# 3. Em outro terminal, executar o frontend SILO
cd ..
npm run dev
```

**Scripts Disponíveis:**

- `npm run dev` - Modo desenvolvimento com auto-reload (tsx watch)
- `npm start` - Execução direta (tsx)
- `npm run build` - Compilar TypeScript para JavaScript
- `npm run pm2` - Executar com PM2 (produção)

### 🚀 **Produção**

```bash
# Instalar PM2 globalmente (primeira vez)
npm install -g pm2

# Executar servidor com PM2
cd fileserver
npm run pm2

# Comandos de gerenciamento PM2
pm2 status silo-fileserver          # Ver status
pm2 logs silo-fileserver            # Ver logs
pm2 restart silo-fileserver         # Reiniciar
pm2 stop silo-fileserver            # Parar
pm2 delete silo-fileserver          # Remover do PM2

# Configurar PM2 para iniciar com sistema
pm2 startup
pm2 save
```

### 🧪 **Teste de Funcionamento**

```bash
# Health check
curl http://localhost:4000/health

# Resposta esperada:
# {
#   "success": true,
#   "message": "Servidor de arquivos funcionando",
#   "timestamp": "2024-01-15T10:30:00.000Z",
#   "port": 4000
# }
```

---

## 🌐 ENDPOINTS DISPONÍVEIS

### 📤 **Endpoints de Upload**

#### **1. Upload Genérico**

```bash
POST /api/upload
Content-Type: multipart/form-data

# Exemplo com curl
curl -X POST -F "file=@imagem.jpg" http://localhost:4000/api/upload

# Resposta
{
  "key": "1734567890-abc12345.webp",
  "name": "imagem.jpg",
  "size": 2048576,
  "url": "http://localhost:4000/files/general/1734567890-abc12345.webp",
  "id": "1734567890-abc12345.webp",
  "status": "uploaded",
  "optimized": true
}
```

#### **2. Upload de Avatar**

```bash
POST /upload/avatar
Content-Type: multipart/form-data

# Exemplo com curl
curl -X POST -F "file=@avatar.jpg" http://localhost:4000/upload/avatar

# Resposta
{
  "success": true,
  "message": "Upload de avatar concluído com sucesso!",
  "data": {
    "key": "1734567890-abc12345.webp",
    "name": "avatar.jpg",
    "size": 1024768,
    "url": "http://localhost:4000/files/avatars/1734567890-abc12345.webp",
    "thumbnailUrl": "http://localhost:4000/files/avatars/thumb-1734567890-abc12345.webp",
    "optimized": true
  }
}
```

#### **3. Upload de Contato**

```bash
POST /upload/contact
Content-Type: multipart/form-data

# Exemplo com curl
curl -X POST -F "file=@contato.jpg" http://localhost:4000/upload/contact
```

#### **4. Upload Múltiplo de Problemas**

```bash
POST /upload/problem
Content-Type: multipart/form-data

# Exemplo com curl
curl -X POST \
  -F "files=@problema1.jpg" \
  -F "files=@problema2.jpg" \
  -F "files=@problema3.jpg" \
  http://localhost:4000/upload/problem

# Resposta
{
  "success": true,
  "message": "3 arquivo(s) de problema enviado(s) com sucesso!",
  "data": [
    {
      "key": "1734567890-abc12345.webp",
      "name": "problema1.jpg",
      "size": 1024768,
      "url": "http://localhost:4000/files/problems/1734567890-abc12345.webp",
      "optimized": true
    },
    // ... outros arquivos
  ]
}
```

#### **5. Upload Múltiplo de Soluções**

```bash
POST /upload/solution
Content-Type: multipart/form-data

# Exemplo com curl
curl -X POST \
  -F "files=@solucao1.jpg" \
  -F "files=@solucao2.jpg" \
  http://localhost:4000/upload/solution
```

### 📁 **Endpoints de Gerenciamento**

#### **6. Acessar Arquivo**

```bash
GET /files/:type/:filename

# Exemplo
curl http://localhost:4000/files/avatars/1734567890-abc12345.webp
```

#### **7. Deletar Arquivo**

```bash
DELETE /files/:type/:filename

# Exemplo
curl -X DELETE http://localhost:4000/files/avatars/1734567890-abc12345.webp

# Resposta
{
  "success": true,
  "message": "Arquivo deletado com sucesso"
}
```

#### **8. Health Check**

```bash
GET /health

# Exemplo
curl http://localhost:4000/health
```

---

## 🖼️ OTIMIZAÇÃO AUTOMÁTICA

### 🔄 **Processo de Otimização**

1. **Validação**: Verificação de tipo de arquivo com magic numbers
2. **Conversão WebP**: Todas as imagens são convertidas para WebP
3. **Redimensionamento**: Imagens redimensionadas automaticamente
4. **Rotação EXIF**: Rotação automática baseada em metadados EXIF
5. **Thumbnails**: Geração automática para avatars (128x128)
6. **Substituição**: Imagens otimizadas substituem originais

### 📊 **Configurações de Otimização**

| Tipo          | Dimensões     | Qualidade | Formato | Observações         |
| ------------- | ------------- | --------- | ------- | ------------------- |
| **Avatar**    | 64x64         | 85%       | WebP    | Imagem de perfil    |
| **Thumbnail** | 128x128       | 85%       | WebP    | Miniatura de avatar |
| **Geral**     | Máx 1920x1080 | 90%       | WebP    | Outros tipos        |

### 💾 **Economia de Espaço**

- **WebP**: Redução de ~30-50% no tamanho
- **Redimensionamento**: Otimização para uso web
- **Sem Duplicação**: Originais substituídos por versões otimizadas

---

## 🔒 SEGURANÇA E VALIDAÇÃO

### 🛡️ **Validações Implementadas**

- **File Type Validation**: Verificação robusta com magic numbers + MIME types
- **File Size Limits**: Máximo 4MB por arquivo
- **File Count Limits**: Máximo 3 arquivos por upload
- **Extension Validation**: Verificação de extensões permitidas
- **Filename Sanitization**: Sanitização de nomes de arquivo
- **CORS Configuration**: Configurado para domínio específico
- **Unique Filenames**: Prevenção de conflitos com timestamps + UUID

### 🔐 **Tipos de Arquivo Permitidos**

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)
- **GIF** (.gif)

### ⚠️ **Limites de Segurança**

- **Tamanho Máximo**: 4MB por arquivo
- **Quantidade Máxima**: 3 arquivos por upload
- **Tipos Permitidos**: Apenas imagens
- **CORS**: Apenas domínio configurado

---

## 📊 MONITORAMENTO E MANUTENÇÃO

### 🔍 **Comandos de Monitoramento**

```bash
# Verificar status do servidor
curl http://localhost:4000/health

# Verificar arquivos salvos
ls -la fileserver/uploads/avatars/
ls -la fileserver/uploads/contacts/
ls -la fileserver/uploads/problems/
ls -la fileserver/uploads/solutions/
ls -la fileserver/uploads/general/

# Verificar imagens otimizadas
find fileserver/uploads/ -name "*.webp" -type f
find fileserver/uploads/avatars/ -name "thumb-*.webp" -type f

# Verificar tamanho dos diretórios
du -sh fileserver/uploads/*
```

### 🧹 **Limpeza Automática**

- **Arquivos Temporários**: Removidos automaticamente a cada hora
- **Idade Máxima**: 24 horas para arquivos temporários
- **Logs**: Registro de arquivos removidos

### 📈 **Logs do Servidor**

```bash
# Ver logs em tempo real (PM2)
pm2 logs silo-fileserver

# Ver logs do desenvolvimento
# Os logs aparecem no console onde o servidor está rodando
```

---

## 🚨 TROUBLESHOOTING

### ❌ **Problemas Comuns**

#### **1. Servidor não inicia (Porta 4000 ocupada)**

```bash
# Verificar processo na porta 4000
netstat -ano | findstr :4000

# Matar processo (Windows)
taskkill /PID <PID> /F

# Ou usar porta diferente
# Editar src/config.ts: port: 4001
```

#### **2. Erro de CORS**

```bash
# Verificar se nextPublicAppUrl está correto em src/config.ts
# Deve ter:
nextPublicAppUrl: 'http://localhost:3000'
```

#### **3. Upload falha (Arquivo muito grande)**

```bash
# Verificar limites em src/config.ts
upload: {
  maxFileSize: 4194304, // 4MB
  maxFilesCount: 3
}
```

#### **4. Thumbnail não é gerado**

```bash
# Verificar se Sharp está instalado
cd fileserver
npm install sharp

# Verificar permissões de escrita
# Windows: Executar como administrador
# Linux: chmod 755 uploads/
```

#### **5. Proxy não funciona**

```bash
# Verificar se arquivo existe
ls src/app/api/upload/route.ts

# Verificar configuração em src/config.ts
fileServerUrl: 'http://localhost:4000'
```

### 🧪 **Testes de Validação**

```bash
# 1. Testar servidor isoladamente
curl http://localhost:4000/health

# 2. Testar upload direto
curl -X POST -F "file=@test.jpg" http://localhost:4000/api/upload

# 3. Testar via proxy (Next.js)
curl -X POST -F "file=@test.jpg" http://localhost:3000/api/upload

# 4. Verificar arquivos salvos
ls fileserver/uploads/
ls fileserver/uploads/avatars/
ls fileserver/uploads/contacts/
ls fileserver/uploads/problems/
ls fileserver/uploads/solutions/
ls fileserver/uploads/general/

# 5. Verificar imagens otimizadas
ls fileserver/uploads/*/*.webp
ls fileserver/uploads/avatars/thumb-*.webp

# 6. Testar upload de avatar (com thumbnail)
curl -X POST -F "file=@avatar.jpg" http://localhost:4000/upload/avatar

# 7. Testar upload múltiplo de problemas
curl -X POST \
  -F "files=@problema1.jpg" \
  -F "files=@problema2.jpg" \
  http://localhost:4000/upload/problem
```

---

## 🎯 INTEGRAÇÃO COM SILO

### 🔌 **Proxy Next.js**

O servidor integra-se com o frontend SILO através de um proxy transparente:

```typescript
// src/app/api/upload/route.ts
export async function POST(request: NextRequest) {
	const formData = await request.formData()
	const fileServerUrl = process.env.FILE_SERVER_URL || 'http://localhost:4000'
	const response = await fetch(`${fileServerUrl}/api/upload`, {
		method: 'POST',
		body: formData,
	})
	return NextResponse.json(await response.json())
}
```

### 🧩 **Componentes Atualizados**

- **PhotoUploadLocal.tsx**: Usa `UploadButtonLocal`
- **ContactFormOffcanvas.tsx**: Upload de fotos de contatos
- **ProblemFormOffcanvas.tsx**: Upload de imagens de problemas
- **SolutionFormModal.tsx**: Upload de imagens de soluções

### 📡 **APIs Compatíveis**

Todas as APIs do SILO foram atualizadas para aceitar URLs do servidor local:

- `/api/admin/contacts`
- `/api/admin/products/images`
- `/api/admin/products/solutions`
- `/api/(user)/user-profile-image`

---

## 🏗️ ARQUITETURA TÉCNICA

### 📦 **Dependências Principais**

```json
{
	"express": "^4.18.2", // Servidor web
	"multer": "^1.4.5-lts.1", // Upload de arquivos
	"sharp": "^0.33.0", // Processamento de imagens
	"file-type": "^19.0.0", // Validação de tipos
	"cors": "^2.8.5", // CORS
	"helmet": "^7.1.0", // Segurança
	"uuid": "^9.0.1", // IDs únicos
	"dotenv": "^16.3.1", // Variáveis de ambiente
	"typescript": "^5.9.3", // Compilador TypeScript
	"tsx": "^4.20.6", // Executor TypeScript
	"@types/node": "^24.7.2", // Tipos Node.js
	"@types/express": "^5.0.3", // Tipos Express
	"@types/multer": "^2.0.0", // Tipos Multer
	"@types/cors": "^2.8.19", // Tipos CORS
	"@types/uuid": "^10.0.0" // Tipos UUID
}
```

### 🏗️ **Arquitetura Modular**

O servidor foi organizado em módulos especializados para melhor manutenibilidade:

- **`server.ts`**: Servidor principal e configuração de rotas
- **`config.ts`**: Configurações centralizadas e validação
- **`types.ts`**: Interfaces e tipos TypeScript
- **`utils.ts`**: Funções auxiliares (validação, otimização, limpeza)
- **`handlers.ts`**: Handlers de upload (avatar, contato, problemas, soluções)
- **`fileHandlers.ts`**: Handlers de arquivos (serve, delete, health check)
- **`multerConfig.ts`**: Configuração do Multer e middlewares

### 🔄 **Fluxo de Processamento**

1. **Recebimento**: Arquivo recebido via Multer
2. **Validação**: Verificação de tipo e tamanho
3. **Processamento**: Otimização com Sharp
4. **Armazenamento**: Salvamento em diretório específico
5. **Resposta**: URL do arquivo otimizado

### 🎨 **Otimizações Implementadas**

- **WebP Conversion**: Conversão automática para formato otimizado
- **Smart Resize**: Redimensionamento inteligente preservando aspecto
- **EXIF Rotation**: Rotação automática baseada em metadados
- **Quality Optimization**: Compressão otimizada por tipo de uso
- **Thumbnail Generation**: Miniaturas automáticas para avatars

---

## 🚀 DEPLOY EM PRODUÇÃO

### 🏢 **Configuração CPTEC/INPE**

```typescript
// src/config.ts para produção
export const config = {
  port: 4000,
  fileServerUrl: 'https://files.cptec.inpe.br',
  nextPublicAppUrl: 'https://silo.cptec.inpe.br',
  // ... outras configurações
}
```

### 🔧 **Comandos de Produção**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Executar servidor
cd fileserver
npm run pm2

# Configurar PM2 para iniciar com sistema
pm2 startup
pm2 save
```

### 🛡️ **Recomendações de Segurança**

1. **Firewall**: Configure firewall para permitir apenas portas necessárias
2. **Backup**: Configure backup automático dos arquivos
3. **Monitoring**: Implemente monitoramento de performance
4. **Access Control**: Configure autenticação se necessário
5. **SSL**: Use HTTPS em produção

---

## 📞 SUPORTE

### 📋 **Informações de Contato**

- **Projeto**: SILO - Sistema de Gerenciamento de Produtos Meteorológicos
- **Instituição**: CPTEC/INPE
- **Desenvolvimento**: Sistema de arquivos local Node.js

### 🔗 **Links Úteis**

- **Frontend SILO**: `/README.md` (documentação principal)
- **Servidor**: `/fileserver/README.md` (esta documentação)
- **Configuração**: `/fileserver/src/config.ts` (configurações centralizadas)

---

## 📝 CHANGELOG

### ✅ **Versão 2.2.0** - Configuração Totalmente Centralizada

- ✅ Remoção completa da dependência dotenv
- ✅ Configurações 100% centralizadas em `src/config.ts`
- ✅ Não há mais necessidade de arquivo `.env`
- ✅ Valores padrão fixos e tipados
- ✅ Documentação atualizada para refletir nova estrutura
- ✅ Simplificação máxima da configuração

### ✅ **Versão 2.1.0** - Refatoração Modular

- ✅ Refatoração completa em módulos especializados
- ✅ `handlers.ts` - Handlers de upload organizados
- ✅ `fileHandlers.ts` - Handlers de arquivos e health check
- ✅ `multerConfig.ts` - Configuração do Multer isolada
- ✅ `server.ts` - Servidor principal simplificado (apenas 80 linhas)
- ✅ Melhor organização e manutenibilidade do código
- ✅ Separação clara de responsabilidades

### ✅ **Versão 2.0.0** - Migração TypeScript

- ✅ Migração completa de JavaScript para TypeScript
- ✅ Configuração centralizada em `src/config.ts`
- ✅ Tipagem completa com interfaces e tipos
- ✅ Funções auxiliares organizadas em `src/utils.ts`
- ✅ Compilação TypeScript com tsx
- ✅ Validação de configuração na inicialização
- ✅ Logs padronizados com configuração detalhada
- ✅ Remoção do arquivo `env.exmaple` (configuração centralizada)

### ✅ **Versão 1.0.0** - Migração Completa

- ✅ Servidor Node.js independente implementado
- ✅ Otimização automática de imagens com Sharp
- ✅ Geração de thumbnails para avatars
- ✅ Estrutura de diretórios organizada
- ✅ Validação robusta de arquivos
- ✅ Integração transparente com frontend SILO
- ✅ Proxy Next.js para interceptação
- ✅ Limpeza automática de arquivos temporários
- ✅ Documentação completa

---

**🎯 Sistema SILO - Servidor de Arquivos Local**  
**Desenvolvido para CPTEC/INPE**  
**Status**: ✅ **PRODUCTION-READY**
