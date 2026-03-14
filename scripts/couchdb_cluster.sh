#!/bin/bash

BASE_PORT="2100"
PRIMARY="0"
SECONDARIES="1 2 3"

# Starts up the four instances of couchdb which is going to form a four node cluster
# Uses a relative path since otherwise docker would not find the compose file
docker compose -f ../docker/docker-compose-couchdb.yaml up -d

sleep 5

# Initializes a cluster by enabling it and it will consist of four nodes (node_count)
# It could respond with a bad_request, and it means that the cluster has already been enabled
# This setup request is sent to the primary node
for NODE_ID in $PRIMARY
do
    curl -X POST "http://user:password@localhost:${BASE_PORT}${NODE_ID}/_cluster_setup" \
    -H "Content-Type: application/json" \
    -d '{
        "action": "enable_cluster",
        "bind_address": "0.0.0.0",
        "username": "user",
        "password": "password", 
        "node_count": "4"
    }'
done