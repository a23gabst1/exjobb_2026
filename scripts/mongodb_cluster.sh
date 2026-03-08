#!/bin/bash

echo "Starting up config server containers"

# Have to change directory otherwise it will not find the compose file
cd ..

# Starts up the config services in detach mode
# -f specifies the name and path of the many compose files
docker compose -f docker/docker-compose-mongo-config.yaml up -d

# Make sures that every service is ready to accept commands
for service in configs1 configs2 configs3; do
    until docker exec $service mongosh --eval "db.adminCommand('ping')" &> /dev/null; do
        sleep 2
    done
done

echo "Config Servers are ready"

# Creates a replica set for the config servers
docker exec configs1 mongosh --eval '
rs.initiate({
    _id: "cfgrs",
    configsvr: true,
    members: [
        {_id: 0, host: "configs1:27017"},
        {_id: 1, host: "configs2:27017"},
        {_id: 2, host: "configs3:27017"}
    ]
});
'

echo "Config server replica set initialized"