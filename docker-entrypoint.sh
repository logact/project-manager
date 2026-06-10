#!/bin/sh
set -e

if [ ! -f /var/lib/project-manager/data/project-manager.db ]; then
  mkdir -p /var/lib/project-manager/data
  cp /app/project-manager.db /var/lib/project-manager/data/project-manager.db
fi

exec node server.js
