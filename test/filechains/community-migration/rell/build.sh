#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

set -eu

rm -rf target

echo "Compiling Filechain"
../../../../filechain/rell/postchain-node/multigen.sh run.xml --source-dir=../../../../filechain/rell/src --output-dir=target
echo "Successfully compiled Filechain blockchain"

FILECHAIN_BRID=$(cat target/blockchains/5/brid.txt)
echo "Adding to .env filechain brid: ${FILECHAIN_BRID}"
echo "REACT_APP_COMMON_MIGRATION_FILECHAIN_BRID=${FILECHAIN_BRID}" >> ../../../.env