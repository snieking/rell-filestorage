import { Blockchain, nop, op, Operation, Postchain, User } from 'ft3-lib';
import { hashData } from '../utils/crypto';

import logger from '../logger';
import { ChunkIndex, IChunkHashIndex } from '../models/Chunk';
import { IChunkLocation } from '../models/FilechainLocation';
import { FsFile } from '../models/FsFile';
import Filechain from './Filechain';
import TransactionBuilder from 'ft3-lib/dist/ft3/core/transaction-builder';

export class Filehub {
  private static getChunkDataByHash(filechain: Filechain, hash: Buffer): Promise<string> {
    return filechain.getChunkDataByHash(hash.toString('hex'));
  }

  private readonly blockchain: Promise<Blockchain>;

  public constructor(nodeUrl: string, brid: string) {
    this.blockchain = new Postchain(nodeUrl).blockchain(brid);
  }

  /**
   * Stores a file. Contacts the Filehub and allocates a chunk, and then persists the data in the correct filechain.
   */
  public async storeFile(user: User, file: FsFile): Promise<any> {
    await this.executeOperation(user, op('fs.allocate_file', user.authDescriptor.id, file.hash, file.size));
    return this.storeChunks(user, file);
  }

  /**
   * Retrieves a file by its hash.
   *
   * @param passphrase optional options for retrieving file.
   */
  public async getFile(hash: Buffer): Promise<FsFile> {
    try {
      const filechainLocations = await this.getChunkLocations(hash);

      const promises: Array<Promise<ChunkIndex>> = [];
      for (const chunkLocation of filechainLocations) {
        logger.debug('Getting chunk %s from filechain: %s', chunkLocation.hash.toString('hex'), chunkLocation.location);
        const filechain: Filechain = this.initFilechainClient(
          chunkLocation.location,
          chunkLocation.brid.toString('hex')
        );

        promises.push(this.getChunk(filechain, chunkLocation));
      }

      const chunkIndexes = await Promise.all(promises);
      return new Promise((resolve) => resolve(FsFile.fromChunks(chunkIndexes)));
    } catch (error) {
      logger.info('Error retrieving file: %O', error);
      const reject: Promise<FsFile> = Promise.reject(error);
      return reject;
    }
  }

  transactionBuilder(): Promise<TransactionBuilder> {
    return this.blockchain.then((bc) => bc.transactionBuilder());
  }

  initFilechainClient(url: string, brid: string): Filechain {
    return new Filechain(url, brid);
  }

  private async storeChunks(user: User, file: FsFile) {
    const allocationPromises: Array<Promise<any>> = [];
    logger.debug('Storing nr of chunks: %d', file.numberOfChunks());
    for (let i = 0; i < file.numberOfChunks(); i++) {
      allocationPromises.push(this.allocateChunk(user, file.getChunk(i), file.hash, i));
    }

    await Promise.all(allocationPromises);

    const filechainLocations = await this.getChunkLocations(file.hash);

    const persistancePromises: Array<Promise<any>> = [];
    for (const chunkLocation of filechainLocations) {
      logger.debug('Storing chunk %s in filechain: %s', chunkLocation.hash.toString('hex'), chunkLocation.location);
      const filechain: Filechain = this.initFilechainClient(chunkLocation.location, chunkLocation.brid.toString('hex'));

      persistancePromises.push(this.persistChunkDataInFilechain(user, filechain, file.getChunk(chunkLocation.idx)));
    }

    await Promise.all(persistancePromises);
  }

  private persistChunkDataInFilechain(user: User, filechain: Filechain, data: Buffer) {
    return filechain.storeChunkData(user, data);
  }

  private getChunkLocations(hash: Buffer): Promise<IChunkLocation[]> {
    return this.executeQuery('fs.get_chunk_locations', { file_hash: hash.toString('hex') }).then(
      (locations: IChunkLocation[]) => {
        logger.debug('Got number of chunks: %d', locations.length);
        if (locations.length < 1) {
          throw new Error('Did not receive enough active & online Filechains');
        }
        return locations;
      }
    );
  }

  private getChunk(filechain: Filechain, chunkHash: IChunkHashIndex): Promise<ChunkIndex> {
    return Filehub.getChunkDataByHash(filechain, chunkHash.hash).then(
      (data: string) => new ChunkIndex(Buffer.from(data, 'hex'), chunkHash.idx)
    );
  }

  private allocateChunk(user: User, chunk: Buffer, fileHash: Buffer, index: number): Promise<any> {
    const hash = hashData(chunk);

    const operation: Operation = new Operation(
      'fs.allocate_chunk',
      user.authDescriptor.id,
      fileHash,
      hash,
      chunk.length,
      index
    );

    return this.executeOperation(user, operation).catch(() => Promise.resolve());
  }

  /**
   * Executes a operation towards the Filehub.
   *
   * @param user to sign the operation.
   * @param operation to perform.
   */
  private executeOperation(user: User, operation: Operation, addNop?: boolean): Promise<void> {
    return this.blockchain.then((bc) => {
      const trxBuilder = bc.transactionBuilder().add(operation);

      if (addNop) {
        trxBuilder.add(nop());
      }

      logger.debug('Executing %O', operation);
      return trxBuilder.buildAndSign(user).post();
    });
  }

  /**
   * Queries the Filehub for data.
   *
   * @param query the identifier of the query.
   * @param data to provide in the query.
   */
  private executeQuery(query: string, data: unknown) {
    return this.blockchain.then((bc) => {
      logger.debug("Executing query '%s' with data: %O", query, data);
      return bc.query(query, data);
    });
  }
}
