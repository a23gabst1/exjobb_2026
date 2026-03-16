#!/bin/bash

IMAGE_COUNT=$1

cd scripts/

chmod +x ./generate_data.sh ./mongodb_cluster.sh ./couchdb_cluster.sh

./generate_data.sh $IMAGE_COUNT

./mongodb_cluster.sh

./couchdb_cluster.sh $IMAGE_COUNT

cd ..

DOC_SIZE=$IMAGE_COUNT node server.js

sleep 3

find ./chunks -type f -iname "chunk_*" | xargs rm -rv