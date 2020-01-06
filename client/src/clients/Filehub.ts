import {Blockchain, nop, op, User} from "ft3-lib";
import DirectoryService from "./DirectoryService";
import {hashData} from "../utils/crypto";
import { AES, enc } from 'crypto-js';

import Filechain from "./Filechain";
import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";
import FsFile from "../models/FsFile";
import Operation from "ft3-lib/dist/lib/ft3/operation";
import {Voucher} from "..";
import {ChunkHashFilechain, ChunkHashIndex, ChunkIndex} from "../models/Chunk";
import * as fs from "fs";
import {FileStoringOptions} from "../models/FileStoringOptions";
import logger from "../logger";

export default class Filehub {

  private readonly brid: string;
  private readonly nodeApiUrl: string;
  private readonly blockchain: Promise<Blockchain>;
  private readonly chains: ChainConnectionInfo[];

  public constructor(nodeApiUrl: string, brid: string, chainConnectionInfo: ChainConnectionInfo[]) {
    this.brid = brid;
    this.nodeApiUrl = nodeApiUrl;
    this.chains = chainConnectionInfo;
    this.blockchain = Blockchain.initialize(
      Buffer.from(brid, "hex"),
      new DirectoryService(chainConnectionInfo)
    );
  }

  /**
   * Executes a operation towards the Filehub.
   *
   * @param user to sign the operation.
   * @param operation to perform.
   */
  public executeOperation(user: User, operation: Operation): Promise<void> {
    return this.blockchain.then(bc => {
      logger.debug("Executing %O", operation);
      return bc.call(operation, user);
    });
  }

  /**
   * Queries the Filehub for data.
   *
   * @param query the identifier of the query.
   * @param data to provide in the query.
   */
  public executeQuery(query: string, data: unknown) {
    return this.blockchain.then(bc => {
      logger.debug("Executing query '%s' with data: %O", query, data);
      return bc.query(query, data);
    });
  }

  /**
   * Stores a file. Contacts the filehub and allocates a chunk, and then persists the data in the correct filechain.
   *
   * @param passphrase optional options for storing the file.
   */
  public async storeFile(user: User, file: FsFile, options?: FileStoringOptions): Promise<any> {
    const fileName = options != undefined && options && options.passphrase != undefined && options.filenameEncrypted
      ? Filehub.encrypt(file.name, options.passphrase)
      : file.name;

    const bc = await this.blockchain;

    await this.executeOperation(user, op(
      "allocate_file",
      user.authDescriptor.id,
      fileName,
      file.size,
      options && options.plan ? options.plan : "CHROMIA"
    ));

    const brid = await this.getFileLocation(user, fileName);

    return await this.storeChunks(user, file, brid.toString("hex"), fileName, options);
  }

  /**
   * Store chunk in the provided BRID.
   */
  public async copyChunkDataToOtherBrid(user: User, chunkHash: ChunkHashFilechain) {
    const oldFilechain = this.initFilechainClient(chunkHash.brid);

    const newBrid: string = await this.executeQuery("get_active_filechain_for_hash_in_disabled_filechain", {
      hash: chunkHash.hash, brid: chunkHash.brid
    });

    const newFilechain = this.initFilechainClient(newBrid);

    const data = await oldFilechain.getChunkDataByHash(chunkHash.hash.toString("hex"));
    return this.persistChunkDataInFilechain(user, newFilechain, Buffer.from(data, "hex"));
  }

  private storeChunks(user: User, file: FsFile, brid: string, fileName: string, options?: FileStoringOptions) {
    const filechain: Filechain = this.initFilechainClient(brid);

    const promises: Promise<any>[] = [];
    for (let i = 0; i < file.numberOfChunks(); i++) {
      promises.push(
        file.getChunk(i).then(chunk => this.storeChunk(user, filechain, new ChunkIndex(chunk, i), fileName, options))
      );
    }

    return Promise.all(promises);
  }

  /**
   * Purchases a new voucher if possible.
   * It is only possible to buy a new voucher when there is less than a day left on your current one.
   */
  public async purchaseVoucher(user: User, plan: string): Promise<any> {
    const bc = await this.blockchain;
    return await bc.transactionBuilder()
      .add(nop())
      .add(op("create_voucher", user.authDescriptor.id, plan))
      .buildAndSign(user)
      .post();
  }

