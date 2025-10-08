FROM node:18-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci

# Copia código
COPY . .

# Cria diretórios de upload
RUN mkdir -p uploads/avatars uploads/contacts uploads/problems uploads/solutions uploads/general uploads/temp

# Expõe porta
EXPOSE 4000

# Comando de execução
CMD ["npm", "start"]