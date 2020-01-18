CHROMIA_FILECHAIN_BRID=$(docker exec -i chromia-filechain cat /usr/src/filechain/rell/target/blockchains/1/brid.txt)
echo "Adding BRID: ${CHROMIA_FILECHAIN_BRID} as Chromia Filechain"
echo "REACT_APP_CHROMIA_FILECHAIN_BRID=${CHROMIA_FILECHAIN_BRID}" >> .env

CHROMIA_MIGRATION_FILECHAIN_BRID=$(docker exec -i chromia-migration-filechain cat /usr/src/filechain/rell/target/blockchains/2/brid.txt)
echo "Adding BRID: ${CHROMIA_MIGRATION_FILECHAIN_BRID} as Chromia Migration Filechain"
echo "REACT_APP_CHROMIA_MIGRATION_FILECHAIN_BRID=${CHROMIA_MIGRATION_FILECHAIN_BRID}" >> .env

COMMUNITY_FILECHAIN_BRID=$(docker exec -i community-filechain cat /usr/src/filechain/rell/target/blockchains/3/brid.txt)
echo "Adding BRID: ${COMMUNITY_FILECHAIN_BRID} as Community Filechain"
echo "REACT_APP_COMMUNITY_FILECHAIN_BRID=${COMMUNITY_FILECHAIN_BRID}" >> .env

COMMUNITY_MIGRATION_FILECHAIN_BRID=$(docker exec -i community-migration-filechain cat /usr/src/filechain/rell/target/blockchains/4/brid.txt)
echo "Adding BRID: ${COMMUNITY_MIGRATION_FILECHAIN_BRID} as Community Migration Filechain"
echo "REACT_APP_COMMUNITY_MIGRATION_FILECHAIN_BRID=${COMMUNITY_MIGRATION_FILECHAIN_BRID}" >> .env