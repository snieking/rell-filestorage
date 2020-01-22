"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const read_chunk_1 = require("read-chunk");
class FsFile {
    constructor(name, data) {
        this.name = name;
        if (data != null) {
            this.data = data;
            this.chunks = FsFile.sliceIntoChunks(data);
            this.size = data.length;
        }
        else {
            const stats = fs.statSync(name);
            this.size = stats.size;
        }
    }
    static fromPath(name) {
        return new FsFile(name, undefined);
    }
    static fromData(name, data) {
        return new FsFile(name, data);
    }
    static fromChunks(name, chunks) {
        const dataChunks = chunks
            .sort((a, b) => a.idx - b.idx)
            .map((c) => c.data);
        return new FsFile(name, Buffer.concat(dataChunks));
    }
    static sliceIntoChunks(data) {
        const nrOfChunks = Math.ceil(data.length / FsFile.BYTES);
        const chunks = [];
        for (let i = 0; i < nrOfChunks; i++) {
            chunks.push(data.slice(i * FsFile.BYTES, (i + 1) * FsFile.BYTES));
        }
        return chunks;
    }
    getChunk(index) {
        if (this.data != null) {
            return new Promise((resolve, error) => this.chunks != null ? resolve(this.chunks[index]) : error("Chunks undefined"));
        }
        else {
            return read_chunk_1.default(this.name, index * FsFile.BYTES, FsFile.BYTES);
        }
    }
    readChunkSync(index) {
        if (this.chunks != null) {
            return this.chunks[index];
        }
        else {
            return read_chunk_1.default.sync(this.name, index * FsFile.BYTES, FsFile.BYTES);
        }
    }
    numberOfChunks() {
        return Math.ceil(this.size / FsFile.BYTES);
    }
    readFullData() {
        const dataChunks = [];
        for (let i = 0; i < this.numberOfChunks(); i++) {
            dataChunks.push(this.readChunkSync(i));
        }
        return Buffer.concat(dataChunks);
    }
}
exports.default = FsFile;
FsFile.BYTES = 100000;
