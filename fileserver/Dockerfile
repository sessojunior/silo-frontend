# Dockerfile para FileServer
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia código fonte
COPY . .

# Cria diretórios necessários para uploads
RUN mkdir -p uploads/avatars uploads/contacts uploads/problems uploads/solutions uploads/general uploads/temp

# Declara volume para persistência de dados (deverá aparecer em Config.Volumes do docker container inspect <container_name>)
VOLUME ["/app/uploads"]

# Expõe porta 4000
EXPOSE 4000

# Comando de inicialização
CMD ["npm", "start"]