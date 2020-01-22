"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, colorize, printf, splat, label } = winston_1.format;
const logger = winston_1.createLogger({
    format: combine(timestamp(), colorize(), splat(), label({ label: "test" }), printf(log => `${log.timestamp} [${log.label} - ${log.level}]: ${log.message}`)),
    transports: [
        new winston_1.transports.Console({
            level: process.env.NODE_ENV === "production" ? "info" : "debug"
        })
    ],
    exitOnError: false
});
exports.default = logger;
