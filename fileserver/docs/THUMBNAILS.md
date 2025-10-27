# 🖼️ Sistema de Thumbnails - Documentação Técnica

Documentação completa sobre o sistema de geração automática de thumbnails do servidor de arquivos SILO.

---

## 📋 **ÍNDICE**

1. [Visão Geral](#-visão-geral)
2. [Como Funciona](#-como-funciona)
3. [Configurações](#-configurações)
4. [Tipos de Thumbnails](#-tipos-de-thumbnails)
5. [Implementação](#-implementação)
6. [API de Thumbnails](#-api-de-thumbnails)
7. [Integração](#-integração)
8. [Troubleshooting](#-troubleshooting)

---

## 🎯 **VISÃO GERAL**

O sistema de thumbnails gera automaticamente **miniaturas otimizadas** de imagens para melhorar performance e reduzir consumo de banda.

### **Características Principais**

- ✅ Geração automática para avatars
- ✅ Thumbnails quadrados 128x128
- ✅ Formato WebP otimizado
- ✅ Qualidade configurável (85% padrão)
- ✅ Rotação EXIF automática
- ✅ Redimensionamento inteligente com crop

---

## 🔄 **COMO FUNCIONA**

### **1. Fluxo de Geração**

```
Upload de Imagem
      ↓
Validação de Tipo
      ↓
Otimização Principal (80x80)
      ↓
Geração de Thumbnail (128x128)
      ↓
Armazenamento
      ↓
Resposta com URLs
```

### **2. Processamento**

```typescript
// 1. Upload e otimização principal
await sharp(buffer)
  .rotate()                    // Rotação EXIF
  .resize(80, 80, { fit: 'cover' })
  .webp({ quality: 85 })
  .toFile(avatarPath)

// 2. Geração de thumbnail
await sharp(buffer)
  .rotate()
  .resize(128, 128, { fit: 'cover' })
  .webp({ quality: 85 })
  .toFile(thumbPath)
```

### **3. Armazenamento**

```
uploads/avatars/
├── 1734567890-abc12345.webp   → Imagem principal (80x80)
└── thumb-1734567890-abc12345.webp   → Thumbnail (128x128)
```

---

## ⚙️ **CONFIGURAÇÕES**

### **Configuração Centralizada**

```typescript
// src/config.ts
optimization: {
  avatar: {
    thumbnailSize: 128,      // Tamanho do thumbnail
    thumbnailQuality: 85     // Qualidade WebP
  },
  profile: {
    size: 80,                // Tamanho da imagem principal
    quality: 85              // Qualidade WebP
  }
}
```

### **Parâmetros Configuráveis**

| Parâmetro        | Valor Padrão | Descrição                        |
| ---------------- | ------------ | -------------------------------- |
| `thumbnailSize`  | 128          | Tamanho do thumbnail (px)        |
| `thumbnailQuality` | 85       | Qualidade WebP (0-100)          |
| `profile.size`   | 80           | Tamanho da imagem principal (px) |
| `profile.quality` | 85         | Qualidade WebP (0-100)          |

---

## 📐 **TIPOS DE THUMBNAILS**

### **1. Avatar Thumbnail**

- **Tamanho**: 128x128 px
- **Qualidade**: 85%
- **Crop**: Mantém proporção, preenche quadrado
- **Uso**: Preview, listas, busca
- **Formato**: WebP

```typescript
await sharp(buffer)
  .rotate()
  .resize(128, 128, { fit: 'cover' })
  .webp({ quality: 85 })
  .toFile(thumbPath)
```

### **2. Profile Image**

- **Tamanho**: 80x80 px
- **Qualidade**: 85%
- **Crop**: Mantém proporção, preenche quadrado
- **Uso**: Avatar principal
- **Formato**: WebP

```typescript
await sharp(buffer)
  .rotate()
  .resize(80, 80, { fit: 'cover' })
  .webp({ quality: 85 })
  .toFile(profilePath)
```

---

## 🛠️ **IMPLEMENTAÇÃO**

### **Função de Geração**

```typescript
// src/utils.ts
export async function generateThumbnail(
  buffer: Buffer, 
  filename: string
): Promise<string | null> {
  try {
    // Gerar nome único
    const thumbFilename = `thumb-${filename.replace(/\.[^/.]+$/, '')}.webp`
    const thumbPath = path.join(
      process.cwd(), 
      'uploads', 
      'avatars', 
      thumbFilename
    )

    // Obter configurações
    const thumbnailSize = config.optimization.avatar.thumbnailSize
    const thumbnailQuality = config.optimization.avatar.thumbnailQuality

    // Gerar thumbnail
    await sharp(buffer)
      .rotate()           // Rotação EXIF automática
      .resize(thumbnailSize, thumbnailSize, { fit: 'cover' })
      .webp({ quality: thumbnailQuality })
      .toFile(thumbPath)

    console.log('✅ Thumbnail gerado:', thumbFilename)
    
    return `${config.fileServerUrl}/files/avatars/${thumbFilename}`
  } catch (error) {
    console.error('❌ Erro ao gerar thumbnail:', error)
    return null
  }
}
```

### **Integração no Upload**

```typescript
// src/handlers.ts - handleAvatarUpload
export const handleAvatarUpload: ExpressHandler = async (req, res) => {
  // ... validação e otimização principal ...
  
  // Gerar thumbnail automaticamente
  const thumbnailUrl = await generateThumbnail(file.buffer, optimizedFilename)
  
  // Resposta inclui URL do thumbnail
  const response = {
    success: true,
    message: 'Upload de avatar concluído com sucesso!',
    data: {
      key: optimizedFilename,
      url: fileUrl,
      thumbnailUrl: thumbnailUrl,  // URL do thumbnail
      optimized: true
    }
  }
  
  res.json(response)
}
```

---

## 🌐 **API DE THUMBNAILS**

### **Endpoints**

#### **1. Acessar Thumbnail**

```bash
GET /files/avatars/thumb-{filename}.webp

# Exemplo
curl http://localhost:4000/files/avatars/thumb-1734567890-abc12345.webp
```

#### **2. Upload com Thumbnail**

```bash
POST /upload/avatar
Content-Type: multipart/form-data

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

### **Estrutura de Resposta**

```typescript
interface UploadResponse {
  key: string            // Nome do arquivo principal
  name: string           // Nome original
  size: number           // Tamanho em bytes
  url: string            // URL da imagem principal
  thumbnailUrl?: string  // URL do thumbnail (apenas para avatars)
  id: string            // ID único
  status: 'uploaded'    // Status
  optimized: boolean    // Se foi otimizado
}
```

---

## 🔗 **INTEGRAÇÃO**

### **Componentes Next.js**

```typescript
// Componente usando thumbnail
<img 
  src={user.thumbnailUrl}  // URL do thumbnail
  alt={user.name}
  loading="lazy"
/>

// Link para imagem completa
<a href={user.url}>
  <img src={user.thumbnailUrl} />
</a>
```

### **Atualização de Avatar**

```typescript
const uploadAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/upload/avatar', {
    method: 'POST',
    body: formData
  })
  
  const { data } = await response.json()
  
  // data.url → imagem principal (80x80)
  // data.thumbnailUrl → thumbnail (128x128)
  
  return {
    profileImage: data.url,
    thumbnailImage: data.thumbnailUrl
  }
}
```

---

## 🔍 **PROCESSO DE REDIMENSIONAMENTO**

### **Algoritmo de Crop**

```typescript
.resize(128, 128, { fit: 'cover' })
```

**Como funciona:**
1. Mantém proporção da imagem original
2. Redimensiona até cobrir 128x128
3. Centraliza e corta excesso
4. Garante sempre um quadrado

**Exemplos:**

```
Original: 1920x1080 (16:9)  → Thumbnail: 128x128 (1:1)
  Crop: 1920x1920 centralizado
  
Original: 500x500 (1:1)      → Thumbnail: 128x128 (1:1)
  Sem crop necessário
  
Original: 800x600 (4:3)      → Thumbnail: 128x128 (1:1)
  Crop: 600x600 centralizado
```

### **Rotação EXIF**

```typescript
.rotate()  // Automático baseado em metadados
```

**Suporta orientações:**
- 0° (top)
- 90° (right)
- 180° (bottom)
- 270° (left)
- Mirror horizontal
- Mirror vertical

---

## 💾 **ECONOMIA DE RECURSOS**

### **Comparação de Tamanho**

| Tipo      | Tamanho Original | Tamanho Otimizado | Redução |
| --------- | ----------------- | ----------------- | ------- |
| **Original** | 2.5 MB | - | - |
| **Principal (80x80)** | - | 8 KB | 99.7% |
| **Thumbnail (128x128)** | - | 15 KB | 99.4% |

### **Economia de Banda**

**Antes:**
```
Carregando lista de 100 avatars = 2.5 MB × 100 = 250 MB
```

**Depois:**
```
Carregando lista de 100 avatars = 15 KB × 100 = 1.5 MB
Economia: 248.5 MB (99.4%)
```

---

## 🐛 **TROUBLESHOOTING**

### **Thumbnail Não Gerado**

```bash
# Verificar se Sharp está instalado
npm install sharp

# Verificar permissões de escrita
chmod 755 uploads/avatars/

# Verificar logs
tail -f logs/fileserver.log
```

### **Thumbnail Distorcido**

```typescript
// Verificar se está usando 'cover'
.resize(128, 128, { fit: 'cover' })  // ✅ Correto
.resize(128, 128, { fit: 'contain' })  // ❌ Incorreto
```

### **Thumbnail Não Aparece**

```typescript
// Verificar configuração
const config = {
  optimization: {
    avatar: {
      thumbnailSize: 128,
      thumbnailQuality: 85
    }
  }
}

// Verificar URL
const thumbnailUrl = `${fileServerUrl}/files/avatars/${thumbFilename}`
```

### **Qualidade Baixa**

```typescript
// Aumentar qualidade
optimization: {
  avatar: {
    thumbnailSize: 128,
    thumbnailQuality: 90  // 85 → 90
  }
}
```

---

## 📊 **MONITORAMENTO**

### **Verificar Thumbnails Gerados**

```bash
# Listar thumbnails
ls -lh uploads/avatars/thumb-*.webp

# Verificar tamanho
du -sh uploads/avatars/

# Contar thumbnails
find uploads/avatars/ -name "thumb-*.webp" | wc -l
```

### **Logs de Geração**

```bash
# Logs de sucesso
✅ Thumbnail gerado: thumb-1734567890-abc12345.webp

# Logs de erro
❌ Erro ao gerar thumbnail: Error: ...
```

---

## 🎯 **BEST PRACTICES**

### **1. Usar Thumbnails em Listas**

```typescript
// ✅ Usar thumbnail em listas
<img src={user.thumbnailUrl} />  // 15 KB

// ❌ Não usar imagem completa
<img src={user.url} />           // 2.5 MB
```

### **2. Lazy Loading**

```typescript
<img 
  src={thumbnailUrl}
  loading="lazy"
  alt="Avatar"
/>
```

### **3. Fallback**

```typescript
<img 
  src={thumbnailUrl || defaultAvatar}
  onError={(e) => e.target.src = defaultAvatar}
/>
```

### **4. CDN e Cache**

```typescript
// Configurar cache headers
res.setHeader('Cache-Control', 'max-age=31536000')
```

---

## 📖 **REFERÊNCIAS TÉCNICAS**

- **Sharp Documentation**: https://sharp.pixelplumbing.com/
- **WebP Format**: https://developers.google.com/speed/webp
- **EXIF Orientation**: https://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/

---

**🎯 Para documentação completa do sistema, consulte [FILESERVER.md](./FILESERVER.md)**
