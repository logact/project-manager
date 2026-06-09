FROM node:22-alpine AS builder

# better-sqlite3 requires Python and build tools to compile native bindings
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install

COPY . .
RUN pnpm build

# Production stage
FROM node:22-alpine

RUN apk add --no-cache python3 make g++
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
