# Servidor de arquivos do Silo

Servidor de arquivos independente para gerenciamento de uploads e armazenamento local de imagens no sistema SILO.

---

## 📋 **VISÃO GERAL**

Servidor Node.js/TypeScript que oferece controle total sobre uploads com **otimização automática de imagens**, **conversão WebP**, **redimensionamento inteligente** e **geração de thumbnails**.

### 🎯 **Principais Funcionalidades**

- ✅ Servidor independente do frontend Next.js
- ✅ Otimização automática: conversão WebP, redimensionamento, rotação EXIF
- ✅ Thumbnails automáticos para avatars (128x128)
- ✅ Validação robusta de tipos e tamanhos
- ✅ Estrutura organizada por tipo de arquivo
- ✅ Docker pronto para produção

---

## ⚡ **INÍCIO RÁPIDO**

### 🚀 **Executar com Docker (Recomendado)**

```bash
# 1. Navegar para o diretório
cd fileserver

# 2. Executar com Docker
docker-compose up -d

# 3. Verificar status
docker-compose ps
```

**✅ Servidor disponível em** `http://localhost:4000`

### 📦 **Executar Localmente (Desenvolvimento)**

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

**✅ Servidor em** `http://localhost:4000` | **Frontend em** `http://localhost:3000`

---

## 📚 **DOCUMENTAÇÃO COMPLETA**

Para informações detalhadas sobre:

- **Arquitetura, APIs e Endpoints**: Consulte [`docs/FILESERVER.md`](./docs/FILESERVER.md)
- **Sistema de Thumbnails**: Consulte [`docs/THUMBNAILS.md`](./docs/THUMBNAILS.md)

---

## 🎯 **TIPOS DE UPLOAD SUPORTADOS**

| Tipo      | Endpoint                    | Máx Arquivos | Observações              |
| --------- | --------------------------- | ------------ | ------------------------ |
| **Geral** | `/api/upload`               | 1            | Upload genérico          |
| **Avatar** | `/upload/avatar`            | 1            | 80x80 + thumbnail 128x128 |
| **Contato** | `/upload/contact`          | 1            | 80x80 quadrado            |
| **Problema** | `/upload/problem`          | 3            | Múltiplas imagens         |
| **Solução** | `/upload/solution`          | 3            | Múltiplas imagens         |

---

## 🔧 **CONFIGURAÇÃO**

Todas as configurações estão em [`src/config.ts`](./src/config.ts):

```typescript
export const config = {
  port: 4000,
  fileServerUrl: 'http://localhost:4000',
  nextPublicAppUrl: 'http://localhost:3000',
  upload: {
    maxFileSize: 4194304, // 4MB
    maxFilesCount: 3,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif']
  }
}
```

---

## 📂 **ESTRUTURA DE DIRETÓRIOS**

```
fileserver/
├── src/
│   ├── server.ts          # Servidor principal
│   ├── config.ts          # Configurações
│   ├── handlers.ts        # Handlers de upload
│   ├── fileHandlers.ts    # Handlers de arquivos
│   ├── utils.ts           # Funções auxiliares
│   └── types.ts           # Tipos TypeScript
├── uploads/               # Arquivos salvos
│   ├── avatars/           # Avatars + thumbnails
│   ├── contacts/          # Fotos de contatos
│   ├── problems/          # Imagens de problemas
│   ├── solutions/         # Imagens de soluções
│   └── general/           # Uploads genéricos
├── docs/                  # Documentação completa
├── Dockerfile             # Imagem Docker
└── docker-compose.yml     # Orquestração Docker
```

---

## 🧪 **TESTE RÁPIDO**

```bash
# Health check
curl http://localhost:4000/health

# Upload de teste
curl -X POST -F "file=@imagem.jpg" http://localhost:4000/api/upload
```

---

## 📖 **PRÓXIMOS PASSOS**

- 📘 [Documentação Completa](./docs/FILESERVER.md) - APIs, arquitetura, endpoints
- 🖼️ [Sistema de Thumbnails](./docs/THUMBNAILS.md) - Geração automática de miniaturas

---

**🎯 Sistema SILO - Servidor de Arquivos Local**  
**Desenvolvido para CPTEC/INPE**  
