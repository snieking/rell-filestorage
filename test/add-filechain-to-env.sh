FILECHAIN1_BRID=$(docker exec -i filechain1 cat /usr/src/filechain/rell/target/blockchains/1/brid.txt)
echo "Adding BRID: ${FILECHAIN1_BRID} as Filechain1"
echo "REACT_APP_FILECHAIN1_BRID=${FILECHAIN1_BRID}" >> .env

FILECHAIN2_BRID=$(docker exec -i filechain2 cat /usr/src/filechain/rell/target/blockchains/2/brid.txt)
echo "Adding BRID: ${FILECHAIN2_BRID} as Filechain2"
echo "REACT_APP_FILECHAIN2_BRID=${FILECHAIN2_BRID}" >> .env