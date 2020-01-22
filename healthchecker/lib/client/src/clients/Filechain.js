"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pcl = require("postchain-client");
const logger_1 = require("../logger");
const crypto_1 = require("../utils/crypto");
class Filechain {
    constructor(nodeApiUrl, brid) {
        this.restClient = pcl.restClient.createRestClient(nodeApiUrl, brid, 10);
        this.gtxClient = pcl.gtxClient.createClient(this.restClient, Buffer.from(brid, "hex"), []);
        this.brid = brid;
    }
    storeChunkData(user, data) {
        const hash = crypto_1.hashData(data).toString("hex");
        logger_1.default.debug("Storing data for hash: %s, in filechain: %s", hash, this.brid);
        const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
        tx.addOperation("add_chunk_data", data);
        tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
        return tx.postAndWaitConfirmation().catch((error) => {
            return this.chunkHashExists(hash).then((exists) => {
                if (!exists) {
                    if (error.message.includes("500")) {
                        logger_1.default.info("Unable to store chunk data for hash: %s, it may be due to a transaction is already pending with the exact same data which means no more action is required. %O", hash, error);
                    }
                    else {
                        throw error;
                    }
                }
                else {
                    logger_1.default.debug("Chunk already existed for hash: %s", hash);
                }
            });
        });
    }
    chunkHashExists(hash) {
        return this.restClient.query("chunk_hash_exists", { hash });
    }
    getChunkDataByHash(hash) {
        logger_1.default.debug("Retrieving chunk data by hash %s from filechain: %s", hash, this.brid);
        return this.restClient.query("get_chunk", { hash });
    }
}
exports.default = Filechain;
