#!/bin/sh
set -e

NETWORK_NAME="pm-network"

# Clean up existing containers and network
docker rm -f pm-backend pm-frontend 2>/dev/null || true
docker network rm "$NETWORK_NAME" 2>/dev/null || true

# Build both images
docker build -f Dockerfile.backend -t pm-backend .
docker build -f Dockerfile.frontend -t pm-frontend .

# Create shared network so containers can resolve each other by name
docker network create "$NETWORK_NAME" 2>/dev/null || true

# Run backend (API on port 8082)
docker run -d \
  --name pm-backend \
  --network "$NETWORK_NAME" \
  -p 8082:8082 \
  -v "$(pwd)/data:/app/data" \
  -e CORS_ORIGIN=* \
  --restart unless-stopped \
  pm-backend

# Run frontend (page on port 8081)
docker run -d \
  --name pm-frontend \
  --network "$NETWORK_NAME" \
  -p 8081:80 \
  --restart unless-stopped \
  pm-frontend

echo ""
echo "Frontend: http://localhost:8081"
echo "API:      http://localhost:8082"
