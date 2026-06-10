# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY . .
RUN pnpm exec prisma generate

ENV DATABASE_URL="file:/tmp/project-manager.db"
RUN pnpm exec prisma migrate deploy
RUN pnpm exec prisma db seed

RUN pnpm build

# Production stage
FROM node:20-alpine

# Install wget for healthcheck and openssl for Prisma/runtime
RUN apk add --no-cache wget openssl su-exec

WORKDIR /app

ENV NODE_ENV=production
ENV DATA_DIR=/var/lib/project-manager/data
ENV PORT=8002

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder --chown=node:node /tmp/project-manager.db /app/project-manager.db
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8002

ENTRYPOINT ["/app/docker-entrypoint.sh"]
