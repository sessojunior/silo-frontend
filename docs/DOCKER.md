# 🐳 Docker e Deploy

Documentação completa sobre Docker, containerização e deploy em produção.

---

## 📋 **ÍNDICE**

1. [Visão Geral](#-visão-geral)
2. [Arquitetura](#-arquitetura)
3. [Configuração](#-configuração)
4. [Execução](#-execução)
5. [Deploy](#-deploy)
6. [Produção](#-produção)
7. [Troubleshooting](#-troubleshooting)

---

## 🎯 **VISÃO GERAL**

Docker é uma ferramenta que "empacota" aplicações em **containers** - ambientes isolados que funcionam da mesma forma em qualquer computador.

**Vantagens:**

- ✅ Funciona igual em qualquer máquina (desenvolvimento, teste, produção)
- ✅ Não precisa instalar Node.js, PostgreSQL, etc. manualmente
- ✅ Fácil de iniciar e parar o sistema completo
- ✅ Isola a aplicação do resto do sistema

---

## 🏗️ **ARQUITETURA**

O **Silo** usa **2 containers**:

1. **`nextapp`** (porta 3000) - Aplicação frontend Next.js
2. **`fileserver`** (porta 4000) - Servidor de arquivos

Os containers se comunicam automaticamente e compartilham arquivos quando necessário.

---

## ⚙️ **CONFIGURAÇÃO**

### **Pré-requisitos**

1. **Docker Desktop** (Windows/Mac) ou **Docker Engine** (Linux)
   - Download: https://www.docker.com/products/docker-desktop
   - Após instalar, verifique: `docker --version`

2. **Docker Compose** (geralmente já vem com o Docker Desktop)
   - Verifique: `docker-compose --version`

### **Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```bash
# Banco de Dados
DATABASE_URL='postgresql://usuario:senha@host:5432/banco'

# URLs do sistema
APP_URL='http://localhost:3000'
FILESERVER_URL='http://localhost:4000'

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=''
GOOGLE_CLIENT_SECRET=''

# Email SMTP
SMTP_HOST='smtp.seuservidor.com'
SMTP_PORT='587'
SMTP_SECURE=false # Defina como true se usar SSL (porta 465)
SMTP_USERNAME='seu-email@dominio.com'
SMTP_PASSWORD='sua-senha'
```

### **Arquivo docker-compose.yml**

```yaml
version: '3.8'

services:
  nextapp:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: silo-nextapp
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - fileserver
    restart: unless-stopped

  fileserver:
    build:
      context: ./fileserver
      dockerfile: Dockerfile
    container_name: silo-fileserver
    ports:
      - "4000:4000"
    volumes:
      - ./fileserver/uploads:/app/uploads
    restart: unless-stopped
```

---

## 🚀 **EXECUÇÃO**

### **Opção 1: Desenvolvimento Local (SEM Docker)**

Recomendado para desenvolvimento ativo do código:

```bash
# 1. Instalar dependências
npm install
cd fileserver && npm install && cd ..

# 2. Configurar variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# 3. Executar servidores em terminais separados
# Terminal 1:
cd fileserver
npm run dev

# Terminal 2 (em outra janela):
npm run dev

# ✅ Pronto! Acesse:
# Frontend: http://localhost:3000
# FileServer: http://localhost:4000
```

**Para parar**: Pressione `Ctrl+C` em cada terminal.

### **Opção 2: Usando Docker**

Recomendado para testar ou usar o sistema sem configurar o ambiente:

```bash
# 1. Copiar arquivo de exemplo
cp env.docker.example .env

# 2. Editar .env com suas configurações
# Use um editor de texto (VSCode, Notepad++, etc.)

# 3. Construir e executar containers
docker-compose up --build

# Isso vai:
# 1. Baixar as imagens necessárias (primeira vez demora mais)
# 2. Construir os containers do Silo
# 3. Iniciar frontend (porta 3000) e fileserver (porta 4000)
# 4. Mostrar logs em tempo real

# ✅ Aguarde a mensagem: "ready - started server on..."
# ✅ Acesse: http://localhost:3000
```

**Executar em segundo plano:**

```bash
docker-compose up -d --build

# Ver logs depois:
docker-compose logs -f
```

---

## 🛠️ **GERENCIAMENTO**

### **Comandos Básicos**

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um container específico
docker-compose logs -f nextapp
docker-compose logs -f fileserver

# Parar todos os containers
docker-compose down

# Parar e remover tudo (inclusive volumes)
docker-compose down -v

# Reiniciar containers
docker-compose restart

# Reconstruir apenas um container
docker-compose up --build fileserver
```

### **Acessar o Sistema**

Após iniciar os containers:

- **Frontend**: http://localhost:3000
- **FileServer**: http://localhost:4000/health

---

## 🚀 **DEPLOY**

### **Estratégia de Deploy**

O projeto **Silo** está configurado para deploy separado:

- **Frontend Next.js**: Deploy no Vercel ou em servidor próprio
- **FileServer**: Deploy em servidor próprio (CPTEC/INPE)

### **Deploy do Frontend (Vercel)**

```bash
# Deploy automático via Git
git add .
git commit -m "Deploy: configuração otimizada"
git push origin main
```

O Vercel fará deploy automaticamente apenas do frontend Next.js.

### **Deploy do FileServer (Servidor Próprio)**

```bash
# 1. Deploy do código fonte
cd fileserver
npm install

# 2. Configurar produção (editar src/config.ts)
# fileServerUrl: 'https://files.cptec.inpe.br'
# nextPublicAppUrl: 'https://silo.cptec.inpe.br'

# 3. Executar com Docker
docker-compose up -d

# Ou com npm diretamente
npm run dev
```

### **Arquivos de Configuração**

- `.gitignore` - Ignora arquivos desnecessários
- `.vercelignore` - Otimiza deploy no Vercel
- `.dockerignore` - Otimiza containers Docker
- `vercel.json` - Configuração específica do Vercel
- `next.config.ts` - Configuração Next.js otimizada

---

## 🏭 **PRODUÇÃO**

### **Container Next.js (`nextapp`)**

- **Porta**: 3000 (mapeada para localhost:3000)
- **Função**: Aplicação frontend e APIs
- **Aguarda**: `fileserver` estar pronto antes de iniciar
- **Restart**: Automático (`unless-stopped`)

### **Container Fileserver (`fileserver`)**

- **Porta**: 4000 (mapeada para localhost:4000)
- **Função**: Upload e gerenciamento de arquivos
- **Volume**: `./fileserver/uploads` (arquivos salvos no host)
- **Restart**: Automático (`unless-stopped`)

### **Persistência de Dados**

- ✅ Arquivos de upload são salvos em `./fileserver/uploads` (não perdem ao parar containers)
- ⚠️ Banco de dados precisa ser externo (PostgreSQL separado)

### **Configurações de Produção**

```bash
# Desenvolvimento
APP_URL='http://localhost:3000'
FILESERVER_URL='http://localhost:4000'

# Produção
APP_URL='https://silo.cptec.inpe.br'
FILESERVER_URL='https://files.cptec.inpe.br'
```

**⚠️ Importante para Produção:**

- URLs HTTPS obrigatórias
- Domínios reais institucionais
- Secrets complexos e únicos
- Servidor PostgreSQL dedicado
- SSL/TLS configurado
- Firewall configurado

---

## 🔧 **TROUBLESHOOTING**

### **Erro: "port is already allocated"**

```bash
# Outro programa está usando a porta 3000 ou 4000
# Opção 1: Parar o programa que está usando a porta
# Opção 2: Mudar a porta no docker-compose.yml

# Ver o que está usando a porta (Windows):
netstat -ano | findstr :3000

# Matar processo (Windows):
taskkill /PID <PID> /F
```

### **Erro: "Cannot connect to the Docker daemon"**

```bash
# Docker Desktop não está rodando
# Solução: Inicie o Docker Desktop e aguarde inicializar
```

### **Container não inicia**

```bash
# Ver logs detalhados
docker-compose logs nextapp
docker-compose logs fileserver

# Verificar variáveis de ambiente
docker-compose config

# Verificar permissões dos volumes
docker-compose exec fileserver ls -la uploads/
```

### **Limpar tudo e recomeçar**

```bash
# Parar e remover containers, volumes e redes
docker-compose down -v

# Remover imagens antigas (libera espaço)
docker system prune -a

# Reconstruir do zero
docker-compose up --build
```

### **Comandos de Debug**

```bash
# Entrar dentro do container Next.js
docker-compose exec nextapp sh

# Entrar dentro do container Fileserver
docker-compose exec fileserver sh

# Ver configuração completa gerada
docker-compose config

# Ver recursos usados pelos containers
docker stats

# Verificar logs de erro específicos
docker-compose logs nextapp | grep ERROR
docker-compose logs fileserver | grep ERROR
```

---

## 📊 **QUANDO USAR CADA OPÇÃO?**

| Situação | Recomendação |
|----------|--------------|
| **Desenvolvendo código** | Desenvolvimento Local (npm run dev) |
| **Testando o sistema** | Docker |
| **Primeira vez usando** | Docker |
| **Deploy em servidor** | Docker |
| **Debugando problemas** | Desenvolvimento Local |
| **Demonstração rápida** | Docker |

---

**🎯 Para detalhes técnicos, consulte os Dockerfiles em `/Dockerfile` e `/fileserver/Dockerfile`**
