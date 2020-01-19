#!/usr/bin/env bash

set -e

docker-compose down --rmi local

cd ../filehub
docker build -t snieking/filehub .

cd ../filechain
docker build -t snieking/filechain .

cd ../test
docker-compose up -d postgres
docker-compose up -d filehub

cd ../client
npm install
npm run build

sleep 5

cd ../test
./env.sh
docker-compose up -d

npm install

sleep 5

./add-filechain-to-env.sh