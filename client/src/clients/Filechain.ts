import { User } from 'ft3-lib';
import * as pcl from 'postchain-client';

export default class Filechain {
  private readonly restClient: any;
  private readonly gtxClient: any;

  constructor(nodeApiUrl: string, brid: string) {
    this.restClient = pcl.restClient.createRestClient(nodeApiUrl, brid, 10);
    this.gtxClient = pcl.gtxClient.createClient(this.restClient, Buffer.from(brid, 'hex'), []);
  }

  storeChunkData(user: User, data: Buffer): Promise<any> {
    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation('fs.add_chunk_data', data);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);

    try {
      return tx.postAndWaitConfirmation().catch(() => Promise.resolve());
    } catch {
      // TODO: Check error message. If it's not a duplicate chunk, throw error.
      // Error message is today not returned by the client.
      return Promise.resolve();
    }
  }

  chunkHashExists(hash: string): Promise<boolean> {
    return this.restClient.query('fs.chunk_hash_exists', { hash });
  }

  getChunkDataByHash(hash: string): Promise<string> {
    return this.restClient.query('fs.get_chunk', { hash });
  }
}
