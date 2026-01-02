#!/usr/bin/env bash
set -e

echo "Installing root dependencies..."
npm i

echo "Installing app/scripts dependencies..."
cd app/scripts && npm i
cd ../..

echo "Starting backend / LB..."
npm run dev &
BACKEND_PID=$!

# Give backend some time to start
sleep 3

echo "Starting NGINX..."
sudo nginx -c $(pwd)/nginx/nginx.conf -g "daemon off;" &
NGINX_PID=$!

echo "Both services started:"
echo "Backend PID: $BACKEND_PID"
echo "NGINX PID: $NGINX_PID"

wait $BACKEND_PID
wait $NGINX_PID
