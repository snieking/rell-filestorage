import { User } from "ft3-lib";
import * as pcl from "postchain-client";
import logger from "../logger";
import { hashData } from "../utils/crypto";

export default class Filechain {
  private readonly restClient: any;
  private readonly gtxClient: any;
  private readonly brid: string;

  public constructor(nodeApiUrl: string, brid: string) {
    this.restClient = pcl.restClient.createRestClient(nodeApiUrl, brid, 10);
    this.gtxClient = pcl.gtxClient.createClient(this.restClient, Buffer.from(brid, "hex"), []);
    this.brid = brid;
  }

  public storeChunkData(user: User, data: Buffer): Promise<any> {
    const hash = hashData(data).toString("hex");
    logger.debug("Storing data for hash: %s, in filechain: %s", hash, this.brid);

    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("add_chunk_data", data);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation().catch((error: Error) => {
      return this.chunkHashExists(hash).then((exists: boolean) => {
        if (!exists) {
          if (error.message.includes("500")) {
            logger.info(
              "Unable to store chunk data for hash: %s, it may be due to a transaction is already pending with the exact same data which means no more action is required. %O",
              hash,
              error
            );
          } else {
            throw error;
          }
        } else {
          logger.debug("Chunk already existed for hash: %s", hash);
        }
      });
    });
  }

  public chunkHashExists(hash: string): Promise<boolean> {
    return this.restClient.query("chunk_hash_exists", { hash });
  }

  public getChunkDataByHash(hash: string): Promise<string> {
    logger.debug("Retrieving chunk data by hash %s from filechain: %s", hash, this.brid);
    return this.restClient.query("get_chunk", { hash });
  }
}
