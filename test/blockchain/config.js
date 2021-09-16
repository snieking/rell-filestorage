// @ts-ignore
const config = {};

config.adminPrivateKey = "3132333435363738393031323334353637383930313233343536373839303131";

config.filehubNodeApiUrl = "http://127.0.0.1:7740";
config.filehubRID = process.env.REACT_APP_FILEHUB_BRID;

config.filechain1NodeApiUrl = "http://127.0.0.1:7741";
config.filechain1RID = process.env.REACT_APP_FILECHAIN1_BRID;

config.filechain2NodeApiUrl = "http://127.0.0.1:7742";
config.filechain2RID = process.env.REACT_APP_FILECHAIN2_BRID;

module.exports = config;
