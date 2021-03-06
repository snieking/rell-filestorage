#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

echo "Compiling Filehub into $(pwd)/target"
postchain-node/multigen.sh run.xml --source-dir=src --output-dir=target
echo "Successfully compiled Filehub blockchain"