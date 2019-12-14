import * as pcl from "postchain-client";
import {User} from "ft3-lib";

export default class Filechain {

  private readonly brid: string;
  private readonly nodeApiUrl: string;
  private readonly restClient: any;
  private readonly gtx: any;

  public constructor(nodeApiUrl: string, brid: string) {
    this.brid = brid;
    this.nodeApiUrl = nodeApiUrl;
    this.restClient = pcl.restClient.createRestClient(nodeApiUrl, brid, 10);
    this.gtx = pcl.gtxClient.createClient(this.restClient, Buffer.from(brid, "hex"), []);
  }

  public storeChunkData = (user: User, data: string): Promise<any> => {
    const tx = this.gtx.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("add_chunk_data", Buffer.from(data, "utf8"));
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation();
  };

  public removeChunkData = (user: User, data: string): Promise<any> => {
    const tx = this.gtx.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("remove_chunk_data", Buffer.from(data, "utf8"));
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation();
  };

  public removeChunkDataByHash = (user: User, hash: Buffer): Promise<any> => {
    const tx = this.gtx.newTransaction([user.keyPair.pubKey]);
    tx.addOperation("remove_chunk_data_by_hash", hash);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
    return tx.postAndWaitConfirmation();
  }

}