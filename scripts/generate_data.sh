#!/bin/bash

numOfImages=$1

cd ../data

chmod +x patients.js hospital_images.js

./patients.js & ./hospital_images.js $numOfImages

echo "Created data!"