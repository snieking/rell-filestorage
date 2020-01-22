"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("./config.js");
const DirectoryService_1 = require("../../client/src/clients/DirectoryService");
const ft3_lib_1 = require("ft3-lib");
const Filehub_1 = require("fs-client/lib/clients/Filehub");
const chain_connection_info_1 = require("ft3-lib/dist/lib/ft3/chain-connection-info");
// Filehub chain
const FILEHUB_NODE_API_URL = config.filehubNodeApiUrl;
exports.FILEHUB_BLOCKCHAIN_RID = config.filehubRID;
const FILECHAIN_NODE_API_URL = config.filechainNodeApiUrl;
const FILECHAIN_BLOCKCHAIN_RID = config.filechainRID;
exports.CHAINS = [
    new chain_connection_info_1.default(Buffer.from(exports.FILEHUB_BLOCKCHAIN_RID, "hex"), FILEHUB_NODE_API_URL),
    new chain_connection_info_1.default(Buffer.from(FILECHAIN_BLOCKCHAIN_RID, "hex"), FILECHAIN_NODE_API_URL)
];
exports.FILEHUB = new Filehub_1.default(FILEHUB_NODE_API_URL, exports.FILEHUB_BLOCKCHAIN_RID, exports.CHAINS);
exports.FILEHUB_BLOCKCHAIN = ft3_lib_1.Blockchain.initialize(Buffer.from(exports.FILEHUB_BLOCKCHAIN_RID, "hex"), new DirectoryService_1.default(exports.CHAINS));
