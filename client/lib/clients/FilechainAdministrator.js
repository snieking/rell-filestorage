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
const ft3_lib_1 = require("ft3-lib");
const logger_1 = require("../logger");
const AbstractAdministrator_1 = require("./AbstractAdministrator");
class FilechainAdministrator extends AbstractAdministrator_1.default {
    constructor(filehub) {
        super(filehub);
    }
    /**
     * Sends an application for a Filechain to join the pool of COMMUNITY Filechains.
     */
    sendCommunityFilechainApplication(user, brid, nodeUrl, sourceCodeUrl) {
        return this.filehub.executeOperation(user, ft3_lib_1.op("add_filechain_application", user.authDescriptor.id, brid, nodeUrl, sourceCodeUrl));
    }
    /**
     * Requests payment for data stored in your Filechains.
     * Data is only able to be paid out after it has been persisted for 30 days or more.
     */
    requestPayment(user) {
        return this.filehub.executeOperation(user, ft3_lib_1.op("request_payment", user.authDescriptor.id));
    }
    /**
     * Migrates data stored in the Filechain to another one.
     */
    migrateFilechain(user, fromBrid) {
        return __awaiter(this, void 0, void 0, function* () {
            let timestamp = FilechainAdministrator.FIRST_TIMESTAMP;
            logger_1.default.info("Starting migration from filechain: %s", fromBrid);
            for (;;) {
                const fileTimestamps = yield this.getFileTimestamps(fromBrid, FilechainAdministrator.FIRST_TIMESTAMP);
                for (const fileTimestamp of fileTimestamps) {
                    yield this.filehub.executeOperation(user, ft3_lib_1.op("migrate_file", user.authDescriptor.id, fileTimestamp.name, fileTimestamp.timestamp, fromBrid));
                    const chunkHashes = yield this.getMigratableChunkHashesByName(fromBrid, fileTimestamp);
                    for (const chunkHash of chunkHashes) {
                        yield this.filehub.copyChunkDataToOtherBrid(user, chunkHash);
                    }
                    yield this.filehub.executeOperation(user, ft3_lib_1.op("mark_file_migrated", user.authDescriptor.id, fileTimestamp.name, fileTimestamp.timestamp, fromBrid));
                }
                if (fileTimestamps.length < AbstractAdministrator_1.default.PAGE_SIZE) {
                    break;
                }
                else {
                    timestamp = fileTimestamps[fileTimestamps.length - 1].timestamp;
                }
            }
        });
    }
    /**
     * Disables a Filechain.
     */
    disableFilechain(user, brid) {
        return this.filehub.executeOperation(user, ft3_lib_1.op("disable_filechain", user.authDescriptor.id, brid));
    }
}
exports.default = FilechainAdministrator;
FilechainAdministrator.FIRST_TIMESTAMP = Date.UTC(2019, 1);
