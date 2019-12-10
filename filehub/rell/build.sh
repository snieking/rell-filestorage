#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

set -eu

rm -rf target

echo "Compiling Filehub"
postchain-node/multigen.sh run.xml --source-dir=src --output-dir=target
echo "Successfully compiled Filechain blockchain"

FILEHUB_BRID=$(cat target/blockchains/1/brid.txt)
echo "Creating .env file with filehub brid: ${FILEHUB_BRID}"
echo "REACT_APP_FILEHUB_BRID=${FILEHUB_BRID}" >> ../../test/.env