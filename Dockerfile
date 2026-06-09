FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install

COPY . .
RUN pnpm build

FROM node:22-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production
ENV DATA_DIR=/var/lib/project-manager/data
ENV PORT=8002

COPY package.json ./
RUN pnpm install --prod

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8002

CMD ["node", "server.js"]
