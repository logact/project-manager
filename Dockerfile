FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ openssl && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare --activate
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate

ENV DATABASE_URL="file:/tmp/project-manager.db"
RUN pnpm exec prisma migrate deploy
RUN pnpm exec prisma db seed

RUN pnpm build

FROM node:22-slim

RUN apt-get update && apt-get install -y python3 make g++ openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV DATA_DIR=/var/lib/project-manager/data
ENV PORT=8002

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare --activate
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/generated ./generated
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN mkdir -p /var/lib/project-manager/data && chown -R node:node /var/lib/project-manager
COPY --from=builder --chown=node:node /tmp/project-manager.db /var/lib/project-manager/data/project-manager.db

USER node

EXPOSE 8002

CMD ["node", "server.js"]
