#!/bin/sh
set -e

mkdir -p /var/lib/project-manager/data

if [ ! -f /var/lib/project-manager/data/project-manager.db ]; then
  cp /app/project-manager.db /var/lib/project-manager/data/project-manager.db
fi

chown -R node:node /var/lib/project-manager/data

exec su-exec node node server.js
