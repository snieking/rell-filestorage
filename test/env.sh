#!/usr/bin/env bash

FILEHUB_BRID=$(docker exec -i filehub cat /usr/src/filehub/rell/target/blockchains/0/brid.txt)
echo "Creating .env with filehub brid: ${FILEHUB_BRID}"
echo "FILEHUB_BRID=${FILEHUB_BRID}" > .env
echo "REACT_APP_FILEHUB_BRID=${FILEHUB_BRID}" >> .env