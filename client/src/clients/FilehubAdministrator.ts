import Filehub from "./Filehub";
import {op, User} from "ft3-lib";
import {FileTimestamp} from "../models/FileTimestamp";
import {ChunkHashFilechain} from "../models/Chunk";
import logger from "../logger";
import AbstractAdministrator from "./AbstractAdministrator";
import {FilechainApplication} from "../models/FilechainApplication";

export default class FilehubAdministrator extends AbstractAdministrator {

  private static FIRST_TIMESTAMP = Date.UTC(2019, 1);

  public constructor(filehub: Filehub) {
    super(filehub);
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
    return this.filehub.executeOperation(user, op("add_chromia_filechain", user.authDescriptor.id, rid));
  };

  public listFilechainApplications(): Promise<FilechainApplication[]> {
    return this.filehub.executeQuery("list_filechain_applications", {});
  }

  public approveCommonFilechainApplication(user: User, brid: string) {
    return this.filehub.executeOperation(user, op("approve_filechain_application", user.authDescriptor.id, brid));
  }

  public rejectCommonFilechainApplication(user: User, brid: string) {
    return this.filehub.executeOperation(user, op("reject_filechain_application", user.authDescriptor.id, brid));
  }

  public async migrateFilechain(user: User, fromBrid: string, toBrid: string) {
    let timestamp: number = FilehubAdministrator.FIRST_TIMESTAMP;

    logger.info("Starting migration to filechain: %s", toBrid);
    for (;;) {
      const fileTimestamps: FileTimestamp[] = await this.getFileTimestamps(fromBrid, FilehubAdministrator.FIRST_TIMESTAMP);

      for (const fileTimestamp of fileTimestamps) {
        await this.filehub.executeOperation(user, op(
          "migrate_file",
          user.authDescriptor.id,
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
            user.authDescriptor.id,
            fileTimestamp.name,
            fileTimestamp.timestamp,
            fromBrid
          ));
      }

      if (fileTimestamps.length < AbstractAdministrator.PAGE_SIZE) {
        break;
      } else {
        timestamp = fileTimestamps[fileTimestamps.length - 1].timestamp;
      }

    }
  }
}