  /**
   * Get file names stored by a user.
   */
  public getUserFileNames(user: User): Promise<string[]> {
    return this.executeQuery("get_file_names", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    });
  }

  /**
   * Retrieves a file by its name.
   *
   * @param passphrase optional options for retrieving file.
   */
  public async getFileByName(user: User, name: string, options?: FileStoringOptions): Promise<FsFile> {
    const brid = await this.getFileLocation(user, name);

    const chunkHashes: ChunkHashIndex[] = await this.executeQuery("get_file_chunks", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name: name
    });

    const filechain = this.initFilechainClient(brid.toString("hex"));

    const promises: Promise<ChunkIndex>[] = [];

    for (let i = 0; i < chunkHashes.length; i++) {
      promises.push(this.getChunk(filechain, chunkHashes[i]));
    }

    const chunkIndexes = await Promise.all(promises);

    if (!options || !options.passphrase) {
      return new Promise(resolve => resolve(FsFile.fromChunks(name, chunkIndexes)));
    } else {
      return new Promise(resolve => resolve(FsFile.fromChunks(
        options.filenameEncrypted
          ? Filehub.decrypt(name, options.passphrase!)
          : name,
        chunkIndexes.map(chunk => new ChunkIndex(Buffer.from(Filehub.decrypt(chunk.data.toString("utf8"), options.passphrase!), "utf8"), chunk.idx)))));
    }
  }

  public async downloadFileByName(user: User, name: string, path?: string, options?: FileStoringOptions) {
    const brid = await this.getFileLocation(user, name);

    const chunkHashes: ChunkHashIndex[] = await this.executeQuery("get_file_chunks", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name: name
    });

    const filechain = this.initFilechainClient(brid.toString("hex"));

    const sortedArray = chunkHashes.sort((a, b) => a.idx - b.idx);
    const bufferedArray: ChunkHashIndex[][] = Filehub.bufferArray(sortedArray, 10);

    const location = path
      ? path
      : (options && options.passphrase && options.filenameEncrypted ? Filehub.decrypt(name, options.passphrase) : name);

    fs.writeFileSync(location, [], "utf8");

    for (let i = 0; i < bufferedArray.length; i++) {
      const promises: Promise<ChunkIndex>[] = [];
      const chunks = bufferedArray[i];

      for (let j = 0; j < chunks.length; j++) {
        promises.push(this.getChunk(filechain, chunks[j]));
      }

      const chunkIndexes = await Promise.all(promises);
      const deletePromises: Promise<void>[] = [];
      for (let k = 0; k < chunkIndexes.length; k++) {
        const data = chunkIndexes[k].data;

        deletePromises.push(
          new Promise<void>(resolve => resolve(fs.appendFileSync(
            location, options && options.passphrase
              ? Filehub.decrypt(data.toString(), options.passphrase)
              : data.toString())
            ))
        );
      }

      await Promise.all(deletePromises);
    }
  }

  /**
   * Retrieves all the vouchers for the specific user.
   */
  public getVouchers(user: User): Promise<Voucher[]> {
    return this.executeQuery("get_vouchers", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    });
  }

  /**
   * Checks if the user has an active voucher.
   */
  public hasActiveVoucher(user: User, plan: string): Promise<boolean> {
    return this.executeQuery("has_active_voucher_for_timestamp", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      timestamp: Date.now(),
      voucher_plan: plan
    });
  }

  /**
   * Returns how many bytes the user has allocated.
   */
  public getAllocatedBytes(user: User): Promise<number> {
    return this.executeQuery("get_allocated_bytes", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    });
  }

  private storeChunk(user: User, filechain: Filechain, chunkIndex: ChunkIndex, name: string, options?: FileStoringOptions) {
    const chunkToStore = options != undefined && options.passphrase != null
      ? Buffer.from(Filehub.encrypt(chunkIndex.data.toString("utf8"), options.passphrase), "utf8")
      : chunkIndex.data;

    return this.allocateChunk(user, chunkToStore, name, chunkIndex.idx)
      .then(() => this.persistChunkDataInFilechain(user, filechain, chunkToStore));
  }

  private persistChunkDataInFilechain(user: User, filechain: Filechain, data: Buffer) {
    return filechain.storeChunkData(user, data);
  }

  private getFileLocation(user: User, name: string): Promise<Buffer> {
    return this.executeQuery("get_file_location", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name: name
    });
  }

  private getChunk(filechain: Filechain, chunkHash: ChunkHashIndex): Promise<ChunkIndex> {
    return Filehub.getChunkDataByHash(filechain, chunkHash.hash)
      .then((data: string) => new ChunkIndex(Buffer.from(data, "hex"), chunkHash.idx));
  }

  private allocateChunk(user: User, chunk: Buffer, name: string, index: number): Promise<any> {
    const hash = hashData(chunk);

    const operation: Operation = new Operation(
      "allocate_chunk",
      user.authDescriptor.id,
      name,
      hash,
      chunk.length,
      index
    );

    return this.executeOperation(user, operation);
  };

  private initFilechainClient(brid: string): Filechain {
    logger.debug("Initializing filechain client with brid: %s", brid);
    const chain = this.chains
      .find(c => {
        const directoryChain = c.chainId.toString("hex").toLocaleUpperCase();
        logger.silly("Found in DC: %s", directoryChain);

        return directoryChain === brid.toLocaleUpperCase();
      });

    if (chain == null) {
      throw new Error("Expected filechain not found in directory service");
    }

    return new Filechain(chain.url, chain.chainId.toString("hex"));
  }

  private static encrypt(data: string, passphrase: string): string {
    return AES.encrypt(data, passphrase).toString();
  }

  private static decrypt(data: string, passphrase: string): string {
    return AES.decrypt(data, passphrase).toString(enc.Utf8);
  }

  private static getChunkDataByHash(filechain: Filechain, hash: Buffer): Promise<string> {
    return filechain.getChunkDataByHash(hash.toString("hex"));
  }

  private static bufferArray(array: any[], buffer: number): any[][] {
    const arrayOfArrays: any[][] = [];
    for (let i=0; i<array.length; i+=buffer) {
      arrayOfArrays.push(array.slice(i, i+buffer));
    }

    return arrayOfArrays;
  }

}