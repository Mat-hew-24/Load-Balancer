#!/bin/bash

pkill -f singleserver.js
pkill -f server.js
sleep 1

PORTS=$(jq -r '.servers[].port' config.json)

for port in $PORTS; do
    node singleserver.js $port &
    sleep 0.2
done

node server.js &
sleep 1

while true; do
  curl -s http://localhost:8080
  echo
  sleep 1
done
