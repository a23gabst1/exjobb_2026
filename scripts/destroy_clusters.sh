#!/bin/bash

DB=$1

echo "Destroying services..."

# Destroys all the services set up in the compose files
if [ "${DB}" = "couchdb" ]; then
    docker compose -f docker/docker-compose-couchdb.yaml down -v
else
    docker compose -f docker/docker-compose-mongo-config.yaml down

    docker compose -f docker/docker-compose-mongo-shards.yaml down

    docker compose -f docker/docker-compose-mongo-mongos.yaml down
fi

echo "Done!"