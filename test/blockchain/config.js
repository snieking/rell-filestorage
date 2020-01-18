// @ts-ignore
const config = {};

config.communityFilechainOwnerPrivateKey = "2132333435363738393031323334353637383930313233343536373839303131";
config.adminPrivateKey = "3132333435363738393031323334353637383930313233343536373839303131";

config.filehubNodeApiUrl = "http://127.0.0.1:7740";
config.filehubRID = process.env.REACT_APP_FILEHUB_BRID;

config.filechainNodeApiUrl = "http://127.0.0.1:7741";
config.filechainRID = process.env.REACT_APP_CHROMIA_FILECHAIN_BRID;

config.newFilechainNodeApiUrl = "http://127.0.0.1:7742";
config.newFilechainRID = process.env.REACT_APP_CHROMIA_MIGRATION_FILECHAIN_BRID;

config.communityFilechainNodeApiUrl = "http://127.0.0.1:7743";
config.communityFilechainRID = process.env.REACT_APP_COMMUNITY_FILECHAIN_BRID;

config.communityMigrationFilechainNodeApiUrl = "http://127.0.0.1:7744";
config.communityMigrationFilechainRID = process.env.REACT_APP_COMMUNITY_MIGRATION_FILECHAIN_BRID;

module.exports = config;