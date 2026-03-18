#!/bin/bash

echo "Destroying services..."

# Destroys all the services set up in the compose files
docker compose -f docker/docker-compose-couchdb.yaml down -v

docker compose -f docker/docker-compose-mongo-config.yaml down

docker compose -f docker/docker-compose-mongo-shards.yaml down

docker compose -f docker/docker-compose-mongo-mongos.yaml down

echo "Done!"