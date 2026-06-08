#!/bin/sh
set -e

# Build both images
docker build -f Dockerfile.backend -t pm-backend .
docker build -f Dockerfile.frontend -t pm-frontend .

# Run backend (API on port 8082)
docker run -d \
  --name pm-backend \
  -p 8082:8082 \
  -v "$(pwd)/data:/app/data" \
  -e CORS_ORIGIN=https://your-frontend.com \
  --restart unless-stopped \
  pm-backend

# Run frontend (page on port 8081)
docker run -d \
  --name pm-frontend \
  -p 8081:80 \
  --restart unless-stopped \
  pm-frontend

echo ""
echo "Frontend: http://localhost:8081"
echo "API:      http://localhost:8082"
