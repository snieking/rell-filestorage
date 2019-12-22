import * as pcl from "postchain-client";
import {User} from "ft3-lib";
import {hashData} from "../utils/crypto";

export default class Filechain {

  private readonly restClient: any;
  private readonly gtxClient: any;

  public constructor(nodeApiUrl: string, brid: string) {
    this.restClient = pcl.restClient.createRestClient(nodeApiUrl, brid, 10);
    this.gtxClient = pcl.gtxClient.createClient(this.restClient, Buffer.from(brid, "hex"), []);
  }

  public storeChunkData(user: User, data: Buffer): Promise<any> {
    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("add_chunk_data", data);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation().catch((error: Error) => {
      return this.restClient.query("file_hash_exists", { hash: hashData(data).toString("hex") })
        .then((exists: boolean) => {
          if (!exists) {
            throw error;
          } else {
            console.log("Chunk already existed");
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

  public getFileByHash(user: User, hash: Buffer): Promise<string> {
    return this.restClient.query("get_file", { hash: hash.toString("hex") });
  }

}