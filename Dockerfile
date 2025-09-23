# Etapa 1: build
FROM node:18-alpine AS builder
WORKDIR /app

# Copia package.json e package-lock.json (copia primeiro para aproveitar cache)
COPY package*.json ./
RUN npm ci --only=production

# Copia o resto do código e faz o build
COPY . .
RUN npm run build

# Etapa 2: runtime (imagem menor)
FROM node:18-alpine AS runner
WORKDIR /app

# Define o ambiente de produção
ENV NODE_ENV=production

# Cria usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia apenas o necessário para rodar
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Define permissões corretas
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponha a porta 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]