#!/bin/bash

DATABASE=$1

# Exits the process if one of the necessary arguments are empty
if [ -z "${DATABASE}" ]; then
    echo "Image count or database arguments cannot be empty"
    exit 1
fi

# Exits the process if the users did not type in one of the databases below (exactly with lowercase)
if [ "${DATABASE}" != "mongodb" ] && [ "${DATABASE}" != "couchdb" ]; then
    echo "'mongodb' or 'couchdb' (exact)"
    exit 1
fi

cd scripts/

chmod +x ./generate_data.sh ./mongodb_cluster.sh ./couchdb_cluster.sh

./generate_data.sh

# Only one of the databases can run since it goes over the memory and CPU usage limit on higher number of documents on Docker Desktop
if [ "$DATABASE" = "mongodb" ]; then
    ./mongodb_cluster.sh
else 
    ./couchdb_cluster.sh 99
fi

cd ..

DB=$DATABASE node server.js

sleep 3

find ./chunks -type f -iname "chunk_*" | xargs rm -rv