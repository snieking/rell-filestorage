// @ts-ignore
const config = {};

config.communityFilechainOwnerPrivateKey = "2132333435363738393031323334353637383930313233343536373839303131";
config.adminPrivateKey = "3132333435363738393031323334353637383930313233343536373839303131";

config.filehubNodeApiUrl = "http://localhost:7742";
config.filehubRID = process.env.REACT_APP_FILEHUB_BRID;

config.filechainNodeApiUrl = "http://localhost:7741";
config.filechainRID = process.env.REACT_APP_FILECHAIN_BRID;

config.newFilechainNodeApiUrl = "http://localhost:7743";
config.newFilechainRID = process.env.REACT_APP_NEW_FILECHAIN_BRID;

config.communityFilechainNodeApiUrl = "http://localhost:7744";
config.communityFilechainRID = process.env.REACT_APP_COMMON_FILECHAIN_BRID;

config.communityMigrationFilechainNodeApiUrl = "http://localhost:7745";
config.communityMigrationFilechainRID = process.env.REACT_APP_COMMON_MIGRATION_FILECHAIN_BRID;

module.exports = config;