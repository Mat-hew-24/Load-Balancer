#!/usr/bin/env sh
set -e

# Ensure working directory is app root
cd /app

# Start Next.js dev + load balancer (nodemon) in background
# Uses the existing package.json "dev" script
npm run dev &
BACKEND_PID=$!

# Give backend/LB some time to start
sleep 3

# Run NGINX in foreground so the container stays alive
exec nginx -g "daemon off;"
