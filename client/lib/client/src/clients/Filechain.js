"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pcl = require("postchain-client");
class Filechain {
    constructor(nodeApiUrl, brid) {
        this.restClient = pcl.restClient.createRestClient(nodeApiUrl, brid, 10);
        this.gtxClient = pcl.gtxClient.createClient(this.restClient, Buffer.from(brid, "hex"), []);
    }
    storeChunkData(user, data) {
        const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
        tx.addOperation("add_chunk_data", data);
        tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
        return tx.postAndWaitConfirmation();
    }
    ;
    removeChunkData(user, data) {
        const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
        tx.addOperation("remove_chunk_data", Buffer.from(data, "utf8"));
        tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
        return tx.postAndWaitConfirmation();
    }
    ;
    removeChunkDataByHash(user, hash) {
        const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
        tx.addOperation("remove_chunk_data_by_hash", hash);
        tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
        return tx.postAndWaitConfirmation();
    }
    getFileByHash(user, hash) {
        return this.restClient.query("get_file", { hash: hash.toString("hex") });
    }
}
exports.default = Filechain;
