#!/bin/bash

read -p "Enter port to launch: " PORT
if [ -z "$PORT" ]; then
    echo "No port provided."
    exit 1
fi

node singleserver.js $PORT &>/dev/null &  #keeps the process running in background
echo "$PORT running"
