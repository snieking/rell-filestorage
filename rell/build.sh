#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

set -eu

rm -rf target

echo "Compiling Filestorage blockchains"
postchain-node/multigen.sh run.xml --source-dir=src --output-dir=target
echo "Successfully compiled Filechain blockchain"

FILEHUB_BRID=$(cat target/blockchains/1/brid.txt)
echo "Creating .env file with filehub brid: ${FILEHUB_BRID}"
echo "REACT_APP_FILEHUB_BRID=${FILEHUB_BRID}" > ../test/.env

FILECHAIN_BRID=$(cat target/blockchains/2/brid.txt)
echo "Adding to .env filechain brid: ${FILECHAIN_BRID}"
echo "REACT_APP_FILECHAIN_BRID=${FILECHAIN_BRID}" >> ../test/.env