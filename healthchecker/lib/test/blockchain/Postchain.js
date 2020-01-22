"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("./config.js");
const DirectoryService_1 = require("../../client/src/clients/DirectoryService");
const ft3_lib_1 = require("ft3-lib");
const Filehub_1 = require("fs-client/lib/clients/Filehub");
const chain_connection_info_1 = require("ft3-lib/dist/lib/ft3/chain-connection-info");
const users_1 = require("../tests/utils/users");
const logger_1 = require("../logger");
const FilehubAdministrator_1 = require("../../client/lib/clients/FilehubAdministrator");
const FilechainAdministrator_1 = require("../../client/lib/clients/FilechainAdministrator");
// Filehub chain
const FILEHUB_NODE_API_URL = config.filehubNodeApiUrl;
exports.FILEHUB_BLOCKCHAIN_RID = config.filehubRID;
const FILECHAIN_NODE_API_URL = config.filechainNodeApiUrl;
const FILECHAIN_BLOCKCHAIN_RID = config.filechainRID;
const NEW_FILECHAIN_NODE_API_URL = config.newFilechainNodeApiUrl;
const NEW_FILECHAIN_BLOCKCHAIN_RID = config.newFilechainRID;
exports.CHAINS = [
    new chain_connection_info_1.default(Buffer.from(exports.FILEHUB_BLOCKCHAIN_RID, "hex"), FILEHUB_NODE_API_URL),
    new chain_connection_info_1.default(Buffer.from(FILECHAIN_BLOCKCHAIN_RID, "hex"), FILECHAIN_NODE_API_URL),
    new chain_connection_info_1.default(NEW_FILECHAIN_BLOCKCHAIN_RID != undefined ? Buffer.from(NEW_FILECHAIN_BLOCKCHAIN_RID, "hex") : Buffer.alloc(0), NEW_FILECHAIN_NODE_API_URL)
];
exports.FILEHUB = new Filehub_1.default(FILEHUB_NODE_API_URL, exports.FILEHUB_BLOCKCHAIN_RID, exports.CHAINS);
exports.FILEHUB_ADMININISTRATOR = new FilehubAdministrator_1.default(exports.FILEHUB);
exports.FILECHAIN_ADMINISTRATOR = new FilechainAdministrator_1.default(exports.FILEHUB);
exports.FILEHUB_BLOCKCHAIN = ft3_lib_1.Blockchain.initialize(Buffer.from(exports.FILEHUB_BLOCKCHAIN_RID, "hex"), new DirectoryService_1.default(exports.CHAINS));
exports.adminUser = () => {
    return users_1.createFt3User(config.adminPrivateKey);
};
let initialized;
exports.initFilehub = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!initialized) {
        initialized = true;
        try {
            const admin = yield exports.adminUser();
            yield exports.FILEHUB_ADMININISTRATOR.registerAdmin(admin);
            yield exports.FILEHUB_ADMININISTRATOR.registerFilechain(admin, config.filechainRID);
        }
        catch (error) {
            logger_1.default.info("Error initializing filehub, perhaps it already was initialized");
        }
    }
    else {
        logger_1.default.info("Filehub already initialized");
        yield new Promise(resolve => setTimeout(resolve, 5000));
    }
});
