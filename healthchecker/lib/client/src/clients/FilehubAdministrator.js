"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ft3_lib_1 = require("ft3-lib");
const AbstractAdministrator_1 = require("./AbstractAdministrator");
class FilehubAdministrator extends AbstractAdministrator_1.default {
    constructor(filehub) {
        super(filehub);
    }
    /**
     * Registers the admin user, this operation is only valid when there are no other admins.
     */
    registerAdmin(user) {
        return this.filehub.executeOperation(user, ft3_lib_1.op("register_admin", user.authDescriptor.id));
    }
    /**
     * Registers a Filechain to persist files in.
     *
     * @param user that is an admin of the filehub.
     * @param rid of the filechain.
     */
    registerFilechain(user, rid) {
        return this.filehub.executeOperation(user, ft3_lib_1.op("add_chromia_filechain", user.authDescriptor.id, rid));
    }
    /**
     * List community filechain locations.
     */
    listCommunityFilechainLocations() {
        return this.filehub.executeQuery("list_community_filechain_locations", {});
    }
    /**
     * Gets a Filechain from a filechain location.
     */
    getFilechain(filechainLocation) {
        return this.filehub.initFilechainClient(filechainLocation);
    }
    /**
     * Returns a list of active Filechain applications.
     */
    listFilechainApplications() {
        return this.filehub.executeQuery("list_filechain_applications", {});
    }
    /**
     * Approves a Filechain application.
     */
    approveCommunityFilechainApplication(user, brid) {
        return this.filehub.executeOperation(user, ft3_lib_1.op("approve_filechain_application", user.authDescriptor.id, brid));
    }
    /**
     * Rejects a Filechain application.
     */
    rejectCommunityFilechainApplication(user, brid) {
        return this.filehub.executeOperation(user, ft3_lib_1.op("reject_filechain_application", user.authDescriptor.id, brid));
    }
    /**
     * Report a Filechain as offline.
     */
    reportFilechainOffline(user, brid) {
        return this.reportFilechain(user, "report_filechain_offline", brid);
    }
    /**
     * Report a Filechain as online.
     */
    reportFilechainOnline(user, brid) {
        return this.reportFilechain(user, "report_filechain_online", brid);
    }
    reportFilechain(user, operation, brid) {
        return this.filehub.executeOperation(user, ft3_lib_1.op(operation, user.authDescriptor.id, brid), true);
    }
}
exports.default = FilehubAdministrator;
