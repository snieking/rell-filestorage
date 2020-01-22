"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractAdministrator {
    constructor(filehub) {
        this.filehub = filehub;
    }
    /**
     * Retrieves allocated number of megabytes in filechain.
     */
    getAllocatedMbInFilechain(brid) {
        return this.filehub.executeQuery("get_allocated_mb_in_filechain", { brid });
    }
    /**
     * Retrieves paid-for allocated number of megabytes in filechain.
     */
    getPaidAllocatedMbInFilechain(brid) {
        return this.filehub.executeQuery("get_allocated_mb_in_filechain", { brid });
    }
    getFileTimestamps(brid, storedAt) {
        return this.filehub.executeQuery("get_files_belonging_to_active_voucher_in_brid_after_timestamp", {
            brid,
            current_time: Date.now(),
            page_size: AbstractAdministrator.PAGE_SIZE,
            stored_at: storedAt
        });
    }
    getMigratableChunkHashesByName(brid, filetimestamp) {
        return this.filehub.executeQuery("get_all_migratable_chunks_by_file", {
            brid,
            current_time: Date.now(),
            name: filetimestamp.name,
            timestamp: filetimestamp.timestamp
        });
    }
}
exports.default = AbstractAdministrator;
AbstractAdministrator.PAGE_SIZE = 100;
