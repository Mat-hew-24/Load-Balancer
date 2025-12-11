#!/bin/bash

read -p "Enter port to kill: " PORT

if [ -z "$PORT" ]; then
    echo "No port provided."
    exit 1
fi

pkill -f "singleserver.js $PORT"
echo "success"
