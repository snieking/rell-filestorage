"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractAdministrator_1 = require("./AbstractAdministrator");
const ft3_lib_1 = require("ft3-lib");
class CommonFilechainAdministrator extends AbstractAdministrator_1.default {
    constructor(filehub) {
        super(filehub);
    }
    sendFilechainApplication(user, brid, nodeUrl, sourceCodeUrl) {
        return this.filehub.executeOperation(user, ft3_lib_1.op("add_filechain_application", user.authDescriptor.id, brid, nodeUrl, sourceCodeUrl));
    }
}
exports.default = CommonFilechainAdministrator;
