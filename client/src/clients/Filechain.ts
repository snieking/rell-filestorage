import * as pcl from "postchain-client";
import {User} from "ft3-lib";

export default class Filechain {

  private readonly restClient: any;
  private readonly gtxClient: any;

  public constructor(nodeApiUrl: string, brid: string) {
    this.restClient = pcl.restClient.createRestClient(nodeApiUrl, brid, 10);
    this.gtxClient = pcl.gtxClient.createClient(this.restClient, Buffer.from(brid, "hex"), []);
  }

  public storeChunkData(user: User, data: Buffer): Promise<any> {
    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("add_chunk_data", data, user.keyPair.pubKey);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation();
  };

  public removeChunkData(user: User, data: string): Promise<any> {
    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("remove_chunk_data", Buffer.from(data, "utf8"), user.keyPair.pubKey);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation();
  };

  public removeChunkDataByHash(user: User, hash: Buffer): Promise<any> {
    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("remove_chunk_data_by_hash", hash, user.keyPair.pubKey);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation();
  }

  public getFileByHash(user: User, hash: Buffer): Promise<Buffer> {
    return this.restClient.query("get_file", { hash: hash.toString("hex"), pubkey: user.keyPair.pubKey.toString("hex") });
  }

}