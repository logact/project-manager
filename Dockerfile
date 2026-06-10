# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native modules (better-sqlite3 needs compilation on Alpine)
RUN apk add --no-cache python3 make g++ sqlite-dev openssl

RUN corepack enable && corepack prepare --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate

ENV DATABASE_URL="file:/tmp/project-manager.db"
RUN pnpm exec prisma migrate deploy
RUN pnpm exec prisma db seed

RUN pnpm build

# Production stage
FROM node:20-alpine

# Install wget for healthcheck and openssl for Prisma/runtime
RUN apk add --no-cache wget openssl

WORKDIR /app

ENV NODE_ENV=production
ENV DATA_DIR=/var/lib/project-manager/data
ENV PORT=8002

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/generated ./generated

# Copy node_modules from builder to avoid re-install and re-compilation in production
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p /var/lib/project-manager/data && chown -R node:node /var/lib/project-manager
COPY --from=builder --chown=node:node /tmp/project-manager.db /var/lib/project-manager/data/project-manager.db

USER node

EXPOSE 8002

CMD ["node", "server.js"]
