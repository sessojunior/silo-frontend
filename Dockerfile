FROM node:18-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci

# Copia código e faz build
COPY . .
RUN npm run build

# Expõe porta
EXPOSE 3000

# Comando de execução
CMD ["npm", "start"]