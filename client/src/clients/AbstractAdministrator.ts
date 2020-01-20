import {IChunkHashFilechain} from "../models/Chunk";
import {IFileTimestamp} from "../models/FileTimestamp";
import Filehub from "./Filehub";

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
    return this.filehub.executeQuery("get_allocated_mb_in_filechain", { brid });
  }

  /**
   * Retrieves paid-for allocated number of megabytes in filechain.
   */
  public getPaidAllocatedMbInFilechain(brid: string): Promise<number> {
    return this.filehub.executeQuery("get_allocated_mb_in_filechain", { brid });
  }

  protected getFileTimestamps(brid: string, storedAt: number): Promise<IFileTimestamp[]> {
    return this.filehub.executeQuery("get_files_belonging_to_active_voucher_in_brid_after_timestamp", {
      brid,
      current_time: Date.now(),
      page_size: AbstractAdministrator.PAGE_SIZE,
      stored_at: storedAt
    });
  }

  protected getMigratableChunkHashesByName(brid: string, filetimestamp: IFileTimestamp): Promise<IChunkHashFilechain[]> {
    return this.filehub.executeQuery("get_all_migratable_chunks_by_file", {
      brid,
      current_time: Date.now(),
      name: filetimestamp.name,
      timestamp: filetimestamp.timestamp
    });
  }

}