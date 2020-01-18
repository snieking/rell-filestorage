#!/bin/bash

set -eu

exec postchain-node/postchain.sh run-node -cid ${CHAIN_IID} -nc target/node-config.properties
