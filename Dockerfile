# Dockerfile simplificado para Next.js
FROM node:22-alpine

# Atualiza pacotes do Alpine para corrigir vulnerabilidades de segurança
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Define diretório de trabalho
WORKDIR /app

# Instala dependências primeiro (cache layer)
COPY package*.json ./
RUN npm ci

# Copia código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expõe porta 3000
EXPOSE 3000

# Comando de inicialização (executa como root/admin)
CMD ["npm", "start"]
