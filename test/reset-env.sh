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

sleep 10
./env.sh

docker-compose up -d

sleep 15
./add-filechain-to-env.sh