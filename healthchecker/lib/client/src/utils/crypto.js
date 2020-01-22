"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
exports.hashData = (data) => {
    return crypto
        .createHash("sha256")
        .update(data)
        .digest();
};
