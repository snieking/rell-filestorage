import { User } from 'ft3-lib';
import * as pcl from 'postchain-client';
import logger from '../logger';
import { hashData } from '../utils/crypto';

export default class Filechain {
  private readonly restClient: any;
  private readonly gtxClient: any;
  private readonly brid: string;

  public constructor(nodeApiUrl: string, brid: string) {
    this.restClient = pcl.restClient.createRestClient(nodeApiUrl, brid, 10);
    this.gtxClient = pcl.gtxClient.createClient(this.restClient, Buffer.from(brid, 'hex'), []);
    this.brid = brid;
  }

  public storeChunkData(user: User, data: Buffer): Promise<any> {
    const hash = hashData(data).toString('hex');
    logger.debug('Storing data for hash: %s, in filechain: %s', hash, this.brid);

    const tx = this.gtxClient.newTransaction([user.keyPair.pubKey]);
    tx.addOperation('fs.add_chunk_data', data);
    tx.sign(user.keyPair.privKey, user.keyPair.pubKey);

    return tx.postAndWaitConfirmation().catch(() => Promise.resolve());
  }

  public chunkHashExists(hash: string): Promise<boolean> {
    return this.restClient.query('fs.chunk_hash_exists', { hash });
  }

  public getChunkDataByHash(hash: string): Promise<string> {
    logger.debug('Retrieving chunk data by hash %s from filechain: %s', hash, this.brid);
    return this.restClient.query('fs.get_chunk', { hash });
  }
}
