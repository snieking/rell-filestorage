"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class File {
    constructor(path, data) {
        this.path = path;
        this.data = data;
    }
    static fromPath(path) {
        return new File(path, fs_1.readFileSync(path));
    }
}
exports.default = File;
