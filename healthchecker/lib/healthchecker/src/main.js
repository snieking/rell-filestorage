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
const FilehubAdministrator_1 = require("../../client/src/clients/FilehubAdministrator");
const Filehub_1 = require("../../client/src/clients/Filehub");
const ft3_lib_1 = require("ft3-lib");
const logger_1 = require("./logger");
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const NODE_URL = process.env.NODE_URL;
const BRID = process.env.FILEHUB_BRID;
console.log("Using admin key: ", ADMIN_PRIVATE_KEY);
const FILEHUB = new Filehub_1.default(NODE_URL, BRID, []);
const FILEHUB_ADMIN = new FilehubAdministrator_1.default(FILEHUB);
FILEHUB_ADMIN.listCommunityFilechainLocations()
    .then(locations => locations.every(value => checkFilechainOnline(value)));
const checkFilechainOnline = (filechainLocation) => __awaiter(void 0, void 0, void 0, function* () {
    const brid = filechainLocation.brid.toString("hex");
    const location = filechainLocation.location;
    logger_1.default.info("Checking if %s at %s is online", brid, location);
    const user = yield exports.createFt3User(ADMIN_PRIVATE_KEY);
    const filechain = FILEHUB_ADMIN.getFilechain(filechainLocation);
    return filechain.chunkHashExists("FF").catch(error => {
        if (error != null) {
            logger_1.default.warn("Reporting filechain %s at location %s offline due to %O", brid, location, error);
            return FILEHUB_ADMIN.reportFilechainOffline(user, brid);
        }
    });
});
exports.createFt3User = (privkey) => {
    const walletKeyPair = new ft3_lib_1.KeyPair(privkey);
    const walletAuthDescriptor = new ft3_lib_1.SingleSignatureAuthDescriptor(walletKeyPair.pubKey, [
        ft3_lib_1.FlagsType.Account,
        ft3_lib_1.FlagsType.Transfer
    ]);
    return new ft3_lib_1.User(walletKeyPair, walletAuthDescriptor);
};
