#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

set -eu

rm -rf target

echo "Compiling Filechain"
../../filechain/rell/postchain-node/multigen.sh run.xml --source-dir=src --output-dir=target
echo "Successfully compiled Filechain blockchain"

FILECHAIN_BRID=$(cat target/blockchains/3/brid.txt)
echo "Adding to .env filechain brid: ${FILECHAIN_BRID}"
echo "REACT_APP_NEW_FILECHAIN_BRID=${FILECHAIN_BRID}" >> ../../test/.env