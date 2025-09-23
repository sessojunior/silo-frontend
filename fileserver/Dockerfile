# Etapa 1: build
FROM node:18-alpine AS builder
WORKDIR /app

# Instala curl para health check
RUN apk add --no-cache curl

# Copia package.json e package-lock.json (copia primeiro para aproveitar cache)
COPY package*.json ./
RUN npm ci --only=production

# Copia o resto do código
COPY . .

# Etapa 2: runtime (imagem menor)
FROM node:18-alpine AS runner
WORKDIR /app

# Instala curl para health check
RUN apk add --no-cache curl

# Define o ambiente de produção
ENV NODE_ENV=production

# Cria usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fileserver

# Copia apenas o necessário para rodar
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# Cria diretório de uploads com permissões corretas
RUN mkdir -p uploads/avatars uploads/contacts uploads/problems uploads/solutions uploads/general uploads/temp
RUN chown -R fileserver:nodejs /app

USER fileserver

# Exponha a porta 4000
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["npm", "start"]