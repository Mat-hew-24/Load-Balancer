#!/bin/bash

PORTS=$(jq -r '.servers[].port' config.json)

for port in $PORTS; do
    PID=$(lsof -ti tcp:$port)

    if [ -n "$PID" ]; then
        echo "Killing server on port $port (PID: $PID)"
        kill -9 $PID
    else
        echo "No server running on port $port"
    fi
done

