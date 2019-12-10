// @ts-ignore
const config = {};

config.filechainNodeApiUrl = "http://localhost:7741";
config.filehubNodeApiUrl = "http://localhost:7742";
config.filehubRID = process.env.REACT_APP_FILEHUB_BRID;
config.filechainRID = process.env.REACT_APP_FILECHAIN_BRID;

module.exports = config;