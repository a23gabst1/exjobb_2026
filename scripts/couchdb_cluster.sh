#!/bin/bash

BASE_PORT="2100"
PRIMARY="0"
SECONDARIES="1 2 3"

# Starts up the four instances of couchdb which is going to form a four node cluster
# Uses a relative path since otherwise docker would not find the compose file
docker compose -f ../docker/docker-compose-couchdb.yaml up -d

sleep 5