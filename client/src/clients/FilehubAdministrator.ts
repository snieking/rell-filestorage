import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";
import Filehub from "./Filehub";
import {op, User} from "ft3-lib";
import {FileTimestamp} from "../models/FileTimestamp";
import {ChunkHashFilechain} from "../models/Chunk";
import logger from "../utils/logger";

export default class FilehubAdministrator {

  private static FIRST_TIMESTAMP = Date.UTC(2019, 1);
  private static PAGE_SIZE = 100;

  private filehub: Filehub;

  public constructor(nodeApiUrl: string, brid: string, chainConnectionInfo: ChainConnectionInfo[]) {
    this.filehub = new Filehub(nodeApiUrl, brid, chainConnectionInfo);
  }

  /**
   * Registers the admin user, this operation is only valid when there are no other admins.
   */
  public registerAdmin(user: User): Promise<void> {
    return this.filehub.executeOperation(user, op("register_admin", user.authDescriptor.id));
  };

  /**
   * Registers a filechain to persist files in.
   *
   * @param user that is an admin of the filehub.
   * @param rid of the filechain.
   */
  public registerFilechain(user: User, rid: string): Promise<any> {
    return this.filehub.executeOperation(user, op("add_filechain", user.authDescriptor.id, rid));
  };

  public disableFilechain(user: User, brid: string): Promise<any> {
    return this.filehub.executeOperation(user, op("disable_filechain", user.authDescriptor.id, brid));
  }

  public async migrateFilechain(user: User, fromBrid: string, toBrid: string) {
    logger.info("Registering new filechain", toBrid);
    await this.registerFilechain(user, toBrid);
    logger.info("Disabling old filechain", user, fromBrid);
    await this.disableFilechain(user, fromBrid);

    let timestamp: number = FilehubAdministrator.FIRST_TIMESTAMP;

    logger.info("Starting migration to filechain: ", toBrid);
    for (;;) {
      const fileTimestamps: FileTimestamp[] = await this.getFileTimestamps(fromBrid, FilehubAdministrator.FIRST_TIMESTAMP);

      for (const fileTimestamp of fileTimestamps) {
        await this.filehub.executeOperation(user, op(
          "migrate_file",
          user.authDescriptor.hash().toString("hex"),
          fileTimestamp.name,
          fileTimestamp.timestamp,
          fromBrid
        ));
        const chunkHashes: ChunkHashFilechain[] = await this.getMigratableChunkHashesByName(fromBrid, fileTimestamp);

        for (const chunkHash of chunkHashes) {
          await this.filehub.copyChunkDataToOtherBrid(user, chunkHash, toBrid);
        }

        await this.filehub.executeOperation(
          user,
          op("mark_file_migrated",
            user.authDescriptor.hash().toString("hex"),
            fileTimestamp.name,
            fileTimestamp.timestamp,
            fromBrid
          ));
      }

      if (fileTimestamps.length < FilehubAdministrator.PAGE_SIZE) {
        break;
      } else {
        timestamp = fileTimestamps[fileTimestamps.length - 1].timestamp;
      }

    }
  }

  private getFileTimestamps(brid: string, storedAt: number): Promise<FileTimestamp[]> {
    return this.filehub.executeQuery("get_files_belonging_to_active_voucher_in_brid_after_timestamp", {
      brid: brid,
      stored_at: storedAt,
      current_time: Date.now(),
      page_size: FilehubAdministrator.PAGE_SIZE
    });
  }

  private getMigratableChunkHashesByName(brid: string, filetimestamp: FileTimestamp): Promise<ChunkHashFilechain[]> {
    return this.filehub.executeQuery("get_all_migratable_chunks_by_file", {
      brid: brid,
      name: filetimestamp.name,
      timestamp: filetimestamp.timestamp,
      current_time: Date.now()
    });
  }
}