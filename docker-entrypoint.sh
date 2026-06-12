#!/bin/sh
set -e

mkdir -p /var/lib/project-manager/data

if [ ! -f /var/lib/project-manager/data/project-manager.db ]; then
  cp /app/project-manager.db /var/lib/project-manager/data/project-manager.db
fi

chown -R node:node /var/lib/project-manager/data

export DATABASE_URL="${DATABASE_URL:-file:${DATA_DIR}/project-manager.db}"

# Apply any pending migrations to the runtime database
su-exec node ./node_modules/.bin/prisma migrate deploy

exec su-exec node node server.js
