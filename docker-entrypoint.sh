#!/bin/sh
set -e

mkdir -p /var/lib/project-manager/data

if [ ! -f /var/lib/project-manager/data/project-manager.db ]; then
  cp /app/project-manager.db /var/lib/project-manager/data/project-manager.db
fi

chown -R node:node /var/lib/project-manager/data

export DATABASE_URL="${DATABASE_URL:-file:${DATA_DIR}/project-manager.db}"

# Apply any pending migrations to the runtime database
# If a migration is stuck, clear it and retry
if ! su-exec node ./node_modules/.bin/prisma migrate deploy; then
  echo "Migration deploy failed, clearing stuck migrations..."
  sqlite3 "${DATA_DIR}/project-manager.db" \
    "DELETE FROM _prisma_migrations WHERE finished_at IS NULL AND rolled_back_at IS NULL;"
  echo "Retrying migration deploy..."
  su-exec node ./node_modules/.bin/prisma migrate deploy
fi

# Ensure system labels have correct colors
su-exec node npx tsx prisma/seed.ts

exec su-exec node node server.js
