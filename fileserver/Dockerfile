# Dockerfile simplificado para FileServer
FROM node:18-alpine

# Define diretório de trabalho
WORKDIR /app

# Instala dependências primeiro (cache layer)
COPY package*.json ./
RUN npm ci --only=production

# Copia código fonte
COPY . .

# Cria diretórios necessários para uploads
RUN mkdir -p uploads/avatars uploads/contacts uploads/problems uploads/solutions uploads/general uploads/temp

# Expõe porta 4000
EXPOSE 4000

# Comando de inicialização
CMD ["npm", "start"]