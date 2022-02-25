#!/usr/bin/env bash

set -ex

PACKAGE=rellr-0.10.8-dist.tar.gz

echo "Downloading ${PACKAGE}"
curl -o ${PACKAGE} -L http://www.chromia.dev/rellr/${PACKAGE}
tar -zxvf ${PACKAGE}
rm ${PACKAGE}