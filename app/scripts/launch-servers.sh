#!/bin/bash

PORTS=$(jq -r '.servers[].port' config.json)

echo "Launching backend servers..."

for port in $PORTS; do
    echo "Starting server on port $port"
    node singleserver.js $port &
    sleep 0.3
done


