import * as pcl from "postchain-client";
import {User} from "ft3-lib";
import {hashData} from "../utils/crypto";
import logger from "../utils/logger";

export default class Filechain {

  private readonly restClient: any;
  private readonly gtxClient: any;

  public constructor(nodeApiUrl: string, brid: string) {
    this.restClient = pcl.restClient.createRestClient(nodeApiUrl, brid, 10);
    this.gtxClient = pcl.gtxClient.createClient(this.restClient, Buffer.from(brid, "hex"), []);
  }

  public storeChunkData(user: User, data: Buffer): Promise<any> {
    const hash = hashData(data).toString("hex");
    logger.debug(`Hash of what we are about to store: ${hash}`);

    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("add_chunk_data", data);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation().catch((error: Error) => {
      return this.restClient.query("file_hash_exists", { hash: hash })
        .then((exists: boolean) => {
          if (!exists) {
            if (error.message.includes("500")) {
              logger.info(`Unable to store chunk data for hash: ${hash}, it may be due to a transaction is already pending with the exact same data which means no more action is required. ${error}`);
            } else {
              throw error;
            }
          } else {
            logger.info(`Chunk already existed for hash: ${hash}`);
          }
        });
    });
  };

  public removeChunkData(user: User, data: string): Promise<any> {
    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("remove_chunk_data", Buffer.from(data, "utf8"));
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation();
  };

  public removeChunkDataByHash(user: User, hash: Buffer): Promise<any> {
    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("remove_chunk_data_by_hash", hash);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation();
  }

  public getChunkDataByHash(hash: Buffer): Promise<string> {
    return this.restClient.query("get_file", { hash: hash.toString("hex") });
  }

}