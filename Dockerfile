# Dockerfile simplificado para Next.js
FROM node:18-alpine

# Define diretório de trabalho
WORKDIR /app

# Instala dependências primeiro (cache layer)
COPY package*.json ./
RUN npm ci --only=production

# Copia código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expõe porta 3000
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]