# 🐳 Guia Docker - Projeto Silo

## Início Rápido

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.docker.example .env

# Editar com suas configurações
# Mínimo necessário: DATABASE_URL
```

### 2. Executar com Docker

```bash
# Construir e iniciar containers
docker-compose up --build

# Executar em segundo plano
docker-compose up -d --build
```

### 3. Acessar Sistema

- **Frontend**: http://localhost:3000
- **FileServer**: http://localhost:4000/health

## Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Parar containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reconstruir apenas um serviço
docker-compose up --build fileserver
```

## Estrutura Simplificada

### Containers

- **nextapp** (porta 3000) - Aplicação Next.js
- **fileserver** (porta 4000) - Servidor de arquivos

### Volumes

- `./fileserver/uploads` - Arquivos de upload persistentes

### Variáveis Obrigatórias

- `DATABASE_URL` - Conexão PostgreSQL
- `NODE_ENV` - Ambiente (development/production)

### Variáveis Opcionais

- `GOOGLE_CLIENT_ID/SECRET` - OAuth Google
- `SMTP_*` - Configuração de email

## Solução de Problemas

### Porta já em uso
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3000
```

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs nextapp
docker-compose logs fileserver
```

### Limpar tudo
```bash
# Parar e remover tudo
docker-compose down -v
docker system prune -a
```
