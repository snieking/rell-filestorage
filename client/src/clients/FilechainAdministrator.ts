import { op, User } from "ft3-lib";
import logger from "../logger";
import { IChunkHashFilechain } from "../models/Chunk";
import { IFileTimestamp } from "../models/FileTimestamp";
import AbstractAdministrator from "./AbstractAdministrator";
import Filehub from "./Filehub";

export default class FilechainAdministrator extends AbstractAdministrator {
  private static FIRST_TIMESTAMP = Date.UTC(2019, 1);

  public constructor(filehub: Filehub) {
    super(filehub);
  }

  /**
   * Sends an application for a Filechain to join the pool of COMMUNITY Filechains.
   */
  public sendCommunityFilechainApplication(user: User, brid: string, nodeUrl: string, sourceCodeUrl: string) {
    return this.filehub.executeOperation(
      user,
      op("add_filechain_application", user.authDescriptor.id, brid, nodeUrl, sourceCodeUrl)
    );
  }

  /**
   * Requests payment for data stored in your Filechains.
   * Data is only able to be paid out after it has been persisted for 30 days or more.
   */
  public requestPayment(user: User) {
    return this.filehub.executeOperation(user, op("request_payment", user.authDescriptor.id));
  }

  /**
   * Migrates data stored in the Filechain to another one.
   */
  public async migrateFilechain(user: User, fromBrid: string) {
    let timestamp: number = FilechainAdministrator.FIRST_TIMESTAMP;

    logger.info("Starting migration from filechain: %s", fromBrid);
    for (;;) {
      const fileTimestamps: IFileTimestamp[] = await this.getFileTimestamps(
        fromBrid,
        FilechainAdministrator.FIRST_TIMESTAMP
      );

      for (const fileTimestamp of fileTimestamps) {
        await this.filehub.executeOperation(
          user,
          op("migrate_file", user.authDescriptor.id, fileTimestamp.name, fileTimestamp.timestamp, fromBrid)
        );
        const chunkHashes: IChunkHashFilechain[] = await this.getMigratableChunkHashesByName(fromBrid, fileTimestamp);

        for (const chunkHash of chunkHashes) {
          await this.filehub.copyChunkDataToOtherBrid(user, chunkHash);
        }

        await this.filehub.executeOperation(
          user,
          op("mark_file_migrated", user.authDescriptor.id, fileTimestamp.name, fileTimestamp.timestamp, fromBrid)
        );
      }

      if (fileTimestamps.length < AbstractAdministrator.PAGE_SIZE) {
        break;
      } else {
        timestamp = fileTimestamps[fileTimestamps.length - 1].timestamp;
      }
    }
  }

  /**
   * Disables a Filechain.
   */
  public disableFilechain(user: User, brid: string): Promise<any> {
    return this.filehub.executeOperation(user, op("disable_filechain", user.authDescriptor.id, brid));
  }
}
