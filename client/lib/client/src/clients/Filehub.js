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
const DirectoryService_1 = require("./DirectoryService");
const crypto_1 = require("../utils/crypto");
const Filechain_1 = require("./Filechain");
const FsFile_1 = require("../models/FsFile");
const operation_1 = require("ft3-lib/dist/lib/ft3/operation");
class Filehub {
    constructor(nodeApiUrl, brid, chainConnectionInfo) {
        this.brid = brid;
        this.nodeApiUrl = nodeApiUrl;
        this.chains = chainConnectionInfo;
        this.blockchain = ft3_lib_1.Blockchain.initialize(Buffer.from(brid, "hex"), new DirectoryService_1.default(chainConnectionInfo));
    }
    registerAdmin(ft3User) {
        const operation = new operation_1.default("register_admin", ft3User.authDescriptor.hash().toString("hex"));
        return this.blockchain.then(bc => bc.call(operation, ft3User));
    }
    ;
    registerFilechain(user, brid) {
        const operation = new operation_1.default("add_filechain", user.authDescriptor.hash().toString("hex"), brid);
        return this.blockchain.then(bc => bc.call(operation, user));
    }
    ;
    storeFile(user, file) {
        return this.allocateChunk(user, file)
            .then(() => this.getChunk(user, crypto_1.hashData(file.data)))
            .then(chunk => this.getFilechain(chunk.brid).storeChunkData(user, file.data));
    }
    storeDataEncrypted(user, file) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    getUserData(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getChunks(user).then(chunks => Promise.all(chunks.map(chunk => this.getFullFile(user, chunk))));
        });
    }
    ;
    allocateChunk(user, file) {
        const hash = crypto_1.hashData(file.data);
        const operation = new operation_1.default("allocate_chunk", user.authDescriptor.hash().toString("hex"), file.path, hash);
        return this.blockchain.then(bc => bc.call(operation, user));
    }
    ;
    getChunk(user, hash) {
        return this.blockchain.then(bc => bc.query("get_chunk", {
            hash: hash.toString("hex"),
            descriptor_id: user.authDescriptor.hash().toString("hex")
        }));
    }
    getChunks(user) {
        return this.blockchain.then(bc => bc.query("get_chunks", {
            descriptor_id: user.authDescriptor.hash().toString("hex")
        }));
    }
    ;
    getFullFile(user, chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            const filechain = this.getFilechain(chunk.brid);
            return filechain.getFileByHash(user, chunk.hash).then(data => new FsFile_1.default(chunk.path, data));
        });
    }
    getFilechain(brid) {
        const chain = this.chains.find(c => c.chainId.toString("hex").toLocaleUpperCase() === brid.toString("hex").toLocaleUpperCase());
        if (chain == null) {
            throw new Error("Expected filechain not found in directory service");
        }
        return new Filechain_1.default(chain.url, chain.chainId.toString("hex"));
    }
}
exports.default = Filehub;
