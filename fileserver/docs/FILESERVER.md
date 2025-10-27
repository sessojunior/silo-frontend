# 📘 Documentação Completa - Servidor de Arquivos SILO

Documentação técnica completa do servidor de arquivos, incluindo arquitetura, APIs, endpoints, configurações e integração.

---

## 📋 **ÍNDICE**

1. [Arquitetura](#-arquitetura)
2. [Configuração](#-configuração)
3. [Endpoints Disponíveis](#-endpoints-disponíveis)
4. [Fluxo de Processamento](#-fluxo-de-processamento)
5. [Otimização de Imagens](#-otimização-de-imagens)
6. [Segurança e Validação](#-segurança-e-validação)
7. [Integração com SILO](#-integração-com-silo)
8. [Estrutura de Dados](#-estrutura-de-dados)
9. [Execução e Deploy](#-execução-e-deploy)
10. [Troubleshooting](#-troubleshooting)

---

## 🏗️ **ARQUITETURA**

### 📦 **Módulos do Sistema**

O servidor foi organizado em módulos especializados:

#### **1. `server.ts` - Servidor Principal**
- Configuração do Express
- Middlewares (CORS, Helmet)
- Rotas de upload e arquivos
- Limpeza automática de arquivos temporários

```typescript
// Rotas principais
app.post('/api/upload', uploadSingle, handleMainUpload)
app.post('/upload/avatar', uploadSingle, handleAvatarUpload)
app.post('/upload/contact', uploadSingle, handleContactUpload)
app.post('/upload/problem', uploadMultiple, handleProblemUpload)
app.post('/upload/solution', uploadMultiple, handleSolutionUpload)

app.get('/files/:type/:filename', handleFileServe)
app.delete('/files/:type/:filename', handleFileDelete)
app.get('/health', handleHealthCheck)
```

#### **2. `config.ts` - Configurações Centralizadas**
- Todas as configurações em um único arquivo
- Validação na inicialização
- Logs de configuração

```typescript
export const config: FileServerConfig = {
  port: 4000,
  fileServerUrl: process.env.FILE_SERVER_URL || 'http://localhost:4000',
  nextPublicAppUrl: process.env.APP_URL || 'http://localhost:3000',
  upload: {
    maxFileSize: 4194304,
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

#### **3. `handlers.ts` - Handlers de Upload**
- `handleMainUpload`: Upload genérico
- `handleAvatarUpload`: Upload de avatar
- `handleContactUpload`: Upload de contato
- `handleProblemUpload`: Upload múltiplo de problemas
- `handleSolutionUpload`: Upload múltiplo de soluções

#### **4. `fileHandlers.ts` - Handlers de Arquivos**
- `handleFileServe`: Servir arquivos
- `handleFileDelete`: Deletar arquivos
- `handleHealthCheck`: Health check do servidor
- `handleFileOptions`: CORS preflight

#### **5. `utils.ts` - Funções Auxiliares**
- `validateFileType`: Validação com magic numbers
- `optimizeImage`: Otimização automática
- `generateThumbnail`: Geração de thumbnails
- `cleanupTempFiles`: Limpeza automática
- `generateUniqueFilename`: Nomes únicos

#### **6. `multerConfig.ts` - Configuração do Multer**
- Upload single file
- Upload multiple files
- Validações de tamanho e tipo

---

## ⚙️ **CONFIGURAÇÃO**

### 📝 **Arquivo `src/config.ts`**

```typescript
export interface FileServerConfig {
  port: number
  fileServerUrl: string
  nextPublicAppUrl: string
  upload: UploadConfig
  optimization: OptimizationConfig
}

export interface UploadConfig {
  maxFileSize: number
  maxFilesCount: number
  allowedExtensions: string[]
  allowedMimes: string[]
}

export interface OptimizationConfig {
  avatar: { thumbnailSize: number; thumbnailQuality: number }
  profile: { size: number; quality: number }
  general: { maxWidth: number; maxHeight: number; quality: number }
}
```

### 🔧 **Variáveis de Ambiente**

O servidor aceita variáveis de ambiente opcionais:

```bash
FILE_SERVER_URL=http://localhost:4000
APP_URL=http://localhost:3000
```

Valores padrão são usados caso não especificados.

---

## 🌐 **ENDPOINTS DISPONÍVEIS**

### 📤 **Endpoints de Upload**

#### **1. Upload Genérico**
```bash
POST /api/upload
Content-Type: multipart/form-data

# Exemplo
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

# Resposta
{
  "success": true,
  "message": "Upload de avatar concluído com sucesso!",
  "data": {
    "key": "1734567890-abc12345.webp",
    "name": "avatar.jpg",
    "size": 1024768,
    "url": "http://localhost:4000/files/avatars/1734567890-abc12345.webp",
    "optimized": true
  }
}
```

#### **3. Upload de Contato**
```bash
POST /upload/contact
```

#### **4. Upload Múltiplo de Problemas**
```bash
POST /upload/problem
Content-Type: multipart/form-data

# Múltiplos arquivos
curl -X POST \
  -F "files=@problema1.jpg" \
  -F "files=@problema2.jpg" \
  http://localhost:4000/upload/problem

# Resposta
{
  "success": true,
  "message": "2 arquivo(s) de problema enviado(s) com sucesso!",
  "data": [
    {
      "key": "1734567890-abc12345.webp",
      "name": "problema1.jpg",
      "size": 1024768,
      "url": "http://localhost:4000/files/problems/1734567890-abc12345.webp",
      "optimized": true
    }
  ]
}
```

#### **5. Upload Múltiplo de Soluções**
```bash
POST /upload/solution
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

# Resposta
{
  "success": true,
  "message": "Arquivo deletado com sucesso"
}
```

#### **8. Health Check**
```bash
GET /health

# Resposta
{
  "success": true,
  "message": "Servidor de arquivos funcionando",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "port": 4000
}
```

---

## 🔄 **FLUXO DE PROCESSAMENTO**

### **1. Recebimento do Arquivo**

```
Cliente → Multer Middleware → Validação de Tamanho → Validação de Tipo
```

### **2. Validação**

```typescript
// Validação com magic numbers (file-type)
const fileType = await fileTypeFromBuffer(buffer)
const isValid = allowedTypes.includes(fileType.mime)
```

**Validações Implementadas:**
- ✅ Verificação de magic numbers (primeiros bytes)
- ✅ Validação de MIME type
- ✅ Verificação de tamanho
- ✅ Verificação de extensão

### **3. Processamento**

```typescript
// Otimização automática
await sharp(buffer)
  .rotate()           // Rotação EXIF automática
  .resize(maxWidth, maxHeight, { fit: 'inside' })
  .webp({ quality })  // Conversão WebP
  .toFile(outputPath)
```

**Transformações Aplicadas:**
- ✅ Conversão para WebP
- ✅ Redimensionamento inteligente
- ✅ Rotação EXIF automática
- ✅ Compressão otimizada

### **4. Armazenamento**

```
uploads/
├── avatars/        → 80x80 + thumbnail 128x128
├── contacts/       → 80x80
├── problems/       → Máx 1920x1080
├── solutions/      → Máx 1920x1080
└── general/        → Máx 1920x1080
```

### **5. Resposta**

```typescript
{
  key: "timestamp-uuid.webp",
  name: "original.jpg",
  size: 1024768,
  url: "http://localhost:4000/files/type/filename.webp",
  id: "timestamp-uuid.webp",
  status: "uploaded",
  optimized: true
}
```

---

## 🖼️ **OTIMIZAÇÃO DE IMAGENS**

### **Configurações por Tipo**

| Tipo    | Dimensões  | Qualidade | Crop | Thumbnail |
| ------- | ---------- | --------- | ---- | --------- |
| Avatar  | 80x80      | 85%       | Sim  | 128x128   |
| Contact | 80x80      | 85%       | Sim  | Não       |
| General | Máx 1920x1080 | 90%  | Não | Não       |

### **Transformações Aplicadas**

1. **Rotação EXIF**: Corrige orientação automaticamente
2. **Redimensionamento**: Mantém proporção, não estica
3. **Conversão WebP**: Redução de 30-50% no tamanho
4. **Compressão**: Qualidade otimizada para web

---

## 🔒 **SEGURANÇA E VALIDAÇÃO**

### **Validações Implementadas**

- **File Type Validation**: Magic numbers + MIME types
- **File Size Limits**: 4MB máximo
- **File Count Limits**: 3 arquivos máximo
- **Extension Validation**: Extensões permitidas
- **Filename Sanitization**: Nomes sanitizados
- **CORS**: Configurado para domínio específico

### **Tipos Permitidos**

```typescript
allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif']
allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
```

### **Limites de Segurança**

- Tamanho máximo: 4MB por arquivo
- Quantidade máxima: 3 arquivos por upload
- Tipos permitidos: Apenas imagens
- CORS: Apenas domínio configurado

---

## 🔌 **INTEGRAÇÃO COM SILO**

### **Proxy Next.js**

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

### **Componentes Atualizados**

- `PhotoUploadLocal.tsx`: Usa `UploadButtonLocal`
- `ContactFormOffcanvas.tsx`: Upload de contatos
- `ProblemFormOffcanvas.tsx`: Upload de problemas
- `SolutionFormModal.tsx`: Upload de soluções

### **APIs Compatíveis**

- `/api/admin/contacts`
- `/api/admin/products/images`
- `/api/admin/products/solutions`
- `/api/(user)/user-profile-image`

---

## 📊 **ESTRUTURA DE DADOS**

### **UploadResponse**

```typescript
interface UploadResponse {
  key: string            // Nome do arquivo final
  name: string           // Nome original
  size: number           // Tamanho em bytes
  url: string            // URL completa
  id: string            // ID único
  status: 'uploaded'     // Status
  optimized: boolean     // Se foi otimizado
}
```

### **MultiUploadResponse**

```typescript
interface MultiUploadResponse {
  success: boolean
  message: string
  data: UploadResponse[]
}
```

### **SingleUploadResponse**

```typescript
interface SingleUploadResponse {
  success: boolean
  message: string
  data: UploadResponse
}
```

---

## 🚀 **EXECUÇÃO E DEPLOY**

### **Docker (Produção)**

```bash
# Construir imagem
docker build -t silo-fileserver .

# Executar container
docker run -d \
  --name silo-fileserver \
  -p 4000:4000 \
  -v $(pwd)/uploads:/app/uploads \
  silo-fileserver
```

### **Docker Compose**

```bash
# Executar com docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### **Desenvolvimento Local**

```bash
# Instalar dependências
npm install

# Executar
npm run dev

# Build
npm run build
```

---

## 🔧 **TROUBLESHOOTING**

### **Porta 4000 Ocupada**

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Editar config.ts para porta diferente
port: 4001
```

### **Erro de CORS**

```typescript
// Verificar config.ts
nextPublicAppUrl: 'http://localhost:3000'
```

### **Upload Falha**

```typescript
// Verificar limites
upload: {
  maxFileSize: 4194304, // 4MB
  maxFilesCount: 3
}
```

### **Thumbnail Não Gerado**

```bash
# Verificar Sharp instalado
npm install sharp

# Verificar permissões
chmod 755 uploads/
```

### **Testes de Validação**

```bash
# 1. Health check
curl http://localhost:4000/health

# 2. Upload teste
curl -X POST -F "file=@test.jpg" http://localhost:4000/api/upload

# 3. Verificar arquivos
ls uploads/
```

---

## 📖 **DEPENDÊNCIAS PRINCIPAIS**

```json
{
  "express": "^4.18.2",      // Servidor web
  "multer": "^1.4.5-lts.1",  // Upload
  "sharp": "^0.33.0",        // Processamento de imagens
  "file-type": "^19.0.0",    // Validação de tipos
  "cors": "^2.8.5",          // CORS
  "helmet": "^7.1.0",        // Segurança
  "uuid": "^9.0.1"           // IDs únicos
}
```

---

## 🔄 **LIMPEZA AUTOMÁTICA**

Arquivos temporários são removidos automaticamente:

- **Intervalo**: A cada 1 hora
- **Idade máxima**: 24 horas
- **Diretório**: `uploads/temp/`

```typescript
// Em server.ts
setInterval(cleanupTempFiles, 60 * 60 * 1000)
```

---

**🎯 Para mais informações sobre thumbnails, consulte [THUMBNAILS.md](./THUMBNAILS.md)**
