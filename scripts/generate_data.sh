#!/bin/bash

numOfImages=$1

cd ../data

chmod +x hospital_images.js

./hospital_images.js $numOfImages

echo "Created data!"