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
const crypto_js_1 = require("crypto-js");
const ft3_lib_1 = require("ft3-lib");
const crypto_1 = require("../utils/crypto");
const DirectoryService_1 = require("./DirectoryService");
const fs = require("fs");
const logger_1 = require("../logger");
const Chunk_1 = require("../models/Chunk");
const FsFile_1 = require("../models/FsFile");
const Filechain_1 = require("./Filechain");
class Filehub {
    constructor(nodeApiUrl, brid, chainConnectionInfo) {
        this.brid = brid;
        this.nodeApiUrl = nodeApiUrl;
        this.chains = chainConnectionInfo;
        this.blockchain = ft3_lib_1.Blockchain.initialize(Buffer.from(brid, "hex"), new DirectoryService_1.default(chainConnectionInfo));
    }
    static encrypt(data, passphrase) {
        return crypto_js_1.AES.encrypt(data, passphrase).toString();
    }
    static decrypt(data, passphrase) {
        return crypto_js_1.AES.decrypt(data, passphrase).toString(crypto_js_1.enc.Utf8);
    }
    static getChunkDataByHash(filechain, hash) {
        return filechain.getChunkDataByHash(hash.toString("hex"));
    }
    static bufferArray(array, buffer) {
        const arrayOfArrays = [];
        for (let i = 0; i < array.length; i += buffer) {
            arrayOfArrays.push(array.slice(i, i + buffer));
        }
        return arrayOfArrays;
    }
    /**
     * Executes a operation towards the Filehub.
     *
     * @param user to sign the operation.
     * @param operation to perform.
     */
    executeOperation(user, operation, addNop) {
        return this.blockchain.then(bc => {
            const trxBuilder = bc.transactionBuilder().add(operation);
            if (addNop) {
                trxBuilder.add(ft3_lib_1.nop());
            }
            logger_1.default.debug("Executing %O", operation);
            return trxBuilder
                .buildAndSign(user)
                .post()
                .catch(error => {
                logger_1.default.error("Error executing operation %s %O", operation.name, error);
                throw error;
            });
        });
    }
    /**
     * Queries the Filehub for data.
     *
     * @param query the identifier of the query.
     * @param data to provide in the query.
     */
    executeQuery(query, data) {
        return this.blockchain.then(bc => {
            logger_1.default.debug("Executing query '%s' with data: %O", query, data);
            return bc.query(query, data);
        });
    }
    /**
     * Purchases a new voucher if possible.
     * It is only possible to buy a new voucher when there is less than a day left on your current one.
     */
    purchaseVoucher(user, plan) {
        return __awaiter(this, void 0, void 0, function* () {
            const bc = yield this.blockchain;
            return bc
                .transactionBuilder()
                .add(ft3_lib_1.nop())
                .add(ft3_lib_1.op("purchase_voucher", user.authDescriptor.id, plan))
                .buildAndSign(user)
                .post();
        });
    }
    /**
     * Stores a file. Contacts the Filehub and allocates a chunk, and then persists the data in the correct filechain.
     *
     * @param passphrase optional options for storing the file.
     */
    storeFile(user, file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileName = options !== undefined && options && options.passphrase !== undefined && options.filenameEncrypted
                ? Filehub.encrypt(file.name, options.passphrase)
                : file.name;
            yield this.executeOperation(user, ft3_lib_1.op("allocate_file", user.authDescriptor.id, fileName, file.size, options && options.plan ? options.plan : "CHROMIA"));
            const filechainLocations = yield this.getFileLocation(user, fileName, 3);
            const promises = [];
            filechainLocations.forEach(filechainLocation => promises.push(this.storeChunks(user, file, filechainLocation, fileName, options)));
            const result = yield Promise.all(promises);
            return result;
        });
    }
    /**
     * Marks a file for removal, the chunks of the file are removed at the next Filechain migration.
     */
    removeFile(user, name, options) {
        const fileName = options !== undefined && options && options.passphrase !== undefined && options.filenameEncrypted
            ? Filehub.encrypt(name, options.passphrase)
            : name;
        return this.executeOperation(user, ft3_lib_1.op("deallocate_file", user.authDescriptor.id, fileName));
    }
    /**
     * Get file names stored by a user.
     */
    getUserFileNames(user) {
        return this.executeQuery("get_file_names", {
            descriptor_id: user.authDescriptor.hash().toString("hex")
        });
    }
    /**
     * Retrieves a file by its name.
     *
     * @param passphrase optional options for retrieving file.
     */
    getFileByName(user, name, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filechainLocations = yield this.getFileLocation(user, name, 1);
                const chunkHashes = yield this.executeQuery("get_file_chunks", {
                    descriptor_id: user.authDescriptor.hash().toString("hex"),
                    name
                });
                const filechain = this.initFilechainClient(filechainLocations[0]);
                const promises = [];
                chunkHashes.every(value => promises.push(this.getChunk(filechain, value)));
                const chunkIndexes = yield Promise.all(promises);
                if (!options || !options.passphrase) {
                    return new Promise(resolve => resolve(FsFile_1.default.fromChunks(name, chunkIndexes)));
                }
                else {
                    return new Promise(resolve => resolve(FsFile_1.default.fromChunks(options.filenameEncrypted ? Filehub.decrypt(name, options.passphrase) : name, chunkIndexes.map(chunk => new Chunk_1.ChunkIndex(Buffer.from(Filehub.decrypt(chunk.data.toString("utf8"), options.passphrase), "utf8"), chunk.idx)))));
                }
            }
            catch (error) {
                logger_1.default.info("Error retrieving file: %O", error);
                const reject = Promise.reject(error);
                return reject;
            }
        });
    }
    /**
     * Downloads a file by its name to the specified path (if provided),
     * else it will just use the filename and the current path.
     */
    downloadFileByName(user, name, path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const filechainLocations = yield this.getFileLocation(user, name, 1);
            const chunkHashes = yield this.executeQuery("get_file_chunks", {
                descriptor_id: user.authDescriptor.hash().toString("hex"),
                name
            });
            const filechain = this.initFilechainClient(filechainLocations[0]);
            const sortedArray = chunkHashes.sort((a, b) => a.idx - b.idx);
            const bufferedArray = Filehub.bufferArray(sortedArray, 10);
            const location = path
                ? path
                : options && options.passphrase && options.filenameEncrypted
                    ? Filehub.decrypt(name, options.passphrase)
                    : name;
            fs.writeFileSync(location, [], "utf8");
            for (const chunks of bufferedArray) {
                const promises = [];
                chunks.every(value => promises.push(this.getChunk(filechain, value)));
                const chunkIndexes = yield Promise.all(promises);
                const deletePromises = [];
                chunkIndexes.every(value => deletePromises.push(new Promise(resolve => resolve(fs.appendFileSync(location, options && options.passphrase
                    ? Filehub.decrypt(value.data.toString(), options.passphrase)
                    : value.data.toString())))));
                yield Promise.all(deletePromises);
            }
        });
    }
    /**
     * Retrieves all the vouchers for the specific user.
     */
    getVouchers(user) {
        return this.executeQuery("get_vouchers", {
            descriptor_id: user.authDescriptor.hash().toString("hex")
        });
    }
    /**
     * Checks if the user has an active voucher.
     */
    hasActiveVoucher(user, plan) {
        return this.executeQuery("has_active_voucher_for_timestamp", {
            descriptor_id: user.authDescriptor.hash().toString("hex"),
            timestamp: Date.now(),
            voucher_plan: plan
        });
    }
    /**
     * Returns how many bytes the user has allocated.
     */
    getAllocatedBytes(user) {
        return this.executeQuery("get_allocated_bytes", {
            descriptor_id: user.authDescriptor.hash().toString("hex")
        });
    }
    /**
     * Returns the balance of the user.
     */
    getBalance(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield this.executeQuery("ft3.get_asset_by_name", { name: "CHR" });
            return this.executeQuery("ft3.get_asset_balance", {
                account_id: user.authDescriptor.hash().toString("hex"),
                asset_id: asset[0].id.toString("hex")
            }).then((assetBalance) => assetBalance.amount);
        });
    }
    /**
     * Store chunk in the provided BRID.
     */
    copyChunkDataToOtherBrid(user, chunkHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const filechainLocation = { brid: chunkHash.brid, location: chunkHash.location };
            const oldFilechain = this.initFilechainClient(filechainLocation);
            const newLocation = yield this.executeQuery("get_active_filechain_for_hash_in_disabled_filechain", {
                brid: chunkHash.brid.toString("hex"),
                hash: chunkHash.hash
            });
            const newFilechain = this.initFilechainClient(newLocation);
            const data = yield oldFilechain.getChunkDataByHash(chunkHash.hash.toString("hex"));
            return this.persistChunkDataInFilechain(user, newFilechain, Buffer.from(data, "hex"));
        });
    }
    initFilechainClient(filechainLocation) {
        const brid = filechainLocation.brid.toString("hex");
        let location = filechainLocation.location;
        logger_1.default.debug("Initializing filechain client with brid: %s", brid);
        if (location === "@DirectoryService") {
            logger_1.default.debug("Searching for Filechain location [%s] in DirectoryService", brid);
            const chain = this.chains.find(c => {
                const directoryChain = c.chainId.toString("hex").toLocaleUpperCase();
                logger_1.default.silly("Found in DC: %s", directoryChain);
                return directoryChain === brid.toLocaleUpperCase();
            });
            if (chain == null) {
                throw new Error("Expected filechain not found in directory service");
            }
            location = chain.url;
        }
        return new Filechain_1.default(location, brid);
    }
    storeChunks(user, file, filechainLocation, fileName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const filechain = this.initFilechainClient(filechainLocation);
            const promises = [];
            for (let i = 0; i < file.numberOfChunks(); i++) {
                promises.push(file.getChunk(i).then(chunk => this.storeChunk(user, filechain, new Chunk_1.ChunkIndex(chunk, i), fileName, options)));
            }
            const result = yield Promise.all(promises);
            return result;
        });
    }
    storeChunk(user, filechain, chunkIndex, name, options) {
        const chunkToStore = options !== undefined && options.passphrase != null
            ? Buffer.from(Filehub.encrypt(chunkIndex.data.toString("utf8"), options.passphrase), "utf8")
            : chunkIndex.data;
        return this.allocateChunk(user, chunkToStore, name, chunkIndex.idx).then(() => this.persistChunkDataInFilechain(user, filechain, chunkToStore));
    }
    persistChunkDataInFilechain(user, filechain, data) {
        return filechain.storeChunkData(user, data);
    }
    getFileLocation(user, name, replicaChains) {
        return this.executeQuery("get_file_location", {
            descriptor_id: user.authDescriptor.hash().toString("hex"),
            name,
            replica_chains: replicaChains
        }).then((locations) => {
            if (locations.length < 1) {
                throw new Error("Did not receive enough active & online Filechains");
            }
            return locations;
        });
    }
    getChunk(filechain, chunkHash) {
        return Filehub.getChunkDataByHash(filechain, chunkHash.hash).then((data) => new Chunk_1.ChunkIndex(Buffer.from(data, "hex"), chunkHash.idx));
    }
    allocateChunk(user, chunk, name, index) {
        const hash = crypto_1.hashData(chunk);
        const operation = new ft3_lib_1.Operation("allocate_chunk", user.authDescriptor.id, name, hash, chunk.length, index);
        return this.executeOperation(user, operation);
    }
}
exports.default = Filehub;
