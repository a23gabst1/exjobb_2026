#!/bin/bash

BASE_PORT="2100"
PRIMARY="0"
SECONDARIES="1 2 3"
DATABASE="hospitaldb"
IMAGE_COUNT=$1

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

# The other nodes aside from the primary joins the the cluster
# The request is sent yet again to the primary and it adds another node by connecting it via the host which is the nodename (see docker/docker-compose-couchdb.yaml)
for NODE_ID in $SECONDARIES
do 
    curl -X POST "http://user:password@localhost:${BASE_PORT}${PRIMARY}/_cluster_setup" \
    -H "Content-Type: application/json" \
    -d '{
        "action": "add_node",
        "host": "'"couchdb-${NODE_ID}.exjobb"'",
        "port": 5984,
        "username": "user",
        "password": "password"
    }'
done

sleep 3 

curl "http://user:password@localhost:${BASE_PORT}${PRIMARY}/"

# It finalizes the cluster by sending it to the primary
curl -X POST "http://user:password@localhost:${BASE_PORT}${PRIMARY}/_cluster_setup" \
-H "Content-Type: application/json" \
-d '{
    "action": "finish_cluster"
}'

# Used to observe that the cluster has been finished
curl "http://user:password@localhost:${BASE_PORT}${PRIMARY}/_cluster_setup"

# Check that every node is connected and knows about each other 
# If the number of nodes is different between all_nodes and cluster_nodes, then something unexpected happened during the addition of nodes in the cluster
curl "http://user:password@localhost:${BASE_PORT}${PRIMARY}/_membership"

# Creates a database in with two shards and a replication factor of 2 
# n = replication
# q = shards
curl -X PUT "http://user:password@localhost:${BASE_PORT}${PRIMARY}/hospitaldb?n=2&q=2"

# Checking which node belong to what shard
curl -s "http://user:password@localhost:${BASE_PORT}${PRIMARY}/${DATABASE}/_shards"

# Creates an index on the fields patient_id and content_type
# Reason: CouchDB proceeds to do a full scan of the database
curl -X POST "http://user:password@localhost:${BASE_PORT}${PRIMARY}/${DATABASE}/_index" -H "Content-Type: application/json" -d '{"index": {"fields": ["patient_id", "content_type"]},"name": "image_index", "type":"json"}'

echo "CURRENT PATH: $(pwd)"

cd ../data

# Using the couchimport package to import to couchdb by first navigating to the folder where the data reside
# Specify the database, the url and the buffer
cat ./patients.json | couchimport --db $DATABASE --url "http://user:password@localhost:${BASE_PORT}${PRIMARY}" --buffer 10000

# All this below is Parallel writes 

# Based on the size of the file, it will split the file to 300K or 1M lines for each splitted file
# Creates files inside the chunks folder 
# chunk_01, chunk_02, ...
if [ "$IMAGE_COUNT" -eq 9 ]; then
    split -l 300000 -d ./hospital_images.json ../chunks/chunk_
else 
    split -l 1000000 -d ./hospital_images.json ../chunks/chunk_
fi

# Find all those chunk files 
# It spawn two processes at once running couchimport, one for each file
find ../chunks -type f -iname "chunk_*" | xargs -t -I % -P 2 couchimport --db $DATABASE --url "http://user:password@localhost:${BASE_PORT}${PRIMARY}" --buffer 5000 %