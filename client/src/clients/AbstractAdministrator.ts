import Filehub from "./Filehub";
import {IFileTimestamp} from "../models/FileTimestamp";
import {IChunkHashFilechain} from "../models/Chunk";

export default class AbstractAdministrator {

  protected static PAGE_SIZE = 100;

  protected readonly filehub: Filehub;

  protected constructor(filehub: Filehub) {
    this.filehub = filehub;
  }

  /**
   * Retrieves allocated number of megabytes in filechain.
   */
  public getAllocatedMbInFilechain(brid: string): Promise<number> {
    return this.filehub.executeQuery("get_allocated_mb_in_filechain", { brid: brid });
  }

  /**
   * Retrieves paid-for allocated number of megabytes in filechain.
   */
  public getPaidAllocatedMbInFilechain(brid: string): Promise<number> {
    return this.filehub.executeQuery("get_allocated_mb_in_filechain", { brid: brid });
  }

  protected getFileTimestamps(brid: string, storedAt: number): Promise<IFileTimestamp[]> {
    return this.filehub.executeQuery("get_files_belonging_to_active_voucher_in_brid_after_timestamp", {
      brid: brid,
      stored_at: storedAt,
      current_time: Date.now(),
      page_size: AbstractAdministrator.PAGE_SIZE
    });
  }

  protected getMigratableChunkHashesByName(brid: string, filetimestamp: IFileTimestamp): Promise<IChunkHashFilechain[]> {
    return this.filehub.executeQuery("get_all_migratable_chunks_by_file", {
      brid: brid,
      name: filetimestamp.name,
      timestamp: filetimestamp.timestamp,
      current_time: Date.now()
    });
  }

}