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

# Starting up the shards services
docker compose -f docker/docker-compose-mongo-shards.yaml up -d

# Same as the config servers - making sure that every service is ready
for shard in shard1-1 shard1-2 shard2-1 shard2-2; do
    until docker exec $shard mongosh --eval "db.adminCommand('ping')"; do
        sleep 2
    done
done

echo "The shards are ready"

# Creates a replica set for shard 1
docker exec shard1-1 mongosh --eval '
rs.initiate({
    _id: "shard1_rs",
    members: [
        {_id: 0, host: "shard1-1:27017"},
        {_id: 1, host: "shard1-2:27017"}
    ]
});
'

# Creates the second replica set for shard 2
docker exec shard2-1 mongosh --eval '
rs.initiate({
    _id: "shard2_rs",
    members: [
        {_id: 0, host: "shard2-1:27017"},
        {_id: 1, host: "shard2-2:27017"}
    ]
});
'
echo "The replica set for each shard have been initialized"

# Starting up the mongos router service - routes the queries
docker compose -f docker/docker-compose-mongo-mongos-yaml up -d

until docker exec mongos mongosh --eval "db.adminCommand('ping')" &> /dev/null; do
    sleep 2
done

# The application is going to connect to the mongos which will route the queries instead of connecting to shards
# Adds two shards 
# Shards the collections patients and images - uses the patient_id as the shard key
# It also uses hashing as the strategy to get even distribution
docker exec mongos mongosh --eval '
sh.addShard("shard1_rs/shard1-1:27017,shard1-2:27017");
sh.addShard("shard2_rs/shard2-1:27017,shard2-2:27017");
db = db.getSiblingDB("hospitaldb");
sh.enableSharding("hospitaldb");
sh.shardCollection("hospitaldb.patients", {patient_id: "hashed"});
sh.shardCollection("hospitaldb.images", {patient_id: "hashed"});
'